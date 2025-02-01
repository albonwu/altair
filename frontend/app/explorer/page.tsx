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
    <div
      className="flex items-stretch justify-center gap-4 w-full"
      style={{ height: "80vh" }}
    >
      <div className="flex flex-grow h-full outline outline-2 outline-red-500 gap-4 overflow-scroll px-4">
        <div className="flex flex-col h-full justify-center gap-4">
          <button
            className="flex items-center flex-col"
            onClick={() => handleNodeClick(".")}
          >
            <StarIcon className="size-8" />.
          </button>
        </div>

        {getParentLevels(path).map((partialPath) => {
          let levelInfo = filetree?.[partialPath];

          if (!levelInfo || !("children" in levelInfo)) {
            return <div key={partialPath} />;
          }

          return (
            <div
              key={partialPath}
              className="flex flex-col h-full justify-center gap-4"
            >
              {levelInfo.children.map(({ name, type }) => {
                const fullName = partialPath + "/" + name;

                if (type === "file") {
                  return (
                    <FileNode
                      key={fullName}
                      active={path.startsWith(fullName)}
                      name={name}
                      onClick={() => handleNodeClick(fullName)}
                    />
                  );
                } else {
                  return (
                    <DirNode
                      key={fullName}
                      active={path.startsWith(fullName)}
                      name={name}
                      onClick={() => handleNodeClick(fullName)}
                    />
                  );
                }
              })}
            </div>
          );
        })}
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
