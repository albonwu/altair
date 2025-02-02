"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Skeleton,
  Chip,
} from "@heroui/react";
import { Folder, FileText } from "lucide-react";
import NextLink from "next/link";
import ReactMarkdown from "react-markdown";

async function getMetadata(username: string, repo: string, path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const res = await fetch(
      `http://127.0.0.1:5000/metadata/${username}/${repo}/${encodedPath}`,
      { cache: "no-store", mode: "cors" }
    );
    if (!res.ok) throw new Error("Failed to fetch metadata");
    return await res.json();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch summary");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch dependencies");
    const response = await res.json();
    return response?.data || "No dependencies available.";
  } catch (error) {
    console.error("Error fetching dependencies:", error);
    return "No dependencies available.";
  }
}

async function fetchPRDetails(owner: string, repo: string, prNumbers: number[]) {
  if (!prNumbers || prNumbers.length === 0) return [];
  try {
    const requests = prNumbers.map((pr) =>
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`).then((res) =>
        res.ok ? res.json() : null
      )
    );
    return (await Promise.all(requests)).filter((pr) => pr !== null);
  } catch (error) {
    console.error("Error fetching PR details:", error);
    return [];
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
    prs: number[];
    hotness: number;
  } | null>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [prData, setPRData] = useState<{ number: number; title: string; url: string }[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
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

        const fetchedSummary = await getSummary(username, repo, data.path);
        if (isMounted) setSummary(fetchedSummary);

        const fetchedDependencies = await getDependencies(username, repo, data.path);
        if (isMounted) setDependencies(fetchedDependencies);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [data.path, username, repo]);

  useEffect(() => {
    if (!metadata || !metadata.prs.length) return;

    async function getPRs() {
      const data = await fetchPRDetails(username, repo, metadata.prs);
      setPRData(
        data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
        }))
      );
    }

    getPRs();
  }, [metadata]);

  return (
<Card className="w-[400px] ml-auto bg-[#1E1E2E] border border-[#313244] shadow-md rounded-2xl flex flex-col">
  <CardHeader className="flex gap-3">
    {isDir ? <Folder /> : <FileText />}
    <div className="flex flex-col">
      <p className="text-md">{data.title}</p>
      <p className="text-small text-default-500">{isDir ? "Directory" : "File"}</p>
    </div>
    <div className="ml-auto flex flex-row">
      {metadata ? `${metadata.loc} LoC` : <Skeleton className="w-12 h-4" />}
    </div>
    <br />
    <div>{metadata ? <Chip color={metadata.hotness < 15 ? "primary" : metadata.hotness < 30 ? "warning" : "danger"}>{metadata.hotness}&deg;</Chip> : <Skeleton className="w-16 h-6 rounded-md" />}</div>
  </CardHeader>

  <Divider />

  <CardBody className="flex flex-col gap-3">
    <p className="font-bold text-sm text-gray-400">Summary:</p>
    {summary ? (
      <>
        <div className={expanded ? "" : "line-clamp-4 overflow-hidden"}>
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
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

  <Divider />

  {/* ✅ Dependencies Section - Takes Up Full Height */}
    <p className="font-bold text-sm text-gray-400">Dependencies:</p>
    <p className="text-gray-300">Backward:</p>
    {dependencies && (
      <ul>
        {dependencies
          .split("\n")[0]
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
          .map((path, index) => (
            <li key={index}>
              <NextLink href={`/file/${username}/${repo}/${path}`} target="_blank" rel="noopener noreferrer">
                {path}
              </NextLink>
            </li>
          ))}
      </ul>
    )}
    <Divider />
    <p className="text-gray-300">Forward:</p>
    {dependencies && (
      <ul>
        {dependencies
          .split("\n")[1]
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
          .map((path, index) => (
            <li key={index}>
              <NextLink href={`/file/${path}`} target="_blank" rel="noopener noreferrer">
                {path}
              </NextLink>
            </li>
          ))}
      </ul>
    )}

  <Divider />

    <p className="font-bold text-sm text-gray-400">Pull requests</p>
    <ul className="list-disc list-inside text-white">
      {prData.length > 0 ? (
        prData.map((pr) => (
          <li key={pr.number}>
            <Link href={pr.url} className="text-blue-400 hover:underline" isExternal={true}>
              #{pr.number} - {pr.title}
            </Link>
          </li>
        ))
      ) : (
        <p className="text-gray-400">No PRs available.</p>
      )}
    </ul>
  </CardBody>

  <Divider />

  <CardFooter>
    <Link isExternal showAnchorIcon href={`https://github.com/albonwu/cascade/blob/main/${data.path}`}>
      Original source on GitHub
    </Link>
  </CardFooter>
</Card>

  );
}

