import type { UpdateTicketFields } from "@/features/tickets/schema";

export type UpdateTicketState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof UpdateTicketFields, string[]>>;
};

export const initialUpdateTicketState: UpdateTicketState = {
  success: false,
};
