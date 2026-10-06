import type { Advertisement } from "@/types";

/**
 * Human-readable location of an advertisement: `A2 · Green View Residence · floor 2`
 * with the room appended when the listing is for a room rather than the whole flat.
 */
export function advertisementTargetLabel(
  advertisement: Pick<Advertisement, "flat" | "room">,
) {
  const flat = advertisement.flat;
  if (!flat) return "Unknown target";

  const base = `${flat.flatNumber ?? "Flat"}${flat.property?.name ? ` · ${flat.property.name}` : ""}${flat.floorNumber != null ? ` · floor ${flat.floorNumber}` : ""}`;
  const room = advertisement.room;

  return room ? `${base} · ${room.roomNumber ?? "room"}` : base;
}
