export function startLoop(update,draw){
 let frame,last=null,stopped=false;
 const reset=()=>{last=null;};
 function tick(now){if(stopped)return;const dt=last===null?0:Math.min((now-last)/1000,.05);last=now;if(!document.hidden){update(dt);draw();}else last=null;frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',reset);window.addEventListener('blur',reset);
 frame=requestAnimationFrame(tick);
 return ()=>{stopped=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',reset);window.removeEventListener('blur',reset);};
}

