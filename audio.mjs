const h={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};const out=(statusCode,data)=>({statusCode,headers:h,body:JSON.stringify(data)});
export async function handler(event){
 if(event.httpMethod!=='POST')return out(405,{error:'Yalnızca POST destekleniyor.'});
 const key=process.env.OPENAI_API_KEY;if(!key)return out(503,{error:'OPENAI_API_KEY ayarlanmamış.'});
 let body;try{body=JSON.parse(event.body||'{}')}catch{return out(400,{error:'Geçersiz JSON.'})}
 const {data,name,type}=body; if(typeof data!=='string'||data.length>5.5e6)return out(413,{error:'Ses dosyası bu hızlı yükleme için çok büyük. En fazla 3 MB kullan.'});
 try{const bytes=Buffer.from(data,'base64');if(bytes.length>3*1024*1024)return out(413,{error:'Dosya 3 MB sınırını aşıyor.'});const form=new FormData();form.append('model','whisper-1');form.append('response_format','verbose_json');form.append('file',new Blob([bytes],{type:type||'audio/mpeg'}),String(name||'audio.mp3').replace(/[^\w.\-]/g,'_'));const r=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{authorization:`Bearer ${key}`},body:form,signal:AbortSignal.timeout(26000)});const j=await r.json().catch(()=>({}));if(!r.ok)return out(502,{error:j.error?.message||'Ses tanıma başarısız.'});return out(200,{segments:(j.segments||[{text:j.text,start:0}]).map(s=>({text:s.text,start:s.start||0,duration:(s.end||0)-(s.start||0)})),lang:j.language||'auto',source:'Ses dosyası'})}catch{return out(502,{error:'Ses dosyası işlenemedi.'})}
}
