from flask import Flask

import subprocess
import os

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


def analyze_repo(username: str, repo: str):
    print(f"{username = }")
    print(f"{repo = }")

    for file in os.listdir("."):
        pass


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
    analyze_repo()

    return f"<h1>{username}</h1><h2>{repo}</h2>"
