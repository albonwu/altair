import os
import subprocess
import io
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)


# Helper: Returns the full query string for a given query_type
# fd is the string path to the file or directory
def get_query(query_type, fd="") -> str:
    if query_type == "overview":
        return (
            "Do not talk about Repomix. In one paragraph (2-3 sentences), give an insightful and detailed summary of the project, including its stack, functionality, high-level structure, etc. Provide a definitive answer and do not hedge. You may not use terms like 'likely' or 'possibly.'",
        )
    elif query_type == "roadmap":
        return (
            "Based on your understanding of the directory structure and semantics of the project, construct an ordered list of 5 files or directories that you think form a ‘canonical’ order in which a new contributor should parse the repository to best understand it. For each item, give a one-sentence description of what it does, and a one-sentence justification for its position in the list. Provide a definitive answer and do not hedge. You may not use terms like 'likely' or 'possibly.'",
        )
    elif query_type == "fd":
        return (
            "Summarize as concretely as possible the functionality of the file/directory at "
            + fd
            + ". Be as specific to this particular file/directory as you can - do not include functionality outside its scope - but the last two sentences of your response should describe the files/directories it most closely interacts with. Provide a definitive answer and do not hedge. You may not use terms like 'likely' or 'possibly.'"
        )
    elif query_type == "brief":
        if fd == "":
            return "Summarize briefly (2-3 sentences) the purpose and application of this repository to someone who has not seen it before."
        else:
            return (
                "Summarize very briefly (1-2 sentences) what the file/directory at "
                + fd
                + "does in relation to this repository. Your answer should be understandable to someone who has never seen this repository structure before."
            )
    elif query_type == "dependencies":
        return (
            "Return two lists. Do not elaborate beyond listing the file paths. In one, list at most three files that the file "
            + fd
            + " depends on. In the other list, list at most three files that depend on "
            + fd
            + ". Your answer should consist of two comma-separated lines, the first of which lists the files the current one depends on, and the second of which lists the files that depend on it. Do not include backticks in your answer. If no files exist, simply reply 'No dependencies found.' Do not, under any circumstance, list file paths that are not included in the context I have provided you. Do not simultaneously indicate that there are no dependencies if you are also listing files."
        )


chat_session = None


def try_init(username, repo):
    global chat_session
    if chat_session is None:
        url = f"https://github.com/{username}/{repo}"
        chat_init(url)


def chat_init(repo_url: str) -> None:
    """
    Initializes a chat instance for a given github repo url.
    """
    global chat_session
    chat_session = model.start_chat(history=[])

    try:
        os.chdir("/tmp/")
        repomix_result = subprocess.run(
            ["repomix", "--remote", repo_url],
        )
    # if there is an error with running repomix
    except subprocess.CalledProcessError as e:
        return False

    file_in_memory = open("repomix-output.txt")

    message = "Eliminate uncertainty and state all answers with full confidence. Here is a GitHub repository structure and main files to be analyzed:\n"

    chat_session.send_message(f"{message}\n{file_in_memory.read()}")


def query_overview(_=None):
    """
    Returns the text of the detailed summary of the overall github repo
    """
    response = chat_session.send_message(get_query("overview"))
    return response.text


def query_roadmap(_=None):
    """
    Returns the text of the suggested overall roadmap
    """
    response = chat_session.send_message(get_query("roadmap"))
    return response.text


def query_fd(fd_name):
    """
    Returns the summary of a specific file or directory path given by fd_name
    """
    request = get_query("fd", fd_name)
    response = chat_session.send_message(request)
    return response.text


def query_brief(fd_name):
    """
    Returns the summary of a specific file or directory path given by fd_name
    """
    request = get_query("brief", fd_name)
    response = chat_session.send_message(request)
    return response.text


def query_dependencies(f):
    """
    Returns 2 bulleted lists of up to 3 forward and 3 backward dependencies a file has
    """
    request = get_query("dependencies", f)
    response = chat_session.send_message(request)
    return response.text
