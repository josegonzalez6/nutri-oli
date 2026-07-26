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

  const foodLink = page
    .getByRole("navigation", { name: "Navegacion principal" })
    .getByRole("link", { name: "Alimentos" });

  await foodLink.focus();
  await expect(foodLink).toBeFocused();
  await foodLink.press("Enter");
  await expect(page).toHaveURL(/\/es\/profesional\/alimentos$/);
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
