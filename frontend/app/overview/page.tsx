import { title } from "@/components/primitives";
import NextLink from "next/link"

export default function OverviewPage() {
  return (
    <div>
      <h1 className={title()}>Overview</h1>
      <br/>
      <NextLink href="/explorer">click to go to explorer!</NextLink>
    </div>
  );
}
