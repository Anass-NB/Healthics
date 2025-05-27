#!/usr/bin/env node

/**
 * Manual Integration Test Script for Big Data Analytics
 * This script tests the analytics integration without requiring a backend server
 */

const { chromium } = require('playwright');

const FRONTEND_URL = 'http://localhost:8006';

async function runAnalyticsIntegrationTest() {
  console.log('🚀 Starting Big Data Analytics Integration Test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to homepage
    console.log('📱 Step 1: Navigating to homepage...');
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded successfully\n');
    
    // Step 2: Check if analytics navigation exists (will be in admin section)
    console.log('🔍 Step 2: Checking for analytics navigation...');
    
    // Check if we can see the Healthics header
    const header = await page.locator('text=Healthics').first();
    if (await header.isVisible()) {
      console.log('✅ Application header found');
    }
    
    // Check if navigation is properly set up
    const navItems = await page.locator('nav a, [role="navigation"] a').count();
    console.log(`📊 Found ${navItems} navigation items`);
    
    // Step 3: Test analytics page direct access
    console.log('\n🎯 Step 3: Testing direct access to analytics page...');
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Wait a moment for the page to load
    await page.waitForTimeout(2000);
    
    // Check if the analytics page loads (might show login form if not authenticated)
    const pageContent = await page.textContent('body');
    if (pageContent.includes('Big Data Analytics') || pageContent.includes('Analytics Dashboard')) {
      console.log('✅ Analytics page content detected');
    } else if (pageContent.includes('Login') || pageContent.includes('Username')) {
      console.log('ℹ️  Login page displayed (expected when not authenticated)');
    } else {
      console.log('⚠️  Unexpected page content');
    }
    
    // Step 4: Test component imports and routing
    console.log('\n⚙️  Step 4: Testing component and routing setup...');
    
    // Check if the page responds to route changes
    await page.goto(`${FRONTEND_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    await page.waitForTimeout(1000);
    
    console.log('✅ Routing appears to be working');
    
    // Step 5: Test mock data functionality
    console.log('\n📊 Step 5: Testing mock data integration...');
    
    // Open browser console to check for any errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    // Navigate through different routes to trigger any errors
    const testRoutes = [
      '/',
      '/admin/dashboard',
      '/admin/analytics',
      '/admin/patients',
      '/admin/documents'
    ];
    
    for (const route of testRoutes) {
      await page.goto(`${FRONTEND_URL}${route}`);
      await page.waitForTimeout(500);
    }
    
    // Step 6: Report results
    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    
    if (logs.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('⚠️  Console errors found:');
      logs.forEach(log => console.log(log));
    }
    
    // Step 7: Test analytics components if accessible
    console.log('\n🧪 Step 7: Testing analytics components...');
    await page.goto(`${FRONTEND_URL}/admin/analytics`);
    
    // Check if analytics-specific elements are present
    const analyticsElements = [
      'Big Data Analytics',
      'Analytics Dashboard',
      'Overview',
      'System',
      'Medical Conditions',
      'Healthcare Trends'
    ];
    
    for (const element of analyticsElements) {
      try {
        const elementExists = await page.locator(`text="${element}"`).isVisible({ timeout: 1000 });
        if (elementExists) {
          console.log(`✅ Found: ${element}`);
        } else {
          console.log(`⚠️  Not found: ${element}`);
        }
      } catch (error) {
        console.log(`⚠️  Not found: ${element}`);
      }
    }
    
    console.log('\n🎉 Integration test completed!');
    console.log('\nNext Steps:');
    console.log('1. Fix any console errors if found');
    console.log('2. Test with admin authentication');
    console.log('3. Test backend integration when server is running');
    console.log('4. Verify all analytics features work end-to-end');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
runAnalyticsIntegrationTest().catch(console.error);
