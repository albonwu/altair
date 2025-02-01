import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import {Button, ButtonGroup} from "@heroui/button";
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


      <div className="flex gap-1 w-96 mt-4">
      <Input placeholder="GitHub URL" type="url" startContent={<GithubIcon size={20}/>} />
      </div>

      <div className="flex gap-4" color="blue">
        <Link
          isExternal
          href={"https://waning.dev/"}
        >
          <Button color="primary">
          Browse!
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Or get started by replacing <Code>github.com</Code> in your repository's URL with <Code color="primary">wayne.com</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
