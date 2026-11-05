import { CONFIG, SINGLE } from '../config.js';
import { HoopBubbles } from './hoop-system.js';

export function burstLoad(multiple, median) {
 // Cumulative hazard from one hoop diameter, calibrated to 50% at the median.
 return Math.LN2 * (multiple ** 3 - 1) / (median ** 3 - 1);
}

export class HillBlower extends HoopBubbles {
 constructor(world, random=Math.random, storage=null, now=()=>new Date()) {
  super(world,random);
  this.storage=storage;
  this.now=now;
  this.median=SINGLE.presets[SINGLE.defaultRisk];
  this.mode='stream';
  this.record={day:'',today:0,best:0};
  try {
   const saved=JSON.parse(storage?.getItem(SINGLE.key) || '{}');
   if(saved.mode==='single') this.mode='single';
   for(const key of ['today','best']) if(Number.isFinite(saved[key]) && saved[key]>0) this.record[key]=saved[key];
   this.record.day=saved.day;
  } catch {}
  this.refreshDay();
 }
 refreshDay() {
  const day=this.now().toDateString();
  if(this.record.day!==day){this.record.day=day;this.record.today=0;}
 }
 save() {
  try {this.storage?.setItem(SINGLE.key,JSON.stringify({...this.record,mode:this.mode}));} catch {}
 }
 switchMode() {
  this.cancel();
  this.mode=this.mode==='single'?'stream':'single';
  this.save();
 }
 start() {
  if(this.active) return;
  this.onBreath?.();
  if(this.mode==='stream') return super.start();
  this.active=true;
  this.held=0;
  if(this.items.length>=CONFIG.maxBubbles)this.items.shift();
  this.spawn(CONFIG.hoopRadius);
  this.attached=this.items.at(-1);
  this.attached.single=true;
  this.attached.wobble=0;
  this.burstThreshold=-Math.log1p(-this.random());
  this.anchor();
 }
 anchor() {
  const b=this.attached, w=this.world, ring=w.ring();
  b.x=ring.x+Math.sin(w.heading)*b.radius;
  b.z=ring.z+Math.cos(w.heading)*b.radius;
  b.y=ring.y;
 }
 release(record) {
  const b=this.attached;
  if(!b)return;
  this.attached=null;
  b.age=0;
  b.vx=Math.sin(this.world.heading)*CONFIG.forwardSpeed;
  b.vz=Math.cos(this.world.heading)*CONFIG.forwardSpeed;
  if(record){
   this.refreshDay();
   const size=b.radius/CONFIG.hoopRadius;
   if(size>this.record.today || size>this.record.best)this.sparkUntil=this.time+1;
   this.record.today=Math.max(this.record.today,size);
   this.record.best=Math.max(this.record.best,size);
   this.save();
  }
 }
 stop(){this.release(true);super.stop();}
 cancel(){this.release(false);super.cancel();}
 update(dt) {
  if(this.mode==='stream')return super.update(dt);
  if(!Number.isFinite(dt)||dt<=0)return;
  dt=Math.min(dt,CONFIG.maxStep);
  const b=this.attached, pressing=this.active;
  if(b)this.items.pop(); // Attached bubble is always the last item.
  this.active=false;
  const lift=this.world.lift;
  super.update(dt);
  this.active=pressing;
  this.world.lift=lift+(Number(pressing)-lift)*(1-Math.exp(-CONFIG.liftRate*dt));
  if(!b)return;
  this.held+=dt;
  const multiple=1+this.held*SINGLE.growth;
  b.radius=CONFIG.hoopRadius*multiple;
  b.age+=dt;
  this.anchor();
  const load=burstLoad(multiple,this.median);
  b.wobble=SINGLE.wobble*(1-Math.exp(-load));
  this.items.push(b);
  if(load>=this.burstThreshold){this.release(false);b.popAge=0;this.onPop?.();}
 }
}
