import { SOAP_COLORS } from '../data/soap-colors.js';
import { SoapModel } from '../soap/model.js';
import { drawSoap } from '../soap/renderer.js';
import { SOAP_CONFIG } from '../config.js';
import { createViewport } from '../core/viewport.js';
import { startLoop } from '../core/loop.js';
export function createStirHint(element,storage,now=()=>Date.now()) {
 const key='bubble-hill.stir-hint.v1';let learned=false,until=0;
 try{learned=storage?.getItem(key)==='done';}catch{}
 const hide=()=>{until=0;if(element)element.textContent='';};
 return {
  show(){if(learned||!element)return;until=now()+2500;element.textContent='손가락으로 그릇을 빙빙 돌려 저어 봐요';},
  update(){if(until&&now()>=until)hide();},
  stroke(before,after){if(!(after>before))return;learned=true;hide();try{storage?.setItem(key,'done');}catch{}},
  hide
 };
}
function recipeSwatch(model){
 const drops=model.colors;
 if(drops.length<2)return model.color??'transparent';
 return ringSwatch(drops,model);
}
function ringSwatch(drops,model){
 const bands=[...drops].reverse().map((color,i)=>color+' '+100*Math.sqrt(i/drops.length)+'% '+100*Math.sqrt((i+1)/drops.length)+'%');
 const layers=['radial-gradient(closest-side,'+bands.join(',')+')'];
 if(model.blend>0){const tint=model.color+Math.round(model.blend*255).toString(16).padStart(2,'0');layers.unshift('linear-gradient('+tint+','+tint+')');}
 return layers.join(',');
}
export function mountSoapMaking(elements,state,onEnter,paint=drawSoap){
 const model=new SoapModel(null),view=createViewport(elements.canvas),listeners=[];let pointer=null,entered=false;
 const listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn))};
 const hint=createStirHint(elements.hint,elements.storage);
 let lastRecipe=null;
 let heardStirAt=0;
 function render(){
  hint.update();
  if(model.stir < heardStirAt) heardStirAt=0;
  if(model.stir - heardStirAt >= Math.PI/2){
   heardStirAt=model.stir;
   elements.onEffect?.('stir');
  }
  const choosing=model.phase==='color', bottle=model.chosen;
  elements.pour.disabled=!choosing||!bottle;
  elements.pour.textContent=bottle?bottle.name+' 한 방울 붓기':'한 방울 붓기';
  elements.stir.disabled=!(model.canStir||choosing&&!bottle);
  elements.stir.textContent=choosing?(model.colors.length?'젓기 시작':'맑은 물로 젓기'):'한 바퀴 젓기';
  elements.enter.disabled=model.phase!=='ready';
  for(const button of elements.colors){
   button.disabled=!choosing||model.colors.length>=SOAP_CONFIG.maxDrops;
   if(button.getAttribute && button.getAttribute('aria-pressed')!==String(bottle?.id===button.dataset.color))
    button.setAttribute('aria-pressed',String(bottle?.id===button.dataset.color));
  }
  const recipe=model.colors.join(',');
  if(recipe!==lastRecipe){refreshLabels();lastRecipe=recipe;}
  const text={color:bottle?bottle.name+' 병을 골랐어요. 한 방울 부어 보세요.':model.colors.length?'다른 색을 더 붓거나, 이제 저어 보세요.':'유리병 하나를 골라 보세요.',bottle:'유리병에서 한 방울 떨어져요.',stir:'둥글게 저어 주세요 · '+Math.floor(model.stir/(2*Math.PI))+' / '+Math.round(SOAP_CONFIG.stirRadians/(2*Math.PI))+'바퀴',ready:model.colors.length?'색이 완성됐어요. 더 젓거나 틀을 골라 보세요.':'맑은 비눗물이 완성됐어요. 더 젓거나 틀을 골라 보세요.'}[model.phase];
  if(elements.status.textContent!==text)elements.status.textContent=text;elements.swatch.style.background=model.phase==='ready'?model.color??'transparent':recipeSwatch(model);
 paint(view.ctx,model,view.width,view.height);}
 const position=e=>{const r=elements.canvas.getBoundingClientRect();return {x:((e.clientX-r.left)/r.width-.5)/.32,y:((e.clientY-r.top)/r.height-.65)/.22}};
 function release(){const id=pointer;pointer=null;model.endStroke();if(id!==null&&elements.canvas.hasPointerCapture(id))elements.canvas.releasePointerCapture(id);}
 function refreshLabels(){
  for(const button of elements.colors){
   const pigment=SOAP_COLORS.find(color=>color.id===button.dataset.color);
   const count=model.colors.filter(value=>value===pigment.color).length;
   const label=button.querySelector?.('small');
   if(label){label.textContent=count+'방울';button.setAttribute('aria-label',pigment.name+' 병 선택, 부은 양 '+count+'방울');}
  }
 }
 for(const button of elements.colors)listen(button,'click',()=>{
  if(model.selectBottle(button.dataset.color))render();
 });
 listen(elements.pour,'click',()=>{model.pourBottle();render()});listen(elements.stir,'click',()=>{if(!model.beginStir()&&model.canStir){model.addStir(SOAP_CONFIG.keyboardStirRadians);hint.show();}render()});listen(elements.reset,'click',()=>{release();hint.hide();model.reset();refreshLabels();render()});
 listen(elements.canvas,'pointerdown',e=>{if(!model.canStir||pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;const p=position(e);if(Math.hypot(p.x,p.y)>SOAP_CONFIG.maxStirRadius)return;e.preventDefault();pointer=e.pointerId;elements.canvas.setPointerCapture(pointer);model.stroke(p.x,p.y);render()});
 listen(elements.canvas,'pointermove',e=>{if(e.pointerId!==pointer)return;const p=position(e),before=model.stir;model.stroke(p.x,p.y);hint.stroke(before,model.stir);render()});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(elements.canvas,type,e=>{if(e.pointerId===pointer)release()});
 listen(elements.canvas,'contextmenu',e=>e.preventDefault());listen(window,'blur',release);listen(window,'pagehide',release);listen(document,'visibilitychange',()=>{if(document.hidden)release()});const offResize=view.subscribe(release);
 function finish(color,drops){
  if(entered)return;entered=true;state.recipe={...drops};
  state.soapColor=color;state.baseColor=color;state.stage='hill';onEnter();
 }
 const prior=elements.previous;
 if(elements.card)elements.card.hidden=!prior;
 if(prior){
  elements.description.textContent=prior.color?SOAP_COLORS.filter(c=>prior.drops[c.id]>0).map(c=>c.name+' '+prior.drops[c.id]+'방울').join(' · '):'맑은 물';
  elements.sample.style.backgroundColor=prior.color??'transparent';
  listen(elements.reuse,'click',()=>finish(prior.color,prior.drops));
 }
 listen(elements.enter,'click',()=>{if(model.phase==='ready')finish(model.color,Object.fromEntries(SOAP_COLORS.map(c=>[c.id,model.colors.filter(v=>v===c.color).length])))});
 render();const stop=startLoop(dt=>{
  const wasPouring=model.phase==='bottle';
  model.update(dt);
  if(wasPouring && model.phase==='color') elements.onEffect?.('pour');
 },render);
 return {model,dispose(){hint.hide();stop();release();offResize();view.dispose();listeners.forEach(fn=>fn())}};
}
