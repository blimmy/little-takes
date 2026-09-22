import { CAPTURE_LIMIT,LAYOUTS,LAYOUT_CATEGORIES,FRAMES,FILTERS,STICKERS,STICKER_CATEGORIES,COLORS } from './config.js?v=retro-3';
import { spriteSVG,landscapeSVG,svgData } from './ascii.js?v=retro-3';
import { ornamentSVG } from './ornaments.js?v=retro-3';
import { renderStrip,makeStory,canvasBlob,loadImage,geometry,clearImageCaches,layoutThumbnail,frameFor } from './renderer.js?v=retro-3';
import { letteringFont,fontsReady } from './typography.js?v=retro-3';
import { captureMoment,exportMotion,recordingType,videoExtension,pause } from './media.js?v=retro-3';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const freshState=()=>({layout:'strip4',frame:'paper',frameColors:{},filter:'original',captures:[],slots:Array(4).fill(null),items:[],strokes:[],caption:'',showDate:true,date:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()).replaceAll('/','.')});
let state=freshState(),step=1,layoutCategory='all',stickerCategory='all',tab='stickers',color=COLORS[0],activeSlot=0,selected=null;
let busy=false,videoBusy=false,cameraOpening=false,stream=null,cameraGeneration=0,sessionGeneration=0,facing='user',mirrored=true,sound=false,audio=null;
let captureController=null,videoController=null,renderToken=0,stillToken=0,previewRAF=0,lastStrip=null,history=[],future=[],drag=null;
let format='strip',previewMode='still',preparedImage=null,preparedVideo=null,imageURL=null,videoURL=null,toastTimer=null,captionTimer=null,hasSaved=false;
const uploadedStickerURLs=new Set();
const camera=$('#camera'),preview=$('#strip-preview');
const layout=()=>LAYOUTS.find(l=>l.id===state.layout);
const enoughPhotos=()=>state.captures.length>=layout().count;
const slotsComplete=()=>state.slots.length===layout().count&&state.slots.every(id=>state.captures.some(p=>p.id===id));
const canEnter=n=>n<=2||(n===3?enoughPhotos():slotsComplete());
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function notify(message,error=false){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,5000);}
function cameraError(message){$('#camera-error').textContent=message;$('#camera-error').hidden=false;}
function composition(){return {layout:state.layout,frame:state.frame,frameColors:{...state.frameColors},filter:state.filter,photos:state.slots.map(id=>state.captures.find(p=>p.id===id)||null),items:structuredClone(state.items),strokes:structuredClone(state.strokes),caption:state.caption,showDate:state.showDate,date:state.date};}
function updateClock(){$('#taskbar-clock').textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date());}
function init(){
  $$('[data-sprite]').forEach(el=>el.innerHTML=spriteSVG(el.dataset.sprite));
  $$('[data-ornament]').forEach((el,i)=>el.innerHTML=ornamentSVG(el.dataset.ornament,260,260,['#96b2bc','#c29996','#afbb98'][i%3]));
  $('#camera-landscape').src=svgData(landscapeSVG());
  $('#layout-categories').innerHTML=LAYOUT_CATEGORIES.map(([id,name])=>`<button data-layout-category="${id}" class="${id==='all'?'selected':''}" aria-pressed="${id==='all'}"><span>▱ ${name}</span><small>${id==='all'?LAYOUTS.length:LAYOUTS.filter(l=>l.category===id).length}</small></button>`).join('');
  $('#sticker-categories').innerHTML=STICKER_CATEGORIES.map(([id,name])=>`<button data-sticker-category="${id}" class="${id==='all'?'selected':''}" aria-pressed="${id==='all'}">${name}</button>`).join('');
  $('#frame-options').innerHTML=FRAMES.map(f=>`<button data-frame="${f.id}" class="frame-option" style="--frame-bg:${f.bg};--frame-ink:${f.ink};--frame-accent:${f.accent}" aria-label="${f.thai}"><span>${f.name}</span><small>${f.thai}</small></button>`).join('');
  $('#filter-options').innerHTML=FILTERS.map(f=>`<button data-filter="${f.id}" class="filter-option">${f.name}</button>`).join('');
  $('#color-options').innerHTML=COLORS.map(c=>`<button data-color="${c}" class="color-option ${c===color?'selected':''}" aria-label="สี ${c}" aria-pressed="${c===color}" style="--color:${c}"></button>`).join('');
  renderTemplates();renderStickers();syncPhotos();syncFrameControls();update();updateClock();setInterval(updateClock,30000);
  $('#motion-support').textContent=recordingType()?'Live เก็บเป็นคลิปสั้น 1.8 วินาที พร้อมภาพนิ่ง โดยไม่ใช้ไมโครโฟน':'เครื่องนี้บันทึกได้เฉพาะภาพนิ่ง ลองใช้ Chrome หรือ Safari รุ่นล่าสุดเพื่อเก็บ Live';
}
function renderTemplates(){
  const visible=LAYOUTS.filter(l=>layoutCategory==='all'||l.category===layoutCategory);
  $('#layout-options').innerHTML=visible.map(l=>{const i=LAYOUTS.indexOf(l),f=FRAMES[i%FRAMES.length];return `<button class="template-card ${state.layout===l.id?'selected':''}" data-layout="${l.id}" aria-pressed="${state.layout===l.id}" aria-label="${l.name} ${l.detail}" style="--card-bg:${f.bg}88"><span class="card-check">✓</span><span class="template-art">${layoutThumbnail(l,i)}</span><span class="template-name">${l.name}</span><small>${l.detail}</small></button>`;}).join('');
  $('#template-count').textContent=`${visible.length} items`;
  $('#collection-name').textContent=layoutCategory==='all'?'All frames':LAYOUT_CATEGORIES.find(c=>c[0]===layoutCategory)[1];
  const l=layout();$('#selected-template').innerHTML=layoutThumbnail(l,LAYOUTS.indexOf(l));$('#selected-template-name').textContent=l.name;$('#selected-template-detail').textContent=l.detail;
  $$('[data-layout-category]').forEach(b=>{b.classList.toggle('selected',b.dataset.layoutCategory===layoutCategory);b.setAttribute('aria-pressed',String(b.dataset.layoutCategory===layoutCategory));});
}
function renderStickers(){
  $('#sticker-options').innerHTML=STICKERS.filter(s=>stickerCategory==='all'||s.category===stickerCategory).map(s=>`<button class="sticker-option ${s.kind==='word'?'word':''}" data-sticker="${s.id}" aria-label="เพิ่ม${escape(s.name)}" title="${escape(s.name)}"><img src="${s.src}" alt="" loading="lazy" draggable="false"></button>`).join('');
  $$('[data-sticker-category]').forEach(b=>{b.classList.toggle('selected',b.dataset.stickerCategory===stickerCategory);b.setAttribute('aria-pressed',String(b.dataset.stickerCategory===stickerCategory));});
}
function syncFrameControls(){
  const f=frameFor(state);$('#frame-bg').value=f.bg;$('#frame-ink').value=f.ink;
  for(const key of ['frame','filter'])$$(`[data-${key}]`).forEach(b=>{const yes=b.dataset[key]===state[key];b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});
}
function update(){
  const n=state.captures.length,count=layout().count,locked=busy||videoBusy;
  $$('[data-step]').forEach(b=>{const target=+b.dataset.step;b.disabled=locked||!canEnter(target);b.classList.toggle('active',target===step);b.classList.toggle('done',target<step);if(target===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  $('#browser-back').disabled=step===1||locked;$('#browser-forward').disabled=step===5||locked||!canEnter(step+1);
  $('#choose-frame').disabled=locked;$('#photo-counter').textContent=`${n} / ${CAPTURE_LIMIT}`;
  $('#capture').disabled=busy||cameraOpening||n===CAPTURE_LIMIT;$('#burst-capture').disabled=busy||cameraOpening||n===CAPTURE_LIMIT;
  $('#burst-capture').textContent=n?`ถ่ายต่อเนื่องอีก ${CAPTURE_LIMIT-n} ภาพ`:'ถ่ายต่อเนื่องจนครบ 8 ภาพ';
  $('#enable-camera').disabled=cameraOpening||busy;$('#enable-camera').textContent=cameraOpening?'กำลังเปิดกล้อง…':'เปิดกล้องของฉัน ↗';
  $('#cancel-capture').hidden=!captureController;$('#upload').disabled=busy||n===CAPTURE_LIMIT;$('#demo').disabled=busy;
  $('#mirror').disabled=busy;$('#switch-camera').disabled=busy||cameraOpening;$('#timer').disabled=busy;
  $('#finish-capture').disabled=!enoughPhotos()||busy;$('#finish-capture').textContent=n?`เลือกจาก ${n} ภาพ →`:'เลือกรูปลงกรอบ →';
  $('#capture-hint').textContent=n===CAPTURE_LIMIT?'ครบ 8 ภาพแล้ว! เลือกเฉพาะรูปที่ชอบลงกรอบได้เลย':`ใช้ ${count} รูปในกรอบนี้ ที่เหลือถ่ายเผื่อเลือกได้เลย`;
  $('#roll-note').textContent=enoughPhotos()?`เลือกใช้ ${count} จาก ${n} ภาพ หรือถ่ายเพิ่มได้จนครบ 8`:`ถ่ายอย่างน้อย ${count} ภาพเพื่อใช้กรอบนี้`;
  $('#finish-selection').disabled=!slotsComplete()||locked;$('#finish-decoration').disabled=!slotsComplete()||locked;
  $('#selection-count').textContent=`${state.slots.filter(Boolean).length} / ${count} ช่อง`;
  $('#contact-count').textContent=`${n} PHOTOS`;
  $('#address-bar').value=`${location.host}${location.pathname}#${['frames','camera','favorites','decorate','save'][step-1]}`;
  $('#window-status').textContent=[`${LAYOUTS.length} frames ready. Make yourself at home.`,`${n}/8 takes · ${state.captures.filter(p=>p.motionSrc).length} live moments`,`${state.slots.filter(Boolean).length}/${count} favorites in your frame`,`${STICKERS.length} PNG stickers · your imagination is welcome`,'Your little memories are ready to take home.'][step-1];
  $('#download').disabled=!preparedImage;$('#download-video').disabled=videoBusy||!recordingType();$('#preview-live').disabled=videoBusy||!recordingType();
  $('#share').disabled=previewMode==='live'?!preparedVideo:!preparedImage;
  $$('[data-format]').forEach(b=>{b.disabled=videoBusy;b.classList.toggle('selected',b.dataset.format===format);b.setAttribute('aria-pressed',String(b.dataset.format===format));});
  $('#video-progress').hidden=!videoBusy;
}
function syncPhotos(){
  $('#photo-tray').innerHTML=Array.from({length:CAPTURE_LIMIT},(_,i)=>{const p=state.captures[i];if(!p)return `<div class="shot-thumb empty" aria-label="ภาพที่ ${i+1} ยังไม่ได้ถ่าย">${String(i+1).padStart(2,'0')}</div>`;return `<div class="shot-thumb"><img src="${p.src}" alt="ภาพที่ ${i+1}"><span class="shot-index">${String(i+1).padStart(2,'0')}</span><button class="shot-remove" data-remove-photo="${p.id}" aria-label="ลบภาพที่ ${i+1}" ${busy?'disabled':''}>×</button>${p.motionSrc?`<button class="shot-live" data-live-photo="${p.id}" aria-label="ดู Live ภาพที่ ${i+1}">▶ LIVE</button>`:'<span class="still-badge">STILL</span>'}</div>`;}).join('');
  $('#contact-sheet').innerHTML=state.captures.map((p,i)=>{const slot=state.slots.indexOf(p.id);return `<div class="contact-card"><button class="contact-pick ${slot>=0?'selected':''}" data-pick-photo="${p.id}" draggable="true" aria-pressed="${slot>=0}" aria-label="เลือกรูปที่ ${i+1}${slot>=0?` อยู่ในช่องที่ ${slot+1}`:''}"><img src="${p.src}" alt="ภาพที่ ${i+1}" draggable="false"><span>TAKE ${String(i+1).padStart(2,'0')}</span></button>${slot>=0?`<span class="used-badge">ช่อง ${slot+1}</span>`:''}${p.motionSrc?`<button class="shot-live" data-live-photo="${p.id}" aria-label="ดู Live ภาพที่ ${i+1}">▶ LIVE</button>`:''}</div>`;}).join('');
}
function slotOverlay(){
  $('#slot-hotspots').hidden=step!==3;if(step!==3)return;
  const l=layout();$('#slot-hotspots').innerHTML=geometry(l).map((r,i)=>{const n=state.captures.findIndex(p=>p.id===state.slots[i]);return `<button class="photo-slot ${i===activeSlot?'active':''} ${n>=0?'filled':''}" data-slot="${i}" aria-label="ช่องที่ ${i+1}${n>=0?` รูปที่ ${n+1}`:' ว่าง'}" aria-pressed="${i===activeSlot}" style="left:${r.x/l.width*100}%;top:${r.y/l.height*100}%;width:${r.w/l.width*100}%;height:${r.h/l.height*100}%;${l.shape==='circle'?'border-radius:50%;':''}"><span>${i+1}${n>=0?` · TAKE ${n+1}`:''}</span></button>`;}).join('');
  $('#slot-instruction').textContent=slotsComplete()?'ครบแล้ว! แตะช่องเพื่อเปลี่ยนรูปหรือสลับลำดับได้':`เลือกภาพให้ช่องที่ ${activeSlot+1}`;
}
function invalidateFiles(){
  stillToken++;preparedImage=null;preparedVideo=null;hasSaved=false;
  if(imageURL)URL.revokeObjectURL(imageURL);imageURL=null;
  const v=$('#save-video');v.pause();v.removeAttribute('src');v.load();if(videoURL)URL.revokeObjectURL(videoURL);videoURL=null;
  $('#save-image').removeAttribute('src');$('#save-video').hidden=true;$('#save-image').hidden=false;
}
function changed(){invalidateFiles();schedulePreview();update();}
function schedulePreview(){if(previewRAF)return;previewRAF=requestAnimationFrame(()=>{previewRAF=0;refreshPreview();});}
async function refreshPreview(){
  if(step<3)return;
  const token=++renderToken,snapshot=composition();
  try{
    const c=await renderStrip(snapshot);if(token!==renderToken)return;
    lastStrip=c;preview.width=c.width;preview.height=c.height;preview.getContext('2d').drawImage(c,0,0);
    $('#canvas-wrap').style.setProperty('--preview-width',`${Math.min(step===4?430:350,(step===4?680:590)*c.width/c.height)}px`);
    $('#canvas-wrap').style.setProperty('--canvas-ratio',c.width/c.height);
    slotOverlay();updateSelection();if(step===5)prepareStill(c,snapshot);
  }catch(e){if(token===renderToken)notify(e.message||'แสดงภาพไม่สำเร็จ ลองเลือกรูปอีกครั้ง',true);}
}
function goToStep(n){
  if(n<1||n>5||busy||videoBusy)return;
  if(!canEnter(n)){notify(n===3?`ถ่ายหรือเพิ่มรูปอย่างน้อย ${layout().count} ภาพก่อนนะ`:'เลือกรูปใส่ช่องในกรอบให้ครบก่อนนะ');return;}
  if(captionTimer){clearTimeout(captionTimer);captionTimer=null;}
  step=n;selected=null;renderToken++;
  for(let i=1;i<=5;i++)$(`#stage-${i}`).hidden=i!==n;
  if(n!==2)stopCamera();
  if(n===3){$('#selection-mount').append($('#canvas-wrap'));if(activeSlot>=layout().count)activeSlot=0;syncPhotos();}
  if(n===4)$('#editor-mount').append($('#canvas-wrap'));
  $('#slot-hotspots').hidden=n!==3;
  if(n!==5){$('#save-video').pause();}else{invalidateFiles();setPreview('still');$('#video-info').textContent=videoDescription();}
  if(n>=3)refreshPreview();update();
  $('#studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
}
function selectLayout(id){
  if(busy||videoBusy)return;const l=LAYOUTS.find(l=>l.id===id);if(!l)return;
  state.layout=id;state.slots=Array.from({length:l.count},(_,i)=>state.slots[i]||null);activeSlot=Math.min(activeSlot,l.count-1);invalidateFiles();renderTemplates();update();
}
function assignPhoto(id){
  if(step!==3||!state.captures.some(p=>p.id===id))return;
  const old=state.slots.indexOf(id),replacement=state.slots[activeSlot];
  if(old>=0&&old!==activeSlot)state.slots[old]=replacement;
  state.slots[activeSlot]=id;
  const next=state.slots.findIndex((s,i)=>!s&&i>activeSlot),first=state.slots.indexOf(null);if(next>=0)activeSlot=next;else if(first>=0)activeSlot=first;
  syncPhotos();changed();
}
function removePhoto(id){
  if(busy)return;const p=state.captures.find(p=>p.id===id);if(p?.motionSrc)URL.revokeObjectURL(p.motionSrc);
  state.captures=state.captures.filter(p=>p.id!==id);state.slots=state.slots.map(s=>s===id?null:s);clearImageCaches();syncPhotos();changed();
}
async function startCamera(){
  if(cameraOpening||busy||step!==2)return false;stopCamera();const generation=cameraGeneration;
  cameraOpening=true;$('#camera-error').hidden=true;update();
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('NO_API');
    const requested=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:960}},audio:false});
    if(generation!==cameraGeneration||step!==2){requested.getTracks().forEach(t=>t.stop());return false;}
    stream=requested;camera.srcObject=stream;await camera.play();
    if(generation!==cameraGeneration){requested.getTracks().forEach(t=>t.stop());return false;}
    camera.hidden=false;camera.classList.toggle('mirrored',mirrored);$('#camera-welcome').hidden=true;$('#camera-landscape').hidden=true;$('#camera-status').textContent='LIVE · Hello, lovely!';$('.live-dot').classList.add('on');
    requested.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(stream===requested){captureController?.abort();stopCamera();cameraError('กล้องหยุดทำงาน ลองเปิดกล้องใหม่ หรือเลือกรูปจากเครื่อง');update();}}));
    return true;
  }catch(e){
    if(generation!==cameraGeneration)return false;stopCamera();
    cameraError(e.name==='NotAllowedError'?'ยังไม่ได้อนุญาตกล้อง เปิดสิทธิ์จากไอคอนข้างที่อยู่เว็บ หรือเลือกรูปจากเครื่องได้เลย':e.name==='NotFoundError'?'ไม่พบกล้อง เลือกรูปจากเครื่องมาทำกรอบได้เลย':e.name==='NotReadableError'?'กล้องถูกใช้งานอยู่ ลองปิดแอปที่ใช้กล้องก่อน':e.message==='NO_API'?'เปิดกล้องไม่ได้ในเบราว์เซอร์นี้ ลองใช้ Chrome / Safari หรือเลือกรูปจากเครื่อง':'เปิดกล้องไม่สำเร็จ ลองอีกครั้งหรือเลือกรูปจากเครื่อง');return false;
  }finally{if(generation===cameraGeneration)cameraOpening=false;update();}
}
function stopCamera(){
  cameraGeneration++;cameraOpening=false;const old=stream;stream=null;old?.getTracks().forEach(t=>t.stop());camera.srcObject=null;camera.hidden=true;$('#camera-welcome').hidden=false;$('#camera-landscape').hidden=false;$('#camera-status').textContent='Camera is resting';$('.live-dot').classList.remove('on');
}
function beep(frequency=660,duration=.08){
  if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}
}
function flash(){const el=$('#camera-flash');el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');beep(1000,.1);}
async function capture(all=false){
  if(busy||state.captures.length>=CAPTURE_LIMIT)return;if(!stream){await startCamera();return;}
  const controller=new AbortController(),session=sessionGeneration;captureController=controller;busy=true;update();syncPhotos();
  try{
    const target=all?CAPTURE_LIMIT:state.captures.length+1;
    while(state.captures.length<target){
      for(let n=Number($('#timer').value);n>0;n--){$('#countdown').hidden=false;$('#countdown').textContent=n;beep();await pause(1000,controller.signal);}
      $('#countdown').hidden=true;$('#live-recording').hidden=!recordingType();
      const photo=await captureMoment(camera,{mirror:mirrored,signal:controller.signal,onSnap:flash});
      if(controller.signal.aborted||session!==sessionGeneration){if(photo.motionSrc)URL.revokeObjectURL(photo.motionSrc);return;}
      state.captures.push({id:crypto.randomUUID(),...photo});invalidateFiles();$('#live-recording').hidden=true;syncPhotos();update();
      if(photo.motionError)notify('ภาพนิ่งเก็บแล้ว แต่คลิป Live ภาพนี้บันทึกไม่ได้ ลองถ่ายใหม่ได้',true);
      if(state.captures.length<target)await pause(250,controller.signal);
    }
  }catch(e){if(e.name!=='AbortError')cameraError(e.message||'ถ่ายภาพไม่สำเร็จ ลองอีกครั้ง');}
  finally{if(captureController===controller){captureController=null;busy=false;$('#countdown').hidden=true;$('#live-recording').hidden=true;syncPhotos();update();}}
}
async function uploadPhotos(files){
  if(!files.length||busy)return;busy=true;const session=sessionGeneration;update();let failed=0;
  try{
    for(const file of files){
      if(state.captures.length>=CAPTURE_LIMIT)break;
      if(file.size>30*1024*1024||(!/^image\//.test(file.type)&&!/\.(heic|heif|jpe?g|png|webp|avif)$/i.test(file.name))){failed++;continue;}
      const url=URL.createObjectURL(file);
      try{const img=await loadImage(url);if(session!==sessionGeneration)return;const ratio=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);const ctx=c.getContext('2d');ctx.fillStyle='#fffdf7';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);state.captures.push({id:crypto.randomUUID(),src:c.toDataURL('image/jpeg',.94),motionSrc:null,duration:0});}
      catch{failed++;}finally{URL.revokeObjectURL(url);}
    }
    invalidateFiles();if(failed)notify('มีรูปที่เปิดไม่ได้หรือใหญ่เกิน 30 MB ลองใช้ JPG, PNG หรือ WebP',true);
  }finally{if(session===sessionGeneration){busy=false;$('#file-input').value='';syncPhotos();update();}}
}
async function useDemo(){
  if(busy||videoBusy)return;busy=true;const session=sessionGeneration;update();
  try{
    await fontsReady;if(session!==sessionGeneration)return;
    while(state.captures.length<CAPTURE_LIMIT){const i=state.captures.length,img=await loadImage(svgData(landscapeSVG(i))),c=document.createElement('canvas');c.width=960;c.height=720;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,960,720);ctx.font='52px "Great Vibes"';ctx.fillStyle=['#92ab95','#c198a2','#91abbd','#bdb085'][i%4];ctx.textAlign='center';ctx.fillText(['A little joy','Hello, sunshine','Sweet memories','Just us','With love','Lovely day','Stay playful','Smile again'][i],480,360);if(session!==sessionGeneration)return;state.captures.push({id:crypto.randomUUID(),src:c.toDataURL('image/png'),motionSrc:null,duration:0});}
    invalidateFiles();
  }catch(e){notify(e.message||'เปิดภาพตัวอย่างไม่สำเร็จ',true);}
  finally{if(session===sessionGeneration){busy=false;syncPhotos();update();if(enoughPhotos())goToStep(3);}}
}
function snapshot(){return JSON.stringify({frame:state.frame,frameColors:state.frameColors,filter:state.filter,items:state.items,strokes:state.strokes,caption:state.caption,showDate:state.showDate});}
function remember(){history.push(snapshot());if(history.length>40)history.shift();future=[];updateUndo();}
function updateUndo(){$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;}
function restore(value){Object.assign(state,JSON.parse(value));selected=null;$('#caption').value=state.caption;$('#show-date').checked=state.showDate;syncFrameControls();updateUndo();changed();}
function setTab(value){tab=value;selected=null;for(const t of ['colors','stickers','text','draw'])$(`#tab-${t}`).hidden=t!==value;$$('[data-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.tab===value));$('#color-control').hidden=!['text','draw'].includes(value);$('.editor-board').classList.toggle('drawing',value==='draw');$('#edit-instruction').textContent=value==='draw'?'ลากนิ้วหรือเมาส์บนภาพเพื่อวาด':value==='colors'?'เลือกสีกรอบหรือฟิลเตอร์ ภาพตัวอย่างเปลี่ยนให้ทันที':'ลากของตกแต่งไปวางบนภาพได้เลย';updateSelection();}
function addSticker(s){
  if(state.items.length>=60){notify('มีของตกแต่งครบ 60 ชิ้นแล้ว ลบชิ้นเก่าก่อนได้นะ');return;}
  remember();const id=crypto.randomUUID();state.items.push({id,type:'sticker',name:s.name,src:s.src,x:.47+(state.items.length%3)*.05,y:.33+(state.items.length%4)*.09,size:s.kind==='word'?.44:.25,rotation:0});selected=id;changed();
}
async function uploadSticker(file){
  if(!file)return;if(file.size>10*1024*1024){notify('PNG ใหญ่เกิน 10 MB ลองลดขนาดก่อนนะ',true);return;}
  const url=URL.createObjectURL(file),session=sessionGeneration;
  try{const img=await loadImage(url),c=document.createElement('canvas');c.width=512;c.height=512;const scale=Math.min(480/img.width,480/img.height),w=img.width*scale,h=img.height*scale;c.getContext('2d').drawImage(img,(512-w)/2,(512-h)/2,w,h);const blob=await canvasBlob(c);if(session!==sessionGeneration)return;const src=URL.createObjectURL(blob);uploadedStickerURLs.add(src);addSticker({name:'PNG ของฉัน',src,kind:'sprite'});}
  catch{notify('อ่าน PNG ไม่สำเร็จ ลองเลือกรูปใหม่',true);}finally{URL.revokeObjectURL(url);$('#sticker-input').value='';}
}
function addText(){const text=$('#text-input').value.trim();if(!text){$('#text-input').focus();return;}if(state.items.length>=60){notify('ลบของตกแต่งชิ้นเก่าก่อนเพิ่มข้อความนะ');return;}remember();const id=crypto.randomUUID();state.items.push({id,type:'text',text,font:$('#text-font').value,color,x:.5,y:.5,size:Number($('#text-size').value)/100,rotation:0});selected=id;$('#text-input').value='';changed();}
function itemBounds(item){const ratio=preview.width/preview.height;let w=item.size,h=item.size*ratio;if(item.type==='text'){const ctx=preview.getContext('2d');ctx.font=letteringFont(item.size*preview.width,item.font);w=Math.min(.9,ctx.measureText(item.text).width/preview.width);h=item.size*ratio*1.5;}return{x:item.x-w/2,y:item.y-h/2,w,h};}
function updateSelection(){const item=state.items.find(i=>i.id===selected),el=$('#object-selection');el.hidden=!item||step!==4||tab==='draw';$('#selection-tools').hidden=!item||tab==='draw';if(!item)return;const b=itemBounds(item);Object.assign(el.style,{left:`${b.x*100}%`,top:`${b.y*100}%`,width:`${b.w*100}%`,height:`${b.h*100}%`,transform:`rotate(${item.rotation||0}deg)`});}
function pointer(e){const r=preview.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
preview.addEventListener('pointerdown',e=>{
  if(step!==4||e.button>0)return;e.preventDefault();const p=pointer(e);preview.setPointerCapture(e.pointerId);
  if(tab==='draw'){if(state.strokes.length>=150){notify('มีลายเส้นครบ 150 เส้นแล้ว ล้างลายเส้นก่อนวาดต่อนะ');return;}remember();selected=null;const stroke={points:[p],color,width:Number($('#pen-size').value)/600};state.strokes.push(stroke);drag={type:'draw',stroke};changed();}
  else{const item=[...state.items].reverse().find(i=>{const b=itemBounds(i),a=-(i.rotation||0)*Math.PI/180,dx=(p.x-i.x)*preview.width,dy=(p.y-i.y)*preview.height;return Math.abs((dx*Math.cos(a)-dy*Math.sin(a))/preview.width)<b.w/2+.025&&Math.abs((dx*Math.sin(a)+dy*Math.cos(a))/preview.height)<b.h/2+.015;});selected=item?.id||null;if(item){remember();drag={type:'move',item,dx:p.x-item.x,dy:p.y-item.y};preview.style.cursor='grabbing';}updateSelection();}
});
preview.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();const p=pointer(e);if(drag.type==='draw'){if(drag.stroke.points.length<2500)drag.stroke.points.push(p);}else{drag.item.x=Math.max(.01,Math.min(.99,p.x-drag.dx));drag.item.y=Math.max(.01,Math.min(.99,p.y-drag.dy));}changed();});
const endDrag=()=>{drag=null;preview.style.cursor='';};for(const type of ['pointerup','pointercancel','lostpointercapture'])preview.addEventListener(type,endDrag);
async function prepareStill(strip,snapshot){
  const token=++stillToken;preparedImage=null;$('#download').disabled=true;$('#file-info').textContent='กำลังเตรียมภาพ…';
  try{const c=format==='story'?makeStory(strip,snapshot):strip,blob=await canvasBlob(c);if(token!==stillToken||step!==5)return;preparedImage=new File([blob],`little-takes-${format}-${Date.now()}.png`,{type:'image/png'});if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(blob);$('#save-image').src=imageURL;$('#file-info').textContent=`${c.width} × ${c.height} px · PNG · ${(blob.size/1024/1024).toFixed(1)} MB`;$('#save-summary').textContent=`${layout().count} รูปที่เลือกจาก ${state.captures.length} ภาพ · ${snapshot.photos.filter(p=>p?.motionSrc).length} Live`;update();}
  catch(e){if(token===stillToken)notify(e.message||'เตรียมไฟล์ไม่สำเร็จ ลองกลับไปหน้าตกแต่งแล้วเปิดใหม่',true);}
}
function videoDescription(){const type=recordingType();return type?`วิดีโอ 6 วินาที · ${videoExtension(type).toUpperCase()} · รูปนิ่งจะขยับซูมเบา ๆ`:'เบราว์เซอร์นี้ยังบันทึกวิดีโอไม่ได้ ลอง Chrome / Safari รุ่นล่าสุด';}
function setPreview(mode){previewMode=mode;$('#preview-still').classList.toggle('selected',mode==='still');$('#preview-live').classList.toggle('selected',mode==='live');$('#save-image').hidden=mode==='live'&&!!preparedVideo;$('#save-video').hidden=mode!=='live'||!preparedVideo;if(mode==='live'&&preparedVideo)$('#save-video').play().catch(()=>{});else $('#save-video').pause();update();}
async function buildVideo(downloadAfter=false){
  if(videoBusy||!recordingType())return;
  if(preparedVideo){setPreview('live');if(downloadAfter)downloadFile(preparedVideo,videoURL);return;}
  const controller=new AbortController(),session=sessionGeneration;videoController=controller;videoBusy=true;previewMode='live';$('#video-info').textContent='กำลังทำวิดีโอ… เปิดหน้านี้ไว้สักครู่นะ';$('#export-progress').value=0;setPreview('live');update();
  try{
    const blob=await exportMotion(composition(),{format,signal:controller.signal,onProgress:p=>{$('#export-progress').value=p;$('#video-info').textContent=`กำลังทำวิดีโอ ${Math.round(p*100)}%`;}});
    if(controller.signal.aborted||session!==sessionGeneration)return;const mime=blob.type.split(';')[0];preparedVideo=new File([blob],`little-takes-${format}-${Date.now()}.${videoExtension(mime)}`,{type:mime});videoURL=URL.createObjectURL(blob);$('#save-video').src=videoURL;$('#video-info').textContent=`6 วินาที · ${videoExtension(mime).toUpperCase()} · ${(blob.size/1024/1024).toFixed(1)} MB`;setPreview(previewMode);if(downloadAfter)downloadFile(preparedVideo,videoURL);
  }catch(e){if(session===sessionGeneration){$('#video-info').textContent=e.name==='AbortError'?'หยุดแล้ว กดสร้างวิดีโออีกครั้งได้เลย':e.message;setPreview('still');if(e.name!=='AbortError')notify(e.message||'บันทึกวิดีโอไม่สำเร็จ ลองอีกครั้ง',true);}}
  finally{if(videoController===controller){videoController=null;videoBusy=false;update();}}
}
function downloadFile(file,url){if(!file||!url)return;const a=document.createElement('a');a.href=url;a.download=file.name;a.style.display='none';document.body.append(a);a.click();a.remove();hasSaved=true;notify('ส่งไฟล์ให้เบราว์เซอร์ดาวน์โหลดแล้ว ♡');}
async function share(){const file=previewMode==='live'?preparedVideo:preparedImage;if(!file)return;if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file]});hasSaved=true;}catch(e){if(e.name!=='AbortError')notify('แชร์ไม่ได้ในตอนนี้ ดาวน์โหลดแล้วแชร์จากแกลเลอรีได้เลย',true);}}else showDialog('<h2>ส่งความทรงจำให้คนโปรด</h2><p>ดาวน์โหลดภาพหรือวิดีโอ แล้วเลือกจากแกลเลอรีใน Instagram, Facebook หรือ LINE ได้เลย เลือก Story size หากจะลงสตอรี่</p><p>บนมือถือที่รองรับ ปุ่มแชร์จะเปิดเมนูของเครื่อง แอปและตัวเลือก Story ขึ้นอยู่กับเครื่องและแอปที่ติดตั้ง</p>');}
function showDialog(html){$('#dialog-content').innerHTML=html;$('#info-dialog').showModal();}
function help(){showDialog('<h2>ยินดีต้อนรับสู่ Little Takes</h2><ol><li>เลือกโครงกรอบจาก 20 แบบ</li><li>ถ่ายทีละภาพหรือถ่ายต่อเนื่องได้สูงสุด 8 ภาพ แต่ละภาพมีภาพนิ่งและคลิป Live 1.8 วินาทีเมื่อเบราว์เซอร์รองรับ</li><li>เลือกเฉพาะรูปที่ชอบใส่ช่องในกรอบ ไม่จำเป็นต้องใช้ทั้ง 8 รูป</li><li>เลือกสี แปะ PNG เขียนข้อความ หรือวาดรูป</li><li>ดูพรีวิว แล้วบันทึก PNG หรือวิดีโอ 6 วินาทีได้เลย</li></ol><p>เลือกจากเครื่องหรือใช้ภาพตัวอย่างได้ด้วย รูปนิ่งจะมีการซูมเบา ๆ ในวิดีโอ ไฟล์วิดีโอเป็น MP4 หรือ WebM ตามที่เบราว์เซอร์รองรับ</p>');}
function privacy(){showDialog('<h2>รูปและคลิปเป็นของคุณ</h2><p>Little Takes ประมวลผลทุกอย่างบนอุปกรณ์ ไม่มีการอัปโหลดภาพหรือคลิป และไม่ขอใช้ไมโครโฟน</p><p>กล้องจะเปิดเมื่อคุณกดอนุญาต และปิดเมื่อออกจากหน้าถ่ายรูปหรือสลับแท็บ รูป คลิป และของตกแต่งเก็บในหน่วยความจำชั่วคราว รีเฟรชหรือปิดแท็บแล้วจะหายไป กรุณาดาวน์โหลดสิ่งที่อยากเก็บก่อน</p><p>ไม่มีระบบติดตามหรือคุกกี้วิเคราะห์ ฟอนต์และ PNG มาพร้อมเว็บ ผู้ให้บริการ GitHub Pages อาจมีบันทึกการเข้าถึงตามนโยบายของผู้ให้บริการ</p>');}
function showLive(id){const photo=state.captures.find(p=>p.id===id);if(!photo?.motionSrc)return;showDialog(`<h2>Take ${state.captures.indexOf(photo)+1} · Live</h2><p>คลิปที่เก็บไว้พร้อมภาพนิ่งของคุณ</p>`);const v=document.createElement('video');v.controls=true;v.loop=true;v.muted=true;v.playsInline=true;v.src=photo.motionSrc;$('#dialog-content').append(v);v.play().catch(()=>{});}
function askReset(){$('#reset-dialog').showModal();}
function reset(){
  sessionGeneration++;captureController?.abort();videoController?.abort();captureController=null;videoController=null;busy=false;videoBusy=false;stopCamera();renderToken++;clearTimeout(captionTimer);
  state.captures.forEach(p=>{if(p.motionSrc)URL.revokeObjectURL(p.motionSrc);});uploadedStickerURLs.forEach(u=>URL.revokeObjectURL(u));uploadedStickerURLs.clear();invalidateFiles();clearImageCaches();state=freshState();selected=null;activeSlot=0;history=[];future=[];format='strip';previewMode='still';lastStrip=null;drag=null;$('#caption').value='';$('#text-input').value='';$('#show-date').checked=true;$('#countdown').hidden=true;$('#live-recording').hidden=true;$('#camera-error').hidden=true;layoutCategory='all';stickerCategory='all';renderTemplates();renderStickers();syncFrameControls();syncPhotos();setTab('stickers');updateUndo();goToStep(1);notify('พร้อมเก็บความทรงจำใหม่แล้ว ♡');
}
function restoreWindow(){$('#window-content').hidden=false;$('#studio').scrollIntoView({behavior:'smooth'});}

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.layoutCategory){layoutCategory=b.dataset.layoutCategory;renderTemplates();}
  if(b.dataset.layout)selectLayout(b.dataset.layout);
  if(b.dataset.step)goToStep(+b.dataset.step);
  if(b.dataset.slot!==undefined){activeSlot=+b.dataset.slot;slotOverlay();}
  if(b.dataset.pickPhoto)assignPhoto(b.dataset.pickPhoto);
  if(b.dataset.removePhoto)removePhoto(b.dataset.removePhoto);
  if(b.dataset.livePhoto)showLive(b.dataset.livePhoto);
  if(b.dataset.tab)setTab(b.dataset.tab);
  if(b.dataset.stickerCategory){stickerCategory=b.dataset.stickerCategory;renderStickers();}
  if(b.dataset.sticker)addSticker(STICKERS.find(s=>s.id===b.dataset.sticker));
  if(b.dataset.frame){remember();state.frame=b.dataset.frame;state.frameColors={};syncFrameControls();changed();}
  if(b.dataset.filter){remember();state.filter=b.dataset.filter;syncFrameControls();changed();}
  if(b.dataset.color){color=b.dataset.color;$$('[data-color]').forEach(el=>{el.classList.toggle('selected',el.dataset.color===color);el.setAttribute('aria-pressed',String(el.dataset.color===color));});}
  if(b.dataset.edit){const item=state.items.find(i=>i.id===selected);if(!item)return;remember();if(b.dataset.edit==='delete'){state.items=state.items.filter(i=>i.id!==selected);selected=null;}if(b.dataset.edit==='larger')item.size=Math.min(item.type==='text'?.18:.85,item.size*1.15);if(b.dataset.edit==='smaller')item.size=Math.max(.025,item.size/1.15);if(b.dataset.edit==='rotate')item.rotation=(item.rotation+15)%360;changed();}
  if(b.dataset.format&&b.dataset.format!==format){format=b.dataset.format;invalidateFiles();setPreview('still');$('#video-info').textContent=videoDescription();if(lastStrip)prepareStill(lastStrip,composition());update();}
  if(b.dataset.action==='help')help();if(b.dataset.action==='privacy')privacy();if(b.dataset.action==='home')goToStep(1);if(b.dataset.action==='edit')goToStep(4);if(b.dataset.action==='view')$('#studio').classList.toggle('is-maximized');if(b.dataset.action==='reset')askReset();if(b.dataset.action==='keep')$('#reset-dialog').close();if(b.dataset.action==='demo')useDemo();
});
document.addEventListener('dragstart',e=>{const b=e.target.closest('[data-pick-photo]');if(b)e.dataTransfer.setData('text/plain',b.dataset.pickPhoto);});
$('#slot-hotspots').addEventListener('dragover',e=>e.preventDefault());$('#slot-hotspots').addEventListener('drop',e=>{e.preventDefault();const b=e.target.closest('[data-slot]');if(b){activeSlot=+b.dataset.slot;assignPhoto(e.dataTransfer.getData('text/plain'));}});
$('#choose-frame').addEventListener('click',()=>goToStep(2));$('#finish-capture').addEventListener('click',()=>goToStep(3));$('#finish-selection').addEventListener('click',()=>goToStep(4));$('#finish-decoration').addEventListener('click',()=>goToStep(5));
$('#browser-back').addEventListener('click',()=>goToStep(step-1));$('#browser-forward').addEventListener('click',()=>goToStep(step+1));
$('#auto-fill').addEventListener('click',()=>{state.slots=state.captures.slice(0,layout().count).map(p=>p.id);activeSlot=0;syncPhotos();changed();});$('#clear-slots').addEventListener('click',()=>{state.slots=Array(layout().count).fill(null);activeSlot=0;syncPhotos();changed();});
$('#enable-camera').addEventListener('click',startCamera);$('#capture').addEventListener('click',()=>capture(false));$('#burst-capture').addEventListener('click',()=>capture(true));$('#cancel-capture').addEventListener('click',()=>{captureController?.abort();notify('หยุดถ่ายแล้ว ภาพที่เก็บไว้ยังอยู่นะ');});
$('#mirror').addEventListener('click',()=>{mirrored=!mirrored;camera.classList.toggle('mirrored',mirrored);$('#mirror').classList.toggle('active',mirrored);$('#mirror').setAttribute('aria-pressed',String(mirrored));});
$('#switch-camera').addEventListener('click',async()=>{facing=facing==='user'?'environment':'user';mirrored=facing==='user';$('#mirror').classList.toggle('active',mirrored);$('#mirror').setAttribute('aria-pressed',String(mirrored));await startCamera();});
$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent=sound?'♫ เสียงเปิด':'♫ เสียงปิด';beep();});
$('#upload').addEventListener('click',()=>$('#file-input').click());$('#file-input').addEventListener('change',e=>uploadPhotos([...e.target.files]));$('#demo').addEventListener('click',useDemo);
$('#upload-sticker').addEventListener('click',()=>$('#sticker-input').click());$('#sticker-input').addEventListener('change',e=>uploadSticker(e.target.files[0]));
$('#add-text').addEventListener('click',addText);$('#text-input').addEventListener('keydown',e=>{if(e.key==='Enter')addText();});$('#text-font').addEventListener('change',()=>$('.lettering-sample').style.font=letteringFont(27,$('#text-font').value));
$('#clear-drawing').addEventListener('click',()=>{if(!state.strokes.length)return;remember();state.strokes=[];changed();});
$('#undo').addEventListener('click',()=>{if(history.length){future.push(snapshot());restore(history.pop());}});$('#redo').addEventListener('click',()=>{if(future.length){history.push(snapshot());restore(future.pop());}});
$('#caption').addEventListener('focus',remember);$('#caption').addEventListener('input',e=>{state.caption=e.target.value;invalidateFiles();clearTimeout(captionTimer);captionTimer=setTimeout(refreshPreview,120);});$('#show-date').addEventListener('change',e=>{remember();state.showDate=e.target.checked;changed();});
for(const [id,key] of [['#frame-bg','bg'],['#frame-ink','ink']]){$(id).addEventListener('change',e=>{remember();state.frameColors[key]=e.target.value;if(key==='ink')state.frameColors.accent=e.target.value;changed();});}
$('#download').addEventListener('click',()=>downloadFile(preparedImage,imageURL));$('#download-video').addEventListener('click',()=>buildVideo(true));$('#preview-still').addEventListener('click',()=>setPreview('still'));$('#preview-live').addEventListener('click',()=>buildVideo(false));$('#cancel-export').addEventListener('click',()=>videoController?.abort());$('#share').addEventListener('click',share);
$('#minimize-window').addEventListener('click',()=>{if(busy||videoBusy)return;stopCamera();$('#window-content').hidden=true;});$('#maximize-window').addEventListener('click',()=>$('#studio').classList.toggle('is-maximized'));$('#restore-window').addEventListener('click',restoreWindow);$('#start-button').addEventListener('click',restoreWindow);$('#close-window').addEventListener('click',askReset);
$('.dialog-close').addEventListener('click',()=>$('#info-dialog').close());$('#info-dialog').addEventListener('close',()=>{$$('#dialog-content video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});});$('#keep-session').addEventListener('click',()=>$('#reset-dialog').close());$('#confirm-reset').addEventListener('click',()=>{$('#reset-dialog').close();reset();});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
document.addEventListener('keydown',e=>{if(step!==4||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||$('dialog[open]'))return;if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();(e.shiftKey?$('#redo'):$('#undo')).click();}if((e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();$('[data-edit="delete"]').click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){captureController?.abort();videoController?.abort();if(stream||cameraOpening)stopCamera();update();}});
window.addEventListener('pagehide',()=>{captureController?.abort();videoController?.abort();stopCamera();});window.addEventListener('beforeunload',e=>{if(state.captures.length&&!hasSaved){e.preventDefault();e.returnValue='';}});
init();document.fonts.ready.then(()=>{if(step>=3)refreshPreview();});
