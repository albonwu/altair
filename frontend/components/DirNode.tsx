import { FolderIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function DirNode({ name, onClick }: NodeArguments) {
  return (
    <button className="flex items-center flex-col" onClick={onClick}>
      <FolderIcon className="size-6" />
      {name}
    </button>
  );
}
