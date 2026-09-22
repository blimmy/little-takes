// Original character art, shared by SVG previews and Canvas exports.
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
export function artLines(name) { return ART[name] || ART.flower; }

export function spriteSVG(name, size=32) {
  const lines=artLines(name), width=Math.max(...lines.map(l=>l.length))*10+4, height=lines.length*17+5;
  const color=INKS[name] || '#83669e';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="ascii-sprite" width="${size}" height="${size}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g fill="${color}" font-family="Courier New, Courier, monospace" font-size="16.67" font-weight="bold" xml:space="preserve">${lines.map((line,i)=>`<text x="2" y="${15+i*17}">${xml(line)}</text>`).join('')}</g></svg>`;
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

function textArt(lines,x,y,size,color='#ad98c3') {
  return `<g fill="${color}" font-family="Courier New, Courier, monospace" font-size="${size}" font-weight="bold" xml:space="preserve">${lines.map((line,i)=>`<text x="${x}" y="${y+i*size*1.12}">${xml(line)}</text>`).join('')}</g>`;
}

export function landscapeSVG(variant=0) {
  const backgrounds=['#f9f5fd','#fcf6fb','#f5f2fc','#fdfbff'];
  const cloud=['    .--.    ',' .-(    ).  ','(        _) ',' `------\'   '];
  const tree=['    /\\    ','   /..\\   ','  /....\\  ',' /......\\ ','/________\\','    ||    '];
  const cottage=['        /\\        ','       /  \\       ','      /____\\      ','     /|    |\\     ','    /_|____|_\\    ','     | [] []|     ','     |  __  |     ','     | |  | |     ',' ____|_|__|_|____ '];
  const petals=['     _','   _(_)_','  (_)@(_)','    (_)','     | /'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <rect width="640" height="400" fill="${backgrounds[variant%4]}"/>
    ${textArt(cloud,18,28,10,'#d0bbdf')}${textArt(cloud,435,43,12,'#c4b2d6')}${textArt(['  \\ | /  ',' --(o)-- ','  / | \\  '],540,27,10,'#b59ccd')}
    ${textArt(['.','+','*'],168,43,13,'#c3acd4')}${textArt(['.    +    .'],290,48,10,'#c7b4db')}
    ${textArt(tree,6,123,13,'#c7b3db')}${textArt(tree,88,171,9,'#d9cbe6')}${textArt(tree,510,139,12,'#c1aed5')}
    ${textArt(cottage,240,141,11,'#b299c6')}
    ${textArt(['.-.   .-.   .-.   .-.   .-.','| |---| |---| |---| |---| |','| |---| |---| |---| |---| |'],380,251,10,'#cdbdde')}
    ${textArt(['. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'],4,295,10,'#dfd2eb')}
    ${textArt(artLines('bunny'),154,259,13,'#9879b3')}${textArt(artLines('cat'),485,305,13,'#9f85b9')}${textArt(artLines('frog'),62,328,12,'#a28bb7')}
    ${textArt(petals,210,328,10,'#bea0d0')}${textArt(petals,410,303,9,'#c5afd8')}${textArt(artLines('mushroom'),563,337,10,'#b49acb')}
    ${textArt(['~ ~ ~ ~','  ~ ~ ~ ~','~ ~ ~ ~'],306,329,10,'#c8b9de')}
    ${textArt(['" \\|/  .   ,   "    .   \\|/   "    .     ,   \\|/   .   "    .   ,'],10,389,11,'#cdbadd')}
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
