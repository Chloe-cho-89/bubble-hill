export const TAU=Math.PI*2;
export const wrap=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
export function limitPoint(x,z,r=5.5){const d=Math.hypot(x,z);return d>r?{x:x*r/d,z:z*r/d}:{x,z};}
