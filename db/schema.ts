import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import {TICKET_PRIORITIES, TICKET_STATUSES} from "@/features/tickets/constants";

export const ticketStatusEnum = pgEnum("ticket_status", TICKET_STATUSES);

export const ticketPriorityEnum = pgEnum("ticket_priority", TICKET_PRIORITIES);

export const tickets = pgTable("tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    companyName: text("company_name").notNull(),
    customerName: text("customer_name").notNull(),
    description: text("description").notNull(),
    priority: ticketPriorityEnum("priority").notNull(),
    status: ticketStatusEnum("status").default("PENDING").notNull(),
    assigneeName: text("assignee_name").notNull(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});

export const ticketNotes = pgTable("ticket_notes", {
    id: uuid("id").defaultRandom().primaryKey(),

    ticketId: uuid("ticket_id")
        .notNull()
        .references(() => tickets.id, {
            onDelete: "cascade",
        }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});