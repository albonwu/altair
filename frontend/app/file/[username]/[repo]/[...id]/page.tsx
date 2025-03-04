import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import FileCard from "@/components/FileCard";
import DirectoryContents from "@/components/DirectoryContents";

async function getFileContent(username: string, repo: string, id: any) {
  const res = await fetch(
    `http://127.0.0.1:5000/code/${username}/${repo}/${id.join("/")}`,
    { cache: "no-store" }
  );

  console.log(`http://127.0.0.1:5000/code/${username}/${repo}/${id.join("/")}`);

  if (!res.ok) {
    console.log("username", username);
    console.log("repo", repo);
    console.log("id", id);
    throw new Error("Failed to fetch file");
  }

  return res.text(); // Assuming it's text content like Vue code
}
export default async function ProductPage({ params }: any) {
  let content;

  const customTheme = {
    'code[class*="language-"]': {
      background: "#1E1E2E", // Match dark one background
      color: "#cdd6f4", // Light grayish text
      fontFamily: "'Fira Code', monospace",
      fontSize: "14px",
    },
    'pre[class*="language-"]': {
      background: "#1E1E2E",
      padding: "16px",
      borderRadius: "16px",
      overflow: "auto",
      border: "1px solid #313244",
    },
    comment: { color: "#6C7086" }, // Dimmed gray for comments
    keyword: { color: "#F7768E" }, // Keywords like `import`, `export`
    function: { color: "#82AAFF" }, // Function names
    string: { color: "#C3E88D" }, // String literals
    number: { color: "#FFCB6B" }, // Numbers
  };

  const { username, repo, id } = await params;

  try {
    content = await getFileContent(username, repo, id);
  } catch (error) {
    console.error(error);

    return <h1>File Not Found</h1>;
  }

  const safe =
    typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const clean = safe.startsWith('"') ? JSON.parse(safe) : safe;
  const dir = !params.id[params.id.length - 1].includes(".");

  return (
    <>
      <div className="flex flex-row gap-[5rem] mt-[-3rem]">
        {dir ? (
          <div className="w-[50rem]">
            <DirectoryContents
              path={params.id.join("/")}
              repo={repo}
              username={username}
            />
          </div>
        ) : (
          <div className="relative w-[50rem] text-white rounded-2xl overflow-x-auto">
            <SyntaxHighlighter
              customStyle={{ fontSize: "14px" }}
              language={"javascript"}
              showLineNumbers={true}
              style={customTheme}
              wrapLines={false}
              wrapLongLines={false}
            >
              {clean}
            </SyntaxHighlighter>
          </div>
        )}

        <FileCard
          data={{
            title: params.id[params.id.length - 1],
            path: params.id.join("/"),
            description: "A file. Gamers gaming gaming gaming epic pro gamer",
          }}
          isDir={dir}
          repo={repo}
          username={username}
        />
      </div>
    </>
  );
}
