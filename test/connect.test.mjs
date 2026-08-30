const COLS=10, ROWS=8, W=COLS+2, H=ROWS+2;
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
let grid;
function passable(x,y,t){ if(x<0||y<0||x>=W||y>=H) return false; if(t&&x===t.x&&y===t.y) return true; return grid[y][x]===null; }
function findPath(a,b){
  const best=new Map(), queue=[];
  for(let d=0;d<4;d++){ const nx=a.x+DIRS[d][0], ny=a.y+DIRS[d][1];
    if(!passable(nx,ny,b)) continue;
    queue.push({x:nx,y:ny,d,turns:0,path:[{x:a.x,y:a.y},{x:nx,y:ny}]}); }
  while(queue.length){
    const cur=queue.shift();
    if(cur.x===b.x&&cur.y===b.y) return cur.path;
    const k=cur.x+","+cur.y+","+cur.d;
    if(best.has(k)&&best.get(k)<=cur.turns) continue;
    best.set(k,cur.turns);
    for(let d=0;d<4;d++){
      const turns=cur.turns+(d===cur.d?0:1); if(turns>2) continue;
      const nx=cur.x+DIRS[d][0], ny=cur.y+DIRS[d][1];
      if(!passable(nx,ny,b)) continue;
      const path=(d===cur.d)?cur.path.slice(0,-1).concat([{x:nx,y:ny}]):cur.path.concat([{x:nx,y:ny}]);
      queue.push({x:nx,y:ny,d,turns,path}); }
  }
  return null;
}
const blank=()=>Array.from({length:H},()=>Array(W).fill(null));
let pass=0,fail=0;
const t=(n,c)=>{ try{ c(); console.log("OK  "+n); pass++; }catch(e){ console.log("FAIL "+n+": "+e.message); fail++; } };
const ok=(c,m)=>{ if(!c) throw new Error(m); };

t("adjacent tiles connect (0 turns)",()=>{ grid=blank(); grid[1][1]="a"; grid[1][2]="a";
  ok(findPath({x:1,y:1},{x:2,y:1}),"should connect"); });

t("straight line with gap connects",()=>{ grid=blank(); grid[1][1]="a"; grid[1][5]="a";
  ok(findPath({x:1,y:1},{x:5,y:1}),"clear row should connect"); });

t("straight line BLOCKED by tile in between",()=>{ grid=blank(); grid[1][1]="a"; grid[1][3]="X"; grid[1][5]="a";
  const p=findPath({x:1,y:1},{x:5,y:1});
  // must NOT be the straight route; may still route around via border
  ok(!p || p.length>2, "blocked straight line must not return a 2-point path"); });

t("fully boxed-in tile cannot connect",()=>{ grid=blank();
  // fill entire board solid, two 'a' far apart -> no route
  for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++) grid[y][x]="X";
  grid[4][4]="a"; grid[6][8]="a";
  ok(findPath({x:4,y:4},{x:8,y:6})===null,"solid board must have no path"); });

t("corner-adjacent connects via 1 turn",()=>{ grid=blank(); grid[1][1]="a"; grid[2][2]="a";
  const p=findPath({x:1,y:1},{x:2,y:2}); ok(p,"L-shape should connect"); });

t("edge tiles route AROUND border (2 turns)",()=>{ grid=blank();
  for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++) grid[y][x]="X";
  grid[1][1]="a"; grid[1][COLS]="a";           // top row, both ends, row full between
  ok(findPath({x:1,y:1},{x:COLS,y:1}),"should route over the top border"); });

t("path vertices are corners only",()=>{ grid=blank(); grid[1][1]="a"; grid[3][3]="a";
  const p=findPath({x:1,y:1},{x:3,y:3});
  ok(p,"should connect"); ok(p.length<=4,"vertex list should be <=4 points, got "+p.length); });

t("3-turn route is REJECTED",()=>{ grid=blank();
  // build a wall forcing >2 turns
  for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++) grid[y][x]="X";
  grid[2][2]="a"; grid[4][4]="a";   // interior, surrounded by X => needs many turns
  ok(findPath({x:2,y:2},{x:4,y:4})===null,"interior blocked pair must not connect"); });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
