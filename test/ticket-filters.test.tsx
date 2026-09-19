import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TicketFilters } from "@/features/tickets/components/ticket-filters";
import messages from "@/messages/zh-CN.json";

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("TicketFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replaceMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("输入关键词 300ms 后自动更新 URL", () => {
    render(
      <NextIntlClientProvider locale="zh-CN" messages={messages}>
        <TicketFilters q="" status={[]} priorities={[]} sort="updated_desc" />
      </NextIntlClientProvider>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "搜索工单" }), {
      target: { value: "登录 张三" },
    });

    act(() => vi.advanceTimersByTime(299));
    expect(replaceMock).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(replaceMock).toHaveBeenCalledOnce();

    const [url, options] = replaceMock.mock.calls[0] as [
      string,
      { scroll: boolean },
    ];
    const parsedUrl = new URL(url, "http://localhost");

    expect(parsedUrl.searchParams.get("q")).toBe("登录 张三");
    expect(options).toEqual({ scroll: false });
  });
});
