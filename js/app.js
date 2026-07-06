/* =========================================================
   STUBLINE — Event Management System
   Pure HTML/CSS/JS. "Database" = browser localStorage,
   acting as persistent storage for users, events & bookings.
   ========================================================= */

const DB_KEYS = { users:'ems_users', events:'ems_events', bookings:'ems_bookings', session:'ems_session' };

const CATEGORIES = [
  {id:'music', label:'Music', icon:'🎵'},
  {id:'birthday', label:'Birthday', icon:'🎂'},
  {id:'comedy', label:'Comedy Show', icon:'🎤'},
  {id:'sports', label:'Sports', icon:'🏆'},
  {id:'conference', label:'Conference', icon:'💻'},
  {id:'festival', label:'Festival', icon:'🎪'},
  {id:'other', label:'Other', icon:'🎫'}
];

const EVENT_IMAGE_LIBRARY = {
  music: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80'
  ],
  birthday: [
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80'
  ],
  comedy: [
    'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1543584756-31b1d17fcb93?auto=format&fit=crop&w=900&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80'
  ],
  cricket: [
    'https://loremflickr.com/900/520/cricket,batsman?lock=721',
    'https://loremflickr.com/900/520/cricket,stadium?lock=722',
    'https://loremflickr.com/900/520/cricket,wicket?lock=723'
  ],
  conference: [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80'
  ],
  festival: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=900&q=80'
  ],
  other: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80'
  ]
};

/* ---------- storage helpers ---------- */
function loadDB(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
function saveDB(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
function getSession(){ try{ return JSON.parse(localStorage.getItem(DB_KEYS.session)); }catch(e){ return null; } }
function setSession(userId){ localStorage.setItem(DB_KEYS.session, JSON.stringify({userId})); }
function clearSession(){ localStorage.removeItem(DB_KEYS.session); }
function uid(prefix){ return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function fmtDate(d){ try{ return new Date(d+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }catch(e){ return d; } }
function catInfo(id){ return CATEGORIES.find(c=>c.id===id) || CATEGORIES[CATEGORIES.length-1]; }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function hashString(s){
  return (s || '').split('').reduce((hash, ch)=>((hash << 5) - hash + ch.charCodeAt(0)) | 0, 0);
}
function eventImageFor(e){
  const title = (e.title || '').toLowerCase();
  let category = e.category || 'other';
  if(/cricket|batsman|batting|bowler|wicket|innings|ipl|t20/.test(title)) category = 'cricket';
  else if(/football|soccer|cup|match|tournament|sport|tennis|badminton|basketball/.test(title)) category = 'sports';
  else if(/dev|frontend|conference|summit|workshop|tech/.test(title)) category = 'conference';
  else if(/laugh|comedy|comic|stand.?up|mic/.test(title)) category = 'comedy';
  else if(/birthday|party|bash|cake/.test(title)) category = 'birthday';
  else if(/music|indie|concert|band|acoustic|live/.test(title)) category = 'music';
  else if(/festival|food|craft|harvest|fair/.test(title)) category = 'festival';
  const images = EVENT_IMAGE_LIBRARY[category] || EVENT_IMAGE_LIBRARY.other;
  return images[Math.abs(hashString(`${e.id}-${e.title}-${e.venue}`)) % images.length];
}
function eventImageFallbackFor(e){
  if(/cricket|batsman|batting|bowler|wicket|innings|ipl|t20/.test((e.title || '').toLowerCase())){
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80';
  }
  return EVENT_IMAGE_LIBRARY.other[0];
}
function eventImageAlt(e){
  return `${catInfo(e.category).label} image for ${e.title || 'event'}`;
}

/* ---------- seed data (only runs once) ---------- */
function seedIfEmpty(){
  let users = loadDB(DB_KEYS.users);
  if(users.length === 0){
    users = [
      {id:'admin_1', name:'Site Admin', email:'admin@stubline.com', password:'admin123', role:'admin'},
      {id:'org_1', name:'Nova Live Productions', email:'nova@events.com', password:'nova123', role:'organizer'},
    ];
    saveDB(DB_KEYS.users, users);
  }
  let events = loadDB(DB_KEYS.events);
  if(events.length === 0){
    events = [
      {id:'evt_1', organizerId:'org_1', organizerName:'Nova Live Productions', title:'Indie Nights: Autumn Session', category:'music', description:'An evening of indie and acoustic sets from four emerging local acts in a cozy warehouse venue.', date: futureDate(12), time:'19:30', venue:'The Warehouse, Sector 5', price:499, totalTickets:120, availableTickets:34, published:true},
      {id:'evt_2', organizerId:'org_1', organizerName:'Nova Live Productions', title:'Laugh Riot — Open Mic Comedy', category:'comedy', description:'Six comics, one mic, zero filters. A rowdy night of stand-up comedy for adults.', date: futureDate(5), time:'20:00', venue:'Cafe Punchline', price:249, totalTickets:80, availableTickets:6, published:true},
      {id:'evt_3', organizerId:'org_1', organizerName:'Nova Live Productions', title:'DevCon: Frontend Futures', category:'conference', description:'A one-day conference on modern frontend engineering, design systems and performance.', date: futureDate(30), time:'09:00', venue:'City Convention Hall', price:1499, totalTickets:300, availableTickets:300, published:true},
      {id:'evt_4', organizerId:'org_1', organizerName:'Nova Live Productions', title:'Rhea Turns Seven — Superhero Bash', category:'birthday', description:'A superhero-themed birthday party with games, cake and a magic show for kids.', date: futureDate(18), time:'16:00', venue:'Sunshine Party Lawn', price:0, totalTickets:60, availableTickets:60, published:true},
      {id:'evt_5', organizerId:'org_1', organizerName:'Nova Live Productions', title:'Street Football 5-a-side Cup', category:'sports', description:'Amateur 5-a-side football tournament open to all skill levels. Trophies for top 3 teams.', date: futureDate(9), time:'08:00', venue:'Riverside Turf Ground', price:299, totalTickets:16, availableTickets:0, published:true},
      {id:'evt_6', organizerId:'org_1', organizerName:'Nova Live Productions', title:'Harvest Food & Craft Festival', category:'festival', description:'A weekend festival celebrating local food stalls, handmade crafts and folk music.', date: futureDate(45), time:'11:00', venue:'Central Park Grounds', price:99, totalTickets:500, availableTickets:500, published:false},
    ];
    saveDB(DB_KEYS.events, events);
  }
}
function futureDate(daysAhead){
  const d = new Date(); d.setDate(d.getDate()+daysAhead);
  return d.toISOString().slice(0,10);
}
seedIfEmpty();

/* ---------- app state ---------- */
let state = {
  currentUser: null,
  showAuth: false,
  authTab: 'login',
  signupRole: 'attendee',
  userTab: 'browse',
  activeCategory: 'all',
  searchTerm: '',
  orgTab: 'events',
  adminTab: 'overview',
  modal: null, // {type, payload}
  formError: null,
};

function currentUserObj(){
  const sess = getSession();
  if(!sess) return null;
  const users = loadDB(DB_KEYS.users);
  return users.find(u=>u.id===sess.userId) || null;
}

/* =========================================================
   RENDER ROOT
   ========================================================= */
function render(){
  const app = document.getElementById('app');
  state.currentUser = currentUserObj();
  if(!state.currentUser){
    app.innerHTML = state.showAuth ? renderAuthScreen() : renderPublicHome();
  } else {
    app.innerHTML = renderTopbar() + '<div class="main">' + renderMainContent() + '</div>' + renderModal() + renderFooter();
  }
  attachHandlers();
}

/* =========================================================
   PUBLIC ATTENDEE HOME
   ========================================================= */
function renderPublicTopbar(){
  return `
  <div class="topbar public-topbar">
    <div class="brand"><span class="dot"></span>STUBLINE</div>
    <div class="nav-right">
      <button class="btn btn-outline btn-sm" data-action="open-login">Log in</button>
      <button class="btn btn-primary btn-sm" data-action="open-signup">Sign up</button>
    </div>
  </div>`;
}

function renderPublicHome(){
  const events = loadDB(DB_KEYS.events).filter(e=>e.published);
  const totalTickets = events.reduce((sum,e)=>sum + Math.max(0, e.availableTickets), 0);
  const nextEvent = events.slice().sort((a,b)=>a.date.localeCompare(b.date))[0];
  const nextImage = nextEvent ? eventImageFor(nextEvent) : EVENT_IMAGE_LIBRARY.other[0];
  const nextFallback = nextEvent ? eventImageFallbackFor(nextEvent) : EVENT_IMAGE_LIBRARY.other[0];
  return `
  ${renderPublicTopbar()}
  <section class="attendee-hero">
    <div class="hero-panel">
      <div class="eyebrow">Live events, local seats, easy booking</div>
      <h1>Find something worth showing up for.</h1>
      <p>Browse published events from organizers on STUBLINE. Open any event, pick your tickets, and log in only when you are ready to book.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#events-section">Browse events</a>
        <button class="btn btn-outline" data-action="open-login">Log in to book</button>
      </div>
    </div>
    <div class="hero-ticket">
      <div class="hero-ticket-media">
        <img src="${nextImage}" alt="${escapeHtml(nextEvent ? eventImageAlt(nextEvent) : 'Event crowd image')}" onerror="this.onerror=null;this.src='${nextFallback}'">
      </div>
      <span class="stub-cat">NEXT UP</span>
      <h3>${nextEvent ? escapeHtml(nextEvent.title) : 'Published events coming soon'}</h3>
      <div class="stub-meta">
        ${nextEvent ? `${fmtDate(nextEvent.date)} at ${nextEvent.time}<br>${escapeHtml(nextEvent.venue)}` : 'Organizers can publish events from their dashboard.'}
      </div>
      <div class="hero-ticket-line"></div>
      <div class="hero-ticket-bottom">
        <span>${events.length} published</span>
        <strong>${totalTickets} seats open</strong>
      </div>
    </div>
  </section>
  <main class="main public-main" id="events-section">
    <div class="section-head">
      <div>
        <h2>Published events</h2>
        <div class="sub">Concerts, comedy, conferences, sports and celebrations ready for attendees.</div>
      </div>
      <button class="btn btn-ghost" data-action="open-signup">Create attendee account</button>
    </div>
    ${renderBrowseEvents()}
  </main>
  ${renderModal()}
  ${renderFooter()}`;
}

/* =========================================================
   AUTH SCREEN
   ========================================================= */
function renderAuthScreen(){
  const isLogin = state.authTab === 'login';
  return `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-side">
        <div>
          <div class="brand" style="color:#fff;"><span class="dot"></span>STUBLINE</div>
          <h1 style="margin-top:26px;">Events, ticketed simply.</h1>
          <p>Discover shows, book your seat and manage the whole thing — from a birthday bash to a comedy night — in one clean stub.</p>
          <svg class="ticket-illustration" width="100%" height="110" viewBox="0 0 300 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="280" height="80" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" stroke-dasharray="4 4"/>
            <circle cx="190" cy="15" r="9" fill="#1F2340"/>
            <circle cx="190" cy="95" r="9" fill="#1F2340"/>
            <line x1="190" y1="30" x2="190" y2="80" stroke="rgba(255,255,255,0.35)" stroke-dasharray="3 4"/>
            <text x="30" y="50" fill="#F4E3B8" font-family="monospace" font-size="13">ADM. ONE</text>
            <text x="30" y="70" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="10">GATE 04 · ROW C</text>
            <text x="212" y="58" fill="#F4E3B8" font-family="monospace" font-size="20">#0472</text>
          </svg>
        </div>
        <div class="fineprint">3 ROLES · ATTENDEE — book &amp; manage tickets<br>ORGANIZER — create &amp; publish events<br>ADMIN — full platform oversight</div>
      </div>
      <div class="auth-form-side">
        <div class="tabs">
          <button class="tab-btn ${isLogin?'active':''}" data-action="auth-tab" data-tab="login">Log in</button>
          <button class="tab-btn ${!isLogin?'active':''}" data-action="auth-tab" data-tab="signup">Sign up</button>
        </div>
        ${state.formError ? `<div class="form-msg error">${escapeHtml(state.formError)}</div>` : ''}
        ${isLogin ? renderLoginForm() : renderSignupForm()}
      </div>
    </div>
  </div>`;
}

function renderLoginForm(){
  return `
  <form id="loginForm">
    <div class="field"><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input type="password" name="password" required placeholder="••••••••"></div>
    <button type="submit" class="btn btn-primary" style="width:100%;">Log in</button>
    <div class="admin-hint">Admin demo login → admin@stubline.com / admin123<br>Organizer demo → nova@events.com / nova123</div>
  </form>`;
}

function renderSignupForm(){
  return `
  <form id="signupForm">
    <div class="role-toggle">
      <div class="role-opt ${state.signupRole==='attendee'?'selected':''}" data-action="pick-role" data-role="attendee">🎫 Attendee</div>
      <div class="role-opt ${state.signupRole==='organizer'?'selected':''}" data-action="pick-role" data-role="organizer">🎪 Organizer</div>
    </div>
    <div class="field"><label>Full name</label><input type="text" name="name" required placeholder="Your name"></div>
    <div class="field"><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input type="password" name="password" required placeholder="At least 4 characters" minlength="4"></div>
    <button type="submit" class="btn btn-primary" style="width:100%;">Create account</button>
  </form>`;
}

/* =========================================================
   TOPBAR
   ========================================================= */
function renderTopbar(){
  const u = state.currentUser;
  const roleLabel = u.role==='admin' ? 'Admin' : u.role==='organizer' ? 'Organizer' : 'Attendee';
  return `
  <div class="topbar">
    <div class="brand"><span class="dot"></span>STUBLINE</div>
    <div class="nav-right">
      <span class="role-badge ${u.role==='admin'?'admin':u.role==='organizer'?'organizer':'attendee'}">${roleLabel}</span>
      <span style="font-size:14px;">${escapeHtml(u.name)}</span>
      <button class="btn btn-outline btn-sm" data-action="logout">Log out</button>
    </div>
  </div>`;
}

function renderFooter(){
  return `<footer>STUBLINE · data stored locally in your browser · demo build</footer>`;
}

/* =========================================================
   MAIN CONTENT ROUTER
   ========================================================= */
function renderMainContent(){
  const role = state.currentUser.role;
  if(role === 'admin') return renderAdminDashboard();
  if(role === 'organizer') return renderOrganizerDashboard();
  return renderUserDashboard();
}

/* =========================================================
   ATTENDEE (USER) DASHBOARD
   ========================================================= */
function renderUserDashboard(){
  return `
  <div class="section-head">
    <div><h2>Find your next event</h2><div class="sub">Browse published events or check your bookings.</div></div>
  </div>
  <div class="pillnav">
    <button class="${state.userTab==='browse'?'active':''}" data-action="user-tab" data-tab="browse">Browse events</button>
    <button class="${state.userTab==='bookings'?'active':''}" data-action="user-tab" data-tab="bookings">My bookings</button>
  </div>
  ${state.userTab==='browse' ? renderBrowseEvents() : renderMyBookings()}
  `;
}

function renderBrowseEvents(){
  const events = loadDB(DB_KEYS.events).filter(e=>e.published);
  const filtered = events.filter(e=>{
    const catOk = state.activeCategory==='all' || e.category===state.activeCategory;
    const term = state.searchTerm.trim().toLowerCase();
    const termOk = !term || e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term);
    return catOk && termOk;
  }).sort((a,b)=> a.date.localeCompare(b.date));

  const chips = `<div class="cat-chip ${state.activeCategory==='all'?'active':''}" data-action="filter-cat" data-cat="all">✨ All</div>` +
    CATEGORIES.map(c=>`<div class="cat-chip ${state.activeCategory===c.id?'active':''}" data-action="filter-cat" data-cat="${c.id}">${c.icon} ${c.label}</div>`).join('');

  return `
  <div class="cat-row">${chips}</div>
  <div class="search-row">
    <input type="text" id="searchInput" placeholder="Search by event name or venue…" value="${escapeHtml(state.searchTerm)}">
  </div>
  <div class="event-grid">
    ${filtered.length ? filtered.map(e=>renderEventStub(e)).join('') : `<div class="empty-state" style="grid-column:1/-1;"><h3>No events found</h3><p>Try a different category or search term.</p></div>`}
  </div>`;
}

function renderEventStub(e, opts={}){
  const cat = catInfo(e.category);
  const soldOut = e.availableTickets <= 0;
  const low = !soldOut && e.availableTickets <= Math.max(5, Math.round(e.totalTickets*0.1));
  const image = eventImageFor(e);
  return `
  <div class="stub">
    ${opts.showDraft && !e.published ? `<span class="status-tag draft">DRAFT</span>` : soldOut ? `<span class="status-tag soldout">SOLD OUT</span>` : ''}
    <div class="stub-media">
      <img src="${image}" alt="${escapeHtml(eventImageAlt(e))}" loading="lazy" onerror="this.onerror=null;this.src='${eventImageFallbackFor(e)}'">
    </div>
    <div class="stub-top">
      <span class="stub-code">#${e.id.slice(-5).toUpperCase()}</span>
      <span class="stub-cat">${cat.icon} ${cat.label}</span>
      <h3 class="stub-title">${escapeHtml(e.title)}</h3>
      <div class="stub-meta">
        📅 <strong>${fmtDate(e.date)}</strong> · ${e.time}<br>
        📍 ${escapeHtml(e.venue)}
      </div>
      <div class="stub-desc">${escapeHtml(e.description)}</div>
    </div>
    <div class="perforation"></div>
    <div class="stub-bottom">
      <div>
        <div class="stub-price">${e.price>0? '₹'+e.price : 'FREE'}</div>
        <div class="stub-avail ${low?'low':''}">${soldOut? 'Sold out' : e.availableTickets+' / '+e.totalTickets+' left'}</div>
      </div>
      <button class="btn btn-primary btn-sm" data-action="view-event" data-id="${e.id}">View &amp; book</button>
    </div>
  </div>`;
}

function renderMyBookings(){
  const bookings = loadDB(DB_KEYS.bookings).filter(b=>b.userId===state.currentUser.id && b.status==='active');
  const events = loadDB(DB_KEYS.events);
  if(bookings.length===0){
    return `<div class="empty-state"><h3>No bookings yet</h3><p>Once you book a ticket, it'll show up here with your stub number.</p></div>`;
  }
  return `<div class="event-grid">${bookings.map(b=>{
    const e = events.find(ev=>ev.id===b.eventId);
    if(!e) return '';
    const cat = catInfo(e.category);
    const image = eventImageFor(e);
    return `
    <div class="stub">
      <span class="stub-code">#${b.id.slice(-5).toUpperCase()}</span>
      <div class="stub-media">
        <img src="${image}" alt="${escapeHtml(eventImageAlt(e))}" loading="lazy" onerror="this.onerror=null;this.src='${eventImageFallbackFor(e)}'">
      </div>
      <div class="stub-top">
        <span class="stub-cat">${cat.icon} ${cat.label}</span>
        <h3 class="stub-title">${escapeHtml(e.title)}</h3>
        <div class="stub-meta">
          📅 <strong>${fmtDate(e.date)}</strong> · ${e.time}<br>
          📍 ${escapeHtml(e.venue)}<br>
          🎟 Qty booked: <strong>${b.qty}</strong>
        </div>
      </div>
      <div class="perforation"></div>
      <div class="stub-bottom">
        <div>
          <div class="stub-price">${e.price>0? '₹'+(e.price*b.qty) : 'FREE'}</div>
          <div class="stub-avail">Booked ${new Date(b.bookedAt).toLocaleDateString()}</div>
        </div>
        <button class="btn btn-danger btn-sm" data-action="cancel-booking" data-id="${b.id}">Cancel</button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* =========================================================
   ORGANIZER DASHBOARD
   ========================================================= */
function renderOrganizerDashboard(){
  const myEvents = loadDB(DB_KEYS.events).filter(e=>e.organizerId===state.currentUser.id);
  return `
  <div class="section-head">
    <div><h2>Your events</h2><div class="sub">Create, publish and track ticket sales.</div></div>
    <button class="btn btn-primary" data-action="open-create-event">+ New event</button>
  </div>
  <div class="pillnav">
    <button class="${state.orgTab==='events'?'active':''}" data-action="org-tab" data-tab="events">My events (${myEvents.length})</button>
    <button class="${state.orgTab==='bookings'?'active':''}" data-action="org-tab" data-tab="bookings">Bookings</button>
  </div>
  ${state.orgTab==='events' ? renderOrgEvents(myEvents) : renderOrgBookings(myEvents)}
  `;
}

function renderOrgEvents(myEvents){
  if(myEvents.length===0){
    return `<div class="empty-state"><h3>No events yet</h3><p>Create your first event to start selling tickets.</p></div>`;
  }
  return `<div class="event-grid">${myEvents.map(e=>`
    <div class="stub">
      <span class="status-tag ${e.published?'':'draft'}">${e.published?'PUBLISHED':'DRAFT'}</span>
      <div class="stub-media">
        <img src="${eventImageFor(e)}" alt="${escapeHtml(eventImageAlt(e))}" loading="lazy" onerror="this.onerror=null;this.src='${eventImageFallbackFor(e)}'">
      </div>
      <div class="stub-top">
        <span class="stub-cat">${catInfo(e.category).icon} ${catInfo(e.category).label}</span>
        <h3 class="stub-title">${escapeHtml(e.title)}</h3>
        <div class="stub-meta">📅 <strong>${fmtDate(e.date)}</strong> · ${e.time}<br>📍 ${escapeHtml(e.venue)}</div>
        <div class="bar"><div class="bar-fill" style="width:${Math.round(100*(e.totalTickets-e.availableTickets)/Math.max(1,e.totalTickets))}%;"></div></div>
        <div class="stub-avail" style="margin-top:6px;">${e.totalTickets-e.availableTickets} sold · ${e.availableTickets} left</div>
      </div>
      <div class="perforation"></div>
      <div class="stub-bottom" style="flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" data-action="toggle-publish" data-id="${e.id}">${e.published?'Unpublish':'Publish'}</button>
        <button class="btn btn-plum btn-sm" data-action="edit-event" data-id="${e.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete-event" data-id="${e.id}">Delete</button>
      </div>
    </div>`).join('')}</div>`;
}

function renderOrgBookings(myEvents){
  const ids = myEvents.map(e=>e.id);
  const bookings = loadDB(DB_KEYS.bookings).filter(b=>ids.includes(b.eventId));
  const users = loadDB(DB_KEYS.users);
  if(bookings.length===0){
    return `<div class="empty-state"><h3>No bookings yet</h3><p>Bookings for your events will appear here.</p></div>`;
  }
  return `<div class="table-wrap"><table>
    <tr><th>Event</th><th>Attendee</th><th>Qty</th><th>Status</th><th>Booked on</th></tr>
    ${bookings.map(b=>{
      const e = myEvents.find(ev=>ev.id===b.eventId);
      const u = users.find(us=>us.id===b.userId);
      return `<tr>
        <td>${e?escapeHtml(e.title):'—'}</td>
        <td>${u?escapeHtml(u.name):'Deleted user'}</td>
        <td>${b.qty}</td>
        <td><span class="tag ${b.status==='active'?'published':'draft'}">${b.status}</span></td>
        <td>${new Date(b.bookedAt).toLocaleDateString()}</td>
      </tr>`;
    }).join('')}
  </table></div>`;
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */
function renderAdminDashboard(){
  const users = loadDB(DB_KEYS.users);
  const events = loadDB(DB_KEYS.events);
  const bookings = loadDB(DB_KEYS.bookings).filter(b=>b.status==='active');
  return `
  <div class="section-head">
    <div><h2>Admin control room</h2><div class="sub">Full access to every user, event and booking on the platform.</div></div>
  </div>
  <div class="pillnav">
    <button class="${state.adminTab==='overview'?'active':''}" data-action="admin-tab" data-tab="overview">Overview</button>
    <button class="${state.adminTab==='users'?'active':''}" data-action="admin-tab" data-tab="users">Users (${users.length})</button>
    <button class="${state.adminTab==='events'?'active':''}" data-action="admin-tab" data-tab="events">Events (${events.length})</button>
    <button class="${state.adminTab==='bookings'?'active':''}" data-action="admin-tab" data-tab="bookings">Bookings (${bookings.length})</button>
  </div>
  ${state.adminTab==='overview' ? renderAdminOverview(users,events,bookings) : ''}
  ${state.adminTab==='users' ? renderAdminUsers(users) : ''}
  ${state.adminTab==='events' ? renderAdminEvents(events) : ''}
  ${state.adminTab==='bookings' ? renderAdminBookings(bookings, events, users) : ''}
  `;
}

function renderAdminOverview(users,events,bookings){
  const totalRevenue = bookings.reduce((sum,b)=>{
    const e = events.find(ev=>ev.id===b.eventId);
    return sum + (e ? e.price*b.qty : 0);
  },0);
  return `
  <div class="stat-row">
    <div class="stat-card"><div class="num">${users.length}</div><div class="lbl">Total users</div></div>
    <div class="stat-card"><div class="num">${users.filter(u=>u.role==='organizer').length}</div><div class="lbl">Organizers</div></div>
    <div class="stat-card"><div class="num">${events.length}</div><div class="lbl">Total events</div></div>
    <div class="stat-card"><div class="num">${events.filter(e=>e.published).length}</div><div class="lbl">Published events</div></div>
    <div class="stat-card"><div class="num">${bookings.length}</div><div class="lbl">Active bookings</div></div>
    <div class="stat-card"><div class="num">₹${totalRevenue}</div><div class="lbl">Gross ticket value</div></div>
  </div>
  <div class="table-wrap">
    <table>
      <tr><th>Category</th><th>Events</th><th>Published</th></tr>
      ${CATEGORIES.map(c=>{
        const inCat = events.filter(e=>e.category===c.id);
        return `<tr><td>${c.icon} ${c.label}</td><td>${inCat.length}</td><td>${inCat.filter(e=>e.published).length}</td></tr>`;
      }).join('')}
    </table>
  </div>`;
}

function renderAdminUsers(users){
  return `<div class="table-wrap"><table>
    <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
    ${users.map(u=>`<tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="tag role-${u.role}">${u.role}</span></td>
      <td>${u.role==='admin'? '<span style="color:#a39d84;font-size:12px;">Protected</span>' : `<button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${u.id}">Delete</button>`}</td>
    </tr>`).join('')}
  </table></div>`;
}

function renderAdminEvents(events){
  return `<div class="table-wrap"><table>
    <tr><th>Title</th><th>Category</th><th>Organizer</th><th>Date</th><th>Tickets</th><th>Status</th><th>Actions</th></tr>
    ${events.map(e=>`<tr>
      <td>${escapeHtml(e.title)}</td>
      <td>${catInfo(e.category).icon} ${catInfo(e.category).label}</td>
      <td>${escapeHtml(e.organizerName)}</td>
      <td>${fmtDate(e.date)}</td>
      <td>${e.totalTickets-e.availableTickets}/${e.totalTickets}</td>
      <td><span class="tag ${e.published?'published':'draft'}">${e.published?'published':'draft'}</span></td>
      <td><button class="btn btn-danger btn-sm" data-action="admin-delete-event" data-id="${e.id}">Delete</button></td>
    </tr>`).join('')}
  </table></div>`;
}

function renderAdminBookings(bookings, events, users){
  if(bookings.length===0) return `<div class="empty-state"><h3>No active bookings</h3></div>`;
  return `<div class="table-wrap"><table>
    <tr><th>Event</th><th>Attendee</th><th>Qty</th><th>Booked on</th><th>Actions</th></tr>
    ${bookings.map(b=>{
      const e = events.find(ev=>ev.id===b.eventId);
      const u = users.find(us=>us.id===b.userId);
      return `<tr>
        <td>${e?escapeHtml(e.title):'Deleted event'}</td>
        <td>${u?escapeHtml(u.name):'Deleted user'}</td>
        <td>${b.qty}</td>
        <td>${new Date(b.bookedAt).toLocaleDateString()}</td>
        <td><button class="btn btn-danger btn-sm" data-action="admin-cancel-booking" data-id="${b.id}">Cancel</button></td>
      </tr>`;
    }).join('')}
  </table></div>`;
}

/* =========================================================
   MODAL: event detail (booking) + create/edit event form
   ========================================================= */
function renderModal(){
  if(!state.modal) return '';
  if(state.modal.type === 'view-event') return renderEventDetailModal(state.modal.payload);
  if(state.modal.type === 'event-form') return renderEventFormModal(state.modal.payload);
  return '';
}

function renderEventDetailModal(eventId){
  const e = loadDB(DB_KEYS.events).find(ev=>ev.id===eventId);
  if(!e) return '';
  const cat = catInfo(e.category);
  const soldOut = e.availableTickets<=0;
  const image = eventImageFor(e);
  return `
  <div class="modal-overlay" data-action="close-modal">
    <div class="modal" onclick="event.stopPropagation()">
      <button class="modal-close" data-action="close-modal">✕</button>
      <div class="modal-media">
        <img src="${image}" alt="${escapeHtml(eventImageAlt(e))}" onerror="this.onerror=null;this.src='${eventImageFallbackFor(e)}'">
      </div>
      <span class="stub-cat">${cat.icon} ${cat.label}</span>
      <h3>${escapeHtml(e.title)}</h3>
      <div class="stub-meta" style="margin-bottom:14px;">
        📅 <strong>${fmtDate(e.date)}</strong> · ${e.time}<br>
        📍 ${escapeHtml(e.venue)}<br>
        🎤 Organized by ${escapeHtml(e.organizerName)}
      </div>
      <p style="font-size:14px;line-height:1.6;color:#403c2c;">${escapeHtml(e.description)}</p>
      <div class="bar"><div class="bar-fill" style="width:${Math.round(100*(e.totalTickets-e.availableTickets)/Math.max(1,e.totalTickets))}%;"></div></div>
      <div class="stub-avail" style="margin:8px 0 20px;">${soldOut? 'Sold out' : e.availableTickets+' of '+e.totalTickets+' tickets left'}</div>
      ${state.formError ? `<div class="form-msg error">${escapeHtml(state.formError)}</div>` : ''}
      ${soldOut ? `<button class="btn btn-ghost" disabled style="width:100%;">Sold out</button>` : `
      <form id="bookForm">
        <div class="field"><label>Number of tickets</label><input type="number" name="qty" min="1" max="${e.availableTickets}" value="1" required></div>
        <div class="stub-price" style="margin-bottom:14px;">Price per ticket: ${e.price>0?'₹'+e.price:'FREE'}</div>
        <button type="submit" class="btn btn-primary" style="width:100%;" data-id="${e.id}">Book now</button>
      </form>`}
    </div>
  </div>`;
}

function renderEventFormModal(eventObj){
  const editing = !!eventObj;
  const e = eventObj || {title:'',category:'music',description:'',date:'',time:'',venue:'',price:0,totalTickets:50};
  return `
  <div class="modal-overlay" data-action="close-modal">
    <div class="modal" onclick="event.stopPropagation()">
      <button class="modal-close" data-action="close-modal">✕</button>
      <h3>${editing?'Edit event':'Create a new event'}</h3>
      ${state.formError ? `<div class="form-msg error">${escapeHtml(state.formError)}</div>` : ''}
      <form id="eventForm">
        <div class="field"><label>Event title</label><input type="text" name="title" required value="${escapeHtml(e.title)}"></div>
        <div class="field"><label>Category</label>
          <select name="category">
            ${CATEGORIES.map(c=>`<option value="${c.id}" ${e.category===c.id?'selected':''}>${c.icon} ${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Description</label><textarea name="description" rows="3" required>${escapeHtml(e.description)}</textarea></div>
        <div class="grid-2">
          <div class="field"><label>Date</label><input type="date" name="date" required value="${e.date}"></div>
          <div class="field"><label>Time</label><input type="time" name="time" required value="${e.time}"></div>
        </div>
        <div class="field"><label>Venue</label><input type="text" name="venue" required value="${escapeHtml(e.venue)}"></div>
        <div class="grid-2">
          <div class="field"><label>Price per ticket (₹, 0 = free)</label><input type="number" name="price" min="0" required value="${e.price}"></div>
          <div class="field"><label>Total tickets</label><input type="number" name="totalTickets" min="1" required value="${e.totalTickets}"></div>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;" data-editing="${editing}" data-id="${editing?e.id:''}">${editing?'Save changes':'Create event'}</button>
      </form>
    </div>
  </div>`;
}

/* =========================================================
   EVENT HANDLERS (delegated)
   ========================================================= */
function attachHandlers(){
  document.body.onclick = (ev)=>{
    const el = ev.target.closest('[data-action]');
    if(!el) return;
    const action = el.dataset.action;

    if(action==='open-login'){ state.showAuth=true; state.authTab='login'; state.formError=null; render(); }
    else if(action==='open-signup'){ state.showAuth=true; state.authTab='signup'; state.formError=null; render(); }
    else if(action==='auth-tab'){ state.authTab = el.dataset.tab; state.formError=null; render(); }
    else if(action==='pick-role'){ state.signupRole = el.dataset.role; render(); }
    else if(action==='logout'){ clearSession(); state.showAuth=false; state.formError=null; render(); }
    else if(action==='user-tab'){ state.userTab = el.dataset.tab; render(); }
    else if(action==='org-tab'){ state.orgTab = el.dataset.tab; render(); }
    else if(action==='admin-tab'){ state.adminTab = el.dataset.tab; render(); }
    else if(action==='filter-cat'){ state.activeCategory = el.dataset.cat; render(); }
    else if(action==='view-event'){ state.modal={type:'view-event', payload:el.dataset.id}; state.formError=null; render(); }
    else if(action==='close-modal'){ state.modal=null; state.formError=null; render(); }
    else if(action==='open-create-event'){ state.modal={type:'event-form', payload:null}; state.formError=null; render(); }
    else if(action==='edit-event'){
      const e = loadDB(DB_KEYS.events).find(ev=>ev.id===el.dataset.id);
      state.modal={type:'event-form', payload:e}; state.formError=null; render();
    }
    else if(action==='toggle-publish'){ togglePublish(el.dataset.id); }
    else if(action==='delete-event'){ if(confirm('Delete this event? This cannot be undone.')) deleteEventAsOrganizer(el.dataset.id); }
    else if(action==='cancel-booking'){ if(confirm('Cancel this booking?')) cancelBooking(el.dataset.id); }
    else if(action==='delete-user'){ if(confirm('Permanently delete this user account?')) adminDeleteUser(el.dataset.id); }
    else if(action==='admin-delete-event'){ if(confirm('Delete this event as admin? All its bookings will be cancelled.')) adminDeleteEvent(el.dataset.id); }
    else if(action==='admin-cancel-booking'){ if(confirm('Cancel this booking as admin?')) adminCancelBooking(el.dataset.id); }
  };

  const loginForm = document.getElementById('loginForm');
  if(loginForm) loginForm.onsubmit = (e)=>{ e.preventDefault(); handleLogin(new FormData(loginForm)); };

  const signupForm = document.getElementById('signupForm');
  if(signupForm) signupForm.onsubmit = (e)=>{ e.preventDefault(); handleSignup(new FormData(signupForm)); };

  const bookForm = document.getElementById('bookForm');
  if(bookForm) bookForm.onsubmit = (e)=>{ e.preventDefault(); handleBooking(new FormData(bookForm), e.submitter.dataset.id); };

  const eventForm = document.getElementById('eventForm');
  if(eventForm) eventForm.onsubmit = (e)=>{
    e.preventDefault();
    const submitBtn = eventForm.querySelector('button[type=submit]');
    handleEventFormSubmit(new FormData(eventForm), submitBtn.dataset.editing==='true', submitBtn.dataset.id);
  };

  const searchInput = document.getElementById('searchInput');
  if(searchInput){
    searchInput.oninput = ()=>{ state.searchTerm = searchInput.value; render(); searchInput2Focus(); };
  }
}

// keep focus in search box after re-render while typing
function searchInput2Focus(){
  const el = document.getElementById('searchInput');
  if(el){ el.focus(); const v=el.value; el.value=''; el.value=v; }
}

/* ---------- auth actions ---------- */
function handleLogin(fd){
  const email = fd.get('email').trim().toLowerCase();
  const password = fd.get('password');
  const users = loadDB(DB_KEYS.users);
  const u = users.find(us=>us.email.toLowerCase()===email && us.password===password);
  if(!u){ state.formError = 'Incorrect email or password.'; render(); return; }
  setSession(u.id);
  state.showAuth=false;
  state.formError=null;
  render();
}

function handleSignup(fd){
  const name = fd.get('name').trim();
  const email = fd.get('email').trim().toLowerCase();
  const password = fd.get('password');
  const users = loadDB(DB_KEYS.users);
  if(users.some(u=>u.email.toLowerCase()===email)){
    state.formError = 'An account with this email already exists.'; render(); return;
  }
  const newUser = {id: uid('user'), name, email, password, role: state.signupRole};
  users.push(newUser);
  saveDB(DB_KEYS.users, users);
  setSession(newUser.id);
  state.showAuth=false;
  state.formError=null;
  render();
}

/* ---------- organizer actions ---------- */
function handleEventFormSubmit(fd, editing, eventId){
  const title = fd.get('title').trim();
  const category = fd.get('category');
  const description = fd.get('description').trim();
  const date = fd.get('date');
  const time = fd.get('time');
  const venue = fd.get('venue').trim();
  const price = Math.max(0, parseInt(fd.get('price'),10)||0);
  const totalTickets = Math.max(1, parseInt(fd.get('totalTickets'),10)||1);

  let events = loadDB(DB_KEYS.events);
  if(editing){
    const idx = events.findIndex(e=>e.id===eventId);
    if(idx>-1){
      const sold = events[idx].totalTickets - events[idx].availableTickets;
      if(totalTickets < sold){
        state.formError = `Cannot set total tickets below ${sold} already sold.`; render(); return;
      }
      events[idx] = {...events[idx], title, category, description, date, time, venue, price, totalTickets, availableTickets: totalTickets-sold};
    }
  } else {
    events.push({
      id: uid('evt'), organizerId: state.currentUser.id, organizerName: state.currentUser.name,
      title, category, description, date, time, venue, price, totalTickets, availableTickets: totalTickets, published:false
    });
  }
  saveDB(DB_KEYS.events, events);
  state.modal=null; state.formError=null;
  render();
}

function togglePublish(eventId){
  let events = loadDB(DB_KEYS.events);
  const idx = events.findIndex(e=>e.id===eventId);
  if(idx>-1){ events[idx].published = !events[idx].published; saveDB(DB_KEYS.events, events); render(); }
}

function deleteEventAsOrganizer(eventId){
  let events = loadDB(DB_KEYS.events).filter(e=>e.id!==eventId);
  saveDB(DB_KEYS.events, events);
  let bookings = loadDB(DB_KEYS.bookings);
  bookings = bookings.map(b=> b.eventId===eventId ? {...b, status:'cancelled'} : b);
  saveDB(DB_KEYS.bookings, bookings);
  render();
}

/* ---------- attendee actions ---------- */
function handleBooking(fd, eventId){
  if(!state.currentUser){
    state.modal = null;
    state.showAuth = true;
    state.authTab = 'login';
    state.formError = 'Please log in or create an attendee account to book this event.';
    render();
    return;
  }
  const qty = Math.max(1, parseInt(fd.get('qty'),10)||1);
  let events = loadDB(DB_KEYS.events);
  const idx = events.findIndex(e=>e.id===eventId);
  if(idx===-1) return;
  if(qty > events[idx].availableTickets){
    state.formError = 'Not enough tickets available.'; render(); return;
  }
  events[idx].availableTickets -= qty;
  saveDB(DB_KEYS.events, events);

  let bookings = loadDB(DB_KEYS.bookings);
  bookings.push({id: uid('bkg'), userId: state.currentUser.id, eventId, qty, bookedAt: Date.now(), status:'active'});
  saveDB(DB_KEYS.bookings, bookings);

  state.modal=null; state.formError=null;
  render();
}

function cancelBooking(bookingId){
  let bookings = loadDB(DB_KEYS.bookings);
  const idx = bookings.findIndex(b=>b.id===bookingId);
  if(idx===-1) return;
  const booking = bookings[idx];
  bookings[idx].status = 'cancelled';
  saveDB(DB_KEYS.bookings, bookings);

  let events = loadDB(DB_KEYS.events);
  const eIdx = events.findIndex(e=>e.id===booking.eventId);
  if(eIdx>-1){ events[eIdx].availableTickets += booking.qty; saveDB(DB_KEYS.events, events); }
  render();
}

/* ---------- admin actions ---------- */
function adminDeleteUser(userId){
  let users = loadDB(DB_KEYS.users).filter(u=>u.id!==userId);
  saveDB(DB_KEYS.users, users);
  // also remove their events (if organizer) and cancel their bookings
  let events = loadDB(DB_KEYS.events);
  const removedEventIds = events.filter(e=>e.organizerId===userId).map(e=>e.id);
  events = events.filter(e=>e.organizerId!==userId);
  saveDB(DB_KEYS.events, events);
  let bookings = loadDB(DB_KEYS.bookings);
  bookings = bookings.map(b=> (b.userId===userId || removedEventIds.includes(b.eventId)) ? {...b, status:'cancelled'} : b);
  saveDB(DB_KEYS.bookings, bookings);
  render();
}

function adminDeleteEvent(eventId){
  let events = loadDB(DB_KEYS.events).filter(e=>e.id!==eventId);
  saveDB(DB_KEYS.events, events);
  let bookings = loadDB(DB_KEYS.bookings).map(b=> b.eventId===eventId ? {...b, status:'cancelled'} : b);
  saveDB(DB_KEYS.bookings, bookings);
  render();
}

function adminCancelBooking(bookingId){
  let bookings = loadDB(DB_KEYS.bookings);
  const idx = bookings.findIndex(b=>b.id===bookingId);
  if(idx===-1) return;
  const booking = bookings[idx];
  bookings[idx].status='cancelled';
  saveDB(DB_KEYS.bookings, bookings);
  let events = loadDB(DB_KEYS.events);
  const eIdx = events.findIndex(e=>e.id===booking.eventId);
  if(eIdx>-1){ events[eIdx].availableTickets += booking.qty; saveDB(DB_KEYS.events, events); }
  render();
}

/* ---------- init ---------- */
render();
