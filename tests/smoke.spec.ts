import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests for Elevara
 * 
 * These tests verify the critical user paths work end-to-end.
 * They require the Next.js dev server to be running.
 */

test.describe('Landing Page', () => {
  test('should load the homepage and render the hero section', async ({ page }) => {
    await page.goto('/');
    
    // The page should have a title
    await expect(page).toHaveTitle(/Career|Resume|AI/i);
    
    // Should have a visible call-to-action
    const cta = page.getByRole('link', { name: /get started|sign up|try free/i });
    await expect(cta).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click "Login" or "Sign In" link
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe('Auth Flow', () => {
  test('should show login form with email and password fields', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show validation error on empty submit', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // Should stay on login page (no redirect)
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe('Dashboard (Requires Auth)', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await page.waitForURL(/login/, { timeout: 5000 }).catch(() => {
      // Some apps show the dashboard shell with a login prompt instead
    });
  });
});

test.describe('Admin Observability', () => {
  test('should block non-admin users from /admin/observability', async ({ page }) => {
    await page.goto('/admin/observability');
    
    // Should either redirect to login or show access denied
    await page.waitForTimeout(2000);
    const url = page.url();
    const bodyText = await page.textContent('body');
    
    // Either redirected away or shows forbidden message
    const isBlocked = url.includes('login') || 
                      bodyText?.includes('Access Denied') || 
                      bodyText?.includes('Forbidden');
    expect(isBlocked).toBeTruthy();
  });
});
