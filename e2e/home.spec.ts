import { test, expect } from "@playwright/test";

test("home page loads with nav and hero", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Memberry" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Book a Demo" })).toBeVisible();
});

test("nav links point to in-page sections", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");

  for (const { label, href } of [
    { label: "Features", href: "#features" },
    { label: "App", href: "#merchant-app" },
    { label: "Pricing", href: "#pricing" },
    { label: "Team", href: "#team" },
  ]) {
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
  }
});

test("nav link scrolls to the pricing section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/#pricing$/);
});
