"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

import { FileMetadata, type Filetree } from "@/types/index";
import TreeNode from "@/components/TreeNode";

const BACKEND_URL = "http://127.0.0.1:5000";
const USERNAME = "albonwu";
const REPO = "cascade";

export default function ExplorerPage() {
  const [filetree, setFiletree] = useState<Filetree | null>(null);
  const [path, setPath] = useState(".");
  const [selectedInfo, setSelectedInfo] = useState<FileMetadata | null>(null);
  const [hottest, setHottest] = useState<[string] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/repo/${USERNAME}/${REPO}`);

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

  return (
    <div
      className="flex items-stretch justify-center gap-4 w-full h-full"
      style={{ height: "min(100%, 80vh)" }}
    >
      <div className="flex flex-grow gap-[2rem] overflow-scroll px-4 bg-gray-500 bg-opacity-20">
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
              className="flex flex-col h-full justify-center gap-4 pt-[3rem]"
            >
              {levelInfo.children.map(({ name, type }) => {
                const fullName = partialPath + "/" + name;

                return (
                  <TreeNode
                    key={fullName}
                    active={path.startsWith(fullName)}
                    className={`${
                      path === fullName
                        ? "text-yellow-300 shadow-md"
                        : "text-white"
                    } transition-all duration-200 hover:text-yellow-400 hover:shadow-lg`}
                    name={name}
                    type={type}
                    onClick={() => handleNodeClick(fullName)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col flex-none w-[25rem] p-4 gap-2 bg-gray-500 bg-opacity-50">
        <h1 className="font-bold text-xl text-wrap break-all">{path}</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <h2>Hottest Files</h2>
        {hottest && (
          <ul>
            {hottest.slice(0, 5).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  async function handleNodeClick(path: string) {
    console.log("path", path);
    setPath(path);

    const cutPath = path.substring(2);

    await fetchSelectedInfo(cutPath);
    await fetchHottest(cutPath);
  }

  async function fetchHottest(path: string) {
    const response = await fetch(
      `${BACKEND_URL}/hottest/${USERNAME}/${REPO}/${path}`
    );

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);

      setHottest(null);

      return;
    }

    const hottestRawList = await response.json();

    setHottest(hottestRawList.map((x: FileMetadata) => x._id));
  }

  async function fetchSelectedInfo(path: string) {
    const response = await fetch(
      `${BACKEND_URL}/metadata/${USERNAME}/${REPO}/${path}`
    );

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);

      return;
    }

    const newSelectedInfo = await response.json();

    console.log("newSelectedInfo", newSelectedInfo);

    setSelectedInfo(newSelectedInfo);
  }

  function getParentLevels(path: string) {
    const parts = path.split("/");

    return parts.map((_, index) => parts.slice(0, index + 1).join("/") || ".");
  }
}
