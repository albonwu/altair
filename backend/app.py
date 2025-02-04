from flask import Flask, jsonify
import re
from flask_cors import CORS

import os
from pathlib import Path

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from dotenv import load_dotenv

from queries import (
    chat_init,
    query_overview,
    query_roadmap,
    query_fd,
    query_dependencies,
    query_brief,
    try_init,
)

from analysis import (
    add_hotness,
    analyze_with_github,
    count_dir_commits,
    count_dir_lines,
    count_file_lines,
    count_file_commits,
)

from utils import clone_and_cd_to_repo, encode_path


app = Flask(__name__)
CORS(app)
STARTING_DIR = os.getcwd()

load_dotenv()

# Create a new client and connect to the server
client = MongoClient(os.getenv("MONGODB_URL"), server_api=ServerApi("1"))


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


def traverse_to_tree(path: Path):
    os.chdir(path)
    tree = {}
    for parent, dirs, files in os.walk("."):
        parent = Path(parent)
        if ".git" in parent.parts:
            continue

        tree[encode_path(parent)] = {
            "name": encode_path(parent),
            "type": "dir",
            "children": [],
        }
        for dir in dirs:
            if dir == ".git":
                continue

            tree[encode_path(parent)]["children"].append(
                {"name": dir, "type": "dir"}
            )
        for file in files:
            if file == "repomix-output.txt":
                continue

            tree[encode_path(parent)]["children"].append(
                {"name": file, "type": "file"}
            )

    print(f"{tree = }")

    return tree


def analyze_repo(username: str, repo: str):
    print(f"{username = }")
    print(f"{repo = }")
    db = client[username]
    collection = db[repo]

    env = {}

    for parent, dirs, files in os.walk(".", topdown=False):
        parent = Path(parent)
        if ".git" in parent.parts:
            continue

        print(f"{parent, dirs, files = }")
        env[parent] = {"_id": encode_path(parent), "loc": 0, "commits": 0}

        for file in files:
            full_path: Path = parent / file

            env[full_path] = {"_id": encode_path(full_path)}
            env[full_path]["loc"] = count_file_lines(full_path)
            env[full_path]["commits"] = count_file_commits(full_path)

        for dir in dirs:
            if dir == ".git":
                continue
            full_path: Path = parent / dir
            if full_path not in env:
                continue

            env[full_path]["loc"] = count_dir_lines(full_path, env)
            env[full_path]["commits"] = count_dir_commits(full_path, env)

    env[Path()]["loc"] = count_dir_lines(Path(), env)
    env[Path()]["commits"] = count_dir_commits(Path(), env)

    analyze_with_github(username, repo, env)
    add_hotness(env)

    print(f"{env = }")
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

    results = collection.find(
        {"_id": {"$regex": f"^{re.escape(file_path)}.+"}}
    )
    return sorted(
        list(results), key=lambda file: file["hotness"], reverse=True
    )


@app.route("/metadata/<username>/<repo>/", methods=["GET"])
def get_repo_information(username, repo):
    db = client[username]
    collection = db[repo]
    return collection.find_one({"_id": "."})


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
    clone_and_cd_to_repo(STARTING_DIR, username, repo)

    file_tree = traverse_to_tree(Path())
    # init_repo_data(username, repo)
    return file_tree


# ------------------ llm backend ------------------------
llm_collection = client["spartahack"]["llm"]

functions = {
    "init": chat_init,
    "overview": query_overview,
    "roadmap": query_roadmap,
    "fd": query_fd,
    "dependencies": query_dependencies,
    "brief": query_brief,
}


@app.route("/init/<username>/<repo>", methods=["POST"])
def init_repo_data(username, repo):
    if clone_and_cd_to_repo(STARTING_DIR, username, repo):
        # clean out potentially stale data
        database = client[username]
        collection = database[repo]
        collection.drop()

        analyze_repo(username, repo)

    chat_init(STARTING_DIR, username, repo)
    return jsonify({"message": "Initialized chat"})


# old caching system for ai queries that we removed so demoing would be more real-time
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
    "/run/<username>/<repo>/<function>/",
    defaults={"input_data": ""},
    methods=["GET", "POST"],
)
@app.route(
    "/run/<username>/<repo>/<function>/<path:input_data>",
    methods=["GET", "POST"],
)
def run_script(username, repo, function, input_data):
    """Run a function and store the output in MongoDB if it doesn't exist."""
    if function not in functions:
        return jsonify({"error": "Invalid function name"}), 400

    # Check if data already exists
    query = {
        "username": username,
        "repo": repo,
        "function": function,
        "input": input_data,
    }
    # existing_data = llm_collection.find_one(query, {"_id": 0})
    # if existing_data:
    #     return jsonify({"source": "mongodb", "data": existing_data})

    # Run the function
    try_init(STARTING_DIR, username, repo)
    output = functions[function](input_data)

    return jsonify({"source": "script", "data": output})
