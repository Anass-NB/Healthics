// Integration test for Big Data Analytics functionality
import { test, expect, Page } from '@playwright/test';

// Test configuration
const FRONTEND_URL = 'http://localhost:8006';
const TEST_ADMIN_USERNAME = 'admin';
const TEST_ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page: Page) {
  await page.goto(`${FRONTEND_URL}/login`);
  
  // Fill login form
  await page.fill('input[placeholder="Username"]', TEST_ADMIN_USERNAME);
  await page.fill('input[placeholder="Password"]', TEST_ADMIN_PASSWORD);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard or home page
  await page.waitForURL(/\/(admin\/dashboard|$)/);
}

test.describe('Big Data Analytics Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page);
  });

  test('should navigate to analytics page from admin navigation', async ({ page }) => {
    // Click on Big Data Analytics in navigation
    await page.click('text=Big Data Analytics');
    
    // Verify we're on the analytics page
    await page.waitForURL('**/admin/analytics');
    await expect(page).toHaveTitle(/Analytics/);
    
    // Check for main analytics components
    await expect(page.locator('text=Big Data Analytics Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="analytics-tabs"]')).toBeVisible();
  });

  test('should display analytics overview tab with key metrics', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="overview-tab"]');
    
    // Check overview metrics are displayed
    await expect(page.locator('text=Documents Processed')).toBeVisible();
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Avg Processing Time')).toBeVisible();
    await expect(page.locator('text=System Health')).toBeVisible();
    
    // Check for charts and visualizations
    await expect(page.locator('[data-testid="medical-conditions-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
  });

  test('should allow switching between analytics tabs', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Switch to Analytics tab
    await page.click('text=Analytics');
    await expect(page.locator('[data-testid="analytics-content"]')).toBeVisible();
    
    // Switch to System tab
    await page.click('text=System');
    await expect(page.locator('[data-testid="system-content"]')).toBeVisible();
    
    // Switch back to Overview tab
    await page.click('text=Overview');
    await expect(page.locator('[data-testid="overview-content"]')).toBeVisible();
  });

  test('should perform patient analysis and display results', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Click on Analytics tab
    await page.click('text=Analytics');
    
    // Click analyze patient button
    await page.click('[data-testid="analyze-patient-btn"]');
    
    // Fill patient ID (assuming there's an input field)
    if (await page.locator('input[placeholder*="Patient ID"]').isVisible()) {
      await page.fill('input[placeholder*="Patient ID"]', '1');
    }
    
    // Click analyze button
    await page.click('button:has-text("Analyze")');
    
    // Wait for results modal or results section
    await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 10000 });
    
    // Check if results are displayed
    await expect(page.locator('text=Analysis Results')).toBeVisible();
  });

  test('should display medical conditions analysis', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Click on Analytics tab
    await page.click('text=Analytics');
    
    // Click extract medical conditions button
    await page.click('[data-testid="extract-conditions-btn"]');
    
    // Wait for loading to complete
    await page.waitForFunction(() => {
      const button = document.querySelector('[data-testid="extract-conditions-btn"]');
      return button && !button.hasAttribute('disabled');
    }, { timeout: 10000 });
    
    // Check if medical conditions are displayed
    await expect(page.locator('text=Medical Conditions')).toBeVisible();
    await expect(page.locator('[data-testid="conditions-list"]')).toBeVisible();
  });

  test('should show healthcare trends analysis', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Click on Analytics tab
    await page.click('text=Analytics');
    
    // Click analyze trends button
    await page.click('[data-testid="analyze-trends-btn"]');
    
    // Wait for trends data to load
    await page.waitForSelector('[data-testid="trends-visualization"]', { timeout: 10000 });
    
    // Check trends components
    await expect(page.locator('text=Healthcare Trends')).toBeVisible();
    await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
  });

  test('should display system information and metrics', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Click on System tab
    await page.click('text=System');
    
    // Check system metrics are displayed
    await expect(page.locator('text=System Performance')).toBeVisible();
    await expect(page.locator('text=CPU Usage')).toBeVisible();
    await expect(page.locator('text=Memory Usage')).toBeVisible();
    await expect(page.locator('text=Disk Usage')).toBeVisible();
    
    // Check system capabilities
    await expect(page.locator('text=Analytics Capabilities')).toBeVisible();
    await expect(page.locator('text=Sentiment Analysis')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Mock network failure for testing error handling
    await page.route('**/api/analysis/**', route => {
      route.abort('failed');
    });
    
    // Try to perform an analysis that should fail
    await page.click('text=Analytics');
    await page.click('[data-testid="analyze-patient-btn"]');
    
    // Check if error message is displayed
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="export-btn"]', { timeout: 10000 });
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('[data-testid="export-btn"]');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/analytics.*\.(json|csv|xlsx)$/);
  });

  test('should refresh analytics data', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="refresh-btn"]');
    
    // Click refresh button
    await page.click('[data-testid="refresh-btn"]');
    
    // Check if loading indicator appears
    await expect(page.locator('[data-testid="loading-overlay"]')).toBeVisible();
    
    // Wait for refresh to complete
    await page.waitForFunction(() => {
      const loadingOverlay = document.querySelector('[data-testid="loading-overlay"]');
      return !loadingOverlay || loadingOverlay.style.display === 'none';
    }, { timeout: 10000 });
  });
});

test.describe('Mobile Responsiveness Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
  });

  test('should display analytics page correctly on mobile', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Check if navigation is collapsed
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
    
    // Check if analytics tabs are responsive
    await expect(page.locator('[data-testid="analytics-tabs"]')).toBeVisible();
    
    // Check if cards stack vertically on mobile
    const cards = page.locator('[data-testid="metric-card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      if (await secondCard.isVisible()) {
        const firstCardBox = await firstCard.boundingBox();
        const secondCardBox = await secondCard.boundingBox();
        
        // Cards should stack vertically (second card should be below first card)
        expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y || 0);
      }
    }
  });
});

test.describe('Performance Tests', () => {
  test('should load analytics page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await loginAsAdmin(page);
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Wait for main content to be visible
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle concurrent analytics requests', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Click Analytics tab
    await page.click('text=Analytics');
    
    // Trigger multiple analytics operations simultaneously
    const operations = [
      page.click('[data-testid="analyze-patient-btn"]'),
      page.click('[data-testid="extract-conditions-btn"]'),
      page.click('[data-testid="analyze-trends-btn"]')
    ];
    
    // Wait for all operations to start
    await Promise.all(operations);
    
    // Verify page doesn't crash and shows appropriate loading states
    await expect(page.locator('body')).toBeVisible();
  });
});
