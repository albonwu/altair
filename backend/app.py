from flask import Flask

import subprocess
import os
from pathlib import Path

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://waning:TWm1cHIcMeOSKrMn@test.6qrwr.mongodb.net/?retryWrites=true&w=majority&appName=test"

app = Flask(__name__)
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


def traverse_to_tree(path):
    os.chdir(path)
    tree = {}
    for parent, dirs, files in os.walk("."):
        if any(dir == ".git" for dir in parent.split("/")):
            continue
        print(f"{parent, dirs, files = }")
        tree[parent] = {"name": parent, "type": "dir", "children": []}
        for dir in dirs:
            tree[parent]["children"].append({"name": dir, "type": "dir"})
        for file in files:
            tree[parent]["children"].append({"name": file, "type": "file"})

    return tree


def analyze_repo(username: str, repo: str):
    print(f"{username = }")
    print(f"{repo = }")

    env = {}

    for parent, dirs, files in os.walk(".", topdown=False):
        if any(dir == ".git" for dir in parent.split("/")):
            continue
        print(f"{parent, dirs, files = }")
        env[parent] = {"children": []}
        for file in files:
            env[parent]["children"].append(file)
            full_path = parent + "/" + file
            env[full_path] = {"file": True}

    print(f"{env = }")


@app.route("/<username>/<repo>")
def repo(username: str, repo: str):
    if not os.access("files", os.W_OK):
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

    # todo: analyze repo and upload to db
    # analyze_repo(username, repo)
    return traverse_to_tree(".")

    # return f"<h1>{username}</h1><h2>{repo}</h2>"
