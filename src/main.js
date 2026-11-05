import { HillAudio } from './audio/player.js';
import { mountTitle } from './scenes/title.js';
import { mountShapeSelect } from './scenes/shape-select.js';
import { mountHill } from './scenes/hill.js';
import { createGameState,readVisit,saveVisit } from './core/state.js';
import { mountCharacterSelect } from './scenes/character-select.js';
import { mountSoapMaking } from './scenes/soap-making.js';
import { SOAP_COLORS } from './data/soap-colors.js';
const palette=document.querySelector('.soap-colors');
for(const color of SOAP_COLORS){
 const button=document.createElement('button');
 button.dataset.color=color.id;
 button.setAttribute('aria-label',color.name+' 병 선택');
 button.style.setProperty('--pigment',color.color);
 button.innerHTML='<svg viewBox="0 0 76 66" aria-hidden="true"><ellipse cx="38" cy="61" rx="19" ry="3" fill="#947867" opacity=".16"/><path d="M30 17 Q31 21 28 25 C26 29 16 32 16 44 Q15 59 34 60 Q56 63 60 49 Q63 36 51 29 Q44 25 45 17Z" fill="#fff9eb" stroke="#a48982" stroke-width="1.8"/><path d="M19 40 Q27 36 38 39 T57 39 Q62 57 40 58 Q19 59 19 47Z" fill="var(--pigment)"/><path d="M22 37 Q27 30 30 30 M21 42 L21 46" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="3"/><path d="M29 16 L29 10 Q38 7 46 10 L45 17Z" fill="#ceb294" stroke="#aa8b76"/><path d="M28 18 Q36 16 47 18" fill="none" stroke="#a9897c" stroke-width="2.2"/></svg>';
 const name=document.createElement('span');
 name.textContent=color.name;
 const count=document.createElement('small');
 count.textContent='0방울';
 button.append(name,count);
 palette.append(button);
}
const byId=id=>document.getElementById(id);
import { doorIcon } from "./art/placeholder.js";
byId("door-icon").textContent=doorIcon;
const elements=Object.fromEntries(['canvas','stick','knob','left','right','bearing','blow','mode','records','single-panel','risk','film-view','camera-shot','photo-room','open-sound','sound-settings','browse-shapes','hill-shapes','ask-exit','exit-no','exit-yes','exit-confirm'].map(id=>[id,byId(id)]));
const state=createGameState();let hill=null,soap=null,shapeScene=null;
const selectRoot=byId('character-select'),soapRoot=byId('soap-making'),hillRoot=byId('world');
let storage=null;
try{storage=window.localStorage;}catch{}
const audio = new HillAudio(storage);
window.addEventListener('bubble-hill:first-gesture', () => audio.start(), {once:true});
document.addEventListener('visibilitychange', () => audio.setVisible(!document.hidden));
window.addEventListener('pagehide', () => audio.setVisible(false));
window.addEventListener('pageshow', () => audio.setVisible(!document.hidden));
const settingsDialog = byId('sound-settings');
for (const [id, key] of [['music-enabled','music'], ['effects-enabled','effects']]) {
  const toggle = byId(id);
  toggle.checked = audio.settings[key];
  toggle.addEventListener('change', () => audio.configure({[key]:toggle.checked}));
}
const track = byId('music-track');
track.value = audio.settings.track;
track.addEventListener('change', () => audio.configure({track:track.value}));
const lastVisit=readVisit(storage);
if(lastVisit && document.querySelectorAll('input[name="character"]').length && ['cloud','peach'].includes(lastVisit.characterId))state.characterId=lastVisit.characterId;
let selection, title;
let firstGesturePending = true;
function showTitle(notice = '') {
  state.stage = 'title';
  byId('title-notice').textContent = notice;
  const start = byId('start-walk');
  title = mountTitle(byId('title-screen'), start, () => {
    title = null;
    chooseCharacter();
    byId('choose-title').focus();
  }, () => {
    if (firstGesturePending) {
      firstGesturePending = false;
      window.dispatchEvent(new Event('bubble-hill:first-gesture'));
    } else { audio.start(); }
  });
  start.focus({preventScroll:true});
}
function chooseCharacter(){
 state.stage='character-select';selectRoot.hidden=false;
 selection=mountCharacterSelect({choices:[...document.querySelectorAll('input[name="character"]')],previews:[...document.querySelectorAll('.character-preview')],status:byId('selection-status'),locked:byId('locked-character'),enter:byId('enter-hill')},state,()=>{
 selection.dispose();selectRoot.hidden=true;soapRoot.hidden=false;
 soap=mountSoapMaking({onEffect:name=>audio.effect(name),previous:readVisit(storage)?.soap,card:byId('saved-soap'),sample:byId('saved-sample'),description:byId('saved-recipe'),reuse:byId('reuse-soap'),canvas:byId('soap-canvas'),colors:[...document.querySelectorAll('[data-color]')],pour:byId('pour-soap'),stir:byId('stir-soap'),reset:byId('reset-soap'),enter:byId('soap-enter'),status:byId('soap-status'),swatch:byId('soap-swatch')},state,()=>{soap.dispose();soapRoot.hidden=true;
 const shapeRoot=byId('shape-room');shapeRoot.hidden=false;byId('shape-title').focus();
 state.stage='shape-select';
 shapeScene=mountShapeSelect(shapeRoot,state,()=>{state.stage='hill';shapeRoot.hidden=true;hillRoot.hidden=false;hill=mountHill(elements,undefined,state,()=>{
   const saved=saveVisit(storage,state);
   audio.leave();hill.dispose();hill=null;hillRoot.hidden=true;
   showTitle(saved ? '' : '이 기기에 지난 산책을 저장하지 못했어요.');
  },audio);elements.canvas.focus()});});byId('soap-title').focus();
});
}
showTitle();
window.addEventListener('pagehide',e=>{if(!e.persisted){title?.dispose();selection?.dispose();soap?.dispose();shapeScene?.dispose();hill?.dispose();}});


import { registerPwa, setupInstall } from './pwa.js';
setupInstall();
registerPwa();
