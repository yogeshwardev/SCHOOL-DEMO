/* portal.js — application shell: sign-in, navigation, router, global search */
(function (G) {
  'use strict';
  const C = G.C, S = G.S, UI = G.UI, esc = C.esc;
  const Pages = G.Pages = G.Pages || {};
  const App = G.App;

  /* ---------- Navigation per role ---------- */
  const NAV = {
    principal: [['#', 'Overview'], ['dashboard', 'Dashboard', 'home'], ['#', 'People'], ['students', 'Students', 'users'], ['teachers', 'Teachers', 'user'], ['staff', 'Staff', 'building'], ['#', 'Academics'], ['academics', 'Academics', 'layers'], ['classes', 'Classes', 'book'], ['timetables', 'Timetables', 'calendar'], ['attendance', 'Attendance', 'check'], ['exams', 'Examinations', 'clipboard'], ['marks', 'Marks', 'award'], ['#', 'Finance'], ['finance', 'Finance', 'wallet'], ['fees', 'Fees', 'rupee'], ['payroll', 'Payroll', 'receipt'], ['#', 'Administration'], ['operations', 'Operations', 'sparkle'], ['reports', 'Reports', 'chart'], ['announcements', 'Announcements', 'bell'], ['calendar', 'Calendar', 'calendar'], ['settings', 'Settings', 'settings']],
    dean: [['#', 'Overview'], ['dashboard', 'Dashboard', 'home'], ['#', 'Academics'], ['classes', 'Classes', 'book'], ['teachers', 'Teachers', 'user'], ['subjects', 'Subjects', 'layers'], ['timetables', 'Timetables', 'calendar'], ['classteachers', 'Class Teachers', 'users'], ['exams', 'Examinations', 'clipboard'], ['marks', 'Marks', 'award'], ['attendance', 'Attendance', 'check'], ['#', 'Information'], ['reports', 'Reports', 'chart'], ['announcements', 'Announcements', 'bell'], ['calendar', 'Calendar', 'calendar']],
    accountant: [['#', 'Overview'], ['dashboard', 'Dashboard', 'home'], ['#', 'Student fees'], ['students', 'Students', 'users'], ['fees', 'Fee Collection', 'rupee'], ['pending', 'Pending Fees', 'alert'], ['receipts', 'Receipts', 'receipt'], ['#', 'Accounts'], ['payroll', 'Payroll', 'wallet'], ['expenses', 'Expenses', 'trend'], ['reports', 'Financial Reports', 'chart'], ['#', 'Information'], ['announcements', 'Announcements', 'bell']],
    teacher: [['#', 'Overview'], ['dashboard', 'Dashboard', 'home'], ['#', 'Classroom'], ['myclasses', 'My Classes', 'book'], ['mystudents', 'My Students', 'users'], ['attendance', 'Attendance', 'check'], ['marks', 'Marks', 'award'], ['timetables', 'Timetable', 'calendar'], ['exams', 'Examinations', 'clipboard'], ['#', 'Staff'], ['announcements', 'Announcements', 'bell'], ['calendar', 'Calendar', 'calendar'], ['leave', 'Leave', 'clock'], ['salary', 'Salary', 'wallet']],
    parent: [['dashboard', 'Home', 'home'], ['timetables', 'Timetable', 'calendar'], ['attendance', 'Attendance', 'check'], ['marks', 'Results', 'award'], ['exams', 'Exams', 'clipboard'], ['fees', 'Fees & Receipts', 'rupee'], ['hallticket', 'Hall Ticket', 'ticket'], ['calendar', 'School Calendar', 'calendar'], ['announcements', 'Notices', 'bell'], ['profile', 'Student Profile', 'user']],
    ops: [['dashboard', 'Dashboard', 'home'], ['tasks', "Today's Tasks", 'check'], ['cleaning', 'Cleaning', 'sparkle'], ['maintenance', 'Maintenance', 'wrench'], ['issues', 'Reported Issues', 'alert'], ['completed', 'Completed Tasks', 'shield'], ['announcements', 'Announcements', 'bell']],
    admin: [['dashboard', 'Dashboard', 'home'], ['accounts', 'User Accounts', 'users'], ['settings', 'System Settings', 'settings'], ['notifylog', 'Notifications', 'wa'], ['audit', 'Audit Logs', 'shield'], ['announcements', 'Announcements', 'bell']]
  };
  const ALIAS = { student: 'profile', teacher: 'teachers', class: 'classes', myclass: 'myclasses', receipt: 'receipts' };
  const BOTTOM = [['dashboard', 'Home', 'home'], ['attendance', 'Attendance', 'check'], ['marks', 'Results', 'award'], ['fees', 'Fees', 'rupee']];
  App.nav = role => NAV[role].filter(e => e[0] !== '#');
  App.can = (page, u) => { const p = Pages[page]; return !!p && (!p.roles || p.roles.includes(u.role)); };
  App.go = h => { location.hash = h; };
  App.tabs = (pg, list, def) => { const cur = App.st(pg).tab || def || list[0][0]; return UI.tabs(list, cur, 'tab').replace(/data-act="tab"/g, `data-act="tab" data-pg="${pg}"`); };
  App.tab = (pg, def) => App.st(pg).tab || def;
  UI.act.tab = t => { App.st(t.dataset.pg).tab = t.dataset.tab; App.refresh(); };
  App.refresh = () => { renderPage(); renderChrome(); };
  App.greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const SC = C.SCHOOL;

  /* ---------- Sign in ---------- */
  function demoAccounts() {
    const db = S.db(); const emp = r => db.employees.find(x => x.role === r);
    const c5 = db.classes.find(c => c.id === 'C5A'); const ct = db.employees.find(x => x.id === c5.classTeacherId);
    const fam = db.parents.find(p => db.students.filter(s => s.parentId === p.id).length > 1) || db.parents[0]; const kids = db.students.filter(s => s.parentId === fam.id);
    const sup = db.employees.find(x => x.supervisor);
    return [[fam.phone, 'Parent', fam.name + ' – ' + kids.map(k => k.first).join(' & ')], [kids[0].adm, 'Student', kids[0].name + ' – ' + S.className(kids[0].classId)], [ct.username, 'Teacher', ct.name + ' (class teacher 5A)'], ['principal', 'Principal', emp('principal').name], ['dean', 'Dean', emp('dean').name], ['accountant', 'Accountant', emp('accountant').name], [sup.username, 'Operations', sup.name], ['admin', 'Administrator', emp('admin').name]];
  }
  function renderLogin() {
    document.getElementById('root').innerHTML = `<div class="login-page"><div class="login-art" style="background-image:linear-gradient(180deg,rgba(10,27,61,.72),rgba(10,27,61,.9)),url(images/bg_00.jpg)"><a href="index.html" class="row" style="gap:14px;text-decoration:none"><span class="logo-chip">${UI.crest(54)}</span><div><div style="font-family:var(--serif);font-size:21px;color:#fff;font-weight:600">${esc(SC.name)}</div><div style="font-size:12px;color:#c9d6ee">${esc(SC.tagline)}</div></div></a>
      <div><h1>Welcome to the school portal</h1><p style="margin-top:12px;font-size:16.5px">Parents and students can see attendance, results, timetable, fee receipts and school notices. Teachers and office staff can do their daily work here.</p></div>
      <div style="font-size:14px;color:#c9d6ee">Need help signing in?<br><b style="color:#fff">${esc(SC.phone)}</b> · <b style="color:#fff">${esc(SC.mobile)}</b><br><a href="index.html" style="color:#ffb3c8">← Back to school website</a></div></div>
      <div class="login-form-wrap"><form class="login-box" id="loginForm"><h2>Sign in</h2><p class="muted" style="margin:6px 0 20px">Please sign in with the details given to you by the school.</p>
      <div class="how"><div><b>Parents</b><span>Your registered mobile number</span></div><div><b>Students</b><span>Your admission number</span></div><div><b>Teachers & staff</b><span>Your username</span></div></div>
      <div class="col" style="gap:14px;margin-top:18px">${UI.field('Mobile number / Admission number / Username', `<input class="input lg" name="u" id="lg-u" required autofocus autocomplete="username" placeholder="e.g. 9876543210">`)}${UI.field('Password', `<div class="pw"><input class="input lg" type="password" name="p" id="lg-p" required autocomplete="current-password" placeholder="Enter your password"><button type="button" class="pwbtn" data-act="showPw">Show</button></div>`)}
      <div id="lg-err" class="alert bad hide"></div><button class="btn primary block lg" type="submit">Sign in</button></div>
      <p class="muted small" style="margin-top:16px">Forgot your password? Please call the school office on <b>${esc(SC.phone)}</b> and we will reset it for you.</p>
      <details class="demo-box"><summary>Demo accounts (for trying out the portal)</summary><p class="small muted" style="margin:8px 0">Password for all: <code>School@123</code></p><div class="col" style="gap:6px">${demoAccounts().map(a => `<div class="row between"><span class="small"><b>${esc(a[1])}</b> · ${esc(a[2])}</span><button type="button" class="btn xs" data-act="loginFill" data-u="${esc(a[0])}">Use</button></div>`).join('')}</div></details></form></div></div>`;
    document.getElementById('loginForm').onsubmit = ev => {
      ev.preventDefault(); const r = S.login(document.getElementById('lg-u').value, document.getElementById('lg-p').value);
      if (r.error) { const b = document.getElementById('lg-err'); b.textContent = r.error; b.classList.remove('hide'); return; }
      App.u = r.user; S.setActor(r.user); location.hash = '#/dashboard'; boot();
    };
  }
  UI.act.showPw = t => { const i = document.getElementById('lg-p'); i.type = i.type === 'password' ? 'text' : 'password'; t.textContent = i.type === 'password' ? 'Show' : 'Hide'; };
  UI.act.loginFill = t => { document.getElementById('lg-u').value = t.dataset.u; document.getElementById('lg-p').value = 'School@123'; document.getElementById('lg-p').type = 'text'; };
  UI.act.logout = () => { S.logout(); S.setActor(null); App.u = null; App._st = {}; location.hash = ''; renderLogin(); };

  /* ---------- Shell ---------- */
  const isFam = u => u.role === 'parent';
  function childPicker(u) {
    if (!isFam(u)) return '';
    const kids = u.studentIds.map(id => S.student(id));
    if (kids.length > 1) return `<label class="child-pick" title="Switch child">${UI.icon('users', 16)}<select data-on="switchChild" aria-label="Choose child">${kids.map(k => `<option value="${k.id}" ${k.id === u.studentId ? 'selected' : ''}>${esc(k.first)} · ${esc(S.clsShort(k.classId))}</option>`).join('')}</select></label>`;
    const k = kids[0]; return `<span class="child-pick static">${UI.icon('user', 16)}${esc(k.first)} · ${esc(S.clsShort(k.classId))}</span>`;
  }
  UI.on.switchChild = t => { S.setChild(App.u, t.value); App.st('attcal'); App._st = {}; App.refresh(); UI.toast('Showing ' + S.student(t.value).name, 'ok'); };
  function renderShell() {
    const u = App.u, fam = isFam(u);
    document.getElementById('root').innerHTML = `<div class="app ${fam ? 'fam' : ''}"><aside class="sidebar" id="sidebar"><a class="brand" href="#/dashboard"><span class="logo-chip">${UI.crest(34)}</span><div><b>Rainbow's</b><span>English Medium High School</span></div></a><nav class="nav" id="nav"></nav>${fam ? `<div class="help-box"><b>Need help?</b><span>Call the school office</span><a href="tel:${SC.phone.replace(/\s/g, '')}">${esc(SC.phone)}</a></div>` : `<div class="side-foot">${esc(C.ROLES[u.role])} · AY ${S.db().ay}</div>`}</aside><div class="scrim" id="scrim" data-act="closeNav"></div>
    <div class="main-wrap"><header class="topbar"><button class="iconbtn menu-btn" data-act="openNav" aria-label="Menu">${UI.icon('menu', 18)}</button>${fam ? `<div class="spacer-l"></div>` : `<div class="gsearch">${UI.icon('search', 16)}<input id="gs" data-on="gsearch" placeholder="Search students, teachers, receipts, exams…" autocomplete="off"><div id="gsr" class="sresults hide"></div></div>`}${childPicker(u)}<div class="spacer"></div><div id="topact" class="row"></div><div style="position:relative"><button class="iconbtn" data-act="toggleBell" aria-label="Notifications">${UI.icon('bell', 18)}<span class="dot" id="beldot"></span></button><div class="menu-pop hide" id="bellpop"></div></div>
    <div style="position:relative"><div class="user-chip" data-act="toggleUser">${UI.avatar(u.name, u.name.length, '')}<div class="who"><b>${esc(u.name)}</b><span>${esc(fam ? u.sub : C.ROLES[u.role])}</span></div>${UI.icon('chevD', 14)}</div><div class="menu-pop hide" id="userpop" style="width:260px"><div class="hd">${esc(u.name)}<div class="muted small" style="font-weight:400">${esc(u.sub || '')}</div></div>${fam ? `<button class="mi" data-act="contactSchool">${UI.icon('phone', 16)} Contact the school</button>` : ''}<a class="mi" href="index.html">${UI.icon('globe', 16)} School website</a><button class="mi" data-act="logout">${UI.icon('logout', 16)} Sign out</button></div></div></header><main class="main" id="main"></main>
    ${fam ? `<nav class="bottomnav" id="bottomnav"></nav>` : ''}</div></div>`;
  }
  UI.act.contactSchool = () => {
    const u = App.u, s = S.student(u.studentId), c = S.cls(s.classId), ct = S.emp(c.classTeacherId);
    UI.modal({ title: 'Contact the school', size: 'sm', body: `<div class="col" style="gap:14px"><div class="note-row"><b>${esc(ct.name)}</b><div class="muted small">Class teacher · ${esc(c.name)}</div><div class="small" style="margin-top:4px">Please call the school office to speak to the class teacher.</div></div><a class="btn primary block" href="tel:${SC.phone.replace(/\s/g, '')}">${UI.icon('phone', 16)} ${esc(SC.phone)}</a><a class="btn block" href="tel:${SC.mobile.replace(/\s/g, '')}">${UI.icon('phone', 16)} ${esc(SC.mobile)}</a><a class="btn block" href="mailto:${SC.email}">${UI.icon('mail', 16)} ${esc(SC.email)}</a><div class="muted small center">Office hours: ${esc(SC.hours)}</div></div>` });
  };
  function renderChrome() {
    const u = App.u, nav = document.getElementById('nav'); if (!nav) return; const cur = ALIAS[App.route.page] || App.route.page;
    const mode = ['tasks', 'cleaning', 'completed', 'maintenance', 'issues'].includes(App.route.page) ? App.route.page : cur;
    nav.innerHTML = (NAV[u.role][0][0] === '#' ? '' : `<div class="nav-label">${isFam(u) ? 'Parent & Student Portal' : ''}</div>`) + NAV[u.role].map(([id, l, ic]) => {
      if (id === '#') return `<div class="nav-label">${l}</div>`;
      let cnt = ''; if (id === 'issues' && u.role === 'ops') { const n = S.db().maint.filter(m => m.status === 'Reported').length; if (n) cnt = `<span class="cnt">${n}</span>`; }
      if (id === 'marks' && u.role === 'dean') { const n = S.pendingMarks().filter(p => p.status === 'submitted').length; if (n) cnt = `<span class="cnt">${n}</span>`; }
      if (id === 'fees' && isFam(u)) { const f = S.feeInfo(u.studentId); if (f.status === 'Overdue') cnt = `<span class="cnt">Due</span>`; }
      const act = id === mode || (id === 'salary' && cur === 'payroll' && u.role === 'teacher');
      return `<a href="#/${id}" class="${act ? 'active' : ''}">${UI.icon(ic, 18)}<span>${l}</span>${cnt}</a>`;
    }).join('');
    const bn = document.getElementById('bottomnav'); if (bn) bn.innerHTML = BOTTOM.map(([id, l, ic]) => `<a href="#/${id}" class="${id === mode ? 'on' : ''}">${UI.icon(ic, 21)}<span>${l}</span></a>`).join('') + `<a href="#" data-act="openNav">${UI.icon('menu', 21)}<span>More</span></a>`;
    const ta = document.getElementById('topact'); const canReport = ['teacher', 'dean', 'principal', 'accountant'].includes(u.role);
    if (ta) ta.innerHTML = canReport ? `<button class="btn sm" data-act="reportIssue" title="Report a maintenance issue">${UI.icon('wrench', 15)}<span class="hide-sm"> Report issue</span></button>` : '';
    const dot = document.getElementById('beldot'); if (dot) { const recent = S.announcementsFor(u).filter(a => a.ts.slice(0, 10) >= C.addDays(C.today(), -3)).length; dot.style.display = recent ? '' : 'none'; }
    document.getElementById('sidebar').classList.remove('open'); document.getElementById('scrim').classList.remove('on');
  }
  UI.act.openNav = () => { document.getElementById('sidebar').classList.add('open'); document.getElementById('scrim').classList.add('on'); };
  UI.act.closeNav = () => { document.getElementById('sidebar').classList.remove('open'); document.getElementById('scrim').classList.remove('on'); };
  UI.act.toggleUser = () => { document.getElementById('bellpop').classList.add('hide'); document.getElementById('userpop').classList.toggle('hide'); };
  UI.act.toggleBell = () => {
    const u = App.u, p = document.getElementById('bellpop'); document.getElementById('userpop').classList.add('hide'); if (!p.classList.contains('hide')) { p.classList.add('hide'); return; }
    let items = S.announcementsFor(u).slice(0, 5).map(a => `<a class="mi" href="#/announcements" style="align-items:flex-start;border-bottom:1px solid var(--line-2)">${UI.icon('bell', 15)}<span><b style="font-size:13px">${esc(a.title)}</b><br><span class="muted small">${C.fmtDate(a.ts)}</span></span></a>`).join('');
    if (isFam(u)) { const n = S.db().notifications.filter(x => x.sid === u.studentId).slice(-3).reverse(); items = n.map(x => `<div class="it">${UI.icon('wa', 14)} <b style="font-size:12px">Message from school</b> <span class="muted tiny">${C.fmtStamp(x.ts)}</span><div class="small" style="margin-top:3px">${esc(x.message)}</div></div>`).join('') + items; }
    p.innerHTML = `<div class="hd">Notifications</div>${items || '<div class="it muted">Nothing new right now.</div>'}<a class="mi" href="#/announcements" style="justify-content:center;color:var(--navy-700);font-weight:600">${isFam(u) ? 'See all notices' : 'View all'}</a>`; p.classList.remove('hide');
  };
  document.addEventListener('click', e => { if (!e.target.closest('#bellpop,[data-act=toggleBell]')) { const p = document.getElementById('bellpop'); p && p.classList.add('hide'); } if (!e.target.closest('#userpop,[data-act=toggleUser],.user-chip')) { const p = document.getElementById('userpop'); p && p.classList.add('hide'); } if (!e.target.closest('.gsearch')) { const r = document.getElementById('gsr'); r && r.classList.add('hide'); } });
  UI.on.gsearch = t => { const r = document.getElementById('gsr'); const res = S.search(App.u, t.value); if (t.value.trim().length < 2) { r.classList.add('hide'); return; } r.innerHTML = res.length ? res.map(x => `<a href="${x.href}" data-act="clearSearch"><span class="t">${esc(x.t)}</span><span><b style="font-size:13px">${esc(x.title)}</b><br><span class="muted small">${esc(x.sub)}</span></span></a>`).join('') : `<div class="empty" style="padding:20px">Nothing found for “${esc(t.value)}”.</div>`; r.classList.remove('hide'); };
  UI.act.clearSearch = (t, e) => { document.getElementById('gs').value = ''; document.getElementById('gsr').classList.add('hide'); location.hash = t.getAttribute('href'); };

  /* ---------- Router ---------- */
  function parseHash() { const h = location.hash.replace(/^#\/?/, ''); const [path, q] = h.split('?'); const [page, ...rest] = path.split('/'); return { page: page || 'dashboard', arg: rest.join('/') || null, q: new URLSearchParams(q || '') }; }
  function renderPage() {
    const u = App.u, r = App.route, el = document.getElementById('main'); if (!el) return;
    const p = Pages[r.page];
    if (!p) { el.innerHTML = UI.head({ title: 'Page not found' }) + UI.card('', UI.empty('We could not find that page', `<a href="#/dashboard">Go to home</a>`)); return; }
    if (p.roles && !p.roles.includes(u.role)) { el.innerHTML = UI.head({ title: 'Not available' }) + UI.card('', `<div class="empty"><div style="color:var(--bad);display:grid;place-items:center;margin-bottom:8px">${UI.icon('lock', 34)}</div><b>This page is not available for your account</b>Please use the menu to open a page you have access to.<div class="mt"><a class="btn" href="#/dashboard">Go to home</a></div></div>`); return; }
    const ctx = { u, arg: r.arg, q: r.q, st: App.st(r.page) };
    try { el.innerHTML = p.render(ctx); p.mount && p.mount(ctx, el); } catch (err) { console.error(err); el.innerHTML = UI.head({ title: 'Something went wrong' }) + UI.card('', `<div class="alert bad">${esc(err.message)}</div>`); }
  }
  function route() { if (!App.u) return; App.route = parseHash(); renderPage(); renderChrome(); window.scrollTo(0, 0); }
  window.addEventListener('hashchange', route);

  UI.act.reportIssue = () => G.Pages.maintenance && G.App.reportIssueModal && G.App.reportIssueModal();

  let booted = false;
  function boot() {
    const u = S.session();
    if (!u) { App.u = null; renderLogin(); return; }
    App.u = u; S.setActor(u); renderShell(); route();
  }
  G.addEventListener('DOMContentLoaded', () => { if (!booted) { booted = true; boot(); } });
  if (document.readyState !== 'loading' && !booted) { booted = true; boot(); }
})(window);
