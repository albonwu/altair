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
import NextLink from "next/link";
import ReactMarkdown from "react-markdown";

async function getMetadata(username: string, repo: string, path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const res = await fetch(
      `http://127.0.0.1:5000/metadata/${username}/${repo}/${encodedPath}`,
      { cache: "no-store", mode: "cors" }
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

async function getSummary(username: string, repo: string, path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const res = await fetch(
      `http://127.0.0.1:5000/run/${username}/${repo}/fd/${encodedPath}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch summary");
    }

    const response = await res.json();

    return response?.data || "No summary available.";
  } catch (error) {
    console.error("Error fetching summary:", error);

    return "No summary available.";
  }
}

async function getDependencies(username: string, repo: string, path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const res = await fetch(
      `http://127.0.0.1:5000/run/${username}/${repo}/dependencies/${encodedPath}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch dependencies");
    }

    const response = await res.json();

    return response?.data || "No dependencies available.";
  } catch (error) {
    console.error("Error fetching dependencies:", error);

    return "No dependencies available.";
  }
}

export default function FileCard({
  data,
  isDir,
  username,
  repo,
}: {
  data: { title: string; path: string; description: string };
  isDir: boolean;
  username: string;
  repo: string;
}) {
  const [metadata, setMetadata] = useState<{
    _id: string;
    loc: number;
    commits: number;
    prs: any;
    hotness: number;
  } | null>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetadata() {
      try {
        const fetchedMetadata = await getMetadata(username, repo, data.path);

        if (isMounted) {
          setMetadata({
            _id: fetchedMetadata._id || "",
            loc: fetchedMetadata.loc || 0,
            commits: fetchedMetadata.commits || 0,
            prs: fetchedMetadata.prs || [],
            hotness: fetchedMetadata.hotness || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    }

    async function fetchSummary() {
      try {
        const fetchedSummary = await getSummary(username, repo, data.path);

        if (isMounted) {
          setSummary(fetchedSummary);
          console.log(fetchedSummary);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    }

    async function fetchDependencies() {
      try {
        const fetchedDependencies = await getDependencies(
          username,
          repo,
          data.path
        );

        if (isMounted) {
          setDependencies(fetchedDependencies);
          console.log(fetchedDependencies);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    }

    fetchMetadata();
    fetchSummary();
    fetchDependencies();

    return () => {
      isMounted = false;
    };
  }, [data.path]);

  return (
    <Card className="w-[400px] h-[600px] ml-auto bg-[#1E1E2E] border border-[#313244] shadow-md rounded-2xl">
      <CardHeader className="flex gap-3">
        {isDir ? <Folder /> : <FileText />}
        <div className="flex flex-col">
          <p className="text-md">{data.title}</p>
          <p className="text-small text-default-500">
            {isDir ? "Directory" : "File"}
          </p>
        </div>
        <div className="ml-auto flex flex-row">
          {metadata ? `${metadata.loc} LoC` : <Skeleton className="w-12 h-4" />}
        </div>
        <br />
        <div>
          {metadata ? (
            <Chip color="warning">{metadata.prs.length} PRs</Chip>
          ) : (
            <Skeleton className="w-16 h-6 rounded-md" />
          )}
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-3">
        <p className="font-bold text-sm text-gray-400">Summary:</p>
        {summary ? (
          <>
            <ReactMarkdown
              className={
                expanded
                  ? "transition-all duration-300"
                  : "line-clamp-4 transition-all duration-300"
              }
            >
              {summary}
            </ReactMarkdown>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-2 text-blue-500 hover:underline"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          </>
        ) : (
          <Skeleton className="w-full h-6" />
        )}
      </CardBody>
      <Divider />
      <CardBody className="flex flex-col gap-3">
        <p className="font-bold text-sm text-gray-400">Dependencies:</p>
        Backward:
        <br />
        {dependencies && (
          <ul>
            {dependencies
              .split("\n")[0]
              .split(",")
              .map((path) => path.trim())
              .filter((path) => path.length > 0)
              .map((path, index) => (
                <li key={index}>
                  <NextLink
                    href={`/file/${username}/${repo}/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {path}
                  </NextLink>
                </li>
              ))}
          </ul>
        )}
        <Divider />
        Forward:
        <br />
        {dependencies && (
          <ul>
            {dependencies
              .split("\n")[1]
              .split(",")
              .map((path) => path.trim())
              .filter((path) => path.length > 0)
              .map((path, index) => (
                <li key={index}>
                  <NextLink
                    href={`/file/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {path}
                  </NextLink>
                </li>
              ))}
          </ul>
        )}
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
