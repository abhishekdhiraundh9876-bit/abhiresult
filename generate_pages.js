const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract header (everything up to and including the closing </header>)
const headerRegex = /([\s\S]*?<\/header>)/;
const headerMatch = indexHtml.match(headerRegex);
const header = headerMatch ? headerMatch[1] : '';

// Extract footer (everything from <!-- FOOTER --> onwards)
const footerRegex = /(<!-- FOOTER -->[\s\S]*)/;
const footerMatch = indexHtml.match(footerRegex);
const footer = footerMatch ? footerMatch[1] : '';

const pages = [
  {
    filename: 'about-us.html',
    title: 'About Us',
    content: `
      <div class="notice-board" style="margin: 40px 0;">
        <div class="board-header">
          <h2><i class="fas fa-building"></i> About Us</h2>
        </div>
        <div class="about-body" style="padding: 20px;">
          <p>Welcome to <strong>Abhi Result</strong>, India's most trusted Government Job portal since 2025.</p>
          <p>Our primary objective is to provide students and job aspirants with the latest and most accurate information regarding <strong>Sarkari Naukri</strong>, <strong>Exam Results</strong>, <strong>Admit Cards</strong>, <strong>Answer Keys</strong>, <strong>Syllabi</strong>, and <strong>Admissions</strong> with 100% verified official links.</p>
          <p>We believe in saving candidates' time and protecting them from misleading information. All our updates are fast, reliable, and entirely mobile-friendly.</p>
          <p>Thank you for choosing Abhi Result for your career journey!</p>
        </div>
      </div>
    `
  },
  {
    filename: 'contact-us.html',
    title: 'Contact Us',
    content: `
      <div class="notice-board" style="margin: 40px 0;">
        <div class="board-header">
          <h2><i class="fas fa-envelope"></i> Contact Us</h2>
        </div>
        <div class="about-body" style="padding: 20px;">
          <p>If you have any questions, suggestions, or feedback, we would love to hear from you!</p>
          <ul>
            <li><strong>Email:</strong> contact@abhiresult.com</li>
            <li><strong>WhatsApp:</strong> +91 00000 00000</li>
            <li><strong>Telegram:</strong> <a href="https://t.me/abhiresultofficial" target="_blank">Join Channel</a></li>
            <li><strong>Address:</strong> Abhi Result HQ, New Delhi, India</li>
          </ul>
          <p>We strive to respond to all inquiries within 24-48 hours.</p>
        </div>
      </div>
    `
  },
  {
    filename: 'privacy-policy.html',
    title: 'Privacy Policy',
    content: `
      <div class="notice-board" style="margin: 40px 0;">
        <div class="board-header">
          <h2><i class="fas fa-user-shield"></i> Privacy Policy</h2>
        </div>
        <div class="about-body" style="padding: 20px;">
          <p>At <strong>Abhi Result</strong>, the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information that is received and collected by Abhi Result and how it is used.</p>
          <h3>Log Files</h3>
          <p>Like many other Web sites, Abhi Result makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable.</p>
          <h3>Cookies and Web Beacons</h3>
          <p>Abhi Result does use cookies to store information about visitors' preferences, record user-specific information on which pages the user accesses or visits, customize Web page content based on visitors' browser type or other information that the visitor sends via their browser.</p>
        </div>
      </div>
    `
  },
  {
    filename: 'disclaimer.html',
    title: 'Disclaimer',
    content: `
      <div class="notice-board" style="margin: 40px 0;">
        <div class="board-header">
          <h2><i class="fas fa-exclamation-triangle"></i> Disclaimer</h2>
        </div>
        <div class="about-body" style="padding: 20px;">
          <p>All information on this website - <strong>Abhi Result</strong> - is published in good faith and for general information purposes only. Abhi Result does not make any warranties about the completeness, reliability, and accuracy of this information.</p>
          <p>Any action you take upon the information you find on this website (Abhi Result), is strictly at your own risk. Abhi Result will not be liable for any losses and/or damages in connection with the use of our website.</p>
          <p>From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites (especially official government portals), we have no control over the content and nature of these sites. Site owners and content may change without notice.</p>
        </div>
      </div>
    `
  },
  {
    filename: 'terms-conditions.html',
    title: 'Terms & Conditions',
    content: `
      <div class="notice-board" style="margin: 40px 0;">
        <div class="board-header">
          <h2><i class="fas fa-file-contract"></i> Terms & Conditions</h2>
        </div>
        <div class="about-body" style="padding: 20px;">
          <p>Welcome to <strong>Abhi Result</strong>!</p>
          <p>These terms and conditions outline the rules and regulations for the use of Abhi Result's Website.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Abhi Result if you do not agree to take all of the terms and conditions stated on this page.</p>
          <h3>License</h3>
          <p>Unless otherwise stated, Abhi Result and/or its licensors own the intellectual property rights for all material on Abhi Result. All intellectual property rights are reserved. You may access this from Abhi Result for your own personal use subjected to restrictions set in these terms and conditions.</p>
          <h3>User Content</h3>
          <p>Parts of this website may offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Abhi Result does not filter, edit, publish or review Comments prior to their presence on the website.</p>
        </div>
      </div>
    `
  }
];

pages.forEach(page => {
  // Update the title tag
  let pageHeader = header.replace(
    /<title>.*?<\/title>/,
    `<title>${page.title} - Abhi Result 2026</title>`
  );
  
  const fullHtml = `${pageHeader}
<div class="container">
  <div class="content-grid" style="display:block; max-width:800px; margin: 0 auto;">
    ${page.content}
  </div>
</div>
${footer}`;

  fs.writeFileSync(page.filename, fullHtml);
  console.log('Created:', page.filename);
});

console.log('All static pages generated successfully.');
