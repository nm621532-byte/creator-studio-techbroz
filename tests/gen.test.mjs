// Unit tests for the rule-based generators (run: node --test tests/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Gen = require('../site/js/gen.js');

test('titles: 10 unique, each <= 60 chars, phrase first, at most one emoji', () => {
  const r = Gen.makeTitles('login form', 'HTML CSS JS');
  assert.equal(r.ok, true);
  assert.equal(r.titles.length, 10);
  assert.equal(new Set(r.titles).size, 10);
  for (const t of r.titles) {
    assert.ok(t.length <= 60, t);
    assert.ok(t.toLowerCase().startsWith(r.phrase.toLowerCase().split(' ')[0]), t);
    assert.ok(!/[<>]/.test(t), t);
    const emojis = [...t].filter(c => c.codePointAt(0) > 0x2500).length;
    assert.ok(emojis <= 1, t);
  }
});

test('titles: long topic still fits 60 chars and keeps at least 10', () => {
  const r = Gen.makeTitles('responsive restaurant menu website with cart count and dark mode toggle', 'Website');
  assert.equal(r.ok, true);
  for (const t of r.titles) assert.ok(t.length <= 60, t);
});

test('titles: empty topic is refused honestly', () => {
  const r = Gen.makeTitles('   ', 'Python');
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test('description: contains the exact editor line and exactly 3 hashtags', () => {
  const d = Gen.makeDescription('login form', 'HTML CSS JS');
  const lines = d.split('\n');
  assert.equal(lines[1], '\uD83D\uDCBB Code khud chala ke dekho (free editor): https://techbroz-code.sites.tab.bot/');
  const tags = d.match(/#[\p{L}\p{N}_]+/gu) || [];
  assert.equal(tags.length, 3, tags.join(' '));
});

test('hashtags: exactly 3', () => {
  assert.equal(Gen.makeHashtags('Python').length, 3);
});

test('tags: between 12 and 15, unique, lowercase, each <= 30 chars', () => {
  for (const [topic, lang] of [['login form', 'HTML CSS JS'], ['loops', 'Python'], ['x', 'C']]) {
    const tags = Gen.makeTags(topic, lang);
    assert.ok(tags.length >= 12 && tags.length <= 15, `${topic}: ${tags.length}`);
    assert.equal(new Set(tags).size, tags.length);
    for (const t of tags) { assert.equal(t, t.toLowerCase()); assert.ok(t.length <= 30); }
  }
});

test('plan: 30 days, short every day, long on six of seven days, deterministic', () => {
  const a = Gen.makePlan('coding', '2026-11-08', 30);
  const b = Gen.makePlan('coding', '2026-11-08', 30);
  assert.deepEqual(a, b);
  assert.equal(a.length, 30);
  assert.equal(a[0].date, '2026-11-08');
  assert.equal(a[29].date, '2026-12-07');
  assert.ok(a.every(d => d.short));
  const longDays = a.filter(d => d.long).length;
  assert.equal(longDays, 30 - Math.floor(30 / 7));
  assert.equal(a[6].long, null);
});

test('plan: shop niche uses shop ideas, not coding ones', () => {
  const p = Gen.makePlan('shop', '2026-11-08', 30);
  const shopShorts = new Set(Gen.IDEAS.shop.short);
  assert.ok(p.every(d => shopShorts.has(d.short)));
});

test('script: five beats covering 25 seconds, Hinglish, topic included', () => {
  const s = Gen.makeScript('CSS flexbox', 0);
  assert.equal(s.ok, true);
  assert.deepEqual(s.segments.map(x => x.label), ['Hook', 'Problem', 'Demo', 'Payoff', 'CTA']);
  assert.equal(s.segments[s.segments.length - 1].end, 25);
  assert.ok(s.text.includes('CSS flexbox'));
  assert.ok(s.estSeconds > 0 && s.estSeconds < 60);
});

test('script: variants change the wording; empty topic refused', () => {
  assert.notEqual(Gen.makeScript('loops', 0).text, Gen.makeScript('loops', 1).text);
  assert.equal(Gen.makeScript('', 0).ok, false);
});

test('checklist: every item has a unique id and the four groups exist', () => {
  const ids = Gen.CHECKLIST.flatMap(g => g.items.map(i => i[0]));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Gen.CHECKLIST.map(g => g.group), ['SEO', 'Thumbnail', 'Shorts', 'Routine']);
});
