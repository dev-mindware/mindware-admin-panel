"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KIND_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  KANBAN_COLUMNS,
} from "@/constants/activities";
import {
  useCreateActivity,
  useDeleteActivity,
  useUpdateActivity,
} from "@/hooks/use-activities";
import { usePermissions } from "@/hooks/use-permissions";
import { fromLocalInput, toLocalInput } from "@/lib/format";
import { usersService } from "@/services/users-service";
import type {
  Activity,
  ActivityKind,
  ActivityPayload,
  ActivityPriority,
  ActivityStatus,
} from "@/types/activity";

interface FormState {
  title: string;
  description: string;
  kind: ActivityKind;
  status: ActivityStatus;
  priority: ActivityPriority;
  startAt: string;
  endAt: string;
  dueAt: string;
  allDay: boolean;
  location: string;
  assigneeIds: string[];
}

const EMPTY: FormState = {
  title: "",
  description: "",
  kind: "TASK",
  status: "TODO",
  priority: "MEDIUM",
  startAt: "",
  endAt: "",
  dueAt: "",
  allDay: false,
  location: "",
  assigneeIds: [],
};

const fromActivity = (a: Activity): FormState => ({
  title: a.title,
  description: a.description ?? "",
  kind: a.kind,
  status: a.status,
  priority: a.priority,
  startAt: toLocalInput(a.startAt),
  endAt: toLocalInput(a.endAt),
  dueAt: toLocalInput(a.dueAt),
  allDay: a.allDay,
  location: a.location ?? "",
  assigneeIds: a.assignees.map((x) => x.userId),
});

const inputClass =
  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

interface Props {
  open: boolean;
  /** Actividade a editar; `null` cria uma nova. */
  activity: Activity | null;
  /** Valores iniciais ao criar (ex.: data escolhida no calendário). */
  defaults?: Partial<FormState>;
  onClose: () => void;
}

export function ActivityFormModal({ open, activity, defaults, onClose }: Props) {
  const { isAdmin } = usePermissions();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateActivity();
  const update = useUpdateActivity();
  const remove = useDeleteActivity();

  // Só ADMIN pode listar utilizadores (GET /users); os restantes ficam como responsáveis de si mesmos.
  const users = useQuery({
    queryKey: ["users", "assignable"],
    queryFn: () => usersService.list({ limit: 100, isActive: true }),
    enabled: open && isAdmin,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(activity ? fromActivity(activity) : { ...EMPTY, ...defaults });
  }, [open, activity, defaults]);

  if (!open) return null;

  const isEvent = form.kind === "EVENT";
  const busy = create.isPending || update.isPending || remove.isPending;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function buildPayload(): ActivityPayload | null {
    if (!form.title.trim()) {
      setError("Indique o título.");
      return null;
    }
    const startAt = fromLocalInput(form.startAt);
    const endAt = fromLocalInput(form.endAt);
    if (isEvent && !startAt) {
      setError("Um evento precisa de data de início.");
      return null;
    }
    if (startAt && endAt && endAt < startAt) {
      setError("O fim não pode ser anterior ao início.");
      return null;
    }
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      kind: form.kind,
      status: form.status,
      priority: form.priority,
      startAt,
      endAt,
      dueAt: isEvent ? undefined : fromLocalInput(form.dueAt),
      allDay: isEvent ? form.allDay : false,
      location: form.location.trim() || undefined,
      ...(isAdmin && form.assigneeIds.length ? { assigneeIds: form.assigneeIds } : {}),
    };
  }

  function submit() {
    setError(null);
    const payload = buildPayload();
    if (!payload) return;
    const done = { onSuccess: onClose };
    if (activity) {
      update.mutate({ id: activity.id, ...payload, version: activity.version }, done);
    } else {
      create.mutate(payload, done);
    }
  }

  function destroy() {
    if (!activity || !window.confirm("Remover esta actividade?")) return;
    remove.mutate(activity.id, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activity ? "Editar actividade" : "Nova actividade"}
        className="relative max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {activity ? "Editar actividade" : "Nova actividade"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="act-title">Título</label>
          <input
            id="act-title"
            className={inputClass}
            value={form.title}
            maxLength={200}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Reunião de kickoff com o cliente"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="space-y-1.5 text-sm font-medium">
            Tipo
            <select
              className={inputClass}
              value={form.kind}
              onChange={(e) => set("kind", e.target.value as ActivityKind)}
            >
              {Object.entries(KIND_LABEL).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Estado
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as ActivityStatus)}
            >
              {KANBAN_COLUMNS.map((c) => (
                <option key={c.status} value={c.status}>{STATUS_LABEL[c.status]}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Prioridade
            <select
              className={inputClass}
              value={form.priority}
              onChange={(e) => set("priority", e.target.value as ActivityPriority)}
            >
              {Object.entries(PRIORITY_LABEL).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5 text-sm font-medium">
            {isEvent ? "Início" : "Início (opcional)"}
            <input
              type="datetime-local"
              className={inputClass}
              value={form.startAt}
              onChange={(e) => set("startAt", e.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Fim
            <input
              type="datetime-local"
              className={inputClass}
              value={form.endAt}
              onChange={(e) => set("endAt", e.target.value)}
            />
          </label>
          {!isEvent && (
            <label className="col-span-2 space-y-1.5 text-sm font-medium">
              Prazo
              <input
                type="datetime-local"
                className={inputClass}
                value={form.dueAt}
                onChange={(e) => set("dueAt", e.target.value)}
              />
            </label>
          )}
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">Horas em Africa/Luanda (UTC+1).</p>

        {isEvent && (
          <div className="grid grid-cols-2 items-end gap-3">
            <label className="space-y-1.5 text-sm font-medium">
              Local
              <input
                className={inputClass}
                value={form.location}
                maxLength={200}
                onChange={(e) => set("location", e.target.value)}
              />
            </label>
            <label className="flex h-9 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => set("allDay", e.target.checked)}
              />
              Dia inteiro
            </label>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="act-desc">Descrição</label>
          <textarea
            id="act-desc"
            rows={3}
            maxLength={5000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {isAdmin && (
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Responsáveis</legend>
            <p className="text-xs text-muted-foreground">
              O primeiro seleccionado é o principal. Sem selecção, fica consigo.
            </p>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {users.data?.data.map((u) => {
                const on = form.assigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set(
                        "assigneeIds",
                        on
                          ? form.assigneeIds.filter((id) => id !== u.id)
                          : [...form.assigneeIds, u.id],
                      )
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      on ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          {activity ? (
            <button
              type="button"
              onClick={destroy}
              disabled={busy}
              className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Remover
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-md border px-4 text-sm hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
