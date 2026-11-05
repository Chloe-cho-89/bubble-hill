import { CHARACTERS,getCharacter } from '../data/characters.js';
import { playableShape } from '../data/shapes.js';
import { CONFIG } from '../config.js';
import { SOAP_COLORS } from '../data/soap-colors.js';
import { HILL_EXIT, SOAP_CONFIG } from '../config.js';
export function saveVisit(storage,state){
 const visit={version:1,characterId:state.characterId,shapeId:playableShape(state.shapeId).id,soap:{color:state.soapColor,drops:{...state.recipe}}};
 try{storage.setItem(HILL_EXIT.key,JSON.stringify(visit));return true;}catch{return false;}
}
export function readVisit(storage){
 try{const visit=JSON.parse(storage.getItem(HILL_EXIT.key));if(visit?.version!==1)return null;
 const {color,drops}=visit.soap??{};
 if(!drops||Array.isArray(drops)||typeof drops!=='object'||Object.keys(drops).length!==SOAP_COLORS.length)return null;
 const counts=SOAP_COLORS.map(({id})=>drops[id]);
 if(!counts.every(n=>Number.isSafeInteger(n)&&n>=0))return null;
 const total=counts.reduce((a,b)=>a+b,0);
 if(total>SOAP_CONFIG.maxDrops)return null;
 return (total===0?color===null:typeof color==='string'&&color.length===7&&/^#[0-9a-f]{6}$/i.test(color))?visit:null;}catch{return null;}
}
export function createGameState(){return {stage:'character-select',soapColor:null,characterId:CHARACTERS[0].id,baseColor:null,materialId:CONFIG.materialId,shapeId:CONFIG.shapeId};}
export function selectCharacter(state,id){const character=CHARACTERS.find(c=>c.id===id&&c.free);if(!character)return false;state.characterId=character.id;state.baseColor=null;state.soapColor=null;return true;}
export function applyCharacter(world,state){const character=getCharacter(state.characterId);world.characterId=character.id;world.appearance={baseColor:typeof state.soapColor==='string'&&/^#[0-9a-f]{6}$/i.test(state.soapColor)?state.soapColor:null,materialId:CONFIG.materialId,shapeId:playableShape(state.shapeId).id};return character;}
