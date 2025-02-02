"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Skeleton } from "@heroui/skeleton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";
import PathBreadcrumbs from "@/components/PathBreadcrumbs";

export const Navbar = () => {
  const pathname = usePathname();
  const [clientPath, setClientPath] = useState<string | null>(null);

  // Ensure it only sets once mounted on the client
  useEffect(() => {
    setClientPath(pathname);
  }, [pathname]);

  if (!clientPath) {
    return (
      <HeroUINavbar maxWidth="xl">
        <NavbarContent
          className="basis-1/5 sm:basis-full mt-[5rem]"
          justify="start"
        >
          <NavbarBrand className="gap-3 max-w-fit">
            <Skeleton className="h-8 w-32 rounded-md bg-[#313244]" />
          </NavbarBrand>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  let pageTitle;
  let isFile;
  let splitPathname: string[] = [];
  let repoName;

  if (clientPath === "/") {
    pageTitle = "Altair";
  } else {
    repoName = clientPath.split("/").slice(2, 4).join("/");

    if (clientPath.startsWith("/overview")) {
      pageTitle = "Overview: " + repoName;
    } else if (clientPath.startsWith("/explorer")) {
      pageTitle = "Explorer: " + repoName;
    } else {
      splitPathname = clientPath.split("/").slice(4); // remove prefix and 'file'
      pageTitle = "File View: " + repoName;
      isFile = true;
    }
  }

  return (
    <HeroUINavbar className="p-4" maxWidth="xl">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          {isFile ? (
            <NextLink
              className="font-bold text-inherit text-3xl"
              href={`/explorer/${repoName}`}
            >
              {pageTitle}
            </NextLink>
          ) : (
            <>
              <NextLink href="/">
                <img
                  alt="Logo"
                  className="w-8 h-8 inline-block"
                  src="/logo.png"
                />
              </NextLink>
              <p className="font-bold text-inherit text-3xl">{pageTitle}</p>
            </>
          )}
          <br />
          {isFile && repoName && (
            <PathBreadcrumbs repoName={repoName} segments={splitPathname} />
          )}
        </NavbarBrand>
      </NavbarContent>

      {pageTitle === "Altair" && (
        <>
          <NavbarContent
            className="hidden sm:flex basis-1/5 sm:basis-full"
            justify="end"
          >
            <NavbarItem className="hidden sm:flex gap-2">
              <Link
                isExternal
                aria-label="Github"
                href={siteConfig.links.github}
              >
                <GithubIcon className="text-default-500" />
              </Link>
              <ThemeSwitch />
            </NavbarItem>
          </NavbarContent>
          <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
            <Link isExternal aria-label="Github" href={siteConfig.links.github}>
              <GithubIcon className="text-default-500" />
            </Link>
            <ThemeSwitch />
            <NavbarMenuToggle />
          </NavbarContent>
        </>
      )}
    </HeroUINavbar>
  );
};
