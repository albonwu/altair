import { DocumentTextIcon, FolderIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function TreeNode({
  name,
  type,
  id,
  onClick,
  active,
  className,
}: NodeArguments) {
  return (
    <button
      className={`flex items-center flex-row outline p-[5px] gap-2 rounded-xl ${className}`}
      style={{ opacity: active ? "100%" : "50%" }}
      id={id}
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
