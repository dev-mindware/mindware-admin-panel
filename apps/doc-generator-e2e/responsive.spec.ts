import { expect, test, type Page } from "@playwright/test";
import * as fs from "fs";
import { login, mockApi } from "./mock-api";

/**
 * Auditoria de responsividade: em cada ecrã e cada rota, a página não pode ter
 * scroll horizontal, nem erros, e os controlos têm de ser tocáveis.
 */
const ROUTES = [
  "/dashboard",
  "/activities",
  "/calendar",
  "/reports",
  "/documents/proposal",
  "/documents/contract",
  "/documents/contract/add",
  "/documents/declaration/add",
  "/documents/letter/add",
  "/clients",
  "/clauses",
  "/users",
  "/logs",
];

const SHOTS = "screenshots";

/** Altura/largura mínimas dos controlos em ecrãs de toque (WCAG 2.5.8 exige 24; Apple e Material, 44–48). */
const MIN_TOUCH = 44;
const HARD_MIN = 43; // 44 px com 1 px de tolerância de arredondamento

async function audit(page: Page) {
  return page.evaluate(
    ({ hardMin }) => {
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && r.bottom > 0;
      };
      const label = (el: Element) =>
        (el.getAttribute("aria-label") || (el as HTMLElement).innerText || el.getAttribute("placeholder") || el.tagName)
          .trim().replace(/\s+/g, " ").slice(0, 40);

      const small: string[] = [];
      document
        .querySelectorAll("button, a[href], [role=button], [role=tab], [role=menuitem], input:not([type=hidden]), select, textarea, [role=combobox]")
        .forEach((el) => {
          if (!visible(el) || (el as HTMLInputElement).disabled) return;
          // O próprio input do react-select é invisível/minúsculo por desenho.
          if ((el as HTMLElement).closest("[class*=react-select]") && el.tagName === "INPUT") return;
          // Num campo de texto, o alvo de toque é a caixa visível (o contentor com borda), não a faixa interior.
          const box = el.tagName === "INPUT" && el.parentElement && parseFloat(getComputedStyle(el.parentElement).borderTopWidth) > 0 ? el.parentElement : el;
          const r = box.getBoundingClientRect();
          if (Math.min(r.width, r.height) < hardMin) small.push(`${label(el)} (${Math.round(r.width)}x${Math.round(r.height)})`);
        });

      // Cada campo tem de ter nome acessível (etiqueta associada, aria-label ou título).
      const unnamed: string[] = [];
      document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
        if (!visible(el)) return;
        const i = el as HTMLInputElement;
        if (el.closest("[class*=react-select]") && el.tagName === "INPUT") return;
        const named = (i.labels && i.labels.length > 0) || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
        if (!named) unnamed.push(`${el.tagName.toLowerCase()}[${i.type || ""}] ${(i.placeholder || "").slice(0, 30)}`);
      });

      const smallText: string[] = [];
      document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), select, textarea").forEach((el) => {
        if (!visible(el)) return;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 16) smallText.push(`${label(el)} (${size}px)`);
      });

      const overflowing: string[] = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > window.innerWidth + 1 && visible(el)) {
          // ignora conteúdo dentro de contentores com scroll próprio
          let p: Element | null = el.parentElement;
          while (p) {
            const s = getComputedStyle(p);
            if (/(auto|scroll)/.test(s.overflowX) || /(auto|scroll|hidden)/.test(s.overflow)) return;
            p = p.parentElement;
          }
          if (overflowing.length < 6) overflowing.push(`${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 40)} (right=${Math.round(r.right)})`);
        }
      });

      return {
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        small,
        unnamed,
        smallText,
        overflowing,
        viewportMeta: document.querySelector('meta[name=viewport]')?.getAttribute("content") ?? null,
      };
    },
    { hardMin: HARD_MIN },
  );
}

for (const route of ROUTES) {
  test(`responsivo: ${route}`, async ({ page, context }, info) => {
    await login(context);
    await mockApi(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
    page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text().slice(0, 160)));

    const response = await page.goto(`.${route}`);
    expect(response?.status(), "estado HTTP").toBeLessThan(400);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("This page could not be found")).toHaveCount(0);
    // O cabeçalho da página tem de ter carregado (não só o esqueleto).
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await page.waitForTimeout(600);

    fs.mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: `${SHOTS}/${info.project.name}${route.replace(/\//g, "_")}.png`, fullPage: true });

    const a = await audit(page);
    const isTouch = info.project.name !== "desktop";

    expect.soft(a.viewportMeta, "meta viewport").toContain("width=device-width");
    expect.soft(a.scrollW, `scroll horizontal da página (${a.overflowing.join("; ")})`).toBeLessThanOrEqual(a.innerW + 1);
    expect.soft(errors, "erros na consola").toEqual([]);
    if (isTouch) {
      expect.soft(a.small, `controlos com menos de 44px`).toEqual([]);
      expect.soft(a.smallText, "campos com letra < 16px (o iOS faz zoom ao focar)").toEqual([]);
    }
    expect.soft(a.unnamed, "campos sem nome acessível").toEqual([]);
    test.info().annotations.push({ type: "touch<44", description: String(a.small.length) });
  });
}
