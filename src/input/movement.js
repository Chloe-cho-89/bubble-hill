import { PointerState } from './pointers.js';
import { shouldResetViewport } from '../core/viewport.js';
export function bindMovement({canvas,stick,knob,left,right,blow},world,camera,viewport,blower=null){
 const blowing=new Set();let keyBlow=false;
 const pointers=new PointerState(2),keys=new Set(),turns=new Map(),captures=new Map(),listeners=[];
 let drag=null,stickId=null,origin=null,move={x:0,y:0};
 const listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn));};
 function capture(el,e){if(!pointers.start(e.pointerId,e.clientX,e.clientY))return false;captures.set(e.pointerId,el);el.setPointerCapture(e.pointerId);return true;}
 function release(id){if(blowing.delete(id)&&!blowing.size&&!keyBlow)blower?.stop();const el=captures.get(id);captures.delete(id);pointers.end(id);turns.delete(id);if(drag?.id===id)drag=null;if(stickId===id){stickId=null;origin=null;move={x:0,y:0};knob.style.transform='';}if(el?.hasPointerCapture(id))el.releasePointerCapture(id);}
 function clear(){keyBlow=false;blower?.cancel();for(const id of [...captures.keys()])release(id);keys.clear();world.clearInput();}
 const primary=e=>e.button===0||e.pointerType==='touch';
 const position=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
 listen(canvas,'pointerdown',e=>{if(!primary(e)||drag||!capture(canvas,e))return;e.preventDefault();drag={id:e.pointerId,last:position(e),distance:0};});
 listen(canvas,'pointermove',e=>{if(drag?.id!==e.pointerId)return;const p=position(e),dx=p.x-drag.last.x;drag.distance+=Math.hypot(dx,p.y-drag.last.y);if(drag.distance>7)world.rotate(-dx*.006);drag.last=p;});
 listen(canvas,'pointerup',e=>{if(drag?.id===e.pointerId&&drag.distance<=7){camera.update(world,viewport.width,viewport.height);const p=position(e),target=camera.groundAt(p.x,p.y);if(target)world.setTarget(target.x,target.z);}release(e.pointerId);});
 function stickMove(e){const x=e.clientX-origin.x,y=e.clientY-origin.y,d=Math.max(1,Math.hypot(x,y)/30);move={x:x/d/30,y:y/d/30};knob.style.transform='translate('+x/d+'px,'+y/d+'px)';}
 listen(stick,'pointerdown',e=>{if(!primary(e)||stickId!==null||!capture(stick,e))return;e.preventDefault();stickId=e.pointerId;const r=stick.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};stickMove(e);});
 listen(stick,'pointermove',e=>{if(stickId===e.pointerId)stickMove(e);});
 for(const [el,direction] of [[left,-1],[right,1]]){listen(el,'pointerdown',e=>{if(!primary(e)||!capture(el,e))return;e.preventDefault();turns.set(e.pointerId,direction)});listen(el,'click',e=>{if(e.detail===0)world.rotate(direction*.3)});}
 if(blow&&blower){listen(blow,'pointerdown',e=>{if(!primary(e)||blowing.size||!capture(blow,e))return;e.preventDefault();blowing.add(e.pointerId);blower.start()});listen(blow,'click',e=>{if(e.detail===0&&!keyBlow&&!blowing.size)blower.tap()});}
 for(const el of [canvas,stick,left,right,blow].filter(Boolean)){for(const type of ['pointerup','pointercancel','lostpointercapture']){if(el===canvas&&type==='pointerup')continue;listen(el,type,e=>{if(blowing.has(e.pointerId)&&type!=='pointerup')blower?.cancel();release(e.pointerId)});}listen(el,'contextmenu',e=>e.preventDefault());}
 listen(window,'keydown',e=>{if(e.target?.closest?.('dialog')||e.target?.matches?.('input,select,textarea'))return;if(blower&&(e.code==='Space'||(e.code==='Enter'&&e.target===blow))&&(!e.target?.matches?.('button')||e.target===blow)){e.preventDefault();if(!keyBlow){keyBlow=true;blower.start();}return;}if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code)}});
 listen(window,'keyup',e=>{keys.delete(e.code);if(keyBlow&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();keyBlow=false;if(!blowing.size)blower?.stop();}});
 listen(window,'blur',clear);listen(window,'pagehide',clear);listen(document,'visibilitychange',()=>{if(document.hidden)clear()});
 const offResize=viewport.subscribe((before,after)=>{if(shouldResetViewport(before,after))clear();else if(drag)drag=null;camera.update(world,after.width,after.height)});
 return {update(dt){world.rotate((Array.from(turns.values()).reduce((a,b)=>a+b,0)+(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*dt*.8);world.update(dt,{x:move.x+(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),y:move.y+(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)})},clear,dispose(){clear();offResize();listeners.forEach(fn=>fn())}};
}
