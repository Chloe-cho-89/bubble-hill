import { CONFIG } from '../config.js';
import { BubbleSystem,advanceBubbles } from './system.js';
import { getShape } from '../data/shapes.js';
export class HoopBubbles extends BubbleSystem {
 constructor(world,random=Math.random){super(random);this.world=world;this.active=false;this.held=0;this.credit=0;this.pending=0;this.burstClock=0;}
 start(){if(this.active)return;this.active=true;this.held=0;this.credit=0;this.pending=CONFIG.tapCount;this.burstClock=CONFIG.tapInterval;}
 stop(){this.active=false;this.held=0;this.credit=0;}
 tap(){this.start();this.stop();}
 cancel(){this.stop();this.pending=0;this.burstClock=0;this.world.lift=0;}
 radius(){return CONFIG.minRadius+(CONFIG.maxRadius-CONFIG.minRadius)*Math.min(1,this.held/CONFIG.growSeconds);}
 spawn(radius=this.radius()){
  if(this.items.length>=CONFIG.maxBubbles)return;
  const w=this.world,p=w.ring(),r=this.random,side=this.totalEmitted%2?1:-1;
  this.items.push({...p,radius,vx:Math.sin(w.heading)*CONFIG.forwardSpeed+Math.cos(w.heading)*side*CONFIG.spreadSpeed,vz:Math.cos(w.heading)*CONFIG.forwardSpeed-Math.sin(w.heading)*side*CONFIG.spreadSpeed,vy:CONFIG.riseSpeed+r()*CONFIG.riseVariation,phase:r()*Math.PI*2,age:0,life:CONFIG.lifeSeconds+r()*CONFIG.lifeVariation,popAge:null,baseColor:w.appearance.baseColor,materialId:w.appearance.materialId,shapeId:getShape(w.appearance.shapeId).id});this.totalEmitted++;
 }
 update(dt){
  if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,CONFIG.maxStep);this.time+=dt;
  this.world.lift+=(Number(this.active||this.pending>0)-this.world.lift)*(1-Math.exp(-CONFIG.liftRate*dt));
  if(this.active)this.held+=dt;
  if(this.world.lift>CONFIG.emitLiftThreshold){
   if(this.pending){this.burstClock+=dt;if(this.burstClock>=CONFIG.tapInterval){this.spawn(CONFIG.minRadius);this.pending--;this.burstClock-=CONFIG.tapInterval;}}
   else if(this.active){this.credit+=dt*CONFIG.rate/(1+CONFIG.rateFalloff*Math.pow(this.radius()/CONFIG.maxRadius,2));while(this.credit>=1){this.spawn();this.credit--;}}
  }
  this.items=advanceBubbles(this.items,dt,this.time,true,this.onPop);
 }
}
