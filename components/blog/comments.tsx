"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const { theme } = useTheme();

  return (
    <div className="mt-16 pt-8 border-t">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>
      <Giscus
        id="comments"
        repo="sachincool/blogs" // TODO: Update with your repo
        repoId="R_kgDONdrLJQ" // TODO: Get from https://giscus.app
        category="Blog Comments"
        categoryId="DIC_kwDONdrLJc4ClaWu" // TODO: Get from https://giscus.app
        mapping="pathname"
        term={slug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "dark" ? "dark" : "light"}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}

