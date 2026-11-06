import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import { visibleSections, ordered, localUrl, validateContent, isSquareReady } from '../src/lib/content.mjs';
import { normalizeBusiness, normalizeSection, normalizeHomepage, normalizeCategory, normalizeFood } from '../src/lib/content-model.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'));
const cms = YAML.parse(readFileSync(new URL('../.pages.yml', import.meta.url), 'utf8'));
const business = read('business'), homepage = read('homepage'), food = read('food');

// Behaviour tests use fixtures: the owner can delete every section/category
// without breaking a test that assumes a particular number or arrangement.
const businessFixture = { name: 'Test kitchen', squareUrl: '[SQUARE_ORDERING_URL]' };
const sectionFixture = (id, order) => ({ id, order, enabled: true, type: 'intro', heading: id, theme: 'navy' });

test('current CMS content passes production validation', () => {
  assert.deepEqual(validateContent(business, homepage, food), []);
});

test('adding, hiding, removing and reordering sections preserves content', () => {
  const original = ['welcome','food','story','location'].map((id,i)=>sectionFixture(id,(i+1)*10));
  const draft = structuredClone(original);
  draft[0].enabled = false;
  draft[1].order = 500;
  draft.push(sectionFixture('special', -10));
  draft.splice(3, 1);
  assert.deepEqual(visibleSections(draft).map(s=>s.id), ['special','story','food']);
  assert.deepEqual(original.map(s=>s.id), ['welcome','food','story','location']);
});

test('food categories can be reordered and the list can be empty', () => {
  const items = [{name:'Samosas',order:10},{name:'Drinks',order:0}];
  assert.deepEqual(ordered(items).map(c=>c.name), ['Drinks','Samosas']);
  assert.equal(items[0].name, 'Samosas');
  assert.deepEqual(ordered([]), []);
});

test('root and GitHub project paths preserve anchors and external URLs', () => {
  assert.equal(localUrl('/media/logo.png', '/moon-foods/'), '/moon-foods/media/logo.png');
  assert.equal(localUrl('/media/logo.png', '/'), '/media/logo.png');
  assert.equal(localUrl('#food', '/moon-foods/'), '#food');
  assert.equal(localUrl('https://example.square.site/', '/moon-foods/'), 'https://example.square.site/');
  assert.equal(isSquareReady('[SQUARE_ORDERING_URL]'), false);
  assert.equal(isSquareReady('https://example.square.site/'), true);
});

test('invalid sections and unsafe button links fail before deployment', () => {
  const section = sectionFixture('intro',10);
  const draft = { sections: [section, {...section,buttonUrl:'javascript:alert(1)'}] };
  const errors = validateContent(businessFixture, draft, {});
  assert(errors.some(s=>s.includes('unique')));
  assert(errors.some(s=>s.includes('Unsafe')));
});

test('CMS saves can omit every blank optional field', () => {
  // Mirrors Pages CMS serializing a text edit without image/imageAlt/buttons.
  const saved = {sections:[{...sectionFixture('welcome',10),heading:'Big flavours.\nA little\nmoon magic.'}]};
  assert.deepEqual(validateContent(businessFixture,saved,{categories:[{name:'Samosas',order:10}]}), []);
  const normalized = normalizeHomepage(saved).sections[0];
  assert.equal(normalized.heading, saved.sections[0].heading);
  for (const field of ['label','body','image','imageAlt','buttonLabel','buttonUrl']) assert.equal(normalized[field], '');
  assert.deepEqual(normalizeBusiness(businessFixture).socialLinks, []);
  assert.equal(normalizeCategory({name:'Samosas',order:10}).featured, false);
});

test('null fields and empty CMS lists have usable defaults without losing false or zero', () => {
  const section = normalizeSection({...sectionFixture('intro',0),enabled:false,body:null,image:null,buttonLabel:null});
  assert.equal(section.enabled,false);
  assert.equal(section.order,0);
  assert.equal(section.body,'');
  assert.deepEqual(visibleSections([section]),[]);
  assert.deepEqual(normalizeHomepage({sections:null}).sections,[]);
  assert.deepEqual(normalizeFood({categories:null}).categories,[]);
  assert.deepEqual(normalizeBusiness({...businessFixture,socialLinks:null}).socialLinks,[]);
  assert.deepEqual(validateContent({...businessFixture,socialLinks:null},{sections:null},{categories:null}),[]);
});

test('missing required values and missing image descriptions still fail validation', () => {
  const missing = sectionFixture('intro',10);
  delete missing.heading;
  delete missing.order;
  const errors = validateContent(businessFixture,{sections:[missing]},{});
  assert(errors.some(s=>s.includes('Heading required')));
  assert(errors.some(s=>s.includes('Invalid visibility/order')));
  assert(validateContent(businessFixture,{sections:[{...sectionFixture('intro',10),image:'/src/assets/uploads/example.png'}]},{}).some(s=>s.includes('Image description required')));
});

test('Pages CMS covers the stable content model, independently of optional stored fields', () => {
  const models = [
    ['business', normalizeBusiness(), null],
    ['homepage', normalizeSection(), 'sections'],
    ['food', normalizeCategory(), 'categories'],
  ];
  for (const [name,model,key] of models) {
    const definition = cms.content.find(c=>c.name===name);
    const list = key ? definition.fields.find(f=>f.name===key) : null;
    if (list) assert.equal(list.list,true);
    const fields = list ? list.fields : definition.fields;
    assert.deepEqual(fields.map(f=>f.name).sort(),Object.keys(model).sort());
  }
});

test('all currently stored fields have CMS controls; absent optional fields are allowed', () => {
  for (const [name,data,key] of [['business',business,null],['homepage',homepage,'sections'],['food',food,'categories']]) {
    const definition = cms.content.find(c=>c.name===name);
    const fields = key ? definition.fields.find(f=>f.name===key).fields : definition.fields;
    const names = new Set(fields.map(f=>f.name));
    for (const item of key ? (data[key] ?? []) : [data]) for (const field of Object.keys(item)) assert(names.has(field), `No CMS control for ${name}.${field}`);
  }
});

test('workflow runs the official Astro build and Pages deployment on main', () => {
  const workflow = YAML.parse(readFileSync(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8'));
  assert(workflow.on.push.branches.includes('main'));
  assert.equal(workflow.permissions.pages,'write');
  assert(workflow.jobs.build.steps.some(s=>s.uses==='withastro/action@v6'));
  assert.equal(workflow.jobs.deploy.steps[0].uses,'actions/deploy-pages@v5');
});
