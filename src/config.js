export const CONFIG = Object.freeze({
 maxBubbles:90, maxPointers:2, maxDpr:2,
 hoopRadius:.16, minRadius:.16, maxRadius:.55, growSeconds:2.4,
 rate:6, rateFalloff:5, tapCount:2, tapInterval:.12,
 liftRate:8, emitLiftThreshold:.75, maxStep:.05,
 forwardSpeed:.45, spreadSpeed:.28, riseSpeed:.45, riseVariation:.15,
 lifeSeconds:7, lifeVariation:6, popSeconds:.32,
 newbornAlpha:.65, fadeInRate:5, overlapFeather:.35, overlapDepth:.7, birthLayerOffset:1,
 largeOverlapRadius:.3, largeOverlapFloor:.5,
 nearFadeStart:1.4, nearFadeEnd:3.8, oversizeFadeStart:.14, oversizeFadeEnd:.25,
 baseColor:null, materialId:'basic', shapeId:'circle'
});


export const SOAP_CONFIG=Object.freeze({pourSeconds:1.1,stirRadians:5*Math.PI*2,keyboardStirRadians:Math.PI*2,minStirRadius:.18,maxStirRadius:1.05,maxAngleStep:Math.PI/2,maxDrops:30});
export const HILL_EXIT=Object.freeze({x:-2.2,z:-4.4,enter:.85,rearm:1.35,key:'bubble-hill.last-visit.v1'});
export const SCENERY_FADE = Object.freeze({ opacity: .25, seconds: .28, pathMargin: .9 });
export const SINGLE=Object.freeze({growth:1.25,wobble:.11,defaultRisk:'brisk',presets:Object.freeze({gentle:6,standard:5,brisk:4}),key:'bubble-hill.single.v1'});
export const RECORD_LABELS=Object.freeze([
 Object.freeze({min:0,name:'이슬'}), Object.freeze({min:1.5,name:'복숭아'}),
 Object.freeze({min:2.5,name:'구름 한 조각'}), Object.freeze({min:3.5,name:'보름달'}),
 Object.freeze({min:5,name:'언덕'})
]);
export const SOUND = Object.freeze({
  key:'bubble-hill.audio.v1', musicGain:.62, maxEffects:2,
  cooldown:{breath:1.38,pop:.50,pour:.35,stir:.65}
});
