import { CHARACTERS } from '../data/characters.js';
import { selectCharacter,applyCharacter } from '../core/state.js';
import { HillWorld } from '../world/hill-world.js';
import { HillRenderer } from '../world/renderer.js';
import { CONFIG } from '../config.js';
export function drawCharacterPreview(canvas,character){
 const width=180,height=170,dpr=Math.min(globalThis.devicePixelRatio||1,CONFIG.maxDpr);canvas.width=width*dpr;canvas.height=height*dpr;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 const model=new HillWorld();applyCharacter(model,{characterId:character.id});model.yaw=model.heading=0;
 const renderer=new HillRenderer({ctx,width,height});renderer.update(model);renderer.f*=2.4;renderer.cy=height*.20;renderer.queue=[];renderer.art.character.call(renderer,model);renderer.queue.sort((a,b)=>b.d-a.d);for(const item of renderer.queue)item.draw();
}
export function mountCharacterSelect(elements,state,onEnter){
 const listeners=[];let entered=false;
 const listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn))};
 const render=()=>{for(const input of elements.choices)input.checked=input.value===state.characterId;const c=CHARACTERS.find(c=>c.id===state.characterId);elements.status.textContent=c.name+'와 함께 · 만든 비눗물 색으로 구슬이 빛나요.';};
 for(const input of elements.choices)listen(input,'change',()=>{if(input.checked&&selectCharacter(state,input.value))render()});
 for(let i=0;i<CHARACTERS.length;i++)drawCharacterPreview(elements.previews[i],CHARACTERS[i]);
 listen(elements.locked,'click',()=>{elements.status.textContent='새로운 친구는 아직 준비 중이에요. 기본 친구 둘과 무료로 산책할 수 있어요.';});
 listen(elements.enter,'click',()=>{if(entered)return;entered=true;state.stage='soap-making';onEnter();});render();
 return {dispose(){listeners.forEach(fn=>fn());}};
}
