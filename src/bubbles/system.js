import { CONFIG } from '../config.js';
export function radiusForHold(seconds){return CONFIG.minRadius+(CONFIG.maxRadius-CONFIG.minRadius)*Math.max(0,Math.min(1,seconds/CONFIG.growSeconds));}
export class BubbleSystem {
 constructor(random=Math.random){this.random=random;this.items=[];this.time=0;this.totalEmitted=0;}
 spawn(p,count=1){
  for(let i=0;i<count&&this.items.length<CONFIG.maxBubbles;i++){
   const r=this.random;
   this.items.push({x:p.x,y:p.y,radius:Math.min(CONFIG.maxRadius,radiusForHold(p.held)*(0.85+r()*.3)),
    vx:.018+r()*.02,vy:-.04-r()*.04,phase:r()*Math.PI*2,
    age:0,life:CONFIG.lifeSeconds+r()*CONFIG.lifeVariation,popAge:null,baseColor:CONFIG.baseColor,materialId:CONFIG.materialId,shapeId:CONFIG.shapeId});
   this.totalEmitted++;
  }
 }
 update(dt,pointers){
  if(!Number.isFinite(dt)||dt<=0)return;
  // The loop caps background gaps; this method remains independent of refresh rate.
  this.time+=dt;
  for(const p of pointers.values()){
   p.held+=dt;p.credit+=dt*CONFIG.rate;
   const count=Math.floor(p.credit+1e-9);p.credit-=count;
   if(count>0)this.spawn(p,count);
  }
  this.items=advanceBubbles(this.items,dt,this.time);
 }
}



export function advanceBubbles(items,dt,time,world=false,onPop){
 for(const b of items){b.age+=dt;if(b.popAge!==null){b.popAge+=dt;continue;}
 b.x+=(b.vx+Math.sin(time*.5+b.phase)*(world?.06:.012))*dt;b.y+=b.vy*dt;
 if(world){b.z+=b.vz*dt;b.vx*=Math.exp(-.14*dt);b.vz*=Math.exp(-.14*dt);}
 if(b.age>=b.life||(!world&&(b.y<-.09||b.x>1.1))){b.popAge=0;onPop?.();}
 }return items.filter(b=>b.popAge===null||b.popAge<CONFIG.popSeconds);
}

