import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("professional dashboard renders without authentication bypass assumptions", async ({
  page
}) => {
  await page.goto("/es/profesional");

  await expect(page.getByRole("heading", { name: "Panel profesional" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegacion principal" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("client portal exposes only published-client framing", async ({ page }) => {
  await page.goto("/es/portal");

  await expect(page.getByRole("heading", { name: "Portal del cliente" })).toBeVisible();
  await expect(page.getByText("Solo versiones publicadas por el profesional.")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
