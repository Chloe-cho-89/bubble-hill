import { getCharacter } from '../data/characters.js';
import { getShape } from '../data/shapes.js';
import { HILL_EXIT } from '../config.js';
import { wrap } from '../world/math.js';
export function createScenery(){const scene={landmarks:[]};(function(){
  for(let i=0;i<14;i++){const a=i*Math.PI*2/14;this.landmarks.push({x:Math.sin(a)*9,z:Math.cos(a)*9,type:i%3,scale:.8+(i%4)*.18});}
  this.flowers=Array.from({length:90},(_,i)=>{const a=i*2.39996,r=2+Math.sqrt(i/90)*5.7;return{x:Math.sin(a)*r,z:Math.cos(a)*r,size:.03+(i%3)*.012};});
}).call(scene);return scene;}
export function drawBackground(m){
  const c=this.ctx,w=this.w,h=this.h;
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ddd6e6');g.addColorStop(.38,'#f9e2c4');g.addColorStop(.62,'#f4d2ac');g.addColorStop(1,'#e7dfc3');c.fillStyle=g;c.fillRect(0,0,w,h);
  const sunAngle=wrap(-m.yaw-.5);const sunX=w/2+sunAngle*w*.75;
  if(sunX>-100&&sunX<w+100){const glow=c.createRadialGradient(sunX,h*.33,0,sunX,h*.33,h*.22);glow.addColorStop(0,'#fff9ddcc');glow.addColorStop(1,'#fff9dd00');c.fillStyle=glow;c.fillRect(0,0,w,h);c.fillStyle='#fff3d6';c.beginPath();c.arc(sunX,h*.33,h*.055,0,Math.PI*2);c.fill();}
  for(let layer=0;layer<3;layer++){c.beginPath();c.moveTo(0,h);for(let x=0;x<=w+8;x+=8){const a=m.yaw+(x-w/2)/w*1.8;const y=h*(.46+layer*.095)+Math.sin(a*3+layer)*h*.045+Math.cos(a*5+layer*2)*h*.025;c.lineTo(x,y);}c.lineTo(w,h);c.closePath();c.fillStyle=['#d3c6cf','#c3cbb9','#bcc8a8'][layer];c.fill();}
  const ground=c.createLinearGradient(0,h*.64,0,h);ground.addColorStop(0,'#bcc8a800');ground.addColorStop(1,'#e1dfbd');c.fillStyle=ground;c.fillRect(0,h*.6,w,h*.4);
  for(let i=0;i<7;i++){const a=wrap(i*1.13-m.yaw),x=w/2+a*w*.7,y=h*(.17+(i%3)*.066);c.fillStyle='#fff4e3aa';c.beginPath();c.ellipse(x,y,w*(.07+(i%2)*.03),h*.016,0,0,Math.PI*2);c.fill();}
 }

// Board and post share one depth and one scenery fade.
function drawWoodenSign(ctx, board, foot, size, facingLeft) {
  ctx.save();
  ctx.translate(board.x, board.y);
  ctx.scale(size, size);
  const baseX = (foot.x - board.x) / size;
  const baseY = (foot.y - board.y) / size;
  ctx.strokeStyle = '#694c48';
  ctx.lineWidth = .13;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-.19, 0);
  ctx.lineTo(baseX - .21, baseY);
  ctx.lineTo(baseX + .19, baseY + .02);
  ctx.lineTo(.22, 0);
  ctx.closePath();
  ctx.fillStyle = '#ac8268';
  ctx.fill();
  ctx.stroke();

  ctx.save();
  if (facingLeft) ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.moveTo(-2.88, -.91);
  ctx.quadraticCurveTo(-3.08, -.91, -3.08, -.69);
  ctx.lineTo(-3.05, .68);
  ctx.quadraticCurveTo(-3.05, .9, -2.84, .89);
  ctx.lineTo(2.22, .84);
  ctx.quadraticCurveTo(2.34, .84, 2.43, .75);
  ctx.lineTo(3.16, .08);
  ctx.quadraticCurveTo(3.25, -.01, 3.14, -.12);
  ctx.lineTo(2.38, -.84);
  ctx.quadraticCurveTo(2.30, -.94, 2.15, -.93);
  ctx.closePath();
  ctx.fillStyle = '#dcba98';
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#aa826a';
  ctx.lineWidth = .065;
  ctx.beginPath();
  ctx.moveTo(-2.67, -.66);
  ctx.quadraticCurveTo(-1.86, -.74, -.96, -.66);
  ctx.moveTo(.62, .65);
  ctx.quadraticCurveTo(1.40, .57, 2.10, .62);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#48333a';
  ctx.font = 'bold 1px "Malgun Gothic", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('언덕 밖으로', facingLeft ? .30 : -.30, 0, 5.02);
  ctx.restore();
}

export function drawScenery(m){
  const board = this.project({...HILL_EXIT, y:1.05});
  const foot = this.project({...HILL_EXIT, y:0});
  if (board && foot) {
    const size = Math.max(12, Math.min(26, board.scale * .36));
    const facingLeft = HILL_EXIT.x * this.right.x + HILL_EXIT.z * this.right.z < 0;
    this.queueProp(HILL_EXIT, 3.25 * size / board.scale, m, () => {
      this.queue.push({d:board.d, draw:() => drawWoodenSign(this.ctx, board, foot, size, facingLeft)});
    });
  }
  // Soft stepping stones describe a small circular walking area.
  for(let i=0;i<42;i++){const a=i*Math.PI*2/42;this.blob({x:Math.sin(a)*5.6,y:.01,z:Math.cos(a)*5.6},.11,.035,'#e8e3c8');}
  for(const f of this.flowers){this.line([{x:f.x,y:0,z:f.z},{x:f.x,y:.14,z:f.z}],'#8f9d7c',.016);this.blob({x:f.x,y:.15,z:f.z},f.size,f.size,['#fbebcd','#e5c7ce','#d9cee2'][Math.round(f.x*f.x)%3]);}
  for(const o of this.landmarks){this.queueProp(o, Math.max(1.5,o.scale), m, ()=>{
   if(o.type===0){this.line([{x:o.x,y:0,z:o.z},{x:o.x,y:1.65*o.scale,z:o.z}],'#a89a87',.13);this.blob({x:o.x,y:1.8*o.scale,z:o.z},.85*o.scale,1.1*o.scale,'#aebc9e');this.blob({x:o.x-.3,y:2.05*o.scale,z:o.z-.2},.55*o.scale,.65*o.scale,'#c3cbaa');}
   else if(o.type===1){this.blob({x:o.x,y:.25,z:o.z},.7,.3,'#c1b9b7');this.blob({x:o.x+.5,y:.14,z:o.z+.3},.4,.18,'#d4cbbe');}
   else{this.blob({x:o.x,y:.6,z:o.z},1,.65,'#bac5a2');this.blob({x:o.x+.5,y:.4,z:o.z+.4},.8,.45,'#cbd0ad');}
  });}
  if(m.target){this.blob({x:m.target.x,y:.015,z:m.target.z},.22,.06,'#fff8e4a0');}

}
export function drawCharacter(m){
  const character=getCharacter(m.characterId);
  const sin=Math.sin(m.heading),cos=Math.cos(m.heading);
  const at=(x,y,z=0)=>({x:m.x+x*cos+z*sin,y,z:m.z-x*sin+z*cos});
  const bounce=m.moving?Math.abs(Math.sin(m.walk))*.035:Math.sin(m.time*1.5)*.012;
  this.blob(at(0,.02),.45,.09,'#7c88622b');
  for(const side of [-1,1]){const step=m.moving?Math.sin(m.walk)*side*.11:0;this.blob(at(side*.16,.14+Math.max(0,step),step),.16,.14,character.limbs,true);}
  this.blob(at(0,.58+bounce),.31,.43,character.body,true);
  // Hands lift the pendant hoop for blowing, instead of adding a second wand.
  for(const side of [-1,1]){const hand=at(side*(.32-m.lift*.08),.64+bounce+m.lift*.43,.03+m.lift*.49);this.line([at(side*.23,.78+bounce,.01),hand],character.limbs,.16);this.blob(hand,.095,.13,character.head,true);}
  this.blob(at(0,1.23+bounce),.5,.48,character.head,true);
  // Face features are world-oriented; hide them from the rear.
  const front=Math.cos(m.heading-m.yaw);
  if(front>-.1){
   if(character.id==='peach')this.blob(at(0,1.5+bounce,.4),.07,.04,character.mark);
   for(const side of [-1,1]){this.blob(at(side*.19,1.23+bounce,.43),.028,.037,'#59364e');this.blob(at(side*.30,1.08+bounce,.37),.08,.045,character.cheeks+'99');}
   const orb=m.appearance.baseColor;
   this.blob(at(0,.74+bounce,.30),.105,.108,orb?orb+'55':'#ffffff26');
   this.blob(at(0,.74+bounce,.31),.065,.067,orb??'#ffffff44',true);
   this.blob(at(-.02,.76+bounce,.34),.016,.014,'#fff9ef');
  }
  const ring=m.ring(),topL=at(-.19,.83,.22),topR=at(.19,.83,.22);
  this.line([topL,{x:ring.x,y:ring.y+.05,z:ring.z},topR],'#9b7d86',.017);
  const shape=getShape(m.appearance.shapeId), radius=shape.hoopRadius;
  const circle=shape.points.map(([x,y])=>({x:ring.x+x*radius*cos,y:ring.y-y*radius,z:ring.z-x*radius*sin}));
  circle.push(circle[0]);
  this.line(circle,'#937984',.035);
  if(m.lift>.5)this.line(circle,'#f5d9b6',.012);

}
export const placeholderArt={createScenery,background:drawBackground,scenery:drawScenery,character:drawCharacter};


export const doorIcon='🚪';
