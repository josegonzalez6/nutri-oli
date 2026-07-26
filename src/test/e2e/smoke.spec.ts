import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("professional dashboard renders without authentication bypass assumptions", async ({
  page
}) => {
  await page.goto("/es/profesional");

  await expect(page.getByRole("heading", { name: "Panel profesional" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegacion principal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atencion requerida" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Clientes en seguimiento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consulta guiada" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("professional navigation is reachable by keyboard", async ({ page }) => {
  await page.goto("/es/profesional");

  const agendaLink = page
    .getByRole("navigation", { name: "Navegacion principal" })
    .getByRole("link", { name: "Agenda" });

  await agendaLink.focus();
  await expect(agendaLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/es\/profesional\/agenda$/);
});

test("client portal exposes only published-client framing", async ({ page }) => {
  await page.goto("/es/portal");

  await expect(page.getByRole("heading", { name: "Portal del cliente" })).toBeVisible();
  await expect(page.getByText("Solo versiones publicadas por el profesional.")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("login route does not expose a fake authentication action", async ({ page }) => {
  await page.goto("/es/login");

  await expect(page.getByRole("heading", { name: "Acceso pendiente de conectar" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("button")).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("professional food catalog supports search and remains accessible", async ({ page }) => {
  await page.goto("/es/profesional/alimentos");

  await expect(page.getByRole("heading", { name: "Catalogo de alimentos" })).toBeVisible();
  await page.getByLabel("Buscar alimento").fill("aceite");
  await expect(page.getByRole("row", { name: /Aceite de oliva/i }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("professional clients page creates a persistent client", async ({ page }, testInfo) => {
  const suffix = `${testInfo.project.name}-${Date.now()}`.replace(/[^a-z0-9-]/gi, "-");

  await page.goto("/es/profesional/clientes");

  await expect(page.getByRole("heading", { name: "Clientes persistentes" })).toBeVisible();
  await page.getByLabel("Codigo interno").fill(`E2E-${suffix}`);
  await page.getByLabel("Nombre visible").fill(`Cliente E2E ${testInfo.project.name}`);
  await page.getByLabel("Email").fill(`cliente.${suffix}@example.test`);
  await page.getByLabel("Objetivo").fill("Registro ficticio de prueba E2E.");
  await page.getByRole("button", { name: "Crear cliente" }).click();
  await expect(page.getByText("Cliente creado.")).toBeVisible();

  await page.reload();
  await expect(page.getByText(`E2E-${suffix}`)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("professional agenda page creates a persistent appointment", async ({ page }, testInfo) => {
  const startsAt =
    testInfo.project.name === "mobile" ? "2026-07-29T17:00:00+02:00" : "2026-07-29T16:00:00+02:00";
  const note = `E2E agenda ${testInfo.project.name}`;

  await page.goto("/es/profesional/agenda");

  await expect(page.getByRole("heading", { name: "Agenda persistente" })).toBeVisible();
  await page.getByLabel("Cliente").selectOption("00000000-0000-4000-8000-000000000203");
  await page
    .getByRole("combobox", { name: "Servicio" })
    .selectOption("00000000-0000-4000-8000-000000000102");
  await page.getByLabel("Inicio con zona horaria").fill(startsAt);
  await page.getByLabel("Modalidad").selectOption("online");
  await page.getByLabel("Notas administrativas").fill(note);
  await page.getByRole("button", { name: "Crear cita" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Cita creada.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Cliente Demo C").first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
