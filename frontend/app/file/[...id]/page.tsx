import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

async function getFileContent(id: any) {
  const res = await fetch(`http://127.0.0.1:5000/code/${id.join("/")}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch file');
  }

  return res.text(); // Assuming it's text content like Vue code
}

export default async function ProductPage({ params }: { params: { id: string[] } }) {
  let content;

  try {
    content = await getFileContent(params.id);
  } catch (error) {
    return <h1>File Not Found</h1>;
  }

  const safe = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const clean = safe.startsWith('"') ? JSON.parse(safe) : safe;
  
  return (
    <div>
    <div className="relative w-[50rem] bg-gray-900 text-white rounded-lg overflow-x-auto">
      <SyntaxHighlighter
        language={"javascript"}
        style={oneDark}
        showLineNumbers={true}
        wrapLongLines={true}
        wrapLines={true}
        customStyle={{ fontSize: "14px" }}
      >
      {clean}
      </SyntaxHighlighter>
    </div>
      <h1>File: {params.id}</h1>
          <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
      <code>{content}</code>
    </pre>
    </div>
  );
}

