import type { BarItem, EventSeries } from "@/lib/ga";
import { BarRows } from "./bar-list";
import { EventsChart } from "./events-chart";

/** Full-width Goals card: a multi-line chart (left) + the ranked list (right). */
export function GoalsCard({
  events,
  eventSeries,
  rangeLabel,
}: {
  events: BarItem[];
  eventSeries: EventSeries;
  rangeLabel?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">Goals</span>
        <span className="text-xs text-muted-foreground">
          Events triggered{rangeLabel ? ` · ${rangeLabel}` : ""}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* left: per-event daily line chart */}
        <div>
          <div className="mb-2 text-xs text-muted-foreground">
            Daily trend · top {eventSeries.series.length}
          </div>
          <EventsChart data={eventSeries} />
        </div>

        {/* right: ranked event list, bounded height + scroll */}
        <div>
          <div className="mb-2 flex items-baseline justify-between text-xs text-muted-foreground">
            <span className="font-medium">Event</span>
            <span>Triggered</span>
          </div>
          <div className="max-h-[300px] min-h-[200px] overflow-y-auto pr-1">
            <BarRows items={events} emptyLabel="No events tracked yet" />
          </div>
        </div>
      </div>
    </div>
  );
}
