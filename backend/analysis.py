import subprocess
import os
import requests


def count_file_lines(full_file_path: str) -> int:
    try:
        return len(open(full_file_path).readlines())
    except Exception:
        return 0


def count_file_commits(full_file_path):
    commits = 0
    try:
        result = subprocess.run(
            f"git log --follow --oneline -- {full_file_path} | wc -l",
            shell=True,
            capture_output=True,
            text=True,
        )
        commits = int(result.stdout.strip())
    except Exception as e:
        print(f"{e = }")
        return 0

    return commits


def count_dir_lines(full_path, env):
    """count lines in a dir, assuming that everything that is a child of the dir has been counted before"""
    lines = 0
    for child in os.listdir(full_path):
        new_full = full_path + "/" + child
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
        env[key]["prs"] = 0

    for pr in response.json():
        number = pr["number"]

        files_response = requests.get(
            f"https://api.github.com/repos/{username}/{repo}/pulls/{number}/files"
        )

        for file in files_response.json():
            name = "./" + file["filename"]
            if name in env:
                env[name]["prs"] += 1
