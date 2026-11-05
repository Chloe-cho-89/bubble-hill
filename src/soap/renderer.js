export function drawSoap(ctx,model,width,height){
 const cx=width*.5,cy=height*.65,rx=width*.32,ry=height*.22;
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#fff8ed';ctx.fillRect(0,0,width,height);
 const pouring=model.phase==='bottle';
 const drops=pouring?[...model.colors,model.chosen.color]:model.colors;
 if(model.chosen){
  const x=width*.40,y=height*.26,tilt=pouring?1.85*Math.min(1,model.pour*5):.20;
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
  ctx.fillStyle='#fff9ed';ctx.strokeStyle='#a48982';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(-6,-21);ctx.lineTo(-6,-13);ctx.bezierCurveTo(-8,-8,-21,-7,-20,7);
  ctx.bezierCurveTo(-19,24,18,24,20,7);ctx.bezierCurveTo(21,-7,8,-8,6,-13);ctx.lineTo(6,-21);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();ctx.rotate(-tilt);ctx.fillStyle=model.chosen.color;ctx.fillRect(-32,2+model.pour*3,64,30);ctx.restore();
  ctx.restore();
  if(pouring){
   const t=Math.min(1,Math.max(0,(model.pour-.2)/.65));
   const lipX=x+21*Math.sin(tilt),lipY=y-21*Math.cos(tilt);
   ctx.fillStyle=model.chosen.color;ctx.beginPath();ctx.ellipse(lipX+(cx-lipX)*t,lipY+(cy-lipY)*t*t,4,6,0,0,2*Math.PI);ctx.fill();
  }
 }
 ctx.fillStyle='#e9d8c9';ctx.beginPath();ctx.ellipse(cx,cy+10,rx+9,ry+9,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(cx,cy);ctx.scale(rx,ry);
 ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.clip();
 // Each equal drop gets equal visible area. The newest drop spreads from the centre.
 if(model.blend<1){
  ctx.fillStyle='#fffaf055';ctx.fillRect(-1,-1,2,2);
  const arrival=pouring?Math.min(1,Math.max(0,(model.pour-.85)/.15)):1;
  const amount=drops.length-1+arrival;
  for(let i=0;i<amount;i++){
   const radius=Math.sqrt((amount-i)/Math.max(1,amount));
   const drift=.12*(1-radius)*Math.sin(Math.PI*model.blend);
   ctx.fillStyle=drops[i];ctx.beginPath();
   ctx.arc(drift*Math.cos(model.stir+i),drift*Math.sin(model.stir+i),radius,0,2*Math.PI);
   ctx.fill();
  }
 }
 if(model.blend>0){ctx.globalAlpha=model.blend;ctx.fillStyle=model.color??'#ffffff66';ctx.fillRect(-1.5,-1.5,3,3);}
 ctx.restore();
 ctx.strokeStyle='#987c88';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
 if(model.phase==='stir'||model.phase==='ready'){ctx.strokeStyle='#fffaf0';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,rx*(.35+i*.18),ry*(.35+i*.18),0,model.stir+i,model.stir+i+Math.PI*1.2);ctx.stroke();}const a=model.previousAngle??model.stir;ctx.strokeStyle='#a89380';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*rx*.55,cy+Math.sin(a)*ry*.55);ctx.lineTo(cx+Math.cos(a)*rx*.55+28,cy+Math.sin(a)*ry*.55-48);ctx.stroke();}
}

