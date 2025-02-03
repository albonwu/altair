import React from "react";

export default function CodePreview({
  code,
  onClick,
}: {
  code: string;
  onClick: any;
}) {
  return (
    <pre
      className="whitespace-pre-wrap bg-gray-500 bg-opacity-50 p-2 cursor-pointer hover:bg-opacity-75 transition-all break-all"
      // onClick={onClick}
    >
      {code.slice(0, 300)}
    </pre>
  );
}
