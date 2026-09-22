// Original pixel sprites. One source is used by the interface and exported photos.
const P = { d: '#4d624b', g: '#8cba75', G: '#b9d88c', l: '#edf2c9', p: '#e998a9', P: '#f7cbd1', r: '#c97087', w: '#fff9e9', y: '#edc463', Y: '#fae6a7', b: '#99c4d5', B: '#cee6ee', v: '#b29bc9', V: '#e2d5ef', n: '#886d59', N: '#c59c76', o: '#edae86', O: '#f9d8ab', k: '#49504b' };
const SPRITES = {
  flower: ['....pp....','...pPPp...','.ppPwwPpp.','pPPwwwwPPp','.ppwyywpp.','...pyyp...','....dd....','..ggdd....','...gddgg..','....ddg...'],
  berry: ['...gdg....','..ggGgg...','...ggg....','..rrprr...','.rpppppr..','.rpwpwpr..','.rpppppr..','..rpwpr...','...rpr....','....r.....'],
  frog: ['.ddd..ddd.','dgGddddGgd','dGwGggGwGd','dGkdGGdkGd','dGGGGGGGGd','dGpGddGpGd','.dGGGGGGd.','..ddGGdd..','.dGdGGdGd.','..dddddd..'],
  heart: ['.rrr.rrr.','rPPPrPPPr','rPpPPPPpr','rPPPPPPpr','.rPPPPpr.','..rPPpr..','...rpr...','....r....'],
  star: ['....y....','...yYy...','...yYy...','yyyYYYyyy','yYYYYYYYy','.yYYYYYy.','..yYYYy..','.yYYyYYy.','.yyy.yyy.'],
  mushroom: ['...rrrr...','..rPpPpr..','.rppwpppr.','rPwppppwPr','rrrrrrrrrr','...nwwn...','...nwwn...','..nwwwwn..','..nnnnnn..'],
  cloud: ['...BBB....','..BwwwB...','.BwwwwwBB.','BwwwwwwwwB','BwwwwwwwwB','.BBBBBBBB.'],
  moon: ['...yyyy...','..yYYy....','.yYYy.....','yYYYy.....','yYYYy.....','yYYYy.....','.yYYYy..y.','..yYYYyyYy','...yYYYYy.','....yyyy..'],
  sunflower: ['...yyyy...','.yyYYYYyy.','.yYYnnYYy.','yYYnNNnYYy','yYYnNNnYYy','.yYYnnYYy.','.yyYYYYyy.','...yddy...','..ggdd....','...gddgg..'],
  bee: ['..BB.BB...','.BwwBwwB..','..BB.BB...','.kkkkkk...','kYYkYYkkk.','kYYkYYkwk.','.kkkkkk...','...k.k....'],
  peach: ['....ddg...','...gGGg...','..oo..oo..','.oOOooOOo.','oOOOOOOOOo','oOOOooOOOo','oOOOOoOOOo','.oOOOoOOo.','..oOOOOo..','...oooo...'],
  bow: ['.rr....rr.','rPpr..rpPr','rPPprrpPPr','rPPPrrPPPr','.rrprrprr.','..pr..rp..','.rpr..rpr.','.rr....rr.'],
  cat: ['.nn....nn.','nPPn..nPPn','nNNNnnNNNn','nNNNNNNNNn','nNkwNNwkNn','nNNNpNNNNn','.nNNnnNNn.','..nNNNNn..','.nNNNNNNn.','.nnnnnnnn.'],
  cherry: ['.....dd...','....dgdd..','...dgg.d..','..d....d..','.rrr..rrr.','rPPrrrPPrr','rPprrrPprr','.rrr..rrr.'],
  sprout: ['.ggg......','gGGGg.ggg.','.gGGdgGGGg','..ggdgGGg.','....dggg..','....d.....','....d.....','...nnn....','..nNNNn...','...nnn....'],
  camera: ['..dddd....','..dGGd....','.dddddddd.','dPPPPPPPPd','dPdddPPwPd','dPdBbdPPPd','dPdBbdPPPd','dPPdddPPPd','.dddddddd.'],
  bunny: ['..nn..nn....','..nwn.nwn...','..nPn.nPn...','..nPnnnPn...','.nwwwwwwwn..','.nwkwwwkwn..','.nwPwpwPwn..','..nwwwwwn...','...nwwwn....','..nwwwwwn...','..nnwnwnn...'],
  duck: ['....yyyy....','...yYYYYy...','...yYkYYy...','...yYYYYooo.','....yYYYy...','.yy.yYYYy...','yYYyYYYYy...','yYYYYYYYy...','.yYYYYYy....','..yyyyy.....','...o.o......'],
  bear: ['.nnn...nnn..','nNNNn.nNNNn.','.nNNnnnNNn..','..nNNNNNn...','.nNkNNNkNn..','.nNNwwwNNn..','.nNPwkwPNn..','..nNwwwNn...','...nNNNn....','..nNNNNNn...','..nnNNNnn...'],
  pig: ['.rr.....rr..','rPpr...rpPr.','rPPprrrpPPr.','.rPPPPPPPr..','.rPkPPPkPr..','.rPPPpPPPr..','.rPPrrrrPr..','..rPrkrkr...','...rPPPr....','..rPPPPPr...','..rrPPprr...'],
  dog: ['..nnnnnn....','.nNNNNNNn...','nnNwNNwNnn..','nNNkNNkNNn..','nNNNwwNNNn..','.nNNkwNNn...','..nNNpNn....','...nNNn.....','..nNNNNn....','..nNnnNn....'],
  chicken: ['....rrr.....','...rpr......','...nwwwn....','...nwkwn....','...nwwwyy...','...nwwwn....','.nnnwwwn....','nwwwwwwn....','.nwwwwn.....','..nnnn......','...o.o......'],
  butterfly: ['....d.d.....','.vv.dd.vv...','vVVvdDvVVv..','vVVVdDVVVv..','.vVvdDvVv...','..vvdDvv....','.vVvdDvVv...','..vv..vv....'],
  ghost: ['...VVVV.....','..VwwwwV....','.VwwwwwwV...','.VwkwkwkV...','.VwwwwwwV...','.VwPwwPwV...','.VwwwwwwV...','.VwVwwVwV...','..V.VV.V....'],
};

export function spriteSVG(name, size = 32) {
  const rows = SPRITES[name] || SPRITES.flower;
  const width = Math.max(...rows.map(r => r.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rows.map((r,y) => [...r].map((c,x) => c !== '.' ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${P[c]}"/>` : '').join('')).join('')}</svg>`;
}

export function drawSprite(ctx, name, x, y, size) {
  const rows = SPRITES[name] || SPRITES.flower;
  const unit = size / Math.max(rows.length, ...rows.map(r => r.length));
  rows.forEach((row, iy) => [...row].forEach((c, ix) => {
    if (c === '.') return;
    ctx.fillStyle = P[c];
    ctx.fillRect(x + ix * unit, y + iy * unit, unit + .2, unit + .2);
  }));
}

export function landscapeSVG(variant = 0) {
  const sky = ['#e4ede4', '#f0e3e5', '#e5e1ed', '#e2ebf1'][variant % 4];
  const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const cloud = (x,y,s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff8e6"><path d="M0 5h7V2h5V0h12v3h7v3h8v5H0z"/><path fill="#dcded0" opacity=".6" d="M0 10h39v2H0z"/></g>`;
  const tree = (x,y,s,pink=false) => `<g transform="translate(${x} ${y}) scale(${s})">${rect(14,30,7,28,'#997c68')}${rect(18,34,3,24,'#786955')}<path fill="${pink?'#c691a7':'#6f9773'}" d="M7 2h21v6h7v9h5v17h-5v8H3v-8h-6V17h5V8h5z"/><path fill="${pink?'#e2b2c2':'#91b384'}" d="M8 2h18v6h7v10h-4v8H3V16h4z"/>${rect(9,7,8,4,pink?'#f4ccd5':'#b2ce98')}${rect(3,22,9,3,pink?'#dca5b9':'#a4c28d')}${rect(25,30,8,5,pink?'#bd879e':'#5e8667')}</g>`;
  const flowers = Array.from({length:60},(_,i) => {
    const x = (i*71+17)%640, y = 260+(i*37)%112;
    return `${rect(x,y+3,2,5,'#769762')}${rect(x-2,y,6,3,i%3===0?'#efb7c4':i%3===1?'#f7e8b0':'#f6f1d7')}${rect(x,y+1,2,2,'#d9b76b')}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" shape-rendering="crispEdges">
  ${rect(0,0,640,400,sky)}${rect(0,80,640,80,'#eaf0df')}${rect(0,144,640,56,'#e5e9cd')}
  <path fill="#fbf0c3" d="M467 35h32v5h8v8h5v27h-5v8h-8v5h-32v-5h-8v-8h-5V48h5v-8h8z"/>
  ${cloud(40,34,1.5)}${cloud(253,65,1.1)}${cloud(530,110,1.3)}${cloud(350,20,.7)}
  <path fill="#c3d6bc" d="M0 181h32v-14h26v-12h37v-12h48v-12h45v11h36v17h40v14h27v13h26v-12h34v-13h37v-13h48v-14h44v10h31v12h43v13h35v12h33v-13h28v-11h40v11h34v16H640v71H0z"/>
  <path fill="#aac698" d="M0 211h40v-9h42v-11h64v-8h45v11h40v7h53v11h70v-8h44v-12h40v-11h44v10h35v11h67v7h56v-13h46v-9h54v9H640v85H0z"/>
  ${rect(0,240,640,160,'#bcd299')}${rect(0,268,640,132,'#c8daab')}
  <path fill="#e5d3ab" d="M302 235h27v28h-7v20h-12v22h-16v24h-23v30h-30v41h92v-35h17v-40h4v-42h-7v-30h-18v-18z"/>
  <path fill="#eddfb9" d="M304 240h19v31h-12v27h-16v31h-24v30h-25v41h28v-33h24v-38h16v-28h13v-30h3v-20h-7z"/>
  ${tree(52,155,1.65)}${tree(566,162,1.4)}${tree(121,191,.88)}${tree(491,191,.85,true)}
  <g transform="translate(260 151)">${rect(3,41,110,53,'#baa18c')}${rect(7,38,105,52,'#f1dec0')}${rect(12,45,95,5,'#fbecd1')}${rect(104,40,9,50,'#ddc4a7')}${rect(78,3,13,26,'#a97e78')}${rect(76,0,17,6,'#8d726c')}<path fill="#9d797b" d="M-6 40h9v-8h10v-8h10v-8h10V8h52v8h10v8h10v8h10v8h8v9H-6z"/><path fill="#c6959b" d="M3 35h10v-9h10v-8h10v-8h50v8h10v8h10v9z"/>${rect(28,26,61,3,'#dba9a9')}${rect(19,37,83,3,'#d6a2a1')}${rect(45,60,24,30,'#9e826a')}${rect(48,63,17,27,'#bda186')}${rect(59,75,3,3,'#f1d483')}${rect(17,58,18,19,'#8a9d92')}${rect(19,60,14,14,'#c8e1d7')}${rect(25,60,2,14,'#fff2d2')}${rect(19,65,14,2,'#fff2d2')}${rect(78,58,18,19,'#8a9d92')}${rect(80,60,14,14,'#c8e1d7')}${rect(86,60,2,14,'#fff2d2')}${rect(80,65,14,2,'#fff2d2')}${rect(0,88,115,5,'#a38d72')}</g>
  ${Array.from({length:8},(_,i)=>`${rect(351+i*19,232,5,28,'#f3e7cb')}${rect(348+i*19,238,24,4,'#f3e7cb')}${rect(348+i*19,250,24,4,'#e4d7b6')}`).join('')}
  ${flowers}
  <path fill="#a2c5bf" d="M406 317h54v5h16v8h10v15h-10v7h-60v-6h-18v-15h8z"/><path fill="#c6e4d7" d="M411 320h45v7h18v13h-12v6h-43v-7h-14v-9h6z"/>
  <path fill="#eff3db" d="M419 326h18v2h-18zM446 337h20v2h-20z"/>
  <g transform="translate(457 311)">${spriteSVG('duck',22)}</g><g transform="translate(392 340)">${spriteSVG('frog',20)}</g><g transform="translate(229 243)">${spriteSVG('bunny',23)}</g><g transform="translate(340 256)">${spriteSVG('cat',20)}</g><g transform="translate(152 298)">${spriteSVG('chicken',21)}</g><g transform="translate(516 264)">${spriteSVG('butterfly',15)}</g>
  ${tree(-6,243,1.85,true)}${tree(603,265,1.3)}
  <g opacity=".55" fill="#9eb880">${Array.from({length:28},(_,i)=>rect((i*113)%640,280+(i*19)%116,9,2,'#a3bd88')).join('')}</g>
  </svg>`;
}

export const svgData = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
