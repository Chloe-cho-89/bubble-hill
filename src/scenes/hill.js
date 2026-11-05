import { mountShapeSelect } from './shape-select.js';
import { applyCharacter } from '../core/state.js';
import { HillBlower } from '../bubbles/single.js';
import { HILL_EXIT,SINGLE } from '../config.js';
import { queueHoopBubbles } from '../bubbles/hoop-renderer.js';
import { createViewport } from '../core/viewport.js';
import { startLoop } from '../core/loop.js';
import { HillWorld } from '../world/hill-world.js';
import { HillRenderer } from '../world/renderer.js';
import { bindMovement } from '../input/movement.js';
import { drawFilm } from '../bubbles/film.js';
import { SOAP_COLORS } from '../data/soap-colors.js';

function showFilmSamples(view,world,choice,time){
 const compare=choice==='compare';
 const materials={aurora:'오로라',glitter:'블링블링',slime:'슬라임'};
 if(!compare && !Object.hasOwn(materials,choice))return;
 const color=world.appearance.baseColor;
 const samples=compare?[
  ['투명',null,'soft','basic'],
  ['A · 선명',color??SOAP_COLORS.find(c=>c.id==='peach').color,'soft','basic'],
  ['B · 더 진하게',color??SOAP_COLORS.find(c=>c.id==='peach').color,'bold','basic']
 ]:[[materials[choice]+' · 미리보기',color,world.strength,choice]];
 const ctx=view.ctx,r=Math.min(32,view.width*.074,view.height*.085);
 samples.forEach(([label,ink,strength,material],i)=>{
  ctx.save();
  ctx.translate(view.width*(i+1)/(samples.length+1),view.height*.40);
  drawFilm(ctx,r,ink,strength,material,time);
  ctx.textAlign='center';ctx.font='bold 12px sans-serif';
  ctx.lineWidth=3;ctx.strokeStyle='#fff5e4';ctx.strokeText(label,0,r+15);
  ctx.fillStyle='#5d4652';ctx.fillText(label,0,r+15);ctx.restore();
 });
}
export function mountHill(elements,art,selection=null,onExit=()=>{},audio=null){
 const viewport=createViewport(elements.canvas),world=new HillWorld(),renderer=new HillRenderer(viewport,art);
 if(selection)applyCharacter(world,selection);
 renderer.update(world,viewport.width,viewport.height);
 let storage=null;
 try{storage=window.localStorage;}catch{}
 const bubbles=new HillBlower(world,Math.random,storage);
 bubbles.onBreath = () => audio?.effect('breath');
 bubbles.onPop = () => audio?.effect('pop');
 if(elements.risk)elements.risk.value=SINGLE.defaultRisk;
 const changeRisk=()=>{bubbles.cancel();bubbles.median=SINGLE.presets[elements.risk.value]??SINGLE.presets[SINGLE.defaultRisk];elements.canvas.focus();};
 const syncMode=()=>{
  if(elements.mode)elements.mode.textContent=bubbles.mode==='single'?'한 방울':'연속';
 };
 const filmMenu=elements['film-view'];
 const selectFilm=()=>{
  if(['soft','bold'].includes(filmMenu.value))world.strength=filmMenu.value;
  elements.canvas.focus();
 };
 filmMenu?.addEventListener('change',selectFilm);
 const changeMode=()=>{bubbles.switchMode();syncMode();elements.canvas.focus();};
 elements.mode?.addEventListener('click',changeMode);
 elements.risk?.addEventListener('change',changeRisk);
 syncMode();
 const input=bindMovement(elements,world,renderer,viewport,bubbles);
 const browse=elements['browse-shapes'],dialog=elements['hill-shapes'];
 let fitting=null;
 function closeFitting(){
  fitting?.dispose();fitting=null;dialog.replaceChildren();
  browse.focus();
 }
 function openFitting(){
  if(dialog.open)return;
  input.clear();
  const form=document.getElementById('shape-room').cloneNode(true);
  form.removeAttribute('id');form.hidden=false;
  form.querySelector('h1').textContent='산책 중 틀 보기';
  form.querySelector('#shape-enter').textContent='동그라미 착용 · 산책 계속';
  dialog.append(form);
  // Scope the reused fitting controls to this dialog, with unique document IDs.
  const heading=form.querySelector('h1');
  heading.id='hill-shape-title';form.setAttribute('aria-labelledby',heading.id);
  fitting=mountShapeSelect(form,selection,()=>{world.appearance.shapeId=selection.shapeId;dialog.close();});
  for(const el of form.querySelectorAll('[id]'))if(el!==heading)el.id='hill-'+el.id;
  dialog.showModal();heading.focus();
 }
 browse?.addEventListener('click',openFitting);
 dialog?.addEventListener('close',closeFitting);
 const exitDialog=elements['exit-confirm'];
 let armed=true;
 const abortExit=new AbortController();
 function listenExit(el,event,fn){el?.addEventListener(event,fn,{signal:abortExit.signal});}
 const soundDialog = elements['sound-settings'];
 const photo = elements['photo-room'];
 let photoURL, photoFile;
 if (photo) {
  const button = elements['camera-shot'];
  const image = photo.querySelector('img');
  const save = photo.querySelector('a');
  const share = photo.querySelector('#photo-share');
  const note = photo.querySelector('#photo-note');
  const clearPhoto = () => {
   if (photoURL) URL.revokeObjectURL(photoURL);
   photoURL = null; photoFile = null;
   image.removeAttribute('src'); save.removeAttribute('href');
  };
  listenExit(button,'click',()=>{
   if(photo.open)return;
   photo.showModal();
   note.textContent='사진을 담고 있어요.';
   save.hidden=true;share.hidden=true;
   // Snapshot the displayed frame before releasing held walking/blowing input.
   const capture = ++photoSequence;
   try {
    elements.canvas.toBlob(blob=>{
     if(capture !== photoSequence || !photo.open || abortExit.signal.aborted)return;
     if(!blob){note.textContent='사진을 담지 못했어요. 다시 시도해 주세요.';return;}
     photoURL=URL.createObjectURL(blob);
     image.src=photoURL;save.href=photoURL;save.hidden=false;
     save.download='언덕-위의-비눗방울-'+Date.now()+'.png';
     note.textContent='';
     if(typeof File==='function' && navigator.canShare){
      photoFile=new File([blob],save.download,{type:'image/png'});
      share.hidden=!navigator.canShare({files:[photoFile]});
     }
    },'image/png');
   } catch {note.textContent='사진을 담지 못했어요. 다시 시도해 주세요.';}
   input.clear();
  });
  listenExit(share,'click',async()=>{
   try { await navigator.share({files:[photoFile],title:'언덕 위의 비눗방울'}); }
   catch(error){if(error.name!=='AbortError')note.textContent='사진을 저장한 뒤 공유해 주세요.';}
  });
  listenExit(photo.querySelector('#photo-close'),'click',()=>photo.close());
  listenExit(photo,'close',()=>{photoSequence++;clearPhoto();});
  abortExit.signal.addEventListener('abort',()=>{clearPhoto();if(photo.open)photo.close();});
 }
 let photoSequence=0;
 listenExit(elements['open-sound'], 'click', () => {
  input.clear();
  soundDialog.showModal();
 });
 function askExit(){
  if(!exitDialog||exitDialog.open)return;
  input.clear();exitDialog.showModal();elements['exit-no'].focus();
 }
 function stay(){armed=false;exitDialog.close();elements.canvas.focus();}
 listenExit(elements['ask-exit'],'click',askExit);
 listenExit(elements['exit-no'],'click',stay);
 listenExit(exitDialog,'cancel',e=>{e.preventDefault();stay();});
 listenExit(elements['exit-yes'],'click',()=>{if(exitDialog.open){exitDialog.close();onExit();}});
 const stop=startLoop(dt=>{if(dialog?.open||exitDialog?.open||soundDialog?.open||photo?.open)return;input.update(dt);bubbles.update(dt);
  const distance=Math.hypot(world.x-HILL_EXIT.x,world.z-HILL_EXIT.z);
  if(distance>HILL_EXIT.rearm)armed=true;
  if(armed&&distance<HILL_EXIT.enter){armed=false;askExit();}
 },()=>{
  renderer.draw(world,(r,m)=>queueHoopBubbles(r,bubbles,m));showFilmSamples(viewport,world,filmMenu?.value,bubbles.time);elements.blow?.classList.toggle('pressed',bubbles.active);elements.bearing.textContent='둘러보기 '+((Math.round(world.yaw*180/Math.PI)%360+360)%360)+'°';});
 return {world,bubbles,dispose(){abortExit.abort();if(soundDialog?.open)soundDialog.close();if(exitDialog?.open)exitDialog.close();stop();browse?.removeEventListener('click',openFitting);dialog?.removeEventListener('close',closeFitting);fitting?.dispose();if(dialog?.open){dialog.close();dialog.replaceChildren();}filmMenu?.removeEventListener('change',selectFilm);elements.mode?.removeEventListener('click',changeMode);elements.risk?.removeEventListener('change',changeRisk);input.dispose();viewport.dispose()}};
}

