const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const out=(statusCode,data)=>({statusCode,headers,body:JSON.stringify(data)});
export async function handler(event){
 if(event.httpMethod!=='POST')return out(405,{error:'Yalnızca POST destekleniyor.'});
 const key=process.env.SUPADATA_API_KEY;
 if(!key)return out(503,{error:'SUPADATA_API_KEY Netlify ortam değişkeni tanımlanmamış. Kurulum rehberine bak.'});
 let payload;try{payload=JSON.parse(event.body||'{}')}catch{return out(400,{error:'Geçersiz istek.'})}
 const url=String(payload.url||'').trim();
 let parsed;try{parsed=new URL(url)}catch{return out(400,{error:'Geçerli bir YouTube bağlantısı gir.'})}
 const host=parsed.hostname.replace(/^www\./,'').toLowerCase();
 if(!['youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(host))return out(400,{error:'Yalnızca YouTube bağlantıları desteklenir.'});
 try{
  const endpoint=new URL('https://api.supadata.ai/v1/youtube/transcript');endpoint.searchParams.set('url',url);endpoint.searchParams.set('text','false');
  const res=await fetch(endpoint,{headers:{'x-api-key':key,'accept':'application/json'},signal:AbortSignal.timeout(26000)});
  const json=await res.json().catch(()=>({}));
  if(!res.ok)return out(res.status===429?429:502,{error:json.message||json.error||`Altyazı servisi yanıt vermedi (${res.status}).`,hint:'Video altyazısız, kısıtlı veya erişime kapalı olabilir.'});
  const content=json.content||json.transcript||json.segments||[];
  const segments=(Array.isArray(content)?content:[]).map((s,i)=>({text:String(s.text||s.content||'').trim(),start:Number(s.offset??s.start??s.start_time??0),duration:Number(s.duration??0)})).filter(s=>s.text);
  if(!segments.length&&typeof content==='string')segments.push({text:content,start:0,duration:0});
  if(!segments.length)return out(404,{error:'Bu video için erişilebilir altyazı bulunamadı.'});
  return out(200,{segments,lang:json.lang||json.language||'auto',source:'YouTube altyazısı',url});
 }catch(err){return out(502,{error:err.name==='TimeoutError'?'Servis zaman aşımına uğradı.': 'Transkript alınamadı. Biraz sonra tekrar dene.'})}
}
