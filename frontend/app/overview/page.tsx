"use client";

import { title } from "@/components/primitives";
import NextLink from "next/link"
import { useState, useEffect } from "react";
import {Pagination, PaginationItem, PaginationCursor} from "@heroui/pagination";
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import {Divider} from "@heroui/divider";
import { initialize } from "next/dist/server/lib/render-server";

async function initLlm(user: any, repo: any) {
  const res = await fetch(`http://127.0.0.1:5000/init/${user}/${repo}`, {
    method: "POST",
  });
  if (res.ok) {
    const data = await res.json(); 
    return data.message;
  }
}

async function llmGenNoInput(user: any, repo: any, query: any) {
  const res = await fetch(`http://127.0.0.1:5000/run/${user}/${repo}/${query}`, {
    method: "POST",
  });
  if (res.ok) {
    const data = await res.json(); 
    return data.data;
  }
}


const cards = [
  { id: 0, title: "filler", content: ""},
  { id: 1, title: "Stacks used, repository functionality, and high level strucutre", content: "" },
  { id: 2, title: "Suggested roadmap", content: "" },
];

async function initializeCards() {
  await initLlm("albonwu", "cascade");
  const promises = cards.map((card) => {
    // generate overview
    if (card.id == 1) {
      return llmGenNoInput("albonwu", "cascade", "overview").then((message) => {
        card.content = message;
      });
    }
    else if (card.id == 2) {
      return llmGenNoInput("albonwu", "cascade", "roadmap").then((message) => {
        card.content = message;
      });
    }
  })
  await Promise.all(promises);
}


export default function OverviewPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Change slide on pagination click
  const handlePageChange = (page : number) => {
    setCurrentPage(page);
  };
  
  useEffect(() => {
    {initializeCards();}
  }, []);

  const showCurrPage = () => {
    return (
      <div className="flex justify-center pt-10">
        <Card className="w-[1000px] h-[400px]">
          <CardHeader>
            <div className="flex flex-col">
              <p className="text-md">{cards[currentPage].title}</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            {cards[currentPage].content}
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div>
    <h1 className={title()}>Overview</h1>
      {showCurrPage()}        
      <div className="flex justify-center pt-6">
      <Pagination color="primary"
        total={2} // Total number of pages
        page={currentPage}
        onChange={handlePageChange}
        showControls
      />
      </div>
      <br/>
      <NextLink href="/explorer">click to go to explorer!</NextLink>
    </div>
  );
}
