import { CONFIG, SINGLE } from '../config.js';
import { HoopBubbles } from './hoop-system.js';

// Piecewise log-survival: exact standard targets at 10, 15 and 20 hoop radii.
// Gentle/brisk scale cumulative hazard by standard / preset.
export function burstLoad(multiple, median=SINGLE.presets.standard, misses=0) {
 const points=SINGLE.survival.map(point=>({...point}));
 points[2].chance=Math.min(SINGLE.pityMax,points[2].chance+Math.max(0,misses-SINGLE.pityAfter)*SINGLE.pityStep);
 const x=Math.max(1,Math.min(SINGLE.cap,multiple));
 for(let i=1;i<points.length;i++)if(x<=points[i].size){
  const a=points[i-1],b=points[i],t=(x-a.size)/(b.size-a.size);
  return (-(1-t)*Math.log(a.chance)-t*Math.log(b.chance))*SINGLE.presets.standard/median;
 }
 return Infinity;
}
export function sampleBurstSize(randomValue,median=SINGLE.presets.standard,misses=0,guaranteed=false) {
 const u=Math.max(0,Math.min(1-Number.EPSILON,randomValue));
 const target=-Math.log1p(-u)+(guaranteed?burstLoad(10,median,misses):0);
 if(target>=burstLoad(SINGLE.cap,median,misses))return SINGLE.cap;
 let lo=guaranteed?10:1,hi=SINGLE.cap;
 for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(burstLoad(mid,median,misses)<target)lo=mid;else hi=mid;}
 return Math.max(guaranteed?10+1e-8:1, (lo+hi)/2);
}
export function recordSizeText(size) {
 return Math.round(Math.max(0,Number.isFinite(size)?size:0)*SINGLE.cmPerHoop)+'cm';
}
export function syncRecordDisplay(element,blower,notice) {
 blower.refreshDay();
 const single=blower.mode==='single',fresh=single && blower.sparkUntil>blower.time;
 if(element){
  element.hidden=!single;
  const text=blower.chipCollapsed?'🫧 '+recordSizeText(blower.record.best):
   '🫧 오늘 '+recordSizeText(blower.record.today)+' · 최고 '+recordSizeText(blower.record.best);
  if(element.textContent!==text)element.textContent=text;
  element.classList.toggle('new-record',fresh);
  element.setAttribute?.('aria-expanded',String(!blower.chipCollapsed));
  element.setAttribute?.('aria-label',text+(blower.chipCollapsed?' · 기록 펼치기':' · 기록 접기'));
 }
 if(notice){
  const text=single && blower.noticeUntil>blower.time?blower.noticeText:'';
  if(notice.textContent!==text)notice.textContent=text;
  notice.hidden=!text;
  notice.classList?.toggle('new-record',fresh);
 }
}

export class HillBlower extends HoopBubbles {
 constructor(world,random=Math.random,storage=null,now=()=>new Date()) {
  super(world,random);
  this.storage=storage;this.now=now;
  this.median=SINGLE.presets[SINGLE.defaultRisk];
  this.mode='stream';this.record={day:'',today:0,best:0};
  this.assist={attempts:0,seen100:false,miss150:0};this.chipCollapsed=false;
  try {
   const saved=JSON.parse(storage?.getItem(SINGLE.key)||'{}');
   if(saved.mode==='single')this.mode='single';
   for(const key of ['today','best'])if(Number.isFinite(saved[key])&&saved[key]>0)this.record[key]=saved[key];
   this.record.day=saved.day;
   this.chipCollapsed=saved.chipCollapsed===true;
   if(saved.assist){
    for(const key of ['attempts','miss150'])if(Number.isSafeInteger(saved.assist[key])&&saved.assist[key]>=0)this.assist[key]=saved.assist[key];
    this.assist.seen100=saved.assist.seen100===true;
   }
   if(this.record.best>=10)this.assist.seen100=true;
  }catch{}
  this.refreshDay();
 }
 refreshDay(){const day=this.now().toDateString();if(this.record.day!==day){this.record.day=day;this.record.today=0;}}
 save(){try{this.storage?.setItem(SINGLE.key,JSON.stringify({...this.record,mode:this.mode,chipCollapsed:this.chipCollapsed,assist:this.assist}));}catch{}}
 toggleChip(){this.chipCollapsed=!this.chipCollapsed;this.save();}
 switchMode(){this.cancel();this.mode=this.mode==='single'?'stream':'single';this.save();}
 announce(text){this.noticeText=text;this.noticeUntil=this.time+SINGLE.celebrationSeconds;}
 start(){
  if(this.active)return;
  this.onBreath?.();
  if(this.mode==='stream')return super.start();
  this.active=true;this.held=0;this.reached100=false;this.reached150=false;
  this.assist.attempts=Math.min(Number.MAX_SAFE_INTEGER,this.assist.attempts+1);
  const guaranteed=!this.assist.seen100&&this.assist.attempts>=SINGLE.guaranteeAttempt;
  if(this.items.length>=CONFIG.maxBubbles)this.items.shift();
  this.spawn(CONFIG.hoopRadius);this.attached=this.items.at(-1);
  this.attached.single=true;this.attached.wobble=0;
  this.burstSize=sampleBurstSize(this.random(),this.median,this.assist.miss150,guaranteed);
  this.save();this.anchor();
 }
 anchor(){const b=this.attached,w=this.world,ring=w.ring();b.x=ring.x+Math.sin(w.heading)*b.radius;b.z=ring.z+Math.cos(w.heading)*b.radius;b.y=ring.y;}
 release(record){
  const b=this.attached;if(!b)return;
  this.attached=null;b.age=0;b.vx=Math.sin(this.world.heading)*CONFIG.forwardSpeed;b.vz=Math.cos(this.world.heading)*CONFIG.forwardSpeed;
  if(!this.reached150)this.assist.miss150=Math.min(Number.MAX_SAFE_INTEGER,this.assist.miss150+1);
  if(record){
   this.refreshDay();const size=b.radius/CONFIG.hoopRadius;
   if(size>this.record.today||size>this.record.best){
    this.sparkUntil=this.time+SINGLE.celebrationSeconds;
    const milestone=this.noticeUntil>this.time && ['1m 돌파!','전설의 방울!'].includes(this.noticeText)?this.noticeText+' · ':'';
    this.announce(milestone+'새 기록!');
   }
   this.record.today=Math.max(this.record.today,size);this.record.best=Math.max(this.record.best,size);
  }
  this.save();
 }
 stop(){this.release(true);super.stop();}
 cancel(){this.release(false);super.cancel();}
 update(dt){
  if(this.mode==='stream')return super.update(dt);
  if(!Number.isFinite(dt)||dt<=0)return;
  dt=Math.min(dt,CONFIG.maxStep);
  const b=this.attached,pressing=this.active;
  if(b)this.items.pop();
  this.active=false;const lift=this.world.lift;super.update(dt);this.active=pressing;
  this.world.lift=lift+(Number(pressing)-lift)*(1-Math.exp(-CONFIG.liftRate*dt));
  if(!b)return;
  this.held+=dt;
  const multiple=Math.min(1+this.held*SINGLE.growth,this.burstSize,SINGLE.cap);
  b.radius=CONFIG.hoopRadius*multiple;b.age+=dt;this.anchor();
  b.wobble=SINGLE.wobble*(1-Math.exp(-burstLoad(multiple,this.median,this.assist.miss150)));
  this.items.push(b);
  if(!this.reached100 && multiple>=10){this.reached100=true;this.assist.seen100=true;this.announce('1m 돌파!');this.save();}
  if(!this.reached150 && multiple>=15){this.reached150=true;this.assist.miss150=0;this.announce('전설의 방울!');this.save();}
  if(multiple>=this.burstSize || multiple>=SINGLE.cap){
   if(multiple>=9 && multiple<10)this.announce('아깝다! 1m까지 '+Math.ceil((10-multiple)*SINGLE.cmPerHoop)+' cm');
   this.release(false);b.popAge=0;this.onPop?.();
  }
 }
}
