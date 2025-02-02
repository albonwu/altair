"use client";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@heroui/react";
import { Folder, FileText } from "lucide-react";
import {Chip} from "@heroui/react";

export default function FileCard({ data, isDir }: { data: { title: string; description: string }, isDir: boolean }) {
    return (
        <>
      <Card className="w-[400px] h-[600px] ml-auto bg-[#1E1E2E] border border-[#313244] text-[#cdd6f4] shadow-md rounded-2xl">
      <CardHeader className="flex gap-3">
        {isDir ? <Folder /> : <FileText />}
        <div className="flex flex-col">
          <p className="text-md">{data.title}</p>
          <p className="text-small text-default-500">{isDir ? "Directory" : "File"}</p>
        </div>
        <div className="ml-auto flex flex-row">
        100 LoC
        </div>
        <br />
        <div>
            <Chip color="warning">3+ issues</Chip>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex gap-3">
        <p>{data.description}</p>
      <Divider />
        <p>
          dependencies go here
        </p>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link isExternal showAnchorIcon href="https://github.com/">
            Original source on GitHub
        </Link>
      </CardFooter>
    </Card></>)
}
