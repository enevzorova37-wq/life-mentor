import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import ArticleCover from "@/components/ArticleCover";
import ReactionButtons from "@/components/ReactionButtons";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    q?: string;
    sort?: string;
    rating?: string;
  }>;
};

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { id } = await params;
  const filters = await searchParams;

  // Получаем статью и её оценки из Supabase

  const { data: article, error } = await supabase
    .from("article_feed")
    .select(`
      id,
      title,
      content,
      published_at,
      image_path,
      likes,
      dislikes,
      score
    `)
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  // Сохраняем поиск и фильтры при возврате

  const returnParams = new URLSearchParams();

  if (filters.q) {
    returnParams.set("q", filters.q);
  }

  if (filters.sort) {
    returnParams.set("sort", filters.sort);
  }

  if (filters.rating) {
    returnParams.set("rating", filters.rating);
  }

  const query = returnParams.toString();

  const backUrl = query ? `/?${query}` : "/";

  // Убираем повтор названия в начале текста

  const content = article.content ?? "";

  const body =
    content.startsWith(article.title)
      ? content
          .slice(article.title.length)
          .trimStart()
      : content;

  return (
    <main className="min-h-screen bg-[#d9d9dc] px-3 py-4 text-neutral-900 md:px-8 md:py-8">

      <div className="mx-auto max-w-3xl">

        {/* ВЕРХНЯЯ СТЕКЛЯННАЯ ПАНЕЛЬ */}

        <nav className="sticky top-2 z-30 mb-5 flex items-center justify-between gap-2 rounded-full border border-white/70 bg-white/60 p-2 shadow-lg backdrop-blur-2xl">

          <Link
            href={backUrl}
            className="rounded-full bg-white/70 px-4 py-3 text-sm font-medium transition hover:bg-white/90"
          >
            ← Назад
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/favorites"
              title="Моё избранное"
              className="flex h-11 items-center justify-center rounded-full bg-white/70 px-3 text-sm font-medium transition hover:bg-white/90 sm:px-4"
            >
              ☆ Избранное
            </Link>

            <Link
              href="/profile"
              title="Мой профиль"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-xl transition hover:bg-white/90"
            >
              👤
            </Link>

          </div>

        </nav>

        {/* ОСНОВНАЯ КАРТОЧКА СТАТЬИ */}

        <article className="overflow-hidden rounded-[30px] border border-white/70 bg-white/55 shadow-xl backdrop-blur-2xl md:rounded-[36px]">

          {/* ФОТОГРАФИЯ */}

          <ArticleCover
            filePath={article.image_path}
            title={article.title}
            large
          />

          {/* СОДЕРЖИМОЕ */}

          <div className="p-5 md:p-10">

            {/* ДАТА */}

            <p className="text-sm text-neutral-500">
              {article.published_at
                ? new Date(
                    article.published_at
                  ).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </p>

            {/* НАЗВАНИЕ */}

            <h1 className="mt-3 break-words text-2xl font-semibold leading-tight tracking-tight md:text-4xl">
              {article.title}
            </h1>

            {/* ПОЛНЫЙ ТЕКСТ */}

            <div className="mt-7 whitespace-pre-wrap break-words text-[16px] leading-7 text-neutral-800 md:text-lg md:leading-9">
              {body}
            </div>

            {/* РЕАКЦИИ */}

            <section className="mt-10 border-t border-black/10 pt-6">

              <h2 className="mb-4 text-lg font-semibold">
                Эта статья была полезной?
              </h2>

              <ReactionButtons
                articleId={article.id}
                initialLikes={article.likes ?? 0}
                initialDislikes={article.dislikes ?? 0}
              />

              {/* ДОБАВЛЕНИЕ В ИЗБРАННОЕ */}

              <div className="mt-5">
                <FavoriteButton
                  articleId={article.id}
                />
              </div>

            </section>

          </div>

        </article>

        {/* НИЖНЯЯ НАВИГАЦИЯ */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

          <Link
            href={backUrl}
            className="rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm font-medium shadow-md backdrop-blur-xl transition hover:bg-white/80"
          >
            ← Вернуться к статьям
          </Link>

          <Link
            href="/favorites"
            className="rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm font-medium shadow-md backdrop-blur-xl transition hover:bg-white/80"
          >
            ☆ Моё избранное
          </Link>

        </div>

      </div>

    </main>
  );
}


