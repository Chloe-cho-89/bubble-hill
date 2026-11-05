import { SHAPES,getShape,playableShape,shapePath } from '../data/shapes.js';
import { drawFilm } from '../bubbles/film.js';
import { startLoop } from '../core/loop.js';

export function mountShapeSelect(root,state,onEnter){
 const canvas=root.querySelector('canvas'), c=canvas.getContext('2d');
 const choices=root.querySelector('#shape-choices'),status=root.querySelector('[role=status]');
 const enter=root.querySelector('#shape-enter');
 let selected=playableShape(state.shapeId),elapsed=0,last=0,closed=false;
 const samples=[];
 function emit(){samples.push({id:selected.id,born:elapsed});last=elapsed;}
 function choose(id){
  selected=getShape(id);
  if(selected.free)state.shapeId=selected.id;
  for(const button of choices.children)button.setAttribute('aria-pressed',String(button.dataset.id===selected.id));
  status.textContent=selected.free?'동그라미 틀을 착용했어요.':selected.name+' 틀을 미리 보고 있어요. 산책에는 동그라미 틀을 가져가요.';
  emit();
 }
 function click(e){const button=e.target.closest('button');if(button)choose(button.dataset.id);}
 for(const shape of Object.values(SHAPES)){
  const button=document.createElement('button');
  button.type='button';button.dataset.id=shape.id;
  button.textContent=shape.free?shape.name+' · 무료':'🔒 '+shape.name;
  choices.append(button);
 }
 function draw(){
  c.clearRect(0,0,600,220);
  c.save();c.translate(104,128);
  c.strokeStyle='#ae9080';c.lineWidth=3;c.beginPath();c.moveTo(-65,-128);c.lineTo(0,-38);c.lineTo(65,-128);c.stroke();
  shapePath(c,selected.id,43);c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#99778a';c.stroke();c.lineWidth=2;c.strokeStyle='#fbe3ba';c.stroke();c.restore();
  for(const s of samples){
   const age=elapsed-s.born;
   c.save();c.translate(104+age*115,128-17*age-6*Math.sin(age*2));
   c.globalAlpha=Math.min(1,Math.max(0,4-age));
   drawFilm(c,25+Math.min(age,1)*5,state.soapColor,'soft','basic',elapsed,s.id);
   c.restore();
  }
 }
 function update(dt){
  elapsed+=dt;
  while(samples.length && elapsed-samples[0].born>=4)samples.shift();
  if(elapsed-last>=1.25)emit();
 }
 function finish(){
  if(closed)return;
  state.shapeId=playableShape(state.shapeId).id;
  dispose();onEnter();
 }
 choices.addEventListener('click',click);enter.addEventListener('click',finish);
 choose(selected.id);draw();
 const stop=startLoop(update,draw);
 function dispose(){
  if(closed)return;
  closed=true;stop();choices.removeEventListener('click',click);enter.removeEventListener('click',finish);
  choices.replaceChildren();
 }
 return {dispose};
}
