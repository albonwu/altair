import { DocumentTextIcon, FolderIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function TreeNode({
  name,
  type,
  onClick,
  active,
}: NodeArguments) {
  return (
    <button
      className={`flex items-center flex-col`}
      style={{ opacity: active ? "100%" : "50%" }}
      onClick={onClick}
    >
      {type == "file" ? (
        <DocumentTextIcon className="size-6" />
      ) : (
        <FolderIcon className="size-6" />
      )}
      {name}
    </button>
  );
}
