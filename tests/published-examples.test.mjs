import assert from 'node:assert/strict';
import test from 'node:test';
import { runTool } from '../lib/transformers.ts';
import { tools } from '../lib/tools.ts';
import { toolResults } from '../lib/tool-results.ts';
import { toolVerification } from '../lib/tool-verification.ts';
import { guideWorkflows } from '../lib/guide-workflows.ts';

const blocks = (slug) => guideWorkflows[slug].flatMap(section => section.codeBlocks ?? []);

test('published default sample outputs are reproducible', async () => {
  assert.equal(Object.keys(toolResults).length, 22);
  for (const [slug, expected] of Object.entries(toolResults)) {
    const tool = tools.find(tool => tool.slug === slug);
    assert.equal(await runTool(slug, tool.sample), expected, slug);
  }
});

test('every public tool has a distinct verification record', () => {
  assert.equal(Object.keys(toolVerification).length, tools.length);
  const methods = new Set();
  for (const tool of tools) {
    const record = toolVerification[tool.slug];
    assert.ok(record, tool.slug);
    assert.match(record.level, /^(Automated|Manual|Network)$/);
    assert.ok(record.method.length >= 80, `${tool.slug} method is substantial`);
    assert.ok(record.invariant.length >= 50, `${tool.slug} invariant is substantial`);
    assert.ok(record.boundary.length >= 50, `${tool.slug} boundary is substantial`);
    methods.add(record.method);
  }
  assert.equal(methods.size, tools.length);
});

test('guide fixtures match the named conversion and settings', async () => {
  for (const [guide, tool, options] of [
    ['how-to-format-and-validate-json', 'json-formatter', {}],
    ['json-to-typescript-workflow', 'json-to-typescript', {}],
    ['json-vs-yaml-for-configuration', 'yaml-to-json', {}],
    ['convert-json-and-csv-safely', 'csv-to-json', {}],
    ['debug-jwt-tokens-safely', 'jwt-decoder', {}],
    ['map-json-and-xml-without-losing-meaning', 'xml-to-json', {}],
    ['sha256-hashes-and-random-uuids', 'sha256-hash', {}],
    ['format-and-minify-css-safely', 'css-formatter-minifier', { direction: 1 }],
  ]) {
    const [input, output] = blocks(guide);
    assert.equal(await runTool(tool, input.code, options), output.code, guide);
  }
  const [source, , invalid] = blocks('how-to-format-and-validate-json');
  assert.match(await runTool('json-validator', source.code), /Valid JSON/);
  await assert.rejects(runTool('json-validator', invalid.code));
  for (const [tool, index] of [['url-encoder-decoder',0],['base64-encoder-decoder',1],['html-entities',2]]) {
    const [input, expected] = blocks('frontend-encoding-cheat-sheet')[index].code.split('\n');
    assert.equal(await runTool(tool, input), expected);
  }
  const [inputs, output] = blocks('unix-timestamps-without-timezone-bugs');
  for (const input of inputs.code.split('\n')) {
    const result = (await runTool('unix-timestamp-converter',input)).split('\n').filter(line => !line.startsWith('Local:')).join('\n');
    assert.equal(result, output.code);
  }
});

test('documented limitations remain accurate for current converters', async () => {
  assert.equal(await runTool('json-to-csv', '[{"id":1},{"id":2,"note":"later"}]'), 'id\r\n1\r\n2');
  const counterexample = blocks('format-and-minify-css-safely')[2].code;
  assert.match(await runTool('css-formatter-minifier',counterexample,{direction:1}), /content:"a>b"/);
  const uuid = await runTool('uuid-generator','2');
  assert.equal(uuid.split('\n').length, 2);
  for(const value of uuid.split('\n')) assert.match(value,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
