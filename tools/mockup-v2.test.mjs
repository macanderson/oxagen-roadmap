import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildMockupV2 } from './build-mockup-v2.mjs';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../mockups/v2/src/data.js',import.meta.url),'utf8'),ctx);
const rows=Array.from({length:63},(_,i)=>({id:i,title:'Task '+i,description:'Check retries',agentName:'Release',operator:i%2?'Priya':'Marcus',op:i%2?'priya':'marcus',harness:i%3?'codex':'stella',harnessLabel:i%3?'Codex':'Stella',repo:i%2?'web':'api',model:'Model',status:i<5?'live':'sealed',cost:i%4?2:null,input:100,cached:60}));
test('default page is 25; all sizes cover each record once',()=>{
 assert.equal(ctx.v2Paginate(rows,1).rows.length,25);
 for(const size of [10,25,50]){const all=[];for(let p=1;p<=Math.ceil(rows.length/size);p++)all.push(...ctx.v2Paginate(rows,p,size).rows);assert.deepEqual(all,rows);}
 assert.equal(ctx.v2Paginate(rows,99,25).page,3);
 assert.equal(ctx.v2Paginate([],4,25).start,0);
 assert.equal(ctx.v2Paginate([],4,25).page,1);
});
test('operator, harness, repository, status, and text filters compose',()=>{
 const selected=ctx.v2Filter(rows,{operator:'marcus',harness:'stella',repo:'api',q:'retries'});
 assert.ok(selected.length>0);assert.ok(selected.every(r=>r.op==='marcus'&&r.harness==='stella'&&r.repo==='api'));
 assert.equal(ctx.v2Filter(rows,{status:'active'}).length,5);
 assert.equal(ctx.v2Filter(rows,{q:'missing'}).length,0);
 assert.equal(ctx.v2Filter(rows,{q:'  PRIYA  '}).length,31);
});
test('timestamps preserve requested format and explicit UTC',()=>{
 const t=ctx.v2Timestamp('2026-08-04T11:33:00Z');assert.equal(t.date,'Aug 4 2026');assert.equal(t.time,'11:33 AM');
 assert.equal(ctx.v2Timestamp('2026-08-04T00:05:00Z').time,'12:05 AM');
 assert.equal(ctx.v2Timestamp('2026-08-04T12:05:00Z').time,'12:05 PM');
 assert.equal(ctx.v2Timestamp('invalid').date,'Not recorded');
});
test('rollups exclude unknown spend and weight cache by input tokens',()=>{
 const r=ctx.v2Rollup([{cost:null,input:100,cached:20,status:'live'},{cost:4,input:900,cached:900,status:'sealed'}]);
 assert.equal(r.cost,4);assert.equal(r.unmetered,1);assert.equal(r.efficiency,92);assert.equal(r.active,1);
 assert.equal(ctx.v2Rollup([]).efficiency,null);
});
test('all six harnesses have local SVGs for both themes',()=>{
 for(const key of Object.keys(ctx.V2_HARNESSES))for(const theme of ['light','dark']){
 const svg=fs.readFileSync(new URL(`../mockups/v2/assets/${key}-${theme}.svg`,import.meta.url),'utf8');assert.match(svg,/<svg/);assert.doesNotMatch(svg,/<script|https?:\/\/[^" ]+\.js/);
 }
});
test('build retains creation wizard source verbatim and compiles all scripts',()=>{
 const html=buildMockupV2(),original=fs.readFileSync(new URL('../mockups/src/engine.js',import.meta.url),'utf8');
 const start=original.indexOf('function wzOpen('),end=original.indexOf('\nfunction ',start+1);
 assert.ok(start>0);assert.ok(html.includes(original.slice(start,end)));
 assert.ok(html.includes('data-lt="v2"'));assert.ok(html.includes('grid-template-columns:minmax(0,3fr) minmax(0,2fr)'));
 for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
