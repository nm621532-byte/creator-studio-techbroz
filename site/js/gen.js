/* Creator Studio — pure generators (rule-based templates, no AI, no network).
 * Works in the browser (window.Gen) and in Node (module.exports). */
(function (g) {
  'use strict';

  var CHANNEL_TAG = 'techbrozdeveloper';
  var EDITOR_LINK = 'https://techbroz-code.sites.tab.bot/';
  var EDITOR_LINE = '\uD83D\uDCBB Code khud chala ke dekho (free editor): ' + EDITOR_LINK;

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clean(s) {
    return String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  }

  function slug(s) {
    return clean(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function clipWords(text, max) {
    var words = clean(text).split(' ');
    while (words.length && words.join(' ').length > max) words.pop();
    return words.join(' ');
  }

  /* ---------- 1. Titles, description, tags, hashtags ---------- */

  var LANGUAGES = ['HTML CSS JS', 'Python', 'Java', 'C', 'C++', 'SQL', 'React', 'Node.js', 'Git & GitHub', 'Website'];

  var TITLE_TEMPLATES = [
    function (p) { return p + ' kaise banaye? Full Project Hindi mein'; },
    function (p) { return p + ' Hindi mein seekho \uD83D\uDD25 Step by Step'; },
    function (p) { return p + ' kaise banaye (Beginners ke liye)'; },
    function (p) { return p + ' Tutorial Hindi 2026 | Full Project'; },
    function (p) { return p + ' in Hindi | Live Code Dekho'; },
    function (p) { return p + ' kaise banate hain? 10 Min Mein'; },
    function (p) { return p + ' for Beginners | Hindi Tutorial'; },
    function (p) { return p + ' ka Full Course Hindi mein \uD83D\uDE80'; },
    function (p) { return p + ' kaise karein? Real Project Hindi'; },
    function (p) { return p + ' Hindi Mein: Zero se Hero Tak'; },
    function (p) { return p + ' Hindi | Code Likho Aur Chalao'; },
    function (p) { return p + ' sikho Hindi mein (Free Editor)'; }
  ];

  function phraseFor(topic, lang) {
    var t = clean(topic);
    var l = clean(lang);
    if (!t) return '';
    if (l && t.toLowerCase().indexOf(l.toLowerCase().split(' ')[0]) === 0) return t;
    return l ? l + ' ' + t : t;
  }

  function makeTitles(topic, lang) {
    var phrase = phraseFor(topic, lang);
    if (!phrase) return { ok: false, error: 'Topic likho (jaise "login form" ya "gym website").', titles: [] };
    var out = [];
    var seen = {};
    TITLE_TEMPLATES.forEach(function (tpl) {
      var p = phrase;
      var title = tpl(p);
      // keep the search phrase first and the whole title under 60 characters
      while (title.length > 60 && p.indexOf(' ') > -1) {
        p = p.slice(0, p.lastIndexOf(' '));
        title = tpl(p);
      }
      if (title.length > 60) return;
      var key = title.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push(title);
    });
    return { ok: out.length >= 10, phrase: phrase, titles: out.slice(0, 10) };
  }

  function makeDescription(topic, lang) {
    var phrase = phraseFor(topic, lang);
    var english = clean(topic) + ' in ' + clean(lang || 'English');
    var line1 = phrase + ' is video mein step by step samjhaya gaya hai, beginners ke liye simple Hindi mein.';
    var lines = [
      line1,
      EDITOR_LINE,
      '',
      'Is video mein: ' + clean(topic) + ' ka poora process, code ka live output, aur common galtiyan.',
      'Search karein: ' + phrase + ' in hindi, ' + english + ', ' + clean(lang) + ' for beginners',
      '',
      '#' + (slug(lang) || 'coding') + ' #codinginhindi #' + CHANNEL_TAG
    ];
    return lines.join('\n');
  }

  function makeHashtags(lang) {
    return ['#' + (slug(lang) || 'coding'), '#codinginhindi', '#' + CHANNEL_TAG];
  }

  function makeTags(topic, lang) {
    var phrase = phraseFor(topic, lang);
    var t = clean(topic);
    var l = clean(lang) || 'coding';
    var raw = [
      phrase,
      phrase + ' in hindi',
      phrase + ' tutorial',
      phrase + ' for beginners',
      t + ' in english',
      l + ' tutorial hindi',
      l + ' for beginners',
      l + ' project',
      'learn ' + l + ' in hindi',
      phrase + ' 2026',
      'coding in hindi',
      'web development hindi',
      'tech bro z coding',
      CHANNEL_TAG,
      'hindi programming tutorial',
      'free coding course'
    ];
    var seen = {};
    var tags = [];
    raw.forEach(function (x) {
      var v = clean(x).toLowerCase();
      if (!v || v.length > 30 || seen[v]) return;
      seen[v] = true;
      tags.push(v);
    });
    return tags.slice(0, 15);
  }

  /* ---------- 2. 30-day content planner ---------- */

  var IDEAS = {
    coding: {
      short: [
        'HTML se pehli website 30 sec mein', 'CSS Flexbox ek line mein samjho', 'JavaScript ka ek trick jo sab bhool jaate hain',
        'Python mein list ka sabse useful function', 'Git commit ka asli matlab', 'Button hover effect sirf 3 line CSS mein',
        'Ek bug jo 90% beginners karte hain', 'console.log se debugging ka asli tarika', 'Python loop vs list comprehension',
        'CSS Grid ka sabse easy example', 'Java ka pehla program, screen pe output', 'SQL SELECT query 20 sec mein',
        'JavaScript array ke 3 methods', 'Responsive navbar ka ek trick', 'C mein pointer ek example se',
        'GitHub Pages par website free mein kaise chalaye', 'Dark mode toggle in 30 seconds', 'Python input() ka mistake',
        'Code editor mein website live kaise karein', 'CSS variables ka asli fayda', 'JavaScript promise ek analogy se',
        'Form validation ka sabse chhota code', 'Python dictionary ka ek kaam ka trick', 'HTML semantic tags kyun zaroori hain',
        'Ek line mein recursion', 'Loading spinner sirf CSS se', 'Git branch banana aur merge karna', 'Card hover shadow effect',
        'React useState ek simple example se', 'Node.js server 5 line mein'
      ],
      long: [
        'Full login form HTML CSS JS se (validation ke saath)', 'Python to-do app terminal mein, Hindi mein', 'Portfolio website from zero, responsive',
        'Java calculator banaye step by step', 'SQL se library management database', 'C mein number guessing game',
        'JavaScript quiz app with score', 'Git aur GitHub full course for beginners', 'React counter app se React seekho',
        'Node.js REST API basic', 'Restaurant menu website with cart count', 'Python weather checker (API ke saath)',
        'Dark mode + light mode website project', 'C++ bank account program', 'Blog website HTML CSS JS from scratch',
        'JavaScript image slider from zero', 'Python expense tracker with file save', 'SQL join ek real example se',
        'Responsive landing page from scratch', 'Tic tac toe in JavaScript', 'Java OOP ek game se samjho',
        'Gym website with pricing section', 'Notes app with localStorage', 'Python web scraping basics',
        'Typing speed test in JavaScript', 'TypeScript kyun use karein? Practical demo', 'Chat UI design in HTML CSS',
        'Full stack mini project Node + HTML', 'Coding interview ke 5 basic questions Python mein', 'Mini e-commerce product page'
      ]
    },
    shop: {
      short: [
        'Dukan ka naam aur logo ek screen mein', 'Aaj ka naya product, 15 sec mein', 'Customer ka sawal, aapka jawab',
        'Dukan ke andar ka ek kona', 'Packing ka asli process', 'Best seller product ka review in 20 sec',
        'Ek product ki kahani: kaise banta hai', 'Mere shop ka sabse sasta product', 'Kaam se pehle ki subah ki routine',
        'Customer review reaction', 'Naya stock aaya, dekho kya hai', 'Ek galti jo maine shop mein ki',
        'Price ka raaz: kyun ye itna sasta hai', 'Shop ka pehla din vs aaj', 'Gift pack kaise banta hai',
        'Ek product 3 tarike se use karo', 'Mera favourite product kyun', 'Delivery se pehle ka check',
        'Shop kholne ka time: 5 cheezein', 'Customer ki sabse badi demand', 'Diwali / festival special offer teaser',
        'Dukan ki dhoop-chhaon ek shot mein', 'Ek minute mein shop tour', 'Naya colour variant dikhao',
        'Shop ke liye ek naya idea', 'Kaunsa product aapko chahiye? Poll', 'Stock khatam hone se pehle dekho',
        'Ek cheez jo mujhe sabse achhi lagti hai', 'Packing with music, ASMR style', 'Pichhle hafte ki sabse badi seekh'
      ],
      long: [
        'Shop kaise shuru kiya: pehle din se aaj tak', 'Product photography phone se kaise karein', 'Online shop ka budget kitna hota hai',
        'Instagram se customers kaise laayein (asli tarika)', 'Dukan ki pricing kaise decide ki', 'Packing aur delivery ka poora system',
        'Customer review kaise maange', 'Festival season ka plan banaya', 'Shop ka 30 din ka content plan',
        'Ek product ka full launch plan', 'Suppliers kaise dhoondhe', 'Shop ka stock kaise track karte hain',
        'WhatsApp se orders kaise lete hain', 'Cash flow simple tarike se samjho', 'Shop ka naya look: 1 din mein makeover',
        'Customers ke 5 sawal aur jawab', 'Shop ke liye website kyun zaroori hai', 'Discount ka asar: real numbers',
        'Ek hafte ka sales report', 'Shop ka asli kharcha, transparent', 'Reels aur Shorts se sales kaise badhayi',
        'Kam budget mein shop ka setup', 'Return policy kaise banaye', 'Local market se bulk kaise kharidein',
        'Ek customer ki poori kahani', 'Shop ke liye Google Maps listing', 'Packing material ka cost comparison',
        'Naye product ki testing: sach ya jhooth', 'Dukan ka QR code payment setup', 'Shop ke 1 saal ka recap'
      ]
    }
  };

  function makePlan(niche, startISO, days) {
    var n = IDEAS[niche] ? niche : 'coding';
    var total = days || 30;
    var rnd = mulberry32(hashStr(n + '|plan-v1'));
    var shorts = shuffle(IDEAS[n].short, rnd);
    var longs = shuffle(IDEAS[n].long, rnd);
    var start = startISO ? new Date(startISO + 'T00:00:00') : new Date();
    var plan = [];
    var si = 0, li = 0;
    for (var d = 1; d <= total; d++) {
      var date = new Date(start.getTime());
      date.setDate(start.getDate() + d - 1);
      var iso = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      // one day in seven is a rest day for long videos: six long videos a week
      var hasLong = d % 7 !== 0;
      plan.push({
        day: d,
        date: iso,
        short: shorts[si % shorts.length],
        long: hasLong ? longs[li++ % longs.length] : null
      });
      si++;
    }
    return plan;
  }

  function planToText(plan, niche) {
    var lines = ['Creator Studio — 30-day plan (' + (niche === 'shop' ? 'Shop' : 'Coding') + ')', ''];
    plan.forEach(function (row) {
      lines.push('Day ' + row.day + ' · ' + row.date);
      lines.push('  Short: ' + row.short);
      lines.push('  Long:  ' + (row.long || 'Rest (no long video)'));
    });
    return lines.join('\n');
  }

  /* ---------- 3. Short script (25 seconds) ---------- */

  var HOOKS = [
    function (t) { return 'Ruko! ' + t + ' sirf 30 second mein, dekho.'; },
    function (t) { return t + ' karte hue ye galti 90% log karte hain.'; },
    function (t) { return 'Kya aapko pata hai ' + t + ' itna easy hai?'; }
  ];
  var PAYOFFS = [
    function (t) { return 'Bas itna karna hai: ' + t + ' ka pehla step, aur ye dekho — ho gaya! ✅'; },
    function (t) { return 'Result? Ek hi baar mein ' + t + ' chal gaya, bina tension ke.'; },
    function (t) { return 'Dekho, screen pe output aa gaya. Simple hai na?'; }
  ];
  var CTAS = [
    function () { return 'Aisa aur dekhna hai to follow karo, aur comment mein batao next kya chahiye.'; },
    function () { return 'Code khud chala ke dekho, link description mein hai. Share zaroor karo.'; },
    function () { return 'Agli short mein poora project dikhaunga, follow karte raho.'; }
  ];

  function makeScript(topic, variant) {
    var t = clean(topic);
    if (!t) return { ok: false, error: 'Topic likho (jaise "CSS flexbox").' };
    var v = Math.abs(variant || 0);
    var hook = HOOKS[v % HOOKS.length](t);
    var payoff = PAYOFFS[v % PAYOFFS.length](t);
    var cta = CTAS[v % CTAS.length]();
    var problem = t + ' mein problem ye hai ki log shuru hi nahi kar paate. Ek line mein solve karte hain.';
    var demo = 'Step ek, step do, step teen. Har step ke baad output dekho.';
    var segments = [
      { label: 'Hook', start: 0, end: 3, text: hook },
      { label: 'Problem', start: 3, end: 7, text: problem },
      { label: 'Demo', start: 7, end: 19, text: demo },
      { label: 'Payoff', start: 19, end: 22, text: payoff },
      { label: 'CTA', start: 22, end: 25, text: cta }
    ];
    var words = segments.map(function (s) { return s.text; }).join(' ').split(/\s+/).filter(Boolean).length;
    var seconds = Math.round(words / 2.6);
    return { ok: true, segments: segments, words: words, estSeconds: seconds, text: segments.map(function (s) { return s.text; }).join('\n\n') };
  }

  /* ---------- 4. Channel checklist (from the channel SEO rules) ---------- */

  var CHECKLIST = [
    { group: 'SEO', items: [
      ['seo-phrase', 'Title ke pehle 3-5 shabd mein main search phrase'],
      ['seo-len', 'Title 60 characters se chhota, emoji 1 se zyada nahi'],
      ['seo-desc', 'Description ki pehli line mein main phrase'],
      ['seo-editor', 'Description line 2 mein free editor ka link'],
      ['seo-tags', 'Tags 12-15, pehla tag exact search phrase'],
      ['seo-hash', 'Hashtags 3-5 (Shorts mein #shorts)']
    ] },
    { group: 'Thumbnail', items: [
      ['th-words', 'Sirf 3-4 bade shabd, ek hi colour'],
      ['th-contrast', 'Dark background par yellow ya white (high contrast)'],
      ['th-result', 'Result ki photo ya code bade size mein'],
      ['th-phone', 'Chhote phone screen par bhi readable']
    ] },
    { group: 'Shorts', items: [
      ['sh-hook', 'Pehle 1 second mein hook, payoff dikhe'],
      ['sh-len', '20-35 second, 9:16 vertical (1080x1920)'],
      ['sh-comment', 'Last mein ek comment wala sawal'],
      ['sh-repo', 'Code ki repo GitHub par public, link description mein']
    ] },
    { group: 'Routine', items: [
      ['rt-pin', 'Comment pin karo aur reply karo'],
      ['rt-cross', 'Same video Instagram aur Facebook par bhi'],
      ['rt-check', 'Upload se pehle ek baar phone par preview dekho']
    ] }
  ];

  var api = {
    LANGUAGES: LANGUAGES,
    EDITOR_LINK: EDITOR_LINK,
    EDITOR_LINE: EDITOR_LINE,
    makeTitles: makeTitles,
    makeDescription: makeDescription,
    makeHashtags: makeHashtags,
    makeTags: makeTags,
    makePlan: makePlan,
    planToText: planToText,
    makeScript: makeScript,
    CHECKLIST: CHECKLIST,
    IDEAS: IDEAS,
    mulberry32: mulberry32,
    hashStr: hashStr,
    clipWords: clipWords
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else g.Gen = api;
})(typeof self !== 'undefined' ? self : this);
