import Link from "next/link";
import { supabase } from "@/lib/supabase";
import UserActions from "@/components/UserActions";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const sort = params.sort === "old" ? "old" : "new";

  let request = supabase
    .from("articles")
    .select(`
      id,
      title,
      published_at,
      article_images (
        file_path
      )
    `);

  if (q) {
    const safeQuery = q.replace(/[,%()]/g, " ");

    request = request.or(
      `title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`
    );
  }

  const { data: articles, error } = await request
    .order("published_at", {
      ascending: sort === "old",
    })
    .limit(2000);

  if (error) {
    return (
      <main className="min-h-screen bg-[#d9d9dc] p-6">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-xl backdrop-blur-2xl">
          <h1 className="text-xl font-semibold">
            Ошибка подключения
          </h1>

          <p className="mt-3 text-neutral-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d9d9dc] px-3 py-3 text-neutral-900 sm:px-4 md:px-8 md:py-8">

      <div className="mx-auto max-w-7xl">

        {/* МАЛЕНЬКАЯ ПЛАВАЮЩАЯ ПАНЕЛЬ */}

        <nav className="sticky top-2 z-30 mb-4 flex items-center justify-between rounded-full border border-white/70 bg-white/55 px-4 py-2.5 shadow-lg backdrop-blur-2xl md:top-4 md:px-5">

          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.14em] text-neutral-700"
          >
            LIFE MENTOR
          </Link>

          <UserActions />

        </nav>


        {/* ГЛАВНЫЙ БЛОК — БОЛЬШЕ НЕ STICKY */}

        <header className="mb-5 rounded-[28px] border border-white/60 bg-white/45 p-5 shadow-xl backdrop-blur-2xl md:mb-8 md:rounded-[34px] md:p-8">

          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
              НАСТАВНИК ПО ЖИЗНИ
            </p>

            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Что вам нужно узнать?
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 md:text-base">
              Простые ответы на повседневные жизненные вопросы
            </p>
          </div>


          {/* ПОИСК */}

          <form
            action="/"
            method="GET"
            className="mt-5 grid gap-2.5 md:grid-cols-[1fr_auto_auto]"
          >

            <div className="flex min-h-12 items-center rounded-[18px] border border-white/70 bg-white/65 px-4 shadow-sm backdrop-blur-xl md:rounded-[22px]">

              <span className="mr-2.5">
                🔍
              </span>

              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Например: как снять квартиру"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-[15px] outline-none placeholder:text-neutral-400 md:text-base"
              />

            </div>


            <select
              name="sort"
              defaultValue={sort}
              className="min-h-12 rounded-[18px] border border-white/70 bg-white/65 px-4 py-3 text-[15px] outline-none backdrop-blur-xl md:rounded-[22px]"
            >
              <option value="new">
                Сначала новые
              </option>

              <option value="old">
                Сначала старые
              </option>
            </select>


            <button
              type="submit"
              className="min-h-12 rounded-[18px] bg-neutral-900 px-6 py-3 font-medium text-white shadow-md transition active:scale-[0.98] md:rounded-[22px]"
            >
              Найти
            </button>

          </form>


          {q && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">

              <span>
                Поиск:{" "}
                <strong className="text-neutral-900">
                  {q}
                </strong>
              </span>

              <Link
                href="/"
                className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 backdrop-blur-xl"
              >
                Сбросить
              </Link>

            </div>
          )}

        </header>


        {/* КАРТОЧКИ */}

        {articles && articles.length > 0 ? (

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {articles.map((article) => {

              const image =
                article.article_images?.[0]?.file_path;

              const imageUrl = image
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/articles-images/${image}`
                : null;

              return (

                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group block overflow-hidden rounded-[24px] border border-white/60 bg-white/45 shadow-md backdrop-blur-2xl transition duration-300 active:scale-[0.99] md:rounded-[28px] md:hover:-translate-y-1 md:hover:shadow-xl"
                >

                  {imageUrl ? (

                    <div className="overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={article.title}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition duration-500 md:aspect-[4/3] md:group-hover:scale-[1.03]"
                      />
                    </div>

                  ) : (

                    <div className="aspect-[16/10] w-full bg-white/30 md:aspect-[4/3]" />

                  )}


                  <div className="p-4 md:p-5">

                    <h2 className="text-base font-semibold leading-snug md:text-lg">
                      {article.title}
                    </h2>

                    <div className="mt-4 flex items-center justify-between">

                      <p className="text-xs text-neutral-500 md:text-sm">
                        {article.published_at
                          ? new Date(
                              article.published_at
                            ).toLocaleDateString("ru-RU")
                          : ""}
                      </p>

                      <span className="text-lg text-neutral-500">
                        →
                      </span>

                    </div>

                  </div>

                </Link>
              );
            })}

          </section>

        ) : (

          <div className="rounded-[28px] border border-white/60 bg-white/45 p-8 text-center shadow-lg backdrop-blur-2xl">

            <div className="text-4xl">
              🔎
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              Ничего не найдено
            </h2>

            <p className="mt-2 text-neutral-600">
              Попробуйте изменить запрос.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-neutral-900 px-6 py-3 text-white"
            >
              Показать все статьи
            </Link>

          </div>

        )}

      </div>

    </main>
  );
}