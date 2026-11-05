import { CONFIG } from '../config.js';
function contour(count,point){
 return Array.from({length:count},(_,i)=>point(i*2*Math.PI/count,i));
}
function shape(id,name,free,points){
 return Object.freeze({id,name,free,points,hoopRadius:CONFIG.hoopRadius});
}
export const SHAPES=Object.freeze({
 circle:shape('circle','동그라미',true,contour(48,t=>[Math.cos(t),Math.sin(t)])),
 heart:shape('heart','하트',false,contour(64,t=>[Math.sin(t)**3,(2-13*Math.cos(t)+5*Math.cos(2*t)+2*Math.cos(3*t)+Math.cos(4*t))/18])),
 star:shape('star','별',false,contour(10,(t,i)=>[Math.sin(t)*(i%2?.48:1),-Math.cos(t)*(i%2?.48:1)])),
 cat:shape('cat','고양이',false,[[-.92,-.14],[-.89,-.90],[-.40,-.62],[0,-.66],[.40,-.62],[.89,-.90],[.92,-.14],[.97,.18],[.89,.48],[.65,.71],[.34,.83],[0,.86],[-.34,.83],[-.65,.71],[-.89,.48],[-.97,.18]])
});
export function getShape(id){return Object.hasOwn(SHAPES,id)?SHAPES[id]:SHAPES.circle;}
export function playableShape(id){const chosen=getShape(id);return chosen.free?chosen:SHAPES.circle;}
export function shapePath(ctx,id,r){
 const shape=getShape(id);
 ctx.beginPath();
 if(shape.id==='circle'){ctx.arc(0,0,r,0,2*Math.PI);return;}
 shape.points.forEach(([x,y],i)=>{if(i)ctx.lineTo(x*r,y*r);else ctx.moveTo(x*r,y*r);});
 ctx.closePath();
}
