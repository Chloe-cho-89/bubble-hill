import { SCENERY_FADE } from '../config.js';
import { OrbitCamera } from './camera.js';
import { placeholderArt } from '../art/placeholder.js';
export class HillRenderer extends OrbitCamera {
 constructor(view,art=placeholderArt){super(view.width,view.height);this.view=view;this.ctx=view.ctx;this.art=art;Object.assign(this,art.createScenery());this.queue=[];}
 // The art adapter queues all primitives of a prop together so they share one fade.
 queueProp(prop, radius, world, enqueue){
  const dx = this.cam.x - world.x, dz = this.cam.z - world.z;
  const along = Math.max(0, Math.min(1, ((prop.x-world.x)*dx + (prop.z-world.z)*dz)/(dx*dx+dz*dz)));
  const distance = Math.hypot(prop.x-world.x-along*dx, prop.z-world.z-along*dz);
  const target = distance <= radius + SCENERY_FADE.pathMargin ? SCENERY_FADE.opacity : 1;
  this.propFade ??= new WeakMap();
  const previous = this.propFade.get(prop);
  const step = previous ? Math.max(0,world.time-previous.time)*(1-SCENERY_FADE.opacity)/SCENERY_FADE.seconds : 1;
  const opacity = previous ? previous.opacity + Math.max(-step,Math.min(step,target-previous.opacity)) : target;
  this.propFade.set(prop,{opacity,time:world.time});
  const start = this.queue.length;
  enqueue();
  for(let i=start;i<this.queue.length;i++) this.queue[i].propOpacity = opacity;
 } blob(p,rx,ry,color,outline=false){const v=this.project(p);if(!v)return;this.queue.push({d:v.d,draw:()=>{const ctx=this.ctx;ctx.beginPath();ctx.ellipse(v.x,v.y,Math.max(.2,rx*v.scale),Math.max(.2,ry*v.scale),0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(outline){ctx.strokeStyle='#896579';ctx.lineWidth=Math.max(.6,v.scale*.014);ctx.stroke();}}});}
 line(points,color,width=0.025,closed=false){const ps=points.map(p=>this.project(p));if(ps.some(p=>!p))return;this.queue.push({d:ps.reduce((s,p)=>s+p.d,0)/ps.length,draw:()=>{const c=this.ctx;c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(closed)c.closePath();c.strokeStyle=color;c.lineWidth=Math.max(.8,ps[0].scale*width);c.lineCap='round';c.lineJoin='round';c.stroke();}});}

 draw(m,overlay=()=>{}){this.update(m,this.view.width,this.view.height);this.art.background.call(this,m);this.queue=[];this.art.scenery.call(this,m);this.art.character.call(this,m);overlay(this,m);this.queue.sort((a,b)=>b.d-a.d);for(const item of this.queue){if(item.propOpacity === undefined || item.propOpacity === 1){item.draw();continue;}this.ctx.save();this.ctx.globalAlpha *= item.propOpacity;item.draw();this.ctx.restore();}}
}

