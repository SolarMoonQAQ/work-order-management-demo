"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TICKET_PRIORITIES,
  TICKET_SORTS,
  TICKET_STATUSES,
} from "@/features/tickets/constants";
import type {
  Priority,
  TicketSort,
  TicketStatus,
} from "@/features/tickets/constants";
import type { TicketFilterValues } from "@/features/tickets/schema";

type FilterValues = {
  q: string;
  status: TicketStatus[];
  priorities: Priority[];
  sort: TicketSort;
};

export function TicketFilters({
  q,
  status,
  priorities,
  sort,
}: TicketFilterValues) {
  const t = useTranslations("tickets.filters");
  const tStatus = useTranslations("tickets.status");
  const tPriority = useTranslations("tickets.priority");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [keyword, setKeyword] = useState(q);
  const [selectedStatuses, setSelectedStatuses] =
    useState<TicketStatus[]>(status);
  const [selectedPriorities, setSelectedPriorities] =
    useState<Priority[]>(priorities);
  const [selectedSort, setSelectedSort] = useState(sort);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSearchTimer() {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }

  function replaceFilters(filters: FilterValues) {
    const params = new URLSearchParams();
    const normalizedKeyword = filters.q.trim();

    if (normalizedKeyword) {
      params.set("q", normalizedKeyword);
    }

    for (const status of filters.status) {
      params.append("status", status);
    }

    for (const priority of filters.priorities) {
      params.append("priorities", priority);
    }

    if (filters.sort !== "updated_desc") {
      params.set("sort", filters.sort);
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleKeywordChange(nextKeyword: string) {
    setKeyword(nextKeyword);
    clearSearchTimer();

    searchTimerRef.current = setTimeout(() => {
      replaceFilters({
        q: nextKeyword,
        status: selectedStatuses,
        priorities: selectedPriorities,
        sort: selectedSort,
      });
    }, 300);
  }

  function handleClear() {
    clearSearchTimer();
    setKeyword("");
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedSort("updated_desc");
  }

  useEffect(() => {
    return () => clearSearchTimer();
  }, []);

  return (
    <div
      aria-busy={pending}
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <Input
        value={keyword}
        onChange={(event) => handleKeywordChange(event.target.value)}
        aria-label={t("labels.search")}
        placeholder={t("searchPlaceholder")}
      />

      <Select
        multiple
        value={selectedStatuses}
        onValueChange={(nextStatuses) => {
          clearSearchTimer();
          setSelectedStatuses(nextStatuses);
          replaceFilters({
            q: keyword,
            status: nextStatuses,
            priorities: selectedPriorities,
            sort: selectedSort,
          });
        }}
      >
        <SelectTrigger className="w-full" aria-label={t("labels.status")}>
          <SelectValue>
            {(values: TicketStatus[]) => {
              if (values.length === 0) {
                return t("all.status");
              }

              if (values.length === 1) {
                return tStatus(values[0]);
              }

              return `${tStatus(values[0])} (+${values.length - 1})`;
            }}
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

      <Select
        multiple
        value={selectedPriorities}
        onValueChange={(nextPriorities) => {
          clearSearchTimer();
          setSelectedPriorities(nextPriorities);
          replaceFilters({
            q: keyword,
            status: selectedStatuses,
            priorities: nextPriorities,
            sort: selectedSort,
          });
        }}
      >
        <SelectTrigger className="w-full" aria-label={t("labels.priority")}>
          <SelectValue>
            {(values: Priority[]) => {
              if (values.length === 0) {
                return t("all.priority");
              }

              if (values.length === 1) {
                return tPriority(values[0]);
              }

              return `${tPriority(values[0])} (+${values.length - 1})`;
            }}
          </SelectValue>
        </SelectTrigger>

        <SelectContent align="start" alignItemWithTrigger={false}>
          {TICKET_PRIORITIES.map((option) => (
            <SelectItem key={option} value={option}>
              {tPriority(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedSort}
        onValueChange={(value) => {
          if (value) {
            clearSearchTimer();
            setSelectedSort(value);
            replaceFilters({
              q: keyword,
              status: selectedStatuses,
              priorities: selectedPriorities,
              sort: value,
            });
          }
        }}
      >
        <SelectTrigger className="w-full" aria-label={t("labels.sort")}>
          <SelectValue>{t(`sort.${selectedSort}`)}</SelectValue>
        </SelectTrigger>

        <SelectContent align="start" alignItemWithTrigger={false}>
          {TICKET_SORTS.map((sortOption) => (
            <SelectItem key={sortOption} value={sortOption}>
              {t(`sort.${sortOption}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={pathname} scroll={false} />}
          onClick={handleClear}
        >
          {t("clear")}
        </Button>

        <span
          aria-live="polite"
          className="text-sm whitespace-nowrap text-muted-foreground"
        >
          {pending ? t("updating") : null}
        </span>
      </div>
    </div>
  );
}
