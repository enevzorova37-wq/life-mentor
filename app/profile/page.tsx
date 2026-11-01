"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ProfilePage() {
  const [supabase] = useState(() => createClient());

  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/profile");
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#d9d9dc]">
        Загрузка...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d9d9dc] px-4 py-6">

      <div className="mx-auto max-w-xl">

        <Link
          href="/"
          className="inline-flex rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-medium shadow-md backdrop-blur-2xl"
        >
          ← Главная
        </Link>

        <div className="mt-5 rounded-[36px] border border-white/70 bg-white/50 p-7 shadow-2xl backdrop-blur-2xl">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-3xl shadow-lg">
            👤
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-neutral-500">
            ПРОФИЛЬ
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            {profile?.display_name ||
              profile?.username ||
              "Пользователь"}
          </h1>

          <p className="mt-2 text-neutral-600">
            {user?.email}
          </p>

          <div className="mt-8 grid gap-3">

            <Link
              href="/favorites"
              className="rounded-[20px] border border-white/70 bg-white/60 px-5 py-4 font-medium shadow-sm"
            >
              ★ Моё избранное
            </Link>

            <button
              type="button"
              onClick={logout}
              className="rounded-[20px] bg-neutral-900 px-5 py-4 font-medium text-white"
            >
              Выйти из аккаунта
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}


