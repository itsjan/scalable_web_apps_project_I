import { test, expect } from '@playwright/test';

test('verify that the points shown to the user change when the user solves a programming assignment', async ({ page }) => {
  await page.goto('http://localhost:7800/');
  await expect(page.locator('body')).toContainText('XP : 0');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await expect(page.locator('body')).toContainText('XP : 100');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await expect(page.locator('body')).toContainText('XP : 100');
  await page.getByRole('textbox').fill('# Your code goes here');
  await page.getByText('Hello world new').click();
  await page.getByRole('textbox').dblclick();
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await page.getByRole('textbox').fill('# Your code goes here');
  await expect(page.locator('body')).toContainText('XP : 100');
    await page.getByRole('textbox').fill('def hello():\n  return "Hello world!"');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await expect(page.locator('body')).toContainText('XP : 200');

});