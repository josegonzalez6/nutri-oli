import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const demoEmail = "professional.demo@nutri-oli.test";
const demoPassword = "NutriOliDemo123!";

async function signInProfessional(page: Page) {
  if (!authConfigured) {
    return;
  }

  await page.goto("/es/login");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Contrasena").fill(demoPassword);
  await page.getByRole("button", { name: "Iniciar sesion" }).click();
  await expect(page).toHaveURL(/\/es\/profesional$/);
}

test("professional dashboard renders without authentication bypass assumptions", async ({
  page
}) => {
  await signInProfessional(page);
  await page.goto("/es/profesional");

  await expect(page.getByRole("heading", { name: "Panel profesional" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegacion principal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atencion requerida" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Clientes en seguimiento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consulta guiada" })).toBeVisible();
  await expectMainToPassAxe(page);
});

test("professional navigation is reachable by keyboard", async ({ page }) => {
  await signInProfessional(page);
  await page.goto("/es/profesional");

  const agendaLink = page
    .getByRole("navigation", { name: "Navegacion principal" })
    .getByRole("link", { name: "Agenda" });

  await agendaLink.focus();
  await expect(agendaLink).toBeFocused();
  await agendaLink.press("Enter");
  await expect(page).toHaveURL(/\/es\/profesional\/agenda$/);
});

test("client portal exposes only published-client framing", async ({ page }) => {
  await page.goto("/es/portal");

  if (authConfigured) {
    await expect(page).toHaveURL(/\/es\/login$/);
    return;
  }

  await expect(page.getByRole("heading", { name: "Portal del cliente" })).toBeVisible();
  await expect(page.getByText("Solo versiones publicadas por el profesional.")).toBeVisible();
  await expectMainToPassAxe(page);
});

test("login route does not expose a fake authentication action", async ({ page }) => {
  await page.goto("/es/login");

  await expect(page.getByRole("heading", { name: "Acceso profesional" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contrasena")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar sesion" })).toBeVisible();

  if (authConfigured) {
    await page.getByLabel("Email").fill(demoEmail);
    await page.getByLabel("Contrasena").fill(demoPassword);
    await page.getByRole("button", { name: "Iniciar sesion" }).click();
    await expect(page).toHaveURL(/\/es\/profesional$/);
  }

  await expectMainToPassAxe(page);
});

test("professional food catalog supports search and remains accessible", async ({ page }) => {
  await signInProfessional(page);
  await page.goto("/es/profesional/alimentos");

  await expect(page.getByRole("heading", { name: "Catalogo de alimentos" })).toBeVisible();
  await page.getByLabel("Buscar alimento", { exact: true }).fill("aceite");
  await expect(page.getByRole("row", { name: /Aceite de oliva/i }).first()).toBeVisible();
  await expectMainToPassAxe(page);
});

test("professional clients page creates a persistent client", async ({ page }, testInfo) => {
  await signInProfessional(page);
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
  await expectMainToPassAxe(page);
});

test("professional client record persists intake consultation and anthropometry", async ({
  page
}, testInfo) => {
  await signInProfessional(page);
  const suffix = testInfo.project.name;
  const clientId =
    testInfo.project.name === "mobile"
      ? "00000000-0000-4000-8000-000000000202"
      : "00000000-0000-4000-8000-000000000201";
  const clientName = testInfo.project.name === "mobile" ? "Cliente Demo B" : "Cliente Demo A";
  const recordUrl = `/es/profesional/clientes/${clientId}`;

  await page.goto(recordUrl);

  await expect(page.getByRole("heading", { name: clientName })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anamnesis y entrevista clinica" })).toBeVisible();
  await page.getByLabel("Motivo de consulta").fill(`Motivo E2E ${suffix}`);
  await page.getByLabel("Alergias").fill(`Alergia ficticia E2E ${suffix}`);
  await page.getByRole("button", { name: "Guardar anamnesis" }).click();
  await expect(page.getByText("Anamnesis guardada como borrador.")).toBeVisible();

  await page.reload();
  await expect(page.locator("textarea[name='motive']")).toHaveValue(`Motivo E2E ${suffix}`);
  await expect(page.getByText(`Alergia ficticia E2E ${suffix}`).first()).toBeVisible();

  const consultation = page.locator("section#consulta");
  await consultation.locator("textarea[name='reason']").fill(`Consulta E2E ${suffix}`);
  await consultation
    .locator("textarea[name='assessment']")
    .fill("Assessment ficticio persistente.");
  await consultation.locator("textarea[name='sharedSummary']").fill("Resumen ficticio E2E.");
  await consultation.locator("textarea[name='privateNote']").fill("Nota privada ficticia E2E.");
  await consultation.getByRole("button", { name: "Guardar consulta" }).click();
  await expect(page.getByText("Borrador de consulta guardado.")).toBeVisible();

  await page.reload();
  await expect(consultation.locator("textarea[name='reason']")).toHaveValue(
    `Consulta E2E ${suffix}`
  );

  const anthropometry = page.locator("section#antropometria");
  await anthropometry.getByRole("button", { name: "Informacion de Pliegue tricipital" }).click();
  await expect(anthropometry.getByText("Fuente:").first()).toBeVisible();
  await fillMeasurement(anthropometry, "Masa corporal", "74.0", "74.4");
  await fillMeasurement(anthropometry, "Talla", "171.5", "171.6");
  await fillMeasurement(anthropometry, "Pliegue subescapular", "16.0", "16.2");
  await fillMeasurement(anthropometry, "Pliegue bicipital", "6.0", "6.1");
  await fillMeasurement(anthropometry, "Pliegue cresta iliaca", "18.0", "18.4");
  await fillMeasurement(anthropometry, "Pliegue supraespinal", "14.0", "14.2");
  await fillMeasurement(anthropometry, "Pliegue abdominal", "21.0", "21.5");
  await fillMeasurement(anthropometry, "Pliegue muslo anterior", "24.0", "24.4");
  await fillMeasurement(anthropometry, "Pliegue pierna medial", "12.0", "12.2");
  await fillMeasurement(anthropometry, "Perimetro brazo relajado", "29.0", "29.1");
  await fillMeasurement(anthropometry, "Perimetro brazo flexionado", "31.0", "31.2");
  await fillMeasurement(anthropometry, "Perimetro cintura", "82.4", "82.6");
  await fillMeasurement(anthropometry, "Perimetro cadera", "98.1", "98.2");
  await fillMeasurement(anthropometry, "Perimetro muslo", "55.0", "55.2");
  await fillMeasurement(anthropometry, "Perimetro pierna", "37.0", "37.1");
  await fillMeasurement(anthropometry, "Diametro humero", "6.80", "6.85");
  await fillMeasurement(anthropometry, "Diametro femur", "9.50", "9.55");
  await anthropometry.getByLabel("Pliegue tricipital primera toma").fill("10");
  await anthropometry.getByLabel("Pliegue tricipital segunda toma").fill("12");
  await expect(anthropometry.getByText("Tercera necesaria").first()).toBeVisible();
  await anthropometry.getByLabel("Pliegue tricipital tercera toma").fill("10.5");
  await anthropometry.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Sesion antropometrica guardada como borrador.")).toBeVisible();

  await page.reload();
  await expect(anthropometry.getByLabel("Masa corporal primera toma")).toHaveValue("74");
  await expect(anthropometry.getByLabel("Pliegue tricipital tercera toma")).toHaveValue("10.5");
  await expect(page.getByText("74,2 kg").first()).toBeVisible();
  await expect(page.getByText(/25,2/).first()).toBeVisible();
  await expect(anthropometry.getByRole("link", { name: "Descargar PDF" })).toHaveCount(0);
  await anthropometry.getByRole("button", { name: "Finalizar sesion" }).click();
  await expect(page.getByText("Sesion antropometrica finalizada y bloqueada.")).toBeVisible();

  await page.reload();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    anthropometry.getByRole("link", { name: "Descargar PDF" }).click()
  ]);
  expect(download.suggestedFilename()).toMatch(/nutri-oli-antropometria-.*\.pdf$/);
  await expectMainToPassAxe(page);
});

async function expectMainToPassAxe(page: Page) {
  expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
}

async function fillMeasurement(
  root: ReturnType<Page["locator"]>,
  label: string,
  firstValue: string,
  secondValue: string
) {
  await root.getByLabel(`${label} primera toma`).fill(firstValue);
  await root.getByLabel(`${label} segunda toma`).fill(secondValue);
}

test("professional agenda page creates a persistent appointment", async ({ page }, testInfo) => {
  await signInProfessional(page);
  const startsAt =
    testInfo.project.name === "mobile" ? "2026-07-29T17:00:00+02:00" : "2026-07-29T16:00:00+02:00";
  const note = `E2E agenda ${testInfo.project.name}`;

  await page.goto("/es/profesional/agenda");

  await expect(page.getByRole("heading", { name: "Agenda persistente" })).toBeVisible();
  await page
    .locator("select[name='clientId']")
    .selectOption("00000000-0000-4000-8000-000000000203");
  await page
    .locator("select[name='serviceId']")
    .selectOption("00000000-0000-4000-8000-000000000102");
  await page.getByLabel("Inicio con zona horaria").fill(startsAt);
  await page.getByLabel("Modalidad").selectOption("online");
  await page.getByLabel("Notas administrativas").fill(note);
  await page.getByRole("button", { name: "Crear cita" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Cita creada.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Cliente Demo C").first()).toBeVisible();
  await expectMainToPassAxe(page);
});
