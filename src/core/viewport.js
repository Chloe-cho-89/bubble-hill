import { CONFIG } from '../config.js';
export function shouldResetViewport(a,b){return (a.width>a.height)!==(b.width>b.height)||Math.abs(a.width-b.width)>Math.max(48,a.width*.15)||Math.abs(a.height-b.height)>Math.max(180,a.height*.35);}
export function createViewport(canvas){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D unavailable');
 const listeners=new Set(),view={ctx,width:1,height:1};let initialized=false;
 function resize(){const rect=canvas.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return;const before={width:view.width,height:view.height};const changed=rect.width!==view.width||rect.height!==view.height;const dpr=Math.min(window.devicePixelRatio||1,CONFIG.maxDpr);view.width=rect.width;view.height=rect.height;canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(initialized&&changed)for(const fn of listeners)fn(before,view);initialized=true;}
 resize();window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
 return {ctx,get width(){return view.width},get height(){return view.height},subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},dispose(){window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);listeners.clear()}};
}
