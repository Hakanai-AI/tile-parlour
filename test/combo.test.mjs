const COMBO_MS=3500, BONUS_CAP=5, GIFT_EVERY=5, START=300;
// mirror of the shipped rules
function sim(gaps){           // gaps = ms between successive matches
  let combo=0, until=0, now=0, score=0, secs=200, gifts=0, log=[];
  for(const g of gaps){
    now += g;
    combo = (now < until) ? combo+1 : 1;
    until = now + COMBO_MS;
    score += 100*combo;
    let bonus=0;
    if(combo>=2){ bonus=Math.min(combo-1,BONUS_CAP); secs=Math.min(secs+bonus,START); }
    if(combo>0 && combo%GIFT_EVERY===0) gifts++;
    log.push({combo,bonus});
  }
  return {combo,score,secs,gifts,log};
}
let p=0,f=0;
const t=(n,fn)=>{try{fn();console.log("OK  "+n);p++;}catch(e){console.log("FAIL "+n+": "+e.message);f++;}};
const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(`${m}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);};

t("fast chain builds combo",()=>{ const r=sim([0,500,500,500]); eq(r.combo,4,"combo"); });
t("slow matches never chain",()=>{ const r=sim([0,4000,4000,4000]); eq(r.combo,1,"combo"); eq(r.log.map(x=>x.bonus),[0,0,0,0],"no bonus"); });
t("first match gives NO bonus (combo 1)",()=>{ const r=sim([0]); eq(r.log[0].bonus,0,"bonus"); eq(r.combo,1,"combo"); });
t("bonus = combo-1, capped at 5",()=>{ const r=sim(Array(9).fill(400));
  eq(r.log.map(x=>x.bonus),[0,1,2,3,4,5,5,5,5],"bonus ladder"); });
t("gift fires exactly on multiples of 5",()=>{ const r=sim(Array(10).fill(400)); eq(r.gifts,2,"gifts at x5 and x10"); });
t("gift does NOT fire below 5",()=>{ const r=sim(Array(4).fill(400)); eq(r.gifts,0,"no gift"); });
t("score rewards chaining over plodding",()=>{
  const fast=sim(Array(6).fill(400)).score, slow=sim(Array(6).fill(9000)).score;
  if(!(fast>slow)) throw new Error(`fast ${fast} should beat slow ${slow}`);
  eq(fast,100*(1+2+3+4+5+6),"triangular"); eq(slow,600,"flat"); });
t("break resets chain mid-run",()=>{ const r=sim([0,400,400,9000,400]); eq(r.log.map(x=>x.combo),[1,2,3,1,2],"reset"); });
t("time bonus cannot exceed START",()=>{ let r=sim(Array(200).fill(300)); if(r.secs>START) throw new Error("overflow "+r.secs); });
console.log(`\n${p} passed, ${f} failed`); process.exit(f?1:0);
