const $=id=>document.getElementById(id);
let source=null, recorder=null, chunks=[], started=0, timerId=null, micStream=null, recordings=[];
const chooseButtons=[$("choose"),$("choose2")];
function message(text,error=false){$("message").textContent=text;$("message").classList.toggle("error",error)}
function fmtTime(n){n=Math.max(0,Math.floor(n));return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")}
function stopTracks(s){s?.getTracks().forEach(t=>t.stop())}
async function chooseSource(){
 try{
  stopTracks(source);source=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:$("audio").checked});
  $("preview").srcObject=source;$("empty").hidden=true;$("preview").hidden=false;
  await $("preview").play();$("dimensions").textContent=$("preview").videoWidth+" × "+$("preview").videoHeight;
  $("start").disabled=false;$("status").textContent="Source selected";
  source.getVideoTracks()[0].addEventListener("ended",()=>{if(recorder&&recorder.state!=="inactive")stopRecording();$("status").textContent="Screen sharing ended"});
  message(source.getAudioTracks().length?"Source selected. Audio track available.":"Source selected. No source audio track was shared.");
  $("studio").scrollIntoView({behavior:"smooth",block:"start"});
 }catch(e){message(e.name==="NotAllowedError"?"Screen sharing was cancelled or permission was denied.":"Could not start screen sharing: "+e.message,true)}
}
function mime(){return ["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x))||""}
async function startRecording(){
 if(!source)return;
 $("start").disabled=true;chooseButtons.forEach(b=>b.disabled=true);
 try{
  let delay=Number($("delay").value);
  while(delay>0){$("countdown").hidden=false;$("countdown").textContent=delay;message("Recording starts in "+delay+" seconds…");await new Promise(r=>setTimeout(r,1000));delay--}
  $("countdown").hidden=true;
  const stream=new MediaStream(source.getTracks().filter(t=>t.kind==="video"||($("audio").checked&&t.kind==="audio")).map(t=>t.clone()));
  if($("mic").value==="on"){micStream=await navigator.mediaDevices.getUserMedia({audio:true});micStream.getAudioTracks().forEach(t=>stream.addTrack(t.clone()))}
  chunks=[];const mt=mime();recorder=new MediaRecorder(stream,mt?{mimeType:mt}:undefined);
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onerror=e=>message("Recorder error: "+(e.error?.message||"unknown error"),true);
  recorder.onstop=()=>{
   const blob=new Blob(chunks,{type:recorder.mimeType||"video/webm"});stopTracks(stream);stopTracks(micStream);micStream=null;
   if(!blob.size){message("No video data captured. Please try again.",true);reset();return}
   const url=URL.createObjectURL(blob),name="ScreenMate-"+new Date().toISOString().replace(/[:.]/g,"-").slice(0,19)+".webm";
   recordings.unshift({blob,url,name,duration:(Date.now()-started)/1000});renderHistory();
   const a=document.createElement("a");a.href=url;a.download=name;a.click();message("Recording saved and download started.");reset();
  };
  recorder.start(1000);started=Date.now();$("start").hidden=true;$("stop").hidden=false;$("status").textContent="Recording";$("previewTitle").textContent="Recording in progress";
  message("Recording in progress. Press Stop recording when you're done.");
  timerId=setInterval(()=>{const sec=(Date.now()-started)/1000;$("timer").textContent=fmtTime(sec);const max=Number($("duration").value);if(max&&sec>=max)stopRecording()},250);
 }catch(e){message(e.message||"Could not start recording.",true);reset()}
}
function stopRecording(){if(recorder&&recorder.state!=="inactive"){recorder.stop();$("stop").hidden=true;$("status").textContent="Saving recording…"}}
function reset(){clearInterval(timerId);timerId=null;$("start").hidden=false;$("start").disabled=!source;$("stop").hidden=true;$("countdown").hidden=true;$("status").textContent=source?"Source selected":"Ready when you are";$("previewTitle").textContent="Preview";$("timer").textContent="00:00";chooseButtons.forEach(b=>b.disabled=false)}
function renderHistory(){
 $("count").textContent=recordings.length;const list=$("list");list.innerHTML="";
 if(!recordings.length){list.className="history-empty";list.textContent="No recordings yet. Your recent clips will appear here.";return}
 list.className="";
 recordings.forEach((r,i)=>{const card=document.createElement("div");card.className="clip";const v=document.createElement("video");v.src=r.url;v.controls=true;v.playsInline=true;const title=document.createElement("strong");title.textContent=r.name+" · "+fmtTime(r.duration);const actions=document.createElement("div");actions.className="clip-actions";const dl=document.createElement("button");dl.textContent="Download";dl.onclick=()=>{const a=document.createElement("a");a.href=r.url;a.download=r.name;a.click()};const del=document.createElement("button");del.textContent="Delete";del.onclick=()=>{URL.revokeObjectURL(r.url);recordings.splice(i,1);renderHistory()};actions.append(dl,del);card.append(v,title,actions);list.append(card)})
}
chooseButtons.forEach(b=>b.addEventListener("click",chooseSource));$("start").addEventListener("click",startRecording);$("stop").addEventListener("click",stopRecording);
$("audio").addEventListener("change",()=>{if(source)message("Audio preference applies the next time you choose a source.")});
$("preview").hidden=true;
window.addEventListener("beforeunload",()=>{if(recorder&&recorder.state!=="inactive")recorder.stop();stopTracks(source);stopTracks(micStream);recordings.forEach(r=>URL.revokeObjectURL(r.url))});
