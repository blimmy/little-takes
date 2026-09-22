import { prepareComposition, paintStory } from './renderer.js?v=retro-3';

const TYPES=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm'];
export const recordingType=()=>typeof MediaRecorder==='undefined'||!HTMLCanvasElement.prototype.captureStream?'':TYPES.find(t=>MediaRecorder.isTypeSupported(t))||'';
export const videoExtension=type=>type.includes('mp4')?'mp4':'webm';
const abortError=()=>new DOMException('ยกเลิกแล้ว','AbortError');
function check(signal){if(signal?.aborted)throw abortError();}
export function pause(ms,signal){
  return new Promise((resolve,reject)=>{
    check(signal);const cancel=()=>{clearTimeout(timer);reject(abortError());};
    const timer=setTimeout(()=>{signal?.removeEventListener('abort',cancel);resolve();},ms);signal?.addEventListener('abort',cancel,{once:true});
  });
}
export function recordCanvas(c,{duration=6000,draw,signal,onProgress=()=>{},fps=20,bitrate=3500000}={}){
  return new Promise((resolve,reject)=>{
    check(signal);const type=recordingType();if(!type){reject(new Error('เบราว์เซอร์นี้ยังบันทึกวิดีโอไม่ได้ ลองใช้ Chrome หรือ Safari รุ่นล่าสุด'));return;}
    let source,recorder,raf=0,watchdog=0,settled=false,started=0,last=-Infinity;const chunks=[];
    const cleanup=()=>{cancelAnimationFrame(raf);clearTimeout(watchdog);signal?.removeEventListener('abort',cancel);source?.getTracks().forEach(t=>t.stop());};
    const fail=error=>{if(settled)return;settled=true;try{if(recorder?.state!=='inactive')recorder?.stop();}catch{}cleanup();reject(error);};
    const cancel=()=>fail(abortError());
    const finish=()=>{if(recorder?.state==='recording')recorder.stop();};
    try{
      draw?.(0);source=c.captureStream(fps);
      recorder=new MediaRecorder(source,{mimeType:type,videoBitsPerSecond:bitrate});
      recorder.onstart=()=>{started=performance.now();};
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onerror=e=>fail(e.error||new Error('บันทึกวิดีโอไม่สำเร็จ ลองอีกครั้ง'));
      recorder.onstop=()=>{
        if(settled)return;settled=true;cleanup();const blob=new Blob(chunks,{type:recorder.mimeType||type});
        if(!blob.size)reject(new Error('ยังไม่ได้รับวิดีโอ ลองบันทึกอีกครั้ง'));else resolve(blob);
      };
      signal?.addEventListener('abort',cancel,{once:true});recorder.start(200);
      const tick=now=>{
        if(settled)return;const elapsed=started?Math.min(duration,now-started):0;
        try{if(now-last>=1000/fps){draw?.(elapsed);onProgress(elapsed/duration);last=now;}}
        catch(error){fail(error);return;}
        if(elapsed>=duration)finish();else raf=requestAnimationFrame(tick);
      };
      raf=requestAnimationFrame(tick);watchdog=setTimeout(()=>fail(new Error('การบันทึกหยุดไป เปิดหน้านี้ไว้แล้วลองอีกครั้ง')),duration+10000);
    }catch(error){fail(error);}
  });
}
function cameraCanvas(video,width,mirror,even=false){
  const c=document.createElement('canvas'),scale=Math.min(1,width/video.videoWidth),round=n=>even?Math.max(2,Math.round(n/2)*2):Math.round(n);c.width=round(video.videoWidth*scale);c.height=round(video.videoHeight*scale);
  const ctx=c.getContext('2d');if(mirror){ctx.translate(c.width,0);ctx.scale(-1,1);}ctx.drawImage(video,0,0,c.width,c.height);return c;
}
export async function captureMoment(video,{mirror=true,signal,onSnap=()=>{}}={}){
  check(signal);if(video.readyState<2||!video.videoWidth)throw new Error('กล้องยังไม่พร้อม ลองถ่ายอีกครั้ง');
  let still=null;const snapshot=()=>{still=cameraCanvas(video,1800,mirror).toDataURL('image/jpeg',.94);onSnap();};
  if(!recordingType()){snapshot();return {src:still,motionSrc:null,duration:0};}
  const c=cameraCanvas(video,720,mirror,true),ctx=c.getContext('2d');
  try{
    const blob=await recordCanvas(c,{duration:1800,fps:20,bitrate:1800000,signal,draw(elapsed){
      ctx.save();if(mirror){ctx.translate(c.width,0);ctx.scale(-1,1);}ctx.drawImage(video,0,0,c.width,c.height);ctx.restore();
      if(elapsed>=750&&!still)snapshot();
    }});
    check(signal);if(!still)snapshot();return {src:still,motionSrc:URL.createObjectURL(blob),duration:1.8,mime:blob.type};
  }catch(error){
    if(error.name==='AbortError')throw error;
    if(!still)snapshot();return {src:still,motionSrc:null,duration:0,motionError:true};
  }
}
function motionVideo(src,signal){
  return new Promise((resolve,reject)=>{
    check(signal);const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.style.cssText='position:fixed;left:-9999px;width:2px;height:2px;pointer-events:none';
    const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);video.onloadeddata=null;video.onerror=null;};
    const fail=error=>{cleanup();video.pause();video.removeAttribute('src');video.load();video.remove();reject(error);};
    const cancel=()=>fail(abortError());
    const timer=setTimeout(()=>fail(new Error('เปิดคลิป Live ไม่สำเร็จ ลองอีกครั้ง')),12000);
    video.onloadeddata=()=>{cleanup();resolve(video);};video.onerror=()=>fail(new Error('เบราว์เซอร์เปิดคลิปนี้ไม่ได้ ลองบันทึกด้วยเบราว์เซอร์ที่ถ่ายภาพ'));
    signal?.addEventListener('abort',cancel,{once:true});document.body.append(video);video.src=src;video.load();
  });
}
export async function exportMotion(state,{format='strip',signal,onProgress}={}){
  check(signal);const comp=await prepareComposition(state);check(signal);const loaded=[];
  try{
    const results=await Promise.allSettled(state.photos.map(async photo=>{
      if(!photo?.motionSrc)return null;const video=await motionVideo(photo.motionSrc,signal);loaded.push(video);return video;
    }));
    const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
    const sources=results.map(r=>r.value);
    check(signal);await Promise.all(loaded.map(v=>v.play()));
    const strip=document.createElement('canvas'),ratio=Math.min(1,1080/comp.layout.width,1920/comp.layout.height);
    strip.width=Math.max(2,Math.floor(comp.layout.width*ratio/2)*2);strip.height=Math.max(2,Math.floor(comp.layout.height*ratio/2)*2);
    const target=format==='story'?document.createElement('canvas'):strip;if(format==='story'){target.width=1080;target.height=1920;}
    const ctx=strip.getContext('2d'),targetCtx=target.getContext('2d');
    return await recordCanvas(target,{duration:6000,fps:20,signal,onProgress,draw(elapsed){comp.paint(ctx,sources,elapsed);if(format==='story')paintStory(targetCtx,strip,comp.frame);}});
  }finally{
    loaded.forEach(v=>{v.pause();v.removeAttribute('src');v.load();v.remove();});
  }
}
