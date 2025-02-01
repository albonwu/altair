import { DocumentTextIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function FileNode({ name, onClick }: NodeArguments) {
  return (
    <button className="flex items-center flex-col" onClick={onClick}>
      <DocumentTextIcon className="size-6" />
      {name}
    </button>
  );
}
