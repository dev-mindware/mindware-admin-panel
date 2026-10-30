"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DynamicDrawer,
  Input,
  MultiSelect,
  SelectField,
  Textarea,
} from "@workspace/ui";
import {
  KANBAN_COLUMNS,
  KIND_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
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

export interface ActivityFormState {
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

const EMPTY: ActivityFormState = {
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

const fromActivity = (a: Activity): ActivityFormState => ({
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

const options = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

interface Props {
  open: boolean;
  /** Actividade a editar; `null` cria uma nova. */
  activity: Activity | null;
  /** Valores iniciais ao criar (ex.: data escolhida no calendário). */
  defaults?: Partial<ActivityFormState>;
  onClose: () => void;
}

export function ActivityFormDrawer({ open, activity, defaults, onClose }: Props) {
  const { isAdmin } = usePermissions();
  const [form, setForm] = useState<ActivityFormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const userOptions = (users.data?.data ?? []).map((u) => ({ value: u.id, label: u.name }));
  const isEvent = form.kind === "EVENT";
  const busy = create.isPending || update.isPending || remove.isPending;
  const set = <K extends keyof ActivityFormState>(key: K, value: ActivityFormState[K]) =>
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <>
      <DynamicDrawer
        open={open}
        onOpenChange={(val) => !val && onClose()}
        side="right"
        title={activity ? "Editar Actividade" : "Nova Actividade"}
        description="Tarefas e marcos aparecem no kanban; eventos aparecem no calendário"
      >
        <form onSubmit={submit} className="space-y-4 pt-2">
          <Input
            label="Título *"
            placeholder="Ex: Reunião de kickoff com o cliente"
            value={form.title}
            maxLength={200}
            onChange={(e) => set("title", e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <SelectField
              label="Tipo"
              value={form.kind}
              options={options(KIND_LABEL)}
              onValueChange={(v) => set("kind", v as ActivityKind)}
            />
            <SelectField
              label="Estado"
              value={form.status}
              options={KANBAN_COLUMNS.map((c) => ({ value: c.status, label: STATUS_LABEL[c.status] }))}
              onValueChange={(v) => set("status", v as ActivityStatus)}
            />
            <SelectField
              label="Prioridade"
              value={form.priority}
              options={options(PRIORITY_LABEL)}
              onValueChange={(v) => set("priority", v as ActivityPriority)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isEvent ? "Início *" : "Início"}
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => set("startAt", e.target.value)}
            />
            <Input
              label="Fim"
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => set("endAt", e.target.value)}
            />
          </div>

          {!isEvent && (
            <Input
              label="Prazo"
              type="datetime-local"
              hint="Os responsáveis são avisados 1 dia antes, 1 hora antes e no momento do prazo."
              value={form.dueAt}
              onChange={(e) => set("dueAt", e.target.value)}
            />
          )}
          <p className="-mt-2 text-xs text-muted-foreground">Horas em Africa/Luanda (UTC+1).</p>

          {isEvent && (
            <div className="grid grid-cols-2 items-end gap-3">
              <Input
                label="Local"
                placeholder="Ex: Sala de reuniões"
                value={form.location}
                maxLength={200}
                onChange={(e) => set("location", e.target.value)}
              />
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

          <Textarea
            label="Descrição"
            rows={3}
            maxLength={5000}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          {isAdmin && (
            <MultiSelect
              label="Responsáveis"
              placeholder="Sem selecção, fica consigo"
              isLoading={users.isLoading}
              options={userOptions}
              value={userOptions.filter((o) => form.assigneeIds.includes(String(o.value)))}
              onChange={(opts) => set("assigneeIds", opts.map((o) => String(o.value)))}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="pt-4 flex items-center justify-between gap-2">
            {activity ? (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                Remover
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "A guardar..." : activity ? "Guardar Alterações" : "Criar Actividade"}
              </Button>
            </div>
          </div>
        </form>
      </DynamicDrawer>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover actividade?</AlertDialogTitle>
            <AlertDialogDescription>
              A actividade deixa de aparecer no kanban e no calendário. O histórico fica guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activity) remove.mutate(activity.id, { onSuccess: onClose });
                setConfirmDelete(false);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
