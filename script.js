// ============================================
// ABHI RESULT - ENHANCED MAIN SCRIPT
// ============================================

// ---- HTML ESCAPING AND SECURITY UTILITIES ----
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function safeURL(url) {
  if (!url) return '#';
  const clean = url.trim();
  if (clean.toLowerCase().startsWith('javascript:')) return '#';
  return clean;
}


// ---- NO LOCAL STORAGE SYNC (Always use live data from data.js) ----
// Data caching removed to allow real-time global updates from admin.

document.addEventListener('DOMContentLoaded', function () {
  initParticles();
  loadHomepageTables();
  initSearch();
  initScroll();
  initStats();
  // showNotification(); // Disabled popup as requested by user
  setActiveNav();
  initMobileNav();
  initBottomNav();
  loadAds();
  initTicker();
  initAIAssistant(); // Inject premium AI Assistant chatbot on load
});

// ---- PARTICLES ----
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*5+2}px;height:${Math.random()*5+2}px;animation-delay:${Math.random()*10}s;animation-duration:${Math.random()*8+8}s;opacity:${Math.random()*0.4};`;
    container.appendChild(p);
  }
}

// ---- TICKER ----
function initTicker() {
  const tc = document.getElementById('tickerContent');
  if (!tc || typeof siteData === 'undefined') return;
  const notifs = siteData.notifications || [];
  if (notifs.length) tc.textContent = notifs.join('  ●  ');
}

// ---- HOMEPAGE TABLES ----
function loadHomepageTables() {
  if (typeof siteData === 'undefined') return;
  renderNoticeTable('latestJobsTable', siteData.latestJobs.slice(0, 10), 'job');
  renderNoticeTable('resultsTable', siteData.results.slice(0, 8), 'result');
  renderNoticeTable('admitTable', siteData.admitCards.slice(0, 6), 'admit');
  renderNoticeTable('answerTable', siteData.answerKeys.slice(0, 6), 'answer');
  renderNoticeTable('syllabusTable', siteData.syllabi.slice(0, 6), 'syllabus');
  if (document.getElementById('admissionTable')) {
    renderNoticeTable('admissionTable', siteData.admissions.slice(0, 6), 'admission');
  }
}

function renderNoticeTable(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container || !items) return;
  container.innerHTML = '';
  const pageMap = { job:'latest-jobs', result:'results', admit:'admit-card', answer:'answer-key', syllabus:'syllabus', admission:'admission' };
  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'notice-row slide-up';
    row.style.animationDelay = (idx * 0.05) + 's';
    row.onclick = () => { window.location.href = `${pageMap[type]}.html?id=${item.id}`; };
    const isNew = idx < 3;
    row.innerHTML = `
      <span class="notice-tag tag-${escapeHTML(item.tag)}">${escapeHTML(item.tag.toUpperCase())}</span>
      <span class="notice-title ${isNew ? 'blink' : ''}">${escapeHTML(item.title)}</span>
      <span class="notice-date"><i class="fas fa-calendar-alt"></i> ${escapeHTML(item.date)}</span>
    `;
    container.appendChild(row);
  });
}

// ---- SEARCH ----
function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;
  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove('active'); return; }
    const allItems = [
      ...(siteData.latestJobs||[]).map(i=>({...i,type:'Job',page:'latest-jobs'})),
      ...(siteData.results||[]).map(i=>({...i,type:'Result',page:'results'})),
      ...(siteData.admitCards||[]).map(i=>({...i,type:'Admit Card',page:'admit-card'})),
      ...(siteData.answerKeys||[]).map(i=>({...i,type:'Answer Key',page:'answer-key'})),
      ...(siteData.syllabi||[]).map(i=>({...i,type:'Syllabus',page:'syllabus'})),
      ...(siteData.admissions||[]).map(i=>({...i,type:'Admission',page:'admission'})),
    ];
    const filtered = allItems.filter(i=>i.title.toLowerCase().includes(q)).slice(0,8);
    results.innerHTML = '';
    if (!filtered.length) {
      results.innerHTML = '<div class="search-result-item"><i class="fas fa-search"></i> No results found</div>';
    } else {
      filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `<i class="fas fa-circle"></i> <span style="color:var(--blue);font-weight:600">[${escapeHTML(item.type)}]</span> ${escapeHTML(item.title)}`;
        div.onclick = () => { window.location.href = `${item.page}.html?id=${item.id}`; };
        results.appendChild(div);
      });
    }
    results.classList.add('active');
  });
  document.addEventListener('click', function (e) {
    if (!input.contains(e.target)) results.classList.remove('active');
  });
  input.addEventListener('keydown', e => { if(e.key==='Enter') doSearch(); });
}

function doSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) { window.location.href = `search.html?q=${encodeURIComponent(q)}`; }
}

// ---- SCROLL ----
function initScroll() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
    const header = document.getElementById('mainHeader');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ---- COUNTER ANIMATION ----
function initStats() {
  const counters = document.querySelectorAll('.stat-num');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  });
  counters.forEach(c => observer.observe(c));
}
function animateCounter(el) {
  const target = +el.getAttribute('data-count');
  if (!target) return;
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, 16);
}

// ---- NOTIFICATION ----
function showNotification() {
  if (typeof siteData === 'undefined') return;
  const popup = document.getElementById('notifPopup');
  const text = document.getElementById('notifText');
  if (!popup || !text) return;
  const notifs = siteData.notifications || [];
  let idx = 0;
  setTimeout(() => {
    text.textContent = notifs[idx];
    popup.classList.add('show');
  }, 3000);
  setInterval(() => {
    idx = (idx + 1) % notifs.length;
    popup.classList.remove('show');
    setTimeout(() => { text.textContent = notifs[idx]; popup.classList.add('show'); }, 500);
  }, 6000);
}
function closeNotif() { document.getElementById('notifPopup')?.classList.remove('show'); }

// ---- MOBILE NAV ----
function initMobileNav() {
  document.querySelectorAll('.has-dropdown').forEach(li => {
    li.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.classList.toggle('open');
      }
    });
  });
}
function toggleNav() {
  document.getElementById('navMenu')?.classList.toggle('open');
  document.getElementById('navToggle')?.classList.toggle('active');
}

// ---- BOTTOM NAV ACTIVE ----
function initBottomNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bn-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href && path.includes(href.split('.')[0]) && href !== '#') {
      item.classList.add('active');
    }
  });
  // Home special case
  if (path === 'index.html' || path === '') {
    document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.bn-item[href="index.html"]')?.classList.add('active');
  }
}

// ---- ACTIVE NAV ----
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href && path.startsWith(href.split('?')[0]) && href !== '#') a.classList.add('active');
  });
}

// ---- AD LOADER ----
function loadAds() {
  if (window.adConfig && adConfig.useRealAds) return;
  
  const slots = document.querySelectorAll('.ad-slot');
  slots.forEach(slot => {
    slot.innerHTML = ''; // Clear placeholders
    slot.classList.add('insta-ad'); // Styles override
    
    if (slot.classList.contains('ad-banner')) {
      // Horizontal leaderboard ad
      slot.innerHTML = `
        <a href="https://www.instagram.com/abhiii.__.yadav/" target="_blank" rel="noopener" class="insta-ad-link insta-ad-horizontal">
          <div class="insta-ad-gradient"></div>
          <div class="insta-ad-content">
            <div class="insta-ad-left">
              <div class="insta-ad-profile-pic" style="background-image: url('profile.jpg?v=2');"></div>
              <div class="insta-ad-text">
                <span class="insta-ad-username">@abhiii.__.yadav <i class="fab fa-instagram" style="color:#ffc107; font-size:13px; margin-left:2px;"></i></span>
                <span class="insta-ad-title">Abhi Yadav | Software Dev</span>
                <span class="insta-ad-desc">αutσрнιlє | Software Developer</span>
              </div>
            </div>
            <div class="insta-ad-right">
              <span class="insta-ad-btn">Follow <i class="fas fa-external-link-alt"></i></span>
            </div>
          </div>
        </a>
      `;
    } else {
      // Square or vertical sidebar ad
      slot.innerHTML = `
        <a href="https://www.instagram.com/abhiii.__.yadav/" target="_blank" rel="noopener" class="insta-ad-link insta-ad-vertical">
          <div class="insta-ad-gradient"></div>
          <div class="insta-ad-card">
            <div class="insta-ad-avatar-wrap">
              <div class="insta-ad-avatar" style="background-image: url('profile.jpg?v=2'); background-size: cover; background-position: center;"></div>
              <div class="insta-ad-badge"><i class="fab fa-instagram"></i></div>
            </div>
            <div class="insta-ad-info">
              <h4 class="insta-ad-name">Abhi Yadav</h4>
              <p class="insta-ad-username">@abhiii.__.yadav</p>
              <p class="insta-ad-bio">αutσрнιlє | Software Dev</p>
              <div class="insta-ad-stats">
                <div><strong>51</strong><span>Posts</span></div>
                <div><strong>4.6K</strong><span>Followers</span></div>
                <div><strong>235</strong><span>Following</span></div>
              </div>
            </div>
            <span class="insta-ad-btn block-btn">Follow on Instagram <i class="fas fa-external-link-alt"></i></span>
          </div>
        </a>
      `;
    }
  });
}

// ---- UTILITY ----
function getUrlParam(name) { return new URLSearchParams(window.location.search).get(name); }
function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// Expose globally
window.doSearch = doSearch;
window.scrollToTop = scrollToTop;

// PWA Service Worker Registration & Automatic Reload on Update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker registered', reg);
        // Check for updates on load
        reg.update();
      })
      .catch(err => console.error('Service Worker registration failed', err));
  });

  // Reload page when new service worker takes over control (only if already controlled)
  let refreshing = false;
  const wasControlled = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (wasControlled && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
window.closeNotif = closeNotif;
window.toggleNav = toggleNav;
window.getUrlParam = getUrlParam;

// ============================================
// ---- AI ASSISTANT CHATBOT (ABHI AI) ----
// ============================================
function initAIAssistant() {
  // Prevent duplicate initialization
  if (document.getElementById('aiLauncher')) return;

  // 1. Create and inject chatbot launcher and widget elements
  const chatContainer = document.createElement('div');
  chatContainer.innerHTML = `
    <button class="ai-chat-launcher" id="aiLauncher" title="Talk to Abhi AI">
      <i class="fas fa-robot"></i>
    </button>
    <div class="ai-chat-widget" id="aiWidget">
      <div class="ai-chat-header">
        <div class="ai-chat-info">
          <div class="ai-chat-avatar"><i class="fas fa-robot"></i></div>
          <div class="ai-chat-title-wrap">
            <h4 class="ai-chat-title">Abhi AI</h4>
            <span class="ai-chat-status" style="color:#2dc653;"><i class="fas fa-shield-alt" style="font-size:10px;"></i> 100% Local & Private</span>
          </div>
        </div>
        <div class="ai-chat-actions">
          <button class="ai-chat-action-btn" id="aiClose" title="Minimize Chat"><i class="fas fa-times"></i></button>
        </div>
      </div>
      
      <div class="ai-chat-body">
        <div class="ai-chat-messages" id="aiMessages">
          <div class="ai-message-wrapper ai">
            <span class="ai-message-sender">Abhi AI</span>
            <div class="ai-message ai">
              <p>Namaste! 🙏 Main **Abhi AI** हूँ। मैं इस वेबसाइट का लोकल और 100% सुरक्षित एआई सहायक हूँ।</p>
              <p>आपकी गोपनीयता (privacy) के लिए, आपकी कोई भी बातचीत किसी बाहरी सर्वर पर नहीं भेजी जाती। सभी सवाल स्थानीय (locally) रूप से प्रोसेस होते हैं।</p>
              <p>मुझसे वेबसाइट के **Latest Jobs**, **Admit Cards**, **Results**, **Syllabus**, या **Tools** के बारे में कुछ भी पूछें!</p>
            </div>
          </div>
        </div>
        <div class="suggestion-chips" id="aiChips">
          <button class="suggestion-chip" data-query="latest jobs">🔥 Latest Jobs</button>
          <button class="suggestion-chip" data-query="admit card">🪪 Admit Cards</button>
          <button class="suggestion-chip" data-query="age calculator">⏳ Age Calculator</button>
          <button class="suggestion-chip" data-query="syllabus pdf">📚 Syllabus PDF</button>
          <button class="suggestion-chip" data-query="results">🏆 Exam Results</button>
        </div>
        <div class="ai-chat-input-container">
          <input type="text" class="ai-chat-input" id="aiInput" placeholder="Type your question here..." autocomplete="off">
          <button class="ai-chat-send-btn" id="aiSend" title="Send Message"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(chatContainer);

  // 2. DOM Elements Cache
  const launcher = document.getElementById('aiLauncher');
  const widget = document.getElementById('aiWidget');
  const closeBtn = document.getElementById('aiClose');
  const messagesDiv = document.getElementById('aiMessages');
  const inputEl = document.getElementById('aiInput');
  const sendBtn = document.getElementById('aiSend');
  const chipsContainer = document.getElementById('aiChips');

  let chatHistory = []; 

  // 3. Attach Chat UI Interaction
  launcher.addEventListener('click', () => {
    widget.classList.toggle('active');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  closeBtn.addEventListener('click', () => {
    widget.classList.remove('active');
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  sendBtn.addEventListener('click', handleSend);

  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.suggestion-chip');
    if (chip) {
      inputEl.value = chip.getAttribute('data-query');
      handleSend();
    }
  });

  // 4. Send Message Logic
  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    appendUserMessage(text);
    const typingId = showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator(typingId);
      processQuery(text);
    }, 500);
  }

  function appendUserMessage(text) {
    chatHistory.push({ role: 'user', text: text });
    const div = document.createElement('div');
    div.className = 'ai-message-wrapper user';
    div.innerHTML = `
      <span class="ai-message-sender">You</span>
      <div class="ai-message user">${escapeHTML(text)}</div>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function appendAIMessage(text) {
    chatHistory.push({ role: 'model', text: text });
    const div = document.createElement('div');
    div.className = 'ai-message-wrapper ai';
    div.innerHTML = `
      <span class="ai-message-sender">Abhi AI</span>
      <div class="ai-message ai">${parseMarkdown(text)}</div>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-message-wrapper ai';
    div.id = id;
    div.innerHTML = `
      <span class="ai-message-sender">Abhi AI</span>
      <div class="ai-message ai" style="display:flex; align-items:center; gap:5px; padding: 12px 18px;">
        <span class="dot-typing" style="width:6px;height:6px;background:rgba(255,255,255,0.5);border-radius:50%;animation:dot-blink 1.4s infinite both;"></span>
        <span class="dot-typing" style="width:6px;height:6px;background:rgba(255,255,255,0.5);border-radius:50%;animation:dot-blink 1.4s infinite both 0.2s;"></span>
        <span class="dot-typing" style="width:6px;height:6px;background:rgba(255,255,255,0.5);border-radius:50%;animation:dot-blink 1.4s infinite both 0.4s;"></span>
      </div>
      <style>
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.15); }
        }
      </style>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // 5. Smart Query Processor (Local offline knowledge base)
  function processQuery(query) {
    const q = query.toLowerCase().trim();
    let reply = "";

    // A. Friendly Conversations & Small Talk (Hindi, English, Hinglish)
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('namaste') || q.includes('pranam') || q.includes('ram ram') || q.includes('radhe')) {
      reply = "Hello! 🙏 Main **Abhi AI** हूँ। मैं इस वेबसाइट (Abhi Result) पर आपकी मदद के लिए उपस्थित हूँ।\n\nआप मुझसे वेबसाइट पर उपलब्ध किसी भी अपडेट के बारे में पूछ सकते हैं:\n" +
              "- **Jobs**: 'latest jobs', 'ssc form', 'upsc vacancy'\n" +
              "- **Admit Card**: 'admit card link', 'download admit card'\n" +
              "- **Results**: 'board result', 'cut off marks'\n" +
              "- **Syllabus**: 'exam pattern', 'syllabus pdf'\n" +
              "- **Interactive Tools**: 'age calculator', 'resume maker'\n\n" +
              "आपकी गोपनीयता (privacy) के लिए मेरी बातचीत 100% सुरक्षित और स्थानीय है।";
      appendAIMessage(reply);
      return;
    }
    
    if (q.includes('tum kon ho') || q.includes('who are you') || q.includes('what is your name') || q.includes('tumhara naam') || q.includes('aap kon') || q.includes('who r u')) {
      reply = "Main **Abhi AI** हूँ, आपका अपना पर्सनल असिस्टेंट! 🤖\n\nमेरा काम है आपको **Sarkari Naukri**, **Admit Cards**, **Results**, और **Study Tools** खोजने में मदद करना।\nमुझे खासतौर पर 'Abhi Result' पोर्टल के छात्रों की मदद करने के लिए बनाया गया है। मैं हमेशा यही हूँ, बताइए आज मैं आपकी क्या मदद करूँ? 😊";
      appendAIMessage(reply);
      return;
    }

    if (q.includes('kaise ho') || q.includes('how are you') || q.includes('kya haal') || q.includes('kya chal raha')) {
      reply = "मैं बिल्कुल ठीक हूँ, एकदम झकास! 😎\nउम्मीद है आपकी पढ़ाई और परीक्षा की तैयारी भी ज़ोरों पर होगी। क्या मैं आपको लेटेस्ट जॉब्स या रिजल्ट्स खोजने में मदद करूँ? 📚";
      appendAIMessage(reply);
      return;
    }

    if (q.includes('kya kar sakte ho') || q.includes('what can you do') || q.includes('help me') || q.includes('madad') || q.includes('kya help')) {
      reply = "मैं आपकी कई तरह से मदद कर सकता हूँ:\n\n" +
              "1. 🔎 **Latest Jobs** खोजना\n" +
              "2. 🪪 **Admit Cards** और **Results** ढूँढना\n" +
              "3. 📚 **Syllabus** और **Answer Keys** का लिंक देना\n" +
              "4. 🛠️ **Tools** का इस्तेमाल (जैसे Age Calculator, Resume Maker, Photo Resizer)\n\n" +
              "बस मुझे बताइए आपको क्या ढूँढना है!";
      appendAIMessage(reply);
      return;
    }

    if (q.includes('thanks') || q.includes('thank you') || q.includes('dhanyawad') || q.includes('shukriya') || q === 'thx' || q === 'tq') {
      reply = "Your Welcome! 😊 मुझे खुशी है कि मैं आपकी मदद कर सका।\nअगर आपको आगे भी कोई जानकारी चाहिए (जैसे नई जॉब्स या रिजल्ट्स), तो बेझिझक मुझसे पूछें! All the best! 👍";
      appendAIMessage(reply);
      return;
    }

    if (q.includes('yeh site') || q.includes('is website') || q.includes('about abhi result') || q.includes('kya site hai')) {
      reply = "**Abhi Result** एक बेहतरीन एजुकेशनल पोर्टल है जहाँ आपको सबसे तेज़ अपडेट्स मिलते हैं: **Sarkari Naukri**, **Board Results**, **Admit Cards**, और छात्रों के लिए बहुत सारे उपयोगी **Tools**। 🚀";
      appendAIMessage(reply);
      return;
    }

    // B. Creator / Founder Info
    if (q.includes('founder') || q.includes('owner') || q.includes('developer') || q.includes('admin') || q.includes('creator') || q.includes('abhi yadav') || q.includes('insta')) {
      reply = "Abhi Result वेबसाइट के Founder और Developer **Abhi Yadav** हैं।\n\nआप उनके साथ जुड़ सकते हैं या उन्हें सोशल मीडिया पर फॉलो कर सकते हैं:\n" +
              "- **Instagram**: [Follow @abhiii.__.yadav](https://www.instagram.com/abhiii.__.yadav/)\n" +
              "- **Contact Developer**: [Contact Us Page](contact-us.html)\n" +
              "- **About Abhi Result**: [About Us Page](about-us.html)";
      appendAIMessage(reply);
      return;
    }

    // C. Dynamic Utilities (Time, Date, Basic Math)
    if (q.includes('time') || q.includes('samay') || q.includes('baj rahe')) {
      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      reply = `अभी समय हो रहा है: **${time}** ⏰\n\nसमय बहुत कीमती है, अपनी पढ़ाई पर फोकस करें!`;
      appendAIMessage(reply);
      return;
    }
    if (q.includes('date') || q.includes('aaj kya tarikh') || q.includes('today')) {
      const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      reply = `आज की तारीख है: **${date}** 📅\n\nक्या आज आपका कोई एग्जाम या फॉर्म भरने की लास्ट डेट है?`;
      appendAIMessage(reply);
      return;
    }
    // Simple math evaluator (e.g., "what is 2 + 2", "5 * 6", "100 / 5")
    const mathMatch = q.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
    if (mathMatch && (q.includes('what is') || q.includes('kitna') || q.includes('solve') || q.includes('calculate'))) {
      try {
        const num1 = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let res = 0;
        if (op==='+') res = num1 + num2;
        if (op==='-') res = num1 - num2;
        if (op==='*') res = num1 * num2;
        if (op==='/') res = num1 / num2;
        reply = `इसका जवाब है: **${res}** 🧮\n\n(कैलकुलेशन: ${num1} ${op} ${num2} = ${res})`;
        appendAIMessage(reply);
        return;
      } catch(e) {}
    }

    // D. Career & Educational Guidance
    if (q.includes('after 10th') || q.includes('10th ke baad')) {
      reply = "**10th (Matric) के बाद आपके पास मुख्य विकल्प हैं:**\n\n" +
              "1. **Science (PCM/PCB)**: Engineering या Medical लाइन के लिए।\n" +
              "2. **Commerce**: CA, CS, Banking या Business के लिए।\n" +
              "3. **Arts / Humanities**: Civil Services (UPSC), Law, Teaching या Design के लिए।\n" +
              "4. **Diploma / Polytechnic**: 3 साल का इंजीनियरिंग डिप्लोमा (सीधे 2nd ईयर B.Tech में एंट्री)।\n" +
              "5. **ITI**: इंडस्ट्रियल ट्रेनिंग (Railway Loco Pilot आदि में बहुत काम आता है)।\n\n" +
              "अपनी रुचि (Interest) के अनुसार चुनें! 🎓";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('after 12th') || q.includes('12th ke baad')) {
      reply = "**12th के बाद टॉप करियर ऑप्शंस:**\n\n" +
              "🔹 **Science (Maths)**: B.Tech (JEE), B.Arch, NDA, B.Sc.\n" +
              "🔹 **Science (Bio)**: MBBS (NEET), BDS, B.Pharma, Nursing, Agriculture.\n" +
              "🔹 **Commerce**: B.Com, CA (Chartered Accountant), CS, BBA.\n" +
              "🔹 **Arts**: BA, LLB (Law), BFA, Mass Communication.\n" +
              "🔹 **Govt Exams**: SSC CHSL, Railway, Police Constable (12th पास के लिए)।\n\n" +
              "हमेशा वो चुनें जिसमें आपको मज़ा आता है! 🚀";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('what is ssc') || q.includes('ssc kya hai')) {
      reply = "**SSC (Staff Selection Commission)** भारत सरकार का एक बोर्ड है जो विभिन्न मंत्रालयों और विभागों में सरकारी नौकरी के लिए परीक्षा करवाता है।\n\n" +
              "**मुख्य परीक्षाएं:**\n" +
              "- **SSC CGL**: ग्रेजुएशन लेवल (Income Tax Inspector, CBI आदि)\n" +
              "- **SSC CHSL**: 12th लेवल (LDC, Data Entry)\n" +
              "- **SSC MTS**: 10th लेवल (मल्टी-टास्किंग स्टाफ)\n" +
              "- **SSC GD**: 10th लेवल (CRPF, BSF, CISF कांस्टेबल)\n\n" +
              "आप हमारी वेबसाइट के [Latest Jobs](latest-jobs.html) सेक्शन में SSC के नए फॉर्म देख सकते हैं।";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('what is upsc') || q.includes('upsc kya hai')) {
      reply = "**UPSC (Union Public Service Commission)** भारत की सबसे प्रतिष्ठित परीक्षाएं आयोजित करता है।\n\n" +
              "सबसे मशहूर परीक्षा **Civil Services Exam (CSE)** है, जिसे पास करके आप **IAS, IPS, IFS, IRS** अधिकारी बनते हैं।\n" +
              "इसके अलावा UPSC **NDA, CDS, CAPF** आदि की परीक्षाएं भी लेता है। इसके लिए कड़ी मेहनत और समर्पण (Dedication) की ज़रूरत होती है! 🇮🇳";
      appendAIMessage(reply);
      return;
    }

    // E. Motivation, Study Tips & Fun
    if (q.includes('study tip') || q.includes('padhai me man') || q.includes('focus') || q.includes('distract')) {
      reply = "**पढ़ाई में फोकस बढ़ाने के टॉप टिप्स (Study Tips):** 🧠\n\n" +
              "1. **Pomodoro Technique**: 25 मिनट पढ़ें, 5 मिनट का ब्रेक लें।\n" +
              "2. **Distraction Free**: पढ़ाई के वक्त मोबाइल का इंटरनेट बंद कर दें या उसे दूसरे कमरे में रखें।\n" +
              "3. **Clear Goal**: रोज़ सुबह तय करें कि आज कौन सा चैप्टर खत्म करना है।\n" +
              "4. **Revision**: जो पढ़ा है उसे हफ़्ते के आख़िर में रिवाइज़ ज़रूर करें।\n" +
              "5. **Sleep**: कम से कम 7-8 घंटे की अच्छी नींद लें।\n\n" +
              "याद रखें, लगातार की गई छोटी मेहनत एक दिन बड़ा रिज़ल्ट देती है! 💯";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('motivat') || q.includes('depress') || q.includes('sad') || q.includes('haar gaya') || q.includes('quote')) {
      const quotes = [
        "\"सफलता की सीढ़ियां चढ़ने के लिए, आपको पसीना तो बहाना ही पड़ेगा।\" 💪",
        "\"जो मेहनत का सूर्य अस्त नहीं होने देते, वही सफलता का सूर्योदय देखते हैं।\" 🌅",
        "\"मुश्किलें हमेशा बेहतरीन लोगों के हिस्से में ही आती हैं, क्योंकि वे लोग ही उसे बेहतरीन तरीके से अंजाम देने की ताकत रखते हैं।\" ✨",
        "\"बिना संघर्ष के कोई महान नहीं होता, पत्थर पर जब तक चोट ना पड़े, पत्थर भी भगवान नहीं होता।\" 🗿",
        "\"Failure is not the opposite of success; it's part of success. हार मत मानो!\" 🚀"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      reply = `**Motivational Quote:**\n\n${randomQuote}\n\nआप बहुत क़ाबिल हैं! एक बार फिर से कोशिश करें, मंज़िल आपके कदम चूमेगी। अगर बात करने का मन हो, तो मैं हमेशा यहाँ हूँ। ❤️`;
      appendAIMessage(reply);
      return;
    }
    if (q.includes('joke') || q.includes('chutkula') || q.includes('bor') || q.includes('hasi')) {
      const jokes = [
        "Teacher: न्यूटन का नियम बताओ?\nStudent: सर, पूरी किताब ही न्यूटन के नियमों से भरी है, आप कौन सा पूछ रहे हैं?\nTeacher: सबसे मशहूर वाला!\nStudent: सर, जो सबसे मशहूर है वो तो मुझे भी नहीं पता! 😂",
        "बेटा: पापा, मुझे एक अच्छी सी घड़ी दिला दो ना!\nपापा: क्यों बेटा, तुम्हारी पुरानी घड़ी का क्या हुआ?\nबेटा: पापा, वो तो मैंने अपने टीचर को दे दी!\nपापा: क्यों?\nबेटा: क्योंकि वो कहते थे कि उनका वक्त बहुत खराब चल रहा है! ⌚😆",
        "Student (भगवान से): भगवान, कुछ ऐसा चमत्कार कर दो कि एग्जाम में सब याद आ जाए!\nभगवान: बेटा, मैंने चमत्कार तो बहुत किए हैं, पर किताब खोलने का चमत्कार तुझे ही करना पड़ेगा! 📖😂",
        "एग्जाम हॉल में छात्र ने दूसरे छात्र से पूछा: भाई, तूने इस सवाल का जवाब क्या लिखा है?\nदूसरा छात्र: मैंने तो कुछ नहीं लिखा, तूने क्या लिखा?\nपहला छात्र: मैंने भी कुछ नहीं लिखा।\nदूसरा छात्र: ले, अब टीचर सोचेगी कि हमने चीटिंग की है! 🤣"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      reply = `चलिए आपको थोड़ा हँसाता हूँ:\n\n${randomJoke}\n\nअब थोड़ा मूड रिफ्रेश हो गया हो तो वापस पढ़ाई पर लग जाएं! 😉`;
      appendAIMessage(reply);
      return;
    }
    if (q.includes('good morning') || q.includes('subah')) {
      reply = "Good Morning! 🌅 आज का दिन आपके लिए मंगलमय हो। एक नए जोश के साथ अपनी पढ़ाई और लक्ष्यों की ओर बढ़ें!";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('good night') || q.includes('so jao')) {
      reply = "Good Night! 🌙 दिनभर की मेहनत के बाद अब आराम करें। कल सुबह एक नई शुरुआत करनी है। शुभ रात्रि!";
      appendAIMessage(reply);
      return;
    }
    if (q === 'bye' || q === 'alvida' || q.includes('see you')) {
      reply = "Bye! 👋 अपना ख्याल रखना और मन लगाकर पढ़ाई करना। मुझे जब भी ज़रूरत हो, मैं यही हूँ। All the best!";
      appendAIMessage(reply);
      return;
    }

    // F. Tools specific matches
    if (q.includes('age') || q.includes('dob') || q.includes('birth')) {
      reply = "Aap अपनी सही उम्र और दिन गिनने के लिए हमारे [Age Calculator](tools.html) का उपयोग कर सकते हैं। यह बहुत सरल और सटीक है!";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('resume') || q.includes('cv') || q.includes('biodata')) {
      reply = "Sarkari aur Private Jobs के लिए एक बेहतरीन Resume बनाने के लिए हमारे [Resume & CV Maker](tools.html) का उपयोग करें। यह बिल्कुल मुफ़्त है!";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('resize') || q.includes('compress') || q.includes('photo') || q.includes('signature') || q.includes('sig')) {
      reply = "Online Form भरने के लिए फ़ोटो और सिग्नेचर का साइज़ (KB) कम करने के लिए हमारे [Photo & Signature Resizer](tools.html) का उपयोग करें।";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('typing') || q.includes('keyboard') || q.includes('speed')) {
      reply = "Hindi aur English typing की स्पीड बढ़ाने के लिए हमारे [Typing Test Tool](tools.html) का उपयोग कर के प्रैक्टिस करें।";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('salary') || q.includes('7th pay') || q.includes('pay scale')) {
      reply = "7th Pay Commission के अनुसार Basic Salary और भत्तों की गणना के लिए हमारे [Salary Calculator](tools.html) का उपयोग करें।";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('quiz') || q.includes('gk') || q.includes('current affairs')) {
      reply = "Apne General Knowledge को टेस्ट करने के लिए हमारे [GK Quiz Player](tools.html) पर जाएँ और मज़ेदार क्विज़ खेलें।";
      appendAIMessage(reply);
      return;
    }
    if (q.includes('planner') || q.includes('study') || q.includes('time table') || q.includes('schedule')) {
      reply = "Apna पढ़ाई का टाइम-टेबल बनाने और डेली टास्क को ट्रैक करने के लिए हमारे [Study Planner](tools.html) का उपयोग करें।";
      appendAIMessage(reply);
      return;
    }

    // D. Broad categorizations
    const hasJob = q.includes('job') || q.includes('naukri') || q.includes('vacancy') || q.includes('bharti') || q.includes('form') || q.includes('apply');
    const hasAdmit = q.includes('admit') || q.includes('admitcard') || q.includes('hall ticket') || q.includes('call letter');
    const hasResult = q.includes('result') || q.includes('marks') || q.includes('cut off') || q.includes('cutoff') || q.includes('merit');
    const hasSyllabus = q.includes('syllabus') || q.includes('pattern') || q.includes('course');
    const hasAnswer = q.includes('answer key') || q.includes('answerkey') || q.includes('keys') || q.includes('key');
    const hasAdmission = q.includes('admission') || q.includes('college') || q.includes('univ') || q.includes('entrance') || q.includes('jee') || q.includes('neet') || q.includes('cuet');

    // Perform database search
    const dbResults = searchLocalDatabase(query);

    if (dbResults.length > 0) {
      reply = "Humare site database se matches mile hain:\n\n";
      dbResults.forEach(m => {
        reply += `- **[${m.type}]** [${m.title}](${m.url})\n`;
      });
      
      // Append section links
      reply += "\n\nAap in links par directly click kar sakte hain.\n\n";
      if (hasJob) reply += "Sabhi job forms ke liye: [Latest Jobs Page](latest-jobs.html)\n";
      if (hasAdmit) reply += "Sabhi admit cards ke liye: [Admit Cards Page](admit-card.html)\n";
      if (hasResult) reply += "Sabhi results dekhne ke liye: [Exam Results Page](results.html)\n";
      if (hasSyllabus) reply += "Sabhi exam syllabus ke liye: [Syllabus Page](syllabus.html)\n";
      if (hasAnswer) reply += "Sabhi answer keys ke liye: [Answer Key Page](answer-key.html)\n";
      if (hasAdmission) reply += "Sabhi college admissions ke liye: [Admissions Page](admission.html)\n";

      reply += `General search results ke liye: [Search Google: '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
    } else {
      // Intent specific fallbacks when database returns no matches
      if (hasJob) {
        reply = "Mujhe is job form ka link directly database me nahi mila. Aap hamare [Latest Jobs Page](latest-jobs.html) par check kar sakte hain, jahan sabhi bharti forms line-wise diye gaye hain.\n\n" +
                `Ya is job form ko Google par khojein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else if (hasAdmit) {
        reply = "Mujhe is ka admit card link directly database me nahi mila. Aap hamare [Admit Cards Page](admit-card.html) par check kar sakte hain, jahan latest hall tickets uploaded hain.\n\n" +
                `Ya Google पर search karein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else if (hasResult) {
        reply = "Mujhe is exam ka result database me nahi mila. Aap hamare [Results Page](results.html) check kareइन, jahan sabhi board aur competitive result links update kiye jaate hain.\n\n" +
                `Ya details Google par dekhein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else if (hasSyllabus) {
        reply = "Mujhe iska exam pattern aur syllabus database me nahi mila. Aap hamare [Syllabus Page](syllabus.html) check karein, jahan hum daily updates karte hain.\n\n" +
                `Ya link Google par dekhein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else if (hasAnswer) {
        reply = "Mujhe is exam की answer key database me nahi mili. Aap hamare [Answer Key Page](answer-key.html) par check kar sakte hain.\n\n" +
                `Ya link Google par dekhein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else if (hasAdmission) {
        reply = "Mujhe is university ka admission link database me nahi mila. Aap hamare [Admissions Page](admission.html) par check kar sakte hain, jahan DU, JEE, NEET aur CUET updates rehte hain.\n\n" +
                `Ya details Google par dekhein: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})`;
      } else {
        // Universal catch-all with Google Search link
        reply = "Mujhe website data me is query ke liye exact match nahi mila.\n\n" +
                "Lekin aap use Google par search kar sakte hain (students ke liye links niche diye hain):\n" +
                `- **Google Search Link**: [Search Google for '${query}'](https://www.google.com/search?q=${encodeURIComponent(query)})\n\n` +
                "Humare main sections check karein:\n" +
                "- [Latest Jobs](latest-jobs.html)\n" +
                "- [Admit Cards](admit-card.html)\n" +
                "- [Results](results.html)\n" +
                "- [Syllabus](syllabus.html)\n" +
                "- [Tools Hub](tools.html)\n" +
                "- [About Abhi Result](about-us.html)";
      }
    }

    appendAIMessage(reply);
  }

  // 6. Local Database Query Engine
  function searchLocalDatabase(query) {
    if (!query || typeof siteData === 'undefined') return [];
    const q = query.toLowerCase().trim();
    const results = [];

    // Search Jobs
    if (siteData.latestJobs) {
      siteData.latestJobs.forEach(j => {
        if (j.title.toLowerCase().includes(q) || (j.category && j.category.toLowerCase().includes(q))) {
          results.push({ type: 'Job', title: j.title, url: `latest-jobs.html?id=${j.id}` });
        }
      });
    }
    // Search Admit Cards
    if (siteData.admitCards) {
      siteData.admitCards.forEach(c => {
        if (c.title.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))) {
          results.push({ type: 'Admit Card', title: c.title, url: `admit-card.html?id=${c.id}` });
        }
      });
    }
    // Search Results
    if (siteData.results) {
      siteData.results.forEach(r => {
        if (r.title.toLowerCase().includes(q) || (r.category && r.category.toLowerCase().includes(q))) {
          results.push({ type: 'Result', title: r.title, url: `results.html?id=${r.id}` });
        }
      });
    }
    // Search Syllabus
    if (siteData.syllabi) {
      siteData.syllabi.forEach(s => {
        if (s.title.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q))) {
          results.push({ type: 'Syllabus', title: s.title, url: `syllabus.html?id=${s.id}` });
        }
      });
    }
    // Search Admissions
    if (siteData.admissions) {
      siteData.admissions.forEach(a => {
        if (a.title.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q))) {
          results.push({ type: 'Admission', title: a.title, url: `admission.html?id=${a.id}` });
        }
      });
    }

    return results.slice(0, 5); // top 5
  }

  // 7. Basic markdown parser
  function parseMarkdown(text) {
    if (!text) return '';
    let html = escapeHTML(text);

    // Bold text: **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Markdown Links: [anchor](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Lists items: - item
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // merge lists

    // Newlines to br
    html = html.replace(/\n/g, '<br>');

    return html;
  }
}
