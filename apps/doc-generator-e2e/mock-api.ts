import type { BrowserContext, Page, Route } from "@playwright/test";

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

export const ANA = { id: "11111111-1111-4111-8111-111111111111", name: "Ana Silva", email: "ana.silva@mindware.ao" };
export const RUI = { id: "22222222-2222-4222-8222-222222222222", name: "Rui Costa", email: "rui.costa@mindware.ao" };

type Json = Record<string, any>;

const page_ = <T,>(data: T[]) => ({
  data,
  meta: { total: data.length, page: 1, limit: 100, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  total: data.length,
  page: 1,
  limit: 100,
  totalPages: 1,
});

const activity = (id: string, title: string, kind: string, status: string, dueAt: string | null, assignees: typeof ANA[], startAt: string | null = null): Json => ({
  id, title, kind, status, priority: "HIGH", startAt, endAt: null, allDay: false, dueAt, rrule: null, location: null,
  description: null, position: 1000, source: "APP", version: 1, createdAt: iso(-3), updatedAt: iso(-1),
  createdBy: ANA, client: null, document: null,
  assignees: assignees.map((u) => ({ activityId: id, userId: u.id, role: "OWNER", user: u })),
});

const client = { id: "c1", name: "Sol Nascente Telecomunicações, S.A.", tradeName: "Sol Nascente Telecom", nif: "5417003821", address: "Avenida 4 de Fevereiro, 120", city: "Luanda", country: "Angola" };

const doc = (id: string, type: string, code: string, title: string): Json => ({
  id, code, type, title, status: "GENERATED", clientId: "c1", templateId: "t1", validityDays: 30, deliveryDays: 30,
  createdAt: iso(-2), updatedAt: iso(-1), client, template: { id: "t1", name: "Modelo" }, metadata: {}, priceItems: [], clauses: [],
});

const metrics = { completed: 5, onTime: 4, onTimeRate: 80, avgCycleHours: 12.5, inProgress: 2, blocked: 1, overdue: 1, created: 3, statusChanges: 9, comments: 4, documentsCreated: 2, documentsApproved: 1 };
const win = { start: iso(-7), end: iso(0) };
const listItem = (id: string, title: string, d: number, extra: Json = {}) => ({ id, title, dueAt: iso(d), ...extra });

export interface MockState {
  activities: Json[];
  documents: Json[];
  users: Json[];
  requests: { method: string; path: string; body: any }[];
}

export function freshState(): MockState {
  return {
    activities: [
      activity("a1", "Proposta Sol Nascente", "TASK", "IN_PROGRESS", iso(0.2), [ANA, RUI]),
      activity("a2", "Relatório mensal de actividades", "TASK", "TODO", iso(-1), [RUI]),
      activity("a3", "Reunião de arranque", "EVENT", "TODO", null, [ANA], iso(0.1)),
      activity("a4", "Rever contrato", "TASK", "REVIEW", iso(2), [ANA]),
      activity("a5", "Entrega do portal", "MILESTONE", "BACKLOG", iso(9), [RUI]),
    ],
    documents: [
      doc("d1", "proposal", "PROP-2026-031", "Plataforma de gestão de pedidos"),
      doc("d2", "contract", "CONT-2026-014", "Contrato de Prestação de Serviços"),
      doc("d3", "declaration", "DECL-2026-021", "Declaração de Trabalho"),
    ],
    users: [
      { ...ANA, role: "ADMIN", allowedDocumentTypes: [], isActive: true, createdAt: iso(-9), updatedAt: iso(-1), _count: { documents: 3 } },
      { ...RUI, role: "EDITOR", allowedDocumentTypes: ["proposal", "contract"], isActive: false, createdAt: iso(-9), updatedAt: iso(-1) },
    ],
    requests: [],
  };
}

/** Sessão de um utilizador (a app guarda o token e o utilizador no localStorage). */
export async function login(context: BrowserContext, role: "ADMIN" | "MANAGER" | "EDITOR" = "ADMIN") {
  await context.addInitScript(
    ([user]) => {
      localStorage.setItem("mindware_doc_access_token", "test-token");
      localStorage.setItem("mindware_doc_user", JSON.stringify(user));
    },
    [{ ...ANA, role, isActive: true, allowedDocumentTypes: [] }],
  );
}

const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");

/** API simulada com estado: criar/mover actividades e criar documentos funcionam. */
export async function mockApi(page: Page, state: MockState = freshState()): Promise<MockState> {
  await page.route("**/api/**", async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api(?=\/)/, "");
    const method = req.method();
    let body: any = null;
    try {
      body = req.postDataJSON();
    } catch {
      body = null;
    }
    if (method !== "GET") state.requests.push({ method, path, body });

    const json = (b: unknown, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(b) });

    // Notificações
    if (path === "/notifications/unread-count") return json({ count: 2 });
    if (path === "/notifications" && method === "GET")
      return json(page_([{ id: "n1", type: "REMINDER", title: "Prazo em 1 h", body: "Proposta Sol Nascente", activityId: "a1", link: null, readAt: null, createdAt: iso(0) }]));
    if (path.startsWith("/notifications/")) return json({ ok: true });

    // Actividades
    if (path === "/activities" && method === "GET") return json(page_(state.activities));
    if (path === "/activities" && method === "POST") {
      const created = activity(`a${state.activities.length + 1}`, body.title, body.kind ?? "TASK", body.status ?? "TODO", body.dueAt ?? null, [ANA], body.startAt ?? null);
      state.activities.push(created);
      return json(created, 201);
    }
    const move = path.match(/^\/activities\/([^/]+)\/move$/);
    if (move && method === "PATCH") {
      const a = state.activities.find((x) => x.id === move[1]);
      if (a) Object.assign(a, { status: body.status, position: body.position ?? a.position, version: a.version + 1 });
      return json(a ?? {});
    }
    const one = path.match(/^\/activities\/([^/]+)$/);
    if (one && method === "PATCH") {
      const a = state.activities.find((x) => x.id === one[1]);
      if (a) Object.assign(a, body, { version: a.version + 1 });
      return json(a ?? {});
    }
    if (one && method === "GET") return json({ ...state.activities.find((x) => x.id === one[1]), comments: [] });

    // Relatórios
    if (path === "/reports/weeks") return json([{ weekStart: win.start, weekEnd: win.end, generatedAt: iso(0) }]);
    if (path === "/reports/team")
      return json({ id: "r1", weekStart: win.start, weekEnd: win.end, generatedAt: iso(0), snapshot: {
        window: win, totals: { completed: 9, onTime: 7, onTimeRate: 78, avgCycleHours: 10, open: 6, inProgress: 3, blocked: 1, overdue: 2, unassignedOpen: 1, created: 5 },
        members: [{ id: ANA.id, name: ANA.name, role: "MANAGER", ...metrics, idle: false }, { id: RUI.id, name: RUI.name, role: "EDITOR", ...metrics, completed: 0, overdue: 2, idle: true }],
        trend: [-21, -14, -7, 0].map((d, i) => ({ weekEnd: iso(d), completed: 3 + i })),
        overdueTop: [{ ...listItem("t1", "Relatório mensal de actividades", -1, { daysLate: 1 }), assignees: ["Rui Costa"] }],
      } });
    if (path === "/reports/weekly")
      return json({ id: "r2", userId: ANA.id, weekStart: win.start, weekEnd: win.end, generatedAt: iso(0), snapshot: {
        window: win, member: { ...ANA, role: "MANAGER" }, metrics,
        lists: { completed: [listItem("c1", "Proposta A", -2, { completedAt: iso(-3), onTime: true })], overdue: [listItem("o1", "Relatório mensal", -1, { daysLate: 1 })], blocked: [], inProgress: [listItem("i1", "Proposta Sol Nascente", 0.2)], nextWeek: [] },
        totals: { completed: 5, overdue: 1, blocked: 0, inProgress: 1, nextWeek: 0 },
      } });
    if (path.startsWith("/reports/") && path.endsWith("/pdf")) return route.fulfill({ contentType: "application/pdf", body: PDF });

    // Documentos
    if (path === "/documents/preview-live") return route.fulfill({ contentType: "application/pdf", body: PDF });
    if (/\/documents\/[^/]+\/(render-pdf|download-pdf)$/.test(path)) return route.fulfill({ contentType: "application/pdf", body: PDF });
    if (path === "/documents" && method === "GET") {
      const type = url.searchParams.get("type");
      return json(page_(type ? state.documents.filter((d) => d.type === type) : state.documents));
    }
    if (path === "/documents" && method === "POST") {
      const created = doc(`d${state.documents.length + 1}`, body.type ?? "proposal", body.code, body.title);
      state.documents.push(created);
      return json(created, 201);
    }
    const docOne = path.match(/^\/documents\/([^/]+)$/);
    if (docOne && method === "GET") return json(state.documents.find((d) => d.id === docOne[1]) ?? state.documents[0]);
    if (docOne && method === "PATCH") return json({ ...state.documents[0], ...body });

    // Outros
    if (path === "/users") return json({ data: state.users, meta: { total: state.users.length, page: 1, limit: 20, totalPages: 1 } });
    if (path === "/users" && method === "POST") return json({ ...body, id: "u-new" }, 201);
    if (path.startsWith("/clauses")) return json(page_([{ id: "cl1", title: "Propriedade intelectual", contentMarkdown: "Texto", category: { name: "PI" } }]));
    if (path.startsWith("/clients")) return json(page_([client]));
    if (path === "/audit-logs/summary") return json({ totalEvents: 120, recentLogins: 7, byResource: [{ resource: "USER", _count: { id: 10 } }, { resource: "DOCUMENT", _count: { id: 50 } }], byAction: [] });
    if (path === "/audit-logs")
      return json({ data: [{ id: "l1", userId: ANA.id, userEmail: ANA.email, action: "LOGIN", resource: "AUTH", resourceId: null, details: { ip: "1.1.1.1" }, ipAddress: "1.1.1.1", userAgent: null, createdAt: iso(-0.1), user: { name: ANA.name, email: ANA.email } }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });
    if (path.startsWith("/templates")) return json(page_([{ id: "t1", name: "Modelo" }]));
    return json({});
  });
  return state;
}
