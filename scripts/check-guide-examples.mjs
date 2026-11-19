import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Exercise the published teaching snippets themselves. No provider calls,
// credentials, production data, hardware measurements or external writes.
const guides = JSON.parse(await readFile('src/content/november-practical-guides.json', 'utf8'));
const code = slug => {
  const entry = guides.find(item => item.slug === slug);
  assert.ok(entry, slug);
  return entry.sections.find(section => section.code)?.code.text;
};

const logs = [];
vm.runInNewContext(code('ttft-tpot-tokens-per-second-local-llm-benchmark'), {
  console: { log: value => logs.push(value) },
});
assert.equal(logs[0].ttftMs, 800);
assert.equal(logs[0].tpotMs, 100);

const reducer = vm.runInNewContext(`${code('deepseek-streaming-citations-block-safe-rendering')}; ({ blocks, addText, addCitation })`);
reducer.addText('a', 'First ');
reducer.addText('b', 'Separate answer');
reducer.addText('a', 'answer');
reducer.addCitation('a', { url: 'https://example.org/source-a' });
assert.equal(reducer.blocks.get('a').text, 'First answer');
assert.equal(reducer.blocks.get('a').citations.length, 1);
assert.equal(reducer.blocks.get('b').citations.length, 0);
assert.throws(() => reducer.addCitation('missing', { url: 'https://example.org/' }), /no text block/);

const verifyCode = code('firebase-email-verified-firestore-permission-token-refresh');
const makeCheck = auth => vm.runInNewContext(`(async () => {\n${verifyCode}\n})()`, { auth });
await assert.rejects(makeCheck({ currentUser: null }), /Sign in first/);
const calls = [];
await assert.rejects(makeCheck({ currentUser: {
  emailVerified: false, reload: async () => calls.push('reload'),
  getIdToken: async () => calls.push('token'),
} }), /Verify your email/);
assert.deepEqual(calls, ['reload']);
calls.length = 0;
const user = {
  emailVerified: false,
  reload: async () => { calls.push('reload'); user.emailVerified = true; },
  getIdToken: async force => { assert.equal(force, true); calls.push('forced token refresh'); },
};
await makeCheck({ currentUser: user });
assert.deepEqual(calls, ['reload', 'forced token refresh']);

const example = guides.find(item => item.slug === 'software-engineer-salary-median-sample-bias');
const medianRows = example.sections.find(section => section.table).table.rows;
for (const row of medianRows) {
  const values = row[1].split(',').map(Number).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  assert.equal(median, Number(row[2]), 'Published synthetic median arithmetic');
}
const offer = guides.find(item => item.slug === 'joining-bonus-vs-base-two-year-developer-offer');
const cashRows = offer.sections.find(section => section.table).table.rows;
const cash = label => cashRows.find(row => row[0] === label).slice(1).map(value => Number.parseInt(value, 10));
const base = cash('Year-one base');
const bonus = cash('Year-one joining payment');
const first = cash('Year-one total');
const second = cash('Year-two total');
const total = cash('Two-year total');
for (let i = 0; i < 2; i++) {
  assert.equal(base[i] + bonus[i], first[i]);
  assert.equal(first[i] + second[i], total[i]);
}
console.log('PASS published timing, citation block isolation, token refresh sequence and fictional compensation arithmetic');
