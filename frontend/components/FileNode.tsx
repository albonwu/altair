import { DocumentTextIcon } from "@heroicons/react/24/solid";

import { NodeArguments } from "@/types";
export default function FileNode({ name, onClick, active }: NodeArguments) {
  return (
    <button
      className={`flex items-center flex-col`}
      style={{ opacity: active ? "100%" : "75%" }}
      onClick={onClick}
    >
      <DocumentTextIcon className="size-6" />
      {name}
    </button>
  );
}
