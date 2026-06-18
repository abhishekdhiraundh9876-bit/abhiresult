const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3000;
app.use(express.static(__dirname));

let server;

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
      const page = await browser.newPage();
      
      // Capture page console logs
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('response', response => {
        if (!response.ok()) {
          console.log(`HTTP ${response.status()} for ${response.url()}`);
        }
      });
      
      console.log('Testing Home Page (index.html)...');
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle2' });
      
      // Test 1: Check Page Title
      const title = await page.title();
      if (!title.includes('Abhi Result')) throw new Error('Title check failed. Found: ' + title);
      console.log('✅ Title check passed');

      // Test 2: LocalStorage Initialization
      const siteDataExists = await page.evaluate(() => typeof window.siteData !== 'undefined');
      console.log('Is siteData defined? ', siteDataExists);
      if (!siteDataExists) {
        const errorMsg = await page.evaluate(() => window.testError || 'none');
        console.log('Window Error:', errorMsg);
      }

      const lsVersion = await page.evaluate(() => localStorage.getItem('sr_db_version'));
      if (!lsVersion) throw new Error('Local Storage Initialization failed. sr_db_version is null');
      console.log('✅ LocalStorage Initialization passed (Version: ' + lsVersion + ')');

      // Test 3: Ticker presence
      const tickerContent = await page.evaluate(() => document.getElementById('tickerContent')?.textContent);
      if (!tickerContent || tickerContent.includes('Loading latest updates...')) throw new Error('Ticker data not loaded');
      console.log('✅ Ticker data loaded');

      // Test 4: Jobs Table loading
      const jobsCount = await page.evaluate(() => document.querySelectorAll('#latestJobsTable .notice-row').length);
      if (jobsCount === 0) throw new Error('Jobs table not populated');
      console.log(`✅ Jobs table populated with ${jobsCount} entries`);

      // Test 5: Search Functionality
      console.log('Testing Search functionality...');
      await page.type('#searchInput', 'UPSC');
      await new Promise(r => setTimeout(r, 500)); // Wait for search logic
      const searchResultsCount = await page.evaluate(() => document.querySelectorAll('#searchResults .search-result-item').length);
      if (searchResultsCount === 0) throw new Error('Search failed to return results');
      console.log(`✅ Search returning ${searchResultsCount} results for "UPSC"`);

      // Test 6: Check other pages load correctly
      const pagesToTest = ['latest-jobs.html', 'results.html', 'admit-card.html', 'answer-key.html', 'syllabus.html', 'admission.html', 'tools.html'];
      
      for (const p of pagesToTest) {
        console.log(`Testing ${p}...`);
        const res = await page.goto(`http://localhost:${PORT}/${p}`, { waitUntil: 'networkidle2' });
        if (!res.ok()) throw new Error(`Failed to load ${p}: ${res.status()}`);
        console.log(`✅ ${p} loaded successfully`);
      }

      console.log('\n🎉 ALL TESTS PASSED 🎉');
      
    } catch (e) {
      console.error('\n❌ TEST FAILED:', e.message);
      process.exitCode = 1;
    } finally {
      if (browser) await browser.close();
      server.close();
    }
  });
}

runTests();
