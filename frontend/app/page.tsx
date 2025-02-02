"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Snippet } from "@heroui/snippet";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

const GITHUB_REGEX =
  /https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleClick = async () => {
    if (!url.trim()) return; // Prevent empty submission

    setLoading(true);
    const match = url.match(GITHUB_REGEX);

    if (!match || match.length < 3) {
      setLoading(false);

      return;
    }

    const username = match[1];
    const repo = match[2];

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/init/${username}/${repo}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo_url: url }),
        }
      );

      if (!res.ok) throw new Error("Failed to initialize repository");

      router.push(`/overview/${username}/${repo}`); // Redirect after successful request
    } catch (error) {
      console.error("Error:", error);
      setLoading(false); // Stop loading on error
    }
  };

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

      {/* Input Field */}
      <div className="flex gap-1 w-96 mt-4">
        <Input
          placeholder="GitHub URL"
          startContent={<GithubIcon size={20} />}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {/* Browse Button with Loading Animation */}
      <div className="flex gap-4">
        <Button color="primary" isDisabled={loading} onPress={handleClick}>
          {loading ? <Spinner color="white" size="sm" /> : "Browse!"}
        </Button>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>Built with ❤️ at SpartaHack X</span>
        </Snippet>
      </div>
    </section>
  );
}
