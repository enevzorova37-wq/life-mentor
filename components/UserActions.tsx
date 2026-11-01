"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function UserActions() {
  const [supabase] = useState(() => createClient());
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setLoggedIn(Boolean(data.user));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/favorites"
        title="Избранное"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/65 text-xl shadow-sm backdrop-blur-xl transition hover:scale-105"
      >
        ☆
      </Link>

      <Link
        href={loggedIn ? "/profile" : "/login"}
        className="flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/65 px-4 text-sm font-medium shadow-sm backdrop-blur-xl transition hover:scale-105"
      >
        {loggedIn === null
          ? "•••"
          : loggedIn
          ? "👤 Профиль"
          : "Войти"}
      </Link>
    </div>
  );
}