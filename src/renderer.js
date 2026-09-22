import { LAYOUTS, FRAMES } from './config.js?v=retro-3';
import { drawSprite, drawAsciiPhoto, ASCII_FONT } from './ascii.js?v=retro-3';
import { letteringFont, fontsReady } from './typography.js?v=retro-3';

const imageCache=new Map(),filteredCache=new Map(),baseCache=new Map(),storyCache=new Map();
const liveBuffers=new WeakMap();
export function loadImage(src){
  if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imageCache.delete(src);reject(new Error('อ่านรูปภาพไม่สำเร็จ'));};img.src=src;
  }));
  return imageCache.get(src);
}
export function clearImageCaches(){imageCache.clear();filteredCache.clear();baseCache.clear();storyCache.clear();}
export const frameFor=state=>({...FRAMES.find(f=>f.id===state.frame),...state.frameColors});
function canvas(w,h){const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);return c;}
export function geometry(layout){
  const {width:w,height:h,cols,count}=layout,margin=w*(layout.design==='film'?.09:.065),gap=w*.035;
  const top=Math.min(w*.13,145),bottom=Math.min(w*.25,235),cw=w-2*margin,ch=h-top-bottom;
  if(layout.slots)return layout.slots.map(([x,y,rw,rh])=>({x:margin+x*cw,y:top+y*ch,w:rw*cw,h:rh*ch}));
  const rows=Math.ceil(count/cols),pw=(cw-gap*(cols-1))/cols,ph=(ch-gap*(rows-1))/rows;
  return Array.from({length:count},(_,i)=>{const size=Math.min(pw,ph);return layout.shape==='circle'||layout.photoAspect===1?{x:margin+i%cols*(pw+gap)+(pw-size)/2,y:top+Math.floor(i/cols)*(ph+gap)+(ph-size)/2,w:size,h:size}:{x:margin+i%cols*(pw+gap),y:top+Math.floor(i/cols)*(ph+gap),w:pw,h:ph};});
}
export function cover(ctx,source,x,y,w,h,zoom=1){
  const iw=source.videoWidth||source.naturalWidth||source.width,ih=source.videoHeight||source.naturalHeight||source.height;
  if(!iw||!ih)return;
  const ratio=Math.max(w/iw,h/ih)*zoom,sw=w/ratio,sh=h/ratio;
  ctx.drawImage(source,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);
}
function shapePath(ctx,r,layout){
  ctx.beginPath();
  if(layout.shape==='circle')ctx.ellipse(r.x+r.w/2,r.y+r.h/2,r.w/2,r.h/2,0,0,Math.PI*2);
  else if(layout.shape==='heart'){
    const {x,y,w,h}=r;ctx.moveTo(x+w*.5,y+h*.95);ctx.bezierCurveTo(x-w*.13,y+h*.49,x-w*.02,y-h*.12,x+w*.32,y+h*.035);ctx.bezierCurveTo(x+w*.43,y+h*.065,x+w*.48,y+h*.18,x+w*.5,y+h*.22);ctx.bezierCurveTo(x+w*.52,y+h*.18,x+w*.57,y+h*.065,x+w*.68,y+h*.035);ctx.bezierCurveTo(x+w*1.02,y-h*.12,x+w*1.13,y+h*.49,x+w*.5,y+h*.95);ctx.closePath();
  }else if(layout.radius)ctx.roundRect(r.x,r.y,r.w,r.h,Math.min(r.w,r.h)*layout.radius);
  else ctx.rect(r.x,r.y,r.w,r.h);
}
function pixelFilter(ctx,w,h,id){
  const pixels=ctx.getImageData(0,0,w,h),d=pixels.data;
  for(let i=0;i<d.length;i+=4){
    let r=d[i],g=d[i+1],b=d[i+2],gray=.299*r+.587*g+.114*b;
    if(id==='mono')r=g=b=(gray-128)*1.1+128;
    if(id==='dream'){r=(r*.65+gray*.35)*.86+36;g=(g*.65+gray*.35)*.86+30;b=(b*.65+gray*.35)*.86+38;}
    if(id==='peach'){r=r*.94+24;g=g*.96+12;b=b*.89+17;}
    if(id==='vintage'){r=.393*d[i]+.769*d[i+1]+.189*d[i+2];g=.349*d[i]+.686*d[i+1]+.168*d[i+2];b=.272*d[i]+.534*d[i+1]+.131*d[i+2];r=(r*.5+d[i]*.5)*.9+13;g=(g*.5+d[i+1]*.5)*.9+10;b=(b*.5+d[i+2]*.5)*.9+8;}
    d[i]=r;d[i+1]=g;d[i+2]=b;
  }
  ctx.putImageData(pixels,0,0);
}
function filterInto(c,source,id){
  const ctx=c.getContext('2d',{willReadFrequently:true});
  if(id==='ascii')drawAsciiPhoto(ctx,source,c.width,c.height,85);
  else if(id==='pixel'){
    const mini=canvas(Math.max(1,Math.round(c.width/10)),Math.max(1,Math.round(c.height/10)));
    mini.getContext('2d').drawImage(source,0,0,mini.width,mini.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(mini,0,0,c.width,c.height);
  }else{ctx.drawImage(source,0,0,c.width,c.height);if(id!=='original')pixelFilter(ctx,c.width,c.height,id);}
  return c;
}
async function filteredPhoto(src,filter){
  const key=src+filter;if(filteredCache.has(key))return filteredCache.get(key);
  const image=await loadImage(src);if(filter==='original')return image;
  const ratio=Math.min(1,1600/Math.max(image.width,image.height)),c=canvas(image.width*ratio,image.height*ratio);
  filterInto(c,image,filter);if(filteredCache.size>24)filteredCache.delete(filteredCache.keys().next().value);filteredCache.set(key,c);return c;
}
function pattern(ctx,frame,w,h){
  ctx.save();ctx.globalAlpha=.36;ctx.fillStyle=frame.accent;ctx.font=`${w*.018}px ${ASCII_FONT}`;
  const motifs={grass:',',gingham:'+',cloud:'.',stars:'*',dots:'.',petals:"'"},unit=w*.075;
  for(let x=unit/2;x<w;x+=unit)for(let y=unit/2;y<h;y+=unit)ctx.fillText(motifs[frame.pattern]||'.',x,y);
  ctx.restore();
}
function asciiBorder(ctx,x,y,w,h,color,size){
  ctx.save();ctx.font=`${size}px ${ASCII_FONT}`;ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='middle';
  const n=Math.max(1,Math.floor(w/(size*.6))-1),edge='+'+'-'.repeat(n-1)+'+';
  ctx.fillText(edge,x,y,w);ctx.fillText(edge,x,y+h,w);
  for(let yy=y+size*1.2;yy<y+h-size*.4;yy+=size*1.2){ctx.fillText('|',x,yy);ctx.fillText('|',x+w-size*.6,yy);}ctx.restore();
}
function frameBase(state,layout,frame,slots){
  const key=JSON.stringify([layout.id,frame,state.caption,state.showDate,state.date]);if(baseCache.has(key))return baseCache.get(key);
  const c=canvas(layout.width,layout.height),ctx=c.getContext('2d'),w=c.width,h=c.height,top=Math.min(w*.13,145),bottom=Math.min(w*.25,235);
  ctx.fillStyle=frame.bg;ctx.fillRect(0,0,w,h);pattern(ctx,frame,w,h);
  asciiBorder(ctx,w*.018,w*.022,w*.964,h-w*.044,frame.accent,Math.min(w*.019,22));
  ctx.fillStyle=frame.ink;ctx.textAlign='center';ctx.font=letteringFont(Math.min(w*.083,72));ctx.fillText('Little Takes',w/2,top*.71);
  drawSprite(ctx,'bow',w*.12,top*.06,top*.66);drawSprite(ctx,'butterfly',w*.81,top*.07,top*.64);
  for(const [i,r] of slots.entries()){
    ctx.save();shapePath(ctx,r,layout);ctx.fillStyle=frame.light;ctx.fill();ctx.setLineDash([4,7]);ctx.strokeStyle=frame.accent;ctx.lineWidth=2;ctx.stroke();ctx.clip();
    ctx.fillStyle=frame.accent;ctx.font=`${Math.min(r.w*.1,38)}px ${ASCII_FONT}`;ctx.textAlign='center';ctx.fillText(String(i+1).padStart(2,'0'),r.x+r.w/2,r.y+r.h/2);ctx.restore();
    if(layout.design==='contact'){ctx.fillStyle=frame.ink;ctx.font=`${w*.012}px ${ASCII_FONT}`;ctx.fillText(`TAKE ${String(i+1).padStart(2,'0')}`,r.x+r.w/2,r.y+r.h+w*.018);}
  }
  if(layout.design==='film'){ctx.fillStyle=frame.accent;for(let y=top;y<h-bottom;y+=w*.085){ctx.fillRect(w*.035,y,w*.023,w*.042);ctx.fillRect(w*.942,y,w*.023,w*.042);}}
  drawSprite(ctx,frame.sticker,w*.035,h-bottom*.93,bottom*.64);drawSprite(ctx,frame.secondary,w*.83,h-bottom*.8,bottom*.58);
  const caption=state.caption||'Lovely little memories';ctx.fillStyle=frame.ink;ctx.textAlign='center';ctx.font=letteringFont(Math.min(w*(/[\u0e00-\u0e7f]/.test(caption)?.04:.067),46));ctx.fillText(caption,w/2,h-bottom*.53,w*.64);
  ctx.font=`${Math.min(w*.024,21)}px ${ASCII_FONT}`;ctx.fillText(state.showDate?state.date:'made with love',w/2,h-bottom*.29);
  if(baseCache.size>5)baseCache.delete(baseCache.keys().next().value);baseCache.set(key,c);return c;
}
async function decorationLayer(state,layout){
  const c=canvas(layout.width,layout.height),ctx=c.getContext('2d'),w=c.width,h=c.height;
  for(const stroke of state.strokes){
    if(!stroke.points.length)continue;ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;ctx.lineWidth=stroke.width*w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(stroke.points[0].x*w,stroke.points[0].y*h);stroke.points.slice(1).forEach(p=>ctx.lineTo(p.x*w,p.y*h));ctx.stroke();
    if(stroke.points.length===1){ctx.beginPath();ctx.arc(stroke.points[0].x*w,stroke.points[0].y*h,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
  }
  const images=await Promise.all(state.items.map(item=>item.type==='sticker'?loadImage(item.src):null));
  state.items.forEach((item,i)=>{
    const size=item.size*w;ctx.save();ctx.translate(item.x*w,item.y*h);ctx.rotate((item.rotation||0)*Math.PI/180);
    if(item.type==='sticker')ctx.drawImage(images[i],-size/2,-size/2,size,size);
    else{ctx.fillStyle=item.color;ctx.font=letteringFont(size,item.font);ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#fffdf9';ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;ctx.fillText(item.text,0,0,w*.9);}
    ctx.restore();
  });return c;
}
export async function prepareComposition(state){
  await fontsReady;
  const layout=LAYOUTS.find(l=>l.id===state.layout),frame=frameFor(state),slots=geometry(layout);
  const base=frameBase(state,layout,frame,slots),[overlay,images]=await Promise.all([decorationLayer(state,layout),Promise.all(state.photos.map(p=>p?filteredPhoto(p.src,state.filter):null))]);
  return {layout,frame,slots,paint(ctx,sources=null,elapsed=0){
    ctx.save();ctx.scale(ctx.canvas.width/layout.width,ctx.canvas.height/layout.height);ctx.drawImage(base,0,0);
    slots.forEach((r,i)=>{
      let source=images[i];const live=sources?.[i];
      if(live?.readyState>=2){
        if(state.filter==='original')source=live;
        else{let buffer=liveBuffers.get(live);if(!buffer){buffer=canvas(420,Math.round(420*live.videoHeight/live.videoWidth));liveBuffers.set(live,buffer);}source=filterInto(buffer,live,state.filter);}
      }
      if(!source)return;
      ctx.save();shapePath(ctx,r,layout);ctx.clip();cover(ctx,source,r.x,r.y,r.w,r.h,sources&&!live?1.025+Math.sin(elapsed/1400+i)*.02:1);ctx.restore();
    });ctx.drawImage(overlay,0,0);ctx.restore();
  }};
}
export async function renderStrip(state){const comp=await prepareComposition(state),c=canvas(comp.layout.width,comp.layout.height);comp.paint(c.getContext('2d'));return c;}
function storyBackground(frame){
  const key=JSON.stringify(frame);if(storyCache.has(key))return storyCache.get(key);
  const c=canvas(1080,1920),ctx=c.getContext('2d');ctx.fillStyle=frame.bg;ctx.fillRect(0,0,1080,1920);pattern(ctx,frame,1080,1920);
  drawSprite(ctx,'bouquet',35,55,193);drawSprite(ctx,'butterfly',835,1630,163);ctx.fillStyle=frame.ink;ctx.textAlign='center';ctx.font=letteringFont(58);ctx.fillText('A little moment',540,159);ctx.font=letteringFont(64);ctx.fillText('Little Takes',540,1810);
  if(storyCache.size>4)storyCache.clear();storyCache.set(key,c);return c;
}
export function paintStory(ctx,strip,frame){
  ctx.drawImage(storyBackground(frame),0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.scale(ctx.canvas.width/1080,ctx.canvas.height/1920);
  const ratio=Math.min(850/strip.width,1420/strip.height),w=strip.width*ratio,h=strip.height*ratio,x=(1080-w)/2,y=(1920-h)/2;
  ctx.fillStyle=frame.accent;ctx.globalAlpha=.4;ctx.fillRect(x+12,y+17,w,h);ctx.globalAlpha=1;ctx.drawImage(strip,x,y,w,h);ctx.restore();
}
export function makeStory(strip,state){const c=canvas(1080,1920);paintStory(c.getContext('2d'),strip,frameFor(state));return c;}
export function canvasBlob(c,type='image/png'){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),type));}
export function layoutThumbnail(layout,index=0){
  const frame=FRAMES[index%FRAMES.length],w=layout.width,h=layout.height,slots=geometry(layout);
  const cells=slots.map(r=>{
    const {x,y,w:rw,h:rh}=r,style=`fill="white" stroke="${frame.accent}" stroke-width="6"`;
    if(layout.shape==='circle')return `<circle cx="${x+rw/2}" cy="${y+rh/2}" r="${rw/2}" ${style}/>`;
    if(layout.shape==='heart')return `<path d="M ${x+rw*.5} ${y+rh*.95} C ${x-rw*.13} ${y+rh*.49} ${x-rw*.02} ${y-rh*.12} ${x+rw*.32} ${y+rh*.035} C ${x+rw*.43} ${y+rh*.065} ${x+rw*.48} ${y+rh*.18} ${x+rw*.5} ${y+rh*.22} C ${x+rw*.52} ${y+rh*.18} ${x+rw*.57} ${y+rh*.065} ${x+rw*.68} ${y+rh*.035} C ${x+rw*1.02} ${y-rh*.12} ${x+rw*1.13} ${y+rh*.49} ${x+rw*.5} ${y+rh*.95} Z" ${style}/>`;
    return `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="${layout.radius?Math.min(rw,rh)*layout.radius:0}" ${style}/>`;
  }).join('');
  let holes='';if(layout.design==='film')for(let y=w*.13;y<h-Math.min(w*.25,235);y+=w*.085)holes+=`<rect x="${w*.035}" y="${y}" width="${w*.023}" height="${w*.042}" fill="${frame.accent}"/><rect x="${w*.942}" y="${y}" width="${w*.023}" height="${w*.042}" fill="${frame.accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect x="3" y="3" width="${w-6}" height="${h-6}" fill="${frame.bg}" stroke="${frame.accent}" stroke-width="6"/><text x="${w/2}" y="${Math.min(w*.087,93)}" text-anchor="middle" fill="${frame.ink}" font-family="Courier New,monospace" font-size="${w*.04}">+ little takes +</text>${cells}${holes}<text x="${w/2}" y="${h-Math.min(w*.1,95)}" text-anchor="middle" fill="${frame.ink}" font-family="Courier New,monospace" font-size="${w*.04}">* with love *</text></svg>`;
}
