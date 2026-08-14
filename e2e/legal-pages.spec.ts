import { test, expect } from "@playwright/test";

test("terms page renders", async ({ page }) => {
  await page.goto("/terms");

  await expect(page).toHaveTitle("Terms of Service - Memberry");
  await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
  await expect(page.getByText("getmemberry@gmail.com")).toBeVisible();
});

test("privacy page renders", async ({ page }) => {
  await page.goto("/privacy");

  await expect(page).toHaveTitle("Privacy Policy - Memberry");
  await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  await expect(page.getByText("getmemberry@gmail.com")).toBeVisible();
});
