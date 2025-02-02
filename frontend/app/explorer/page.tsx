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
      <div className="flex flex-col flex-grow h-[30rem] outline outline-2 outline-red-500 gap-2 overflow-scroll">
        {getParentLevels(path).map((x) => (
          <div key={x} className="flex w-full justify-center">
            <button
              className="flex flex-col items-center"
              onClick={() => handleNodeClick(x)}
            >
              <StarIcon className="size-8" />
              {x}
            </button>
          </div>
        ))}

        {info && "children" in info && (
          <div className="flex w-full justify-center gap-4">
            {info.children.map(({ name, type }) => {
              const fullName = path + "/" + name;

              if (type === "file") {
                return (
                  <FileNode
                    key={fullName}
                    name={name}
                    onClick={() => handleNodeClick(fullName)}
                  />
                );
              } else {
                return (
                  <DirNode
                    key={fullName}
                    name={name}
                    onClick={() => handleNodeClick(fullName)}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
      <div className="flex flex-none w-[25rem] outline outline-2 outline-red-500">
        preview box
      </div>
    </div>
  );

  function handleNodeClick(path: string) {
    console.log("path", path);
    setPath(path);
  }

  function getParentLevels(path: string) {
    const parts = path.split("/");

    return parts.map((_, index) => parts.slice(0, index + 1).join("/") || ".");
  }
}
