import { cva } from "class-variance-authority";
import { useFormatter, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Ticket } from "@/features/tickets/types";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const statusDotVariants = cva("size-2.5 shrink-0 rounded-full", {
  variants: {
    status: {
      PENDING: "bg-status-warning",
      IN_PROGRESS: "bg-status-info",
      RESOLVED: "bg-status-success",
    },
  },
});

const PRIORITY_COLOR = {
  HIGH: "bg-status-warning",
  MEDIUM: "bg-status-info",
  LOW: "bg-status-success",
};

const STATUS_COLOR = {
  PENDING: "bg-status-warning",
  IN_PROGRESS: "bg-status-info",
  RESOLVED: "bg-status-success",
};

type TicketCardProps = {
  ticket: Ticket;
};

export function TicketCard({ ticket }: TicketCardProps) {
  const t = useTranslations("tickets");
  const format = useFormatter();

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`查看工单：${ticket.title}`}
    >
      <Card
        className={cn(
          "cursor-default",
          "transition-shadow duration-200 ease-out",
          "hover:hover:shadow-md",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={statusDotVariants({ status: ticket.status })}
            />
            {ticket.title}
          </CardTitle>
          <CardDescription>
            {ticket.companyName + "·" + ticket.customerName}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={PRIORITY_COLOR[ticket.priority]}
            >
              {t("priority.label") + ": " + t(`priority.${ticket.priority}`)}
            </Badge>
            <Badge variant="outline" className={STATUS_COLOR[ticket.status]}>
              {t(`status.${ticket.status}`)}
            </Badge>
          </div>
        </CardContent>

        <CardFooter
          className={cn("border-t-0 bg-transparent pt-0", "text-gray-500")}
        >
          <span>
            {t("assignee")}: {ticket.assigneeName}
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <time
              dateTime={ticket.updatedAt.toISOString()}
              title={format.dateTime(ticket.updatedAt)}
            >
              {format.relativeTime(ticket.updatedAt)}
            </time>
            <ChevronRight className="size-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
