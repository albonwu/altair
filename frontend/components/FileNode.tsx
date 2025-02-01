import { DocumentTextIcon } from "@heroicons/react/24/solid";
export default function FileNode({ name }: { name: string }) {
  return (
    <div className="flex items-center flex-col">
      <DocumentTextIcon className="size-6" />
      {name}
    </div>
  );
}
