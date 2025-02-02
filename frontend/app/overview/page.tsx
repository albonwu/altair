"use client";

import { title } from "@/components/primitives";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import {
  Pagination,
} from "@heroui/pagination";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";

// API functions
async function initLlm(user: string, repo: string) {
  const res = await fetch(`http://127.0.0.1:5000/init/${user}/${repo}`, {
    method: "POST",
  });
  if (res.ok) {
    const data = await res.json();
    return data.message;
  }
}

async function llmGenNoInput(user: string, repo: string, query: string) {
  const res = await fetch(
    `http://127.0.0.1:5000/run/${user}/${repo}/${query}`,
    {
      method: "POST",
    }
  );
  if (res.ok) {
    const data = await res.json();
    console.log(data);
    return data.data;
  }
  return "";
}

type CardType = {
  id: number;
  title: string;
  content: string;
};

export default function OverviewPage() {
  const [cards, setCards] = useState<CardType[]>([
    { id: 0, title: "Filler", content: "Static filler content" },
    {
      id: 1,
      title: "Stacks used, repository functionality, and high level structure",
      content: "",
    },
    { id: 2, title: "Suggested roadmap", content: "" },
  ]);

  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    async function initializeCards() {
      await initLlm("albonwu", "cascade");

      const updatedCards = [...cards];

      if (updatedCards.find((card) => card.id === 1)) {
        const overviewContent = await llmGenNoInput("albonwu", "cascade", "overview");
        updatedCards[1].content = overviewContent;
      }
      if (updatedCards.find((card) => card.id === 2)) {
        const roadmapContent = await llmGenNoInput("albonwu", "cascade", "roadmap");
        updatedCards[2].content = roadmapContent;
      }
      setCards(updatedCards);
    }

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
            {card.content ? (
              card.content
            ) : (
              <div>Loading...</div>
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
          color="primary"
          total={cards.length}
          page={currentPage}
          onChange={handlePageChange}
          showControls
        />
      </div>
      <br />
      <NextLink href="/explorer">Click to go to explorer!</NextLink>
    </div>
  );
}

