// Mirrors index.html. The chain window TIGHTENS as the combo grows, so these
// constants must track the game — a fixed-window model here would pass while
// describing rules the game no longer has.
const COMBO_BASE_MS=3500, COMBO_MIN_MS=2000, COMBO_STEP_MS=170;
const BONUS_CAP=5, GIFT_EVERY=5, START=90, MAX=120, MATCH_TIME=3;
const comboWindow = l => Math.max(COMBO_MIN_MS, COMBO_BASE_MS-(l-1)*COMBO_STEP_MS);
// mirror of the shipped rules
function sim(gaps){           // gaps = ms between successive matches
  let combo=0, until=0, now=0, score=0, secs=START, gifts=0, log=[];
  for(const g of gaps){
    now += g;
    combo = (now < until) ? combo+1 : 1;
    until = now + comboWindow(combo);
    score += 100*combo;
    const bonus = combo>=2 ? Math.min(combo-1,BONUS_CAP) : 0;
    secs = Math.min(secs + MATCH_TIME + bonus, MAX);
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
t("first match gives NO combo bonus (combo 1)",()=>{ const r=sim([0]); eq(r.log[0].bonus,0,"bonus"); eq(r.combo,1,"combo"); });
t("window tightens as the chain grows",()=>{
  if(!(comboWindow(1)>comboWindow(5)&&comboWindow(5)>comboWindow(9))) throw new Error("must tighten");
  eq(comboWindow(20),COMBO_MIN_MS,"bottoms out at the floor"); });
t("a pace inside the base window but outside the tight one breaks a long chain",()=>{
  // 2.6s gaps: fine early (window 3.5s), too slow once the window reaches 2.0s
  const r=sim(Array(14).fill(2600));
  if(!(Math.max(...r.log.map(x=>x.combo)) < 14)) throw new Error("tightening never bit"); });
t("bonus = combo-1, capped at 5",()=>{ const r=sim(Array(9).fill(400));
  eq(r.log.map(x=>x.bonus),[0,1,2,3,4,5,5,5,5],"bonus ladder"); });
t("gift fires exactly on multiples of 5",()=>{ const r=sim(Array(10).fill(400)); eq(r.gifts,2,"gifts at x5 and x10"); });
t("gift does NOT fire below 5",()=>{ const r=sim(Array(4).fill(400)); eq(r.gifts,0,"no gift"); });
t("score rewards chaining over plodding",()=>{
  const fast=sim(Array(6).fill(400)).score, slow=sim(Array(6).fill(9000)).score;
  if(!(fast>slow)) throw new Error(`fast ${fast} should beat slow ${slow}`);
  eq(fast,100*(1+2+3+4+5+6),"triangular"); eq(slow,600,"flat"); });
t("break resets chain mid-run",()=>{ const r=sim([0,400,400,9000,400]); eq(r.log.map(x=>x.combo),[1,2,3,1,2],"reset"); });
t("time cannot exceed the cap",()=>{ let r=sim(Array(200).fill(300)); if(r.secs>MAX) throw new Error("overflow "+r.secs); });
console.log(`\n${p} passed, ${f} failed`); process.exit(f?1:0);
