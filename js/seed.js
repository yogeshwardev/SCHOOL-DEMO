/* seed.js — sample data for Rainbow's English Medium High School, Chittoor (Grades 1–10, sections A & B) */
(function (G) {
  'use strict';
  const C = G.C;
  const Seed = {};

  Seed.TPL = {
    absent: (n, cls, date) => `Dear Parent, your child ${n} of Class ${cls} was marked absent on ${C.fmtDate(date)}. – ${C.SCHOOL.name}`,
    marks: (subj, exam, n, obt, max) => `Dear Parent, the ${subj} marks for ${exam} have been published for ${n}. Marks: ${obt}/${max}. – ${C.SCHOOL.name}`,
    feePaid: (n, cls, amt, rcpt, bal) => `Dear Parent, we have received ${C.inr(amt)} towards the fees of ${n} (Class ${cls}). Receipt No. ${rcpt}. Balance due: ${C.inr(bal)}. – ${C.SCHOOL.name}`,
    feeDue: (n, cls, amt, due) => `Dear Parent, a fee instalment of ${C.inr(amt)} for ${n} (Class ${cls}) is due on ${C.fmtDate(due)}. Kindly pay via the parent portal or at the school office. – ${C.SCHOOL.name}`,
    exam: (exam, n, cls, date) => `Dear Parent, ${exam} for ${n} (Class ${cls}) begins on ${C.fmtDate(date)}. The hall ticket is available on the parent portal. – ${C.SCHOOL.name}`,
    broadcast: (title, body) => `${title}: ${body} – ${C.SCHOOL.name}`
  };

  // Net salary calculation shared with the payroll module
  Seed.computePayroll = (db, emp, mk) => {
    const basic = emp.basic;
    const hra = Math.round(basic * 0.20 / 10) * 10, da = Math.round(basic * 0.12 / 10) * 10;
    const transport = emp.role === 'ops' ? 1000 : 1600;
    const allowances = hra + da + transport;
    const pf = Math.round(basic * 0.12), pt = 200, tds = (emp.role === 'principal' || emp.role === 'dean') ? Math.round(basic * 0.07) : 0;
    const deductions = pf + pt + tds;
    let absent = 0;
    if (emp.role === 'teacher') Object.keys(db.tAtt).forEach(d => { if (d.startsWith(mk) && db.tAtt[d][emp.id] === 'A') absent++; });
    const attDed = Math.round(absent * basic / 26);
    return { id: 'PR-' + mk + '-' + emp.id, empId: emp.id, month: mk, basic, hra, da, transport, allowances, pf, pt, tds, deductions, absentDays: absent, attDed, net: basic + allowances - deductions - attDed };
  };

  Seed.build = function () {
    const R = C.rng(20260601);
    const pick = a => a[Math.floor(R() * a.length)];
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const now = new Date(); const T = C.ymd(now);
    const Y = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    const AYSTART = Y + '-06-01', AY = Y + '-' + String(Y + 1).slice(2);
    const rcptCode = String(Y).slice(2) + String(Y + 1).slice(2);
    const tstamp = (d, h, m) => d + 'T' + C.pad(h) + ':' + C.pad(m == null ? ri(0, 59) : m) + ':00';

    const db = {
      v: 3, ay: AY, ayStart: AYSTART, seededOn: T,
      settings: {
        schoolName: C.SCHOOL.name, hallTicketRequiresFees: false, onlinePayments: true, whatsappEnabled: true,
        notify: { absent: true, marks: true, examReminder: true, feeDue: true, feePaid: true, holiday: true, emergency: true, ptm: true, notice: true },
        termDates: [Y + '-06-15', Y + '-10-15', (Y + 1) + '-01-15'], examCentre: "Rainbow's English Medium High School – Main Building",
        gradingScale: 'A+ ≥90 · A ≥80 · B+ ≥70 · B ≥60 · C ≥50 · D ≥35 · E <35'
      },
      classes: [], employees: [], students: [], parents: [], users: [], timetable: {}, ttDraft: {},
      att: {}, attMeta: {}, tAtt: {}, exams: [], marks: {}, hallTickets: [], payments: [], payroll: [], expenses: [],
      events: [], announcements: [], notifications: [], audit: [], tasks: [], maint: [], leaves: [], enquiries: [],
      seq: { rcpt: 0, pay: 0, task: 0, maint: 0, ann: 0, notif: 0, audit: 0, leave: 0, exam: 0, exp: 0, enq: 0, event: 0 }
    };

    /* ---------- Holidays & events ---------- */
    const hol = (title, date, end, type) => db.events.push({ id: 'EV' + (++db.seq.event), title, date, end: end || date, type: type || 'holiday', audience: 'all', desc: '' });
    hol('Independence Day', Y + '-08-15', 0, 'public'); hol('Vinayaka Chavithi', Y + '-09-14', 0, 'holiday');
    hol('Gandhi Jayanti', Y + '-10-02', 0, 'public'); hol('Dasara Holidays', Y + '-10-19', Y + '-10-21', 'holiday');
    hol('Andhra Pradesh Formation Day', Y + '-11-01', 0, 'public'); hol('Deepavali', Y + '-11-08', Y + '-11-09', 'holiday');
    hol('Christmas', Y + '-12-25', Y + '-12-26', 'holiday'); hol('Sankranti Holidays', (Y + 1) + '-01-13', (Y + 1) + '-01-16', 'holiday');
    hol('Republic Day', (Y + 1) + '-01-26', 0, 'public'); hol('Maha Shivaratri', (Y + 1) + '-03-06', 0, 'public');
    const ev = (title, date, type, audience, desc, end) => db.events.push({ id: 'EV' + (++db.seq.event), title, date, end: end || date, type, audience, desc: desc || '' });
    ev("Teachers' Day Celebration", Y + '-09-05', 'event', 'all', 'Student-led programme honouring our teachers.');
    ev("Children's Day Celebration", Y + '-11-14', 'event', 'all', 'Cultural programmes and games for all classes.');
    ev('Annual Day Celebrations', (Y + 1) + '-01-10', 'event', 'all', "Cultural programmes, prize distribution and Principal's report.");
    ev('Sankranti Celebrations', (Y + 1) + '-01-12', 'event', 'all', 'Rangoli, bhogi and traditional celebrations at school.');
    ev('Parent–Teacher Meeting – Quarterly Results', C.addDays(T, 7), 'ptm', 'parents', 'Class-wise slots between 9:30 AM and 1:00 PM. Report cards will be shared.');
    ev('Fancy Dress Competition', C.addDays(T, 19), 'event', 'all', 'Open to all classes. Names to be given to the class teacher.');
    ev('Karate Belt Grading', C.addDays(T, 26), 'special', 'all', 'Belt examination for karate students.');
    ev('Science Exhibition', C.addDays(T, 33), 'event', 'all', 'Working models and charts by students of Classes 5–10, open to parents.');
    ev('Career Guidance Talk (Classes 9–10)', C.addDays(T, 12), 'special', 'all', 'Guidance session for Class 9 and 10 students.');
    ev('Staff Meeting', C.addDays(T, 5), 'special', 'staff', 'Academic planning meeting for teaching staff.');

    const isHoliday = d => db.events.some(e => (e.type === 'holiday' || e.type === 'public') && d >= e.date && d <= e.end);
    const isWorking = d => C.dow(d) !== 6 && !isHoliday(d);
    

    /* ---------- Classes ---------- */
    for (let g = 1; g <= 10; g++) ['A', 'B'].forEach((s, k) => db.classes.push({ id: 'C' + g + s, grade: g, section: s, name: 'Grade ' + g + s, room: 'Room ' + g + '0' + (k + 1), classTeacherId: null, subjectTeachers: {} }));

    /* ---------- Employees ---------- */
    let eseq = 0;
    const addEmp = o => { const e = Object.assign({ id: 'E' + C.pad(++eseq).padStart(3, '0'), status: 'Active', leaveBalance: { Casual: 12, Sick: 10, Earned: 15 } }, o); db.employees.push(e); return e; };
    const mkEmail = n => n.toLowerCase().replace(/^(dr\.|mr\.|mrs\.|ms\.)\s*/, '').replace(/[^a-z ]/g, '').trim().split(' ').join('.') + '@rainbowsschool.in';
    const mkPhone = () => pick(['94', '99', '98', '70', '63', '90', '80']) + String(ri(10000000, 99999999));
    const ADD = (role, sal, name, dept, desig, q, join, gender, extra) => addEmp(Object.assign({ role, salutation: name.split(' ')[0], name, empId: 'RB-' + role[0].toUpperCase() + '-' + String(db.employees.length + 1).padStart(3, '0'), dept, designation: desig, qualification: q, joinDate: join, gender, phone: mkPhone(), email: mkEmail(name), basic: sal, subjects: [] }, extra || {}));
    ADD('principal', 45000, 'M. Sujana Sree', 'Administration', 'Principal', '—', '2012-06-01', 'F', { username: 'principal', salutation: '' });
    ADD('dean', 34000, 'Mr. K. Ramesh Babu', 'Academics', 'Dean of Academics', 'M.A., B.Ed.', '2014-06-10', 'M', { username: 'dean' });
    ADD('accountant', 24000, 'Mr. P. Srinivasulu', 'Accounts', 'Accountant', 'M.Com.', '2015-04-01', 'M', { username: 'accountant' });
    ADD('ops', 16000, 'Mr. T. Nagaraju', 'Operations', 'Operations Supervisor', '—', '2016-07-01', 'M', { username: 'supervisor', supervisor: true });
    ADD('admin', 22000, 'Mr. B. Sai Kiran', 'Office & IT', 'System Administrator', 'B.Tech', '2019-08-01', 'M', { username: 'admin' });
    [['Lakshmamma', 'F'], ['Munikrishna', 'M'], ['Gangulamma', 'F'], ['Narasimhulu', 'M'], ['Venkatamma', 'F'], ['Subramanyam', 'M'], ['Ramanamma', 'F'], ['Papanna', 'M']].forEach(([n, g], i) =>
      ADD('ops', 8000 + (i % 3) * 700, n, 'Operations', i < 5 ? 'Housekeeping Staff' : i < 7 ? 'Maintenance Assistant' : 'Groundskeeper', '—', (2016 + i % 5) + '-0' + (1 + i % 9) + '-15', g, { username: 'ops.' + n.toLowerCase(), salutation: '' }));

    const GROUPS = [
      { subs: ['Mathematics'], dept: 'Mathematics', q: 'M.Sc. (Mathematics), B.Ed.', list: [['Mr.', 'Ramana', 'Reddy'], ['Mrs.', 'Lakshmi', 'Devi'], ['Mrs.', 'Padmavathi', 'Naidu'], ['Mr.', 'Chandra', 'Sekhar'], ['Mr.', 'Hari', 'Prasad']] },
      { subs: ['English'], dept: 'English', q: 'M.A. (English), B.Ed.', list: [['Mrs.', 'Sunitha', 'Rao'], ['Mr.', 'Prasanna', 'Kumar'], ['Mrs.', 'Swapna', 'Reddy'], ['Ms.', 'Anitha', 'Chowdary']] },
      { subs: ['Telugu'], dept: 'Languages', q: 'M.A. (Telugu), B.Ed.', list: [['Mrs.', 'Rajeswari', 'Devi'], ['Mr.', 'Subba', 'Rao'], ['Mrs.', 'Saraswathi', 'Naidu'], ['Mr.', 'Narasimha', 'Rao']] },
      { subs: ['Science'], dept: 'Science', q: 'M.Sc., B.Ed.', list: [['Mr.', 'Sudhakar', 'Reddy'], ['Mrs.', 'Kalyani', 'Rao'], ['Mr.', 'Bhaskar', 'Reddy'], ['Mrs.', 'Jyothi', 'Kumari']] },
      { subs: ['Social Studies'], dept: 'Social Studies', q: 'M.A., B.Ed.', list: [['Mr.', 'Murali', 'Krishna'], ['Mrs.', 'Anuradha', 'Devi'], ['Mr.', 'Vijay', 'Kumar'], ['Mrs.', 'Swarna', 'Kumari']] },
      { subs: ['Hindi'], dept: 'Languages', q: 'M.A. (Hindi), B.Ed.', list: [['Mrs.', 'Vijaya', 'Lakshmi'], ['Mr.', 'Mohan', 'Kumar'], ['Mrs.', 'Bharathi', 'Devi']] },
      { subs: ['Computer Science'], dept: 'Computer Science', q: 'MCA, B.Ed.', list: [['Mr.', 'Sai', 'Charan'], ['Ms.', 'Haritha', 'Reddy']] },
      { subs: ['Physical Education'], dept: 'Sports', q: 'M.P.Ed.', list: [['Mr.', 'Raghu', 'Ram'], ['Mr.', 'Kishore', 'Babu']] },
      { subs: ['Art & Craft', 'Moral Science'], dept: 'Arts', q: 'B.F.A., B.Ed.', list: [['Mrs.', 'Rani', 'Devi'], ['Mr.', 'Gopal', 'Naidu']] }
    ];
    const subjGroup = {}; const groupTeachers = [];
    GROUPS.forEach((g, gi) => {
      const arr = [];
      g.list.forEach(([sal, f, l], i) => {
        const name = sal + ' ' + f + ' ' + l; const half = i < g.list.length / 2;
        const e = ADD('teacher', (half ? 14000 : 21000) + ri(0, 8) * 500, name, g.dept, half ? 'Primary Teacher (PRT)' : 'Trained Graduate Teacher (TGT)', g.q, (2009 + ri(0, 14)) + '-0' + ri(6, 9) + '-0' + ri(1, 9), sal === 'Mr.' ? 'M' : 'F', { subjects: g.subs.slice(), username: (f + '.' + l).toLowerCase().replace(/[^a-z.]/g, ''), salutation: sal });
        arr.push(e);
      });
      groupTeachers.push(arr); g.subs.forEach(s => subjGroup[s] = gi);
    });
    const NC = db.classes.length;
    db.classes.forEach((c, i) => { C.SUBJECTS.forEach(s => { const arr = groupTeachers[subjGroup[s.name]]; c.subjectTeachers[s.name] = arr[Math.min(arr.length - 1, Math.floor(i * arr.length / NC))].id; }); });
    { // class teachers: each teaches that class (maths / english / telugu / science / social), one class per teacher
      const own = {}; const cand = i => [0, 1, 2, 3, 4].map(g => groupTeachers[g][Math.min(groupTeachers[g].length - 1, Math.floor(i * groupTeachers[g].length / NC))].id);
      const tryC = (i, seen) => { for (const t of cand(i)) { if (seen.has(t)) continue; seen.add(t); if (own[t] == null || tryC(own[t], seen)) { own[t] = i; return true; } } return false; };
      db.classes.forEach((c, i) => tryC(i, new Set()));
      Object.entries(own).forEach(([t, i]) => db.classes[i].classTeacherId = t);
    }

    /* ---------- Parents & students ---------- */
    const MALE = ['Sai Teja','Charan','Venkat','Karthik','Harsha','Manoj','Praneeth','Vamsi','Naveen','Yashwanth','Bharath','Dheeraj','Pavan','Rohith','Sanjay','Tarun','Uday','Varun','Hemanth','Lokesh','Mahesh','Nithin','Ajay','Arjun','Dinesh','Jaswanth','Kiran','Mohan','Rakesh','Sreekanth','Surya','Teja','Gopi','Chaitanya','Bhanu','Eswar'];
    const FEMALE = ['Sri Lakshmi','Divya','Harini','Keerthi','Lavanya','Meghana','Navya','Pavani','Sravani','Tejaswini','Vaishnavi','Yamini','Anusha','Bhavana','Deepika','Geetha','Haritha','Jyothika','Kavya','Manasa','Nikitha','Pranavi','Rohini','Sahithi','Varshini','Swathi','Sindhu','Ramya','Pooja','Sowmya','Triveni','Charitha','Mounika','Sirisha','Tanuja','Yashaswini'];
    const SURN = ['Reddy','Naidu','Rao','Chowdary','Prasad','Sastry','Raju','Yadav','Goud','Krishna','Kumar','Murthy','Babu','Setty','Pillai','Basha','Sheikh','Varma','Gupta','Rajan','Vemula','Gangadhar','Mudiraj','Nayak','Achari','Joseph','Peddireddy','Bandi','Kolla','Pothula'];
    const PM = ['Venkata Ramana','Srinivasulu','Subba Reddy','Mohan Rao','Ramesh Babu','Nagaraju','Chandra Sekhar','Rajasekhar','Murali','Sudhakar','Bhaskar','Gopal Reddy','Narayana','Prabhakar','Kishore','Suresh','Ravi Kumar','Harinath','Madhusudhan','Eswar','Dastagiri','Jayachandra','Krishnamurthy','Lokanatha','Munireddy','Penchalaiah'];
    const PF = ['Lakshmi','Padmavathi','Sunitha','Jyothi','Rajeswari','Saraswathi','Anuradha','Vijaya','Bharathi','Kalyani','Swarna','Rani','Sulochana','Radha','Parvathi','Manjula','Sujatha','Rukmini','Aruna','Nirmala'];
    const AREAS = [['Kanipakam Road', 517004], ['Gandhi Road', 517001], ['Tirupati Road', 517002], ['Vellore Road', 517001], ['Thotapalyam', 517002], ['Kattamanchi', 517001], ['Chittoor Town', 517001], ['Bangarupalem Road', 517004], ['Pillaripattu', 517004], ['Santhapet', 517001], ['Nagari Road', 517002], ['Mitta Street', 517001]];
    const OCC = ['Farmer', 'Teacher', 'Government employee', 'Businessman', 'Shop owner', 'Contractor', 'Bank employee', 'Doctor', 'Private employee', 'Mango trader', 'Driver', 'Engineer'];
    const BLOOD = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-'];
    const MED = ['', '', '', '', '', '', '', 'Mild asthma – keeps an inhaler in the school bag.', 'Allergic to peanuts.', 'Wears prescription glasses; seat near the board.', 'Dust allergy.', 'Lactose intolerant.'];
    const used = new Set(); let sseq = 0; const newAdm = [];
    db.classes.forEach(c => {
      const rows = [];
      for (let k = 0; k < 7; k++) {
        let gender, first, sur, full;
        do { gender = R() < 0.5 ? 'M' : 'F'; first = pick(gender === 'M' ? MALE : FEMALE); sur = pick(SURN); full = first + ' ' + sur; } while (used.has(full));
        used.add(full);
        const pid = 'P' + String(sseq + 1).padStart(3, '0'), sid = 'S' + String(sseq + 1).padStart(3, '0'); sseq++;
        const fa = pick(PM), mo = pick(PF), area = pick(AREAS); const ph = mkPhone();
        db.parents.push({ id: pid, name: fa + ' ' + sur, mother: mo + ' ' + sur, relation: 'Father', phone: ph, whatsapp: R() < .85 ? ph : mkPhone(), email: (fa + '.' + sur).toLowerCase() + ri(1, 99) + '@gmail.com', occupation: pick(OCC) });
        const admYear = Y - (c.grade - 1) - (R() < .2 ? 0 : 0);
        const dob = C.ymd(new Date(Y - c.grade - 5, ri(0, 11), ri(1, 28)));
        const hasTransport = R() < 0.35;
        const addr = 'D.No. ' + ri(1, 48) + '-' + ri(1, 300) + ', ' + area[0] + ', Chittoor – ' + area[1];
        const emerg = R() < .5 ? { name: mo + ' ' + sur, relation: 'Mother', phone: mkPhone() } : { name: pick(PM) + ' ' + sur, relation: 'Uncle', phone: mkPhone() };
        const base = c.grade <= 2 ? 18000 : c.grade <= 5 ? 22000 : c.grade <= 8 ? 27000 : 32000;
        rows.push({ id: sid, name: full, first, surname: sur, gender, dob, classId: c.id, grade: c.grade, section: c.section, ay: AY, admDate: admYear + '-0' + ri(4, 6) + '-' + ri(10, 28), parentId: pid, address: addr, emergency: emerg, blood: pick(BLOOD), medical: pick(MED), transport: hasTransport, baseFee: base, totalFee: base + (hasTransport ? 9000 : 0), colorIdx: ri(0, 7), docs: ['Birth Certificate', 'Aadhaar Card', 'Address Proof', 'Previous Marksheet', 'Transfer Certificate'].map((n, i) => ({ name: n, status: R() < .93 ? 'Verified' : 'Pending' })), history: [] });
      }
      rows.sort((a, b) => a.name.localeCompare(b.name)).forEach((s, i) => { s.roll = i + 1; db.students.push(s); });
    });
    // admission numbers by admission date
    db.students.forEach((s, i) => { s.adm = 'RB' + s.admDate.slice(0, 4) + '-' + String(100 + i * 3 + ri(0, 2)).padStart(4, '0'); });
    // new admissions this term (Grades 2–7)
    shuffle(db.students.filter(s => s.grade >= 2 && s.grade <= 9)).slice(0, 5).forEach(s => { s.admDate = C.addDays(T, -ri(8, 20)); s.adm = 'RB' + s.admDate.slice(0, 4) + '-' + String(900 + newAdm.length).padStart(4, '0'); s.dueDates = [C.addDays(T, ri(8, 14)), C.addDays(T, 75), C.addDays(T, 165)]; s.isNew = true; newAdm.push(s.id); });
    // academic history
    db.students.forEach(s => { for (let k = 1; k <= Math.min(2, s.grade - 1); k++) { const y0 = Y - k; s.history.push({ ay: y0 + '-' + String(y0 + 1).slice(2), grade: s.grade - k, section: pick(['A', 'B']), pct: ri(58, 94), attendance: ri(88, 99), result: 'Promoted' }); } });

    // some families have two children in the school (same parent account, child switcher in the portal)
    { const pool = shuffle(db.students.filter(s => s.grade >= 3)); const usedS = new Set(); let made = 0;
      for (const A of pool) { if (made >= 9) break; if (usedS.has(A.id)) continue; const B = db.students.find(b => b.grade < A.grade && !usedS.has(b.id) && b.parentId !== A.parentId && b.id !== A.id && !b.isNew); if (!B) continue;
        usedS.add(A.id); usedS.add(B.id); const oldP = B.parentId; B.parentId = A.parentId; B.surname = A.surname; B.name = B.first + ' ' + A.surname; B.address = A.address; B.emergency = A.emergency;
        db.parents = db.parents.filter(p => p.id !== oldP); made++; } }

    /* ---------- Users ---------- */
    const PW = 'School@123';
    db.employees.forEach(e => db.users.push({ username: e.username, password: PW, role: e.role, ref: e.id, active: true }));
    db.students.forEach(s => { db.users.push({ username: s.adm, password: PW, role: 'student', ref: s.id, active: true }); });
    db.parents.forEach(p => { const kid = db.students.find(s => s.parentId === p.id); if (kid) db.users.push({ username: p.phone, password: PW, role: 'parent', ref: kid.id, parentId: p.id, active: true }); });

    /* ---------- Timetable (conflict-free generation) ---------- */
    const ROOMX = { 'Physical Education': 'Playground', 'Computer Science': 'Computer Lab', 'Art & Craft': 'Art Room' };
    let built = null;
    for (let cap = 2; cap <= 3 && !built; cap++) for (let att = 0; att < 400 && !built; att++) {
      const busy = new Set(), tt = {}, rem = {}, cnt = {}; let ok = true;
      db.classes.forEach(c => { tt[c.id] = {}; rem[c.id] = {}; cnt[c.id] = {}; C.SUBJECTS.forEach(s => rem[c.id][s.name] = s.per); for (let d = 0; d < 6; d++) { tt[c.id][d] = {}; cnt[c.id][d] = {}; } });
      for (let d = 0; d < 6 && ok; d++) for (const p of C.PERIOD_NUMS) {
        // per-slot bipartite matching: every class must get a subject whose teacher is free
        const owner = {}, choice = {}; const slotsLeft = 42 - (d * 7 + p - 1); const tRem = {}; db.classes.forEach(c => C.SUBJECTS.forEach(s => { const t = c.subjectTeachers[s.name]; tRem[t] = (tRem[t] || 0) + rem[c.id][s.name]; }));
        const cands = {};
        db.classes.forEach(c => { const prev = tt[c.id][d][p - 1]; cands[c.id] = C.SUBJECTS.filter(s => rem[c.id][s.name] > 0 && (cnt[c.id][d][s.name] || 0) < cap).map(s => ({ s, sc: rem[c.id][s.name] * 0.5 + 10 * tRem[c.subjectTeachers[s.name]] / slotsLeft + R() * 1.2 - (prev && prev.subject === s.name ? 2.5 : 0) })).sort((x, y) => y.sc - x.sc).map(x => x.s); });
        const tryC = (c, seen) => { for (const s of cands[c.id]) { const tid = c.subjectTeachers[s.name]; if (seen.has(tid)) continue; seen.add(tid); if (!owner[tid] || tryC(owner[tid], seen)) { owner[tid] = c; choice[c.id] = s; return true; } } return false; };
        for (const c of shuffle(db.classes)) if (!tryC(c, new Set())) { ok = false; break; }
        if (!ok) break;
        db.classes.forEach(c => { const s = choice[c.id], tid = c.subjectTeachers[s.name]; rem[c.id][s.name]--; cnt[c.id][d][s.name] = (cnt[c.id][d][s.name] || 0) + 1; tt[c.id][d][p] = { subject: s.name, teacherId: tid, room: ROOMX[s.name] || c.room }; });
      }
      if (ok) built = tt;
    }
    db.timetable = built || {};

    /* ---------- Working-day helpers ---------- */
    const wdays = []; { let d = C.addDays(T, -78); while (d <= T) { if (d >= AYSTART && isWorking(d)) wdays.push(d); d = C.addDays(d, 1); } }
    const lastWD = wdays[wdays.length - 1];

    /* ---------- Attendance history ---------- */
    const prop = {}; db.students.forEach(s => { const r = R(); prop[s.id] = r < .08 ? .14 : r < .35 ? .06 : .025; });
    const SICK = ['Fever', 'Viral fever', 'Stomach ache', 'Family function', 'Medical appointment', 'Out of station', 'Cold & cough'];
    wdays.forEach(d => {
      db.att[d] = {}; db.attMeta[d] = {};
      db.classes.forEach((c, ci) => {
        if (d === lastWD && (ci % 2 === 1 || c.id === 'C5A')) return;   // leave some classes unmarked today for the demo
        const m = {};
        db.students.filter(s => s.classId === c.id).forEach(s => {
          const r = R(); let v = 'P';
          if (s.isNew && d < s.admDate) return;
          if (r < prop[s.id]) { v = R() < .3 ? { s: 'V', r: pick(SICK) } : { s: 'A', r: R() < .4 ? pick(SICK) : '' }; if (typeof v === 'object' && !v.r) v = 'A'; }
          else if (r < prop[s.id] + .03) v = { s: 'L', r: 'Arrived after assembly' };
          m[s.id] = v;
        });
        db.att[d][c.id] = m; db.attMeta[d][c.id] = { by: db.employees.find(e => e.id === c.classTeacherId).name, ts: tstamp(d, 8, ri(35, 55)) };
      });
    });

    /* ---------- Teacher attendance ---------- */
    const teachers = db.employees.filter(e => e.role === 'teacher');
    wdays.forEach(d => { db.tAtt[d] = {}; if (d === lastWD && false) return; teachers.forEach(t => { const r = R(); db.tAtt[d][t.id] = r < .02 ? 'A' : r < .055 ? 'V' : 'P'; }); });

    /* ---------- Exams & marks ---------- */
    const mkSchedule = (start, max) => { const out = []; let d = start; C.EXAM_SUBJECTS.forEach(sub => { while (C.dow(d) === 6 || isHoliday(d)) d = C.addDays(d, 1); out.push({ subject: sub, date: d, start: '09:00', end: max >= 100 ? '11:30' : '10:15' }); d = C.addDays(d, 1); }); return out; };
    const INSTR = '1. Students must carry the hall ticket and school ID card.\n2. Report to the examination room 15 minutes before the start time.\n3. Only blue/black pens are permitted; geometry boxes are allowed for Mathematics.\n4. Mobile phones and smart devices are strictly prohibited.\n5. Any form of malpractice will be reported to the Principal.';
    const mkExam = (name, start, max) => { const sched = mkSchedule(start, max); db.exams.push({ id: 'EX' + (++db.seq.exam), name, ay: AY, grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], max, passMarks: Math.ceil(max * .35), schedule: sched, instructions: INSTR, centre: db.settings.examCentre, createdBy: 'Mr. Rajesh Iyer', createdOn: C.addDays(sched[0].date, -25) }); };
    mkExam('Unit Test 1', C.addDays(T, -75), 50); mkExam('Quarterly Exam', C.addDays(T, -21), 100); mkExam('Unit Test 2', C.addDays(T, 22), 50); mkExam('Half-Yearly Exam', C.addDays(T, 70), 100); mkExam('Annual Exam', C.addDays(T, 170), 100);
    const ability = {}; db.students.forEach(s => { let a = 0.72 + (R() + R() + R() - 1.5) * 0.28; ability[s.id] = Math.max(.32, Math.min(.98, a)); });
    const subBias = {}; db.students.forEach(s => { subBias[s.id] = {}; C.EXAM_SUBJECTS.forEach(x => subBias[s.id][x] = (R() - .5) * .16); });
    const dean = db.employees.find(e => e.role === 'dean');
    [0, 1].forEach(ei => {
      const ex = db.exams[ei]; db.marks[ex.id] = {};
      db.classes.forEach(c => {
        db.marks[ex.id][c.id] = {};
        C.EXAM_SUBJECTS.forEach(sub => {
          let status = 'published'; if (ei === 1) { const r = R(); status = r < .76 ? 'published' : r < .88 ? 'submitted' : r < .95 ? 'draft' : null; }
          if (!status) return;
          const entries = {}; const sts = db.students.filter(s => s.classId === c.id);
          sts.forEach((s, i) => { if (status === 'draft' && i > 3) return; const v = Math.round(Math.max(0, Math.min(1, ability[s.id] + subBias[s.id][sub] + (R() - .5) * .12)) * ex.max); entries[s.id] = { obt: v, remarks: '' }; });
          const tch = db.employees.find(e => e.id === c.subjectTeachers[sub]);
          db.marks[ex.id][c.id][sub] = { max: ex.max, status, entries, enteredBy: tch.name, ts: tstamp(C.addDays(ex.schedule[ex.schedule.length - 1].date, 3), 15), approvedBy: status === 'published' ? dean.name : null };
        });
      });
    });

    /* ---------- Fees ---------- */
    const METHODS = ['UPI', 'UPI', 'UPI', 'Card', 'Net Banking', 'Cash', 'Cheque'];
    const accountant = db.employees.find(e => e.role === 'accountant');
    const pays = [];
    const addPay = (s, date, amount, term, mode) => {
      if (date > T) date = T; if (date < AYSTART) date = AYSTART;
      const m = pick(METHODS); const online = mode === 'Online';
      pays.push({ sid: s.id, date, amount, term, method: online ? 'Online (Razorpay)' : m, mode: online ? 'Online' : 'Counter', by: online ? 'Parent Portal' : accountant.name, ref: m === 'Cash' && !online ? '' : (m === 'Cheque' && !online ? 'CHQ ' + ri(100000, 999999) : 'TXN' + ri(10000000, 99999999)) });
    };
    const FT = s => { const t = s.totalFee, a = Math.round(t * .4 / 100) * 100, b = Math.round(t * .3 / 100) * 100; const d = s.dueDates || db.settings.termDates; return [{ due: d[0], amount: a }, { due: d[1], amount: b }, { due: d[2], amount: t - a - b }]; };
    db.students.forEach(s => {
      if (s.isNew) return;
      const r = R(); const terms = FT(s); const due = terms.filter(t => t.due <= T);
      const mode = () => R() < .3 ? 'Online' : 'Counter';
      if (r < .38) addPay(s, C.addDays(AYSTART, ri(4, 100)), s.totalFee, 'Annual Fee (All Terms)', mode());
      else if (r < .72) { terms.forEach((t, i) => { if (t.due <= T) addPay(s, C.addDays(t.due, -ri(0, 10)), t.amount, 'Term ' + (i + 1), mode()); else if (R() < .3 && C.pd(t.due) - C.pd(T) < 35 * 864e5) addPay(s, C.addDays(T, -ri(1, 15)), t.amount, 'Term ' + (i + 1), mode()); }); }
      else if (r < .94) { due.forEach((t, i) => { if (i < due.length - 1) addPay(s, C.addDays(t.due, -ri(0, 8)), t.amount, 'Term ' + (i + 1), mode()); else if (R() < .65) addPay(s, C.addDays(T, -ri(2, 25)), Math.round(t.amount * .5 / 100) * 100, 'Term ' + (i + 1) + ' (part)', mode()); }); }
    });
    pays.filter(p => p.date >= C.addDays(T, -14) && p.date < T).slice(-4).forEach(p => p.date = T);
    pays.sort((a, b) => a.date.localeCompare(b.date) || a.sid.localeCompare(b.sid)).forEach(p => {
      p.id = 'PAY' + String(++db.seq.pay).padStart(4, '0'); p.rcpt = 'RCP-' + rcptCode + '-' + String(++db.seq.rcpt + 100).padStart(6, '0'); p.ts = tstamp(p.date, ri(9, 15)); db.payments.push(p);
    });

    /* ---------- Payroll & expenses ---------- */
    const months = []; { let m = AYSTART.slice(0, 7); const cur = T.slice(0, 7); while (m <= cur) { months.push(m); const [yy, mm] = m.split('-').map(Number); m = mm === 12 ? (yy + 1) + '-01' : yy + '-' + C.pad(mm + 1); } }
    months.forEach(mk => db.employees.forEach(e => {
      const r = Seed.computePayroll(db, e, mk); const cur = mk === T.slice(0, 7);
      if (!cur) { r.status = 'Paid'; r.paidOn = C.addDays(mk + '-28', 0); r.mode = 'Bank Transfer'; r.paidBy = accountant.name; } else { r.status = 'Processing'; r.paidOn = null; }
      db.payroll.push(r);
    }));
    const EXPC = [['Electricity', 28000, 12000], ['Water & Sanitation', 6000, 3000], ['Maintenance & Repairs', 14000, 12000], ['Stationery & Printing', 9000, 6000], ['Transport – Fuel & Upkeep', 52000, 10000], ['Computer & Software', 6000, 3000], ['Housekeeping Supplies', 5000, 2500], ['Sports & Events', 8000, 10000], ['Lab & Library Consumables', 4000, 5000]];
    months.forEach(mk => EXPC.forEach(([cat, b, v]) => { const d = mk + '-' + C.pad(ri(3, 24)); if (d > T) return; db.expenses.push({ id: 'EXP' + String(++db.seq.exp).padStart(4, '0'), date: d, category: cat, desc: cat + ' – ' + C.monthLong(mk), amount: Math.round((b + R() * v) / 10) * 10, method: pick(['Bank Transfer', 'UPI', 'Cheque']), by: accountant.name }); }));

    /* ---------- Announcements ---------- */
    const A = (title, body, type, aud, daysAgo, by, role, pub, pinned) => db.announcements.push({ id: 'AN' + (++db.seq.ann), title, body, type, audience: aud, ts: tstamp(C.addDays(T, -daysAgo), ri(8, 16)), by, role, public: !!pub, pinned: !!pinned });
    const P = db.employees[0].name;
    A('Admissions open for 2027–28', 'Applications are now being accepted for the next academic year. Visit the admissions office or apply online. Limited seats per grade.', 'notice', { kind: 'school' }, 2, P, 'principal', true, true);
    A('Unit Test 2 schedule published', 'Unit Test 2 will begin on ' + C.fmtDate(C.addDays(T, 22)) + '. Detailed timetable and syllabus are available in the Examinations section.', 'exam', { kind: 'school' }, 1, dean.name, 'dean', true);
    A('Parent–Teacher Meeting – Quarterly Results', 'PTM will be held on ' + C.fmtDate(C.addDays(T, 7)) + ' from 9:00 AM to 1:00 PM. Parents are requested to meet the class teacher during the allotted slot.', 'ptm', { kind: 'parents' }, 3, P, 'principal', true);
    A('Fee reminder – Term 2 instalment', 'The Term 2 instalment is due on ' + C.fmtDate(db.settings.termDates[1]) + '. Parents may pay online through the portal or at the accounts office.', 'fee', { kind: 'parents' }, 4, accountant.name, 'accountant', false);
    A('Dussehra holidays', 'The school will remain closed from ' + C.fmtDate(Y + '-10-19') + ' to ' + C.fmtDate(Y + '-10-21') + '. Classes resume on ' + C.fmtDate(Y + '-10-22') + '.', 'holiday', { kind: 'school' }, 6, P, 'principal', true);
    A('Staff Development Workshop', 'All teaching staff are requested to attend the pedagogy workshop in the conference hall at 3:00 PM.', 'notice', { kind: 'teachers' }, 2, dean.name, 'dean', false);
    A('Marks entry deadline – Quarterly Exam', 'Teachers with pending mark entries for the Quarterly Exam must submit them for Dean review within 3 working days.', 'exam', { kind: 'teachers' }, 1, dean.name, 'dean', false);
    A('Inter-House Sports Meet', 'House practice sessions will be held daily during the sports period. Students should wear house colours on meet day.', 'event', { kind: 'school' }, 5, P, 'principal', true);
    A('Deep-cleaning schedule – Laboratories', 'Science and Computer laboratories will undergo deep cleaning this Saturday after school hours.', 'notice', { kind: 'ops' }, 2, P, 'principal', false);
    A('Class 7 field visit – permission slips', 'Permission slips for the Chandragiri science field visit must be returned by Friday.', 'notice', { kind: 'grade', grade: 7 }, 3, db.employees.find(e => e.id === db.classes.find(c => c.id === 'C7A').classTeacherId).name, 'teacher', false);

    /* ---------- Notifications history (WhatsApp, simulated) ---------- */
    const NS = (type, s, msg, daysAgo) => { const p = db.parents.find(p => p.id === s.parentId); db.notifications.push({ id: 'N' + (++db.seq.notif), ts: tstamp(C.addDays(T, -daysAgo), ri(8, 17)), channel: 'WhatsApp', type, sid: s.id, to: p.name, phone: p.whatsapp, message: msg, status: 'Delivered' }); };
    Object.keys(db.att).slice(-6).forEach((d, di) => db.classes.forEach(c => { const m = db.att[d][c.id]; if (!m) return; Object.keys(m).forEach(sid => { const v = m[sid]; if ((typeof v === 'string' ? v : v.s) === 'A') { const s = db.students.find(x => x.id === sid); NS('absent', s, Seed.TPL.absent(s.name, c.name.replace('Grade ', ''), d), C.pd(T) - C.pd(d) > 0 ? Math.round((C.pd(T) - C.pd(d)) / 864e5) : 0); } }); }));
    db.students.filter(s => s.classId === 'C5B').slice(0, 3).forEach(s => NS('marks', s, Seed.TPL.marks('Mathematics', 'Quarterly Exam', s.name, 74 + s.roll, 100), 8));
    pays.slice(-9).forEach(p => { const s = db.students.find(x => x.id === p.sid); NS('feePaid', s, Seed.TPL.feePaid(s.name, s.classId.slice(1), p.amount, p.rcpt, 0), Math.round((C.pd(T) - C.pd(p.date)) / 864e5)); });
    db.notifications.sort((a, b) => a.ts.localeCompare(b.ts));

    /* ---------- Operations ---------- */
    const staff = db.employees.filter(e => e.role === 'ops' && !e.supervisor);
    const LOC = [['Classroom Cleaning – Grades 1–2 Block', 'Classroom', 'Medium', '07:15'], ['Classroom Cleaning – Grades 3–5 Block', 'Classroom', 'Medium', '07:15'], ['Classroom Cleaning – Grades 6–8 Block', 'Classroom', 'Medium', '07:15'], ['Washroom Cleaning – Ground Floor (Boys)', 'Washroom', 'High', '10:00'], ['Washroom Cleaning – Ground Floor (Girls)', 'Washroom', 'High', '10:00'], ['Washroom Cleaning – First Floor', 'Washroom', 'High', '12:30'], ['Science Laboratory Cleaning', 'Laboratory', 'Medium', '15:00'], ['Computer Laboratory Cleaning', 'Laboratory', 'Medium', '15:00'], ['Principal & Admin Office Cleaning', 'Office', 'Low', '07:30'], ['Staff Room Cleaning', 'Office', 'Low', '07:45'], ['Main Corridor & Staircases', 'Corridor', 'Medium', '08:00'], ['Playground Maintenance', 'Playground', 'Medium', '14:30'], ['Canteen Waste Collection & Segregation', 'Waste Management', 'High', '13:30']];
    const TS = ['Completed', 'Completed', 'Completed', 'Completed', 'Completed', 'Requires Attention'];
    for (let off = -4; off <= 1; off++) { const d = C.addDays(T, off); if (C.dow(d) === 6) continue; LOC.forEach((l, i) => {
      let st = off < 0 ? pick(TS) : off === 0 ? pick(['Completed', 'Completed', 'In Progress', 'Pending', 'Pending']) : 'Pending';
      const t = { id: 'TK' + String(++db.seq.task).padStart(4, '0'), task: l[0].split(' – ')[0], category: l[1], location: l[0].includes(' – ') ? l[0].split(' – ')[1] : l[0], assignedTo: staff[i % staff.length].id, date: d, time: l[3], priority: l[2], status: st, remarks: st === 'Requires Attention' ? pick(['Water supply interrupted; could not complete.', 'Need extra phenyl and mops.', 'Floor repair needed before cleaning.']) : '', verified: off < 0 && st === 'Completed', verifiedBy: null, completedAt: st === 'Completed' ? tstamp(d, 8 + (i % 7)) : null };
      if (t.verified) t.verifiedBy = db.employees.find(e => e.supervisor).name; db.tasks.push(t); }); }
    const tchs = teachers;
    const MS = [['Grade 4B Classroom', 'Ceiling fan not working', 'Medium', 'Fan makes noise and stops intermittently.', 'In Progress', 11], ['Science Laboratory', 'Water leakage', 'High', 'Leak beneath tap near demo table 3.', 'Assigned', 12], ['Grade 6A Classroom', 'Projector issue', 'High', 'Projector displays green tint; HDMI cable suspected.', 'Reported', 13], ['Washroom – First Floor', 'Washroom issue', 'High', 'Flush not working in second cubicle.', 'In Progress', 14], ['Staff Room', 'Light not working', 'Low', 'Two tube lights are dead.', 'Resolved', 6], ['Grade 2A Classroom', 'Damaged desk', 'Low', 'Desk leg broken – unsafe for use.', 'Reported', 15], ['Corridor – Block B', 'Light not working', 'Medium', 'Corridor lights flicker after 3 PM.', 'Resolved', 9], ['Library', 'Ceiling fan not working', 'Low', 'Fan regulator needs replacement.', 'Resolved', 4]];
    MS.forEach((m, i) => { const t = tchs[(i * 3 + 2) % tchs.length]; const d = C.addDays(T, -m[5] % 9); db.maint.push({ id: 'MR' + String(++db.seq.maint).padStart(4, '0'), ts: tstamp(d, ri(9, 15)), date: d, location: m[0], issue: m[1], priority: m[2], description: m[3], status: m[4], reportedBy: t.name, reportedRole: 'teacher', photo: null, assignedTo: m[4] === 'Reported' ? null : staff[5].id, updates: [{ ts: tstamp(d, 16), by: t.name, note: 'Issue reported.' }].concat(m[4] === 'Reported' ? [] : [{ ts: tstamp(d, 17), by: db.employees.find(e => e.supervisor).name, note: 'Assigned to maintenance team.' }]) }); });

    /* ---------- Leaves ---------- */
    [[3, 'Casual', 2, 'Pending', 'Family function in Mysuru.'], [7, 'Sick', 1, 'Approved', 'Viral fever.'], [11, 'Casual', 1, 'Approved', 'Personal work.'], [15, 'Earned', 3, 'Pending', 'Travel – sister\'s wedding.'], [18, 'Sick', 2, 'Approved', 'Medical procedure follow-up.'], [21, 'Casual', 1, 'Rejected', 'Overlaps with examination invigilation.']].forEach(([ti, type, days, st, reason], i) => {
      const t = teachers[ti], from = C.addDays(T, st === 'Pending' ? 4 + i : -(10 + i * 4));
      db.leaves.push({ id: 'LV' + String(++db.seq.leave).padStart(3, '0'), empId: t.id, type, from, to: C.addDays(from, days - 1), days, reason, status: st, appliedOn: C.addDays(from, -3), decidedBy: st === 'Pending' ? null : P });
    });

    /* ---------- Enquiries ---------- */
    [['Rohan Bhatt', 'Grade 3', 'Mr. Sandeep Bhatt', '9886012345', 'sandeep.bhatt@gmail.com', 'Looking for admission for 2027–28.'], ['Aanya Pillai', 'Grade 1', 'Mrs. Remya Pillai', '9845098765', 'remya.p@gmail.com', 'Please share fee structure and transport details.'], ['Mihir Shah', 'Grade 6', 'Mr. Jignesh Shah', '9731122334', 'jshah@gmail.com', 'Transferring from Pune; need mid-term admission.']].forEach((e, i) => db.enquiries.push({ id: 'EQ' + (++db.seq.enq), ts: tstamp(C.addDays(T, -i), 11), child: e[0], grade: e[1], parent: e[2], phone: e[3], email: e[4], message: e[5], status: i === 2 ? 'Contacted' : 'New' }));

    /* ---------- Audit trail (sample history) ---------- */
    const AU = (daysAgo, user, role, action, entity, prev, next) => db.audit.push({ id: 'AU' + (++db.seq.audit), ts: tstamp(C.addDays(T, -daysAgo), ri(9, 17)), user, role, action, entity, prev: prev || '', next: next || '' });
    const T5 = i => db.employees.filter(e => e.role === 'teacher')[i].name; const ct5a = db.employees.find(e => e.id === db.classes.find(c => c.id === 'C5A').classTeacherId).name; const adminN = db.employees.find(e => e.role === 'admin').name;
    AU(9, dean.name, 'dean', 'Created examination', 'Quarterly Exam', '', 'Classes 1–10 · Max 100 · Pass 35');
    AU(8, ct5a, 'teacher', 'Submitted marks', 'Grade 5B · Mathematics · Quarterly Exam', 'Draft', 'Submitted for review');
    AU(8, dean.name, 'dean', 'Approved & published marks', 'Grade 5B · Mathematics · Quarterly Exam', 'Submitted', 'Published');
    AU(6, accountant.name, 'accountant', 'Recorded fee payment', pays[pays.length - 1].rcpt, '', C.inr(pays[pays.length - 1].amount) + ' via ' + pays[pays.length - 1].method);
    AU(5, adminN, 'admin', 'Created user account', 'new.teacher', '', 'Role: Teacher');
    AU(4, dean.name, 'dean', 'Modified timetable', 'Grade 3A · Wednesday · Period 4', 'Science – Mr. Vikram Shetty', 'English – Mrs. Deepa Menon');
    AU(3, dean.name, 'dean', 'Assigned class teacher', 'Grade 7A', T5(5), db.employees.find(e => e.id === db.classes.find(c => c.id === 'C7A').classTeacherId).name);
    AU(3, accountant.name, 'accountant', 'Updated salary record', T5(25) + ' · ' + C.monthLong(months[Math.max(0, months.length - 2)]), 'Allowance ₹4,200', 'Allowance ₹4,500');
    AU(2, ct5a, 'teacher', 'Marked attendance', 'Grade 5A', '', 'Present 7 / Absent 0');
    AU(2, T5(2), 'teacher', 'Updated student details', db.students[40].name, 'Emergency phone: ' + C.phone(db.students[40].emergency.phone), 'Emergency phone updated');
    AU(1, dean.name, 'dean', 'Generated hall tickets', 'Unit Test 2 · Grade 8A', '', '7 tickets');
    db.audit.sort((a, b) => a.ts.localeCompare(b.ts));

    db.hallTickets = []; // (hall tickets for Unit Test 2 are generated by the Dean during the demo)
    return db;
  };

  G.Seed = Seed;
  if (typeof module !== 'undefined') module.exports = Seed;
})(typeof window !== 'undefined' ? window : globalThis);
