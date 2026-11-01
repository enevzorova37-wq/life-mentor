"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// useSearchParams требует Suspense, иначе next build падает на /login
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const searchParams = useSearchParams();

  // Разрешаем переход только внутри сайта
  const nextParam = searchParams.get("next") || "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }

      setMessage(
        "Аккаунт создан. Если Supabase попросит подтверждение, открой письмо на своей почте."
      );

      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Неверная почта или пароль.");
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d9d9dc] px-4 py-8">

      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-5 inline-flex rounded-full border border-white/70 bg-white/50 px-5 py-3 text-sm font-medium shadow-md backdrop-blur-2xl"
        >
          ← На главную
        </Link>

        <div className="rounded-[36px] border border-white/70 bg-white/50 p-6 shadow-2xl backdrop-blur-2xl md:p-8">

          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">
            LIFE MENTOR
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {mode === "login" ? "С возвращением" : "Создать аккаунт"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {mode === "login"
              ? "Войдите, чтобы сохранять статьи и свои реакции."
              : "Регистрация нужна для избранного, лайков и дизлайков."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-[20px] border border-white/70 bg-white/40 p-1">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className={`rounded-[16px] px-4 py-3 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white shadow"
                  : "text-neutral-500"
              }`}
            >
              Войти
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
              className={`rounded-[16px] px-4 py-3 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-white shadow"
                  : "text-neutral-500"
              }`}
            >
              Регистрация
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-3"
          >

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Электронная почта"
              className="w-full rounded-[20px] border border-white/70 bg-white/60 px-5 py-4 outline-none transition focus:bg-white/80"
            />

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль — минимум 6 символов"
              className="w-full rounded-[20px] border border-white/70 bg-white/60 px-5 py-4 outline-none transition focus:bg-white/80"
            />

            {error && (
              <div className="rounded-[18px] bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-[18px] bg-white/60 px-4 py-3 text-sm leading-5 text-neutral-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[20px] bg-neutral-900 px-6 py-4 font-medium text-white shadow-lg transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading
                ? "Подождите..."
                : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
            </button>

          </form>

          <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
            Аккаунт позволит сохранять избранные статьи и ваши оценки.
          </p>

        </div>
      </div>
    </main>
  );
}



