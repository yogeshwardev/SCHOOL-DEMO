/* docs.js — printable documents: fee receipt, report card, hall ticket, salary slip */
(function (G) {
  'use strict';
  const C = G.C, S = G.S, UI = G.UI, esc = C.esc;
  const Docs = {};
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  const three = n => (n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : '');
  Docs.words = n => { n = Math.round(n); if (!n) return 'Zero Rupees Only'; const parts = []; const cr = Math.floor(n / 1e7), lk = Math.floor(n / 1e5) % 100, th = Math.floor(n / 1e3) % 100, rest = n % 1000; if (cr) parts.push(three(cr) + ' Crore'); if (lk) parts.push(two(lk) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (rest) parts.push(three(rest)); return 'Rupees ' + parts.join(' ') + ' Only'; };
  const photo = s => `<div class="photo" style="background:${['#1c3f75', '#2a8c82', '#7a5198', '#b4505a', '#a07a22', '#3f78ad', '#56688a', '#3a8660'][s.colorIdx % 8]}">${esc(C.initials(s.name))}</div>`;

  Docs.receipt = pid => {
    const p = S.db().payments.find(x => x.id === pid); const s = S.student(p.sid), par = S.parent(s.parentId);
    const all = S.db().payments.filter(x => x.sid === s.id && (x.date < p.date || (x.date === p.date && x.id <= p.id))); const paidTo = C.sum(all, x => x.amount); const bal = s.totalFee - paidTo;
    return `<div class="sheet">${UI.docHeader('Fee Receipt Office')}<div class="stamp">PAID</div><div class="ttl">Fee Receipt</div>
    <div class="meta"><div><b>Receipt No.</b><span><strong>${p.rcpt}</strong></span></div><div><b>Date</b><span>${C.fmtDate(p.date)}</span></div>
    <div><b>Student Name</b><span>${esc(s.name)}</span></div><div><b>Admission No.</b><span>${esc(s.adm)}</span></div>
    <div><b>Class / Section</b><span>${esc(S.className(s.classId))} · Roll ${s.roll}</span></div><div><b>Academic Year</b><span>${S.db().ay}</span></div>
    <div><b>Parent / Guardian</b><span>${esc(par.name)}</span></div><div><b>Payment Mode</b><span>${esc(p.method)}</span></div>
    <div><b>Reference / Txn ID</b><span>${esc(p.ref || '—')}</span></div><div><b>Received by</b><span>${esc(p.by)}</span></div></div>
    <table><thead><tr><th>#</th><th>Description</th><th class="r">Amount (₹)</th></tr></thead><tbody><tr><td>1</td><td>${esc(p.term)} – Tuition &amp; Academic Fee${s.transport ? ' (incl. transport as applicable)' : ''}</td><td class="r">${C.num(p.amount)}.00</td></tr></tbody><tfoot><tr><td colspan="2" class="r">Total Received</td><td class="r">${C.inr(p.amount)}</td></tr></tfoot></table>
    <p style="margin:10px 0 2px"><b>Amount in words:</b> ${Docs.words(p.amount)}</p>
    <table style="margin-top:12px"><tr><th>Annual Fee</th><th>Paid till date</th><th>Balance after this payment</th></tr><tr><td>${C.inr(s.totalFee)}</td><td>${C.inr(paidTo)}</td><td><strong>${C.inr(bal)}</strong></td></tr></table>
    <div class="sig"><div>Parent / Guardian</div><div>Accountant · ${esc(C.SCHOOL.short)}</div></div><div class="foot">This is a computer-generated receipt and is valid without a physical signature. Fees once paid are non-refundable.</div></div>`;
  };

  Docs.reportCard = (sid, exId) => {
    const s = S.student(sid), x = S.exam(exId), r = S.examResult(sid, exId), c = S.cls(s.classId), att = S.studentAtt(sid), ct = S.emp(c.classTeacherId), rk = S.rankIn(s.classId, exId, sid);
    const ci = S.classExam(s.classId, exId);
    return `<div class="sheet">${UI.docHeader('Academic Year ' + S.db().ay)}<div class="ttl">Progress Report – ${esc(x.name)}</div>
    <div style="display:flex;gap:16px"><div style="flex:1"><div class="meta" style="grid-template-columns:1fr"><div><b>Student Name</b><span><strong>${esc(s.name)}</strong></span></div><div><b>Admission No.</b><span>${esc(s.adm)}</span></div><div><b>Class / Section</b><span>${esc(c.name)} · Roll ${s.roll}</span></div><div><b>Date of Birth</b><span>${C.fmtDate(s.dob)}</span></div><div><b>Parent / Guardian</b><span>${esc(S.parent(s.parentId).name)}</span></div></div></div>${photo(s)}</div>
    <table><thead><tr><th>Subject</th><th class="r">Maximum</th><th class="r">Obtained</th><th class="r">Percentage</th><th>Grade</th><th>Result</th></tr></thead><tbody>${r.rows.map(w => w.pending ? `<tr><td>${esc(w.subject)}</td><td class="r">${w.max}</td><td colspan="4" style="color:#8a94a6">Result awaited</td></tr>` : `<tr><td>${esc(w.subject)}</td><td class="r">${w.max}</td><td class="r"><strong>${w.obt}</strong></td><td class="r">${(w.obt * 100 / w.max).toFixed(1)}%</td><td>${w.grade}</td><td><span class="pill ${w.pass ? 'ok' : 'bad'}">${w.pass ? 'Pass' : 'Fail'}</span></td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total</td><td class="r">${r.max}</td><td class="r">${r.total}</td><td class="r">${r.pct}%</td><td>${r.grade}</td><td>${r.complete ? `<span class="pill ${r.result === 'Pass' ? 'ok' : 'bad'}">${r.result}</span>` : 'Partial'}</td></tr></tfoot></table>
    <div class="meta" style="margin-top:14px"><div><b>Overall Percentage</b><span class="big">${r.pct}%</span></div><div><b>Overall Grade</b><span class="big">${r.grade}</span></div>
    <div><b>Class Average</b><span>${ci.avg.toFixed(1)}%</span></div><div><b>Class Rank</b><span>${rk ? rk.rank + ' of ' + rk.of : '—'}</span></div>
    <div><b>Attendance</b><span>${att.pct}% (${att.P + att.L} of ${att.total} days)</span></div><div><b>Result</b><span>${r.complete ? r.result : 'Awaited'}</span></div></div>
    <p style="font-size:11.5px;color:#5b6679;margin:6px 0"><b>Grading scale:</b> ${esc(S.db().settings.gradingScale)} · Pass mark: ${x.passMarks}/${x.max} per subject.</p>
    <div class="sig"><div>Class Teacher<br><small>${esc(ct.name)}</small></div><div>Parent's Signature</div><div>Principal<br><small>${esc(S.db().employees[0].name)}</small></div></div><div class="foot">Issued on ${C.fmtDate(C.today())} · ${esc(C.SCHOOL.name)}</div></div>`;
  };

  Docs.hallTicket = (sid, exId) => {
    const s = S.student(sid), x = S.exam(exId), c = S.cls(s.classId), h = S.hallTicket(exId, sid);
    return `<div class="sheet">${UI.docHeader('Academic Year ' + S.db().ay)}<div class="ttl">Hall Ticket – ${esc(x.name)}</div>
    <div style="display:flex;gap:16px"><div style="flex:1"><div class="meta" style="grid-template-columns:1fr"><div><b>Hall Ticket No.</b><span><strong>${h ? h.no : '—'}</strong></span></div><div><b>Student Name</b><span><strong>${esc(s.name)}</strong></span></div><div><b>Admission No.</b><span>${esc(s.adm)}</span></div><div><b>Class / Section</b><span>${esc(c.name)} · Roll ${s.roll}</span></div><div><b>Examination Centre</b><span>${esc(x.centre)}</span></div></div></div>${photo(s)}</div>
    <table><thead><tr><th>Date</th><th>Day</th><th>Subject</th><th>Time</th><th>Max Marks</th></tr></thead><tbody>${x.schedule.map(w => `<tr><td>${C.fmtDate(w.date)}</td><td>${C.pd(w.date).toLocaleDateString('en-IN', { weekday: 'long' })}</td><td><strong>${esc(w.subject)}</strong></td><td>${C.t12(w.start)} – ${C.t12(w.end)}</td><td>${x.max}</td></tr>`).join('')}</tbody></table>
    <p style="margin:14px 0 2px"><b>Important Instructions</b></p><ol>${x.instructions.split('\n').map(l => `<li>${esc(l.replace(/^\d+\.\s*/, ''))}</li>`).join('')}</ol>
    <div class="sig"><div>Student's Signature</div><div>Class Teacher</div><div>Principal</div></div><div class="foot">Generated ${h ? C.fmtStamp(h.ts) : ''} by ${h ? esc(h.by) : ''} · Not valid without school seal</div></div>`;
  };

  Docs.salarySlip = rid => {
    const r = S.db().payroll.find(x => x.id === rid), e = S.emp(r.empId);
    return `<div class="sheet">${UI.docHeader('Payroll Department')}<div class="ttl">Salary Slip – ${C.monthLong(r.month)}</div>
    <div class="meta"><div><b>Employee</b><span><strong>${esc(e.name)}</strong></span></div><div><b>Employee ID</b><span>${esc(e.empId)}</span></div><div><b>Department</b><span>${esc(e.dept)}</span></div><div><b>Designation</b><span>${esc(e.designation)}</span></div><div><b>Date of Joining</b><span>${C.fmtDate(e.joinDate)}</span></div><div><b>Payment Status</b><span>${r.status}${r.paidOn ? ' · ' + C.fmtDate(r.paidOn) : ''}</span></div></div>
    <table><thead><tr><th>Earnings</th><th class="r">₹</th><th>Deductions</th><th class="r">₹</th></tr></thead><tbody>
    <tr><td>Basic Salary</td><td class="r">${C.num(r.basic)}</td><td>Provident Fund (12%)</td><td class="r">${C.num(r.pf)}</td></tr>
    <tr><td>House Rent Allowance</td><td class="r">${C.num(r.hra)}</td><td>Professional Tax</td><td class="r">${C.num(r.pt)}</td></tr>
    <tr><td>Dearness Allowance</td><td class="r">${C.num(r.da)}</td><td>Income Tax (TDS)</td><td class="r">${C.num(r.tds)}</td></tr>
    <tr><td>Transport Allowance</td><td class="r">${C.num(r.transport)}</td><td>Attendance deduction (${r.absentDays} day${r.absentDays === 1 ? '' : 's'})</td><td class="r">${C.num(r.attDed)}</td></tr></tbody>
    <tfoot><tr><td>Gross Earnings</td><td class="r">${C.num(r.basic + r.allowances)}</td><td>Total Deductions</td><td class="r">${C.num(r.deductions + r.attDed)}</td></tr></tfoot></table>
    <p style="margin:12px 0 0"><span class="big">Net Salary: ${C.inr(r.net)}</span><br><small>${Docs.words(r.net)}</small></p><div class="sig"><div>Employee</div><div>Accountant</div></div><div class="foot">Computer-generated salary slip · Confidential</div></div>`;
  };

  Docs.open = (kind, a, b) => {
    if (kind === 'receipt') { const p = S.db().payments.find(x => x.id === a); UI.docPreview('Receipt ' + p.rcpt, Docs.receipt(a), p.rcpt); }
    if (kind === 'report') UI.docPreview('Report Card – ' + S.student(a).name, Docs.reportCard(a, b), 'ReportCard_' + S.student(a).name);
    if (kind === 'hall') UI.docPreview('Hall Ticket – ' + S.student(a).name, Docs.hallTicket(a, b), 'HallTicket_' + S.student(a).name);
    if (kind === 'slip') UI.docPreview('Salary Slip', Docs.salarySlip(a), 'SalarySlip');
  };
  G.Docs = Docs;
})(window);
