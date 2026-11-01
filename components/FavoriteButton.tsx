"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function FavoriteButton({
  articleId,
}: {
  articleId: number;
}) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function checkFavorite() {
      setLoading(true);
      setErrorText("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorText(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("favorites")
        .select("article_id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();

      if (error) {
        setErrorText(error.message);
      }

      setSaved(Boolean(data));
      setLoading(false);
    }

    checkFavorite();
  }, [articleId, supabase]);

  async function toggleFavorite() {
    setErrorText("");

    if (!userId) {
      router.push(`/login?next=/article/${articleId}`);
      return;
    }

    setLoading(true);

    if (saved) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("article_id", articleId);

      if (error) {
        setErrorText(error.message);
        setLoading(false);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: userId,
          article_id: articleId,
        });

      if (error) {
        setErrorText(error.message);
        setLoading(false);
        return;
      }

      setSaved(true);
    }

    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        className="rounded-full border border-white/70 bg-white/60 px-5 py-3 backdrop-blur-xl transition hover:scale-105 disabled:opacity-50"
      >
        {loading
          ? "..."
          : saved
          ? "★ Сохранено"
          : "☆ Сохранить"}
      </button>

      {errorText && (
        <p className="mt-2 max-w-sm text-sm text-red-600">
          Ошибка: {errorText}
        </p>
      )}
    </div>
  );
}


