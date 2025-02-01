import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileCard from "@/components/FileCard";

async function getFileContent(id: any) {
  const res = await fetch(`http://127.0.0.1:5000/code/${id.join("/")}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch file');
  }

  return res.text(); // Assuming it's text content like Vue code
}

export default async function ProductPage({ params }: { params: { id: string[] } }) {
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

  try {
    content = await getFileContent(params.id);
  } catch (error) {
    return <h1>File Not Found</h1>;
  }

  const safe = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const clean = safe.startsWith('"') ? JSON.parse(safe) : safe;
  
  return (
    <>
        <div className="flex flex-row gap-[5rem]">
            <div className="relative w-[50rem] bg-gray-900 text-white rounded-2xl overflow-x-auto">
                <SyntaxHighlighter
                    language={"javascript"}
                    showLineNumbers={true}
                    wrapLongLines={true}
                    wrapLines={true}
                    customStyle={{ fontSize: "14px" }}
                    style={customTheme}
                >
                    {clean}
                </SyntaxHighlighter>
            </div>

            <FileCard />
        </div>
    </>
  );
}

