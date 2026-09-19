import Link from "next/link";

import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function TicketNotFound() {
  const t = await getTranslations("tickets.detail.notFound");

  return (
    <main className="flex min-h-96 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button render={<Link href="/" />}>{t("back")}</Button>
    </main>
  );
}
