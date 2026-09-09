  // ---------- MOCK DATA ----------
  const categories = ["All","Customer Support","WhatsApp Automation","Data Entry","Lead Generation","Reporting & Analytics","Scheduling"];

  const agents = [
    {name:"ReplyDesk", dev:"by Ananya K.", cat:"WhatsApp Automation", desc:"Auto-answers common WhatsApp customer questions and hands off complex ones to a human.", price:"₹6,500", term:"one-time setup", rating:"4.8"},
    {name:"OrderPing", cat:"Customer Support", dev:"by Rohit S.", desc:"Sends automatic order-status replies across chat and email, pulled live from your sheet or store.", price:"₹4,200", term:"/month", rating:"4.6"},
    {name:"InvoiceSort", cat:"Data Entry", dev:"by Priya D.", desc:"Reads incoming invoices and enters line items into your spreadsheet or accounting tool.", price:"₹9,000", term:"one-time setup", rating:"4.9"},
    {name:"LeadCatcher", cat:"Lead Generation", dev:"by Vikram J.", desc:"Qualifies inbound web-form leads and books a call automatically for the ones that fit.", price:"₹5,000", term:"/month", rating:"4.5"},
    {name:"WeeklyRecap", cat:"Reporting & Analytics", dev:"by Meera N.", desc:"Compiles a plain-language weekly performance summary from your sales and support data.", price:"₹3,500", term:"/month", rating:"4.7"},
    {name:"SlotBot", cat:"Scheduling", dev:"by Aarav P.", desc:"Handles appointment booking, reminders and reschedules over WhatsApp and SMS.", price:"₹4,800", term:"/month", rating:"4.6"},
  ];

  const seedRequirements = [
    {biz:"Konkan Foods Pvt Ltd", cat:"WhatsApp Automation", desc:"Need auto-replies for the most common WhatsApp questions about delivery timing and order status.", budget:7000},
    {biz:"BrightPath Tutors", cat:"Scheduling", desc:"Want a bot that lets parents book and reschedule tuition slots without calling the office.", budget:5000},
    {biz:"Nimbus Logistics", cat:"Data Entry", desc:"Manually re-typing courier receipts into Excel every day — looking to automate that.", budget:9500},
  ];

  // ---------- FILTERS ----------
  const filtersEl = document.getElementById('filters');
  let activeCat = "All";
  categories.forEach(cat=>{
    const chip = document.createElement('button');
    chip.className = 'chip' + (cat === activeCat ? ' active' : '');
    chip.textContent = cat;
    chip.type = 'button';
    chip.addEventListener('click', ()=>{
      activeCat = cat;
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      renderAgents();
    });
    filtersEl.appendChild(chip);
  });

  function renderAgents(){
    const grid = document.getElementById('agentGrid');
    grid.innerHTML = '';
    const filtered = activeCat === "All" ? agents : agents.filter(a=>a.cat === activeCat);
    if(filtered.length === 0){
      grid.innerHTML = '<p class="empty-note">No agents in this category yet — be the first developer to list one.</p>';
      return;
    }
    filtered.forEach(a=>{
      const card = document.createElement('div');
      card.className = 'agent-card';
      card.innerHTML = `
        <div class="agent-top">
          <h3>${a.name}</h3>
          <span class="agent-cat">${a.cat}</span>
        </div>
        <div class="agent-dev">${a.dev}</div>
        <p class="agent-desc">${a.desc}</p>
        <div class="agent-foot">
          <div class="agent-price">${a.price} <span>${a.term}</span></div>
          <div class="rating">★ ${a.rating}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  renderAgents();

  // ---------- REQUIREMENTS BOARD ----------
  let requirements = [...seedRequirements];
  const reqListEl = document.getElementById('reqList');

  function renderRequirements(highlightIndex){
    reqListEl.innerHTML = '';
    requirements.forEach((r, i)=>{
      const card = document.createElement('div');
      card.className = 'req-card' + (i === highlightIndex ? ' new' : '');
      card.innerHTML = `
        <div class="req-top">
          <div>
            <h4>${r.biz}</h4>
            <div class="req-meta">${r.cat}${r.budget ? ' · Budget ₹' + Number(r.budget).toLocaleString('en-IN') : ''}</div>
          </div>
        </div>
        <p class="req-desc">${r.desc}</p>
        <div class="req-tags"><span class="tag">${r.cat}</span></div>
        <div class="req-actions">
          <button type="button" class="btn btn-outline btn-sm respond-btn">Respond as developer</button>
        </div>
        <div class="proposal-box">
          <div class="field" style="margin-top:12px;">
            <label>Your proposal</label>
            <textarea placeholder="e.g. I can build this with a WhatsApp Business API bot in 5 days for ₹6,500."></textarea>
          </div>
          <button type="button" class="btn btn-teal btn-sm send-proposal">Send proposal</button>
          <div class="proposal-sent">Proposal sent to ${r.biz}.</div>
        </div>
      `;
      const respondBtn = card.querySelector('.respond-btn');
      const proposalBox = card.querySelector('.proposal-box');
      const sendBtn = card.querySelector('.send-proposal');
      const sentNote = card.querySelector('.proposal-sent');
      respondBtn.addEventListener('click', ()=>{
        proposalBox.classList.toggle('open');
      });
      sendBtn.addEventListener('click', ()=>{
        sentNote.classList.add('show');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Proposal sent';
      });
      reqListEl.appendChild(card);
    });
  }
  renderRequirements();

  document.getElementById('reqForm').addEventListener('submit', function(e){
    e.preventDefault();
    const biz = document.getElementById('bizName').value.trim();
    const cat = document.getElementById('reqCategory').value;
    const desc = document.getElementById('reqDesc').value.trim();
    const budget = document.getElementById('reqBudget').value;
    if(!biz || !desc) return;
    requirements.unshift({biz, cat, desc, budget});
    renderRequirements(0);
    this.reset();
    document.getElementById('reqList').scrollTop = 0;
  });
