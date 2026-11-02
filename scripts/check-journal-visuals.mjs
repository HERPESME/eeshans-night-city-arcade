import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { handler } from '../netlify/functions/render.mjs';

const manuscripts = JSON.parse(await readFile('src/content/journal-stories.json', 'utf8'));
const textOnly = new Set(['lifecycle-restraint', 'reversible-startup']);
const figureIds = new Set();
let figures = 0;
for (const story of manuscripts.filter(story => story.category !== 'gaming')) {
  const result = await handler({ rawUrl: `https://technightcity.com/blogs/${story.slug}`, httpMethod: 'GET' });
  assert.equal(result.statusCode, 200);
  const body = result.body.match(/<article\b[^>]*id="blog-article-body"[\s\S]*?<\/article>/)?.[0];
  assert.ok(body, 'Read the article body independently of the cover and related cards');
  assert.ok(!/journal-portal-|expo-field-test-kit|blog-art-screen/.test(body), `${story.key}: no automatically injected product-screen study`);
  const diagrams = [...body.matchAll(/<figure class="blog-diagram\b[\s\S]*?<\/figure>/g)];
  if (textOnly.has(story.key)) {
    assert.equal(diagrams.length, 0, 'Do not replace a picture quota with a diagram quota');
    assert.ok(body.includes('<table>'), 'Founder decisions retain their existing useful comparison table');
  } else {
    assert.ok(diagrams.length > 0, `${story.key}: an explanatory technical figure is present`);
  }
  for (const [figure] of diagrams) {
    const titleId = figure.match(/aria-labelledby="([^"]+)"/)[1];
    const captionId = figure.match(/aria-describedby="([^"]+)"/)[1];
    assert.ok(!figureIds.has(titleId), 'Figure labels are unique across articles');
    figureIds.add(titleId);
    assert.ok(figure.includes(`id="${titleId}"`) && figure.includes(`id="${captionId}"`), 'Accessible figure title and caption resolve');
    assert.ok(figure.includes('<ol') && figure.includes('<strong>'), 'Diagram nodes are readable HTML in the direct server response');
    assert.ok(figure.includes('THE KEY DISTINCTION'), 'Every figure explains its main inference');
    assert.ok(!figure.includes('<img') && !figure.includes('role="img"'), 'Do not flatten diagram text into an inaccessible raster or image role');
    figures++;
  }
  console.log('PASS editorial visuals', story.key, diagrams.length ? `${diagrams.length} explained figures` : 'existing decision table');
}
assert.equal(figureIds.size, figures);
assert.ok(figures >= 18, 'The engineering articles have substantial, accessible visual explanations');
console.log(`PASS ${figures} figures across 18 articles; 2 founder articles use focused tables; no repeated injected screens`);
