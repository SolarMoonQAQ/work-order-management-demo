// features/tickets/components/ticket-card.test.tsx

import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "@/messages/zh-CN.json";
import { TicketCard } from "@/features/tickets/components/ticket-card";
import type { Ticket } from "@/features/tickets/types";

const baseTicket: Ticket = {
  id: "ticket-001",
  title: "客户无法登录管理后台",
  companyName: "星河科技",
  customerName: "二狗",
  description: "登录时提示账户权限不足。",
  priority: "HIGH",
  status: "IN_PROGRESS",
  assigneeName: "assignee-001",
  createdAt: new Date("2026-09-18T09:00:00+08:00"),
  updatedAt: new Date("2026-09-18T09:30:00+08:00"),
};

function renderTicketCard(overrides: Partial<Ticket> = {}) {
  const ticket: Ticket = {
    ...baseTicket,
    ...overrides,
  };

  return render(
    <NextIntlClientProvider locale="zh-CN" messages={messages}>
      <TicketCard ticket={ticket} />
    </NextIntlClientProvider>,
  );
}

describe("TicketCard", () => {
  it("显示工单标题", () => {
    renderTicketCard();

    expect(screen.getByText("客户无法登录管理后台")).toBeVisible();
  });

  it.each([
    ["PENDING", "待处理"],
    ["IN_PROGRESS", "处理中"],
    ["RESOLVED", "已解决"],
  ] as const)("状态为 %s 时显示“%s”", (status, expectedLabel) => {
    renderTicketCard({ status });

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
