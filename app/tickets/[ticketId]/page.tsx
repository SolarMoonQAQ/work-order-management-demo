import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketEditForm } from "@/features/tickets/components/ticket-edit-form";
import {
  getTicketById,
  getTicketNotes,
} from "@/features/tickets/server/queries";

const ticketIdSchema = z.uuid();

export default async function TicketDetailPage({
  params,
}: PageProps<"/tickets/[ticketId]">) {
  const { ticketId } = await params;

  if (!ticketIdSchema.safeParse(ticketId).success) {
    notFound();
  }

  const [ticket, notes, t, tPriority, tStatus, format] = await Promise.all([
    getTicketById(ticketId),
    getTicketNotes(ticketId),
    getTranslations("tickets.detail"),
    getTranslations("tickets.priority"),
    getTranslations("tickets.status"),
    getFormatter(),
  ]);

  if (!ticket) {
    notFound();
  }

  const formatDateTime = (value: Date) =>
    format.dateTime(value, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Shanghai",
    });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Button variant="ghost" render={<Link href="/" />} nativeButton={false}>
        <ArrowLeft data-icon="inline-start" />
        {t("back")}
      </Button>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{ticket.title}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <section aria-labelledby="ticket-information-heading">
            <h2 id="ticket-information-heading" className="mb-4 font-medium">
              {t("information")}
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.companyName")}
                </dt>
                <dd className="mt-1">{ticket.companyName}</dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.customerName")}
                </dt>
                <dd className="mt-1">{ticket.customerName}</dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.status")}
                </dt>
                <dd className="mt-1">
                  <Badge variant="secondary">{tStatus(ticket.status)}</Badge>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.priority")}
                </dt>
                <dd className="mt-1">
                  <Badge variant="outline">{tPriority(ticket.priority)}</Badge>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.assigneeName")}
                </dt>
                <dd className="mt-1">{ticket.assigneeName}</dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.createdAt")}
                </dt>
                <dd className="mt-1">
                  <time dateTime={ticket.createdAt.toISOString()}>
                    {formatDateTime(ticket.createdAt)}
                  </time>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("fields.updatedAt")}
                </dt>
                <dd className="mt-1">
                  <time dateTime={ticket.updatedAt.toISOString()}>
                    {formatDateTime(ticket.updatedAt)}
                  </time>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">
                  {t("fields.description")}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {ticket.description}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="ticket-notes-heading"
            className="space-y-4 border-t pt-6"
          >
            <div>
              <h2 id="ticket-notes-heading" className="font-medium">
                {t("notes.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("notes.description")}
              </p>
            </div>

            {notes.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t("notes.empty")}
              </p>
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <time
                      dateTime={note.createdAt.toISOString()}
                      className="mt-2 block text-xs text-muted-foreground"
                    >
                      {formatDateTime(note.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>

        <CardFooter className="block">
          <section aria-labelledby="ticket-edit-heading">
            <div className="mb-4">
              <h2 id="ticket-edit-heading" className="font-medium">
                {t("edit.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("edit.description")}
              </p>
            </div>

            <TicketEditForm ticket={ticket} className="w-full" />
          </section>
        </CardFooter>
      </Card>
    </main>
  );
}
