import { LAYOUTS, FRAMES } from './config.js?v=fahkwang-1';
import { drawSprite, landscapeSVG, svgData, drawAsciiPhoto, ASCII_FONT } from './ascii.js?v=fahkwang-1';
import { letteringFont, fontsReady } from './typography.js?v=fahkwang-1';

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
  if (filter === 'ascii') {
    drawAsciiPhoto(ctx,image,canvas.width,canvas.height);
  } else if (filter === 'pixel') {
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
  ctx.save();ctx.fillStyle=frame.accent;ctx.globalAlpha=.3;ctx.font=`${w*.021}px ${ASCII_FONT}`;ctx.textAlign='left';
  const motifs={grass:',',gingham:'+',cloud:'.',stars:'*',dots:'.',petals:"'"},unit=w*.067;
  for(let x=unit*.5;x<w;x+=unit)for(let y=unit*.5;y<h;y+=unit)ctx.fillText(motifs[frame.pattern]||'.',x,y);
  ctx.restore();
}

function asciiBorder(ctx,x,y,w,h,color,size) {
  ctx.save();ctx.font=`${size}px ${ASCII_FONT}`;ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='middle';
  const count=Math.max(1,Math.floor(w/(size*.6))-1),edge='+'+'-'.repeat(count-1)+'+';
  ctx.fillText(edge,x,y,w);ctx.fillText(edge,x,y+h,w);
  for(let yy=y+size*1.2;yy<y+h-size*.4;yy+=size*1.2){ctx.fillText('|',x,yy);ctx.fillText('|',x+w-size*.6,yy);}
  ctx.restore();
}

export async function renderStrip(state, placeholders = true) {
  await fontsReady;
  const layout = LAYOUTS.find(l=>l.id===state.layout);
  const frame = FRAMES.find(f=>f.id===state.frame);
  const c = document.createElement('canvas'); c.width=layout.width; c.height=layout.height;
  const ctx = c.getContext('2d'); const w=c.width,h=c.height;
  ctx.fillStyle=frame.bg; ctx.fillRect(0,0,w,h); pattern(ctx,frame,w,h);
  asciiBorder(ctx,w*.021,w*.027,w-w*.042,h-w*.054,frame.accent,w*.02);
  ctx.fillStyle=frame.ink; ctx.font=letteringFont(w*.076); ctx.textAlign='center';
  ctx.fillText('Little Takes',w/2,w*.086);
  drawSprite(ctx,'bow',w*.14,w*.012,w*.085);drawSprite(ctx,'butterfly',w*.77,w*.014,w*.085);
  const slots=geometry(layout);
  for(let i=0;i<slots.length;i++) {
    const r=slots[i];
    ctx.fillStyle=frame.light;ctx.fillRect(r.x-4,r.y-4,r.w+8,r.h+8);
    asciiBorder(ctx,r.x-7,r.y-7,r.w+14,r.h+14,frame.accent,w*.015);
    if(state.photos[i]) cover(ctx,await filteredPhoto(state.photos[i].src,state.filter),r.x,r.y,r.w,r.h);
    else if(placeholders) {
      cover(ctx,await loadImage(svgData(landscapeSVG(i))),r.x,r.y,r.w,r.h);
      ctx.fillStyle='#ffffff90'; ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.fillStyle=frame.ink; ctx.font=`${w*.048}px ${ASCII_FONT}`; ctx.fillText(`[ 0${i+1} ]`,r.x+r.w/2,r.y+r.h/2+w*.013);
    }
  }
  ctx.font=`${w*.027}px ${ASCII_FONT}`;ctx.fillStyle=frame.ink;ctx.textAlign='center';
  slots.forEach((r,i)=>{if(layout.cols===1){ctx.fillText(i%2?'*':'+',w*.04,r.y+r.h*.6);ctx.fillText(i%2?'+':'*',w*.962,r.y+r.h*.25);}});
  drawSprite(ctx,frame.sticker,w*.035,h-w*.22,w*.15);
  drawSprite(ctx,frame.secondary,w*.82,h-w*.19,w*.13);
  const caption=state.caption || 'Lovely little memories';
  ctx.fillStyle=frame.ink; ctx.font=letteringFont(w*(/[\u0e00-\u0e7f]/.test(caption)?.044:.065));
  ctx.fillText(caption,w/2,h-w*.127,w*.62);
  ctx.font=`${w*.025}px ${ASCII_FONT}`;
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
      ctx.fillStyle=item.color; ctx.font=letteringFont(size,item.font); ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.shadowColor='#fffcff';ctx.shadowBlur=0;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;
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
  drawSprite(ctx,'bouquet',35,64,205);drawSprite(ctx,'butterfly',825,1607,173);
  ctx.fillStyle=f.ink;ctx.textAlign='center';ctx.font=letteringFont(58);ctx.fillText('A little moment',540,162);
  ctx.font=letteringFont(65);ctx.fillText('Little Takes',540,1789);
  return c;
}

export function canvasBlob(canvas) {
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('สร้างไฟล์ภาพไม่สำเร็จ')),'image/png'));
}
