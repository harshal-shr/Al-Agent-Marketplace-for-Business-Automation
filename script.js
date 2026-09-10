/* ===================== DATA LAYER (localStorage) ===================== */
const DB_KEY = 'agentmart_db_v1';
const SUPPORT_EMAIL = 'harshalmohite28@gmail.com';

function loadDB(){
  let db = JSON.parse(localStorage.getItem(DB_KEY) || 'null');
  if(!db){
    db = {
      users: [],
      currentUserId: null,
      systems: [
        {id:'sys1', ownerId:'seed', ownerName:'Testing Desktop', title:'Lead Qualifier Agent', desc:'Scores inbound leads using CRM + email signals and routes hot leads to sales instantly.', url:'https://example.com/demo', status:'open', stack:['OpenAI','LangChain','Python']},
        {id:'sys2', ownerId:'seed', ownerName:'Testing Desktop', title:'Support Ticket Triage Bot', desc:'Classifies and auto-tags incoming support tickets, drafts first-response replies.', url:'https://example.com/demo2', status:'booked', stack:['OpenAI','Slack Bot']}
      ],
      needs: [
        {id:'req1', ownerId:'seed', ownerName:'Acme Retail Co.', title:'Automate WhatsApp customer replies', desc:'Need an agent to auto-handle common WhatsApp customer questions (order status, returns).', duration:'3 weeks', status:'open'},
        {id:'req2', ownerId:'seed', ownerName:'Northwind Logistics', title:'Invoice data extraction pipeline', desc:'Extract line-items from vendor invoice PDFs into our ERP automatically.', duration:'2 weeks', status:'open'}
      ]
    };
    saveDB(db);
  }
  return db;
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
let db = loadDB();

function currentUser(){
  return db.users.find(u => u.id === db.currentUserId) || null;
}
function uid(){ return 'id_' + Math.random().toString(36).slice(2,10); }
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display='block';
  setTimeout(()=> t.style.display='none', 2200);
}
function copySupport(){
  navigator.clipboard?.writeText(SUPPORT_EMAIL);
  toast('Support email copied: ' + SUPPORT_EMAIL);
}

/* ===================== AUTH ===================== */
function switchAuth(which){
  document.getElementById('auth-login').style.display = which==='login' ? 'block':'none';
  document.getElementById('auth-register').style.display = which==='register' ? 'block':'none';
}
function toggleRegRole(){
  const isClient = document.getElementById('role-client').checked;
  document.getElementById('reg-company-wrap').style.display = isClient ? 'block':'none';
  document.getElementById('reg-github-wrap').style.display = isClient ? 'none':'block';
}

function handleRegister(){
  const role = document.querySelector('input[name="reg-role"]:checked').value;
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const company = document.getElementById('reg-company').value.trim();
  const github = document.getElementById('reg-github').value.trim();
  const linkedin = document.getElementById('reg-linkedin').value.trim();

  if(!name || !email || !password){ toast('Please fill all required fields.'); return; }
  if(db.users.some(u => u.email === email)){ toast('An account with this email already exists.'); return; }

  const user = {
    id: uid(), role, name, email, password, company,
    github, linkedin, handle:'', bio:''
  };
  db.users.push(user);
  db.currentUserId = user.id;
  saveDB(db);
  enterApp();
}

function handleLogin(){
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = db.users.find(u => u.email === email && u.password === password);
  if(!user){ toast('Invalid email or password.'); return; }
  db.currentUserId = user.id;
  saveDB(db);
  enterApp();
}

function handleLogout(){
  db.currentUserId = null;
  saveDB(db);
  document.getElementById('view-app').classList.remove('active');
  document.getElementById('view-auth').classList.add('active');
  switchAuth('login');
}

/* ===================== APP SHELL ===================== */
function enterApp(){
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('view-app').classList.add('active');
  const u = currentUser();
  document.getElementById('topbar-role').textContent = u.role === 'developer' ? 'DEVELOPER' : 'CLIENT';
  document.getElementById('topbar-role').className = 'role-chip ' + (u.role==='client' ? 'client':'');
  showTab('feed');
  renderProfile();
}

function showTab(name){
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab===name));
  document.querySelectorAll('.tab-pane').forEach(p => p.style.display='none');
  document.getElementById('tab-'+name).style.display='block';
  if(name==='feed') renderFeed();
  if(name==='needs') renderNeeds();
  if(name==='portal') renderPortal();
  if(name==='profile') renderProfile();
}

/* ===================== FEED ===================== */
let activeFilters = new Set();
const ALL_TAGS = ['OpenAI','LangChain','Python','Slack Bot','Database'];

function renderFeedFilters(){
  const wrap = document.getElementById('feed-filters');
  wrap.innerHTML = ALL_TAGS.map(tag =>
    `<span class="filter-chip ${activeFilters.has(tag)?'active':''}" onclick="toggleFilter('${tag}')">${tag}</span>`
  ).join('');
}
function toggleFilter(tag){
  activeFilters.has(tag) ? activeFilters.delete(tag) : activeFilters.add(tag);
  renderFeedFilters();
  renderFeed();
}

function renderFeed(){
  renderFeedFilters();
  const q = (document.getElementById('feed-search').value || '').toLowerCase();
  const list = document.getElementById('feed-list');
  let items = db.systems.filter(s => {
    const matchesQ = !q || s.title.toLowerCase().includes(q) || s.stack.join(' ').toLowerCase().includes(q);
    const matchesTags = activeFilters.size===0 || s.stack.some(t => activeFilters.has(t));
    return matchesQ && matchesTags;
  });

  if(items.length===0){
    list.innerHTML = `<div class="col-12"><div class="empty-state panel">No systems match your filters yet.</div></div>`;
    return;
  }

  list.innerHTML = items.map(s => `
    <div class="col-md-6">
      <div class="card-item h-100">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-semibold">${escapeHtml(s.title)}</div>
            <div class="text-muted small">By ${escapeHtml(s.ownerName)}</div>
          </div>
          <span class="status-tag ${s.status==='open'?'status-open':'status-booked'}">${s.status==='open'?'OPEN':'BOOKED'}</span>
        </div>
        <p class="small text-muted mb-2">${escapeHtml(s.desc || '')}</p>
        <div>${s.stack.map(t=>`<span class="stack-chip">${escapeHtml(t)}</span>`).join('')}</div>
        ${s.url ? `<a href="${escapeAttr(s.url)}" target="_blank" class="small" style="color:var(--teal)">View demo →</a>` : ''}
      </div>
    </div>
  `).join('');
}

/* ===================== BUSINESS NEEDS ===================== */
function showPostRequirement(){
  document.getElementById('post-req-form').style.display='block';
}
function submitRequirement(){
  const title = document.getElementById('req-title').value.trim();
  const desc = document.getElementById('req-desc').value.trim();
  const duration = document.getElementById('req-duration').value;
  if(!title || !desc){ toast('Please fill title and description.'); return; }
  const u = currentUser();
  db.needs.unshift({id:uid(), ownerId:u.id, ownerName:u.company || u.name, title, desc, duration, status:'open'});
  saveDB(db);
  document.getElementById('req-title').value='';
  document.getElementById('req-desc').value='';
  document.getElementById('post-req-form').style.display='none';
  renderNeeds();
  toast('Requirement published.');
}
function renderNeeds(){
  const list = document.getElementById('needs-list');
  if(db.needs.length===0){
    list.innerHTML = `<div class="empty-state panel">No business requirements posted yet.</div>`;
    return;
  }
  list.innerHTML = db.needs.map(n => `
    <div class="card-item">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-semibold">${escapeHtml(n.title)}</div>
          <div class="text-muted small mb-2">Posted by: ${escapeHtml(n.ownerName)}</div>
        </div>
        <span class="status-tag ${n.status==='open'?'status-open':'status-booked'}">${n.status==='open'?'OPEN TO BUILD':'BOOKED'}</span>
      </div>
      <p class="small text-muted mb-2">${escapeHtml(n.desc)}</p>
      <span class="stack-chip">Duration: ${escapeHtml(n.duration)}</span>
    </div>
  `).join('');
}

/* ===================== CREATOR PORTAL ===================== */
function renderPortal(){
  const u = currentUser();
  const isDev = u.role === 'developer';
  document.getElementById('portal-locked').style.display = isDev ? 'none':'block';
  document.getElementById('portal-form-wrap').style.display = isDev ? 'block':'none';
}
function publishSystem(){
  const u = currentUser();
  const title = document.getElementById('sys-title').value.trim();
  const url = document.getElementById('sys-url').value.trim();
  const status = document.getElementById('sys-status').value;
  const desc = document.getElementById('sys-desc').value.trim();
  const stackRaw = document.getElementById('sys-stack').value.trim();
  if(!title || !url || !desc){ toast('Please fill all required fields.'); return; }
  const stack = stackRaw ? stackRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
  db.systems.unshift({id:uid(), ownerId:u.id, ownerName:u.name, title, url, status, desc, stack});
  saveDB(db);
  ['sys-title','sys-url','sys-desc','sys-stack'].forEach(id => document.getElementById(id).value='');
  toast('System published to marketplace.');
  showTab('feed');
}

/* ===================== PROFILE ===================== */
function renderProfile(){
  const u = currentUser();
  if(!u) return;
  document.getElementById('profile-name').value = u.name || '';
  document.getElementById('profile-handle').value = u.handle || '';
  document.getElementById('profile-bio').value = u.bio || '';
  document.getElementById('profile-github').value = u.github || '';
  document.getElementById('profile-linkedin').value = u.linkedin || '';
  document.getElementById('profile-company').value = u.company || '';
  document.getElementById('profile-company-wrap').style.display = u.role==='client' ? 'block':'none';
  document.getElementById('profile-name-display').textContent = u.name;
  document.getElementById('profile-role-display').textContent = u.role==='developer' ? 'AI DEVELOPER' : 'BUSINESS CLIENT';
  document.getElementById('profile-role-display').className = 'role-chip ' + (u.role==='client'?'client':'');
  document.getElementById('profile-avatar').textContent = (u.name||'??').slice(0,2).toUpperCase();
}
function saveProfile(){
  const u = currentUser();
  u.name = document.getElementById('profile-name').value.trim() || u.name;
  u.handle = document.getElementById('profile-handle').value.trim();
  u.bio = document.getElementById('profile-bio').value.trim();
  u.github = document.getElementById('profile-github').value.trim();
  u.linkedin = document.getElementById('profile-linkedin').value.trim();
  if(u.role==='client') u.company = document.getElementById('profile-company').value.trim();
  saveDB(db);
  renderProfile();
  toast('Profile saved.');
}

/* ===================== UTIL ===================== */
function escapeHtml(str){
  return (str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(str){ return escapeHtml(str); }

/* ===================== INIT ===================== */
(function init(){
  toggleRegRole();
  if(db.currentUserId && currentUser()){
    enterApp();
  }
})();
