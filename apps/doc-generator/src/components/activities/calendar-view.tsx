"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  EventChangeArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Plus } from "lucide-react";
import { useActivities, useUpdateActivity } from "@/hooks/use-activities";
import { toLocalInput } from "@/lib/format";
import type { Activity } from "@/types/activity";
import { ActivityFormModal } from "./activity-form-modal";

// Luanda é UTC+1 sem mudança de hora. O calendário corre em "UTC" com horas
// flutuantes, por isso somamos 1 h ao mostrar e subtraímos ao guardar.
const OFFSET_MS = 60 * 60 * 1000;
const shown = (iso: string) => new Date(new Date(iso).getTime() + OFFSET_MS);
const real = (d: Date) => new Date(d.getTime() - OFFSET_MS).toISOString();

const PRIORITY_COLOR: Record<Activity["priority"], string> = {
  LOW: "#64748b",
  MEDIUM: "#2563eb",
  HIGH: "#d97706",
  URGENT: "#dc2626",
};

function toEvent(a: Activity): EventInput | null {
  if (a.kind === "EVENT") {
    if (!a.startAt) return null;
    return {
      id: a.id,
      title: a.title,
      start: shown(a.startAt),
      end: a.endAt ? shown(a.endAt) : undefined,
      allDay: a.allDay,
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    };
  }
  // Tarefas e marcos aparecem no dia do prazo, só para consulta.
  if (!a.dueAt) return null;
  const done = a.status === "DONE" || a.status === "CANCELLED";
  return {
    id: a.id,
    title: `${a.kind === "MILESTONE" ? "◆" : "☐"} ${a.title}`,
    start: shown(a.dueAt),
    allDay: true,
    editable: false,
    backgroundColor: done ? "#94a3b8" : PRIORITY_COLOR[a.priority],
    borderColor: done ? "#94a3b8" : PRIORITY_COLOR[a.priority],
  };
}

export function CalendarView() {
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [creating, setCreating] = useState<{ startAt?: string } | null>(null);
  const update = useUpdateActivity();

  const { data, isError, refetch } = useActivities(
    { from: range?.from, to: range?.to, limit: 100, sortBy: "startAt", sortOrder: "asc" },
    range !== null,
  );
  const activities = data?.data ?? [];
  const byId = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
  const events = useMemo(
    () => activities.map(toEvent).filter((e): e is EventInput => e !== null),
    [activities],
  );

  function onDatesSet(arg: DatesSetArg) {
    setRange({ from: real(arg.start), to: real(arg.end) });
  }

  function onEventClick(arg: EventClickArg) {
    const a = byId.get(arg.event.id);
    if (a) setEditing(a);
  }

  function onDateClick(arg: DateClickArg) {
    const iso = real(arg.date);
    setCreating({ startAt: toLocalInput(iso) });
  }

  function onEventChange(arg: EventChangeArg) {
    const a = byId.get(arg.event.id);
    const start = arg.event.start;
    if (!a || !start) return arg.revert();
    update.mutate(
      {
        id: a.id,
        version: a.version,
        startAt: real(start),
        endAt: arg.event.end ? real(arg.event.end) : undefined,
        allDay: arg.event.allDay,
      },
      { onError: () => arg.revert() },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eventos sincronizados com o Google Calendar. Tarefas e marcos aparecem no dia do prazo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating({})}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Novo evento
        </button>
      </div>

      {isError && (
        <div role="alert" className="rounded-lg border border-red-500/30 p-3 text-sm">
          Não foi possível carregar o calendário.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}
      {data && data.total > data.data.length && (
        <p className="text-xs text-muted-foreground">
          A mostrar {data.data.length} de {data.total} neste período. Mude para uma vista mais curta.
        </p>
      )}

      <div className="rounded-xl border bg-card p-3 text-sm [&_.fc]:text-foreground [&_.fc-theme-standard_td]:border-border [&_.fc-theme-standard_th]:border-border [&_.fc-theme-standard_.fc-scrollgrid]:border-border">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          timeZone="UTC"
          locale="pt"
          firstDay={1}
          height="auto"
          nowIndicator
          editable
          selectable={false}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{ today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
          events={events}
          datesSet={onDatesSet}
          eventClick={onEventClick}
          dateClick={onDateClick}
          eventChange={onEventChange}
        />
      </div>

      <ActivityFormModal
        open={creating !== null || editing !== null}
        activity={editing}
        defaults={
          creating
            ? { kind: "EVENT", status: "TODO", startAt: creating.startAt ?? "" }
            : undefined
        }
        onClose={() => {
          setCreating(null);
          setEditing(null);
        }}
      />
    </div>
  );
}
