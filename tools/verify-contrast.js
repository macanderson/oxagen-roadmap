/* Oracle for finding 44a. Final token set for consolidated.html, with every wash
   derived from its own base colour, checked against every background it can land
   on — including the `tbody tr:hover td` highlight. Exit 1 on any failure. */
const hex = h => { h=h.replace('#',''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
const lin = c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
const L = rgb => { const [r,g,b]=rgb.map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b)=>{ const l1=L(a),l2=L(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1]; return (hi+0.05)/(lo+0.05); };
const over = (fg, alpha, bg) => fg.map((c,i)=>c*alpha + bg[i]*(1-alpha));

const T = {
  light: {
    bgs: {ink:'#F2EEE5', panel:'#F8F5EE', panel2:'#FFFDF8', hl:'#EDE7DA'},
    fg:'#10100F', body:'#2A2823', muted:'#5F5B54', dim:'#6D675C',
    states: {ok:['#1E693E',.12], proven:['#00685A',.12], wait:['#2E5D9A',.12], deny:['#A13846',.11],
             fail:['#994110',.12], crit:['#AD271F',.12], neutral:['#625E56',.10], gold:['#825511',.10]},
    goldSolid:'#D6962C', goldInk:'#10100F',
  },
  dark: {
    bgs: {ink:'#10100F', panel:'#181715', panel2:'#1D1C19', hl:'#201F1C'},
    fg:'#F2EEE5', body:'#DDD8CD', muted:'#A8A298', dim:'#8A867E',
    states: {ok:['#5BA97C',.14], proven:['#4FB3A3',.14], wait:['#6E9BD6',.14], deny:['#DB7B86',.14],
             fail:['#E17C4E',.14], crit:['#FD655C',.15], neutral:['#9C968B',.13], gold:['#D6962C',.12]},
    goldSolid:'#D6962C', goldInk:'#10100F',
  },
};

let fails = 0, checks = 0;
function check(label, fgHex, bgRgb, theme, bgName){
  const r = ratio(hex(fgHex), bgRgb);
  checks++;
  if(r < 4.5){ fails++; console.log(`FAIL ${theme.padEnd(5)} ${label.padEnd(22)} on ${bgName.padEnd(18)} ${r.toFixed(2)}`); }
}

for(const [theme, t] of Object.entries(T)){
  for(const [n, v] of Object.entries(t.bgs)){
    check('--fg', t.fg, hex(v), theme, n);
    check('--body', t.body, hex(v), theme, n);
    check('--muted', t.muted, hex(v), theme, n);
    check('--dim', t.dim, hex(v), theme, n);
  }
  for(const [name, [c, a]] of Object.entries(t.states)){
    for(const [n, v] of Object.entries(t.bgs)){
      check(`.st.${name}`, c, over(hex(c), a, hex(v)), theme, `${name}-wash/${n}`);
      check(`${name} as text`, c, hex(v), theme, n);
    }
  }
  check('btn-primary ink', t.goldInk, hex(t.goldSolid), theme, 'gold-solid');
}
console.log(fails === 0 ? `ALL PASS — ${checks} pairs at 4.5:1` : `${fails} of ${checks} FAILED`);
process.exit(fails === 0 ? 0 : 1);
