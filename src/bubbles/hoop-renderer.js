import { drawFilm } from './film.js';
import { CONFIG } from '../config.js';
import { getShape,shapePath } from '../data/shapes.js';
export function bubbleVisibility(camera,b,p,m){
  const smooth=(a,z,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(z-a)));return t*t*(3-2*t);};
  let alpha=smooth(CONFIG.nearFadeStart,CONFIG.nearFadeEnd,p.d)*Math.min(1,CONFIG.newbornAlpha+b.age*CONFIG.fadeInRate);
  const radius=b.radius*p.scale;
  // Track the first silhouette exit, including the soft edge, rather than elapsed time.
  let silhouette=1,foreground=1;
  for(const [y,r] of [[1.23,.55],[.58,.38]]){
   const q=camera.project({x:m.x,y,z:m.z});if(!q)continue;
   const distance=Math.hypot(p.x-q.x,p.y-q.y);
   const overlap=smooth(radius+r*q.scale,radius+(r+CONFIG.overlapFeather)*q.scale,distance);
   silhouette*=overlap;
   if(p.d<q.d+CONFIG.overlapDepth)foreground*=overlap;
  }
  if(b.hasLeftSilhouette===undefined)b.hasLeftSilhouette=silhouette>=1;
  if(silhouette>=1)b.hasLeftSilhouette=true;
  const protectedBirth=!b.hasLeftSilhouette;
  const overlapAlpha=protectedBirth
   ? (b.radius>=CONFIG.largeOverlapRadius?CONFIG.largeOverlapFloor+(1-CONFIG.largeOverlapFloor)*silhouette:1)
   : foreground;
  alpha*=overlapAlpha;
  if(b.single)return Math.max(.36,overlapAlpha)*smooth(CONFIG.nearFadeStart,CONFIG.nearFadeEnd,p.d)*(.45+.55*(1-smooth(CONFIG.oversizeFadeStart,CONFIG.oversizeFadeEnd,radius/Math.min(camera.w,camera.h))));
  return Math.max(0,alpha*(1-smooth(CONFIG.oversizeFadeStart,CONFIG.oversizeFadeEnd,radius/Math.min(camera.w,camera.h))));
 }

function drawSunsetReflection(c, bubble, radius, shape, time) {
  const reveal = Math.min(1, Math.max(0, (bubble.radius / CONFIG.hoopRadius - 1) / 3));
  c.save();
  c.beginPath();
  shapePath(c, shape, radius);
  c.clip();
  c.scale(radius, radius);
  c.globalAlpha *= .64;
  c.strokeStyle = '#ffebc2';
  c.lineWidth = .04;
  c.beginPath();
  c.arc(0, 0, .86, .18, .92);
  c.stroke();
  c.globalAlpha *= reveal;
  c.translate(0, .025 * Math.sin(time * 1.4 + bubble.phase));
  const glow = c.createRadialGradient(.32,.12,.02,.32,.12,.42);
  glow.addColorStop(0,'#fff0c9'); glow.addColorStop(1,'#f8c8b100');
  c.fillStyle = glow; c.fillRect(-1,-1,2,2);
  c.beginPath(); c.ellipse(-.24,-.18,.22,.046,-.07,0,Math.PI*2);
  c.fillStyle='#fff3dc'; c.fill();
  c.beginPath(); c.moveTo(-1,.28);
  c.bezierCurveTo(-.44,-.04,.26,.71,1,.14);
  c.quadraticCurveTo(.24,.86,-1,.46);
  c.fillStyle='#b79aaa'; c.fill();
  c.restore();
}

export function queueHoopBubbles(renderer,system,world){
 const c=renderer.ctx;
 for(const b of system.items){const p=renderer.project(b);if(!p)continue;const shape=getShape(b.shapeId);
 const visibility=bubbleVisibility(renderer,b,p,world);
 const character=renderer.project({x:world.x,y:1.23,z:world.z});
 const growing=b===system.attached;
 const wave=growing ? 1+b.wobble*Math.sin(system.time*9) : 1;
 // Draw just the membrane outline after the world, with the same shape as its body.
 if(growing){
  renderer.queue.push({d:0,draw(){
   c.save();
   c.translate(p.x,p.y);
   c.scale(wave,1/wave);
   c.globalAlpha=.55*Math.min(1,Math.max(0,(p.d-CONFIG.nearFadeStart)/(CONFIG.nearFadeEnd-CONFIG.nearFadeStart)));
   c.beginPath();
   shapePath(c,shape.id,b.radius*p.scale);
   c.lineWidth=1.5;
   c.strokeStyle='#987e94';
   c.stroke();
   c.lineWidth=.7;
   c.strokeStyle='#fff9e9';
   c.stroke();
   c.restore();
  }});
 }
 const depth=!growing&&!b.hasLeftSilhouette&&character?Math.min(p.d,character.d-CONFIG.birthLayerOffset):p.d;
 renderer.queue.push({d:depth,draw(){const progress=b.popAge===null?0:b.popAge/CONFIG.popSeconds,r=b.radius*p.scale*(1+progress*.16);c.save();c.globalAlpha=visibility*(1-progress);c.translate(p.x,p.y);if(growing)c.scale(wave,1/wave);
 if(b.popAge!==null){c.strokeStyle='#fff8e8';c.lineWidth=.8;for(let i=0;i<6;i++){const a=b.phase+i*Math.PI/3,d=r*(1+progress*.2);c.beginPath();c.moveTo(Math.cos(a)*d,Math.sin(a)*d);c.lineTo(Math.cos(a)*(d+2),Math.sin(a)*(d+2));c.stroke();}}
 else{drawFilm(c,r,b.baseColor,world.strength,b.materialId,system.time,shape.id);if(b.single)drawSunsetReflection(c,b,r,shape.id,system.time);}c.restore();}});
 }
}

