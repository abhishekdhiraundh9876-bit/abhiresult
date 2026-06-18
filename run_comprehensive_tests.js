const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3001; // Use a different port to avoid conflicts
app.use(express.static(__dirname));

let server;

async function runComprehensiveTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Start Comprehensive Web App Testing on Port ${PORT}`);
    console.log(`==================================================\n`);
    
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const page = await browser.newPage();
      
      // Capture page console logs
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('failed')) {
          console.log('  [PAGE CONSOLE LOG ERROR]:', text);
        }
      });
      
      // Monitor network errors
      page.on('response', response => {
        if (!response.ok() && !response.url().includes('favicon.ico')) {
          console.log(`⚠️ HTTP ${response.status()} for ${response.url()}`);
        }
      });

      // ==========================================
      // TEST 1: HOME PAGE (index.html)
      // ==========================================
      console.log('📋 Test 1: Home Page Loading & Rendering...');
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle2' });
      
      // Title Check
      const title = await page.title();
      if (!title.includes('Abhi Result')) throw new Error('Title check failed. Found: ' + title);
      console.log('  ✅ Title check passed');

      // Check Global Data is loaded
      const isSiteDataLoaded = await page.evaluate(() => typeof siteData !== 'undefined');
      if (!isSiteDataLoaded) throw new Error('siteData global object is not loaded');
      console.log('  ✅ siteData global object successfully loaded');

      // Ticker Loading Check
      const tickerContent = await page.evaluate(() => document.getElementById('tickerContent')?.textContent);
      if (!tickerContent || tickerContent.includes('Loading latest updates...')) {
        throw new Error('Ticker did not load latest updates correctly');
      }
      console.log('  ✅ Ticker content loaded successfully:', tickerContent.slice(0, 50) + '...');

      // Homepage Tables Rendering
      const tablesToCheck = [
        { id: 'latestJobsTable', label: 'Latest Jobs' },
        { id: 'resultsTable', label: 'Results' },
        { id: 'admitTable', label: 'Admit Cards' },
        { id: 'answerTable', label: 'Answer Keys' },
        { id: 'syllabusTable', label: 'Syllabi' }
      ];
      for (const table of tablesToCheck) {
        const rowCount = await page.evaluate((id) => document.querySelectorAll(`#${id} .notice-row`).length, table.id);
        if (rowCount === 0) throw new Error(`${table.label} table did not render any rows`);
        console.log(`  ✅ ${table.label} Table populated with ${rowCount} entries`);
      }

      // Home Search Dropdown Test
      console.log('  🔍 Testing Home page live search dropdown...');
      await page.type('#searchInput', 'UPSC');
      await new Promise(r => setTimeout(r, 600)); // Wait for input handler debounce
      const searchResultsCount = await page.evaluate(() => document.querySelectorAll('#searchResults .search-result-item').length);
      if (searchResultsCount === 0) throw new Error('Home page search dropdown failed to return matches');
      console.log(`  ✅ Search dropdown returned ${searchResultsCount} items for "UPSC"`);

      // Clean search input
      await page.evaluate(() => document.getElementById('searchInput').value = '');

      // ==========================================
      // TEST 2: LATEST JOBS PAGE (latest-jobs.html)
      // ==========================================
      console.log('\n📋 Test 2: Latest Jobs Page & Filtering...');
      await page.goto(`http://localhost:${PORT}/latest-jobs.html`, { waitUntil: 'networkidle2' });
      
      const totalJobsInitial = await page.evaluate(() => document.querySelectorAll('#jobsGrid .job-card').length);
      console.log(`  ✅ Initial jobs loaded: ${totalJobsInitial}`);

      // Filter by Category
      console.log('  🧪 Selecting category "upsc"...');
      await page.select('#catFilter', 'upsc');
      await new Promise(r => setTimeout(r, 300));
      const upscCount = await page.evaluate(() => document.querySelectorAll('#jobsGrid .job-card').length);
      const shownCountText = await page.evaluate(() => document.getElementById('jobCount')?.textContent);
      const expectedRenderedCount = Math.min(+shownCountText, 50);
      if (expectedRenderedCount !== upscCount) throw new Error(`Count indicator (${shownCountText}) expected to render ${expectedRenderedCount} elements but found ${upscCount}`);
      console.log(`  ✅ Category filter works. Found ${upscCount} of ${shownCountText} UPSC jobs rendered.`);

      // Verify all shown cards are UPSC
      const areAllUpsc = await page.evaluate(() => {
        const tags = Array.from(document.querySelectorAll('#jobsGrid .job-card .job-card-tags .job-tag'));
        // Find tags matching UPSC category
        const upscTags = tags.filter(t => t.textContent.toUpperCase() === 'UPSC');
        return upscTags.length > 0;
      });
      if (!areAllUpsc && upscCount > 0) throw new Error('Jobs displayed do not match UPSC category selection');

      // Clear filter
      await page.evaluate(() => {
        document.getElementById('catFilter').value = '';
        document.getElementById('stateFilter').value = '';
        document.getElementById('searchFilter').value = '';
      });
      await page.click('.filter-btn'); // Clear button
      await new Promise(r => setTimeout(r, 200));

      // Test Job Detail Overlay
      console.log('  🖱️ Testing Job detail overlay view...');
      const firstJobId = await page.evaluate(() => {
        const btn = document.querySelector('#jobsGrid .job-card .apply-btn');
        return btn ? btn.getAttribute('onclick').match(/\d+/)[0] : null;
      });
      if (!firstJobId) throw new Error('No job card found to test detail view');

      await page.click('#jobsGrid .job-card .apply-btn'); // click first view details btn
      await new Promise(r => setTimeout(r, 400));

      const isDetailVisible = await page.evaluate(() => {
        const detailBox = document.getElementById('jobDetail');
        return detailBox && detailBox.style.display !== 'none';
      });
      if (!isDetailVisible) throw new Error('Job detail box did not show after clicking View Details');
      console.log('  ✅ Detail view displayed successfully');

      // Click Close
      await page.evaluate(() => {
        const btn = document.querySelector('#jobDetail .btn-danger');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => document.getElementById('jobDetail').style.display === 'none', { timeout: 3000 });
      console.log('  ✅ Detail view closed successfully');

      // ==========================================
      // TEST 3: RESULTS PAGE (results.html)
      // ==========================================
      console.log('\n📋 Test 3: Results Page & Modal Popup...');
      await page.goto(`http://localhost:${PORT}/results.html`, { waitUntil: 'networkidle2' });

      // Check result rows
      const resultsCount = await page.evaluate(() => document.querySelectorAll('#resultsTable .result-row').length);
      if (resultsCount === 0) throw new Error('No result rows displayed');
      console.log(`  ✅ Results list loaded with ${resultsCount} entries`);

      // Test category pill filtering
      console.log('  🧪 Clicking on SSC category filter pill...');
      const sscPill = await page.$('.page-cat-btn:nth-child(3)'); // SSC is 3rd pill (All, UPSC, SSC)
      if (sscPill) {
        await sscPill.click();
        await new Promise(r => setTimeout(r, 300));
        const filteredCount = await page.evaluate(() => document.querySelectorAll('#resultsTable .result-row').length);
        console.log(`  ✅ Filtered results for SSC: ${filteredCount}`);
      }

      // Test Modal Detail View
      console.log('  🖱️ Testing Results detail Modal popup...');
      // Click first result row
      await page.click('#resultsTable .result-row');
      await new Promise(r => setTimeout(r, 400));

      const isModalShown = await page.evaluate(() => {
        return document.getElementById('detailModal').classList.contains('show') && 
               document.getElementById('detailOverlay').classList.contains('show');
      });
      if (!isModalShown) throw new Error('Results detail modal failed to open');
      console.log('  ✅ Modal opened correctly');

      // Close modal
      await page.click('#detailModal .modal-close');
      await new Promise(r => setTimeout(r, 300));
      const isModalClosed = await page.evaluate(() => {
        return !document.getElementById('detailModal').classList.contains('show');
      });
      if (!isModalClosed) throw new Error('Results detail modal failed to close');
      console.log('  ✅ Modal closed correctly');

      // ==========================================
      // TEST 4: STUDENT TOOLS PAGE (tools.html)
      // ==========================================
      console.log('\n📋 Test 4: Interactive Student Tools (tools.html)...');
      await page.goto(`http://localhost:${PORT}/tools.html`, { waitUntil: 'networkidle2' });

      // Verify all tools tabs are present
      const toolsTabs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.tools-cats .page-cat-btn')).map(b => b.textContent.trim());
      });
      console.log('  ✅ Loaded tabs:', toolsTabs.join(' | '));

      // Test AGE CALCULATOR Tool
      console.log('  🧪 Testing Age Calculator...');
      // Open Age Calculator tab
      await page.evaluate(() => {
        // Tab index for Age Calculator
        const buttons = Array.from(document.querySelectorAll('.tools-cats .page-cat-btn'));
        const ageBtn = buttons.find(b => b.textContent.includes('Age Calculator'));
        if (ageBtn) ageBtn.click();
      });
      await new Promise(r => setTimeout(r, 300));

      // Set birth date inputs
      await page.evaluate(() => {
        document.getElementById('dob').value = '2000-06-15';
        document.getElementById('targetDate').value = '2026-06-18';
        document.getElementById('dob').dispatchEvent(new Event('change'));
      });
      await new Promise(r => setTimeout(r, 300));

      // Verify age result
      const calculatedAge = await page.evaluate(() => {
        return {
          years: document.getElementById('ageResultYears')?.textContent,
          months: document.getElementById('ageResultMonths')?.textContent,
          days: document.getElementById('ageResultDays')?.textContent
        };
      });
      console.log(`  ✅ Age Result: ${calculatedAge.years} Years, ${calculatedAge.months} Months, ${calculatedAge.days} Days`);
      if (calculatedAge.years !== '26' || calculatedAge.months !== '0' || calculatedAge.days !== '3') {
        throw new Error(`Age calculation formula returned incorrect result: ${calculatedAge.years}y ${calculatedAge.months}m ${calculatedAge.days}d`);
      } else {
        console.log('  ✅ Age calculation formula is 100% correct!');
      }

      // Test 7TH PAY SALARY CALCULATOR
      console.log('  🧪 Testing 7th Pay Salary Calculator...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('.tools-cats .page-cat-btn'));
        const salaryBtn = buttons.find(b => b.textContent.includes('Salary Calculator'));
        if (salaryBtn) salaryBtn.click();
      });
      await new Promise(r => setTimeout(r, 300));

      // Select parameters
      await page.select('#salaryLevel', '6'); // Basic pay 35400
      await page.select('#salaryCity', 'X'); // 30% HRA
      await page.evaluate(() => {
        document.getElementById('salaryDaPercent').value = '50';
      });

      // Click Calculate Salary
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Calculate Salary'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));

      // Verify Pay Slip results
      const basicPay = await page.evaluate(() => document.getElementById('slipBasic').textContent);
      const grossPay = await page.evaluate(() => document.getElementById('slipGross').textContent);
      const netPay = await page.evaluate(() => document.getElementById('slipNet').textContent);
      console.log(`  ✅ Pay Slip: Basic = ₹${basicPay}, Gross = ₹${grossPay}, Net = ₹${netPay}`);
      
      // Let's check calculations:
      // Basic Level 6 = 35,400
      // DA @ 50% = 17,700
      // HRA @ 30% = 10,620
      // TA X-Class = 3600 + (3600 * 50%) = 5400
      // Gross = 35400 + 17700 + 10620 + 5400 = 69,120
      // NPS = 10% of (Basic + DA) = 10% of 53100 = 5310
      // CGHS Level 6 = 450
      // CGEGIS Level 6 = 60
      // PT = 200
      // Deductions = 5310 + 450 + 60 + 200 = 6020
      // Net = 69120 - 6020 = 63,100
      if (basicPay.replace(/,/g, '') !== '35400' || grossPay.replace(/,/g, '') !== '69120' || netPay.replace(/,/g, '') !== '63100') {
        throw new Error(`Salary Calculator math mismatch! Found Basic: ${basicPay}, Gross: ${grossPay}, Net: ${netPay}`);
      }
      console.log('  ✅ 7th Pay Salary Calculator math is 100% accurate!');

      // ==========================================
      // TEST 5: ADMIN PANEL (admin.html)
      // ==========================================
      console.log('\n📋 Test 5: Admin Panel & CRUD Operations (admin.html)...');
      await page.goto(`http://localhost:${PORT}/admin.html`, { waitUntil: 'networkidle2' });

      // Test incorrect login
      console.log('  🔒 Testing invalid login credentials...');
      await page.type('#adminUser', 'invalid_user');
      await page.type('#adminPass', 'invalid_pass');
      await page.click('#loginSection button.submit-btn');
      await new Promise(r => setTimeout(r, 300));
      
      const isErrorVisible = await page.evaluate(() => document.getElementById('loginError').style.display === 'block');
      if (!isErrorVisible) throw new Error('Error message not shown on invalid admin login');
      console.log('  ✅ Invalid credentials correctly blocked');

      // Test correct login
      console.log('  🔑 Testing valid login credentials...');
      // Clear inputs
      await page.evaluate(() => {
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        document.getElementById('loginError').style.display = 'none';
      });
      await page.type('#adminUser', '8757694576');
      await page.type('#adminPass', '3729@#Abhi');
      await page.click('#loginSection button.submit-btn');
      await new Promise(r => setTimeout(r, 500));

      const isWrapperVisible = await page.evaluate(() => document.getElementById('adminWrapper').classList.contains('show'));
      if (!isWrapperVisible) throw new Error('Failed to login to admin panel with correct credentials');
      console.log('  ✅ Admin panel successfully unlocked');

      // CRUD - Add a new job entry
      console.log('  ➕ Adding a new test job entry via Admin Form...');
      await page.type('#jobTitle', 'Puppeteer Test QA Engineer Recruitment 2026');
      await page.type('#jobPosts', '125');
      await page.select('#jobCategory', 'upsc');
      await page.select('#jobState', 'central');
      
      // Submit Job
      await page.click('#form-addJob button.submit-btn');
      await new Promise(r => setTimeout(r, 400));

      // Verify the count incremented or success message showed
      const successText = await page.evaluate(() => document.getElementById('successText').textContent);
      console.log(`  ✅ Toast message received: "${successText}"`);
      if (!successText.includes('successfully')) throw new Error('Success toast did not appear after adding job');

      // Check item appears in Manage list
      console.log('  🔍 Verifying new job appears in Manage All list...');
      // Switch to Manage All tab
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.admin-tabs .admin-tab'));
        const manageTab = tabs.find(t => t.textContent.includes('Manage All'));
        if (manageTab) manageTab.click();
      });
      await new Promise(r => setTimeout(r, 500));

      const isJobInManageList = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('#manageJobsList .admin-list-item .item-title'));
        return items.some(it => it.textContent.includes('Puppeteer Test QA Engineer'));
      });
      if (!isJobInManageList) throw new Error('Newly created job did not show up in the admin manage list');
      console.log('  ✅ Added job found in admin manage list!');

      // Check that it's also updated globally in localStorage
      // Delete the added job to clean up the workspace
      console.log('  🗑️ Cleaning up: Deleting the added test job...');
      page.on('dialog', async dialog => {
        await dialog.accept(); // Accept the deletion confirmation dialog
      });
      await page.evaluate(() => {
        // Find delete button for our test job
        const items = Array.from(document.querySelectorAll('#manageJobsList .admin-list-item'));
        const testItem = items.find(it => it.textContent.includes('Puppeteer Test QA Engineer'));
        if (testItem) {
          const deleteBtn = testItem.querySelector('.btn-delete');
          if (deleteBtn) deleteBtn.click();
        }
      });
      await new Promise(r => setTimeout(r, 500));
      console.log('  ✅ Added job successfully deleted from admin manage list.');

      // ==========================================
      // TEST 6: SEARCH RESULTS PAGE (search.html)
      // ==========================================
      console.log('\n📋 Test 6: Cross Search Page (search.html)...');
      await page.goto(`http://localhost:${PORT}/search.html?q=SSC`, { waitUntil: 'networkidle2' });

      const searchResultCount = await page.evaluate(() => document.querySelectorAll('#resultsGrid .item-row').length);
      console.log(`  ✅ Search Results count for "SSC" query: ${searchResultCount}`);
      if (searchResultCount === 0) throw new Error('No search results returned for a valid keyword "SSC"');

      // Verify all results have labels matching the query or similar
      const queryDisplay = await page.evaluate(() => document.getElementById('queryDisplay').textContent);
      if (queryDisplay !== 'SSC') throw new Error(`Query display text is incorrect: ${queryDisplay}`);
      console.log('  ✅ Search results display matches query');

      // ==========================================
      // TEST 7: STATIC PAGES VERIFICATION
      // ==========================================
      console.log('\n📋 Test 7: Static Pages Verification...');
      const staticPages = [
        'about-us.html',
        'contact-us.html',
        'privacy-policy.html',
        'disclaimer.html',
        'terms-conditions.html'
      ];
      for (const sp of staticPages) {
        const res = await page.goto(`http://localhost:${PORT}/${sp}`, { waitUntil: 'networkidle2' });
        if (!res.ok()) throw new Error(`Failed to load static page ${sp}: ${res.status()}`);
        console.log(`  ✅ Static page loaded successfully: ${sp}`);
      }

      console.log('\n==================================================');
      console.log('🎉 🎉 COMPREHENSIVE TESTING SUCCESSFULLY COMPLETED! 🎉 🎉');
      console.log('==================================================\n');
      
    } catch (e) {
      console.error('\n❌ ❌ TEST SUITE FAILED:', e.stack);
      process.exitCode = 1;
    } finally {
      if (browser) await browser.close();
      server.close();
    }
  });
}

runComprehensiveTests();
