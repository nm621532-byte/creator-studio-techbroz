/* Creator Studio UI: hash routing, tabs, storage, copy, install, service worker. */
(function () {
  'use strict';
  var Gen = window.Gen, Thumb = window.Thumb;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('cs.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cs.' + k, JSON.stringify(v)); } catch (e) { /* storage full or blocked: keep working */ } }
  };

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function copyText(text, label) {
    var done = function () { toast((label || 'Text') + ' copy ho gaya'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------- routing ---------- */
  var VIEWS = { '': 'view-home', '/': 'view-home', '/thumb': 'view-thumb', '/titles': 'view-titles', '/plan': 'view-plan', '/script': 'view-script', '/check': 'view-check' };

  function route() {
    var key = (location.hash || '#/').replace(/^#/, '') || '/';
    var id = VIEWS[key] || 'view-home';
    $$('.view').forEach(function (v) { v.hidden = v.id !== id; });
    var view = document.getElementById(id);
    var isHome = id === 'view-home';
    $('#screenTitle').textContent = isHome ? 'Creator Studio' : view.getAttribute('data-title');
    $('#back').hidden = isHome;
    document.title = isHome ? 'Creator Studio by Tab' : view.getAttribute('data-title') + ' · Creator Studio';
    window.scrollTo(0, 0);
    if (id === 'view-thumb') renderThumb();
  }

  $('#back').addEventListener('click', function () {
    if (history.length > 1) history.back(); else location.hash = '#/';
  });

  /* ---------- install prompt ---------- */
  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
    $('#installBtn').hidden = false;
  });
  $('#installBtn').addEventListener('click', function () {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall.userChoice.finally(function () { deferredInstall = null; $('#installBtn').hidden = true; });
  });
  window.addEventListener('appinstalled', function () { $('#installBtn').hidden = true; });

  /* ---------- thumbnail ---------- */
  var THUMB_COLORS = [
    { name: 'Pీla', hex: '#FFE03A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Cyan', hex: '#3FE0FF' },
    { name: 'Red', hex: '#FF4D4D' }
  ];
  var FONTS = [['bold', 'Bold'], ['condensed', 'Condensed'], ['serif', 'Serif'], ['mono', 'Mono']];
  var POS = [['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']];
  var ALIGN = [['left', 'Left'], ['center', 'Center'], ['right', 'Right']];
  var EMOJIS = ['🔥', '💻', '🚀', '⚡'];
  var PRESETS = [
    { name: 'Yellow pop', color: '#FFE03A', position: 'bottom', align: 'left', font: 'bold', glow: false, arrow: true, gradient: 'sunset' },
    { name: 'Clean white', color: '#FFFFFF', position: 'middle', align: 'center', font: 'bold', glow: false, arrow: false, gradient: 'ink' },
    { name: 'Cyan tech', color: '#3FE0FF', position: 'middle', align: 'left', font: 'mono', glow: true, arrow: false, gradient: 'night' },
    { name: 'Red alert', color: '#FF4D4D', position: 'top', align: 'right', font: 'condensed', glow: false, arrow: true, gradient: 'mint' }
  ];
  var tState = store.get('thumb', null) || {
    color: '#FFE03A', family: 'bold', position: 'bottom', align: 'left',
    glow: false, arrow: false, emoji: '', gradient: 'sunset', photo: null
  };
  var photoImg = null;

  function thumbRules(words) {
    var n = words.filter(Boolean).length;
    var parts = [];
    parts.push(n <= 3 ? '✓ ' + n + ' word' + (n === 1 ? '' : 's') + ', rule ok' : '! ' + n + ' words — 3 best hai');
    parts.push('✓ 1 colour series');
    return parts.join('  ·  ');
  }

  function chipBtn(label, active, onClick, extraClass) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (active ? ' on' : '') + (extraClass ? ' ' + extraClass : '');
    b.textContent = label;
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
    b.addEventListener('click', onClick);
    return b;
  }

  function buildThumbControls() {
    var sw = $('#swatches'); sw.innerHTML = '';
    THUMB_COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (tState.color === c.hex ? ' on' : '');
      b.style.background = c.hex;
      b.setAttribute('aria-label', c.name);
      b.addEventListener('click', function () { tState.color = c.hex; saveThumb(); buildThumbControls(); renderThumb(); });
      sw.appendChild(b);
    });

    var fs = $('#fontSeg'); fs.innerHTML = '';
    FONTS.forEach(function (f) { fs.appendChild(chipBtn(f[1], tState.family === f[0], function () { tState.family = f[0]; saveThumb(); buildThumbControls(); renderThumb(); })); });

    var ps = $('#posSeg'); ps.innerHTML = '';
    POS.forEach(function (p) { ps.appendChild(chipBtn(p[1], tState.position === p[0], function () { tState.position = p[0]; saveThumb(); buildThumbControls(); renderThumb(); })); });
    var al = $('#alignSeg'); al.innerHTML = '';
    ALIGN.forEach(function (p) { al.appendChild(chipBtn(p[1], tState.align === p[0], function () { tState.align = p[0]; saveThumb(); buildThumbControls(); renderThumb(); })); });

    var fx = $('#fxChips'); fx.innerHTML = '';
    fx.appendChild(chipBtn('Arrow', tState.arrow, function () { tState.arrow = !tState.arrow; saveThumb(); buildThumbControls(); renderThumb(); }));
    fx.appendChild(chipBtn('Glow', tState.glow, function () { tState.glow = !tState.glow; saveThumb(); buildThumbControls(); renderThumb(); }));
    EMOJIS.forEach(function (e) {
      fx.appendChild(chipBtn(e, tState.emoji === e, function () { tState.emoji = tState.emoji === e ? '' : e; saveThumb(); buildThumbControls(); renderThumb(); }, 'emo'));
    });

    var gc = $('#gradChips'); gc.innerHTML = '';
    Object.keys(Thumb.GRADIENTS).forEach(function (k) {
      gc.appendChild(chipBtn(k[0].toUpperCase() + k.slice(1), !photoImg && tState.gradient === k, function () {
        tState.gradient = k; photoImg = null; tState.photo = null; saveThumb(); $('#thumbClearPhoto').hidden = true; buildThumbControls(); renderThumb();
      }));
    });

    var pc = $('#presetChips'); pc.innerHTML = '';
    PRESETS.forEach(function (p) {
      pc.appendChild(chipBtn(p.name, false, function () {
        Object.assign(tState, { color: p.color, position: p.position, align: p.align, family: p.font, glow: p.glow, arrow: p.arrow });
        if (!photoImg) tState.gradient = p.gradient;
        saveThumb(); buildThumbControls(); renderThumb();
      }));
    });
  }

  function saveThumb() { store.set('thumb', tState); }

  function thumbWords() { return ['#w1', '#w2', '#w3', '#w4'].map(function (s) { return $(s).value.trim(); }).filter(Boolean); }

  function renderThumb() {
    var words = thumbWords();
    $('#thumbRules').textContent = thumbRules(words);
    Thumb.render($('#thumbCanvas'), {
      words: words, color: tState.color, family: tState.family, position: tState.position,
      align: tState.align, glow: tState.glow, arrow: tState.arrow, emoji: tState.emoji,
      gradient: tState.gradient, photo: photoImg
    });
  }

  function loadPhotoFile(file) {
    if (!file) return;
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      photoImg = img;
      $('#thumbClearPhoto').hidden = false;
      buildThumbControls();
      renderThumb();
      toast('Photo lag gaya');
    };
    img.onerror = function () { toast('Ye photo nahi khula, dusri try karo'); };
    img.src = url;
  }

  $('#thumbPhoto').addEventListener('change', function (e) { loadPhotoFile(e.target.files && e.target.files[0]); e.target.value = ''; });
  $('#thumbClearPhoto').addEventListener('click', function () { photoImg = null; $('#thumbClearPhoto').hidden = true; buildThumbControls(); renderThumb(); });
  ['#w1', '#w2', '#w3', '#w4'].forEach(function (s) { $(s).addEventListener('input', renderThumb); });
  $('#emoji').addEventListener('input', function (e) { tState.emoji = e.target.value.trim(); saveThumb(); renderThumb(); buildThumbControls(); });
  $('#thumbDownload').addEventListener('click', function () {
    var canvas = $('#thumbCanvas');
    canvas.toBlob(function (blob) {
      if (!blob) { toast('PNG nahi bana, dobara try karo'); return; }
      var url = URL.createObjectURL(blob);
      var a = $('#thumbLink');
      a.href = url;
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast('PNG download ho raha hai');
    }, 'image/png');
  });

  /* ---------- titles ---------- */
  var titleOut = null;
  function buildLangSelect() {
    var sel = $('#lang');
    Gen.LANGUAGES.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l; o.textContent = l;
      sel.appendChild(o);
    });
    sel.value = store.get('lang', 'HTML CSS JS');
    $('#topic').value = store.get('topic', '');
  }
  $('#titleForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var topic = $('#topic').value;
    var lang = $('#lang').value;
    store.set('topic', topic); store.set('lang', lang);
    var res = Gen.makeTitles(topic, lang);
    if (!res.ok) {
      $('#titleError').textContent = res.error || 'Kuch titles nahi bane, topic thoda chhota karo.';
      $('#titleOut').hidden = true;
      return;
    }
    $('#titleError').textContent = '';
    var list = $('#titleList'); list.innerHTML = '';
    res.titles.forEach(function (t) {
      var li = document.createElement('li');
      var span = document.createElement('span'); span.textContent = t;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = 'Copy';
      b.addEventListener('click', function () { copyText(t, 'Title'); });
      li.appendChild(span); li.appendChild(b);
      list.appendChild(li);
    });
    var desc = Gen.makeDescription(topic, lang);
    var tags = Gen.makeTags(topic, lang);
    var hash = Gen.makeHashtags(lang).join(' ');
    titleOut = { titles: res.titles.join('\n'), desc: desc, tags: tags.join(', '), hash: hash };
    $('#descBox').textContent = desc;
    $('#tagBox').textContent = tags.join(', ');
    $('#tagCount').textContent = '(' + tags.length + ')';
    $('#hashBox').textContent = hash;
    $('#titleOut').hidden = false;
    store.set('titleOut', titleOut);
  });
  $('#titleOut').addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b || !titleOut) return;
    var k = b.getAttribute('data-copy');
    var map = { titles: ['titles', 'Titles'], desc: ['desc', 'Description'], tags: ['tags', 'Tags'], hash: ['hash', 'Hashtags'] };
    copyText(titleOut[map[k][0]], map[k][1]);
  });

  /* ---------- planner ---------- */
  var niche = store.get('niche', 'coding');
  var planStart = (function () {
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();

  function planProgressText() {
    var cur = store.get('plan.' + niche, {});
    return Object.keys(cur).length + ' kaam ho gaye';
  }

  function planCheck(day, kind, label, text, state) {
    var key = day + '.' + kind;
    var el = document.createElement('label');
    el.className = 'task';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!state[key];
    cb.addEventListener('change', function () {
      var cur = store.get('plan.' + niche, {});
      if (cb.checked) cur[key] = true; else delete cur[key];
      store.set('plan.' + niche, cur);
      $('#planProgress').textContent = planProgressText();
    });
    var t = document.createElement('span');
    var em = document.createElement('em'); em.textContent = label + ' ';
    t.appendChild(em);
    t.appendChild(document.createTextNode(text));
    el.appendChild(cb); el.appendChild(t);
    return el;
  }

  function buildPlan() {
    var nicheSeg = $('#nicheSeg'); nicheSeg.innerHTML = '';
    [['coding', 'Coding'], ['shop', 'Shop']].forEach(function (n) {
      nicheSeg.appendChild(chipBtn(n[1], niche === n[0], function () { niche = n[0]; store.set('niche', niche); buildPlan(); }));
    });
    var plan = Gen.makePlan(niche, planStart, 30);
    var done = store.get('plan.' + niche, {});
    var list = $('#planList'); list.innerHTML = '';
    plan.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'day';
      var head = document.createElement('div');
      head.className = 'day-head';
      head.innerHTML = '<b>Day ' + row.day + '</b><span>' + row.date + '</span>';
      li.appendChild(head);
      li.appendChild(planCheck(row.day, 'short', 'Short', row.short, done));
      if (row.long) li.appendChild(planCheck(row.day, 'long', 'Long', row.long, done));
      else {
        var r = document.createElement('p'); r.className = 'rest'; r.textContent = 'Rest: long video nahi';
        li.appendChild(r);
      }
      list.appendChild(li);
    });
    $('#planProgress').textContent = planProgressText();
  }

  $('#planExport').addEventListener('click', function () {
    var plan = Gen.makePlan(niche, planStart, 30);
    var done = store.get('plan.' + niche, {});
    var lines = Gen.planToText(plan, niche).split('\n');
    var curDay = 0;
    var out = lines.map(function (line) {
      var dm = line.match(/^Day (\d+)/);
      if (dm) curDay = Number(dm[1]);
      var km = line.match(/^  (Short|Long):/);
      if (km) return (done[curDay + '.' + km[1].toLowerCase()] ? '[x] ' : '[ ] ') + line.trimStart();
      return line;
    });
    copyText(out.join('\n'), 'Plan');
  });

  /* ---------- script + teleprompter ---------- */
  var scriptVariant = store.get('scriptVariant', 0);
  var scriptTopic = store.get('scriptTopic', '');
  var scriptRes = null;

  function renderScript() {
    var res = Gen.makeScript(scriptTopic, scriptVariant);
    scriptRes = res;
    if (!res.ok) { $('#scriptError').textContent = res.error; $('#scriptOut').hidden = true; return; }
    $('#scriptError').textContent = '';
    $('#scriptStats').textContent = res.words + ' shabd · lagbhag ' + res.estSeconds + ' sec (target 25 sec)';
    var ol = $('#beats'); ol.innerHTML = '';
    res.segments.forEach(function (s) {
      var li = document.createElement('li');
      li.innerHTML = '<div class="beat-head"><b></b><span></span></div><p></p>';
      li.querySelector('b').textContent = s.label;
      li.querySelector('span').textContent = s.start + '–' + s.end + ' sec';
      li.querySelector('p').textContent = s.text;
      ol.appendChild(li);
    });
    $('#scriptOut').hidden = false;
  }
  $('#scriptForm').addEventListener('submit', function (e) {
    e.preventDefault();
    scriptTopic = $('#scriptTopic').value;
    scriptVariant = 0;
    store.set('scriptTopic', scriptTopic); store.set('scriptVariant', 0);
    renderScript();
  });
  $('#scriptShuffle').addEventListener('click', function () {
    if (!scriptTopic) { $('#scriptError').textContent = 'Pehle topic likho.'; return; }
    scriptVariant += 1; store.set('scriptVariant', scriptVariant); renderScript();
  });
  $('#scriptOut').addEventListener('click', function (e) {
    if (!e.target.closest('[data-copy="script"]') || !scriptRes || !scriptRes.ok) return;
    copyText(scriptRes.text, 'Script');
  });

  var tele = { playing: false, raf: 0, y: 0, last: 0 };
  function teleOpen() {
    if (!scriptRes || !scriptRes.ok) { toast('Pehle script banao'); return; }
    $('#teleText').textContent = scriptRes.text;
    $('#tele').hidden = false;
    teleReset();
  }
  function teleClose() { teleStop(); $('#tele').hidden = true; }
  function teleReset() { tele.y = 0; applyTele(); }
  function applyTele() { $('#teleText').style.transform = 'translateY(' + (-tele.y) + 'px)'; }
  function teleStop() {
    tele.playing = false;
    cancelAnimationFrame(tele.raf);
    $('#telePlay').textContent = 'Play';
  }
  function teleStep(ts) {
    if (!tele.playing) return;
    if (!tele.last) tele.last = ts;
    var dt = Math.min(64, ts - tele.last);
    tele.last = ts;
    var speed = Number($('#teleSpeed').value); // px per second: 1..10 → 30..300
    tele.y += (30 + (speed - 1) * 30) * dt / 1000;
    var max = $('#teleText').scrollHeight - $('#teleView').clientHeight / 2;
    if (tele.y > max) { tele.y = max; teleStop(); }
    applyTele();
    tele.raf = requestAnimationFrame(teleStep);
  }
  $('#teleOpen').addEventListener('click', teleOpen);
  $('#teleClose').addEventListener('click', teleClose);
  $('#telePlay').addEventListener('click', function () {
    if (tele.playing) { teleStop(); return; }
    tele.playing = true; tele.last = 0;
    $('#telePlay').textContent = 'Pause';
    tele.raf = requestAnimationFrame(teleStep);
  });
  $('#teleTop').addEventListener('click', function () { teleStop(); teleReset(); });
  $('#teleSpeed').addEventListener('input', function () { /* read live on the next frame */ });
  $('#teleSize').addEventListener('input', function (e) { $('#teleText').style.fontSize = e.target.value + 'px'; });
  $('#teleText').style.fontSize = '38px';

  /* ---------- checklist ---------- */
  function buildChecklist() {
    var done = store.get('check', {});
    var host = $('#checkGroups'); host.innerHTML = '';
    var total = 0, count = 0;
    Gen.CHECKLIST.forEach(function (g) {
      var sec = document.createElement('section');
      sec.className = 'group';
      var h = document.createElement('h2'); h.className = 'section'; h.textContent = g.group;
      sec.appendChild(h);
      g.items.forEach(function (it) {
        total++;
        var label = document.createElement('label');
        label.className = 'task';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!done[it[0]];
        if (cb.checked) count++;
        cb.addEventListener('change', function () {
          var cur = store.get('check', {});
          if (cb.checked) cur[it[0]] = true; else delete cur[it[0]];
          store.set('check', cur);
          updateProgress();
        });
        var s = document.createElement('span'); s.textContent = it[1];
        label.appendChild(cb); label.appendChild(s);
        sec.appendChild(label);
      });
      host.appendChild(sec);
    });
    function updateProgress() {
      var cur = store.get('check', {});
      $('#checkProgress').textContent = Object.keys(cur).length + ' / ' + total + ' ho gaye';
    }
    updateProgress();
  }
  $('#checkReset').addEventListener('click', function () {
    store.set('check', {});
    buildChecklist();
    toast('Checklist reset ho gaya');
  });

  /* ---------- boot ---------- */
  function boot() {
    buildLangSelect();
    buildThumbControls();
    buildPlan();
    buildChecklist();
    $('#scriptTopic').value = scriptTopic;
    var saved = store.get('titleOut', null);
    if (saved) {
      titleOut = saved;
      $('#descBox').textContent = saved.desc;
      $('#tagBox').textContent = saved.tags;
      $('#tagCount').textContent = '(' + saved.tags.split(', ').length + ')';
      $('#hashBox').textContent = saved.hash;
      var lst = $('#titleList'); lst.innerHTML = '';
      saved.titles.split('\n').forEach(function (t) {
        var li = document.createElement('li'); var sp = document.createElement('span'); sp.textContent = t;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'mini'; b.textContent = 'Copy';
        b.addEventListener('click', function () { copyText(t, 'Title'); });
        li.appendChild(sp); li.appendChild(b); lst.appendChild(li);
      });
      $('#titleOut').hidden = false;
    }
    if (scriptTopic) renderScript();
    window.addEventListener('hashchange', route);
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache optional */ });
    });
  }
})();
