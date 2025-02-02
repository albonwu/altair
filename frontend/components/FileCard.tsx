/* eslint-disable prettier/prettier */
"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Skeleton,
} from "@heroui/react";
import { Folder, FileText } from "lucide-react";
import { Chip } from "@heroui/react";
import { useEffect, useState } from "react";

async function getMetadata(path: string) {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/metadata/albonwu/cascade/${path}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch metadata");
    }

    const data = await res.json();
    return data || {};
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {};
  }
}

export default function FileCard({
  data,
  isDir,
}: {
  data: { title: string; path: string; description: string };
  isDir: boolean;
}) {
  const [properties, setProperties] = useState<{
    _id: string;
    loc: number;
    commits: number;
    prs: any;
    hotness: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const metadata = await getMetadata(data.path);
        if (isMounted && metadata) {
          setProperties({
            _id: metadata._id || "",
            loc: metadata.loc || 0,
            commits: metadata.commits || 0,
            prs: metadata.prs || [],
            hotness: metadata.hotness || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [data.path]);

  return (
    <Card className="w-[400px] h-[600px] ml-auto bg-[#1E1E2E] border border-[#313244] text-[#cdd6f4] shadow-md rounded-2xl">
      <CardHeader className="flex gap-3">
        {isDir ? <Folder /> : <FileText />}
        <div className="flex flex-col">
          <p className="text-md">{data.title}</p>
          <p className="text-small text-default-500">
            {isDir ? "Directory" : "File"}
          </p>
        </div>
        <div className="ml-auto flex flex-row">
          {properties ? (
            `${properties.loc} LoC`
          ) : (
            <Skeleton className="w-12 h-4" />
          )}
        </div>
        <br />
        <div>
          {properties ? (
            <Chip color="warning">{properties.prs.length} PRs</Chip>
          ) : (
            <Skeleton className="w-16 h-6 rounded-md" />
          )}
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex gap-3">
        <p>{data.description}</p>
        <Divider />
        <p>dependencies go here</p>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href={`https://github.com/albonwu/cascade/blob/main/${data.path}`}
        >
          Original source on GitHub
        </Link>
      </CardFooter>
    </Card>
  );
}
