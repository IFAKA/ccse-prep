import { test, expect } from '@playwright/test';

test('study question renders and keyboard can select', async ({ page }) => {
  await page.goto('/study');
  await expect(page.getByRole('heading', { name: /Question/ })).toBeVisible();
  await page.keyboard.press('1');
  await expect(page.getByRole('button', { name: 'Check' })).toBeEnabled();
});

test('study completes the ten-question minimum and continues indefinitely', async ({ page }) => {
  await page.goto('/study');
  await expect(page.getByRole('heading', { name: /Question/ })).toBeVisible();

  for (let index = 0; index < 10; index += 1) {
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Check' }).click();

    if (index < 9) await page.getByRole('button', { name: 'Continue' }).click();
  }

  await expect(page.getByText('Session complete')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
});

test('mock composition starts', async ({ page }) => {
  await page.goto('/mock');
  await page.getByRole('button', { name: 'Start Mock' }).click();
  await expect(page.getByText('Mock · 1/25')).toBeVisible();
});

test('reset completes without hanging on the IndexedDB connection', async ({ page }) => {
  await page.goto('/settings');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset Local Data' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByText('Make it yours.')).toBeVisible();
});

test('sound setting uses the native toggle', async ({ page }) => {
  await page.goto('/settings');
  const toggle = page.getByRole('checkbox', { name: 'Sound Effects' });
  await expect(toggle).toBeVisible();
  await toggle.check();
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect(toggle).not.toBeChecked();
});
