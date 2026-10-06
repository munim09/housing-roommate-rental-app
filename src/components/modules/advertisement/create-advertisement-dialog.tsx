"use client";

import { cn } from "cn";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useCreateFlatAdvertisement,
  useCreateRoomAdvertisement,
  useOwnerFlats,
} from "@/hooks";
import type { OwnerFlatRecord } from "@/types";
import {
  EMPTY_ADVERTISEMENT_VALUES,
  useAdvertisementForm,
} from "./use-advertisement-form";

type AdTarget = "flat" | "room";

function flatLabel(flat: OwnerFlatRecord) {
  const { flat: row } = flat;
  const property = row.property?.name ? ` · ${row.property.name}` : "";
  const floor = row.floorNumber != null ? ` · floor ${row.floorNumber}` : "";
  return `${row.flatNumber}${property}${floor}`;
}

function roomLabel(room: OwnerFlatRecord["flat"]["rooms"][number]) {
  return room.name ? `${room.roomNumber} · ${room.name}` : room.roomNumber;
}

/**
 * `POST /advertisements/flats/:flatId` or `POST /advertisements/rooms/:roomId`
 * behind one modal. A toggle picks the target type: advertise the whole flat, or
 * first pick a flat and then one of its rooms. New advertisements always start
 * as `DRAFT`, so publishing is a separate step on the list.
 */
export function CreateAdvertisementDialog() {
  const flatsQuery = useOwnerFlats();
  const createFlat = useCreateFlatAdvertisement();
  const createRoom = useCreateRoomAdvertisement();

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<AdTarget>("flat");
  const [flatId, setFlatId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const flats = flatsQuery.data ?? [];
  const selectedFlat = flats.find((entry) => entry.flatId === flatId);
  const rooms = selectedFlat?.flat.rooms ?? [];

  const activeMutation =
    target === "flat" ? createFlat.isPending : createRoom.isPending;

  const form = useAdvertisementForm({
    defaultValues: { ...EMPTY_ADVERTISEMENT_VALUES },
    onSubmit: (values) => {
      const body = {
        title: values.title,
        description: values.description || undefined,
        monthlyRent: Number(values.monthlyRent),
        availableFrom: values.availableFrom,
        availableTo: values.availableTo,
      };

      const onSuccess = (res: { success: boolean; message?: string }) => {
        if (!res.success) {
          toast.add({
            title: "Server Failure",
            description:
              res.message ?? "Something went wrong. Please try again",
            type: "error",
          });
          return;
        }

        toast.add({
          title: "Advertisement drafted",
          description:
            target === "flat"
              ? "The whole flat is drafted. Publish it once it is ready."
              : "The room is drafted. Publish it once it is ready.",
          type: "success",
        });
        form.reset();
        setTarget("flat");
        setFlatId(null);
        setRoomId(null);
        setOpen(false);
      };

      const onError = (error: Error) => {
        toast.add({
          title: "Could not create the advertisement",
          description:
            error.message || "Something went wrong. Please try again",
          type: "error",
        });
      };

      if (target === "flat") {
        if (!flatId) return;
        createFlat.mutate({ flatId, body }, { onSuccess, onError });
        return;
      }

      if (!roomId) return;
      createRoom.mutate({ roomId, body }, { onSuccess, onError });
    },
  });

  const targetClasses = (active: AdTarget) =>
    cn(
      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
      target === active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const flatOptions = flatsQuery.isLoading ? [] : flats;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset();
          setTarget("flat");
          setFlatId(null);
          setRoomId(null);
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon aria-hidden="true" />
        New advertisement
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create an advertisement</DialogTitle>
          <DialogDescription>
            Advertise a whole flat or a single room. The listing starts as a
            draft — publish it from the list once everything looks right.
          </DialogDescription>
        </DialogHeader>

        <fieldset>
          <legend className="sr-only">Advertisement target</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={targetClasses("flat")}
              aria-pressed={target === "flat"}
              onClick={() => {
                setTarget("flat");
                setRoomId(null);
              }}
            >
              Entire flat
            </button>
            <button
              type="button"
              className={targetClasses("room")}
              aria-pressed={target === "room"}
              onClick={() => setTarget("room")}
            >
              Single room
            </button>
          </div>
        </fieldset>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-5">
            <Field>
              <FieldLabel htmlFor="ad-flatId">Flat</FieldLabel>
              <Select
                items={Object.fromEntries(
                  flats.map((entry) => [entry.flatId, flatLabel(entry)]),
                )}
                value={flatId}
                onValueChange={(next) => {
                  const value = next ?? null;
                  setFlatId(value);
                  setRoomId(null);
                }}
              >
                <SelectTrigger
                  id="ad-flatId"
                  className="w-full"
                  disabled={flatsQuery.isLoading}
                >
                  <SelectValue placeholder="Select a flat" />
                </SelectTrigger>
                <SelectContent>
                  {flatOptions.map((entry) => (
                    <SelectItem key={entry.flatId} value={entry.flatId}>
                      {flatLabel(entry)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {target === "room" ? (
              <Field>
                <FieldLabel htmlFor="ad-roomId">Room</FieldLabel>
                <Select
                  items={Object.fromEntries(
                    rooms.map((room) => [room.id, roomLabel(room)]),
                  )}
                  value={roomId}
                  onValueChange={(next) => setRoomId(next ?? null)}
                >
                  <SelectTrigger
                    id="ad-roomId"
                    className="w-full"
                    disabled={!selectedFlat}
                  >
                    <SelectValue
                      placeholder={
                        selectedFlat ? "Select a room" : "Pick a flat first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {roomLabel(room)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            <form.Field name="title">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="ad-title">Title</FieldLabel>
                    <Input
                      id="ad-title"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="2BHK flat near Dhanmondi"
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="ad-description">
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea
                    id="ad-description"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="A nice flat with gas and water"
                    rows={3}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="monthlyRent">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="ad-monthlyRent">
                      Monthly rent
                    </FieldLabel>
                    <Input
                      id="ad-monthlyRent"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="25000"
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="availableFrom">
                {(field) => {
                  const invalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor="ad-availableFrom">
                        Available from
                      </FieldLabel>
                      <Input
                        id="ad-availableFrom"
                        type="date"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="availableTo">
                {(field) => {
                  const invalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor="ad-availableTo">
                        Available to
                      </FieldLabel>
                      <Input
                        id="ad-availableTo"
                        type="date"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={activeMutation}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={activeMutation}>
              {activeMutation ? <Spinner /> : null}
              {target === "flat"
                ? "Create flat advertisement"
                : "Create room advertisement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
