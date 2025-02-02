from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

import subprocess
import os
from pathlib import Path

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from analysis import (
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
db = client["spartahack"]
collection = db["files"]


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
    try:
        return open(file_path).read()
    except Exception:
        return "Unsupported format!"


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
        # collection.insert_one(env[parent])

    print(f"{env = }")
    return env


@app.route("/metadata/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_file_information(username, repo, file_path):
    db = client[username]
    collection = db[repo]
    file_path = "./" + file_path

    file_doc = collection.find_one({"_id": file_path})
    if file_doc:
        file_doc["code"] = get_file_code(username, repo, file_path)

        del file_doc["_id"]
        return jsonify(file_doc)
    return jsonify({"error": "File not found"}), 404


@app.route("/code/<username>/<repo>/<path:file_path>", methods=["GET"])
def get_code(username, repo, file_path):
    return jsonify(get_file_code(username, repo, file_path))


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
#            f"git clone git@github.com:{username}/{repo}",
            f"git clone https://github.com/{username}/{repo}.git",
            shell=True,
            check=True,
        )
    else:
        print("dont need to clone")
        # check if the repo is up to date (git pull if necessary)
        # if already up to date return early
    os.chdir(repo)

    # todo: analyze repo and upload to db
    # return analyze_repo(username, repo)
    return traverse_to_tree(".")
