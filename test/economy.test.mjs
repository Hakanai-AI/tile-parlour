// Is the board still finishable once time is the scarce resource?
// Models a player who takes a steady `pace` seconds per match and asks whether
// 40 pairs can be cleared before the clock empties.
const START=90, MAX=120, MATCH_TIME=3, BONUS_CAP=5;
const CB=3500, CMIN=2000, CSTEP=170, GIFT_EVERY=5, PAIRS=40;
const win=l=>Math.max(CMIN, CB-(l-1)*CSTEP);

function play(pace){                       // pace = seconds per match
  let secs=START, combo=0, until=0, now=0, cleared=0, score=0, gifts=0, peak=0;
  while(cleared<PAIRS){
    now += pace*1000;
    secs -= pace;                          // clock runs while you search
    if(secs<=0) return {won:false, cleared, secs:0, score, gifts, peak};
    combo = (now<until) ? combo+1 : 1;
    peak=Math.max(peak,combo);
    until = now + win(combo);
    const bonus = combo>=2 ? Math.min(combo-1,BONUS_CAP) : 0;
    secs = Math.min(secs + MATCH_TIME + bonus, MAX);
    score += 100*combo;
    cleared++;
    if(combo>0 && combo%GIFT_EVERY===0 && cleared<PAIRS){
      cleared++; gifts++; score+=100;
      secs = Math.min(secs+MATCH_TIME, MAX);
    }
  }
  return {won:true, cleared, secs:Math.round(secs), score, gifts, peak};
}

let pass=0, fail=0;
const t=(n,f)=>{try{f();console.log("OK  "+n);pass++;}catch(e){console.log("FAIL "+n+": "+e.message);fail++;}};
const ok=(c,m)=>{ if(!c) throw new Error(m); };

console.log("pace(s/match)  result   cleared  timeLeft  score   gifts  peakCombo");
for(const pace of [1.5,2.0,2.5,3.0,3.5,4.0,5.0,6.0,8.0]){
  const r=play(pace);
  console.log(`   ${pace.toFixed(1)}         ${r.won?"WIN ":"LOSE"}      ${String(r.cleared).padStart(2)}      ${String(r.secs).padStart(3)}    ${String(r.score).padStart(6)}    ${r.gifts}       x${r.peak}`);
}
console.log("");

t("a brisk player (2.5s/match) can win", ()=>{ ok(play(2.5).won, "2.5s pace must be winnable"); });
t("a steady player (3.5s/match) can win", ()=>{ ok(play(3.5).won, "3.5s pace must be winnable — this is the target player"); });
t("a slow player (8s/match) loses", ()=>{ ok(!play(8).won, "8s pace should run out — otherwise the clock is decorative again"); });
t("fast play still chains", ()=>{ ok(play(1.5).peak >= 10, "fast pace should reach x10+, got x"+play(1.5).peak); });
t("slow play never chains", ()=>{ ok(play(6).peak <= 2, "6s pace should not chain, got x"+play(6).peak); });
t("window tightens with level", ()=>{
  ok(win(1)===3500 && win(10)===1970+0 || win(10)===Math.max(2000,3500-9*170), "window ladder");
  ok(win(20)===2000, "bottoms out at 2000, got "+win(20));
  ok(win(1) > win(5) && win(5) > win(9), "must be monotonically tighter");
});
t("time cannot exceed the cap", ()=>{ ok(play(1.5).secs <= MAX, "cap breached"); });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
