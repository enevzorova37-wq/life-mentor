"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function ArticleCover({
  filePath,
  title,
  large = false,
}: {
  filePath: string | null;
  title: string;
  large?: boolean;
}) {
  const [supabase] = useState(() => createClient());
  const [failed, setFailed] = useState(false);

  // Ссылку на фото строит сам Supabase
  const imageUrl = filePath
    ? supabase.storage.from("articles-images").getPublicUrl(filePath).data.publicUrl
    : null;

  const size = large
    ? "aspect-[16/9] max-h-[520px]"
    : "aspect-[16/10] md:aspect-[4/3]";

  return (
    <div className={"relative w-full overflow-hidden bg-white/30 " + size}>
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={title}
          loading={large ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-200 to-neutral-400 text-neutral-600">
          <span className="text-4xl">📄</span>
          <span className="px-4 text-center text-sm">
            Без фотографии
          </span>
        </div>
      )}
    </div>
  );
}



