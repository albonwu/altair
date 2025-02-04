import os
import subprocess


def clone_and_cd_to_repo(base_dir, username: str, repo: str):
    """Precondition: you are in a dir with a "files" directory and have called this function from the same place.
    Returns True if had to clone fresh otherwise False
    """

    cloned = False

    if not os.access(f"{base_dir}/files", os.W_OK):
        os.mkdir(f"{base_dir}/files")
    os.chdir(f"{base_dir}/files")

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

        cloned = True

    else:
        print("dont need to clone")
        # todo: check if the repo is up to date (git pull if necessary)

    os.chdir(repo)
    return cloned


def encode_path(path):
    posix_name = path.as_posix()
    if posix_name == ".":
        return posix_name
    else:
        return "./" + posix_name
