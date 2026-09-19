import { getTranslations } from "next-intl/server";

import { CreateTicketDialog } from "@/features/tickets/components/create-ticket-dialog";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import { TicketFilters } from "@/features/tickets/components/ticket-filters";
import { parseTicketFilters } from "@/features/tickets/schema";
import { getTickets } from "@/features/tickets/server/queries";

export default async function Home({ searchParams }: PageProps<"/">) {
  const filters = parseTicketFilters(await searchParams);

  const [t, tFilters, ticketList] = await Promise.all([
    getTranslations("tickets.page"),
    getTranslations("tickets.filters"),
    getTickets(filters),
  ]);

  const hasActiveFilters =
    filters.q !== "" ||
    filters.status.length > 0 ||
    filters.priorities.length > 0;

  return (
    <main className="flex flex-1 bg-muted/40 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-3xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <CreateTicketDialog />
        </header>

        <TicketFilters
          key={[
            filters.q,
            filters.status.join(","),
            filters.priorities.join(","),
            filters.sort,
          ].join("-")}
          {...filters}
        />

        <div className="mt-6 space-y-3">
          {ticketList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? tFilters("noMatches") : tFilters("empty")}
            </p>
          ) : (
            ticketList.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
