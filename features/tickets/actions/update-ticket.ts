"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { db } from "@/db";
import { ticketNotes, tickets } from "@/db/schema";
import type { UpdateTicketState } from "@/features/tickets/actions/update-ticket-state";
import { updateTicketSchema } from "@/features/tickets/schema";

export async function updateTicket(
  _previousState: UpdateTicketState,
  formData: FormData,
): Promise<UpdateTicketState> {
  const t = await getTranslations("tickets.detail.edit");
  const schema = updateTicketSchema({
    ticketIdInvalid: t("validation.ticketIdInvalid"),
    statusRequired: t("validation.statusRequired"),
    priorityRequired: t("validation.priorityRequired"),
    assigneeRequired: t("validation.assigneeRequired"),
    noteMax: t("validation.noteMax"),
  });

  const result = schema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    assigneeName: formData.get("assigneeName"),
    note: formData.get("note"),
  });

  if (!result.success) {
    return {
      success: false,
      message: t("errors.invalid"),
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  try {
    const updateQuery = db
      .update(tickets)
      .set({
        status: result.data.status,
        priority: result.data.priority,
        assigneeName: result.data.assigneeName,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, result.data.ticketId))
      .returning({ id: tickets.id });

    const updatedTicket = result.data.note
      ? (
          await db.batch([
            updateQuery,
            db.insert(ticketNotes).values({
              ticketId: result.data.ticketId,
              content: result.data.note,
            }),
          ])
        )[0][0]
      : (await updateQuery)[0];

    if (!updatedTicket) {
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    revalidatePath("/");
    revalidatePath(`/tickets/${result.data.ticketId}`);

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
