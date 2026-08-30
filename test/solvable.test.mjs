const COLS=10,ROWS=8,W=COLS+2,H=ROWS+2,DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const FACES=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t"];
let grid;
function passable(x,y,t){if(x<0||y<0||x>=W||y>=H)return false;if(t&&x===t.x&&y===t.y)return true;return grid[y][x]===null;}
function findPath(a,b){const best=new Map(),q=[];
 for(let d=0;d<4;d++){const nx=a.x+DIRS[d][0],ny=a.y+DIRS[d][1];if(!passable(nx,ny,b))continue;
  q.push({x:nx,y:ny,d,turns:0,path:[{x:a.x,y:a.y},{x:nx,y:ny}]});}
 while(q.length){const c=q.shift();if(c.x===b.x&&c.y===b.y)return c.path;
  const k=c.x+","+c.y+","+c.d;if(best.has(k)&&best.get(k)<=c.turns)continue;best.set(k,c.turns);
  for(let d=0;d<4;d++){const t2=c.turns+(d===c.d?0:1);if(t2>2)continue;
   const nx=c.x+DIRS[d][0],ny=c.y+DIRS[d][1];if(!passable(nx,ny,b))continue;
   q.push({x:nx,y:ny,d,turns:t2,path:(d===c.d)?c.path.slice(0,-1).concat([{x:nx,y:ny}]):c.path.concat([{x:nx,y:ny}])});}}
 return null;}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
function pairs(){const s=[];for(let y=1;y<=ROWS;y++)for(let x=1;x<=COLS;x++)if(grid[y][x]!==null)s.push({x,y,f:grid[y][x]});
 const o=[];for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++){if(s[i].f!==s[j].f)continue;if(findPath(s[i],s[j]))o.push([s[i],s[j]]);}return o;}
function reshuffle(){const f=[],sp=[];for(let y=1;y<=ROWS;y++)for(let x=1;x<=COLS;x++)if(grid[y][x]!==null){f.push(grid[y][x]);sp.push({x,y});}
 shuf(f);sp.forEach((s,i)=>grid[s.y][s.x]=f[i]);}

let games=0, wins=0, maxShuf=0;
for(let g=0; g<200; g++){
  const total=COLS*ROWS, pool=[];
  for(let i=0;i<total/2;i++) pool.push(FACES[i%FACES.length],FACES[i%FACES.length]);
  shuf(pool);
  grid=Array.from({length:H},()=>Array(W).fill(null));
  let k=0; for(let y=1;y<=ROWS;y++)for(let x=1;x<=COLS;x++)grid[y][x]=pool[k++];
  let rem=total, shufCount=0, steps=0;
  while(rem>0 && steps++ < 500){
    let p=pairs();
    if(p.length===0){ reshuffle(); shufCount++; if(shufCount>80){break;} continue; }
    const [a,b]=p[Math.floor(Math.random()*p.length)];
    grid[a.y][a.x]=null; grid[b.y][b.x]=null; rem-=2;
  }
  games++; if(rem===0) wins++;
  maxShuf=Math.max(maxShuf,shufCount);
}
console.log(`${wins}/${games} boards played to completion; max reshuffles needed in one game: ${maxShuf}`);
process.exit(wins===games?0:1);
