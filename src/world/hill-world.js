import { CONFIG } from '../config.js';
import { wrap,limitPoint } from './math.js';
export class HillWorld {
 constructor(){this.x=0;this.z=0;this.yaw=.65;this.heading=Math.PI;this.walk=0;this.time=0;this.moving=false;this.target=null;this.lift=0;this.appearance={baseColor:CONFIG.baseColor,materialId:CONFIG.materialId,shapeId:CONFIG.shapeId};}
 rotate(delta){this.yaw=wrap(this.yaw+delta);}
 setTarget(x,z){if(Number.isFinite(x)&&Number.isFinite(z))this.target=limitPoint(x,z);}
 ring(){return {x:this.x+Math.sin(this.heading)*(.24+this.lift*.36),y:.68+this.lift*.55,z:this.z+Math.cos(this.heading)*(.24+this.lift*.36)};}
 clearInput(){this.target=null;this.moving=false;}
 update(dt,move={x:0,y:0}){
  if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);this.time+=dt;
  let dx=move.x*Math.cos(this.yaw)+move.y*Math.sin(this.yaw),dz=-move.x*Math.sin(this.yaw)+move.y*Math.cos(this.yaw);
  let distanceLimit=Infinity;
  if(Math.hypot(dx,dz)>.05)this.target=null;
  else if(this.target){dx=this.target.x-this.x;dz=this.target.z-this.z;distanceLimit=Math.hypot(dx,dz);}
  const length=Math.hypot(dx,dz);this.moving=false;
  if(length<1e-8){if(this.target)this.target=null;return;}
  const speed=Number.isFinite(distanceLimit)?1.35:Math.min(1,length)*1.35;
  const step=Math.min(speed*dt,distanceLimit),next=limitPoint(this.x+dx/length*step,this.z+dz/length*step);
  const distance=Math.hypot(next.x-this.x,next.z-this.z);this.x=next.x;this.z=next.z;this.walk+=distance*6;this.moving=distance>1e-8;
  this.heading=wrap(this.heading+wrap(Math.atan2(dx,dz)-this.heading)*(1-Math.exp(-12*dt)));
  if(this.target&&distanceLimit<=step+1e-8)this.target=null;
 }
}
