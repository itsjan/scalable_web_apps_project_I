import { test, expect } from '@playwright/test';

test('creating a submission that fails the tests and checking the feedback on incorrect submission', async ({ page }) => {
  await page.goto('http://localhost:7800/');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').press('Shift+Home');
  await page.getByRole('textbox').fill('Hello my name is George');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await expect(page.getByText('Fail')).toBeVisible();
});
