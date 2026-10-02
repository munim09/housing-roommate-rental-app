"use client";

import { MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Spinner } from "@/components/ui/spinner";
import { useApiErrorToast, useAreas, useDebounce } from "@/hooks";

interface AreaOption {
  value: string;
  /** Always `Area, City` — e.g. "Gulshan, Dhaka". */
  label: string;
  name: string;
  city: string;
}

export interface AreaComboboxProps {
  /** The selected area id, written to the URL as `areaId`. */
  value: string;
  /** Human readable `Area, City` label, carried through the URL as `area`. */
  label: string;
  onChange: (areaId: string, label: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  "aria-describedby"?: string;
  invalid?: boolean;
}

const AREA_LIMIT = 8;
const DEBOUNCE_MS = 500;

/**
 * Type-ahead over `GET /areas?search=`. Nothing is requested until the consumer
 * types, the term is debounced, and filtering stays on the server.
 */
export function AreaCombobox({
  value,
  label,
  onChange,
  onBlur,
  id,
  name,
  placeholder = "Search area or city",
  invalid,
  ...aria
}: AreaComboboxProps) {
  const [inputValue, setInputValue] = useState(label);
  const search = useDebounce(inputValue.trim(), DEBOUNCE_MS);
  //   console.log("inputValue.trim()", inputValue.trim());
  //   console.log("searching starting ", search);

  const {
    data: areas,
    isPending,
    isFetching,
    error,
  } = useAreas({ search: search || undefined, limit: AREA_LIMIT });

  useApiErrorToast(error, "Could not load areas");

  // A refetch keeps the previous list on screen instead of collapsing the popup.
  const listOpacity = isFetching && !isPending ? "opacity-60" : undefined;

  // Keeps the box in sync when the selection is hydrated from the URL.
  useEffect(() => {
    setInputValue(label);
  }, [label]);

  const items: AreaOption[] = (areas ?? []).map((area) => {
    const city = area.city?.name ?? "";

    return {
      value: area.id,
      name: area.name,
      city,
      label: city ? `${area.name}, ${city}` : area.name,
    };
  });

  // `selected` is seeded from the hydrated label, so a URL-restored area still
  // shows as the chosen chip even before any search has run.
  const match = items.find((item) => item.value === value);
  const selected: AreaOption | null = match
    ? match
    : value && label
      ? { value, name: label, city: "", label }
      : null;

  const isSearching = search.length > 0;

  return (
    <Combobox
      items={items}
      value={selected}
      inputValue={inputValue}
      // Results already come filtered from the API.
      filter={null}
      onInputValueChange={(next, details) => {
        setInputValue(next);

        // Clearing the box drops the selection — one area is mandatory, so the
        // form has to re-prompt rather than submit a stale areaId.
        if (details.reason === "input-change" && next.trim() === "") {
          onChange("", "");
        }
      }}
      onValueChange={(item) => {
        if (!item) {
          onChange("", "");
          setInputValue("");
          return;
        }

        setInputValue(item.label);
        onChange(item.value, item.label);
      }}
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder={placeholder}
        aria-label="Area"
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={aria["aria-describedby"]}
        onBlur={onBlur}
        className="h-11 [&_[data-slot=input-group-control]]:h-11"
      />

      <ComboboxContent className="w-(--anchor-width) min-w-72">
        <ComboboxEmpty>
          {isPending && isSearching ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Spinner /> Searching areas…
            </span>
          ) : (
            <span className="text-muted-foreground">
              No area matches “{search}”. Try a landmark or a city.
            </span>
          )}
        </ComboboxEmpty>

        <ComboboxList className={listOpacity}>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item}>
              <MapPinIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {item.label}
              </span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
