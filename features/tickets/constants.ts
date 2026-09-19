export const TICKET_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type Priority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_SORTS = ["updated_desc", "priority_desc"] as const;

export type TicketSort = (typeof TICKET_SORTS)[number];
