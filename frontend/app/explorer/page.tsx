import { title } from "@/components/primitives";
import NextLink from "next/link"

export default function ExplorerPage() {
  return (
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <NextLink href="/overview">back to overview</NextLink> 
      <div className="flex w-[25rem] h-[30rem] outline outline-2 outline-red-500">
      preview box
      </div>
      </section>

  );
}

