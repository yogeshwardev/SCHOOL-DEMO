/* ui.js — UI toolkit: icons, badges, charts, tables, list views, modals, toasts, printable documents */
(function (G) {
  'use strict';
  const C = G.C, esc = C.esc;
  const UI = { act: {}, on: {}, lv: {} };

  /* ---------- icons ---------- */
  const IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7"/><path d="M18 14.5c2 .8 3.5 2.7 3.5 5.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', check: '<path d="M4 12l5 5L20 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    rupee: '<path d="M6 4h12M6 9h12M9 4c5 0 6 5 0 5l7 11"/>', wallet: '<path d="M3 7a2 2 0 012-2h14v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>', clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>', bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', logout: '<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', printer: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="9" rx="2"/><path d="M7 15h10v6H7z"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M4 21h16M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01"/>', wrench: '<path d="M14.5 6.5a4 4 0 005 5L21 13 12 22l-3-3 9-9a4 4 0 01-3.5-3.5z"/><path d="M3 21l3-3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/>', bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 20v-3M17 20v-3"/>',
    flask: '<path d="M9 3h6M10 3v6L4 20h16l-6-11V3"/>', ticket: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M9 6v12" stroke-dasharray="2 2"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>', chevD: '<path d="M6 9l6 6 6-6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', send: '<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l11-11"/>',
    wa: '<path d="M4 20l1.3-4.2A8.5 8.5 0 1112 20.5a8.5 8.5 0 01-4-1z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"/>', pin: '<path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>', news: '<path d="M5 4h13v16H7a2 2 0 01-2-2z"/><path d="M8 8h7M8 12h7M8 16h4"/>', receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    refresh: '<path d="M20 11a8 8 0 10-2 6M20 4v7h-7"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>', trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>', book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', trophy: '<path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M12 14v4M8 21h8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>', filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', userplus: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6"/>', play: '<path d="M7 4l13 8-13 8z"/>', dot: '<circle cx="12" cy="12" r="4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'
  };
  UI.icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.dot}</svg>`;
  UI.crest = (h = 40) => `<img class="logo-img" src="${C.SCHOOL.logo}" alt="${esc(C.SCHOOL.name)}" style="height:${h}px;width:auto">`;

  /* ---------- small components ---------- */
  const AV = ['#1d4690', '#1b9e8c', '#7a5198', '#d6334a', '#c77d12', '#1e8bd0', '#56688a', '#3a8660'];
  UI.avatar = (name, idx, size) => `<div class="avatar ${size || ''}" style="background:${AV[(idx == null ? name.length : idx) % 8]}" title="${esc(name)}">${esc(C.initials(name))}</div>`;
  UI.badge = (t, k) => `<span class="badge ${k || ''}">${esc(t)}</span>`;
  const SK = { Paid: 'ok', 'Partially Paid': 'info', Pending: 'warn', Overdue: 'bad', Processing: 'info', Completed: 'ok', 'In Progress': 'info', 'Requires Attention': 'bad', published: 'ok', submitted: 'info', draft: 'warn', 'not started': 'bad', Reported: 'warn', Assigned: 'info', Resolved: 'ok', Approved: 'ok', Rejected: 'bad', Upcoming: 'info', Ongoing: 'warn', Delivered: 'ok', Open: 'warn', Active: 'ok', Disabled: 'bad', High: 'bad', Medium: 'warn', Low: '', New: 'warn', Contacted: 'info', Present: 'ok', Absent: 'bad', Late: 'warn', Leave: 'info', Pass: 'ok', Fail: 'bad', Verified: 'ok' };
  UI.status = s => `<span class="badge ${SK[s] != null ? SK[s] : ''}">${esc(s === 'published' ? 'Published' : s === 'submitted' ? 'Awaiting review' : s === 'draft' ? 'Draft' : s === 'not started' ? 'Not started' : s)}</span>`;
  UI.kpi = o => `<div class="card kpi ${o.href ? 'link' : ''}" ${o.href ? `data-go="${o.href}"` : ''}><div class="ico ${o.tone || ''}">${UI.icon(o.icon || 'chart', 20)}</div><div class="grow"><div class="lbl">${o.label}</div><div class="val">${o.value}</div>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}</div></div>`;
  UI.card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">${title ? `<div class="card-h"><div><h3>${title}</h3>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}</div>${o.actions ? `<div class="row">${o.actions}</div>` : ''}</div>` : ''}<div class="card-b ${o.flush ? 'flush' : ''}">${body}</div>${o.foot ? `<div class="card-f">${o.foot}</div>` : ''}</div>`;
  UI.head = o => `<div class="page-head"><div>${o.crumbs ? `<div class="crumbs">${o.crumbs}</div>` : ''}<h1>${o.title}</h1>${o.sub ? `<p>${o.sub}</p>` : ''}</div>${o.actions ? `<div class="page-actions">${o.actions}</div>` : ''}</div>`;
  UI.btn = (label, act, o = {}) => `<button class="btn ${o.cls || ''}" data-act="${act}" ${Object.entries(o.data || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')} ${o.title ? `title="${esc(o.title)}"` : ''}>${o.icon ? UI.icon(o.icon, 15) : ''}${label}</button>`;
  UI.link = (label, href, o = {}) => `<a class="btn ${o.cls || ''}" href="${href}">${o.icon ? UI.icon(o.icon, 15) : ''}${label}</a>`;
  UI.empty = (t, s) => `<div class="empty"><b>${t}</b>${s || ''}</div>`;
  UI.dl = pairs => `<dl class="dl">${pairs.filter(p => p).map(([k, v]) => `<dt>${k}</dt><dd>${v == null || v === '' ? '—' : v}</dd>`).join('')}</dl>`;
  UI.field = (label, html, o = {}) => `<div class="field ${o.cls || ''}"><label>${label}</label>${html}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
  UI.opts = (list, val) => list.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
  UI.select = (name, list, val, attrs = '') => `<select class="input" name="${name}" ${attrs}>${UI.opts(list, val)}</select>`;
  UI.input = (name, val, attrs = '') => `<input class="input" name="${name}" value="${esc(val == null ? '' : val)}" ${attrs}>`;
  UI.tabs = (tabs, active, act) => `<div class="tabs">${tabs.map(([k, l, n]) => `<button class="${k === active ? 'on' : ''}" data-act="${act}" data-tab="${k}">${l}${n != null ? ` <span class="badge nodot">${n}</span>` : ''}</button>`).join('')}</div>`;
  UI.pillTabs = (tabs, active, act) => `<div class="pill-tabs">${tabs.map(([k, l]) => `<button class="${k === active ? 'on' : ''}" data-act="${act}" data-tab="${k}">${l}</button>`).join('')}</div>`;
  UI.progress = (pct, cls) => `<div class="progress ${cls || (pct >= 90 ? 'ok' : pct >= 75 ? '' : pct >= 60 ? 'warn' : 'bad')}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
  UI.person = (name, sub, idx, href) => `<div class="person">${UI.avatar(name, idx, 'sm')}<div>${href ? `<a href="${href}"><b>${esc(name)}</b></a>` : `<b>${esc(name)}</b>`}<span>${esc(sub || '')}</span></div></div>`;
  UI.wa = (msg) => `<div class="wa-bubble">${esc(msg)}</div>`;

  /* ---------- charts (self-contained SVG) ---------- */
  const PAL = ['#1d4690', '#6b8fd1', '#2f855a', '#c0392b', '#8a97ad', '#d69e2e'];
  UI.PAL = PAL;
  const nice = m => { if (m <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(m))), f = m / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
  const legend = s => s.length > 1 || s[0].name ? `<div class="legend">${s.map(x => `<span><i style="background:${x.color}"></i>${esc(x.name)}</span>`).join('')}</div>` : '';
  function frame(W, H, ml, mt, mb, labels, ymax, fmt, ticks = 4) {
    let g = ''; const ih = H - mt - mb;
    for (let i = 0; i <= ticks; i++) { const v = ymax * i / ticks, y = mt + ih - ih * i / ticks; g += `<line x1="${ml}" x2="${W - 8}" y1="${y}" y2="${y}" stroke="${i ? '#e8ecf3' : '#cfd6e3'}"/><text x="${ml - 8}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
    return g;
  }
  UI.chart = {
    bars(o) {
      const W = 640, H = o.height || 250, ml = o.ml || 46, mt = 10, mb = 28, ih = H - mt - mb; const s = o.series.map((x, i) => Object.assign({ color: PAL[i % PAL.length] }, x)); const fmt = o.fmt || (v => C.num(v)); const n = o.labels.length;
      let max = o.ymax || 0; if (!o.ymax) for (let i = 0; i < n; i++) { const v = o.stacked ? C.sum(s, x => x.data[i] || 0) : Math.max(...s.map(x => x.data[i] || 0)); if (v > max) max = v; } max = nice(max * 1.05);
      let g = frame(W, H, ml, mt, mb, o.labels, max, fmt); const gw = (W - ml - 8) / n; const bw = Math.min(46, gw * (o.stacked ? .56 : .72) / (o.stacked ? 1 : s.length));
      o.labels.forEach((lb, i) => {
        const cx = ml + gw * i + gw / 2; g += `<text x="${cx}" y="${H - 9}" text-anchor="middle">${esc(lb)}</text>`;
        if (o.stacked) { let acc = 0; s.forEach(x => { const v = x.data[i] || 0, h = ih * v / max; g += `<rect x="${cx - bw / 2}" y="${mt + ih - (acc + v) * ih / max}" width="${bw}" height="${h}" fill="${x.color}" rx="2"><title>${esc(lb)} · ${esc(x.name)}: ${fmt(v)}</title></rect>`; acc += v; }); }
        else s.forEach((x, k) => { const v = x.data[i] || 0, h = ih * v / max; g += `<rect x="${cx - bw * s.length / 2 + k * bw}" y="${mt + ih - h}" width="${bw - 2}" height="${Math.max(h, 0)}" fill="${x.color}" rx="3"><title>${esc(lb)} · ${esc(x.name)}: ${fmt(v)}</title></rect>`; });
      });
      return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>${legend(s)}</div>`;
    },
    line(o) {
      const W = 640, H = o.height || 250, ml = o.ml || 46, mt = 10, mb = 28, ih = H - mt - mb; const s = o.series.map((x, i) => Object.assign({ color: PAL[i % PAL.length] }, x)); const fmt = o.fmt || (v => C.num(v)); const n = o.labels.length;
      let max = o.ymax || nice(Math.max(...s.map(x => Math.max(...x.data))) * 1.05), min = o.ymin || 0; const rng = max - min || 1;
      let g = ''; for (let i = 0; i <= 4; i++) { const v = min + rng * i / 4, y = mt + ih - ih * i / 4; g += `<line x1="${ml}" x2="${W - 8}" y1="${y}" y2="${y}" stroke="${i ? '#e8ecf3' : '#cfd6e3'}"/><text x="${ml - 8}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
      const step = (W - ml - 14) / Math.max(1, n - 1); const every = Math.ceil(n / 9);
      o.labels.forEach((lb, i) => { if (i % every === 0) g += `<text x="${ml + step * i}" y="${H - 9}" text-anchor="middle">${esc(lb)}</text>`; });
      s.forEach(x => { const pts = x.data.map((v, i) => [ml + step * i, mt + ih - ih * (v - min) / rng]); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '); if (o.area) g += `<path d="${d} L${pts[pts.length - 1][0]} ${mt + ih} L${pts[0][0]} ${mt + ih}Z" fill="${x.color}" opacity=".08"/>`; g += `<path d="${d}" fill="none" stroke="${x.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`; if (n <= 40) pts.forEach((p, i) => g += `<circle cx="${p[0]}" cy="${p[1]}" r="${n > 24 ? 2.2 : 3.2}" fill="#fff" stroke="${x.color}" stroke-width="1.8"><title>${esc(o.labels[i])} · ${esc(x.name)}: ${fmt(x.data[i])}</title></circle>`); });
      return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>${legend(s)}</div>`;
    },
    donut(o) {
      const tot = C.sum(o.items, x => x.value) || 1; const R = 54, CIR = 2 * Math.PI * R; let off = 0; let arcs = '';
      o.items.forEach((x, i) => { x.color = x.color || PAL[i % PAL.length]; const len = CIR * x.value / tot; arcs += `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${x.color}" stroke-width="20" stroke-dasharray="${len} ${CIR - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(x.label)}: ${C.num(x.value)}</title></circle>`; off += len; });
      return `<div class="donut-wrap"><svg width="${o.size || 148}" height="${o.size || 148}" viewBox="0 0 140 140"><circle r="${R}" cx="70" cy="70" fill="none" stroke="#eef1f6" stroke-width="20"/>${arcs}<text x="70" y="68" text-anchor="middle" style="font-size:20px;font-weight:650;fill:#0e2552">${o.center || ''}</text><text x="70" y="85" text-anchor="middle" style="font-size:9.5px">${o.centerLabel || ''}</text></svg><div class="legend">${o.items.map(x => `<div><span><i style="background:${x.color}"></i>${esc(x.label)}</span><b>${o.fmt ? o.fmt(x.value) : C.num(x.value)}</b></div>`).join('')}</div></div>`;
    },
    hbars(o) {
      const max = o.max || Math.max(...o.items.map(x => x.value), 1); const fmt = o.fmt || (v => v);
      return `<div class="col" style="gap:11px">${o.items.map(x => `<div><div class="row between small" style="margin-bottom:4px"><span class="strong">${esc(x.label)}</span><span class="muted mono">${fmt(x.value)}${x.note ? ' · ' + x.note : ''}</span></div><div class="progress ${x.cls || ''}"><i style="width:${Math.min(100, x.value * 100 / max)}%;${x.color ? 'background:' + x.color : ''}"></i></div></div>`).join('')}</div>`;
    }
  };

  /* ---------- tables & list views ---------- */
  UI.table = (cols, rows, o = {}) => { const lab = cols.map(c => esc(String(c.h).replace(/<[^>]+>/g, ''))); return `<div class="tbl-wrap"><table class="tbl ${o.scroll ? '' : 'stack'}"><thead><tr>${cols.map(c => `<th class="${c.cls || ''}" ${c.w ? `style="width:${c.w}"` : ''}>${c.h}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr ${o.href && o.href(r) ? `class="click" data-href="${o.href(r)}"` : ''}>${cols.map((c, i) => `<td class="${c.cls || ''}" data-label="${lab[i]}">${c.f(r)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length}">${UI.empty(o.empty || 'No records found', o.emptySub || 'Try changing the filters.')}</td></tr>`}</tbody>${o.foot ? `<tfoot><tr>${o.foot}</tr></tfoot>` : ''}</table></div>`; };
  UI.listView = def => {
    const id = def.id; const prev = UI.lv[id]; UI.lv[id] = { def, f: prev ? prev.f : Object.assign({}, def.init || {}), page: 1 };
    const st = UI.lv[id];
    const fh = (def.filters || []).map(f => f.type === 'select' ? `<div class="field"><label>${f.label}</label><select class="input sm" data-lv="${id}" data-k="${f.k}">${UI.opts(f.options, st.f[f.k] || '')}</select></div>` : f.type === 'date' ? `<div class="field"><label>${f.label}</label><input type="date" class="input sm" data-lv="${id}" data-k="${f.k}" value="${esc(st.f[f.k] || '')}"></div>` : `<div class="field search"><label>${f.label}</label><input class="input sm" data-lv="${id}" data-k="${f.k}" placeholder="${esc(f.ph || 'Search…')}" value="${esc(st.f[f.k] || '')}"></div>`).join('');
    return `<div class="card">${def.title ? `<div class="card-h"><div><h3>${def.title}</h3>${def.sub ? `<div class="sub">${def.sub}</div>` : ''}</div><div class="row">${def.actions || ''}${def.csv ? UI.btn('Export CSV', 'lvCsv', { cls: 'sm', icon: 'download', data: { id } }) : ''}${def.print ? UI.btn('Print', 'lvPrint', { cls: 'sm', icon: 'printer', data: { id } }) : ''}</div></div>` : ''}${fh ? `<div class="filters">${fh}</div>` : ''}<div id="lv-${id}">${UI.lvBody(id)}</div></div>`;
  };
  UI.lvRows = id => { const { def, f } = UI.lv[id]; let rows = def.source(); if (def.filter) rows = rows.filter(r => def.filter(r, f)); return rows; };
  UI.lvBody = id => {
    const st = UI.lv[id], def = st.def; const rows = UI.lvRows(id); const ps = def.pageSize || 15; const pages = Math.max(1, Math.ceil(rows.length / ps)); if (st.page > pages) st.page = pages;
    const slice = rows.slice((st.page - 1) * ps, st.page * ps);
    const pg = pages > 1 ? `<div class="pg"><button data-act="lvPage" data-id="${id}" data-p="${st.page - 1}" ${st.page <= 1 ? 'disabled' : ''}>‹</button>${Array.from({ length: pages }, (_, i) => i + 1).filter(p => p === 1 || p === pages || Math.abs(p - st.page) <= 1).map((p, i, a) => (i && p - a[i - 1] > 1 ? '<span style="padding:0 4px">…</span>' : '') + `<button class="${p === st.page ? 'on' : ''}" data-act="lvPage" data-id="${id}" data-p="${p}">${p}</button>`).join('')}<button data-act="lvPage" data-id="${id}" data-p="${st.page + 1}" ${st.page >= pages ? 'disabled' : ''}>›</button></div>` : '';
    return UI.table(def.cols, slice, { href: def.href, empty: def.empty, foot: def.foot && def.foot(rows) }) + `<div class="pager"><span>${rows.length ? `Showing ${(st.page - 1) * ps + 1}–${Math.min(st.page * ps, rows.length)} of ${rows.length}` : '0 results'}${def.note ? ' · ' + def.note(rows) : ''}</span>${pg}</div>`;
  };
  UI.lvRefresh = id => { const el = document.getElementById('lv-' + id); if (el) el.innerHTML = UI.lvBody(id); };
  UI.act.lvPage = t => { const id = t.dataset.id; UI.lv[id].page = +t.dataset.p; UI.lvRefresh(id); };
  const plain = c => String(c).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  UI.act.lvCsv = t => { const id = t.dataset.id, def = UI.lv[id].def; const rows = UI.lvRows(id); UI.csv(def.csv, def.cols.filter(c => c.csv !== false).map(c => c.h.replace(/<[^>]+>/g, '')), rows.map(r => def.cols.filter(c => c.csv !== false).map(c => c.csv ? c.csv(r) : plain(c.f(r))))); };
  UI.act.lvPrint = t => { const id = t.dataset.id, def = UI.lv[id].def; const rows = UI.lvRows(id); const cols = def.cols.filter(c => c.csv !== false); UI.docPreview(def.title || 'Report', UI.docTable(def.title || 'Report', def.sub || '', cols.map(c => c.h.replace(/<[^>]+>/g, '')), rows.map(r => cols.map(c => c.csv ? c.csv(r) : plain(c.f(r)))))); };
  document.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.lv && t.type !== 'date' && t.tagName !== 'SELECT') { const st = UI.lv[t.dataset.lv]; st.f[t.dataset.k] = t.value; st.page = 1; UI.lvRefresh(t.dataset.lv); } else if (t.dataset && t.dataset.on && !['SELECT'].includes(t.tagName) && !['checkbox', 'radio', 'date', 'file', 'time'].includes(t.type)) UI.on[t.dataset.on] && UI.on[t.dataset.on](t, e); });
  document.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.lv && (t.type === 'date' || t.tagName === 'SELECT')) { const st = UI.lv[t.dataset.lv]; st.f[t.dataset.k] = t.value; st.page = 1; UI.lvRefresh(t.dataset.lv); } else if (t.dataset && t.dataset.on && (t.tagName === 'SELECT' || ['checkbox', 'radio', 'date', 'file', 'time'].includes(t.type))) UI.on[t.dataset.on] && UI.on[t.dataset.on](t, e); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]'); if (t) { const fn = UI.act[t.dataset.act]; if (fn) { if (t.tagName !== 'INPUT') e.preventDefault(); fn(t, e); } return; }
    const g = e.target.closest('[data-go]'); if (g) { location.hash = g.dataset.go; return; }
    const tr = e.target.closest('tr[data-href]'); if (tr && !e.target.closest('a,button,input,select,label')) { location.hash = tr.dataset.href; }
  });

  /* ---------- csv / files ---------- */
  UI.csv = (name, headers, rows) => { const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; const txt = '﻿' + [headers].concat(rows).map(r => r.map(q).join(',')).join('\r\n'); UI.download(name.replace(/[^\w\- ]+/g, '') + '.csv', txt, 'text/csv;charset=utf-8'); UI.toast('Exported ' + rows.length + ' rows to CSV', 'ok'); };
  UI.download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  UI.formData = el => { const o = {}; el.querySelectorAll('[name]').forEach(i => { if (i.type === 'checkbox') o[i.name] = i.checked; else if (i.type === 'radio') { if (i.checked) o[i.name] = i.value; } else o[i.name] = i.value; }); return o; };
  UI.readImage = (file, cb, max = 520) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .72)); }; im.src = r.result; }; r.readAsDataURL(file); };

  /* ---------- modal / toast ---------- */
  UI.modal = o => {
    UI.closeModal(); const el = document.createElement('div'); el.className = 'overlay'; el.id = 'modal-root';
    el.innerHTML = `<div class="modal ${o.size || ''}" role="dialog" aria-modal="true"><div class="modal-h"><h3>${o.title}</h3><button class="iconbtn" data-act="closeModal" aria-label="Close">${UI.icon('x', 16)}</button></div><div class="modal-b">${o.body}</div>${o.footer ? `<div class="modal-f">${o.footer}</div>` : ''}</div>`;
    el.addEventListener('mousedown', e => { if (e.target === el && !o.sticky) UI.closeModal(); }); document.body.appendChild(el); document.body.style.overflow = 'hidden';
    const f = el.querySelector('input:not([type=hidden]):not([readonly]),select,textarea'); if (f && !o.noFocus) setTimeout(() => f.focus(), 30); o.onMount && o.onMount(el); return el;
  };
  UI.closeModal = () => { const m = document.getElementById('modal-root'); if (m) m.remove(); document.body.style.overflow = ''; };
  UI.act.closeModal = UI.closeModal;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') UI.closeModal(); });
  UI.confirm = (title, msg, okLabel, cb, danger) => { UI.modal({ title, size: 'sm', body: `<p style="margin:0">${msg}</p>`, footer: `<button class="btn" data-act="closeModal">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cf-ok">${okLabel || 'Confirm'}</button>`, onMount: el => el.querySelector('#cf-ok').onclick = () => { UI.closeModal(); cb(); } }); };
  UI.toast = (msg, type, sub) => { let w = document.querySelector('.toasts'); if (!w) { w = document.createElement('div'); w.className = 'toasts'; document.body.appendChild(w); } const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.innerHTML = `${type === 'wa' ? UI.icon('wa', 18) : type === 'bad' ? UI.icon('alert', 18) : UI.icon('check', 18)}<div><div>${msg}</div>${sub ? `<small>${sub}</small>` : ''}</div>`; w.appendChild(t); setTimeout(() => { t.style.opacity = 0; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, type === 'wa' ? 5200 : 3600); };
  UI.waToast = n => { if (!n) return; if (n.status === 'Delivered') UI.toast('WhatsApp sent to ' + esc(n.to), 'wa', esc(n.message.length > 90 ? n.message.slice(0, 90) + '…' : n.message)); else UI.toast('WhatsApp notification not sent', '', 'This alert type is disabled in notification settings.'); };

  /* ---------- printable documents ---------- */
  const DOC_CSS = `*{box-sizing:border-box}body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#1a2333;margin:0;padding:22px;font-size:13px;background:#fff}h1,h2,h3{font-family:'Source Serif 4',Georgia,serif;margin:0;color:#0e2552}
  .sheet{max-width:780px;margin:0 auto;border:2px solid #143373;padding:26px;position:relative}.sheet.plain{border:0;padding:0;max-width:none}
  .hd{display:flex;align-items:center;gap:16px;border-bottom:3px double #e0245e;padding-bottom:14px;margin-bottom:14px}.hd .nm{flex:1}.hd h1{font-size:23px}.hd small{color:#5b6679;display:block;font-size:11.5px;line-height:1.5}
  .ttl{background:#143373;color:#fff;text-align:center;padding:6px;letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:600;margin:12px 0}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #cfd6e3;padding:7px 9px;text-align:left}th{background:#eef2f9;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:#33405a}td.r,th.r{text-align:right}tfoot td{font-weight:700;background:#f6f8fc}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin:8px 0 14px}.meta div{display:flex;gap:8px}.meta b{min-width:130px;color:#5b6679;font-weight:500}
  .sig{display:flex;justify-content:space-between;margin-top:46px;font-size:12px}.sig div{border-top:1px solid #1a2333;padding-top:5px;min-width:170px;text-align:center}
  .stamp{position:absolute;right:34px;top:150px;border:3px solid #1b7f57;color:#1b7f57;padding:3px 16px;font-weight:800;letter-spacing:.2em;transform:rotate(-10deg);opacity:.75;font-size:20px;border-radius:6px}
  .photo{width:92px;height:108px;border:1px solid #cfd6e3;display:grid;place-items:center;font-size:30px;font-weight:700;color:#fff;border-radius:4px}.foot{margin-top:18px;font-size:11px;color:#5b6679;border-top:1px solid #e3e8f0;padding-top:8px;text-align:center}
  ol{margin:6px 0 0 18px;padding:0}.big{font-size:20px;font-weight:700}.pill{display:inline-block;padding:2px 10px;border-radius:12px;font-weight:700;font-size:12px}.ok{background:#e5f4ec;color:#1b7f57}.bad{background:#fbe7e5;color:#b3261e}
  @media print{body{padding:0}.sheet{border-width:2px}.pb{page-break-after:always}}`;
  UI.DOC_CSS = DOC_CSS;
  UI.docHeader = (sub) => `<div class="hd"><img src="${C.LOGO_DATA}" style="height:64px;width:auto" alt=""><div class="nm"><h1>${esc(C.SCHOOL.name)}</h1><small>${esc(C.SCHOOL.address)}<br>${esc(C.SCHOOL.phone)} · ${esc(C.SCHOOL.email)}${sub ? '<br>' + sub : ''}</small></div></div>`;
  UI.docFull = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${DOC_CSS}</style></head><body>${body}</body></html>`;
  UI.docPreview = (title, body, filename) => {
    const html = UI.docFull(title, body);
    UI.modal({ title: esc(title), size: 'xl', sticky: false, body: `<iframe id="docframe" style="width:100%;height:68vh;border:1px solid var(--line);border-radius:8px;background:#fff" srcdoc="${html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`, footer: `<button class="btn" data-act="closeModal">Close</button><button class="btn" id="doc-dl">${UI.icon('download', 15)} Download</button><button class="btn primary" id="doc-pr">${UI.icon('printer', 15)} Print / Save as PDF</button>`, noFocus: true, onMount: el => { el.querySelector('#doc-pr').onclick = () => { const f = document.getElementById('docframe'); f.contentWindow.focus(); f.contentWindow.print(); }; el.querySelector('#doc-dl').onclick = () => UI.download((filename || title).replace(/[^\w\- ]+/g, '') + '.html', html, 'text/html'); } });
  };
  UI.docTable = (title, sub, headers, rows) => `<div class="sheet plain">${UI.docHeader()}<h2 style="margin:6px 0 2px">${esc(title)}</h2><div style="color:#5b6679;margin-bottom:10px">${esc(sub || '')} · Generated ${C.fmtStamp(C.nowIso())}</div><table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="foot">${esc(C.SCHOOL.name)} · Confidential – for authorised use only</div></div>`;

  G.UI = UI;
  G.App = G.App || { u: null, route: { page: 'dashboard', arg: null }, _st: {}, st(k) { return this._st[k] || (this._st[k] = {}); } };
})(window);
