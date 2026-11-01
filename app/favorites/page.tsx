"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import ArticleCover from "@/components/ArticleCover";

type FavoriteArticle = {
  id: number;
  title: string;
  published_at: string | null;
  image_path: string | null;
};

export default function FavoritesPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [articles, setArticles] = useState<FavoriteArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/favorites");
        return;
      }

      setUserId(user.id);

      // Получаем сохранённые статьи
      const { data: favorites, error: favoritesError } =
        await supabase
          .from("favorites")
          .select("article_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (favoritesError) {
        setErrorText(favoritesError.message);
        setLoading(false);
        return;
      }

      const ids = (favorites ?? []).map(
        (item) => item.article_id
      );

      if (ids.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      // Получаем статьи вместе с фотографиями
      // Точно так же, как на главной странице
      const { data, error } = await supabase
        .from("article_feed")
        .select("id, title, published_at, image_path")
        .in("id", ids);

      if (error) {
        setErrorText(error.message);
        setLoading(false);
        return;
      }

      // Сохраняем порядок добавления в избранное
      const articleMap = new Map(
        (data ?? []).map((article) => [
          article.id,
          article,
        ])
      );

      const sorted = ids
        .map((id) => articleMap.get(id))
        .filter((article) => article !== undefined);

      setArticles(sorted);
      setLoading(false);
    }

    loadFavorites();
  }, [router, supabase]);

  async function removeFavorite(articleId: number) {
    if (!userId) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);

    if (error) {
      setErrorText(error.message);
      return;
    }

    setArticles((current) =>
      current.filter((article) => article.id !== articleId)
    );
  }

  return (
    <main className="min-h-screen bg-[#d9d9dc] px-3 py-5 text-neutral-900 md:px-8">
      <div className="mx-auto max-w-6xl">

        <nav className="mb-6 flex items-center justify-between rounded-full border border-white/70 bg-white/60 p-2 shadow-lg backdrop-blur-2xl">
          <Link
            href="/"
            className="rounded-full bg-white/70 px-5 py-3 text-sm"
          >
            ← Главная
          </Link>

          <Link
            href="/profile"
            className="rounded-full bg-white/70 px-5 py-3 text-sm"
          >
            👤 Профиль
          </Link>
        </nav>

        <header className="mb-6 rounded-[30px] border border-white/70 bg-white/55 p-6 shadow-xl backdrop-blur-2xl">
          <p className="text-xs tracking-widest text-neutral-500">
            LIFE MENTOR
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Моё избранное
          </h1>

          <p className="mt-2 text-neutral-600">
            Сохранённые статьи и полезные советы
          </p>
        </header>

        {loading && (
          <p className="p-6 text-center">
            Загружаем статьи...
          </p>
        )}

        {errorText && (
          <p className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            Ошибка: {errorText}
          </p>
        )}

        {!loading && articles.length === 0 && !errorText && (
          <div className="rounded-3xl bg-white/60 p-8 text-center">
            <h2 className="text-xl font-semibold">
              Пока ничего не сохранено
            </h2>

            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-3 text-white"
            >
              Смотреть статьи
            </Link>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="overflow-hidden rounded-[26px] border border-white/70 bg-white/55 shadow-lg backdrop-blur-2xl"
            >
              <Link
                href={`/article/${article.id}`}
                className="block"
              >
                <ArticleCover
                  filePath={article.image_path}
                  title={article.title}
                />

                <div className="p-5">
                  <h2 className="text-lg font-semibold">
                    {article.title}
                  </h2>

                  <p className="mt-3 text-sm text-neutral-500">
                    {article.published_at
                      ? new Date(
                          article.published_at
                        ).toLocaleDateString("ru-RU")
                      : ""}
                  </p>
                </div>
              </Link>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => removeFavorite(article.id)}
                  className="w-full rounded-full bg-white/75 px-4 py-3 text-sm font-medium transition active:scale-95"
                >
                  ★ Удалить из избранного
                </button>
              </div>
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}








