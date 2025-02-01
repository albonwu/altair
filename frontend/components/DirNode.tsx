import { FolderIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function DirNode({ active, name, onClick }: NodeArguments) {
  return (
    <button
      className={`flex items-center flex-col`}
      style={{ opacity: active ? "100%" : "75%" }}
      onClick={onClick}
    >
      <FolderIcon className="size-6" />
      {name}
    </button>
  );
}
