/* Thumbnail renderer: 1280x720 canvas, one colour per series, up to 4 words. */
(function (g) {
  'use strict';
  var W = 1280, H = 720;
  var FAMILIES = {
    bold: '"Arial Black", "Roboto", sans-serif',
    condensed: '"sans-serif-condensed", "Roboto Condensed", "Arial Narrow", sans-serif',
    serif: '"Noto Serif", Georgia, serif',
    mono: '"Droid Sans Mono", "Roboto Mono", monospace'
  };
  var GRADIENTS = {
    sunset: ['#ff7a18', '#af002d'],
    night: ['#0f2027', '#2c5364'],
    mint: ['#11998e', '#38ef7d'],
    ink: ['#0b0c10', '#3a3f52']
  };

  function fontAt(size, family) {
    return '900 ' + Math.round(size) + 'px ' + (FAMILIES[family] || FAMILIES.bold);
  }

  // Each word gets its own line, sized to fit the width; the block is scaled to fit the height.
  function layout(ctx, words, family, maxW, maxH) {
    var lines = words.map(function (text) {
      var size = 260;
      ctx.font = fontAt(size, family);
      while (size > 40 && ctx.measureText(text).width > maxW) {
        size -= 6;
        ctx.font = fontAt(size, family);
      }
      return { text: text, size: size };
    });
    var gap = 0.08;
    var total = lines.reduce(function (s, l) { return s + l.size * (1 + gap); }, 0);
    if (total > maxH) {
      var k = maxH / total;
      lines.forEach(function (l) { l.size = Math.floor(l.size * k); });
      total = lines.reduce(function (s, l) { return s + l.size * (1 + gap); }, 0);
    }
    return { lines: lines, total: total, gap: gap };
  }

  function drawBackground(ctx, opts) {
    if (opts.photo) {
      var img = opts.photo;
      var s = Math.max(W / img.width, H / img.height);
      var dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      var shade = ctx.createLinearGradient(0, 0, 0, H);
      shade.addColorStop(0, 'rgba(0,0,0,0.25)');
      shade.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    var c = GRADIENTS[opts.gradient] || GRADIENTS.ink;
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c[0]);
    grad.addColorStop(1, c[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // faint grid + glow so flat gradients still look designed
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    for (var x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    var rg = ctx.createRadialGradient(W * 0.8, H * 0.2, 40, W * 0.8, H * 0.2, 620);
    rg.addColorStop(0, 'rgba(255,255,255,0.22)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawArrow(ctx, fromX, fromY, toX, toY, color) {
    var ang = Math.atan2(toY - fromY, toX - fromX);
    var head = 46;
    ctx.save();
    ctx.strokeStyle = '#000';
    ctx.fillStyle = color;
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX - Math.cos(ang) * head * 0.6, toY - Math.sin(ang) * head * 0.6);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - head * Math.cos(ang - 0.5), toY - head * Math.sin(ang - 0.5));
    ctx.lineTo(toX - head * Math.cos(ang + 0.5), toY - head * Math.sin(ang + 0.5));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  function render(canvas, o) {
    var ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, o);

    var words = (o.words || []).map(function (w) { return String(w).trim(); }).filter(Boolean).slice(0, 4);
    var color = o.color || '#FFE03A';
    var family = o.family || 'bold';
    var margin = 70;
    var maxW = W * 0.62;
    var maxH = H * 0.8;

    if (words.length) {
      var L = layout(ctx, words, family, maxW, maxH);
      var blockH = L.total;
      var top;
      if (o.position === 'top') top = 50;
      else if (o.position === 'bottom') top = H - 50 - blockH;
      else top = (H - blockH) / 2;

      var align = o.align || 'left';
      var blockW = 0;
      L.lines.forEach(function (ln) {
        ctx.font = fontAt(ln.size, family);
        blockW = Math.max(blockW, ctx.measureText(ln.text).width);
      });
      var x0 = align === 'center' ? (W - blockW) / 2 : align === 'right' ? W - margin - blockW : margin;

      var y = top;
      var pos = [];
      L.lines.forEach(function (ln) {
        ctx.font = fontAt(ln.size, family);
        ctx.textBaseline = 'top';
        var tw = ctx.measureText(ln.text).width;
        var x = align === 'center' ? (W - tw) / 2 : align === 'right' ? W - margin - tw : margin;
        pos.push({ x: x, w: tw, y: y, size: ln.size, text: ln.text });
        y += ln.size * (1 + L.gap);
      });

      // optional arrow pointing at the block
      if (o.arrow && pos.length) {
        var right = Math.max.apply(null, pos.map(function (p) { return p.x + p.w; }));
        var midY = top + blockH / 2;
        if (right + 260 < W) drawArrow(ctx, right + 250, midY - 90, right + 24, midY - 20, color);
        else if (pos[0].x - 260 > 0) drawArrow(ctx, pos[0].x - 250, midY - 90, pos[0].x - 24, midY - 20, color);
      }

      pos.forEach(function (p) {
        ctx.font = fontAt(p.size, family);
        ctx.textBaseline = 'top';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(10, p.size * 0.13);
        ctx.strokeStyle = '#000';
        if (o.glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 36;
        }
        ctx.strokeText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.fillText(p.text, p.x, p.y);
      });
    }

    if (o.emoji) {
      ctx.save();
      ctx.font = '200px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 24;
      ctx.fillText(o.emoji, W - 260, 40);
      ctx.restore();
    }
    return canvas;
  }

  var api = { render: render, W: W, H: H, GRADIENTS: GRADIENTS, FAMILIES: FAMILIES, layout: layout };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else g.Thumb = api;
})(typeof self !== 'undefined' ? self : this);
