import {test,expect} from '@playwright/test';
test('study question renders and keyboard can select',async({page})=>{await page.goto('/');await expect(page.getByText('Adaptive study')).toBeVisible();await page.keyboard.press('1');await expect(page.getByRole('button',{name:/Check/})).toBeEnabled()});
test('mock composition starts',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Mock'}).click();await page.getByRole('button',{name:'Start mock'}).click();await expect(page.getByText('Mock · 1/25')).toBeVisible()});
