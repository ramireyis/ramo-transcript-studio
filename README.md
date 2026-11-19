# Ramo Transcript Studio

Netlify için Türkçe YouTube transkript paneli. YouTube altyazısı, toplu URL, TXT/SRT/VTT, yerel geçmiş, metin düzenleme, ses dosyası ve OpenAI ile içerik üretimi.

## Kurulum

1. ZIP dosyasını açın ve klasörü GitHub deposuna yükleyin.
2. Netlify > Add new project > Import an existing project > GitHub deposunu seçin.
3. Build command boş bırakılabilir (veya `npm run build`); Publish directory `.`; Functions directory `netlify/functions`.
4. Site configuration > Environment variables bölümüne şunları ekleyin:
   - `SUPADATA_API_KEY`: https://supadata.ai/ üzerinden alınan API anahtarı. YouTube altyazısı için gerekli.
   - `OPENAI_API_KEY`: https://platform.openai.com/api-keys üzerinden alınan API anahtarı. AI araçları ve ses yükleme için gerekli.
   - `OPENAI_MODEL`: isteğe bağlı, varsayılan `gpt-4o-mini`.
5. Deploy / Trigger deploy yapın.

**Önemli:** Netlify'a yalnızca statik ZIP sürükleyip bırakmak Functions API'lerinin dağıtılması için güvenilir yöntem değildir. GitHub üzerinden Netlify build/deploy kullanın. Anahtarları HTML veya GitHub'a yazmayın.

## Teknik sınırlar

- YouTube altyazısı Supadata'nın erişimine, video izinlerine ve sağlayıcının güncel API sözleşmesine bağlıdır. Bazı videolar için altyazı yoktur veya erişim engellenir.
- Bu sürüm altyazısı olmayan YouTube videolarının sesini otomatik indirmez. Bunun için yasal erişimi olan bir medya alma/transkripsiyon hattı ayrıca gerekir.
- Ses yükleme 3 MB ile sınırlıdır (Netlify Functions isteği boyutu/zaman sınırları). Büyük dosyalar için blob depolama + asenkron işleme önerilir.
- Toplu URL'ler sırayla çalışır; ücretlendirme API sağlayıcılarının tarifelerine bağlıdır.
- Geçmiş tarayıcı localStorage alanındadır; cihazlar arası senkronizasyon ve hesap sistemi yoktur.
- Kamuya açık yayın yaparsanız API maliyetleri ve kötüye kullanım riskleri için Netlify Identity/harici auth, rate limiting ve kota ekleyin.
- Supadata API yanıt şeması değişirse `netlify/functions/transcript.mjs` adaptörü güncellenmelidir.
- SRT/VTT zamanları sağlayıcının zaman birimine bağlıdır; bu uygulama saniye bekler. Servis milisaniye döndürüyorsa dönüştürme gerekir.

## Lokal geliştirme

`npm install` ardından `npx netlify dev`. `.env` dosyası oluşturup anahtarları yerel ortamda tanımlayın; `.env` dosyasını repoya göndermeyin.
