"use client";

import { title } from "@/components/primitives";
import NextLink from "next/link";
import { useState, useEffect } from "react";

import {
  Pagination,
  PaginationItem,
  PaginationCursor,
} from "@heroui/pagination";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { initialize } from "next/dist/server/lib/render-server";
import { Skeleton } from "@heroui/react";
import ReactMarkdown from "react-markdown";

async function llmGenNoInput(user: any, repo: any, query: any) {
  const res = await fetch(
    `http://127.0.0.1:5000/run/${user}/${repo}/${query}`,
    {
      method: "POST",
    }
  );

  if (res.ok) {
    const data = await res.json();

    return data.data;
  }
  return "";
}

const defaultCards = [
  { id: 0, title: "filler", content: "" },
  {
    id: 1,
    title: "Stacks used and high level structure",
    content: "",
  },
  { id: 2, title: "Suggested roadmap", content: "" },
];

export default function OverviewPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cards, setCards] = useState(defaultCards);

  // Change slide on pagination click
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  async function initializeCards() {
    const newCards = [...cards];
    const promises = cards.map((card) => {
      // generate overview
      if (card.id == 1) {
        return llmGenNoInput("albonwu", "cascade", "overview").then(
          (message) => {
            newCards[1].content = message;
          }
        );
      } else if (card.id == 2) {
        return llmGenNoInput("albonwu", "cascade", "roadmap").then(
          (message) => {
            newCards[2].content = message;
          }
        );
      }
    });

    await Promise.all(promises);
    setCards(newCards);
  }

  useEffect(() => {
    initializeCards();
  }, []);

  const showCurrPage = () => {
    const card = cards[currentPage];
    return (
      <div className="flex justify-center pt-10">
        <Card className="w-[1000px] h-[400px]">
          <CardHeader>
            <div className="flex flex-col">
              <p className="text-md">{card.title}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {cards[currentPage]?.content ? (
              <ReactMarkdown className="whitespace-pre-wrap">
                {cards[currentPage].content}
              </ReactMarkdown>
            ) : (
              <>
                <Skeleton className="h-4 w-full mb-2 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <h1 className={title()}>Overview</h1>
      {showCurrPage()}
      <div className="flex justify-center pt-6">
        <Pagination
          showControls
          color="primary"
          page={currentPage}
          total={2} // Total number of pages
          onChange={handlePageChange}
        />
      </div>
      <br />
      <NextLink href="/explorer">click to go to explorer!</NextLink>
    </div>
  );
}

