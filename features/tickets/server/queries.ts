import "server-only";

import { and, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { ticketNotes, tickets } from "@/db/schema";
import type { TicketFilterValues } from "@/features/tickets/schema";

export async function getTickets(filters: TicketFilterValues) {
  const conditions: SQL[] = [];

  if (filters.q) {
    const keywords = filters.q.split(/\s+/).filter(Boolean).slice(0, 10);

    for (const keyword of keywords) {
      const pattern = `%${keyword}%`;
      const keywordCondition = or(
        ilike(tickets.title, pattern),
        ilike(tickets.customerName, pattern),
      );

      if (keywordCondition) {
        conditions.push(keywordCondition);
      }
    }
  }

  if (filters.status.length > 0) {
    conditions.push(inArray(tickets.status, filters.status));
  }

  if (filters.priorities.length > 0) {
    conditions.push(inArray(tickets.priority, filters.priorities));
  }

  const orderBy =
    filters.sort === "priority_desc"
      ? desc(tickets.priority)
      : desc(tickets.updatedAt);

  return db
    .select()
    .from(tickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy);
}

export async function getTicketById(ticketId: string) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  return ticket ?? null;
}

export async function getTicketNotes(ticketId: string) {
  return db
    .select()
    .from(ticketNotes)
    .where(eq(ticketNotes.ticketId, ticketId))
    .orderBy(desc(ticketNotes.createdAt));
}
