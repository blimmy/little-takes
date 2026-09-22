import { LAYOUTS, FRAMES } from './config.js';
import { drawSprite, landscapeSVG, svgData } from './pixels.js';

const imageCache = new Map();
const filteredCache = new Map();
export function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => { imageCache.delete(src); reject(new Error('อ่านรูปภาพไม่สำเร็จ')); };
    image.src = src;
  }));
  return imageCache.get(src);
}
export function clearImageCaches() { imageCache.clear(); filteredCache.clear(); }

export function geometry(layout) {
  const { width:w, height:h, cols, count } = layout;
  const margin = w * .065, gap = w * .035, top = w * .13, bottom = w * .25;
  const rows = Math.ceil(count / cols);
  const pw = (w - margin * 2 - gap * (cols - 1)) / cols;
  const ph = (h - top - bottom - gap * (rows - 1)) / rows;
  return Array.from({length:count}, (_,i) => ({x:margin + (i % cols) * (pw + gap), y:top + Math.floor(i / cols) * (ph + gap), w:pw, h:ph}));
}

function cover(ctx, image, x, y, w, h) {
  const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
  const ratio = Math.max(w / iw, h / ih);
  const sw = w / ratio, sh = h / ratio;
  ctx.drawImage(image, (iw-sw)/2, (ih-sh)/2, sw, sh, x,y,w,h);
}

async function filteredPhoto(src, filter) {
  const key = src + filter;
  if (filteredCache.has(key)) return filteredCache.get(key);
  const image = await loadImage(src);
  if (filter === 'original') return image;
  const canvas = document.createElement('canvas');
  const ratio = Math.min(1, 1500 / Math.max(image.width,image.height));
  canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio);
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  if (filter === 'pixel') {
    const mini = document.createElement('canvas');
    mini.width = Math.max(1,Math.round(canvas.width / 9)); mini.height = Math.max(1,Math.round(canvas.height / 9));
    mini.getContext('2d').drawImage(image,0,0,mini.width,mini.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mini,0,0,canvas.width,canvas.height);
  } else {
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels = ctx.getImageData(0,0,canvas.width,canvas.height), d = pixels.data;
    for (let i=0;i<d.length;i+=4) {
      let r=d[i],g=d[i+1],b=d[i+2];
      const gray=.299*r+.587*g+.114*b;
      if (filter === 'mono') r=g=b=(gray-128)*1.1+128;
      if (filter === 'dream') { r=(r*.65+gray*.35)*.86+36; g=(g*.65+gray*.35)*.86+30; b=(b*.65+gray*.35)*.86+38; }
      if (filter === 'peach') { r=r*.94+24; g=g*.96+12; b=b*.89+17; }
      if (filter === 'vintage') { r=.393*d[i]+.769*d[i+1]+.189*d[i+2]; g=.349*d[i]+.686*d[i+1]+.168*d[i+2]; b=.272*d[i]+.534*d[i+1]+.131*d[i+2]; r=(r*.5+d[i]*.5)*.9+13; g=(g*.5+d[i+1]*.5)*.9+10; b=(b*.5+d[i+2]*.5)*.9+8; }
      d[i]=r; d[i+1]=g; d[i+2]=b;
    }
    ctx.putImageData(pixels,0,0);
  }
  if (filteredCache.size > 18) filteredCache.delete(filteredCache.keys().next().value);
  filteredCache.set(key,canvas);
  return canvas;
}

function pattern(ctx,frame,w,h) {
  ctx.save(); ctx.fillStyle = frame.accent; ctx.globalAlpha = .16;
  const u = w/30;
  if (frame.pattern === 'gingham') {
    for(let x=0;x<w;x+=u*2) ctx.fillRect(x,0,u,h);
    for(let y=0;y<h;y+=u*2) ctx.fillRect(0,y,w,u);
  } else {
    for(let x=u/2;x<w;x+=u*2) for(let y=u/2;y<h;y+=u*2) {
      ctx.fillRect(x+(Math.floor(y/u)%2)*u/2,y,u*.15,u*.15);
    }
  }
  ctx.restore();
}

export async function renderStrip(state, placeholders = true) {
  const layout = LAYOUTS.find(l=>l.id===state.layout);
  const frame = FRAMES.find(f=>f.id===state.frame);
  const c = document.createElement('canvas'); c.width=layout.width; c.height=layout.height;
  const ctx = c.getContext('2d'); const w=c.width,h=c.height;
  ctx.fillStyle=frame.bg; ctx.fillRect(0,0,w,h); pattern(ctx,frame,w,h);
  ctx.strokeStyle=frame.accent; ctx.lineWidth=w*.006; ctx.strokeRect(w*.021,w*.021,w-w*.042,h-w*.042);
  ctx.fillStyle=frame.ink; ctx.font=`${w*.026}px "Press Start 2P", monospace`; ctx.textAlign='center';
  ctx.fillText('LITTLE TAKES',w/2,w*.084);
  const slots=geometry(layout);
  for(let i=0;i<slots.length;i++) {
    const r=slots[i];
    ctx.fillStyle=frame.accent; ctx.fillRect(r.x-3,r.y-3,r.w+6,r.h+6);
    if(state.photos[i]) cover(ctx,await filteredPhoto(state.photos[i].src,state.filter),r.x,r.y,r.w,r.h);
    else if(placeholders) {
      cover(ctx,await loadImage(svgData(landscapeSVG(i))),r.x,r.y,r.w,r.h);
      ctx.fillStyle='#fff9e9a6'; ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.fillStyle=frame.ink; ctx.font=`${w*.04}px "Press Start 2P", monospace`; ctx.fillText(`0${i+1}`,r.x+r.w/2,r.y+r.h/2+w*.013);
    }
  }
  // Tiny frame companions live in the margins, so faces stay unobstructed.
  const tiny=w*.039;
  slots.forEach((r,i)=>{if(layout.cols===1){drawSprite(ctx,i%2?frame.secondary:frame.sticker,w*.012,r.y+r.h*.62,tiny);drawSprite(ctx,i%2?frame.sticker:frame.secondary,w*.945,r.y+r.h*.25,tiny);}});
  drawSprite(ctx,frame.sticker,w*.065,h-w*.2,w*.115);
  drawSprite(ctx,frame.secondary,w*.81,h-w*.17,w*.095);
  ctx.fillStyle=frame.ink; ctx.font=`600 ${w*.037}px "Bai Jamjuree", sans-serif`;
  ctx.fillText(state.caption || 'a little moment, a lovely memory',w/2,h-w*.136,w*.61);
  ctx.font=`${w*.021}px "Press Start 2P", monospace`;
  ctx.fillText(state.showDate ? state.date : 'made with love',w/2,h-w*.076);
  for (const stroke of state.strokes) {
    if (!stroke.points.length) continue;
    ctx.strokeStyle=stroke.color; ctx.fillStyle=stroke.color; ctx.lineWidth=stroke.width*w; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(stroke.points[0].x*w,stroke.points[0].y*h);
    stroke.points.slice(1).forEach(p=>ctx.lineTo(p.x*w,p.y*h)); ctx.stroke();
    if(stroke.points.length===1) {ctx.beginPath();ctx.arc(stroke.points[0].x*w,stroke.points[0].y*h,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
  }
  for(const item of state.items) {
    const size=item.size*w;
    ctx.save(); ctx.translate(item.x*w,item.y*h); ctx.rotate((item.rotation||0)*Math.PI/180);
    if(item.type==='sticker') drawSprite(ctx,item.name,-size/2,-size/2,size);
    else {
      ctx.fillStyle=item.color; ctx.font=`700 ${size}px "Bai Jamjuree", sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.shadowColor='#fff9e9';ctx.shadowBlur=0;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;
      ctx.fillText(item.text,0,0,w*.9);
    }
    ctx.restore();
  }
  return c;
}

export function makeStory(strip, frameId) {
  const f=FRAMES.find(f=>f.id===frameId),c=document.createElement('canvas'); c.width=1080;c.height=1920;
  const ctx=c.getContext('2d'); ctx.fillStyle=f.bg;ctx.fillRect(0,0,c.width,c.height);pattern(ctx,f,c.width,c.height);
  const ratio=Math.min(850/strip.width,1430/strip.height),w=strip.width*ratio,h=strip.height*ratio,x=(1080-w)/2,y=(1920-h)/2;
  ctx.fillStyle=f.accent;ctx.globalAlpha=.4;ctx.fillRect(x+15,y+20,w,h);ctx.globalAlpha=1;
  ctx.drawImage(strip,x,y,w,h);
  drawSprite(ctx,f.sticker,98,125,88);drawSprite(ctx,f.secondary,860,1710,75);
  ctx.fillStyle=f.ink;ctx.textAlign='center';ctx.font='22px "Press Start 2P", monospace';ctx.fillText('a little moment',540,162);
  ctx.font='20px "Press Start 2P", monospace';ctx.fillText('LITTLE TAKES',540,1780);
  return c;
}

export function canvasBlob(canvas) {
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),'image/png'));
}
