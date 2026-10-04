/* store.js — data layer & business rules. Every module reads/writes through this file so the whole
   product stays consistent (attendance → calendars → analytics, payments → receipts → dashboards …). */
(function (G) {
  'use strict';
  const C = G.C, Seed = G.Seed;
  const KEY = 'rb_erp_v1', SKEY = 'rb_session_v1';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } }, del: k => { try { localStorage.removeItem(k); } catch (e) { } } };
  let db = null, actor = { name: 'System', role: 'system' };
  let M = {};
  const S = {};

  function index() { M = { s: {}, p: {}, c: {}, e: {}, x: {} }; db.students.forEach(x => M.s[x.id] = x); db.parents.forEach(x => M.p[x.id] = x); db.classes.forEach(x => M.c[x.id] = x); db.employees.forEach(x => M.e[x.id] = x); db.exams.forEach(x => M.x[x.id] = x); }
  function load() { const raw = ls.get(KEY); if (raw) { try { const d = JSON.parse(raw); if (d && d.v === 3) { db = d; index(); return; } } catch (e) { } } db = Seed.build(); save(); index(); }
  function save() { ls.set(KEY, JSON.stringify(db)); }
  S.save = save; S.db = () => db; S.reset = () => { db = Seed.build(); save(); index(); }; S.reindex = index;
  S.setActor = u => { actor = u ? { name: u.name, role: u.role } : { name: 'System', role: 'system' }; };
  const audit = (action, entity, prev, next) => { db.audit.push({ id: 'AU' + (++db.seq.audit), ts: C.nowIso(), user: actor.name, role: actor.role, action, entity, prev: prev == null ? '' : String(prev), next: next == null ? '' : String(next) }); };
  S.audit = audit;

  /* ---------- lookups ---------- */
  S.student = id => M.s[id]; S.parent = id => M.p[id]; S.cls = id => M.c[id]; S.emp = id => M.e[id]; S.exam = id => M.x[id];
  S.students = () => db.students; S.classes = () => db.classes; S.employees = () => db.employees;
  S.teachers = () => db.employees.filter(e => e.role === 'teacher');
  S.studentsOf = cid => db.students.filter(s => s.classId === cid);
  S.className = id => (M.c[id] || {}).name || id;
  S.clsShort = id => { const c = M.c[id]; return c ? c.grade + c.section : id; };
  S.parentOf = sid => M.p[(M.s[sid] || {}).parentId];
  S.classTeacherClass = eid => db.classes.find(c => c.classTeacherId === eid) || null;
  S.teacherClasses = eid => { const out = {}; db.classes.forEach(c => Object.entries(c.subjectTeachers).forEach(([sub, t]) => { if (t === eid) (out[c.id] = out[c.id] || []).push(sub); })); const ct = S.classTeacherClass(eid); if (ct && !out[ct.id]) out[ct.id] = []; return out; };
  S.canTeach = (eid, cid, sub) => (M.c[cid] && M.c[cid].subjectTeachers[sub] === eid);

  /* ---------- calendar helpers ---------- */
  S.holidayOn = d => db.events.find(e => (e.type === 'holiday' || e.type === 'public') && d >= e.date && d <= e.end) || null;
  S.isWorking = d => C.dow(d) !== 6 && !S.holidayOn(d);
  S.schoolDay = (d = C.today()) => { let x = d, n = 0; while (!S.isWorking(x) && n++ < 14) x = C.addDays(x, -1); return x; };
  S.nextSchoolDay = (d = C.today()) => { let x = d, n = 0; while (!S.isWorking(x) && n++ < 14) x = C.addDays(x, 1); return x; };
  S.workingDaysBetween = (a, b) => { let n = 0, x = a; while (x <= b) { if (S.isWorking(x)) n++; x = C.addDays(x, 1); } return n; };

  /* ---------- auth ---------- */
  // One sign-in for everyone: the account decides the role. Parents sign in with their registered mobile number,
  // students with their admission number – both open the same family portal (parents see all their children).
  S.login = (a, b, c) => {
    const username = c === undefined ? a : b, password = c === undefined ? b : c;
    const key = String(username || '').trim().toLowerCase().replace(/\s+/g, '');
    const u = db.users.find(x => x.username.toLowerCase() === key && x.password === password);
    if (!u) return { error: 'The username or password is not correct. Please check and try again.' };
    if (!u.active) return { error: 'This account is switched off. Please contact the school office.' };
    ls.set(SKEY, JSON.stringify({ username: u.username })); return { user: S.userObj(u) };
  };
  S.userObj = u => {
    const o = { username: u.username, role: u.role, ref: u.ref };
    if (u.role === 'student' || u.role === 'parent') {
      o.role = 'parent'; const s0 = M.s[u.ref], p = M.p[s0.parentId];
      o.studentIds = u.role === 'student' ? [s0.id] : db.students.filter(s => s.parentId === p.id).map(s => s.id);
      let cur = ls.get('rb_child'); if (!o.studentIds.includes(cur)) cur = o.studentIds[0]; o.studentId = cur;
      o.name = u.role === 'student' ? s0.name : p.name; o.family = true; o.byStudent = u.role === 'student';
      o.sub = u.role === 'student' ? 'Student · ' + S.className(s0.classId) : 'Parent of ' + o.studentIds.map(i => M.s[i].first).join(' & ');
    } else { const e = M.e[u.ref]; o.name = e.name; o.empId = e.id; o.sub = e.designation; o.supervisor = !!e.supervisor; }
    return o;
  };
  S.setChild = (u, sid) => { if ((u.studentIds || []).includes(sid)) { u.studentId = sid; ls.set('rb_child', sid); } };
  S.session = () => { const raw = ls.get(SKEY); if (!raw) return null; try { const { username } = JSON.parse(raw); const u = db.users.find(x => x.username === username && x.active); return u ? S.userObj(u) : null; } catch (e) { return null; } };
  S.logout = () => ls.del(SKEY);

  /* ---------- notifications (WhatsApp – simulated gateway) ---------- */
  const nOn = type => db.settings.whatsappEnabled && db.settings.notify[type] !== false;
  S.notify = (type, sid, message) => {
    const p = sid ? S.parentOf(sid) : null;
    const n = { id: 'N' + (++db.seq.notif), ts: C.nowIso(), channel: 'WhatsApp', type, sid: sid || null, to: p ? p.name : 'Broadcast', phone: p ? p.whatsapp : '', message, status: nOn(type) ? 'Delivered' : 'Not sent (disabled)', by: actor.name };
    db.notifications.push(n); return n;
  };
  S.broadcast = (type, message, recipients) => { const n = { id: 'N' + (++db.seq.notif), ts: C.nowIso(), channel: 'WhatsApp', type, sid: null, to: recipients + ' parents (broadcast)', phone: '', message, status: nOn(type) ? 'Delivered' : 'Not sent (disabled)', by: actor.name, recipients }; db.notifications.push(n); return n; };

  /* ---------- attendance ---------- */
  const code = v => v == null ? null : typeof v === 'string' ? v : v.s;
  const rem = v => v && typeof v === 'object' ? v.r || '' : '';
  S.attCode = code; S.attRemark = rem;
  S.classAtt = (cid, date) => (db.att[date] || {})[cid] || null;
  S.markAttendance = (cid, date, entries) => {
    const c = M.c[cid]; const prev = S.classAtt(cid, date) || {};
    const out = {}; let P = 0, A = 0, L = 0, V = 0, notified = [];
    Object.entries(entries).forEach(([sid, e]) => { const v = e.r ? { s: e.s, r: e.r } : e.s; out[sid] = v; if (e.s === 'P') P++; else if (e.s === 'A') A++; else if (e.s === 'L') L++; else V++; if (e.s === 'A' && code(prev[sid]) !== 'A') { const s = M.s[sid]; notified.push(S.notify('absent', sid, Seed.TPL.absent(s.name, c.grade + c.section, date))); } });
    const had = !!db.att[date] && !!db.att[date][cid];
    (db.att[date] = db.att[date] || {})[cid] = out; (db.attMeta[date] = db.attMeta[date] || {})[cid] = { by: actor.name, ts: C.nowIso() };
    audit(had ? 'Updated attendance' : 'Marked attendance', c.name + ' · ' + C.fmtDate(date), had ? 'Previously marked' : '', 'Present ' + P + ' · Absent ' + A + ' · Late ' + L + ' · Leave ' + V);
    save(); return { P, A, L, V, notified };
  };
  S.studentAtt = sid => {
    const s = M.s[sid]; const rec = {}; let P = 0, A = 0, L = 0, V = 0;
    Object.keys(db.att).sort().forEach(d => { const m = db.att[d][s.classId]; if (!m || m[sid] == null) return; const v = m[sid]; rec[d] = { s: code(v), r: rem(v) }; const k = code(v); if (k === 'P') P++; else if (k === 'A') A++; else if (k === 'L') L++; else V++; });
    const total = P + A + L + V; return { rec, P, A, L, V, total, pct: total ? +((P + L) * 100 / total).toFixed(1) : 100 };
  };
  S.classAttPct = (cid) => { let p = 0, t = 0; Object.keys(db.att).forEach(d => { const m = db.att[d][cid]; if (!m) return; Object.values(m).forEach(v => { t++; if (code(v) === 'P' || code(v) === 'L') p++; }); }); return t ? +(p * 100 / t).toFixed(1) : 0; };
  S.dayAtt = (date) => { let P = 0, A = 0, L = 0, V = 0, classes = 0; db.classes.forEach(c => { const m = (db.att[date] || {})[c.id]; if (!m) return; classes++; Object.values(m).forEach(v => { const k = code(v); if (k === 'P') P++; else if (k === 'A') A++; else if (k === 'L') L++; else V++; }); }); const t = P + A + L + V; return { P, A, L, V, total: t, classes, pct: t ? +((P + L) * 100 / t).toFixed(1) : 0 }; };
  S.attDates = () => Object.keys(db.att).sort();
  S.teacherAtt = date => { const m = db.tAtt[date] || null; if (!m) return null; let P = 0, A = 0, V = 0; Object.values(m).forEach(v => { if (v === 'P') P++; else if (v === 'A') A++; else V++; }); return { P, A, V, total: P + A + V, pct: C.pct(P, P + A + V) }; };
  S.markTeacherAtt = (date, entries) => { const prev = db.tAtt[date]; db.tAtt[date] = entries; const c = { P: 0, A: 0, V: 0 }; Object.values(entries).forEach(v => c[v]++); audit('Marked teacher attendance', C.fmtDate(date), prev ? 'Updated' : '', 'Present ' + c.P + ' · Absent ' + c.A + ' · Leave ' + c.V); save(); };
  S.teacherAttPct = eid => { let p = 0, t = 0; Object.values(db.tAtt).forEach(m => { if (m[eid]) { t++; if (m[eid] !== 'A') p++; } }); return t ? +(p * 100 / t).toFixed(1) : 100; };

  /* ---------- fees ---------- */
  S.feeTerms = s => { const t = s.totalFee, a = Math.round(t * .4 / 100) * 100, b = Math.round(t * .3 / 100) * 100; const d = s.dueDates || db.settings.termDates; return [{ label: 'Term 1', due: d[0], amount: a }, { label: 'Term 2', due: d[1], amount: b }, { label: 'Term 3', due: d[2], amount: t - a - b }]; };
  S.payments = sid => db.payments.filter(p => p.sid === sid).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  S.feeInfo = sid => {
    const s = M.s[sid], T = C.today(); const pays = S.payments(sid); const paid = C.sum(pays, p => p.amount); const total = s.totalFee, balance = Math.max(0, total - paid);
    let left = paid, cum = 0, next = null, overdueAmt = 0, overdueDays = 0;
    const terms = S.feeTerms(s).map(t => { const take = Math.min(left, t.amount); left -= take; cum += t.amount; const pending = t.amount - take; const st = pending <= 0 ? 'Paid' : t.due < T ? 'Overdue' : take > 0 ? 'Partially Paid' : 'Pending'; if (pending > 0 && !next) next = { label: t.label, due: t.due, amount: pending }; if (pending > 0 && t.due < T) { overdueAmt += pending; overdueDays = Math.max(overdueDays, Math.round((C.pd(T) - C.pd(t.due)) / 864e5)); } return Object.assign({}, t, { paid: take, pending, status: st }); });
    const status = balance <= 0 ? 'Paid' : overdueAmt > 0 ? 'Overdue' : paid > 0 ? 'Partially Paid' : 'Pending';
    return { total, paid, balance, status, terms, next, overdueAmt, overdueDays, payments: pays, lastPay: pays[0] || null };
  };
  S.classFee = cid => { const sts = S.studentsOf(cid); const r = { total: sts.length, Paid: 0, 'Partially Paid': 0, Pending: 0, Overdue: 0, expected: 0, received: 0, pending: 0 }; sts.forEach(s => { const f = S.feeInfo(s.id); r[f.status]++; r.expected += f.total; r.received += f.paid; r.pending += f.balance; }); return r; };
  S.feeTotals = () => { const T = C.today(), mk = T.slice(0, 7); let exp = 0, rec = 0; db.students.forEach(s => { exp += s.totalFee; }); rec = C.sum(db.payments, p => p.amount); const st = { Paid: 0, 'Partially Paid': 0, Pending: 0, Overdue: 0 }; db.students.forEach(s => st[S.feeInfo(s.id).status]++); return { expected: exp, collected: rec, pending: exp - rec, today: C.sum(db.payments.filter(p => p.date === T), p => p.amount), month: C.sum(db.payments.filter(p => p.date.startsWith(mk)), p => p.amount), year: rec, status: st }; };
  S.monthlyCollection = () => { const o = {}; db.payments.forEach(p => { const k = p.date.slice(0, 7); o[k] = (o[k] || 0) + p.amount; }); return o; };
  S.recordPayment = ({ sid, amount, method, term, ref, mode, date }) => {
    const s = M.s[sid]; const f = S.feeInfo(sid); amount = Math.round(+amount);
    if (!(amount > 0)) return { error: 'Enter a valid amount.' }; if (amount > f.balance) return { error: 'Amount exceeds the outstanding balance of ' + C.inr(f.balance) + '.' };
    const p = { id: 'PAY' + String(++db.seq.pay).padStart(4, '0'), rcpt: 'RCP-' + String(+db.ayStart.slice(2, 4)) + String(+db.ayStart.slice(2, 4) + 1) + '-' + String(++db.seq.rcpt + 100).padStart(6, '0'), sid, date: date || C.today(), amount, method, term: term || (f.next ? f.next.label : 'Fee payment'), mode: mode || 'Counter', by: mode === 'Online' ? 'Parent Portal' : actor.name, ref: ref || '', ts: C.nowIso() };
    db.payments.push(p); const after = S.feeInfo(sid);
    audit('Recorded fee payment', p.rcpt + ' · ' + s.name + ' (' + S.className(s.classId) + ')', 'Balance ' + C.inr(f.balance), 'Paid ' + C.inr(amount) + ' via ' + method + ' → Balance ' + C.inr(after.balance));
    const n = S.notify('feePaid', sid, Seed.TPL.feePaid(s.name, S.clsShort(s.classId), amount, p.rcpt, after.balance));
    save(); return { payment: p, info: after, notice: n };
  };
  S.sendFeeReminder = sid => { const s = M.s[sid], f = S.feeInfo(sid); if (f.balance <= 0) return null; const amt = f.overdueAmt || (f.next && f.next.amount) || f.balance; const due = f.next ? f.next.due : C.today(); const n = S.notify('feeDue', sid, Seed.TPL.feeDue(s.name, S.clsShort(s.classId), amt, due)); audit('Sent fee reminder', s.name, '', C.inr(amt)); save(); return n; };
  S.addExpense = e => { const x = Object.assign({ id: 'EXP' + String(++db.seq.exp).padStart(4, '0'), by: actor.name }, e); db.expenses.push(x); audit('Recorded expense', x.category + ' · ' + x.desc, '', C.inr(x.amount)); save(); return x; };

  /* ---------- payroll ---------- */
  S.ensurePayroll = mk => { let n = 0; db.employees.forEach(e => { if (!db.payroll.find(r => r.empId === e.id && r.month === mk)) { const r = Seed.computePayroll(db, e, mk); r.status = 'Pending'; r.paidOn = null; db.payroll.push(r); n++; } }); if (n) { audit('Generated payroll', C.monthLong(mk), '', n + ' salary records'); save(); } return n; };
  S.payrollMonths = () => Array.from(new Set(db.payroll.map(r => r.month))).sort();
  S.payrollFor = (mk) => db.payroll.filter(r => r.month === mk);
  S.setSalaryStatus = (id, status) => { const r = db.payroll.find(x => x.id === id); const e = M.e[r.empId]; const prev = r.status; r.status = status; if (status === 'Paid') { r.paidOn = C.today(); r.mode = 'Bank Transfer'; r.paidBy = actor.name; } else r.paidOn = null; audit('Changed salary status', e.name + ' · ' + C.monthLong(r.month), prev, status); save(); };
  S.updateSalary = (id, patch) => { const r = db.payroll.find(x => x.id === id); const e = M.e[r.empId]; const prev = 'Allowances ' + C.inr(r.allowances) + ', Deductions ' + C.inr(r.deductions); Object.assign(r, patch); r.allowances = r.hra + r.da + r.transport; r.deductions = r.pf + r.pt + r.tds; r.net = r.basic + r.allowances - r.deductions - r.attDed; audit('Modified salary record', e.name + ' · ' + C.monthLong(r.month), prev, 'Allowances ' + C.inr(r.allowances) + ', Deductions ' + C.inr(r.deductions) + ' → Net ' + C.inr(r.net)); save(); };
  S.salaryExpense = mk => C.sum(S.payrollFor(mk), r => r.net);

  /* ---------- exams & marks ---------- */
  S.examStatus = x => { const T = C.today(), a = x.schedule[0].date, b = x.schedule[x.schedule.length - 1].date; return T < a ? 'Upcoming' : T <= b ? 'Ongoing' : 'Completed'; };
  S.createExam = o => { const x = Object.assign({ id: 'EX' + (++db.seq.exam), ay: db.ay, createdBy: actor.name, createdOn: C.today() }, o); db.exams.push(x); index(); audit('Created examination', x.name, '', 'Grades ' + x.grades.join(',') + ' · Max ' + x.max + ' · Pass ' + x.passMarks); save(); return x; };
  S.updateExam = (id, patch) => { const x = M.x[id]; Object.assign(x, patch); audit('Modified examination', x.name, '', 'Schedule / details updated'); save(); };
  S.deleteExam = id => { const x = M.x[id]; db.exams = db.exams.filter(e => e.id !== id); delete db.marks[id]; index(); audit('Deleted examination', x.name); save(); };
  S.marksRec = (ex, cid, sub) => ((db.marks[ex] || {})[cid] || {})[sub] || null;
  S.saveMarks = (exId, cid, sub, entries, status, note, maxOverride) => {
    const x = M.x[exId], c = M.c[cid]; const had = S.marksRec(exId, cid, sub);
    ((db.marks[exId] = db.marks[exId] || {})[cid] = db.marks[exId][cid] || {})[sub] = { max: maxOverride || x.max, status, entries, enteredBy: actor.name, ts: C.nowIso(), approvedBy: null, note: note || '' };
    const filled = Object.values(entries).filter(e => e.obt != null).length;
    audit(status === 'draft' ? 'Saved marks draft' : 'Submitted marks for review', c.name + ' · ' + sub + ' · ' + x.name, had ? 'Status: ' + had.status : 'New entry', filled + ' of ' + Object.keys(entries).length + ' students entered');
    save();
  };
  S.approveMarks = (exId, cid, sub) => {
    const r = S.marksRec(exId, cid, sub), x = M.x[exId], c = M.c[cid]; r.status = 'published'; r.approvedBy = actor.name; r.pubTs = C.nowIso(); let sent = 0;
    Object.entries(r.entries).forEach(([sid, e]) => { if (e.obt == null) return; const s = M.s[sid]; S.notify('marks', sid, Seed.TPL.marks(sub, x.name, s.name, e.obt, r.max)); sent++; });
    audit('Approved & published marks', c.name + ' · ' + sub + ' · ' + x.name, 'Submitted', 'Published · ' + sent + ' parents notified'); save(); return sent;
  };
  S.returnMarks = (exId, cid, sub, note) => { const r = S.marksRec(exId, cid, sub); r.status = 'draft'; r.note = note || 'Returned for correction'; audit('Returned marks to teacher', S.className(cid) + ' · ' + sub + ' · ' + M.x[exId].name, 'Submitted', 'Draft – ' + r.note); save(); };
  S.examResult = (sid, exId) => {
    const s = M.s[sid], x = M.x[exId]; const rows = []; let tot = 0, max = 0, fail = false;
    x.schedule.forEach(sc => { const r = S.marksRec(exId, s.classId, sc.subject); if (!r || r.status !== 'published') { rows.push({ subject: sc.subject, pending: true, max: x.max }); return; } const e = r.entries[sid]; if (!e || e.obt == null) { rows.push({ subject: sc.subject, pending: true, max: r.max }); return; } const g = C.gradeOf(e.obt * 100 / r.max); const pass = e.obt >= x.passMarks; if (!pass) fail = true; tot += e.obt; max += r.max; rows.push({ subject: sc.subject, max: r.max, obt: e.obt, grade: g, pass, remarks: e.remarks || '' }); });
    const done = rows.filter(r => !r.pending).length; const pct = max ? +(tot * 100 / max).toFixed(1) : 0;
    return { rows, total: tot, max, pct, grade: max ? C.gradeOf(pct) : '—', result: done === rows.length ? (fail ? 'Fail' : 'Pass') : done ? 'Partial' : 'Awaited', complete: done === rows.length, done };
  };
  S.classExam = (cid, exId) => { const sts = S.studentsOf(cid); const res = sts.map(s => Object.assign({ s }, S.examResult(s.id, exId))).filter(r => r.done); const full = res.filter(r => r.complete); return { res, avg: C.avg(res, r => r.pct), pass: full.filter(r => r.result === 'Pass').length, n: full.length }; };
  S.rankIn = (cid, exId, sid) => { const arr = S.studentsOf(cid).map(s => ({ id: s.id, r: S.examResult(s.id, exId) })).filter(x => x.r.complete).sort((a, b) => b.r.pct - a.r.pct); const i = arr.findIndex(x => x.id === sid); return i < 0 ? null : { rank: i + 1, of: arr.length }; };
  S.subjectAvg = (exId, cid, sub) => { const r = S.marksRec(exId, cid, sub); if (!r || r.status !== 'published') return null; const v = Object.values(r.entries).filter(e => e.obt != null); return C.avg(v, e => e.obt * 100 / r.max); };
  S.pendingMarks = () => { const out = []; db.exams.forEach(x => { if (S.examStatus(x) === 'Upcoming') return; db.classes.forEach(c => { if (!x.grades.includes(c.grade)) return; x.schedule.forEach(sc => { const r = S.marksRec(x.id, c.id, sc.subject); if (!r || r.status === 'draft') out.push({ exam: x, cls: c, subject: sc.subject, status: r ? 'draft' : 'not started', teacherId: c.subjectTeachers[sc.subject] }); else if (r.status === 'submitted') out.push({ exam: x, cls: c, subject: sc.subject, status: 'submitted', teacherId: c.subjectTeachers[sc.subject] }); }); }); }); return out; };

  /* ---------- hall tickets ---------- */
  S.hallTicket = (exId, sid) => db.hallTickets.find(h => h.examId === exId && h.sid === sid) || null;
  S.hallEligibility = (sid, exId) => { if (!db.settings.hallTicketRequiresFees) return { ok: true }; const f = S.feeInfo(sid); if (f.status === 'Overdue') return { ok: false, reason: 'Overdue fees of ' + C.inr(f.overdueAmt) + ' must be cleared (school policy).' }; return { ok: true }; };
  S.generateHallTickets = (exId, sids) => { let n = 0, blocked = []; sids.forEach(sid => { if (S.hallTicket(exId, sid)) return; const el = S.hallEligibility(sid, exId); if (!el.ok) { blocked.push({ sid, reason: el.reason }); return; } db.hallTickets.push({ examId: exId, sid, ts: C.nowIso(), by: actor.name, no: 'HT-' + exId.slice(2) + '-' + sid.slice(1) }); n++; }); if (n) audit('Generated hall tickets', M.x[exId].name + (sids.length === 1 ? ' · ' + M.s[sids[0]].name : ' · ' + S.className(M.s[sids[0]].classId)), '', n + ' ticket(s)'); save(); return { n, blocked }; };

  /* ---------- timetable ---------- */
  S.tt = cid => db.ttDraft[cid] || db.timetable[cid] || {};
  S.hasDraft = cid => !!db.ttDraft[cid];
  S.ttCell = (cid, d, p) => ((S.tt(cid)[d] || {})[p]) || null;
  S.ttConflict = (cid, d, p, teacherId) => { if (!teacherId) return null; for (const c of db.classes) { if (c.id === cid) continue; const cell = S.ttCell(c.id, d, p); if (cell && cell.teacherId === teacherId) return c; } return null; };
  S.ttSet = (cid, d, p, cell) => { if (!db.ttDraft[cid]) db.ttDraft[cid] = JSON.parse(JSON.stringify(db.timetable[cid] || {})); const t = db.ttDraft[cid]; (t[d] = t[d] || {}); if (cell) t[d][p] = cell; else delete t[d][p]; save(); };
  S.ttCopyDay = (cid, from, to) => { if (!db.ttDraft[cid]) db.ttDraft[cid] = JSON.parse(JSON.stringify(db.timetable[cid] || {})); const t = db.ttDraft[cid]; const conflicts = []; t[to] = {}; Object.entries(t[from] || {}).forEach(([p, cell]) => { const k = S.ttConflict(cid, to, +p, cell.teacherId); if (k) { conflicts.push({ p, cls: k }); return; } t[to][p] = Object.assign({}, cell); }); save(); return conflicts; };
  S.ttDiscard = cid => { delete db.ttDraft[cid]; save(); };
  S.ttPublish = cid => {
    const d = db.ttDraft[cid]; if (!d) return { n: 0 }; const old = db.timetable[cid] || {}; let changes = 0; const lines = [];
    for (let day = 0; day < 6; day++) for (const p of C.PERIOD_NUMS) { const a = (old[day] || {})[p], b = (d[day] || {})[p]; if ((a && a.teacherId) !== (b && b.teacherId) || (a && a.subject) !== (b && b.subject)) { changes++; if (lines.length < 3) lines.push(C.DAYS_SHORT[day] + ' P' + p + ': ' + (a ? a.subject : 'Free') + ' → ' + (b ? b.subject : 'Free')); } }
    db.timetable[cid] = d; delete db.ttDraft[cid];
    Object.values(d).forEach(day => Object.values(day).forEach(cell => { if (cell.teacherId) M.c[cid].subjectTeachers[cell.subject] = cell.teacherId; }));
    audit('Modified timetable', S.className(cid), 'Previous published version', changes + ' period change(s)' + (lines.length ? ': ' + lines.join('; ') : '')); save(); return { n: changes };
  };
  S.teacherTT = eid => { const g = {}; for (let d = 0; d < 6; d++) { g[d] = {}; db.classes.forEach(c => { for (const p of C.PERIOD_NUMS) { const cell = (db.timetable[c.id][d] || {})[p]; if (cell && cell.teacherId === eid) g[d][p] = { classId: c.id, subject: cell.subject, room: cell.room }; } }); } return g; };
  S.teacherLoad = eid => { const g = S.teacherTT(eid); let n = 0; Object.values(g).forEach(d => n += Object.keys(d).length); return n; };
  S.ttDayFor = () => { const d = S.nextSchoolDay(C.today()); return { date: d, day: C.dow(d), isToday: d === C.today() }; };

  /* ---------- classes ---------- */
  S.createClass = (grade, section, room) => { const id = 'C' + grade + section; if (M.c[id]) return { error: 'Class already exists.' }; const c = { id, grade: +grade, section, name: 'Grade ' + grade + section, room: room || 'Room ' + grade + '0' + (section.charCodeAt(0) - 64), classTeacherId: null, subjectTeachers: {} }; db.classes.push(c); db.timetable[id] = {}; db.classes.sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section)); index(); audit('Created class', c.name, '', c.room); save(); return { cls: c }; };
  S.assignClassTeacher = (cid, eid) => { const c = M.c[cid]; const prevT = M.e[c.classTeacherId]; const other = db.classes.find(x => x.classTeacherId === eid && x.id !== cid); if (other) other.classTeacherId = null; c.classTeacherId = eid; audit('Assigned class teacher', c.name, prevT ? prevT.name : 'Unassigned', M.e[eid].name + (other ? ' (released from ' + other.name + ')' : '')); save(); return other; };
  S.assignSubjectTeacher = (cid, sub, eid) => { const c = M.c[cid]; const prev = M.e[c.subjectTeachers[sub]]; c.subjectTeachers[sub] = eid; audit('Assigned subject teacher', c.name + ' · ' + sub, prev ? prev.name : '—', M.e[eid].name); save(); };

  /* ---------- students ---------- */
  S.updateStudent = (sid, patch, label) => { const s = M.s[sid]; const prev = [], next = []; Object.keys(patch).forEach(k => { if (JSON.stringify(s[k]) !== JSON.stringify(patch[k])) { prev.push(k + ': ' + (typeof s[k] === 'object' ? JSON.stringify(s[k]) : s[k])); next.push(k + ': ' + (typeof patch[k] === 'object' ? JSON.stringify(patch[k]) : patch[k])); } }); Object.assign(s, patch); if (next.length) audit('Updated student details', s.name + ' (' + s.adm + ')', prev.join(' | '), next.join(' | ')); save(); };
  S.updateParent = (pid, patch) => { const p = M.p[pid]; const prev = [], next = []; Object.keys(patch).forEach(k => { if (p[k] !== patch[k]) { prev.push(k + ': ' + p[k]); next.push(k + ': ' + patch[k]); } }); Object.assign(p, patch); if (next.length) audit('Updated parent contact', p.name, prev.join(' | '), next.join(' | ')); save(); };
  S.admitStudent = d => {
    const c = M.c[d.classId]; const n = db.students.length + 1; const sid = 'S' + String(n).padStart(3, '0'), pid = 'P' + String(db.parents.length + 1).padStart(3, '0');
    const base = c.grade <= 2 ? 18000 : c.grade <= 5 ? 22000 : c.grade <= 8 ? 27000 : 32000; const T = C.today();
    let p = db.parents.find(x => x.phone === d.phone); const isNewParent = !p;
    if (!p) { p = { id: pid, name: d.parent, mother: d.mother || '', relation: 'Father', phone: d.phone, whatsapp: d.whatsapp || d.phone, email: d.email || '', occupation: d.occupation || '' }; db.parents.push(p); }
    const roll = S.studentsOf(c.id).length + 1;
    const s = { id: sid, name: d.name, first: d.name.split(' ')[0], surname: d.name.split(' ').slice(1).join(' '), gender: d.gender, dob: d.dob, classId: c.id, grade: c.grade, section: c.section, ay: db.ay, admDate: T, parentId: p.id, address: d.address, emergency: { name: d.parent, relation: 'Father', phone: d.phone }, blood: d.blood || '', medical: d.medical || '', transport: !!d.transport, baseFee: base, totalFee: base + (d.transport ? 9000 : 0), colorIdx: n % 8, docs: ['Birth Certificate', 'Aadhaar Card', 'Address Proof', 'Previous Marksheet', 'Transfer Certificate'].map(x => ({ name: x, status: 'Pending' })), history: [], roll, isNew: true, dueDates: [C.addDays(T, 10), C.addDays(T, 75), C.addDays(T, 165)], adm: 'RB' + T.slice(0, 4) + '-' + String(900 + db.students.filter(x => x.isNew).length).padStart(4, '0') };
    db.students.push(s); db.users.push({ username: s.adm, password: 'School@123', role: 'student', ref: sid, active: true }); if (isNewParent) db.users.push({ username: p.phone, password: 'School@123', role: 'parent', ref: sid, parentId: p.id, active: true });
    index(); audit('Admitted student', s.name + ' (' + s.adm + ')', '', c.name); save(); return s;
  };

  /* ---------- access control ---------- */
  S.studentAccess = (u, sid) => {
    const s = M.s[sid]; const none = { any: false };
    if (!s || !u) return none;
    switch (u.role) {
      case 'principal': return { any: true, contact: true, medical: true, attendance: true, marks: true, fees: 'full', docs: true, history: true, edit: true };
      case 'dean': return { any: true, contact: true, medical: false, attendance: true, marks: true, fees: 'none', docs: false, history: true, edit: false };
      case 'accountant': return { any: true, contact: true, medical: false, attendance: false, marks: false, fees: 'full', docs: false, history: false, edit: false };
      case 'teacher': { const ct = S.classTeacherClass(u.empId); if (ct && ct.id === s.classId) return { any: true, contact: true, medical: true, attendance: true, marks: true, fees: 'status', docs: false, history: true, edit: true }; if (S.teacherClasses(u.empId)[s.classId]) return { any: true, contact: false, medical: false, attendance: true, marks: 'subject', fees: 'none', docs: false, history: false, edit: false }; return none; }
      case 'student': case 'parent': return (u.studentIds || [u.studentId]).includes(sid) ? { any: true, contact: true, medical: true, attendance: true, marks: true, fees: 'full', docs: true, history: true, edit: false, self: true } : none;
      default: return none;
    }
  };
  S.scopedStudents = u => db.students.filter(s => S.studentAccess(u, s.id).any);

  /* ---------- announcements & calendar ---------- */
  const STAFF = ['teacher', 'dean', 'principal', 'accountant', 'ops', 'admin'];
  S.audienceLabel = a => a.kind === 'school' ? 'Entire school' : a.kind === 'teachers' ? 'Teachers & staff' : a.kind === 'students' ? 'Students' : a.kind === 'parents' ? 'Parents' : a.kind === 'ops' ? 'Operations staff' : a.kind === 'grade' ? 'Grade ' + a.grade + ' (all sections)' : a.kind === 'class' ? S.className(a.classId) : a.kind;
  S.annVisible = (a, u) => {
    const k = a.audience.kind; if (u.role === 'principal' || u.role === 'dean' || u.role === 'admin') return true; if (a.by === u.name) return true; if (k === 'school') return true;
    if (u.role === 'ops') return k === 'ops'; if (u.role === 'accountant') return k === 'teachers' || k === 'parents';
    if (u.role === 'teacher') { if (k === 'teachers') return true; const cl = S.teacherClasses(u.empId); if (k === 'class') return !!cl[a.audience.classId]; if (k === 'grade') return Object.keys(cl).some(c => M.c[c].grade === a.audience.grade); return false; }
    const s = M.s[u.studentId]; if (k === 'students') return true; if (k === 'parents') return u.role === 'parent'; if (k === 'class') return s.classId === a.audience.classId; if (k === 'grade') return s.grade === a.audience.grade; return false;
  };
  S.announcementsFor = u => db.announcements.filter(a => S.annVisible(a, u)).sort((a, b) => (b.pinned - a.pinned) || b.ts.localeCompare(a.ts));
  S.audienceParents = a => { const k = a.kind; return db.students.filter(s => k === 'school' || k === 'parents' || k === 'students' || (k === 'grade' && s.grade === a.grade) || (k === 'class' && s.classId === a.classId)); };
  S.addAnnouncement = o => {
    const a = Object.assign({ id: 'AN' + (++db.seq.ann), ts: C.nowIso(), by: actor.name, role: actor.role, public: false, pinned: false }, o); db.announcements.push(a);
    const map = { holiday: 'holiday', emergency: 'emergency', ptm: 'ptm', fee: 'feeDue', exam: 'examReminder', notice: 'notice', event: 'notice' }; let sent = null;
    if (['school', 'parents', 'students', 'grade', 'class'].includes(a.audience.kind) && map[a.type]) { const n = S.audienceParents(a.audience).length; sent = S.broadcast(map[a.type], Seed.TPL.broadcast(a.title, a.body.length > 120 ? a.body.slice(0, 117) + '…' : a.body), n); }
    audit('Published announcement', a.title, '', S.audienceLabel(a.audience)); save(); return { ann: a, sent };
  };
  S.deleteAnnouncement = id => { const a = db.announcements.find(x => x.id === id); db.announcements = db.announcements.filter(x => x.id !== id); audit('Deleted announcement', a.title); save(); };
  S.addEvent = e => { const x = Object.assign({ id: 'EV' + (++db.seq.event), end: e.date, desc: '', audience: 'all' }, e); db.events.push(x); audit('Added calendar event', x.title, '', C.fmtDate(x.date)); save(); return x; };
  S.calendarFor = u => {
    const out = []; const staffRole = STAFF.includes(u.role);
    db.events.forEach(e => { if (e.audience === 'parents' && !(u.role === 'parent' || u.role === 'principal' || u.role === 'dean' || u.role === 'teacher' || u.role === 'admin')) return; if (e.audience === 'staff' && !staffRole) return; out.push(e); });
    if (['principal', 'dean', 'teacher', 'student', 'parent'].includes(u.role)) db.exams.forEach(x => out.push({ id: 'X' + x.id, title: x.name, date: x.schedule[0].date, end: x.schedule[x.schedule.length - 1].date, type: 'exam', audience: 'all', desc: 'Examination period · Grades ' + x.grades[0] + '–' + x.grades[x.grades.length - 1] }));
    return out;
  };

  /* ---------- operations ---------- */
  S.setTaskStatus = (id, status, remarks) => { const t = db.tasks.find(x => x.id === id); const prev = t.status; t.status = status; if (remarks != null) t.remarks = remarks; t.completedAt = status === 'Completed' ? C.nowIso() : null; if (status !== 'Completed') { t.verified = false; t.verifiedBy = null; } audit('Updated cleaning task', t.task + ' · ' + t.location, prev, status); save(); };
  S.verifyTask = id => { const t = db.tasks.find(x => x.id === id); t.verified = true; t.verifiedBy = actor.name; audit('Verified cleaning task', t.task + ' · ' + t.location, '', 'Verified'); save(); };
  S.addTask = o => { const t = Object.assign({ id: 'TK' + String(++db.seq.task).padStart(4, '0'), status: 'Pending', remarks: '', verified: false }, o); db.tasks.push(t); audit('Created task', t.task + ' · ' + t.location, '', C.fmtDate(t.date)); save(); return t; };
  S.genDailyTasks = date => { const tpl = db.tasks.filter(t => t.date === S.schoolDay(C.addDays(date, -1)) || t.date === C.addDays(date, -1)); const base = tpl.length ? tpl : db.tasks.slice(-13); let n = 0; const seen = new Set(db.tasks.filter(t => t.date === date).map(t => t.task + t.location)); base.forEach(t => { if (seen.has(t.task + t.location)) return; db.tasks.push({ id: 'TK' + String(++db.seq.task).padStart(4, '0'), task: t.task, category: t.category, location: t.location, assignedTo: t.assignedTo, date, time: t.time, priority: t.priority, status: 'Pending', remarks: '', verified: false }); n++; seen.add(t.task + t.location); }); if (n) { audit('Generated daily tasks', C.fmtDate(date), '', n + ' tasks'); save(); } return n; };
  S.reportIssue = o => { const m = Object.assign({ id: 'MR' + String(++db.seq.maint).padStart(4, '0'), ts: C.nowIso(), date: C.today(), status: 'Reported', assignedTo: null, reportedBy: actor.name, reportedRole: actor.role, photo: null }, o); m.updates = [{ ts: m.ts, by: actor.name, note: 'Issue reported.' }]; db.maint.push(m); audit('Reported maintenance issue', m.location + ' · ' + m.issue, '', m.priority + ' priority'); save(); return m; };
  S.updateMaint = (id, patch, note) => { const m = db.maint.find(x => x.id === id); const prev = m.status + (m.assignedTo ? ' · ' + M.e[m.assignedTo].name : ''); Object.assign(m, patch); m.updates.push({ ts: C.nowIso(), by: actor.name, note: note || ('Status: ' + m.status + (m.assignedTo ? ' · assigned to ' + M.e[m.assignedTo].name : '')) }); audit('Updated maintenance request', m.location + ' · ' + m.issue, prev, m.status + (m.assignedTo ? ' · ' + M.e[m.assignedTo].name : '')); save(); };

  /* ---------- leave ---------- */
  S.applyLeave = o => { const l = Object.assign({ id: 'LV' + String(++db.seq.leave).padStart(3, '0'), status: 'Pending', appliedOn: C.today(), decidedBy: null }, o); db.leaves.push(l); audit('Applied for leave', actor.name, '', l.type + ' · ' + l.days + ' day(s) from ' + C.fmtDate(l.from)); save(); return l; };
  S.decideLeave = (id, st) => { const l = db.leaves.find(x => x.id === id); l.status = st; l.decidedBy = actor.name; audit(st + ' leave', M.e[l.empId].name, 'Pending', st + ' · ' + l.type + ' ' + l.days + ' day(s)'); save(); };

  /* ---------- admin ---------- */
  S.addUser = o => { if (db.users.find(u => u.username.toLowerCase() === o.username.toLowerCase())) return { error: 'Username already exists.' }; db.users.push(Object.assign({ active: true }, o)); audit('Created user account', o.username, '', 'Role: ' + C.ROLES[o.role]); save(); return {}; };
  S.setUserActive = (un, on) => { const u = db.users.find(x => x.username === un); u.active = on; audit(on ? 'Enabled account' : 'Disabled account', un, on ? 'Disabled' : 'Active', on ? 'Active' : 'Disabled'); save(); };
  S.resetPassword = (un, pw) => { const u = db.users.find(x => x.username === un); u.password = pw; audit('Reset password', un); save(); };
  S.updateSettings = (patch, label) => { const prev = JSON.stringify(db.settings); Object.assign(db.settings, patch); audit('Changed system settings', label || 'Settings', '', Object.keys(patch).join(', ')); save(); };
  S.addEnquiry = o => { db.enquiries.push(Object.assign({ id: 'EQ' + (++db.seq.enq), ts: C.nowIso(), status: 'New' }, o)); save(); };

  /* ---------- global search ---------- */
  S.search = (u, q) => {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    const out = []; const has = (...f) => f.some(x => x && String(x).toLowerCase().includes(q));
    if (u.role !== 'ops' && u.role !== 'admin') S.scopedStudents(u).forEach(s => { const p = M.p[s.parentId]; const acc = S.studentAccess(u, s.id); if (has(s.name, s.adm, S.className(s.classId), acc.contact && p.name, acc.contact && p.phone)) out.push({ t: 'Student', title: s.name, sub: s.adm + ' · ' + S.className(s.classId) + (acc.contact ? ' · Parent: ' + p.name : ''), href: '#/student/' + s.id }); });
    if (['principal', 'dean', 'accountant', 'admin'].includes(u.role)) db.employees.forEach(e => { if (u.role === 'dean' && e.role !== 'teacher') return; if (u.role === 'accountant' && e.role === 'principal') { } if (has(e.name, e.empId, e.designation)) out.push({ t: e.role === 'teacher' ? 'Teacher' : 'Staff', title: e.name, sub: e.empId + ' · ' + e.designation, href: e.role === 'teacher' ? '#/teacher/' + e.id : (u.role === 'principal' ? '#/staff' : '#/payroll') }); });
    if (['principal', 'dean', 'teacher'].includes(u.role)) db.classes.forEach(c => { if (u.role === 'teacher' && !S.teacherClasses(u.empId)[c.id]) return; if (has(c.name, c.grade + c.section)) out.push({ t: 'Class', title: c.name, sub: 'Class teacher: ' + (M.e[c.classTeacherId] || {}).name, href: u.role === 'teacher' ? '#/myclasses/' + c.id : '#/class/' + c.id }); });
    if (['principal', 'accountant'].includes(u.role)) db.payments.slice().reverse().forEach(p => { if (out.length > 40) return; const s = M.s[p.sid]; if (has(p.rcpt, s.name)) out.push({ t: 'Receipt', title: p.rcpt, sub: s.name + ' · ' + C.inr(p.amount) + ' · ' + C.fmtDate(p.date), href: '#/receipt/' + p.id }); });
    if (u.role !== 'ops' && u.role !== 'accountant' && u.role !== 'admin') db.exams.forEach(x => { if (has(x.name)) out.push({ t: 'Exam', title: x.name, sub: C.fmtDate(x.schedule[0].date) + ' – ' + C.fmtDate(x.schedule[x.schedule.length - 1].date), href: '#/exams' }); });
    S.announcementsFor(u).forEach(a => { if (has(a.title, a.body)) out.push({ t: 'Announcement', title: a.title, sub: C.fmtDate(a.ts) + ' · ' + S.audienceLabel(a.audience), href: '#/announcements' }); });
    if (u.role === 'ops') { db.tasks.forEach(t => { if (has(t.task, t.location)) out.push({ t: 'Task', title: t.task, sub: t.location + ' · ' + t.status, href: '#/tasks' }); }); db.maint.forEach(m => { if (has(m.location, m.issue)) out.push({ t: 'Issue', title: m.issue, sub: m.location + ' · ' + m.status, href: '#/issues' }); }); }
    return out.slice(0, 30);
  };

  load();
  G.S = S;
  if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
