"use client";

import { useEffect, useState } from "react";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { FolderIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";

async function getChildren(
  username: string,
  repo: string,
  path: string
): Promise<string[]> {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/children/${username}/${repo}/${path}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch children");
    }

    const data = await res.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching children:", error);

    return [];
  }
}

export default function DirectoryList({
  path,
  username,
  repo,
}: {
  username: string;
  repo: string;
  path: string;
}) {
  const [items, setItems] = useState<
    { name: string; type: "file" | "directory" }[] | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      const children = await getChildren(username, repo, path);

      if (isMounted) {
        setItems(
          children.map((child) => ({
            name: child.endsWith("/") ? child.slice(0, -1) : child,
            type: child.endsWith("/") ? "directory" : "file",
          }))
        );
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (items === null) {
    return <h1 className="text-white">Loading...</h1>;
  }

  if (items.length === 0) {
    return <h1 className="text-white">Children Not Found</h1>;
  }

  return (
    <Listbox className="w-[50rem] bg-[#1E1E2E] rounded-lg border border-gray-700 shadow-lg">
      {items.map((item) => (
        <ListboxItem
          key={item.name}
          className="p-0 hover:bg-gray-700 transition-all rounded-lg cursor-pointer"
        >
          <Link
            className="flex items-center gap-3 px-5 py-3 w-full text-white hover:underline"
            href={`/file/${username}/${repo}/${path}/${item.name}`}
          >
            {item.type === "directory" ? (
              <FolderIcon className="text-yellow-400 size-5" />
            ) : (
              <FileTextIcon className="text-blue-400 size-5" />
            )}
            <span>{item.name}</span>
          </Link>
        </ListboxItem>
      ))}
    </Listbox>
  );
}
