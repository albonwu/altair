import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import NextLink from "next/link";
import { Folder, FileText } from "lucide-react";

export default function PathBreadcrumbs({ segments }: { segments: string[] }) {
  if (segments.length === 0) return null;

  return (
    <Breadcrumbs className="text-[#cdd6f4] flex items-center">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");

        // ✅ Determine icon type (Folder for directories, File for last item)
        const isLast = index === segments.length - 1;
        const Icon = isLast ? FileText : Folder;

        return (
          <BreadcrumbItem key={href} className="flex items-center gap-1">
            <Icon size={16} className="text-default-500" />
            <NextLink href={href} className="hover:underline">
              {segment}
            </NextLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
}

