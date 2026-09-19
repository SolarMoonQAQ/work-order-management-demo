"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { createTicketSchema } from "@/features/tickets/schema";
import type { CreateTicketState } from "@/features/tickets/actions/create-ticket-state";

export async function createTicket(
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const t = await getTranslations("tickets.create");

  const schema = createTicketSchema({
    titleRequired: t("validation.titleRequired"),
    titleMin: t("validation.titleMin"),
    companyNameRequired: t("validation.companyNameRequired"),
    customerNameRequired: t("validation.customerNameRequired"),
    descriptionRequired: t("validation.descriptionRequired"),
    priorityRequired: t("validation.priorityRequired"),
    assigneeRequired: t("validation.assigneeRequired"),
  });

  const rawValues = {
    title: String(formData.get("title") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    description: String(formData.get("description") ?? ""),
    priority: String(formData.get("priority") ?? ""),
    assigneeName: String(formData.get("assigneeName") ?? ""),
  };

  const result = schema.safeParse(rawValues);

  if (!result.success) {
    return {
      success: false,
      message: t("errors.invalid"),
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  try {
    await db.insert(tickets).values({
      ...result.data,
      status: "PENDING",
    });

    revalidatePath("/");

    return {
      success: true,
      message: t("success"),
    };
  } catch {
    return {
      success: false,
      message: t("errors.failed"),
    };
  }
}
