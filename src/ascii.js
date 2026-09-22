// Original character art, shared by SVG previews and Canvas exports.
import { ORNAMENTS, ornamentSVG } from './ornaments.js?v=glam-2';
export const ASCII_FONT = '"Courier New", Courier, monospace';
const ART = {
  flower: ['  .-.  ', ' ( @ ) ', '  `|\'  ', ' \\ | / ', '  \\|/  '],
  berry: ['  \\|/  ', ' .-v-. ', '( : : )', ' \\ : / ', '  `v\'  '],
  frog: ['  o..o  ', ' ( -- ) ', '/|    |\\', ' ^^--^^ '],
  heart: [' .-. .-. ', '(   v   )', ' \\     / ', '  \\   /  ', '   `v\'   '],
  star: ['    .    ', '   / \\   ', '--\'   `--', ' >     < ', '/.-\'`-.\\'],
  mushroom: ['  .---.  ', ' / o o \\ ', '(_______)', '   | |   ', '  _| |_  '],
  cloud: ['    .--.    ', ' .-(    ).  ', '(        _) ', ' `------\'   '],
  moon: ['  .--. ', ' / .-\' ', '| (    ', ' \\ `-. ', '  `--\' '],
  sunflower: [' \\ | / ', ' -(O)- ', ' / | \\ ', '   |   ', ' \\ | / '],
  bee: ['  _   _  ', ' ( )_( ) ', '--(o|=|)>', '   / \\   '],
  peach: ['   _/  ', ' .\' `-.', '(  .  )', ' \\ | / ', '  `v\'  '],
  bow: ['|\\     /|', '| \\   / |', '|  (o)  |', '| /   \\ |', '|/     \\|'],
  cat: [' /\\_/\\ ', '( o.o )', ' > ^ < ', ' /   \\ '],
  cherry: ['   __/  ', '  /  \\  ', ' (o) (o)', '  `   ` '],
  sprout: [' _   _ ', '( \\ / )', ' \\ V / ', '   |   ', ' __|__ '],
  camera: ['   ___   ', ' _|___|_ ', '|  (o)  |', '|_______|'],
  bunny: [' (\\_/) ', ' (o.o) ', ' (> <) ', ' (_|_) '],
  duck: ['   __   ', ' <(o )__', '  ( ._> )', '   `---\' '],
  bear: [' ()---() ', ' ( o.o ) ', '  ( Y )  ', ' /|   |\\ ', '(_|___|_)'],
  pig: [' /\\___/\\ ', '( o   o )', ' \\(o_o)/ ', '  (   )  ', '  (_|_)  '],
  dog: [' /\\___/\\ ', '/ o   o \\', '\\  (_)  /', ' `--w--\' '],
  chicken: ['   ,   ', '  (o)> ', ' /   ) ', '(_/ /  ', '  ||   '],
  butterfly: [' .-. .-. ', '(   Y   )', ' >--|--< ', '(   |   )', ' `-\' `-\' '],
  ghost: ['  .---.  ', ' / o o \\ ', '|   ~   |', '|       |', ' |_/|_/| '],
};
const INKS = { berry:'#a05b97', heart:'#a05b97', flower:'#9b70b5', peach:'#a26b9b', bow:'#ab78b6', cherry:'#a26096', moon:'#71619d', cloud:'#8b83ab', star:'#9d81bb', frog:'#776296', sprout:'#7f6d9e', bunny:'#9479af', cat:'#7a5c9c', ghost:'#9180b8' };
const xml = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function artLines(name) { return ORNAMENTS[name] || ART[name] || ART.flower; }

export function spriteSVG(name, size=32) {
  const lines=artLines(name), width=Math.max(...lines.map(l=>l.length))*10+4, height=lines.length*17+5;
  const color=INKS[name] || '#83669e';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="ascii-sprite" width="${size}" height="${size}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g fill="${color}" font-family="Courier New, Courier, monospace" font-size="16.67" font-weight="bold" xml:space="preserve">${lines.map((line,i)=>`<text style="white-space:pre" x="2" y="${15+i*17}">${xml(line)}</text>`).join('')}</g></svg>`;
}

export function drawSprite(ctx,name,x,y,size) {
  const lines=artLines(name), cols=Math.max(...lines.map(l=>l.length));
  const fontSize=Math.min(size/(cols*.6),size/(lines.length*1.04));
  const w=cols*fontSize*.6,h=lines.length*fontSize*1.04;
  ctx.save();ctx.font=`bold ${fontSize}px ${ASCII_FONT}`;ctx.fillStyle=INKS[name]||'#83669e';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.shadowColor='#ffffffcc';ctx.shadowOffsetX=fontSize*.045;ctx.shadowOffsetY=fontSize*.06;
  lines.forEach((line,i)=>ctx.fillText(line,x+(size-w)/2,y+(size-h)/2+i*fontSize*1.04));
  ctx.restore();
}

export function landscapeSVG(variant=0) {
  const backgrounds=['#f9f5fd','#fcf6fb','#f5f2fc','#fdfbff'],inks=['#a087b8','#ad8ba9','#9884b0','#af9abb'];
  const ink=inks[variant%4];
  const motif=(name,x,y,w,h,rotate=0)=>`<g transform="translate(${x} ${y}) rotate(${rotate} ${w/2} ${h/2})">${ornamentSVG(name,w,h,ink)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <rect width="640" height="400" fill="${backgrounds[variant%4]}"/>
    <rect x="15" y="15" width="610" height="370" rx="150" fill="none" stroke="#d8c6e7" stroke-dasharray="1 6"/>
    <ellipse cx="318" cy="199" rx="204" ry="178" fill="#fffcff" opacity=".7"/>
    ${motif(variant%2?'rose':'bouquet',-12,116,205,270,-13)}
    ${motif('butterfly',471,24,158,142,18)}
    ${motif('rose',498,229,128,164,19)}
    ${motif(variant%2?'cat':'bunny',40,254,88,107,-8)}
    ${motif('bow',268,23,108,89)}
    <g fill="${ink}" font-family="Courier New,monospace" font-size="15"><text x="154" y="57">*</text><text x="471" y="244">+</text><text x="215" y="339">.</text><text x="412" y="75">.</text><text x="395" y="361">*</text><text x="62" y="127">+</text></g>
  </svg>`;
}

// Render photographs as colored characters. Reuse the sampler for live camera frames.
const sampler=document.createElement('canvas');
const sampleContext=sampler.getContext('2d',{willReadFrequently:true});
export function drawAsciiPhoto(ctx,source,width,height,columns=100) {
  const cols=Math.min(columns,Math.max(1,Math.round(width/5))),cell=width/cols,line=cell*1.8,rows=Math.max(1,Math.ceil(height/line));
  if(sampler.width!==cols)sampler.width=cols;if(sampler.height!==rows)sampler.height=rows;
  sampleContext.drawImage(source,0,0,cols,rows);
  const data=sampleContext.getImageData(0,0,cols,rows).data,ramp='@%#*+=-:. ';
  ctx.save();ctx.fillStyle='#fdfaff';ctx.fillRect(0,0,width,height);ctx.font=`bold ${cell/0.6}px ${ASCII_FONT}`;ctx.textAlign='left';ctx.textBaseline='top';
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const i=(y*cols+x)*4,luma=(data[i]*.299+data[i+1]*.587+data[i+2]*.114)/255;
    const glyph=ramp[Math.min(ramp.length-1,Math.floor(luma*ramp.length))];if(glyph===' ')continue;
    ctx.fillStyle=`rgb(${Math.round(74+luma*65)},${Math.round(43+luma*63)},${Math.round(104+luma*70)})`;
    ctx.fillText(glyph,x*cell,y*line);
  }
  ctx.restore();
}

export const svgData = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
