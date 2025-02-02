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

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  GithubIcon,
} from "@/components/icons";
import PathBreadcrumbs from "@/components/PathBreadcrumbs"

import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";

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
        <NavbarContent className="basis-1/5 sm:basis-full mt-[5rem]" justify="start">
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

  if (clientPath === '/') {
    pageTitle = "Altair";
  } else if (clientPath === '/explorer') {
    pageTitle = "Explorer";
  } else {
    splitPathname = ['/', ...clientPath.split("/").slice(2)];  // remove prefix and 'file'
    pageTitle = splitPathname[splitPathname.length - 1];
    isFile = true;
  pageTitle = "albonwu/cascade"  // hardcoded for now
  }


  return (
    <HeroUINavbar maxWidth="xl" className="p-4">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <p className="font-bold text-inherit text-3xl">{pageTitle}</p>
          <br />
          {isFile && <PathBreadcrumbs segments={splitPathname}/>}
        </NavbarBrand>
      </NavbarContent>

      {pageTitle === "wayne" && (
        <>
          <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
            <NavbarItem className="hidden sm:flex gap-2">
              <Link isExternal aria-label="Github" href={siteConfig.links.github}>
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

