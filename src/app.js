import { LAYOUTS, FRAMES, FILTERS, STICKERS, COLORS } from './config.js?v=ascii-violet-1';
import { spriteSVG, landscapeSVG, svgData, drawAsciiPhoto } from './ascii.js?v=ascii-violet-1';
import { renderStrip, makeStory, canvasBlob, loadImage, geometry, clearImageCaches } from './renderer.js?v=ascii-violet-1';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const freshState = () => ({ layout:'strip3', frame:'meadow', filter:'original', photos:[], items:[], strokes:[], caption:'', showDate:true, date:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()).replaceAll('/','.') });
let state=freshState(), step=1, tab='stickers', color=COLORS[0], selected=null, stream=null, facing='user', mirrored=true, sound=false;
let busy=false, cameraOpening=false, captureToken=0, renderToken=0, exportToken=0, pixelRAF=0, lastStrip=null, preparedFile=null, exportURL=null, format='strip', audio=null;
let history=[], future=[], drag=null, toastTimer=null, captionTimer=null;
let capturing=false;
let cameraGeneration=0;
const FRIENDS=[['frog','Mochi','น้องโมจิ','วันนี้คุณยิ้มแล้วหรือยัง? เคโระ ♡'],['bunny','Mallow','น้องมาร์ชแมลโลว์','วันธรรมดาก็น่ารักได้ แค่มีคุณ!'],['cat','Miso','น้องมิโสะ','แวะมาถ่ายรูปกับเราอีกนะ เมี้ยว~'],['duck','Pudding','น้องพุดดิ้ง','ยิ้มให้กล้องหนึ่งที ก๊าบ!'],['bear','Honey','น้องฮันนี่','ส่งกอดอุ่น ๆ ให้คุณหนึ่งกอด ♡'],['pig','Peach','น้องพีช','วันนี้ขอให้ใจฟูเหมือนแก้มเราเลย'],['dog','Biscuit','น้องบิสกิต','คุณเป็นคนโปรดของสวนนี้เลยนะ!'],['chicken','Sunny','น้องซันนี่','พักสักนิด แล้วไปสนุกกันต่อ!']];
const video=$('#camera');
const preview=$('#strip-preview');
const layout=()=>LAYOUTS.find(l=>l.id===state.layout);
const complete=()=>state.photos.length>=layout().count;
const snapshot=()=>JSON.stringify({items:state.items,strokes:state.strokes,caption:state.caption,showDate:state.showDate});
function remember(){history.push(snapshot());if(history.length>40)history.shift();future=[];updateUndo();}
function updateUndo(){$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;}
function restore(s){Object.assign(state,JSON.parse(s));selected=null;$('#caption').value=state.caption;$('#show-date').checked=state.showDate;updateUndo();refreshPreview();}
function notify(message,error=false){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function errorMessage(message){$('#camera-error').textContent=message;$('#camera-error').hidden=false;}

function initUI(){
  $('#garden-friends').innerHTML=FRIENDS.map(([id,name,thai])=>`<button class="garden-friend" data-friend="${id}" aria-label="ทักทาย${thai}"><span class="friend-shadow"></span>${spriteSVG(id,56)}<span class="friend-name">${name}</span></button>`).join('');
  $$('[data-sprite]').forEach(el=>el.innerHTML=spriteSVG(el.dataset.sprite));
  $('#camera-landscape').src=svgData(landscapeSVG());
  $('#layout-options').innerHTML=LAYOUTS.map(l=>`<button class="layout-option ${l.id===state.layout?'selected':''}" data-layout="${l.id}" aria-label="${l.name} ${l.detail}" aria-pressed="${l.id===state.layout}"><span class="layout-mini ${l.id}">${'<i></i>'.repeat(l.count)}</span><small>${l.detail}</small></button>`).join('');
  $('#frame-options').innerHTML=FRAMES.map(f=>`<button class="frame-option ${f.id===state.frame?'selected':''}" data-frame="${f.id}" aria-label="${f.name} ${f.thai}" aria-pressed="${f.id===state.frame}" style="--frame-bg:${f.bg};--frame-accent:${f.accent}"><i class="frame-check">+</i><span class="frame-thumb"><span class="frame-paper" aria-hidden="true">+---+<br>| : |<br>| : |<br>+---+</span>${spriteSVG(f.sticker)}</span><span>${f.name}</span></button>`).join('');
  $('#filter-options').innerHTML=FILTERS.map(f=>`<button class="filter-option ${f.id===state.filter?'selected':''}" data-filter="${f.id}" aria-pressed="${f.id===state.filter}"><span class="filter-thumb"><img src="${svgData(landscapeSVG())}" alt="" style="filter:${f.css}"></span><span>${f.name}</span></button>`).join('');
  $('#sticker-options').innerHTML=STICKERS.map(([id,name])=>`<button class="sticker-option" data-sticker="${id}" aria-label="เพิ่ม${name}" title="${name}">${spriteSVG(id)}</button>`).join('');
  $('#color-options').innerHTML=COLORS.map(c=>`<button class="color-option ${c===color?'selected':''}" data-color="${c}" style="--color:${c}" aria-label="เลือกสี ${c}" aria-pressed="${c===color}"></button>`).join('');
  update();
}

function update(){
  const count=layout().count;
  $('#photo-counter').textContent=`${Math.min(state.photos.length,count)} / ${count} ภาพ`;
  $('#capture-hint').textContent=complete()?'ครบแล้ว! แต่งภาพแล้วเก็บความทรงจำได้เลย':`ถ่ายต่อเนื่อง ${count-state.photos.length} ภาพ · เตรียมท่าโปรดไว้ได้เลย`;
  $('#capture-label').textContent=complete()?'ไปแต่งภาพกัน':state.photos.length?'ถ่ายภาพที่เหลือ':'เริ่มถ่ายรูป';
  $('#next-step').textContent=step===2?'เก็บความทรงจำ →':'แต่งภาพต่อ →';
  $('#next-step').disabled=!complete()||busy;
  $('#preview-note').textContent=complete()?'น่ารักแล้ว เพิ่มความเป็นคุณอีกนิด ♡':state.photos.length?`อีก ${count-state.photos.length} ภาพก็ครบแล้ว`:'รูปน่ารัก ๆ กำลังจะมาอยู่ตรงนี้';
  $('#selected-frame-name').textContent=FRAMES.find(f=>f.id===state.frame).name;
  $$('[data-step]').forEach(b=>{const n=+b.dataset.step;b.disabled=busy||(n>1&&!complete());b.classList.toggle('active',n===step);b.classList.toggle('done',n<step);if(n===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  for(const [key,attr] of [['layout','layout'],['frame','frame'],['filter','filter']])$$(`[data-${attr}]`).forEach(b=>{b.classList.toggle('selected',b.dataset[attr]===state[key]);b.setAttribute('aria-pressed',String(b.dataset[attr]===state[key]));b.disabled=busy;});
  $('#upload').disabled=busy;$('#demo').disabled=busy;$('#capture').disabled=busy||cameraOpening;$('#reset').disabled=busy;
  $('#cancel-capture').hidden=!capturing;$('#switch-camera').disabled=busy||cameraOpening;$('#mirror').disabled=busy;$('#timer').disabled=busy;
  updatePhotos();
  refreshPreview();
}

function updatePhotos(){
  const tray=$('#photo-tray');tray.replaceChildren();
  state.photos.slice(0,layout().count).forEach((photo,i)=>{
    const thumb=document.createElement('div');thumb.className='shot-thumb';
    const img=document.createElement('img');img.src=photo.src;img.alt=`ภาพที่ ${i+1}`;
    const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',`ลบภาพที่ ${i+1}`);remove.disabled=busy;
    remove.addEventListener('click',()=>{state.photos.splice(i,1);clearImageCaches();if(step>1)goToStep(1);update();});
    thumb.append(img,remove);tray.append(thumb);
  });
}

async function refreshPreview(){
  const token=++renderToken;
  try{
    const canvas=await renderStrip(structuredClone(state));
    if(token!==renderToken)return;
    lastStrip=canvas;preview.width=canvas.width;preview.height=canvas.height;preview.getContext('2d').drawImage(canvas,0,0);
    $('#editor-mount').classList.toggle('wide',layout().cols===2||state.layout==='polaroid');
    updateSelection();
    if(step===3)prepareExport();
  }catch(e){if(token===renderToken)notify(e.message||'แสดงภาพไม่สำเร็จ ลองเลือกรูปใหม่อีกครั้ง',true);}
}

function goToStep(n){
  if(busy)return;
  if(n>1&&!complete()){notify('ถ่ายหรือเลือกรูปให้ครบก่อนนะ');return;}
  if(captionTimer){clearTimeout(captionTimer);captionTimer=null;}
  step=n;selected=null;
  $('#capture-options').hidden=n!==1;$('#decorate-options').hidden=n!==2;$('#save-options').hidden=n!==3;
  $('#capture-panel').hidden=n!==1;$('#edit-stage').hidden=n!==2;$('#save-stage').hidden=n!==3;
  (n===2?$('#editor-mount'):$('#preview-mount')).append($('#canvas-wrap'));
  if(n>1)stopCamera();
  if(n===3){preparedFile=null;$('#download').disabled=true;$('#share').disabled=true;}
  update();
  if(window.innerWidth<601)$('#studio').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
}

async function startCamera(){
  if(cameraOpening)return false;
  cameraOpening=true;$('#camera-error').hidden=true;$('#enable-camera').disabled=true;$('#enable-camera').textContent='กำลังเปิดกล้อง…';update();
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('NO_API');
    stopCamera();
    const generation=cameraGeneration;
    const requestedStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1440}},audio:false});
    if(generation!==cameraGeneration||step!==1){requestedStream.getTracks().forEach(t=>t.stop());return false;}
    stream=requestedStream;
    video.srcObject=stream;
    await video.play();
    if(!video.videoWidth)await new Promise(resolve=>video.addEventListener('loadedmetadata',resolve,{once:true}));
    video.hidden=false;$('#camera-welcome').hidden=true;$('#camera-landscape').hidden=true;
    $('#camera-status').textContent='LIVE · HELLO, LOVELY!';$('.live-label').classList.add('on');
    $('#viewfinder-label').textContent='you look lovely today ♡';
    const slot=geometry(layout())[0];$('#viewfinder').style.aspectRatio=String(slot.w/slot.h);
    applyLiveFilter();
    stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(stream){captureToken++;busy=false;capturing=false;stopCamera();errorMessage('กล้องหยุดทำงาน ลองเปิดกล้องอีกครั้ง หรือเลือกรูปจากเครื่องได้เลย');update();}}));
    return true;
  }catch(e){
    stopCamera();
    const message=e.name==='NotAllowedError'?'ยังไม่ได้อนุญาตให้ใช้กล้อง แตะไอคอนข้างที่อยู่เว็บเพื่ออนุญาต หรือเลือกรูปจากเครื่องได้เลย':e.name==='NotFoundError'?'ไม่พบกล้องในเครื่องนี้ เลือกรูปจากเครื่องมาทำ Photo strip ได้เลย':e.name==='NotReadableError'?'กล้องอาจถูกใช้งานในแอปอื่น ลองปิดแอปนั้นก่อนแล้วเปิดกล้องใหม่':e.message==='NO_API'?'เบราว์เซอร์นี้เปิดกล้องไม่ได้ ลองเปิดเว็บด้วย Safari หรือ Chrome หรือเลือกรูปจากเครื่อง':'เปิดกล้องไม่สำเร็จ ลองอีกครั้ง หรือเลือกรูปจากเครื่องได้เลย';
    errorMessage(message);return false;
  }finally{cameraOpening=false;$('#enable-camera').disabled=false;$('#enable-camera').innerHTML='เปิดกล้องของฉัน <span>↗</span>';update();}
}

function stopCamera(){
  cameraGeneration++;
  const old=stream;stream=null;old?.getTracks().forEach(t=>t.stop());video.srcObject=null;
  cancelAnimationFrame(pixelRAF);video.hidden=true;$('#pixel-camera').hidden=true;$('#camera-welcome').hidden=false;$('#camera-landscape').hidden=false;
  $('#camera-status').textContent='YOUR COZY CORNER';$('.live-label').classList.remove('on');$('#viewfinder').style.aspectRatio='';$('#viewfinder-label').textContent='a little place to be yourself ♡';
}

function applyLiveFilter(){
  cancelAnimationFrame(pixelRAF);
  video.style.filter=FILTERS.find(f=>f.id===state.filter).css;video.classList.toggle('mirrored',mirrored);
  const pixel=$('#pixel-camera');pixel.classList.toggle('mirrored',mirrored);
  const rendered=['pixel','ascii'].includes(state.filter);
  pixel.hidden=!stream||!rendered;video.hidden=!stream||rendered;
  if(stream&&rendered){
    const tiny=document.createElement('canvas');tiny.width=90;tiny.height=Math.max(1,Math.round(90*video.videoHeight/video.videoWidth));
    const tc=tiny.getContext('2d');pixel.width=Math.min(video.videoWidth,900);pixel.height=Math.round(pixel.width*video.videoHeight/video.videoWidth);
    const ctx=pixel.getContext('2d');ctx.imageSmoothingEnabled=false;
    let lastFrame=-Infinity;
    const paint=(time=0)=>{
      if(!stream||!['pixel','ascii'].includes(state.filter))return;
      if(time-lastFrame>=80){
        if(state.filter==='ascii')drawAsciiPhoto(ctx,video,pixel.width,pixel.height,100);
        else{tc.drawImage(video,0,0,tiny.width,tiny.height);ctx.drawImage(tiny,0,0,pixel.width,pixel.height);}
        lastFrame=time;
      }
      pixelRAF=requestAnimationFrame(paint);
    };paint();
  }
}

function beep(frequency=660,duration=.08){
  if(!sound)return;
  try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.06,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{/* Sound is optional. */}
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function capture(){
  if(complete()){goToStep(2);return;}
  if(!stream){await startCamera();return;}
  if(busy)return;
  busy=true;capturing=true;const token=++captureToken;update();beep(480,.04);
  try{
    while(state.photos.length<layout().count){
      const seconds=Number($('#timer').value);
      for(let n=seconds;n>0;n--){
        if(token!==captureToken||!stream)return;
        $('#countdown').hidden=false;$('#countdown').textContent=n;beep();await delay(1000);
      }
      $('#countdown').hidden=true;
      if(token!==captureToken||!stream)return;
      if(!video.videoWidth||video.readyState<2)throw new Error('กล้องยังไม่พร้อม ลองถ่ายอีกครั้ง');
      const c=document.createElement('canvas');const scale=Math.min(1,1800/video.videoWidth);c.width=Math.round(video.videoWidth*scale);c.height=Math.round(video.videoHeight*scale);
      const ctx=c.getContext('2d');if(mirrored){ctx.translate(c.width,0);ctx.scale(-1,1);}ctx.drawImage(video,0,0,c.width,c.height);
      state.photos.push({id:crypto.randomUUID(),src:c.toDataURL('image/jpeg',.94)});
      $('#camera-flash').classList.remove('flash');void $('#camera-flash').offsetWidth;$('#camera-flash').classList.add('flash');beep(1000,.12);update();await delay(500);
    }
  }catch(e){errorMessage(e.message||'ถ่ายภาพไม่สำเร็จ ลองอีกครั้ง');}
  finally{if(token===captureToken){busy=false;capturing=false;$('#countdown').hidden=true;update();if(complete())goToStep(2);}}
}

async function upload(files){
  if(!files.length||busy)return;
  if(complete()){notify('รูปครบแล้ว ลบภาพที่อยากเปลี่ยนด้วยปุ่ม × ก่อนนะ');$('#file-input').value='';return;}
  busy=true;update();let failed=0,remaining=layout().count-state.photos.length;
  try{
    for(const file of files){
      if(state.photos.length>=layout().count)break;
      if(!/^image\//.test(file.type)&&! /\.(heic|heif|jpe?g|png|webp|avif)$/i.test(file.name)){failed++;continue;}
      if(file.size>30*1024*1024){failed++;notify('ไฟล์ใหญ่เกิน 30 MB ลองลดขนาดรูปก่อนนะ',true);continue;}
      const url=URL.createObjectURL(file);
      try{
        const img=await loadImage(url);
        if(!img.width||!img.height)throw new Error('Empty image');
        const ratio=Math.min(1,1800/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);
        const ctx=c.getContext('2d');ctx.fillStyle='#fff9ed';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
        state.photos.push({id:crypto.randomUUID(),src:c.toDataURL('image/jpeg',.94)});
      }catch{failed++;}finally{URL.revokeObjectURL(url);}
    }
  }finally{busy=false;$('#file-input').value='';update();}
  if(failed)notify('มีบางรูปที่เปิดไม่ได้ ลองใช้ไฟล์ JPG, PNG หรือ WebP แทนนะ',true);
  else if(files.length>remaining)notify(`เลือก ${remaining} รูปแรกให้พอดีกับกรอบแล้ว`);
  else notify('เพิ่มรูปแล้ว น่ารักมาก ♡');
  if(complete())goToStep(2);
}

async function useDemo(){
  if(busy)return;
  if(complete()){goToStep(2);return;}
  busy=true;update();
  try{while(state.photos.length<layout().count){const i=state.photos.length,img=await loadImage(svgData(landscapeSVG(i))),c=document.createElement('canvas');c.width=1280;c.height=800;c.getContext('2d').drawImage(img,0,0,1280,800);state.photos.push({id:crypto.randomUUID(),src:c.toDataURL('image/png')});}}
  finally{busy=false;update();}
  notify('กำลังใช้ภาพสวนตัวอย่าง ลองแต่งได้เต็มที่เลย');goToStep(2);
}

function setTab(value){
  tab=value;selected=null;
  $$('[data-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.tab===value));
  ['stickers','text','draw'].forEach(t=>$(`#tab-${t}`).hidden=t!==value);
  $('#color-control').hidden=value==='stickers';$('#editor-mount').classList.toggle('drawing',value==='draw');
  $('#edit-instruction').textContent=value==='draw'?'ลากนิ้วหรือเมาส์บนภาพ วาดได้ตามใจเลย':value==='text'?'พิมพ์ข้อความแล้วกดเพิ่ม จากนั้นลากไปวางได้':'แตะสติกเกอร์ด้านซ้าย แล้วลากไปวางบนภาพ';
  updateSelection();
}
function addSticker(name){
  if(state.items.length>=60){notify('มีของตกแต่งครบ 60 ชิ้นแล้ว ลบชิ้นเก่าก่อนได้เลย');return;}
  remember();const id=crypto.randomUUID();state.items.push({id,type:'sticker',name,x:.48+((state.items.length%3)-1)*.13,y:.35+(state.items.length%4)*.1,size:.2,rotation:0});selected=id;refreshPreview();
}
function addText(){
  const text=$('#text-input').value.trim();if(!text){$('#text-input').focus();return;}
  if(state.items.length>=60){notify('ลบของตกแต่งเก่าก่อนเพิ่มข้อความนะ');return;}
  remember();const id=crypto.randomUUID();state.items.push({id,type:'text',text,color,x:.5,y:.5,size:Number($('#text-size').value)/100,rotation:0});selected=id;$('#text-input').value='';refreshPreview();
}
function itemBounds(item){
  const ratio=preview.width/preview.height;
  let w=item.size,h=item.size*ratio;
  if(item.type==='text'){
    const ctx=preview.getContext('2d');ctx.font=`700 ${item.size*preview.width}px "Bai Jamjuree", sans-serif`;w=Math.min(.9,ctx.measureText(item.text).width/preview.width);h=item.size*ratio*1.3;
  }
  return{x:item.x-w/2,y:item.y-h/2,w,h};
}
function updateSelection(){
  const item=state.items.find(i=>i.id===selected),el=$('#object-selection');
  el.hidden=!item||step!==2||tab==='draw';$('#selection-tools').hidden=!item||tab==='draw';
  if(!item)return;
  const b=itemBounds(item);Object.assign(el.style,{left:`${b.x*100}%`,top:`${b.y*100}%`,width:`${b.w*100}%`,height:`${b.h*100}%`,transform:`rotate(${item.rotation||0}deg)`});
}
function pointerPosition(e){const r=preview.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
preview.addEventListener('pointerdown',e=>{
  if(step!==2||e.button>0)return;e.preventDefault();
  const p=pointerPosition(e);preview.setPointerCapture(e.pointerId);
  if(tab==='draw'){
    if(state.strokes.length>=150){notify('มีลายเส้นครบ 150 เส้นแล้ว ล้างลายเส้นก่อนวาดต่อได้เลย');return;}
    remember();selected=null;const stroke={points:[p],color,width:Number($('#pen-size').value)/600};state.strokes.push(stroke);drag={type:'draw',stroke};refreshPreview();
  }else{
    const item=[...state.items].reverse().find(i=>{const b=itemBounds(i);const angle=-(i.rotation||0)*Math.PI/180,dx=(p.x-i.x)*preview.width,dy=(p.y-i.y)*preview.height;const rx=(dx*Math.cos(angle)-dy*Math.sin(angle))/preview.width,ry=(dx*Math.sin(angle)+dy*Math.cos(angle))/preview.height;return Math.abs(rx)<b.w/2+.025&&Math.abs(ry)<b.h/2+.015;});
    selected=item?.id||null;
    if(item){remember();drag={type:'move',item,dx:p.x-item.x,dy:p.y-item.y};preview.style.cursor='grabbing';}
    updateSelection();
  }
});
preview.addEventListener('pointermove',e=>{
  if(!drag)return;e.preventDefault();const p=pointerPosition(e);
  if(drag.type==='draw'){if(drag.stroke.points.length<2500)drag.stroke.points.push(p);}
  else{drag.item.x=Math.max(.02,Math.min(.98,p.x-drag.dx));drag.item.y=Math.max(.02,Math.min(.98,p.y-drag.dy));}
  refreshPreview();
});
function endDrag(){drag=null;preview.style.cursor='';}
preview.addEventListener('pointerup',endDrag);preview.addEventListener('pointercancel',endDrag);preview.addEventListener('lostpointercapture',endDrag);

async function prepareExport(){
  if(!lastStrip||!complete())return;
  const token=++exportToken;preparedFile=null;$('#download').disabled=true;$('#share').disabled=true;$('#file-info').textContent='กำลังเตรียมไฟล์…';
  try{
    const canvas=format==='story'?makeStory(lastStrip,state.frame):lastStrip;
    const blob=await canvasBlob(canvas);if(token!==exportToken||step!==3)return;
    preparedFile=new File([blob],`little-takes-${format}-${new Date().toISOString().slice(0,10)}.png`,{type:'image/png'});
    if(exportURL)URL.revokeObjectURL(exportURL);exportURL=URL.createObjectURL(blob);
    const img=new Image();img.src=exportURL;img.alt=format==='story'?'ภาพที่พร้อมแชร์ลงสตอรี่':'Photo strip พร้อมดาวน์โหลด';$('#save-mount').replaceChildren(img);
    $('#file-info').textContent=`${canvas.width} × ${canvas.height} px · PNG · ${(blob.size/1024/1024).toFixed(1)} MB`;
    $('#download').disabled=false;$('#share').disabled=false;
  }catch{notify('เตรียมไฟล์ไม่สำเร็จ ลองกลับไปหน้าตกแต่งแล้วเปิดใหม่',true);}
}
function download(){
  if(!preparedFile||!exportURL)return;
  const a=document.createElement('a');a.href=exportURL;a.download=preparedFile.name;a.style.display='none';document.body.append(a);a.click();a.remove();notify('ส่งไฟล์ให้เบราว์เซอร์ดาวน์โหลดแล้ว ♡');
}
async function share(){
  if(!preparedFile)return;
  if(navigator.canShare?.({files:[preparedFile]})&&navigator.share){
    try{await navigator.share({files:[preparedFile]});notify('ส่งความทรงจำแล้ว ♡');}
    catch(e){if(e.name!=='AbortError'){notify('แชร์ไม่ได้ในตอนนี้ ดาวน์โหลดแล้วแชร์จากแกลเลอรีได้เลย',true);}}
  }else{
    showDialog(`${spriteSVG('heart',44)}<h2>ส่งความน่ารักให้คนโปรด</h2><p>เบราว์เซอร์นี้ยังแชร์ไฟล์ภาพโดยตรงไม่ได้ ดาวน์โหลดภาพ แล้วเลือกจากแกลเลอรีในแอปที่ชอบได้เลย</p><ol><li>เลือก <b>Story size</b> หากจะลงสตอรี่</li><li>กด <b>ดาวน์โหลดภาพ</b> และบันทึกลงเครื่อง</li><li>เปิด Instagram, Facebook หรือ LINE แล้วเลือกรูปที่บันทึกไว้</li></ol><p>บนมือถือที่รองรับ ปุ่มแชร์จะเปิดเมนูแชร์ของเครื่อง แอปและตัวเลือกสตอรี่จะขึ้นกับเครื่องและแอปที่ติดตั้ง</p>`);
  }
}

function showDialog(content){$('#dialog-content').innerHTML=content;$('#info-dialog').showModal();}
function help(){showDialog(`${spriteSVG('frog',46)}<h2>ยินดีต้อนรับสู่ Little Takes</h2><p>ห้องถ่ายรูปเล็ก ๆ ที่อยากให้คุณได้ยิ้ม</p><ol><li><b>เลือกกรอบและเลย์เอาต์</b> ที่ตรงกับอารมณ์วันนี้</li><li><b>เปิดกล้อง แล้วกดเริ่มถ่ายรูป</b> ระบบนับถอยหลังให้ทุกภาพ หรือเลือกรูปจากเครื่องก็ได้</li><li><b>เติมความน่ารัก</b> ด้วยสติกเกอร์ ข้อความ และลายเส้น ลากของตกแต่งไปตรงที่ชอบได้เลย</li><li><b>ดาวน์โหลดหรือแชร์</b> เป็น Photo strip หรือภาพสตอรี่ 9:16</li></ol><p>ยังไม่อยากเปิดกล้อง? กด “ลองเล่นด้วยภาพตัวอย่าง” ได้เลย ♡</p>`);}
function privacy(){showDialog(`${spriteSVG('sprout',44)}<h2>ความทรงจำเป็นของคุณ</h2><p>Little Takes ประมวลผลรูปภาพบนอุปกรณ์ของคุณ ไม่มีการอัปโหลดรูปไปที่เซิร์ฟเวอร์ และไม่ต้องสมัครสมาชิก</p><p>กล้องจะเปิดเมื่อคุณกดอนุญาตเท่านั้น และจะปิดเมื่อเปลี่ยนไปแต่งภาพ หรือออกจากหน้าเว็บ</p><p>รูปและของตกแต่งเก็บในหน่วยความจำชั่วคราวของหน้านี้ เมื่อรีเฟรชหรือปิดแท็บจะหายไป กรุณาดาวน์โหลดรูปที่ต้องการเก็บไว้ก่อน</p><p>เว็บไม่มีระบบติดตามและไม่ใช้คุกกี้วิเคราะห์ผู้เข้าชม ไฟล์ฟอนต์และภาพตกแต่งมากับเว็บทั้งหมด ผู้ให้บริการ GitHub Pages อาจมีบันทึกการเข้าถึงตามนโยบายของผู้ให้บริการ</p>`);}
function reset(){
  captureToken++;stopCamera();state=freshState();selected=null;history=[];future=[];preparedFile=null;lastStrip=null;format='strip';
  if(exportURL)URL.revokeObjectURL(exportURL);exportURL=null;clearImageCaches();
  $('#caption').value='';$('#text-input').value='';$('#show-date').checked=true;$('#camera-error').hidden=true;
  $$('[data-format]').forEach(b=>b.classList.toggle('selected',b.dataset.format==='strip'));setTab('stickers');updateUndo();goToStep(1);notify('พร้อมเก็บความทรงจำใหม่แล้ว ♡');
}

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.layout){
    if(busy)return;state.layout=b.dataset.layout;
    const count=layout().count;if(state.photos.length>count)notify(`ใช้ ${count} รูปแรก รูปที่เหลือยังเก็บไว้ให้เมื่อเปลี่ยนเลย์เอาต์`);
    if(stream){const slot=geometry(layout())[0];$('#viewfinder').style.aspectRatio=String(slot.w/slot.h);}update();
  }
  if(b.dataset.frame){state.frame=b.dataset.frame;update();}
  if(b.dataset.filter){state.filter=b.dataset.filter;applyLiveFilter();update();}
  if(b.dataset.step)goToStep(+b.dataset.step);
  if(b.dataset.tab)setTab(b.dataset.tab);
  if(b.dataset.sticker)addSticker(b.dataset.sticker);
  if(b.dataset.color){color=b.dataset.color;$$('[data-color]').forEach(el=>{el.classList.toggle('selected',el.dataset.color===color);el.setAttribute('aria-pressed',String(el.dataset.color===color));});}
  if(b.dataset.edit){const item=state.items.find(i=>i.id===selected);if(!item)return;remember();if(b.dataset.edit==='delete'){state.items=state.items.filter(i=>i.id!==selected);selected=null;}if(b.dataset.edit==='larger')item.size=Math.min(item.type==='text'?.16:.55,item.size*1.15);if(b.dataset.edit==='smaller')item.size=Math.max(.025,item.size/1.15);if(b.dataset.edit==='rotate')item.rotation=(item.rotation+15)%360;refreshPreview();}
  if(b.dataset.format){format=b.dataset.format;$$('[data-format]').forEach(el=>el.classList.toggle('selected',el.dataset.format===format));prepareExport();}
  if(b.dataset.action==='help')help();if(b.dataset.action==='privacy')privacy();
  if(b.dataset.friend){const friend=FRIENDS.find(f=>f[0]===b.dataset.friend);const old=$('.friend-message');if(old)old.remove();const bubble=document.createElement('span');bubble.className='friend-message';bubble.setAttribute('role','status');bubble.textContent=friend[3];$('#garden-friends').append(bubble);setTimeout(()=>bubble.remove(),4000);}
});
$('#enable-camera').addEventListener('click',startCamera);$('#capture').addEventListener('click',capture);
$('#cancel-capture').addEventListener('click',()=>{captureToken++;busy=false;capturing=false;$('#countdown').hidden=true;update();notify('หยุดถ่ายแล้ว รูปที่ถ่ายไว้ยังอยู่นะ');});
$('#upload').addEventListener('click',()=>{if(complete()){notify('กด × บนรูปที่อยากเปลี่ยนก่อนนะ');return;}$('#file-input').click();});
$('#file-input').addEventListener('change',e=>upload([...e.target.files]));$('#demo').addEventListener('click',useDemo);
$('#mirror').addEventListener('click',()=>{mirrored=!mirrored;$('#mirror').classList.toggle('active',mirrored);$('#mirror').setAttribute('aria-pressed',String(mirrored));applyLiveFilter();});
$('#switch-camera').addEventListener('click',async()=>{facing=facing==='user'?'environment':'user';mirrored=facing==='user';$('#mirror').classList.toggle('active',mirrored);$('#mirror').setAttribute('aria-pressed',String(mirrored));await startCamera();});
$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').classList.toggle('active',sound);$('#sound span').textContent=sound?'เสียงเปิด':'เสียงปิด';beep();});
$('#next-step').addEventListener('click',()=>goToStep(step===1?2:3));$('#add-text').addEventListener('click',addText);
$('#text-input').addEventListener('keydown',e=>{if(e.key==='Enter')addText();});
$('#clear-drawing').addEventListener('click',()=>{if(!state.strokes.length)return;remember();state.strokes=[];refreshPreview();});
$('#undo').addEventListener('click',()=>{if(history.length){future.push(snapshot());restore(history.pop());}});
$('#redo').addEventListener('click',()=>{if(future.length){history.push(snapshot());restore(future.pop());}});
$('#caption').addEventListener('focus',()=>remember());
$('#caption').addEventListener('input',e=>{state.caption=e.target.value;clearTimeout(captionTimer);captionTimer=setTimeout(refreshPreview,100);});
$('#show-date').addEventListener('change',e=>{remember();state.showDate=e.target.checked;refreshPreview();});
$('#download').addEventListener('click',download);$('#share').addEventListener('click',share);
$('#reset').addEventListener('click',()=>{if(state.photos.length||state.items.length)$('#reset-dialog').showModal();else reset();});
$('#keep-session').addEventListener('click',()=>$('#reset-dialog').close());$('#confirm-reset').addEventListener('click',()=>{$('#reset-dialog').close();reset();});
$('.dialog-close').addEventListener('click',()=>$('#info-dialog').close());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
document.addEventListener('keydown',e=>{if(step!==2||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('dialog[open]'))return;if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();(e.shiftKey?$('#redo'):$('#undo')).click();}if((e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();$('[data-edit="delete"]').click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(stream||cameraOpening)){captureToken++;busy=false;capturing=false;$('#countdown').hidden=true;stopCamera();update();}});
window.addEventListener('pagehide',()=>{captureToken++;stopCamera();});
window.addEventListener('beforeunload',e=>{if(state.photos.length&&!preparedFile){e.preventDefault();e.returnValue='';}});

initUI();
document.fonts.ready.then(refreshPreview);
