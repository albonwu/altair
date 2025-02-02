"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeBracketIcon, FireIcon, StarIcon } from "@heroicons/react/24/solid";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider, Skeleton } from "@heroui/react";

import { FileMetadata, type Filetree } from "@/types/index";
import TreeNode from "@/components/TreeNode";
import CodePreview from "@/components/CodePreview";

const BACKEND_URL = "http://127.0.0.1:5000";

export default function ExplorerPage() {
  const [filetree, setFiletree] = useState<Filetree | null>(null);
  const [path, setPath] = useState(".");
  const [selectedInfo, setSelectedInfo] = useState<FileMetadata | null>(null);
  const [hottest, setHottest] = useState<[string] | null>(null);
  const [description, setDescription] = useState<string | null>(
    "Welcome to the Explorer! Click on any node to get started."
  );
  const [descriptionLoading, setDescriptionLoading] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/repo/${params.username}/${params.repo}`
        );

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
      <div className="flex flex-grow gap-8 overflow-scroll px-4 bg-[#1E1E2E] bg-opacity-50 rounded-2xl">
        <div className="flex flex-col h-full justify-center gap-4">
          <button
            className="flex items-center flex-col"
            onClick={() => handleNodeClick(".")}
          >
            <StarIcon className="size-8" />
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
                        ? "text-yellow-400"
                        : "text-white"
                    } transition-all duration-200 hover:opacity-100`}
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

      <Card className="flex flex-col flex-none w-[25rem] p-4 gap-2 bg-gray-500 overflow-y-scroll">
        <CardHeader className="font-bold text-xl text-wrap break-all">
          {path}
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-col gap-4">
          {descriptionLoading ? (
            <>
              <Skeleton className="w-full h-4 rounded-lg text-gray-300" />
              <Skeleton className="w-full h-4 rounded-lg text-gray-300" />
              <Skeleton className="w-full h-4 rounded-lg text-gray-300" />
            </>
          ) : (
            <p>{description}</p>
          )}
          {hottest && (
            <>
              <div className="flex gap-2 items-center">
                <FireIcon className="size-6" />
                <h2 className="text-lg font-bold">Hottest Files</h2>
              </div>
              <ul className="break-all">
                {hottest.slice(0, 5).map((childPath) => {
                  const shortenedPath = childPath.substring(path.length + 1);

                  return (
                    <li key={childPath}>
                      <button
                        className="underline"
                        onClick={() => handleNodeClick(childPath)}
                      >
                        {shortenedPath}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {selectedInfo?.code && (
            <>
              <div className="flex gap-2 items-center">
                <CodeBracketIcon className="size-6" />
                <h2 className="text-lg font-bold">Code Preview</h2>
              </div>
              <CodePreview
                code={selectedInfo.code}
                onClick={() => jumpToFullPage()}
              />
            </>
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex w-full justify-center">
          <button
            className="text-xl disabled:opacity-50"
            disabled={path === "."}
            onClick={() => jumpToFullPage()}
          >
            View Source
          </button>
        </CardFooter>
      </Card>
    </div>
  );

  function jumpToFullPage() {
    const cutPath = path.substring(2);

    router.push(`/file/${params.username}/${params.repo}/${cutPath}`);

    // window.location.href = window.location.origin + "/file/" + cutPath;
  }

  async function handleNodeClick(path: string) {
    console.log("path", path);
    setPath(path);

    const cutPath = path.substring(2);

    await fetchSelectedInfo(cutPath);
    if (filetree?.[path]?.type == "dir") {
      await fetchHottest(cutPath);
    } else {
      setHottest(null);
    }
    fetchDescription(cutPath);
  }

  async function fetchDescription(path: string) {
    setDescriptionLoading(true);
    const response = await fetch(
      `${BACKEND_URL}/run/${params.username}/${params.repo}/brief/${path}`
    );

    if (!response.ok) {
      console.error("error fecthing description");

      setDescription(null);

      return;
    }

    const data = await response.json();

    console.log("data", data);

    setDescription(data.data);
    setDescriptionLoading(false);
  }

  async function fetchHottest(path: string) {
    const response = await fetch(
      `${BACKEND_URL}/hottest/${params.username}/${params.repo}/${path}`
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
      `${BACKEND_URL}/metadata/${params.username}/${params.repo}/${path}`
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
