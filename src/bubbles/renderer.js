import { CONFIG } from '../config.js';
export function drawBubbles(ctx,items,w,h){
 const unit=Math.min(w,h);
 for(const b of items){
  const popping=b.popAge!==null;
  const progress=popping?b.popAge/CONFIG.popSeconds:0;
  const radius=b.radius*unit*(1+progress*.16);
  const alpha=(1-progress)*Math.min(1,b.age/.16);
  ctx.save();ctx.translate(b.x*w,b.y*h);
  if(popping){
   ctx.strokeStyle='rgba(255,251,239,'+(alpha*.55)+')';ctx.lineWidth=.8;
   for(let i=0;i<6;i++){const a=b.phase+i*Math.PI/3;const d=radius*(1+progress*.2);ctx.beginPath();ctx.moveTo(Math.cos(a)*d,Math.sin(a)*d);ctx.lineTo(Math.cos(a)*(d+2),Math.sin(a)*(d+2));ctx.stroke();}
  }else{
   const fill=ctx.createRadialGradient(-radius*.35,-radius*.4,0,0,0,radius);
   fill.addColorStop(0,'rgba(255,255,255,'+alpha*.3+')');
   fill.addColorStop(.5,'rgba(191,224,242,'+alpha*.045+')');
   fill.addColorStop(.86,'rgba(200,226,235,'+alpha*.18+')');
   fill.addColorStop(1,'rgba(255,248,241,'+alpha*.5+')');
   ctx.fillStyle=fill;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
   const rim=ctx.createLinearGradient(-radius,-radius,radius,radius);
   rim.addColorStop(0,'rgba(255,255,255,'+alpha*.95+')');
   rim.addColorStop(.3,'rgba(188,218,239,'+alpha*.7+')');
   rim.addColorStop(.6,'rgba(240,187,213,'+alpha*.7+')');
   rim.addColorStop(1,'rgba(241,229,165,'+alpha*.8+')');
   ctx.strokeStyle=rim;ctx.lineWidth=1.1;ctx.stroke();
   ctx.beginPath();ctx.ellipse(-radius*.28,-radius*.38,radius*.22,radius*.09,-.6,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+alpha*.8+')';ctx.fill();
   ctx.beginPath();ctx.arc(0,0,radius*.82,.45,1.5);ctx.strokeStyle='rgba(255,248,227,'+alpha*.7+')';ctx.lineWidth=1.7;ctx.stroke();
  }ctx.restore();
 }
}

