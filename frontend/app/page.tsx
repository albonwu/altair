"use client";

import { useState } from "react";
import { Snippet } from "@heroui/snippet";
import { Button } from "@heroui/button";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleClick = async () => {
    if (!url.trim()) return; // Prevent empty submission

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/init/albonwu/cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: url }),
      });

      if (!res.ok) throw new Error("Failed to initialize repository");

      router.push("/overview"); // Redirect after successful request
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
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          startContent={<GithubIcon size={20} />}
        />
      </div>

      {/* Browse Button with Loading Animation */}
      <div className="flex gap-4">
        <Button color="primary" onPress={handleClick} isDisabled={loading}>
          {loading ? <Spinner size="sm" color="white" /> : "Browse!"}
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

