import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:7800/');
  await page.getByRole('textbox').fill('# Your code goes here');
  await expect(page.getByText('XP0')).toBeVisible();
  
  await page.getByRole('textbox').click({
    clickCount: 3
  });
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await page.getByRole('textbox').press('ArrowRight');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await expect(page.getByText('XP100')).toBeVisible();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').press('ControlOrMeta+a');
  await page.getByRole('textbox').press('ControlOrMeta+c');
  await page.getByRole('textbox').fill('# Your code goes here');
  await page.getByText('Hello world new').click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"# Your code goes here');
  await page.getByRole('textbox').press('ArrowLeft');
  await page.getByRole('textbox').fill('def hello():\n  return "Hello world!"# Your code goes here');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello world!"# Your code goes here');
  await expect(page.getByText('XP200')).toBeVisible();
});