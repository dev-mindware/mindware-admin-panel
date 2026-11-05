import { expect, test, type Page } from "@playwright/test";
import { freshState, login, mockApi, type MockState } from "./mock-api";

/** Fluxos de ponta a ponta com a API simulada. Correm em todos os ecrãs; alguns passos mudam entre telemóvel e computador. */

const isPhone = () => test.info().project.name.startsWith("phone");
const isTouch = () => test.info().project.name !== "desktop";

async function setup(page: Page, context: Parameters<typeof login>[0], role: "ADMIN" | "MANAGER" | "EDITOR" = "ADMIN"): Promise<MockState> {
  await login(context, role);
  return mockApi(page, freshState());
}

const lastRequest = (state: MockState, method: string, pathRe: RegExp) =>
  [...state.requests].reverse().find((r) => r.method === method && pathRe.test(r.path));

/** Um elemento tem de caber no ecrã (espera pela animação de entrada de gavetas e menus). */
async function expectInViewport(page: Page, locator: ReturnType<Page["locator"]>) {
  const vp = page.viewportSize()!;
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      return box ? box.x >= -1 && box.x + box.width <= vp.width + 1 : false;
    })
    .toBe(true);
}

test.describe("navegação", () => {
  test("o menu abre e navega (gaveta no telemóvel, barra fixa no computador)", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./dashboard");
    if (isPhone()) {
      await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    }
    await page.getByRole("link", { name: "Actividades" }).first().click();
    await expect(page).toHaveURL(/\/activities$/);
    await expect(page.getByRole("heading", { name: "Actividades da Equipa" })).toBeVisible();
  });

  test("o menu móvel fecha ao navegar", async ({ page, context }) => {
    test.skip(!isPhone(), "só telemóvel");
    await setup(page, context);
    await page.goto("./dashboard");
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await page.getByRole("link", { name: "Calendário" }).first().click();
    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByRole("link", { name: "Actividades", exact: true })).toBeHidden();
  });
});

test.describe("actividades", () => {
  test("criar uma actividade pela gaveta", async ({ page, context }) => {
    const state = await setup(page, context);
    await page.goto("./activities");
    await page.getByRole("button", { name: "Nova Actividade" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expectInViewport(page, drawer);

    // Enviar sem título não cria nada e explica porquê.
    await drawer.getByRole("button", { name: "Criar Actividade" }).click();
    await expect(drawer.getByRole("alert")).toContainText("título");
    expect(lastRequest(state, "POST", /^\/activities$/)).toBeUndefined();

    await drawer.getByLabel("Título *").fill("Preparar contrato da Sol Nascente");
    await drawer.getByRole("button", { name: "Criar Actividade" }).click();
    await expect.poll(() => lastRequest(state, "POST", /^\/activities$/)?.body?.title).toBe("Preparar contrato da Sol Nascente");
    await expect(drawer).toBeHidden();
  });

  test("mover uma actividade de estado sem arrastar", async ({ page, context }) => {
    const state = await setup(page, context);
    await page.goto("./activities");

    if (isPhone()) {
      // Um estado de cada vez, em separadores com contagem.
      await expect(page.getByRole("tab", { name: /Em curso/ })).toBeVisible();
      await page.getByRole("tab", { name: /Em curso/ }).click();
    }
    const card = page.getByText("Proposta Sol Nascente").first();
    await expect(card).toBeVisible();

    await page.getByRole("button", { name: /Mover «Proposta Sol Nascente»/ }).click();
    await page.getByRole("menuitem", { name: "Concluído" }).click();
    await expect.poll(() => lastRequest(state, "PATCH", /^\/activities\/a1\/move$/)?.body?.status).toBe("DONE");
    // Mover não deve abrir a gaveta de edição.
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("arrastar pela pega muda o estado (computador)", async ({ page, context }) => {
    test.skip(test.info().project.name !== "desktop", "arrastar com rato só no computador");
    const state = await setup(page, context);
    await page.goto("./activities");
    const handle = page.getByRole("button", { name: /Arrastar «Proposta Sol Nascente»/ });
    const target = page.getByRole("region", { name: "A fazer" });
    const from = (await handle.boundingBox())!;
    const to = (await target.boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + 20, from.y + 20, { steps: 4 });
    await page.mouse.move(to.x + to.width / 2, to.y + 80, { steps: 12 });
    await page.mouse.up();
    await expect.poll(() => lastRequest(state, "PATCH", /^\/activities\/a1\/move$/)?.body?.status).toBe("TODO");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("tocar num cartão abre a edição", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./activities");
    if (isPhone()) await page.getByRole("tab", { name: /Em curso/ }).click();
    await page.getByText("Proposta Sol Nascente").first().click();
    await expect(page.getByRole("dialog")).toContainText("Editar Actividade");
  });
});

test.describe("calendário", () => {
  test("lista no telemóvel, grelha no computador; tocar abre a actividade", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./calendar");
    if (isPhone()) {
      await expect(page.locator(".fc-list")).toBeVisible();
      // A barra de ferramentas cabe no ecrã.
      for (const sel of [".fc-header-toolbar", ".fc-footer-toolbar"]) {
        await expectInViewport(page, page.locator(sel));
      }
    } else {
      await expect(page.locator(".fc-daygrid")).toBeVisible();
    }
    await page.locator(".fc-event, .fc-list-event").filter({ hasText: "Reunião de arranque" }).first().click();
    await expect(page.getByRole("dialog")).toContainText("Editar Actividade");
  });
});

test.describe("notificações", () => {
  test("o sino abre dentro do ecrã e marca como lida", async ({ page, context }) => {
    const state = await setup(page, context);
    await page.goto("./dashboard");
    await page.getByRole("button", { name: "Notificações" }).click();
    const item = page.getByRole("menuitem", { name: /Prazo em 1 h/ });
    await expect(item).toBeVisible();
    await expectInViewport(page, page.getByRole("menu"));
    await item.click();
    await expect.poll(() => lastRequest(state, "POST", /^\/notifications\/n1\/read$/) !== undefined).toBe(true);
    // Clicar abre o detalhe (como no sino do MindGest) e fecha sem bloquear a página.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(/Prazo em 1 h/);
    await dialog.getByRole("button", { name: "Fechar" }).first().click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Notificações" })).toBeEnabled();
  });

  test("«Ver todas» abre a página de notificações", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./dashboard");
    await page.getByRole("button", { name: "Notificações" }).click();
    await page.getByRole("link", { name: "Ver todas" }).click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(page.getByRole("heading", { name: "Notificações" }).first()).toBeVisible();
    await expect(page.getByText(/Prazo em 1 h/).first()).toBeVisible();
  });
});

test.describe("documentos", () => {
  test("contrato: valida, pré-visualiza e guarda", async ({ page, context }) => {
    const state = await setup(page, context);
    await page.goto("./documents/contract/add");
    await expect(page.getByRole("heading", { name: "Emitir Novo Contrato" })).toBeVisible();

    const bar = page.getByTestId("mobile-action-bar");
    const save = isPhone() ? bar.getByRole("button", { name: "Guardar" }) : page.getByRole("button", { name: "Guardar" }).first();
    const preview = isPhone() ? bar.getByRole("button", { name: /Pré-visualizar/ }) : page.getByRole("button", { name: /Pré-visualizar/ }).first();

    if (isPhone()) {
      // A barra de acções está colada ao fundo e dentro do ecrã.
      await expect(bar).toBeVisible();
      const box = (await bar.boundingBox())!;
      expect(box.y + box.height).toBeGreaterThan(page.viewportSize()!.height - 4);
      await expectInViewport(page, bar);
    }

    // Validação: falta a denominação e o NIF.
    await save.click();
    await expect(page.getByText("Indique denominação.")).toBeVisible();
    expect(lastRequest(state, "POST", /^\/documents$/)).toBeUndefined();

    await page.getByLabel("Denominação *").fill("Sol Nascente Telecomunicações, S.A.");
    await save.click();
    await expect(page.getByText("Indique o NIF.")).toBeVisible();

    await page.getByLabel("NIF *").fill("5417003821");
    await page.getByLabel("Pela Mindware (nome)").fill("Ana Fernandes");
    await save.click();
    await expect(page.getByText("Indique o cargo de quem assina pela Mindware.")).toBeVisible();
    await page.getByLabel("Pela Mindware (cargo)").fill("Directora Geral");

    await preview.click();
    await expect.poll(() => lastRequest(state, "POST", /\/documents\/preview-live$/)?.body?.type).toBe("contract");
    if (isTouch()) {
      // No telemóvel e no tablet o PDF abre no visor do sistema (iframes de PDF falham no iOS).
      await expect(page.getByRole("link", { name: "Abrir PDF" })).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(0);
    } else {
      await expect(page.locator("iframe[title='Pré-visualização do PDF']")).toBeVisible();
    }

    await page.getByRole("tab", { name: "Formulário" }).click();
    await save.click();
    await expect.poll(() => lastRequest(state, "POST", /^\/documents$/)?.body?.type).toBe("contract");
    const body = lastRequest(state, "POST", /^\/documents$/)!.body;
    expect(body.clientNif).toBe("5417003821");
    expect(body.metadata.firstSignatory).toEqual({ name: "Ana Fernandes", role: "Directora Geral" });
    expect(body.metadata.ipModel).toBe("transfer");
    expect(body.templateId).toBeUndefined();
  });

  test("declaração: nome obrigatório e dados de admissão", async ({ page, context }) => {
    const state = await setup(page, context);
    await page.goto("./documents/declaration/add");
    const save = isPhone() ? page.getByTestId("mobile-action-bar").getByRole("button", { name: "Guardar" }) : page.getByRole("button", { name: "Guardar" }).first();

    await save.click();
    await expect(page.getByText("Preencha «Nome completo».")).toBeVisible();

    await page.getByLabel("Nome completo *").fill("Maria Helena Costa");
    await page.getByLabel("Função *").fill("Analista de Sistemas");
    await page.getByLabel("Data de admissão").fill("02 de Março de 2022");
    await save.click();
    await expect.poll(() => lastRequest(state, "POST", /^\/documents$/)?.body?.type).toBe("declaration");
    const body = lastRequest(state, "POST", /^\/documents$/)!.body;
    expect(body.metadata.workerAdmissionDate).toBe("02 de Março de 2022");
    expect(body.metadata.workerGender).toBe("M");
  });

  test("a lista de contratos mostra o documento e o menu de acções", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./documents/contract");
    await expect(page.locator("text=CONT-2026-014 >> visible=true").first()).toBeVisible();
    await page.getByRole("button", { name: "Open actions menu" }).first().click();
    await expect(page.getByRole("menuitem", { name: "Editar", exact: true })).toBeVisible();
    await expectInViewport(page, page.getByRole("menu"));
  });
});

test.describe("relatórios", () => {
  test("alternar entre equipa e membro e descarregar o PDF", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./reports");
    await expect(page.getByText("Concluídas por membro")).toBeVisible();

    await page.getByRole("tab", { name: "Membro" }).click();
    await expect(page.getByText("Distribuição das actividades")).toBeVisible();
    // Os cinco separadores da lista não podem alargar a página.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole("tab", { name: /Atrasadas/ }).click();
    await expect(page.locator("text=Relatório mensal >> visible=true").first()).toBeVisible();

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Descarregar PDF" }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});

test.describe("utilizadores", () => {
  test("criar utilizador na gaveta, com campos grandes o bastante para tocar", async ({ page, context }) => {
    await setup(page, context);
    await page.goto("./users");
    await page.getByRole("button", { name: "Novo Utilizador" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expectInViewport(page, drawer);
    if (isTouch()) {
      const field = drawer.getByLabel("Nome *");
      const box = (await field.locator("xpath=..").boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
    await expect(drawer.getByRole("button", { name: "Criar Utilizador" })).toBeDisabled();
    await drawer.getByLabel("Nome *").fill("Paulo Dias");
    await drawer.getByLabel("Email *").fill("paulo.dias@mindware.ao");
    await drawer.getByLabel("Senha inicial *").fill("SenhaSegura#2026");
    await expect(drawer.getByRole("button", { name: "Criar Utilizador" })).toBeEnabled();
  });
});
