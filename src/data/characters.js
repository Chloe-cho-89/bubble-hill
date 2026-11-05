export const CHARACTERS=Object.freeze([
 Object.freeze({id:'cloud',name:'하늘 구슬 친구',free:true,body:'#f5e4c6',head:'#f9e8cb',limbs:'#e8d8bc',cheeks:'#e8b2ad',mark:'#e6caaa'}),
 Object.freeze({id:'peach',name:'복숭아 구슬 친구',free:true,body:'#d9cfe3',head:'#eee0ec',limbs:'#c9bdd8',cheeks:'#e2b3c4',mark:'#baa8cc'})
]);
export function getCharacter(id){return CHARACTERS.find(c=>c.id===id)||CHARACTERS[0];}

