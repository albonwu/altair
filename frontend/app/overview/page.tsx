"use client";

import { title } from "@/components/primitives";
import NextLink from "next/link"
import { useState } from "react";
import {Pagination, PaginationItem, PaginationCursor} from "@heroui/pagination";
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import {Divider} from "@heroui/divider";

const cards = [
  { id: 0, title: "filler", content: "filler"},
  { id: 1, title: "Stacks and repository functionality", content: "TBD 1" },
  { id: 2, title: "High level structure", content: "TBD 2" },
  { id: 3, title: "Suggested roadmap", content: "TBD 3" },
];


export default function OverviewPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Change slide on pagination click
  const handlePageChange = (page : number) => {
    setCurrentPage(page);
  };
  
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
        total={3} // Total number of pages
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
