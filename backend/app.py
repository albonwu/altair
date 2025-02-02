from flask import Flask, jsonify, request
import re
from flask_cors import CORS

import subprocess
import os
from pathlib import Path

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from llm.queries import (
    chat_init,
    query_overview,
    query_roadmap,
    query_fd,
)

from analysis import (
    add_hotness,
    analyze_with_github,
    count_dir_commits,
    count_dir_lines,
    count_file_lines,
    count_file_commits,
)

uri = "mongodb+srv://albonwu:albonwu@spartahack.ntkru.mongodb.net/?retryWrites=true&w=majority&appName=spartahack"

app = Flask(__name__)
CORS(app)
STARTING_DIR = os.getcwd()

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))


@app.route("/")
def hello_world():
    # Send a ping to confirm a successful connection
    try:
        client.admin.command("ping")
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)
    return "<p>Hello, World!</p>"


def get_file_code(owner, repo, file_path):
    os.chdir(f"{STARTING_DIR}/files/{owner}/{repo}")
    return open(file_path).read()


def traverse_to_tree(path):
    os.chdir(path)
    tree = {}
    for parent, dirs, files in os.walk("."):
        if any(dir == ".git" for dir in parent.split("/")):
            continue
        print(f"{parent, dirs, files = }")
        tree[parent] = {"name": parent, "type": "dir", "children": []}
        for dir in dirs:
            if dir == ".git":
                continue

            tree[parent]["children"].append({"name": dir, "type": "dir"})
        for file in files:
            tree[parent]["children"].append({"name": file, "type": "file"})

    return tree


def analyze_repo(username: str, repo: str):
    print(f"{username = }")
    print(f"{repo = }")
    db = client[username]
    collection = db[repo]

    env = {}

    for parent, dirs, files in os.walk(".", topdown=False):
        if any(dir == ".git" for dir in parent.split("/")):
            continue

        print(f"{parent, dirs, files = }")
        env[parent] = {"_id": parent, "loc": 0, "commits": 0}

        for file in files:
            full_name = parent + "/" + file

            env[full_name] = {"_id": full_name}
            env[full_name]["loc"] = count_file_lines(full_name)
            env[full_name]["commits"] = count_file_commits(full_name)

        for dir in dirs:
            full_name = parent + "/" + dir
            if full_name not in env:
                continue

            env[full_name]["loc"] = count_dir_lines(full_name, env)
            env[full_name]["commits"] = count_dir_commits(full_name, env)

    analyze_with_github(username, repo, env)
    add_hotness(env)

    collection.insert_many(env.values())
    return env


def list_immediate_children(username, repo, directory):
    os.chdir(f"{STARTING_DIR}/files/{username}/{repo}")
    try:
        children = [
            item
            + ("/" if os.path.isdir(os.path.join(directory, item)) else "")
            for item in os.listdir(directory)
        ]
        return children
    except FileNotFoundError:
        return f"Error: Directory '{directory}' not found."
    except Exception as e:
        return f"Error: {e}"


@app.route(
    "/hottest/<username>/<repo>/", methods=["GET"], defaults={"file_path": ""}
)
@app.route("/hottest/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_hottest(username, repo, file_path):
    db = client[username]
    collection = db[repo]
    file_path = "./" + file_path

    results = collection.find({"_id": {"$regex": f"^{re.escape(file_path)}"}})
    return sorted(
        list(results), key=lambda file: file["hotness"], reverse=True
    )


@app.route("/metadata/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_file_information(username, repo, file_path):
    db = client[username]
    collection = db[repo]
    file_path = "./" + file_path

    file_doc = collection.find_one({"_id": file_path})
    if file_doc:
        try:
            file_doc["code"] = get_file_code(username, repo, file_path)
        except Exception:
            pass

        del file_doc["_id"]
        return jsonify(file_doc)
    return jsonify({"error": "File not found"}), 404


@app.route("/code/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_code(username, repo, file_path):
    if os.path.isdir(file_path):
        return {}
    return jsonify(get_file_code(username, repo, file_path))


@app.route("/children/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_children(username, repo, file_path):
    return jsonify(list_immediate_children(username, repo, file_path))


@app.route("/repo/<username>/<repo>")
def repo(username: str, repo: str):
    if not os.access(f"{STARTING_DIR}/files", os.W_OK):
        os.mkdir(f"{STARTING_DIR}/files")
    os.chdir(f"{STARTING_DIR}/files")

    # make username folder if not exists, cd into it
    if not os.access(username, os.W_OK):
        os.mkdir(username)
    os.chdir(username)

    # clone repo or update it, cd into repo
    if not os.access(repo, os.W_OK):
        subprocess.run(
            f"git clone git@github.com:{username}/{repo}",
            shell=True,
            check=True,
        )
    else:
        print("dont need to clone")
        # check if the repo is up to date (git pull if necessary)
        # if already up to date return early
    os.chdir(repo)
    if "reload" in request.args:
        database = client[username]
        collection = database[repo]
        collection.drop()

        analyze_repo(username, repo)

    # todo: analyze repo and upload to db
    return traverse_to_tree(".")


# ------------------ llm backend ------------------------
llm_collection = client["spartahack"]["llm"]

functions = {
    "init": chat_init,
    "overview": query_overview,
    "roadmap": query_roadmap,
    "fd": query_fd,
}


@app.route("/init/<username>/<repo>", methods=["POST"])
def init_repo_data(username, repo):
    repo_url = f"https://github.com/{username}/{repo}"
    function = "init"
    # Run the function
    functions[function](repo_url)
    return jsonify({"message": "Initialized chat"})


@app.route(
    "/query/<username>/<repo>/<function>",
    defaults={"input_data": None},
    methods=["GET"],
)
@app.route(
    "/query/<username>/<repo>/<function>/<path:input_data>", methods=["GET"]
)
def query_db(username, repo, function, input_data):
    """Check if data exists in MongoDB for specific parameters."""
    query = {
        "username": username,
        "repo": repo,
        "function": function,
        "input": input_data,
    }
    data = llm_collection.find_one(query, {"_id": 0})  # Find matching entry
    if data:
        return jsonify({"source": "mongodb", "data": data})
    return jsonify({"message": "No data found in MongoDB"})


@app.route(
    "/run/<username>/<repo>/<function>",
    defaults={"input_data": None},
    methods=["POST"],
)
@app.route(
    "/run/<username>/<repo>/<function>/<path:input_data>", methods=["POST"]
)
def run_script(username, repo, function, input_data):
    """Run a function and store the output in MongoDB if it doesn’t exist."""
    if function not in functions:
        return jsonify({"error": "Invalid function name"}), 400

    # Check if data already exists
    query = {
        "username": username,
        "repo": repo,
        "function": function,
        "input": input_data,
    }
    existing_data = llm_collection.find_one(query, {"_id": 0})
    if existing_data:
        return jsonify({"source": "mongodb", "data": existing_data})

    # Run the function
    output = functions[function](input_data)
    output_doc = {**query, "output": output}
    llm_collection.insert_one(output_doc)

    return jsonify({"source": "script", "data": output})
