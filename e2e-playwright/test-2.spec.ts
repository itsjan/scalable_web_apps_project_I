import { test, expect } from '@playwright/test';

test('creating a submission that passes the tests and checking the notification on the correctness of the submission', async ({ page }) => {
  await page.goto('http://localhost:7800/');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await expect(page.getByText('Pass')).toBeVisible();
  await expect(page.getByText('Hello world new')).toBeVisible();
  await expect(page.getByRole('main')).toContainText('OK');
});