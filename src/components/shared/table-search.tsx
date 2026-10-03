"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TableSearchProps {
  label?: string;
  placeholder?: string;
}

/**
 * Every filter lives in the URL, so the box is seeded from `?search=` and
 * submits a new query string instead of holding state. Paging is dropped on
 * every submit, otherwise a search on page 5 would land on an empty page.
 */
export function TableSearch({
  label = "Search",
  placeholder = "Search…",
}: TableSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("search") ?? "");

  function applySearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (next.trim()) params.set("search", next.trim());
    else params.delete("search");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      noValidate
      className="flex w-full items-center gap-2 sm:w-auto"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        applySearch(term);
      }}
    >
      <label htmlFor="table-search" className="sr-only">
        {label}
      </label>
      <Input
        id="table-search"
        name="search"
        type="search"
        value={term}
        placeholder={placeholder}
        onChange={(event) => setTerm(event.target.value)}
        className="h-9 w-full sm:w-64"
      />
      <Button type="submit" variant="outline" size="sm">
        <SearchIcon aria-hidden="true" />
        Search
      </Button>
      {term ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setTerm("");
            applySearch("");
          }}
        >
          <XIcon aria-hidden="true" />
          Clear
        </Button>
      ) : null}
    </form>
  );
}
