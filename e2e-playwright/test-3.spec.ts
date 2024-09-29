import { test, expect } from '@playwright/test';

test('creating a submission that passes the tests, checking the notification on the correctness of the submission, moving to the next assignment, and checking that the assignment is a new one.', async ({ page }) => {
  await page.goto('http://localhost:7800/');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('def hello():\n  return "Hello"');
  await page.getByRole('button', { name: 'Submit solution ctrl + enter' }).click();
  await expect(page.getByRole('list')).toContainText('Hello world new');
  await page.getByRole('textbox').fill('# Your code goes here');
  await page.getByText('Hello world new').click();
  await expect(page.getByRole('main')).toContainText('Write a function "hello" that returns the string "Hello world!"');
});