from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/<username>/<repo>")
def repo(username: str, repo: str):
    return f"<h1>{username}</h1><h2>{repo}</h2>"
