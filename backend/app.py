from flask import Flask

import subprocess
import os

app = Flask(__name__)
STARTING_DIR = os.getcwd()


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


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

    return f"<h1>{username}</h1><h2>{repo}</h2>"
