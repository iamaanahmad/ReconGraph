import { expect, test } from "@playwright/test";

test("runs the seeded reconciliation and exposes safe decisions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Reconcile every record");
  await page.getByRole("button", { name: "Run seeded reconciliation" }).click();

  await expect(page.getByText("Run complete.")).toBeVisible();
  await expect(page.getByText("98.1%", { exact: true })).toBeVisible();
  await expect(page.getByText("49", { exact: true })).toBeVisible();
  await expect(page.getByText("0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /pay_027/ }).click();
  await expect(
    page.getByRole("heading", { name: "The controller refused this edge" }),
  ).toBeVisible();
  await expect(page.getByText(/This edge stays out of the books/)).toBeVisible();
  await expect(page.getByText(/margin 0.00/)).toBeVisible();
});

test("has deterministic recovery states", async ({ page }) => {
  await page.goto("/?state=empty");
  await expect(
    page.getByRole("heading", { name: "There’s nothing to reconcile yet." }),
  ).toBeVisible();

  await page.goto("/?state=error");
  await expect(page.getByRole("heading", { name: /batch shape didn’t pass/ })).toBeVisible();
  await page.getByRole("button", { name: "Use safe replay" }).click();
  await expect(page.getByText("Run complete.")).toBeVisible();

  await page.goto("/?state=offline");
  await expect(page.getByText(/Offline mode/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Run seeded reconciliation" })).toBeVisible();
});

test("reset returns to the known initial state", async ({ page }) => {
  await page.goto("/?state=success");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("button", { name: "Run seeded reconciliation" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("keeps the core flow usable on a small screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?state=success");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /pay_027/ })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});
