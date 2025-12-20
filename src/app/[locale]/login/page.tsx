"use client";

import { authenticate } from "@/lib/actions";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function LoginButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("login");

  return (
    <button
      type="submit"
      className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-3.5 py-4 text-center text-sm font-bold text-black shadow-lg shadow-primary/20 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      aria-disabled={pending}
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : t("submit")}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  const t = useTranslations("login");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-12 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold leading-9 tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted font-medium">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form action={dispatch} className="space-y-6 bg-accent/10 p-8 rounded-3xl border border-border">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold leading-6 text-foreground"
            >
              {t("emailLabel")}
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border-0 bg-background py-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-4 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-semibold leading-6 text-foreground"
              >
                {t("passwordLabel")}
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border-0 bg-background py-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-4 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <LoginButton />
          </div>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <p className="text-sm font-medium text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
