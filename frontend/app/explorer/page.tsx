"use client";
import type { Filetree, FileEntry, DirEntry } from "@/types/index";

import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import FileNode from "@/components/FileNode";
import DirNode from "@/components/DirNode";

export default function ExplorerPage() {
  const [filetree, setFiletree] = useState<Filetree | null>(null);
  const [path, setPath] = useState(".");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/albonwu/cascade");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();

        setFiletree(result);
      } catch (err) {
        console.error(err);
        // todo: handle error
      }
    };

    fetchData();
  }, []);

  const info = filetree?.[path];

  return (
    <div className="flex items-stretch justify-center gap-4 w-full">
      <div className="flex flex-col flex-grow h-[30rem] outline outline-2 outline-red-500 gap-2">
        {getParentLevels(path).map((x) => (
          <div key={x} className="flex w-full justify-center">
            <StarIcon className="size-8" /> {x}
          </div>
        ))}
        {info && "children" in info && (
          <div className="flex w-full justify-center gap-4">
            {info.children.map(({ name, type }) =>
              type === "file" ? (
                <FileNode key={path + "/" + name} name={name} />
              ) : (
                <DirNode key={path + "/" + name} name={name} />
              )
            )}
          </div>
        )}
      </div>
      <div className="flex w-[25rem] h-[30rem] outline outline-2 outline-red-500">
        preview box
      </div>
    </div>
  );

  function getParentLevels(path: string) {
    const parts = path.split("/");

    return parts.map((_, index) => parts.slice(0, index + 1).join("/") || ".");
  }
}
