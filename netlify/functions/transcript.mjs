const headers = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' };
const reply = (status, body) => new Response(JSON.stringify(body),{status,headers});
const clean = s => String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
function idFrom(input){try{const u=new URL(input);if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be','youtube-nocookie.com','www.youtube-nocookie.com'].includes(u.hostname))return null;const id=u.hostname.includes('youtu.be')?u.pathname.slice(1).split('/')[0]:u.searchParams.get('v')||u.pathname.match(/\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];return /^[\w-]{11}$/.test(id||'')?id:null}catch{return null}}
const languages=['auto','tr','es','de','en'];
function decodeEntities(s){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}
async function youtubeCaptions(id, lang){
 const res=await fetch(`https://www.youtube.com/watch?v=${id}`,{headers:{'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36','accept-language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('YouTube sayfasına erişilemedi');
 const html=await res.text();let player=null;
 for(const pattern of [/ytInitialPlayerResponse\s*=\s*(\{.*?\})\s*;/s, /"playerResponse":"((?:\\.|[^"\\])*)"/s]){
  const m=html.match(pattern);if(!m)continue;
  try{player=pattern===undefined?null:pattern.source.startsWith('"playerResponse')?JSON.parse(JSON.parse('"'+m[1]+'"')):JSON.parse(m[1]);if(player)break}catch{}
 }
 const tracks=player?.captions?.playerCaptionsTracklistRenderer?.captionTracks||[];
 if(!tracks.length)throw Error('Videoda erişilebilir YouTube altyazısı bulunamadı');
 const order=lang==='auto'?['tr','es','de','en']: [lang];
 const track=order.map(l=>tracks.find(t=>t.languageCode===l)||tracks.find(t=>t.languageCode?.startsWith(l+'-'))).find(Boolean)|| (lang==='auto'?tracks[0]:null);
 if(!track)throw Error('Seçilen dilde hazır altyazı bulunamadı');
 const cap=await fetch(track.baseUrl,{signal:AbortSignal.timeout(12000)});
 if(!cap.ok)throw Error('Altyazı bağlantısı erişilemedi');
 const raw=await cap.text();let segments=[];
 if(raw.trim().startsWith('{')){const data=JSON.parse(raw);segments=(data.events||[]).flatMap(e=>(e.segs||[]).map(s=>({start:e.tStartMs||0,text:clean(decodeEntities(s.utf8||''))}))).filter(x=>x.text)}
 else{for(const m of raw.matchAll(/<text\b[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g))segments.push({start:Math.round(Number(m[1])*1000),text:clean(decodeEntities(m[2]))});}
 if(!segments.length)throw Error('YouTube boş altyazı döndürdü');
 return {text:segments.map(s=>s.text).join(' ').replace(/\s+/g,' ').trim(),segments,language:track.languageCode,source:'youtube'};
}
async function supadata(id,lang){
 const key=process.env.SUPADATA_API_KEY;
 if(!key)throw Error('SUPADATA_API_KEY Netlify ortam değişkeni eksik');
 const u=new URL('https://api.supadata.ai/v1/youtube/transcript');u.searchParams.set('url',`https://www.youtube.com/watch?v=${id}`);if(lang!=='auto')u.searchParams.set('lang',lang);
 const r=await fetch(u,{headers:{'x-api-key':key,'accept':'application/json'},signal:AbortSignal.timeout(24000)});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.message||data.error||`Supadata HTTP ${r.status}`);
 const content=data.content??data.transcript??data.text??[];
 let segments=Array.isArray(content)?content.map(x=>({start:Math.round(Number(x.offset??x.start??0)),text:String(x.text||'').trim()})).filter(x=>x.text):[];
 let text=typeof content==='string'?content:segments.map(s=>s.text).join(' ');
 if(!text)throw Error('Supadata boş transkript döndürdü');
 return {text,segments,language:data.lang||lang,source:'supadata'};
}
export default async (request)=>{
 if(request.method!=='POST')return reply(405,{error:'POST gerekli'});
 try{const body=await request.json();const id=idFrom(body.url);if(!id)return reply(400,{error:'Geçerli bir YouTube bağlantısı gir.'});const lang=languages.includes(body.lang)?body.lang:'auto';
 let freeError='';try{return reply(200,await youtubeCaptions(id,lang))}catch(e){freeError=e.message}
 try{return reply(200,await supadata(id,lang))}catch(e){return reply(502,{error:`Ücretsiz yöntem: ${freeError}. Supadata: ${e.message}`})}
 }catch(e){return reply(500,{error:e.message||'Beklenmeyen hata'})}
};
export const config={path:'/api/transcript'};
