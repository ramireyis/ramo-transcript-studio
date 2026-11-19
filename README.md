# RamoAltyazi v2

Sade, dört dilli YouTube transkript paneli. Netlify Functions kullanır.

## Kurulum

1. ZIP içeriğini GitHub deposunun köküne yükleyin. `netlify/functions/transcript.mjs` dosyasının klasör yolunu koruyun.
2. Netlify projesini GitHub deposuna bağlayın; build command boş, publish directory `.` olabilir. `netlify.toml` fonksiyon klasörünü belirtir.
3. Netlify > Project configuration > Environment variables bölümünde `SUPADATA_API_KEY` değerini ekleyin. Anahtarı asla GitHub'a veya HTML dosyasına koymayın.
4. Yeni deploy yapın. `/api/transcript` POST endpoint'ini panelden test edin.

ÖNEMLİ: Bu sürüm mevcut `index.html`, `netlify.toml`, `package.json` ve `netlify/functions/transcript.mjs` dosyalarının yerini alır. Eski sürümü önce yedekleyin. Diğer eski fonksiyonlar kullanılıyorsa yerinde kalabilir, ancak yeni arayüz yalnızca transcript fonksiyonunu çağırır.

Önce YouTube'un herkese açık sayfasından altyazı çekmeyi dener. Bu yol YouTube kısıtlamaları nedeniyle her zaman çalışmayabilir; sonra Supadata API kullanır. Supadata ücret/kredi sınırları devam eder. Bu proje sınırsız transkript garantisi vermez.
