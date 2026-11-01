"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Vote = -1 | 0 | 1;

export default function ReactionButtons({
  articleId,
  initialLikes,
  initialDislikes,
}: {
  articleId: number;
  initialLikes: number;
  initialDislikes: number;
}) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vote>(0);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [busy, setBusy] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVote() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;
        if (cancelled) return;

        const user = data.user;
        setUserId(user?.id ?? null);

        if (user) {
          const { data: reaction, error: reactionError } =
            await supabase
              .from("reactions")
              .select("value")
              .eq("user_id", user.id)
              .eq("article_id", articleId)
              .maybeSingle();

          if (reactionError) throw reactionError;

          if (!cancelled) {
            setSelected((reaction?.value ?? 0) as Vote);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorText(
            error instanceof Error ? error.message : "Ошибка загрузки"
          );
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    loadVote();

    return () => {
      cancelled = true;
    };
  }, [articleId, supabase]);

  async function vote(choice: 1 | -1) {
    if (!userId) {
      router.push(`/login?next=/article/${articleId}`);
      return;
    }

    if (busy) return;

    setBusy(true);
    setErrorText("");

    const nextValue: Vote = selected === choice ? 0 : choice;

    try {
      if (nextValue === 0) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("user_id", userId)
          .eq("article_id", articleId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reactions")
          .upsert(
            {
              user_id: userId,
              article_id: articleId,
              value: nextValue,
            },
            {
              onConflict: "user_id,article_id",
            }
          );

        if (error) throw error;
      }

      setLikes((current) =>
        current +
        (nextValue === 1 ? 1 : 0) -
        (selected === 1 ? 1 : 0)
      );

      setDislikes((current) =>
        current +
        (nextValue === -1 ? 1 : 0) -
        (selected === -1 ? 1 : 0)
      );

      setSelected(nextValue);
      router.refresh();
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить оценку"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => vote(1)}
          disabled={busy}
          aria-pressed={selected === 1}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition active:scale-95 disabled:opacity-60 ${
            selected === 1
              ? "border-emerald-300 bg-emerald-100 text-emerald-800"
              : "border-white/70 bg-white/65 text-neutral-800"
          }`}
        >
          👍 Полезно · {likes}
        </button>

        <button
          type="button"
          onClick={() => vote(-1)}
          disabled={busy}
          aria-pressed={selected === -1}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition active:scale-95 disabled:opacity-60 ${
            selected === -1
              ? "border-red-300 bg-red-100 text-red-800"
              : "border-white/70 bg-white/65 text-neutral-800"
          }`}
        >
          👎 Не полезно · {dislikes}
        </button>
      </div>

      {errorText && (
        <p className="mt-3 text-sm text-red-700">
          Ошибка: {errorText}
        </p>
      )}
    </div>
  );
}

