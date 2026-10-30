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
import { Button, Card, Icon, PageWrapper, SelectField, TitleList } from "@workspace/ui";
import { useActivities, useUpdateActivity } from "@/hooks/use-activities";
import { toLocalInput } from "@/lib/format";
import { isOverdue } from "@/lib/activity-utils";
import { firstName, memberColorMap, membersOf } from "@/lib/member-colors";
import type { Activity } from "@/types/activity";
import { ActivityFormDrawer } from "./activity-form-drawer";

// Luanda é UTC+1 sem mudança de hora. O calendário corre em "UTC" com horas
// flutuantes, por isso somamos 1 h ao mostrar e subtraímos ao guardar.
const OFFSET_MS = 60 * 60 * 1000;
const shown = (iso: string) => new Date(new Date(iso).getTime() + OFFSET_MS);
const real = (d: Date) => new Date(d.getTime() - OFFSET_MS).toISOString();

const NO_OWNER_COLOR = "#64748b";
const DONE_COLOR = "#94a3b8";
const ID_SEP = "::";

/**
 * Eventos do calendário. Um EVENT é um só bloco; tarefas e marcos geram uma
 * entrada por responsável, na cor de cada um, para que cada membro veja (e seja
 * avisado do prazo da sua parte.
 */
function toEvents(
  a: Activity,
  memberId: string,
  colors: Map<string, string>,
): EventInput[] {
  if (a.kind === "EVENT") {
    if (!a.startAt) return [];
    if (memberId && !a.assignees.some((x) => x.userId === memberId)) return [];
    return [
      {
        id: a.id,
        title: a.title,
        start: shown(a.startAt),
        end: a.endAt ? shown(a.endAt) : undefined,
        allDay: a.allDay,
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
      },
    ];
  }
  if (!a.dueAt) return [];

  const closed = a.status === "DONE" || a.status === "CANCELLED";
  const late = isOverdue(a);
  const icon = a.status === "DONE" ? "✓" : a.kind === "MILESTONE" ? "◆" : "☐";
  const owners = a.assignees.filter((x) => !memberId || x.userId === memberId);
  if (memberId && owners.length === 0) return [];

  const base = {
    start: shown(a.dueAt),
    allDay: true,
    editable: false,
    classNames: late ? ["ring-2", "ring-red-500"] : [],
  };
  if (a.assignees.length === 0) {
    return [
      {
        ...base,
        id: `${a.id}${ID_SEP}none`,
        title: `${icon} ${a.title} · sem responsável`,
        backgroundColor: closed ? DONE_COLOR : NO_OWNER_COLOR,
        borderColor: closed ? DONE_COLOR : NO_OWNER_COLOR,
      },
    ];
  }
  return owners.map((o) => {
    const color = closed ? DONE_COLOR : (colors.get(o.userId) ?? NO_OWNER_COLOR);
    return {
      ...base,
      id: `${a.id}${ID_SEP}${o.userId}`,
      title: `${icon} ${a.title} · ${firstName(o.user.name)}${late ? " (atrasada)" : ""}`,
      backgroundColor: color,
      borderColor: color,
    };
  });
}

export function CalendarView() {
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [creating, setCreating] = useState<{ startAt?: string } | null>(null);
  const [memberId, setMemberId] = useState(""); // "" = toda a equipa
  const update = useUpdateActivity();

  const { data, isError, refetch } = useActivities(
    { from: range?.from, to: range?.to, limit: 100, sortBy: "startAt", sortOrder: "asc" },
    range !== null,
  );
  const activities = data?.data ?? [];
  const byId = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);
  const members = useMemo(() => membersOf(activities), [activities]);
  const colors = useMemo(() => memberColorMap(members), [members]);
  const events = useMemo(
    () => activities.flatMap((a) => toEvents(a, memberId, colors)),
    [activities, memberId, colors],
  );

  // Por membro: tarefas em atraso e a vencer nas próximas 24 h.
  const workload = useMemo(() => {
    const soon = Date.now() + 24 * 60 * 60 * 1000;
    return members.map((m) => {
      const mine = activities.filter(
        (a) => a.kind !== "EVENT" && a.assignees.some((x) => x.userId === m.id),
      );
      const open = mine.filter((a) => a.status !== "DONE" && a.status !== "CANCELLED");
      return {
        ...m,
        overdue: open.filter((a) => isOverdue(a)).length,
        dueSoon: open.filter(
          (a) => a.dueAt && !isOverdue(a) && new Date(a.dueAt).getTime() <= soon,
        ).length,
      };
    });
  }, [activities, members]);

  function onDatesSet(arg: DatesSetArg) {
    setRange({ from: real(arg.start), to: real(arg.end) });
  }

  function onEventClick(arg: EventClickArg) {
    const a = byId.get(arg.event.id.split(ID_SEP)[0]);
    if (a) setEditing(a);
  }

  function onDateClick(arg: DateClickArg) {
    const iso = real(arg.date);
    setCreating({ startAt: toLocalInput(iso) });
  }

  function onEventChange(arg: EventChangeArg) {
    const a = byId.get(arg.event.id.split(ID_SEP)[0]);
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
    <PageWrapper routeLabel="Calendário" subRoute="Calendário de Actividades">
      <TitleList
        title="Calendário da Equipa"
        suTitle="Eventos sincronizados com o Google Calendar; tarefas e marcos aparecem no dia do prazo, por responsável"
      >
        <Button onClick={() => setCreating({})} className="gap-2 cursor-pointer">
          <Icon name="CirclePlus" size={16} />
          <span>Novo Evento</span>
        </Button>
      </TitleList>

      {isError && (
        <Card role="alert" className="p-6 text-center flex flex-col items-center gap-3">
          <span className="text-sm">Não foi possível carregar o calendário.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </Card>
      )}
      {data && data.total > data.data.length && (
        <p className="text-xs text-muted-foreground">
          A mostrar {data.data.length} de {data.total} neste período. Mude para uma vista mais curta.
        </p>
      )}

      {members.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <SelectField
            label="Membro"
            value={memberId || "ALL"}
            className="w-56"
            options={[
              { value: "ALL", label: "Toda a equipa" },
              ...members.map((m) => ({ value: m.id, label: m.name })),
            ]}
            onValueChange={(v) => setMemberId(v === "ALL" ? "" : v)}
          />
          {workload
            .filter((m) => !memberId || m.id === memberId)
            .map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMemberId(memberId === m.id ? "" : m.id)}
                aria-pressed={memberId === m.id}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs hover:bg-muted cursor-pointer"
              >
                <span className="size-2 rounded-full" style={{ background: colors.get(m.id) }} />
                {firstName(m.name)}
                {m.overdue > 0 && (
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {m.overdue} atrasada{m.overdue > 1 ? "s" : ""}
                  </span>
                )}
                {m.dueSoon > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {m.dueSoon} em 24 h
                  </span>
                )}
              </button>
            ))}
        </div>
      )}

      <Card className="p-3 text-sm gap-0 [&_.fc]:text-foreground [&_.fc-theme-standard_td]:border-border [&_.fc-theme-standard_th]:border-border [&_.fc-theme-standard_.fc-scrollgrid]:border-border [&_.fc-col-header-cell]:bg-muted [&_.fc-col-header-cell-cushion]:text-foreground [&_.fc-daygrid-day-number]:text-foreground [&_.fc-day-today]:!bg-primary/10">
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
      </Card>

      <ActivityFormDrawer
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
    </PageWrapper>
  );
}
