import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type FileType = "dir" | "file";
export interface FileEntry {
  name: string;
  type: "file";
}
export interface DirEntry {
  name: string;
  type: "dir";
  children: [
    {
      name: string;
      type: FileType;
    },
  ];
}
export interface Filetree {
  [key: string]: FileEntry | DirEntry;
  string: FileEntry | DirEntry;
}

export interface NodeArguments {
  name: string;
  type: FileType;
  onClick: any;
  active: boolean;
  className: string;
}

export interface FileMetadata {
  loc: number;
  commits: number;
  code: string;
}
