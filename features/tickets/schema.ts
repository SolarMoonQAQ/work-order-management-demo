import { z } from "zod";

import {
  TICKET_PRIORITIES,
  TICKET_SORTS,
  TICKET_STATUSES,
} from "@/features/tickets/constants";

function toArray(value: unknown) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

const ticketFilterSearchParamsSchema = z.object({
  q: z.string().trim().max(100).catch(""),

  status: z.preprocess(toArray, z.array(z.enum(TICKET_STATUSES))).catch([]),

  priorities: z
    .preprocess(toArray, z.array(z.enum(TICKET_PRIORITIES)))
    .catch([]),

  sort: z.enum(TICKET_SORTS).catch("updated_desc"),
});

export type TicketFilterValues = z.infer<typeof ticketFilterSearchParamsSchema>;

export function parseTicketFilters(input: unknown): TicketFilterValues {
  return ticketFilterSearchParamsSchema.parse(input);
}

type CreateTicketValidationMessages = {
  titleRequired: string;
  titleMin: string;
  companyNameRequired: string;
  customerNameRequired: string;
  descriptionRequired: string;
  priorityRequired: string;
  assigneeRequired: string;
};

export function createTicketSchema(messages: CreateTicketValidationMessages) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, messages.titleRequired)
      .min(5, messages.titleMin),

    companyName: z.string().trim().min(1, messages.companyNameRequired),

    customerName: z.string().trim().min(1, messages.customerNameRequired),

    description: z.string().trim().min(1, messages.descriptionRequired),

    priority: z.enum(TICKET_PRIORITIES, {
      error: messages.priorityRequired,
    }),

    assigneeName: z.string().trim().min(1, messages.assigneeRequired),
  });
}

export type CreateTicketInput = z.infer<ReturnType<typeof createTicketSchema>>;

type UpdateTicketValidationMessages = {
  ticketIdInvalid: string;
  statusRequired: string;
  priorityRequired: string;
  assigneeRequired: string;
  noteMax: string;
};

export function updateTicketSchema(messages: UpdateTicketValidationMessages) {
  return z.object({
    ticketId: z.uuid(messages.ticketIdInvalid),
    status: z.enum(TICKET_STATUSES, {
      error: messages.statusRequired,
    }),
    priority: z.enum(TICKET_PRIORITIES, {
      error: messages.priorityRequired,
    }),
    assigneeName: z.string().trim().min(1, messages.assigneeRequired),
    note: z.string().trim().max(1000, messages.noteMax),
  });
}

export type UpdateTicketInput = z.infer<ReturnType<typeof updateTicketSchema>>;

export type UpdateTicketFields = Omit<UpdateTicketInput, "ticketId">;
