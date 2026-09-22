// Original botanical drawings translated into shaded ASCII characters.
// The compositions are drawn here, not copied from an external art collection.
const S=360;

function path(ctx, d, fill='rgba(48,20,65,.10)', width=2.2, ink='rgba(44,19,61,.68)') {
  const p=new Path2D(d);ctx.fillStyle=fill;ctx.fill(p);ctx.lineWidth=width;ctx.strokeStyle=ink;ctx.stroke(p);
}
function ellipse(ctx,x,y,rx,ry,angle=0,fill='rgba(55,23,75,.12)',width=1.8) {
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='rgba(48,19,67,.65)';ctx.lineWidth=width;ctx.stroke();
}
function line(ctx,d,width=2.2,ink='rgba(49,20,70,.7)') {
  ctx.strokeStyle=ink;ctx.lineWidth=width;ctx.stroke(new Path2D(d));
}
function gradient(ctx,x,y,r) {
  const g=ctx.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);
  g.addColorStop(0,'rgba(51,25,71,.02)');g.addColorStop(.68,'rgba(53,25,74,.15)');g.addColorStop(1,'rgba(40,18,61,.36)');return g;
}
function leaf(ctx,x,y,size,angle=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  path(ctx,`M 0 0 C ${-size*.65} ${-size*.45} ${-size*.5} ${-size} 0 ${-size*1.25} C ${size*.55} ${-size*.8} ${size*.65} ${-size*.3} 0 0`,gradient(ctx,0,-size*.6,size),1.6);
  line(ctx,`M 0 0 Q 3 ${-size*.6} 0 ${-size*1.25}`,1.5);
  for(let i=1;i<4;i++)line(ctx,`M 0 ${-i*size*.25} L ${size*.27} ${-i*size*.25-size*.19} M 0 ${-i*size*.25} L ${-size*.27} ${-i*size*.25-size*.19}`,1,'rgba(49,20,70,.38)');
  ctx.restore();
}
function rose(ctx,x,y,r,rotation=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  for(let ring=3;ring>=1;ring--){
    const count=ring===3?7:5,rad=r*(ring/3)*.53;
    for(let j=0;j<count;j++){
      const angle=j*Math.PI*2/count+ring*.55;
      ctx.save();ctx.rotate(angle);ctx.translate(0,-rad);
      path(ctx,`M 0 ${r*.33} C ${-r*.66} ${r*.19} ${-r*.55} ${-r*.4} ${-r*.15} ${-r*.43} C ${r*.2} ${-r*.58} ${r*.66} ${-r*.07} 0 ${r*.33}`,gradient(ctx,-r*.08,-r*.12,r*.63),1.7);
      line(ctx,`M ${-r*.36} ${-r*.17} Q ${-r*.02} ${-r*.38} ${r*.26} ${-r*.03}`,1,'rgba(30,12,49,.35)');ctx.restore();
    }
  }
  line(ctx,`M ${-r*.13} 2 C ${-r*.3} ${-r*.25} ${r*.28} ${-r*.28} ${r*.18} 0 C ${r*.12} ${r*.18} ${-r*.15} ${r*.08} 0 ${-r*.1}`,2.1);
  ctx.restore();
}
function ribbon(ctx,x,y,size=100,angle=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size/100,size/100);
  path(ctx,'M -7 4 C -33 30 -59 5 -77 -22 C -89 -43 -82 -62 -62 -52 C -40 -44 -14 -19 -4 -4 Z',gradient(ctx,-52,-29,53),2);
  path(ctx,'M 7 4 C 33 30 59 5 77 -22 C 89 -43 82 -62 62 -52 C 40 -44 14 -19 4 -4 Z',gradient(ctx,52,-29,53),2);
  path(ctx,'M -5 2 C -11 46 -39 65 -53 111 L -24 100 L -10 118 C 3 81 12 40 8 5',gradient(ctx,-13,54,78),1.8);
  path(ctx,'M 7 5 C 18 36 55 46 62 91 L 42 80 L 30 103 C 21 59 -2 48 -9 7',gradient(ctx,30,51,75),1.8);
  line(ctx,'M -6 -4 Q -43 -42 -68 -39 M -10 7 Q -54 4 -69 -21 M 6 -4 Q 43 -42 68 -39 M 10 7 Q 54 4 69 -21 M -4 22 Q -7 69 -26 98 M 7 20 Q 29 52 37 76',1.4);
  path(ctx,'M -11 -7 Q 0 -17 11 -7 L 12 9 Q 0 18 -12 9 Z',gradient(ctx,0,0,20),1.7);ctx.restore();
}
function bouquet(ctx) {
  line(ctx,'M 178 334 Q 163 208 95 111 M 190 327 Q 179 209 220 87 M 179 319 Q 215 233 268 171',3);
  leaf(ctx,140,230,46,-.95);leaf(ctx,213,226,52,.94);leaf(ctx,135,176,42,-1.1);leaf(ctx,241,159,32,1.13);leaf(ctx,181,172,39,-.8);
  path(ctx,'M 109 178 Q 166 217 207 207 L 285 188 Q 243 247 214 320 L 155 327 Q 138 251 109 178 Z','rgba(56,22,74,.05)',1.7);
  line(ctx,'M 113 183 L 190 300 M 277 194 L 187 308 M 146 220 L 169 303',1.2,'rgba(42,20,63,.35)');
  rose(ctx,95,117,53,-.3);rose(ctx,221,87,54,.25);rose(ctx,268,173,44,-.3);rose(ctx,155,157,45,.3);
  ribbon(ctx,189,290,53,-.07);
  for(const [x,y] of [[49,205],[70,58],[280,81],[301,251]]){line(ctx,`M ${x-4} ${y} L ${x+4} ${y} M ${x} ${y-4} L ${x} ${y+4}`,1.5);}
}
function butterfly(ctx) {
  ctx.save();ctx.translate(180,171);
  for(const side of [-1,1]){
    ctx.save();ctx.scale(side,1);
    path(ctx,'M 0 -3 C 42 -12 75 -128 145 -136 C 176 -135 164 -71 145 -37 C 124 -3 53 33 6 17 Z',gradient(ctx,74,-53,111),2.4);
    path(ctx,'M 6 11 C 52 14 121 28 118 66 C 119 118 85 146 57 125 C 22 103 9 51 0 21 Z',gradient(ctx,67,72,77),2.4);
    line(ctx,'M 10 8 C 63 -33 101 -90 147 -120 M 22 6 C 66 -6 120 -41 150 -67 M 15 14 C 64 30 83 55 94 100 M 22 31 C 48 68 51 102 67 127',1.7);
    for(const [x,y,rx,ry,a] of [[132,-95,7,15,.42],[139,-53,6,10,.7],[91,-80,10,16,.56],[74,-44,9,13,.69],[49,-6,7,9,.4],[98,63,8,12,-.1],[72,93,7,12,-.4],[54,48,10,15,-.4]])ellipse(ctx,x,y,rx,ry,a,'#fff',1.4);
    for(let i=0;i<5;i++)ellipse(ctx,124-i*17,-29+i*7,2.3,2.3,0,'rgba(44,19,61,.65)',.5);
    ctx.restore();
  }
  ellipse(ctx,0,26,7,43,0,'rgba(32,15,46,.62)',2);ellipse(ctx,0,-14,9,11,0,'rgba(32,15,46,.54)',1.5);
  line(ctx,'M -4 -23 Q -8 -63 -31 -59 M 4 -23 Q 8 -63 31 -59',2);ellipse(ctx,-31,-60,3,3,0,'rgba(32,15,46,.5)');ellipse(ctx,31,-60,3,3,0,'rgba(32,15,46,.5)');
  for(let i=0;i<5;i++)line(ctx,`M -6 ${i*12+5} L 6 ${i*12+5}`,1.1,'rgba(255,255,255,.9)');ctx.restore();
}
function botanical(ctx) {
  line(ctx,'M 177 343 C 169 259 167 209 187 137',3);
  leaf(ctx,177,294,51,.8);leaf(ctx,171,260,49,-1.05);leaf(ctx,174,215,34,.95);
  rose(ctx,185,114,78,-.12);
  line(ctx,'M 159 327 Q 118 271 104 210',2);leaf(ctx,143,300,33,-.9);leaf(ctx,125,267,25,.8);leaf(ctx,110,235,22,-.65);
}
function smallFlower(ctx) {
  line(ctx,'M 180 333 C 172 260 180 216 182 168',3);leaf(ctx,181,281,47,.9);leaf(ctx,177,237,36,-.9);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ellipse(ctx,180+Math.cos(a)*39,128+Math.sin(a)*39,27,42,a+Math.PI/2,gradient(ctx,180,128,83),2);}
  ellipse(ctx,180,128,28,28,0,'rgba(42,20,61,.3)',2);
  for(let i=0;i<30;i++){const a=i*2.4,r=Math.sqrt(i)*4.3;ellipse(ctx,180+Math.cos(a)*r,128+Math.sin(a)*r,1.8,1.8,0,'rgba(37,15,55,.65)',0);}
}
function portrait(ctx,kind) {
  const fill=gradient(ctx,165,190,147);
  if(kind==='bunny'){
    ellipse(ctx,137,83,25,66,-.13,fill,2.5);ellipse(ctx,215,82,25,67,.12,fill,2.5);
    ellipse(ctx,138,83,10,43,-.13,'rgba(40,18,60,.13)',1);ellipse(ctx,214,83,10,43,.12,'rgba(40,18,60,.13)',1);
  }else if(kind==='cat'){
    path(ctx,'M 99 143 L 98 63 Q 144 66 160 104 M 206 105 Q 238 65 268 66 L 256 157',fill,2.5);
    line(ctx,'M 110 123 L 110 82 L 144 104 M 223 107 L 254 82 L 248 128',1.8);
  }else if(kind==='dog'){
    ellipse(ctx,112,145,28,61,.25,fill,2.7);ellipse(ctx,247,145,28,61,-.25,fill,2.7);
  }else if(kind==='pig'){
    path(ctx,'M 101 147 Q 66 75 97 71 Q 130 73 152 112 M 212 112 Q 237 74 264 71 Q 292 77 260 149',fill,2.5);
  }else if(kind==='bear'){
    ellipse(ctx,115,106,29,31,-.4,fill,2.5);ellipse(ctx,244,106,29,31,.4,fill,2.5);
    ellipse(ctx,116,106,14,16,0,'rgba(44,20,66,.15)',1);ellipse(ctx,244,106,14,16,0,'rgba(44,20,66,.15)',1);
  }
  ellipse(ctx,181,260,65,69,0,fill,2.5);ellipse(ctx,181,175,83,73,0,fill,2.7);
  ellipse(ctx,130,310,33,16,-.12,fill,2);ellipse(ctx,231,310,33,16,.12,fill,2);
  ellipse(ctx,118,266,20,36,-.5,fill,2);ellipse(ctx,244,266,20,36,.5,fill,2);
  ellipse(ctx,150,172,8,10,0,'rgba(22,9,31,.9)',0);ellipse(ctx,211,172,8,10,0,'rgba(22,9,31,.9)',0);
  ellipse(ctx,148,168,1.8,2,0,'#fff',0);ellipse(ctx,209,168,1.8,2,0,'#fff',0);
  if(kind==='pig'){
    ellipse(ctx,181,203,28,18,0,'rgba(49,19,71,.18)',2.5);ellipse(ctx,170,203,4,6,0,'rgba(22,9,31,.8)',0);ellipse(ctx,192,203,4,6,0,'rgba(22,9,31,.8)',0);
  }else{
    path(ctx,'M 173 193 Q 181 182 189 193 L 181 202 Z','rgba(32,15,46,.65)',1);
    line(ctx,'M 181 201 Q 169 216 158 201 M 181 201 Q 193 216 204 201',2.5);
  }
  for(const x of [130,232]){ellipse(ctx,x,192,12,6,0,'rgba(50,20,69,.09)',0);}
  if(kind==='cat')line(ctx,'M 137 194 L 104 183 M 137 201 L 100 203 M 224 194 L 260 183 M 224 201 L 264 203 M 242 297 C 300 306 307 246 284 236',2);
  if(kind==='dog')path(ctx,'M 178 211 Q 192 207 196 214 Q 195 233 186 233 Q 176 229 178 211','rgba(49,19,71,.22)',1.5);
  ribbon(ctx,181,243,29,-.03);
}

function frog(ctx) {
  const fill=gradient(ctx,168,184,143);
  ellipse(ctx,180,256,67,62,0,fill,2.7);
  ellipse(ctx,112,303,39,20,-.18,fill,2.5);ellipse(ctx,248,303,39,20,.18,fill,2.5);
  ellipse(ctx,122,119,37,40,0,fill,2.7);ellipse(ctx,238,119,37,40,0,fill,2.7);
  ellipse(ctx,180,169,94,58,0,fill,2.7);
  ellipse(ctx,125,132,12,15,0,'rgba(22,9,31,.88)',1);ellipse(ctx,235,132,12,15,0,'rgba(22,9,31,.88)',1);
  ellipse(ctx,121,127,3,4,0,'white',0);ellipse(ctx,231,127,3,4,0,'white',0);
  line(ctx,'M 136 174 Q 179 217 226 174 M 142 231 L 129 277 M 218 231 L 232 277',3);
  ellipse(ctx,114,175,15,7,0,'rgba(49,19,71,.15)',0);ellipse(ctx,246,175,15,7,0,'rgba(49,19,71,.15)',0);
  ribbon(ctx,180,229,28,0);
}

function bird(ctx,chicken=false) {
  const fill=gradient(ctx,164,201,143);
  if(chicken){
    ellipse(ctx,153,92,14,25,-.3,fill,2);ellipse(ctx,180,76,15,29,0,fill,2);ellipse(ctx,205,92,14,24,.3,fill,2);
    path(ctx,'M 154 215 Q 144 256 160 255 Q 180 250 183 217','rgba(49,19,71,.25)',2);
  }
  ellipse(ctx,180,249,84,71,0,fill,2.7);ellipse(ctx,180,148,64,63,0,fill,2.7);
  path(ctx,'M 111 223 Q 81 179 71 211 Q 51 223 72 246 Q 48 267 73 275 Q 115 294 146 275',fill,2.7);
  path(ctx,'M 249 215 Q 282 204 279 230 Q 302 236 280 251 L 254 268',fill,2.5);
  ellipse(ctx,160,140,8,11,0,'rgba(22,9,31,.9)',0);ellipse(ctx,205,140,8,11,0,'rgba(22,9,31,.9)',0);
  if(chicken)path(ctx,'M 169 171 L 204 171 L 187 193 Z','rgba(49,19,71,.3)',2);
  else{ellipse(ctx,182,176,37,15,0,'rgba(49,19,71,.2)',2.7);line(ctx,'M 152 178 Q 185 187 214 177',1.8);}
  path(ctx,'M 133 304 L 123 331 L 156 328 L 177 335 L 170 307 M 201 307 L 193 335 L 217 328 L 246 331 L 234 304',fill,2.5);
  if(!chicken)ribbon(ctx,181,216,26,0);
}

function heart(ctx) {
  path(ctx,'M 180 311 C 122 272 42 202 42 125 C 42 41 139 39 180 107 C 221 39 318 41 318 125 C 318 202 238 272 180 311',gradient(ctx,135,120,198),3);
  line(ctx,'M 180 289 C 112 236 62 180 62 128 C 62 57 143 66 179 133 C 211 66 295 57 298 128 C 298 185 242 247 180 289',1.5);
  line(ctx,'M 78 120 Q 90 87 118 94',4,'rgba(255,255,255,.9)');
  ribbon(ctx,180,294,44,0);
}

function ascii(draw,cols=63,rows=37) {
  const c=document.createElement('canvas'),cw=5,ch=9;c.width=cols*cw;c.height=rows*ch;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.scale(c.width/S,c.height/S);draw(ctx);
  const data=ctx.getImageData(0,0,c.width,c.height).data,ramp=' .,:;i+xX#@',lines=[];
  for(let y=0;y<rows;y++){
    let line='';
    for(let x=0;x<cols;x++){
      let darkness=0;
      for(let dy=0;dy<ch;dy++)for(let dx=0;dx<cw;dx++){const at=((y*ch+dy)*c.width+x*cw+dx)*4;darkness+=(255-(data[at]+data[at+1]+data[at+2])/3)/255;}
      const tone=Math.pow(darkness/(cw*ch),.66);line+=ramp[Math.min(ramp.length-1,Math.floor(tone*ramp.length*1.3))];
    }
    lines.push(line);
  }
  while(lines.length&& !lines[0].trim())lines.shift();while(lines.length&& !lines.at(-1).trim())lines.pop();
  const first=Math.min(...lines.filter(l=>l.trim()).map(l=>l.search(/\S/))),last=Math.max(...lines.map(l=>l.trimEnd().length));
  return lines.map(l=>l.slice(first,last));
}

export const ORNAMENTS = {
  bouquet:ascii(bouquet,67,39),
  butterfly:ascii(butterfly,73,41),
  rose:ascii(botanical,61,39),
  bow:ascii(ctx=>ribbon(ctx,180,116,150,0),67,39),
  flower:ascii(smallFlower,51,35),
  sunflower:ascii(smallFlower,51,35),
  bunny:ascii(ctx=>portrait(ctx,'bunny'),49,33),
  cat:ascii(ctx=>portrait(ctx,'cat'),49,33),
  bear:ascii(ctx=>portrait(ctx,'bear'),49,33),
  pig:ascii(ctx=>portrait(ctx,'pig'),49,33),
  dog:ascii(ctx=>portrait(ctx,'dog'),49,33),
  frog:ascii(frog,49,33),
  duck:ascii(ctx=>bird(ctx,false),49,33),
  chicken:ascii(ctx=>bird(ctx,true),49,33),
  heart:ascii(heart,55,35),
};

export function ornamentSVG(name,width=260,height=260,color='#a184bd') {
  const lines=ORNAMENTS[name]||ORNAMENTS.bouquet,cols=Math.max(...lines.map(l=>l.length));
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" class="ascii-ornament" width="${width}" height="${height}" viewBox="0 0 ${cols*6+4} ${lines.length*10+4}" aria-hidden="true"><g font-family="Courier New,Courier,monospace" font-size="10" font-weight="bold" fill="${color}" xml:space="preserve">${lines.map((line,i)=>`<text style="white-space:pre" x="2" y="${9+i*10}">${escape(line)}</text>`).join('')}</g></svg>`;
}
