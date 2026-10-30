"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  BarListPanel,
  Button,
  FilterToolbar,
  Icon,
  Panel,
  PageWrapper,
  RequestError,
  TitleList,
} from "@workspace/ui";
import { useActivities, useUpdateActivity } from "@/hooks/use-activities";
import { toLocalInput } from "@/lib/format";
import { isOverdue } from "@/lib/activity-utils";
import { firstName, memberColorMap, membersOf, type MemberRef } from "@/lib/member-colors";
import type { Activity } from "@/types/activity";
import { ActivityFormDrawer } from "./activity-form-drawer";
import "./calendar.css";

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
  const [known, setKnown] = useState<MemberRef[]>([]);
  const update = useUpdateActivity();

  const { data, isError, refetch } = useActivities(
    { from: range?.from, to: range?.to, limit: 100, sortBy: "startAt", sortOrder: "asc" },
    range !== null,
  );
  const activities = useMemo(() => data?.data ?? [], [data]);
  const byId = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);

  // Os membros vistos acumulam-se ao navegar, para a cor de cada um não mudar de mês para mês.
  useEffect(() => {
    const seen = membersOf(activities);
    setKnown((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const added = seen.filter((m) => !ids.has(m.id));
      return added.length
        ? [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name, "pt"))
        : prev;
    });
  }, [activities]);

  const colors = useMemo(() => memberColorMap(known), [known]);
  const events = useMemo(
    () => activities.flatMap((a) => toEvents(a, memberId, colors)),
    [activities, memberId, colors],
  );

  // Tarefas em aberto por membro; a ordem e as cores coincidem com as do calendário.
  const workload = useMemo(
    () =>
      known.map((m) => ({
        label: firstName(m.name),
        value: activities.filter(
          (a) =>
            a.kind !== "EVENT" &&
            a.status !== "DONE" &&
            a.status !== "CANCELLED" &&
            a.assignees.some((x) => x.userId === m.id),
        ).length,
      })),
    [activities, known],
  );

  function onDatesSet(arg: DatesSetArg) {
    setRange({ from: real(arg.start), to: real(arg.end) });
  }

  function onEventClick(arg: EventClickArg) {
    const a = byId.get(arg.event.id.split(ID_SEP)[0]);
    if (a) setEditing(a);
  }

  function onDateClick(arg: DateClickArg) {
    setCreating({ startAt: toLocalInput(real(arg.date)) });
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
        <Button onClick={() => setCreating({})}>
          <Icon name="CirclePlus" />
          Novo Evento
        </Button>
      </TitleList>

      <FilterToolbar
        filters={[
          {
            key: "member",
            label: "Membro",
            value: memberId,
            onChange: setMemberId,
            options: known.map((m) => ({ label: m.name, value: m.id })),
            placeholder: "Toda a equipa",
          },
        ]}
        onClear={() => setMemberId("")}
      />

      {isError && (
        <RequestError refetch={() => void refetch()} message="Não foi possível carregar o calendário." />
      )}

      {known.length > 0 && (
        <BarListPanel
          title="Tarefas em aberto por membro"
          description="As cores são as mesmas do calendário"
          icon="Users"
          items={workload}
          multicolor
          seriesLabel="Em aberto"
          emptyText="Sem tarefas em aberto neste período."
        />
      )}

      <Panel
        title="Agenda"
        description={
          data && data.total > data.data.length
            ? `A mostrar ${data.data.length} de ${data.total} neste período; mude para uma vista mais curta`
            : "Arraste um evento para o remarcar"
        }
        icon="CalendarDays"
      >
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
      </Panel>

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
