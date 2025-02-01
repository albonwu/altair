import { FolderIcon } from "@heroicons/react/24/solid";
export default function DirNode({ name }: { name: string }) {
  return (
    <div className="flex items-center flex-col">
      <FolderIcon className="size-6" />
      {name}
    </div>
  );
}
