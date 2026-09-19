import type { CreateTicketInput } from "@/features/tickets/schema";

export type CreateTicketState = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof CreateTicketInput, string[]>>;
};

export const initialCreateTicketState: CreateTicketState = {
  success: false,
};
