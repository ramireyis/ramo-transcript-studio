const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const out=(statusCode,data)=>({statusCode,headers,body:JSON.stringify(data)});
export async function handler(event){
 if(event.httpMethod!=='POST')return out(405,{error:'Yalnızca POST destekleniyor.'});
 const key=process.env.OPENAI_API_KEY;if(!key)return out(503,{error:'OPENAI_API_KEY ayarlanmamış.'});
 let body;try{body=JSON.parse(event.body||'{}')}catch{return out(400,{error:'Geçersiz JSON.'})}
 const text=String(body.text||'').slice(0,50000),mode=String(body.mode||'summary'),language=String(body.language||'Türkçe').slice(0,50);
 if(text.length<20)return out(400,{error:'Önce transkript oluştur.'});
 const prompts={summary:`Metni ${language} dilinde net ve sadık biçimde özetle. Metinde olmayan bilgi ekleme.`,titles:`Metne uygun ${language} dilinde 8 etkileyici ama yanıltıcı olmayan YouTube başlığı üret.`,description:`Metne sadık ${language} dilinde YouTube açıklaması yaz. En sonda tam 3 alakalı hashtag kullan.`,clean:`Metni aynı dilde tutarak noktalama ve paragraf düzeni yap; anlamı değiştirme.`};
 if(!prompts[mode])return out(400,{error:'Geçersiz işlem.'});
 try{const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',temperature:0.4,messages:[{role:'system',content:prompts[mode]},{role:'user',content:text}]}),signal:AbortSignal.timeout(26000)});const data=await res.json().catch(()=>({}));if(!res.ok)return out(502,{error:data.error?.message||'Yapay zekâ servisi hata verdi.'});return out(200,{result:data.choices?.[0]?.message?.content||''})}catch{return out(502,{error:'Yapay zekâ isteği tamamlanamadı.'})}
}
