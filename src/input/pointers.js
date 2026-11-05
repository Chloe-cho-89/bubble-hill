import { CONFIG } from '../config.js';
export class PointerState {
 constructor(limit=CONFIG.maxPointers){this.limit=limit;this.active=new Map();}
 start(id,x,y){if(this.active.has(id)||this.active.size>=this.limit)return false;this.active.set(id,{id,x,y,held:0,credit:0});return true;}
 move(id,x,y){const p=this.active.get(id);if(p){p.x=x;p.y=y;}}
 end(id){this.active.delete(id);}
 clear(){this.active.clear();}
}
export function bindPointers(canvas,state,onStart,onClear=()=>{}){
 const listeners=[];
 const listen=(el,name,fn,opts)=>{el.addEventListener(name,fn,opts);listeners.push(()=>el.removeEventListener(name,fn,opts));};
 const position=e=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
 const stop=()=>{for(const id of state.active.keys()){if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}state.clear();onClear();};
 listen(canvas,'pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();const [x,y]=position(e);
  if(state.start(e.pointerId,x,y)){canvas.setPointerCapture(e.pointerId);onStart(state.active.get(e.pointerId));}
 },{passive:false});
 listen(canvas,'pointermove',e=>{if(!state.active.has(e.pointerId))return;e.preventDefault();state.move(e.pointerId,...position(e));},{passive:false});
 const end=e=>{state.end(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,name,end);
 listen(canvas,'contextmenu',e=>e.preventDefault());
 listen(window,'blur',stop);listen(window,'pagehide',stop);
 listen(document,'visibilitychange',()=>{if(document.hidden)stop();});
 listen(window,'resize',stop);
 return ()=>{stop();listeners.forEach(fn=>fn());};
}

