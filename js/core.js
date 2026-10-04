/* core.js — shared constants & helpers (dates, money, ids, grading) */
(function (G) {
  'use strict';
  const C = {};
  const pad = n => String(n).padStart(2, '0');
  C.pad = pad;
  C.ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  C.pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  C.addDays = (s, n) => { const d = C.pd(s); d.setDate(d.getDate() + n); return C.ymd(d); };
  C.dow = s => (C.pd(s).getDay() + 6) % 7;            // Monday = 0 … Sunday = 6
  C.today = () => C.ymd(new Date());
  C.nowIso = () => { const d = new Date(); return C.ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  C.monthKey = s => s.slice(0, 7);
  C.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  C.DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  C.DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  C.monthLabel = k => { const [y, m] = k.split('-').map(Number); return C.MONTHS[m - 1].slice(0, 3) + ' ' + String(y).slice(2); };
  C.monthLong = k => { const [y, m] = k.split('-').map(Number); return C.MONTHS[m - 1] + ' ' + y; };
  C.fmtDate = s => s ? C.pd(s.slice(0, 10)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  C.fmtDay = s => s ? C.pd(s.slice(0, 10)).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : '—';
  C.fmtDateLong = s => C.pd(s.slice(0, 10)).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  C.fmtTime = iso => { if (!iso || iso.length < 16) return ''; let h = +iso.slice(11, 13); const m = iso.slice(14, 16); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + m + ' ' + ap; };
  C.fmtStamp = iso => C.fmtDate(iso) + ', ' + C.fmtTime(iso);
  C.t12 = t => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + pad(m) + ' ' + ap; };
  C.inr = n => '₹' + Math.round(n || 0).toLocaleString('en-IN');
  C.inrK = n => { n = n || 0; if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'; if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L'; if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'K'; return '₹' + Math.round(n); };
  C.num = n => Math.round(n || 0).toLocaleString('en-IN');
  C.pct = (a, b, d = 1) => b ? +(a * 100 / b).toFixed(d) : 0;
  C.phone = p => p ? '+91 ' + p.slice(0, 5) + ' ' + p.slice(5) : '—';
  C.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.initials = n => n.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  C.sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);
  C.avg = (a, f) => a.length ? C.sum(a, f) / a.length : 0;
  C.uid = p => p + Math.random().toString(36).slice(2, 8);
  C.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // Grading scale (percentage → grade)
  C.gradeOf = p => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C' : p >= 35 ? 'D' : 'E';

  C.SCHOOL = {
    name: "Rainbow's English Medium High School", short: 'REMHS', tagline: 'Excellence in Learning',
    affiliation: 'Recognised by the State Board', est: 2002, chairman: 'M. Mohan Reddy', chairmanQual: 'M.Sc., B.Ed., M.Phil.', principal: 'M. Sujana Sree',
    address: 'Kanipakam Road, Near Bans Hotel, Chittoor, Andhra Pradesh – 517004',
    phone: '+91 94416 43493', mobile: '+91 70934 28904', email: 'info@rainbowsschool.in', admissions: 'info@rainbowsschool.in',
    hours: 'Mon–Sat, 8:30 AM – 4:30 PM', logo: 'images/logo.jpg'
  };
  C.LOGO_DATA = 'data:image/webp;base64,UklGRpoMAABXRUJQVlA4WAoAAAAIAAAAlgAATgAAVlA4IPYLAABQLQCdASqXAE8APk0gjEQioiEXWb8YKATEsgBhs+ro8kx2R/F/jDkKq08qnnfyWeqn9Bf8n3BP4J/XP1u6/Hm386rziN/E6F//q+0p+y37SeyrWMulH5hIPOM+zT7n10/z/fD8kdQL2PvTGYvRRmg+CvKs8sDw5vOfYD/MH/P/vHvF/4n/t86n7X/q/R+65Lf6IuXFl/Wdry/bw4fmJ1mz+C9kvzKOCETFzqK0fF2O9adZT8cLVa6HVD2D8DMSQNVUjf98ELfe3fV1QIts2D6dWfXpPrt0kWo3EzXTZT+6/udg+nTczoampggbPsbBH8pcOndHKA5IllrxeUccDFiVZGt3gP95swfliDOF4FJO09eVoFSf+N5TtyXCIk7XPpT/nkxatGCYuZnKme3pP/4iQDXYsjDZ1JSXPpQv1K0LakivzruI8QVOL/tDjS9dLO1ww3f+82jA9wmF5DZ6BGBa0FUANYRJPMcVLsVnCQeMIQnuYAD+/vPH8eo+Ao+gT/hCTkv1zxD7kve8Ccy1Lk2jti6PtjTZOjLf2SnYPsFeGeoPWamwLlnfwBIy7KzKldZKFVRIKvuIG8v++O92JW1gmXyutkDLSDFEjoBcYHdY7XXF6gKRmzoO3D+gxOw0qKBbz4yc7iAk92gJU5Oxh1M1GFqZ7f9mAsAuI/RkeC54J7VlDenPx1eeh4WouL7Vxwfa8xdUG9gac/eML/JTxLXKj2MCfv7pmgUsCTjnnfmnv3nr8gxH+VWojBU0xkmFyHdp4pvOs3L3T98Q1SbEwm88WVIkg/wjOvaz2f0Otvm3cNyNEljv+lGilPSvM/BX2DH/Pu/55e+mZiXUVP88HIKs+24RyeWqyBG8A4z5WwOo6HMxH0EYjXP5Hfidb+Q7S36mg8KOdkso2SwkDx34/5FYmoAWVL6ujt9OpyQneCuEPvzmfAE468p8a+lTWrtUJaesOi+07RwEVCp8d6QS+6t3y2kxwtWv1iwy7gq3Cnj/EFD/jvUNl7h9f0hUmR5EUbpRuwSCY9QYN1md5QDPPzJDGp3oIAxeJ7zwG+v8T8MlI4FZj6LEYYIIfbX0gAj6XgngmnYOyHycdFnm77c3AO10iQr5OIcfykLyKh6Qfekk15rIeg9DPFrglMjU8jd7ke9pJNcWrTDPz8bORaltzdrHCQ067pvhse9+bhf45KGhkHiyiCqSj6pfPZ4b8pY90hQynOYyfNnQ/SW2ssjGVlRLseVzBRDMHLe5G3JpfR4ra9ZeVfeRgkaQM9QfzlrfEETngZ+UJNPZpn+WXq0VdlWZ/PNQfElVlejXLgCGEycz96KPPYVC8mxvkOPE6JT2eYWdcEEtCuFk+Gu2e4wVCj6lS2yOZRMQvgVBDWAZN8NF8bxMl1o7yN3ob/ZmsrvBXNnyDvNPEf94SGtxfEcjGF3xgQD13cmcLGBtbezrO2yAR/v3hT3OoNgTQYae/3GSpVC1RoEmwHCwYMk0gtO55ua9PRXdsyrxsGbHDeyJk5bf2L7S54EkK/m1n3Zp3LHAEVQ4mfDuN9QVyfkadHW518mCDnuVSk00VgRrA+Z3l+VE1E+OBVSTISW2IxJn7bpaLSRasP9y/8Fqec2uuwPuOQKqi5QAthA+Jd6mzocCiiV7xRMa5kdNZTMJe3GBYuLl90UUb85hNhlYsZUZO+f7kyM/DaEiKRlP39UncD4AODwHZiOoR2Hy1E1xtAJcZNi/9utgFLJ89UYNhw2ea4J3M+cRMwGutpqeshXO6r6ikoPDGMZYzL61n1ghO6DNgGHthFvTxo3bjapNMi60BdLcC0AFygBpLpx/A/cGZkdHCUVTJK3DbC7b1mWabF536dGFbJRPzQdyWx+RD0ZZ0F+fck3aa9csrpgEjqNohSJ5/59cADL83b6rhouH4R8bOa9RnmDOHzy9JEgSbPu9FX5HMUzFarNXvF5vSmvPF3iqdhQJ2gJJxeayoOfBd+HNjcfkpdOZ/hdT0uhKfH9EFTx2g2RAD4TYFR6hpdwF73ISPDHKFQmLL/GzI3nr2+LB5aqw/uYm1LxR65JTq3LDN0P9+/zq4iTQHCSB2+I3IndLiukb/YD0jprwGmsjt8fn3jCI5+L6Vd/SQ4RWdvgFo8E9c4J38wrmgFeZbOCISiG3WbshfDlEjSgPTauuOru6NV2jeIWrEmDzZHS4pMALdSXLgRbdSdNFLGZrDNUzcUmC92ajP0Te3pvSnb7qOU/cnTQcHM7/inmVL3j27OmZVF2GknkCd8mmBbwaDLJmdnsSxmFQDCsonGfGrLtj+C/+cuxraTQEZ47tKXAbvSNQkx7V/ap62BUGN53/8KY95xI+yyPaXytH1FoVpeAdQ/QEQIysIeBKJBi2WVvm1e8RDYif6ztxeqxP+BMyQGpD/pnT57S9vmHMp5lxF9cinDKQTOW3PCCvbOa8/xKTl/128dipswb1rhtTSpBtBSPMG/PtZ/CEyq8KHUNg/Xi668FMnLWeCitBPi2LhX9QN8crK86Y9i9BDw8VpSzlC46+xqYN2cOCMq71E1sVhk6Km6DzAbLvf4QpjHTKn1H178BXT/472OWk8z3MtbUIzYIgLs5flHbSYY1jyEFpu5kdHxv/aJcc89ySdLABtaD7PItz6kxFDSHBvKqiddC3k9GlLJ/3NDUZtovkb/gwzTKye5t4tW0EFgPr2+9r8Z9jcd80twoaNOl1HupNhUJXKyK+sLQ6Or16E0LyxqNUQD35zCfYnD6UBAz/JYSVtznPH9nKPZvkaA/KZOWCVszZaR4jhFlJ1OKN7eIIpOX+9tKQ4cet3QlETtRYwhArVuLtYARup5uy5XaC7kB8H/3n8KGPGKEvy5L2mwJjcTmFb6pNEL6Y+dy7HVhTG2nX4hjz1+FXPNYO+/+cwKAkS+nJKbIrXrVHW+Ag0TbcMsfZIeT+Hq9UuZ1ia2mjgAEoo7aqVC1X31sPhl7ER5MUH5hgLXiM9XB3+28dNkr/nTGCT3HGonYMLtl9yeuXT4KX/i0sR/0pN94m6kg771SA9PnerEwTYyJZeM8QvafRKKepOt/kUx7mce5P15LuzbD2j6HcsSZtyATQRvqF9ci3rcOUCIHYBp7AbEH2BjE3wXBi83LtTHb+td3K/ge9s40Lndr14oX+4HGYdegO5Ea5lSuAwkidSmAJ1TLFzG7O5ykEbESGeP6VgZ2ZBZ5gNWA8BUJf3FlXWouIHhO4iZr3QmRYEk+/UxEPaIsMZe2ZTOv9GQ42xXB/ckBMRlx7tHIfhWljccvBfnkxoNKPh8z1IValP/Ya0SaqrIoauLgtD9nNX3j+cU/cUvIkymseE+yd9juRx6x398fAkfsDRUWUQBtu1YVxLrlh8lN64DCMaf1mdrR7QV3ftFJ9UXnnsSymDF231Qf2idYOeFdn5GhyTHRefKP0zYv6wXKF153agzcLIvFU58n5RjzCgyJ79SOHDDlWLjQoBYd+wNFLG+Ce5fPGf7d20672+CCnua8hs8mxSy25bxadunOO6yav6avet/n/WcCqPp4hCTCRd90peT66v5TuZhBe1vBuYTGADmYO5rwQyIViCtgcvVZ5BM6aUR5alm4JnTGvkrSJePqXAtbVbPXjkBl7jmuIO6kkayHSwSrpCkNxi+BQs0lM92zqg6y3ISVVxkHdalbgfSNr1seb5vbsWsGbD1Dwvvlxs641fMnLdMf0v7TngkXiszSj1eyHcK4T9bXyvuTFRKVvsvXebhukKxCQyXJU4YqroW+TjT1ofeiyNZSmLoPjbo8FLgntmu9YFz7nKlvhKzKPdXAGRJa1/kzBp/9SMcXg9O4r0fxzQcevLHgV62VSzILbEZDp42QBevxH6gV5qVo2/DghBYsIVzUlwryesEA9uPeEpGMuXqUFgsn4mVyFZ0NnIDELOwYf6SJ3p0/RFoB4/uCmuBPECYqn00vF2n8kAi229UsANRDmWNL507GNkGQqGLdSF/fBFA8j2mtzvHYu4lVJ3AdPPOB1B2PGIRkRXsvww1b8IDTdqCfiyzF4Bssz1+fahBtEGMYRzskNx6stoUb1UGAqIEHIAA/DC7dLS0IAAEVYSUZ+AAAARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAJegAwAEAAAAAQAAAE8AAAAA';

  C.SUBJECTS = [
    { name: 'English', per: 6, dept: 'English', exam: true },
    { name: 'Mathematics', per: 7, dept: 'Mathematics', exam: true },
    { name: 'Telugu', per: 6, dept: 'Languages', exam: true },
    { name: 'Hindi', per: 4, dept: 'Languages', exam: true },
    { name: 'Science', per: 6, dept: 'Science', exam: true },
    { name: 'Social Studies', per: 5, dept: 'Social Studies', exam: true },
    { name: 'Computer Science', per: 3, dept: 'Computer Science', exam: true },
    { name: 'Physical Education', per: 3, dept: 'Sports', exam: false },
    { name: 'Art & Craft', per: 1, dept: 'Arts', exam: false },
    { name: 'Moral Science', per: 1, dept: 'Arts', exam: false }
  ];
  C.EXAM_SUBJECTS = C.SUBJECTS.filter(s => s.exam).map(s => s.name);

  C.PERIODS = [
    { p: 1, s: '08:30', e: '09:15' }, { p: 2, s: '09:15', e: '10:00' },
    { brk: 'Short Break', s: '10:00', e: '10:20' },
    { p: 3, s: '10:20', e: '11:05' }, { p: 4, s: '11:05', e: '11:50' },
    { brk: 'Lunch Break', s: '11:50', e: '12:30' },
    { p: 5, s: '12:30', e: '13:15' }, { p: 6, s: '13:15', e: '14:00' }, { p: 7, s: '14:00', e: '14:45' }
  ];
  C.PERIOD_NUMS = [1, 2, 3, 4, 5, 6, 7];
  C.periodInfo = n => C.PERIODS.find(x => x.p === n);
  C.currentPeriod = () => {
    const d = new Date(); const t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    const x = C.PERIODS.find(p => t >= p.s && t < p.e); return x || null;
  };

  C.ROLES = {
    principal: 'Principal', dean: 'Dean of Academics', accountant: 'Accountant', teacher: 'Teacher',
    student: 'Student', parent: 'Parent', ops: 'Operations Staff', admin: 'System Administrator'
  };

  G.C = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
