import subprocess
import os
import requests
from pathlib import Path


def count_file_lines(full_file_path: Path) -> int:
    try:
        return len(open(full_file_path).readlines())
    except Exception:
        return 0


def count_file_commits(full_file_path: Path):
    commits = 0
    try:
        result = subprocess.run(
            f"git log --follow --oneline -- {full_file_path}",
            shell=True,
            capture_output=True,
            text=True,
        )
        commits = int(len(result.stdout.splitlines()))
    except Exception as e:
        print(f"{e = }")
        return 0

    return commits


def count_dir_lines(full_path: Path, env):
    """count lines in a dir, assuming that everything that is a child of the dir has been counted before"""
    lines = 0
    for child in os.listdir(full_path):
        if child == ".git":
            continue
        new_full = full_path / child
        lines += env[new_full]["loc"]

    return lines


def count_dir_commits(full_path, _):
    """
    Same way we calculate it for a file
    """

    return count_file_commits(full_path)


def analyze_with_github(username, repo, env):
    response = requests.get(
        f"https://api.github.com/repos/{username}/{repo}/pulls?state=all&per_page=100",
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )

    for key in env:
        env[key]["prs"] = []

    for pr in response.json():
        number = pr["number"]

        files_response = requests.get(
            f"https://api.github.com/repos/{username}/{repo}/pulls/{number}/files"
        )

        for file in files_response.json():
            name = Path(file["filename"])
            if name in env:
                env[name]["prs"].append(number)


def add_hotness(env):
    for parent, dirs, files in os.walk(".", topdown=False):
        parent = Path(parent)
        print(f"{Path('.git').resolve() = }")
        print(f"{parent.resolve().parents[0] = }")
        if ".git" in parent.parts:
            continue

        total_hotness = 0
        for file in files:
            full_name = parent / file
            new_hotness = (
                env[full_name]["commits"] + len(env[full_name]["prs"]) * 5
            )
            env[full_name]["hotness"] = new_hotness
            total_hotness += new_hotness
        for dir in dirs:
            if dir == ".git":
                continue
            full_name = parent / dir
            total_hotness += env[full_name]["hotness"]
            # not possible to have an empty directory

        env[parent]["hotness"] = total_hotness / (len(dirs) + len(files))
