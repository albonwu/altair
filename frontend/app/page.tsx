import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import {Input} from "@heroui/input";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title({ color: "blue" })}>Supercharge&nbsp;</span>
        <span className={title()}>your&nbsp;</span>
        <br />
        <span className={title()}>repository browsing.&nbsp;</span>
        <div className={subtitle({ class: "mt-4" })}>
        Enter the link to a GitHub repo below:
        </div>
      </div>

      {/*
      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>
*/}
      <div className="flex gap-1 w-96">
      <Input label="GitHub URL" type="url"/>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Or get started by replacing <Code color="primary">github.com</Code> in your repository's URL with <Code color="secondary">wayne.com</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
