"use client";

import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";

export default function PathBreadcrumbs({ data }: { data: { title: string; description: string } }) {
    return (
    <Breadcrumbs size="lg">
      <BreadcrumbItem>Home</BreadcrumbItem>
      <BreadcrumbItem>Music</BreadcrumbItem>
      <BreadcrumbItem>Artist</BreadcrumbItem>
      <BreadcrumbItem>Album</BreadcrumbItem>
      <BreadcrumbItem>Song</BreadcrumbItem>
    </Breadcrumbs>);

}
