"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTicket } from "@/features/tickets/actions/create-ticket";
import { useActionState, useState } from "react";
import {
  type CreateTicketState,
  initialCreateTicketState,
} from "@/features/tickets/actions/create-ticket-state";
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
import { Priority, TICKET_PRIORITIES } from "@/features/tickets/constants";
import { toast } from "@/components/ui/toast";

type CreateTicketFormValues = {
  title: string;
  companyName: string;
  customerName: string;
  priority: Priority | null;
  assigneeName: string;
  description: string;
};

const INITIAL_CREATE_TICKET_VALUES: CreateTicketFormValues = {
  title: "",
  companyName: "",
  customerName: "",
  priority: null,
  assigneeName: "",
  description: "",
};

export function CreateTicketDialog() {
  const t = useTranslations("tickets.create");
  const tPriority = useTranslations("tickets.priority");

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateTicketFormValues>(
    INITIAL_CREATE_TICKET_VALUES,
  );
  const successMessage = t("success");

  function updateValue<Key extends keyof CreateTicketFormValues>(
    key: Key,
    value: CreateTicketFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  const [state, formAction, pending] = useActionState(
    async (
      previousState: CreateTicketState,
      formData: FormData,
    ): Promise<CreateTicketState> => {
      const nextState = await createTicket(previousState, formData);

      if (nextState.success) {
        setValues(INITIAL_CREATE_TICKET_VALUES);
        setOpen(false);

        toast.add({
          type: "success",
          title: nextState.message ?? successMessage,
        });
      }

      return nextState;
    },
    initialCreateTicketState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>{t("trigger")}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form id="create-ticket-form" action={formAction} className="space-y-4">
          <Field data-invalid={Boolean(state.fieldErrors?.title)}>
            <FieldLabel htmlFor="title">{t("fields.title")}</FieldLabel>

            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              aria-invalid={Boolean(state.fieldErrors?.title)}
            />

            <FieldError>{state.fieldErrors?.title?.[0]}</FieldError>
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.companyName)}>
            <FieldLabel htmlFor="companyName">
              {t("fields.companyName")}
            </FieldLabel>

            <Input
              id="companyName"
              name="companyName"
              value={values.companyName}
              onChange={(event) =>
                updateValue("companyName", event.target.value)
              }
              aria-invalid={Boolean(state.fieldErrors?.companyName)}
            />

            <FieldError>{state.fieldErrors?.companyName?.[0]}</FieldError>
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.customerName)}>
            <FieldLabel htmlFor="customerName">
              {t("fields.customerName")}
            </FieldLabel>

            <Input
              id="customerName"
              name="customerName"
              value={values.customerName}
              onChange={(event) =>
                updateValue("customerName", event.target.value)
              }
              aria-invalid={Boolean(state.fieldErrors?.customerName)}
            />

            <FieldError>{state.fieldErrors?.customerName?.[0]}</FieldError>
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.priority)}>
            <FieldLabel htmlFor="priority">{t("fields.priority")}</FieldLabel>

            <Select
              name="priority"
              value={values.priority}
              onValueChange={(value) => updateValue("priority", value)}
              required
            >
              <SelectTrigger
                id="priority"
                className="w-full"
                aria-invalid={Boolean(state.fieldErrors?.priority)}
              >
                <SelectValue>
                  {(value: Priority | null) =>
                    value ? tPriority(value) : t("validation.priorityRequired")
                  }
                </SelectValue>
              </SelectTrigger>

              <SelectContent alignItemWithTrigger={false}>
                {TICKET_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {tPriority(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError>{state.fieldErrors?.priority?.[0]}</FieldError>
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.assigneeName)}>
            <FieldLabel htmlFor="assigneeName">
              {t("fields.assigneeName")}
            </FieldLabel>

            <Input
              id="assigneeName"
              name="assigneeName"
              value={values.assigneeName}
              onChange={(event) =>
                updateValue("assigneeName", event.target.value)
              }
              required
              aria-invalid={Boolean(state.fieldErrors?.assigneeName)}
            />

            <FieldError>{state.fieldErrors?.assigneeName?.[0]}</FieldError>
          </Field>

          <Field data-invalid={Boolean(state.fieldErrors?.description)}>
            <FieldLabel htmlFor="description">
              {t("fields.description")}
            </FieldLabel>

            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />

            <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
          </Field>
        </form>

        <DialogFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 flex-1">
            {!state.success && state.message && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            form="create-ticket-form"
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {pending ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
