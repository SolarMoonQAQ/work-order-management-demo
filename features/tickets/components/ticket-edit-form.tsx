"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import type { UpdateTicketState } from "@/features/tickets/actions/update-ticket-state";
import { initialUpdateTicketState } from "@/features/tickets/actions/update-ticket-state";
import { updateTicket } from "@/features/tickets/actions/update-ticket";
import {
  type Priority,
  TICKET_PRIORITIES,
  type TicketStatus,
  TICKET_STATUSES,
} from "@/features/tickets/constants";
import type { Ticket } from "@/features/tickets/types";
import { cn } from "@/lib/utils";

type TicketEditFormProps = {
  ticket: Ticket;
  className?: string;
};

export function TicketEditForm({ ticket, className }: TicketEditFormProps) {
  const t = useTranslations("tickets.detail.edit");
  const tPriority = useTranslations("tickets.priority");
  const tStatus = useTranslations("tickets.status");
  const successMessage = t("success");
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [assigneeName, setAssigneeName] = useState(ticket.assigneeName);
  const [note, setNote] = useState("");

  const [state, formAction, pending] = useActionState(
    async (
      previousState: UpdateTicketState,
      formData: FormData,
    ): Promise<UpdateTicketState> => {
      const nextState = await updateTicket(previousState, formData);

      if (nextState.success) {
        setNote("");
        toast.add({
          type: "success",
          title: nextState.message ?? successMessage,
        });
      }

      return nextState;
    },
    initialUpdateTicketState,
  );

  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      <input type="hidden" name="ticketId" value={ticket.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(state.fieldErrors?.status)}>
          <FieldLabel htmlFor="status">{t("fields.status")}</FieldLabel>

          <Select
            name="status"
            value={status}
            onValueChange={(value) => {
              if (value) {
                setStatus(value);
              }
            }}
            required
          >
            <SelectTrigger
              id="status"
              className="w-full"
              aria-invalid={Boolean(state.fieldErrors?.status)}
            >
              <SelectValue>
                {(value: TicketStatus | null) =>
                  value ? tStatus(value) : t("placeholders.status")
                }
              </SelectValue>
            </SelectTrigger>

            <SelectContent align="start" alignItemWithTrigger={false}>
              {TICKET_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError>{state.fieldErrors?.status?.[0]}</FieldError>
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors?.priority)}>
          <FieldLabel htmlFor="priority">{t("fields.priority")}</FieldLabel>

          <Select
            name="priority"
            value={priority}
            onValueChange={(value) => {
              if (value) {
                setPriority(value);
              }
            }}
            required
          >
            <SelectTrigger
              id="priority"
              className="w-full"
              aria-invalid={Boolean(state.fieldErrors?.priority)}
            >
              <SelectValue>
                {(value: Priority | null) =>
                  value ? tPriority(value) : t("placeholders.priority")
                }
              </SelectValue>
            </SelectTrigger>

            <SelectContent align="start" alignItemWithTrigger={false}>
              {TICKET_PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {tPriority(priority)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError>{state.fieldErrors?.priority?.[0]}</FieldError>
        </Field>
      </div>

      <Field data-invalid={Boolean(state.fieldErrors?.assigneeName)}>
        <FieldLabel htmlFor="assigneeName">
          {t("fields.assigneeName")}
        </FieldLabel>

        <Input
          id="assigneeName"
          name="assigneeName"
          value={assigneeName}
          onChange={(event) => setAssigneeName(event.target.value)}
          required
          aria-invalid={Boolean(state.fieldErrors?.assigneeName)}
        />

        <FieldError>{state.fieldErrors?.assigneeName?.[0]}</FieldError>
      </Field>

      <Field data-invalid={Boolean(state.fieldErrors?.note)}>
        <FieldLabel htmlFor="note">{t("fields.note")}</FieldLabel>

        <Textarea
          id="note"
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("placeholders.note")}
          className="min-h-24"
          maxLength={1000}
          aria-invalid={Boolean(state.fieldErrors?.note)}
        />

        <FieldError>{state.fieldErrors?.note?.[0]}</FieldError>
      </Field>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm text-destructive">
          {!state.success ? state.message : null}
        </p>

        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
