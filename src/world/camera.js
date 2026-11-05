export class OrbitCamera {
 constructor(width=1,height=1){this.w=width;this.h=height;}
 update(m,width=this.w,height=this.h){this.w=width;this.h=height;const s=Math.sin(m.yaw),c=Math.cos(m.yaw),pitch=.23;this.cam={x:m.x+s*5.8,y:2.7,z:m.z+c*5.8};this.right={x:c,y:0,z:-s};this.forward={x:-s*Math.cos(pitch),y:-Math.sin(pitch),z:-c*Math.cos(pitch)};this.up={x:-s*Math.sin(pitch),y:Math.cos(pitch),z:-c*Math.sin(pitch)};this.f=Math.min(this.w*.95,this.h*.87);this.cy=this.h*.51;}
 project(p){const x=p.x-this.cam.x,y=p.y-this.cam.y,z=p.z-this.cam.z;const d=x*this.forward.x+y*this.forward.y+z*this.forward.z;if(d<.15)return null;const scale=this.f/d;return{x:this.w/2+(x*this.right.x+z*this.right.z)*scale,y:this.cy-(x*this.up.x+y*this.up.y+z*this.up.z)*scale,d,scale};}
 groundAt(x,y){const nx=(x-this.w/2)/this.f,ny=(this.cy-y)/this.f;const dir={x:this.forward.x+this.right.x*nx+this.up.x*ny,y:this.forward.y+this.up.y*ny,z:this.forward.z+this.right.z*nx+this.up.z*ny};if(dir.y>=-.03)return null;const t=-this.cam.y/dir.y;if(t>50)return null;return{x:this.cam.x+dir.x*t,z:this.cam.z+dir.z*t};}

}
