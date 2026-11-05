import { SOAP_CONFIG } from '../config.js';
import { SOAP_COLORS } from '../data/soap-colors.js';
// Mix one vote per drop in OKLab, keeping mean lightness and mean perceptual chroma.
function soapLab(hex){
 const [r,g,b]=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
 const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
 const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
export function mixSoapColors(colors){
 let L=0,a=0,b=0,chroma=0;
 for(const color of colors){const [light,x,y]=soapLab(color);L+=light;a+=x;b+=y;chroma+=Math.hypot(x,y);}
 L/=colors.length;chroma/=colors.length;
 if(Math.hypot(a,b)<1e-8){const fallback=soapLab([...colors].sort()[0]);a=fallback[1];b=fallback[2];}
 const scale=chroma/(Math.hypot(a,b)||1);a*=scale;b*=scale;
 const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
 return '#'+[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(v=>{
 const srgb=v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055;
 return Math.round(255*Math.max(0,Math.min(1,srgb))).toString(16).padStart(2,'0');
 }).join('');
}
export class SoapModel {
 constructor(initialColor){this.initialColor=initialColor;this.reset();}
 reset(){this.chosen=null;this.phase='color';this.colors=this.initialColor?[this.initialColor]:[];this.color=this.initialColor;this.pour=0;this.stir=0;this.previousAngle=null;}
 addColor(id){if(this.phase!=='color'||this.colors.length>=SOAP_CONFIG.maxDrops)return false;const entry=SOAP_COLORS.find(c=>c.id===id);if(!entry)return false;this.colors.push(entry.color);this.color=mixSoapColors(this.colors);return true;}
 selectBottle(id){
  if(this.phase!=='color'||this.colors.length>=SOAP_CONFIG.maxDrops)return false;
  this.chosen=SOAP_COLORS.find(c=>c.id===id)??null;
  return !!this.chosen;
 }
 pourBottle(){
  if(!this.chosen||this.phase!=='color')return false;
  this.phase='bottle';this.pour=0;return true;
 }
 beginStir(){
  if(this.phase!=='color'||this.chosen)return false;
  this.phase='stir';this.endStroke();return true;
 }
 startPour(){if(this.phase!=='color')return false;this.phase='pouring';this.endStroke();return true;}
 update(dt){if(!Number.isFinite(dt)||dt<=0)return;if(this.phase==='bottle'){
  this.pour=Math.min(1,this.pour+Math.min(dt,.05)/SOAP_CONFIG.pourSeconds);
  if(this.pour>=1){const id=this.chosen.id;this.phase='color';this.chosen=null;this.addColor(id);}
  return;
 }if(this.phase==='pouring'){this.pour=Math.min(1,this.pour+Math.min(dt,.05)/SOAP_CONFIG.pourSeconds);if(this.pour>=1)this.phase='stir';}}
 get canStir(){return this.phase==='stir'||this.phase==='ready';}
 get blend(){return this.phase==='ready'?1:Math.min(1,this.stir/SOAP_CONFIG.stirRadians);}
 addStir(amount){
  if(!this.canStir||!Number.isFinite(amount)||amount<=0)return;
  this.stir+=amount;
  if(this.stir+1e-9>=SOAP_CONFIG.stirRadians)this.phase='ready';
 }
 stroke(x,y){if(!this.canStir)return;const radius=Math.hypot(x,y);if(radius<SOAP_CONFIG.minStirRadius||radius>SOAP_CONFIG.maxStirRadius){this.endStroke();return;}const angle=Math.atan2(y,x);if(this.previousAngle!==null){const difference=Math.atan2(Math.sin(angle-this.previousAngle),Math.cos(angle-this.previousAngle));if(Math.abs(difference)<=SOAP_CONFIG.maxAngleStep)this.addStir(Math.abs(difference));}this.previousAngle=angle;}
 endStroke(){this.previousAngle=null;}
}

