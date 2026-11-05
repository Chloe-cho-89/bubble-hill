import { shapePath } from '../data/shapes.js';
// Both flying bubbles and the fitting samples use this membrane.
export function drawFilm(c,r,color,strength='soft',material='basic',time=0,shapeId='circle'){
 const strong=strength==='bold';
 const g=c.createRadialGradient(-.15*r,-.18*r,0,0,0,r);
 if(color){
  const channels=color.slice(1).match(/../g).map(v=>parseInt(v,16));
  const peak=Math.max(...channels);
  const ink=channels.map(v=>Math.max(0,Math.round(peak-(peak-v)*(strong?2.3:1.8)-12)));
  const tint=a=>'rgba('+ink.join(',')+','+a+')';
  g.addColorStop(0,tint(strong?.26:.16));
  g.addColorStop(.6,tint(strong?.72:.53));
  g.addColorStop(.92,tint(strong?.96:.84));
  g.addColorStop(1,'#ffeadcb8');
 }else{
  g.addColorStop(0,'#ffffff07');g.addColorStop(.76,'#e0f6ff12');g.addColorStop(1,'#f4d8ed77');
 }
 c.save();shapePath(c,shapeId,r);c.fillStyle=g;c.fill();c.clip();
 if(material==='aurora'){
  for(let i=0;i<3;i++){
   const y=r*(Math.sin(time+i*.7)*.22+i*.23-.3);
   c.beginPath();c.moveTo(-r,y+r*.25);c.bezierCurveTo(-r*.45,y-r*.9,r*.3,y+r*.4,r,y-r*.4);
   c.strokeStyle=['#66efa9aa','#60cdeca8','#ae8bf2bb'][i];c.lineWidth=r*.20;c.stroke();
  }
 }else if(material==='glitter'){
  for(let i=0;i<10;i++){
   const angle=i*2.4,dist=r*Math.sqrt((i+.5)/11),x=Math.cos(angle)*dist,y=Math.sin(angle)*dist;
   const size=r*(.035+.075*(1+Math.sin(time*2+i))/2);
   c.strokeStyle='#fffadb';c.lineWidth=1.3;c.beginPath();c.moveTo(x-size,y);c.lineTo(x+size,y);c.moveTo(x,y-size);c.lineTo(x,y+size);c.stroke();
  }
 }else if(material==='slime'){
  const y=r*(.25+.15*Math.sin(time*1.6));c.fillStyle='#82d6a9aa';c.beginPath();c.moveTo(-r,y);c.bezierCurveTo(-r*.4,y-r*.55,r*.4,y+r*.55,r,y);c.lineTo(r,r);c.lineTo(-r,r);c.fill();
 }
 c.lineWidth=1.4;
 if(shapeId!=='circle'){shapePath(c,shapeId,r);c.strokeStyle='#fff2df';c.stroke();}
 else for(const [angle,tint] of [[.15,'#f4c3d6'],[1.9,'#d8ecd1'],[3.6,'#b7dcec']]){
  c.beginPath();c.arc(0,0,r*.97,angle,angle+1.6);c.strokeStyle=tint;c.stroke();
 }
 c.fillStyle='#ffffffbf';c.beginPath();c.ellipse(-r*.33,-r*.44,r*.23,r*.085,-.54,0,Math.PI*2);c.fill();c.restore();
}
