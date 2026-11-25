# RamoAltyazi v4 — kredi kullanmayan sürüm

Supadata veya başka ücretli API çağrısı içermez. Önce YouTube'un herkese açık sayfalarındaki altyazı listelerini ve farklı altyazı biçimlerini dener. Sunucu erişimi engellenirse kullanıcıya YouTube'dan metni kopyalayıp panelde düzenleme seçeneği gösterir. Her video için otomatik başarı garantisi yoktur.

GitHub deposunun köküne ZIP içindeki dosyaları doğru yollarıyla yerleştirin. `netlify/functions/transcript.mjs` yolunu koruyun. `netlify.toml` redirect ve functions ayarlarını içerir. Netlify deploy sonrası bir videoyla test edin. Mevcut siteyi değiştirmeden önce yedek alın.

## V3 — Kredisiz kullanım
Netlify sürümü yalnızca ücretsiz YouTube altyazısını dener. IP engeli varsa çalışmayabilir.
Mac üzerinde Terminal'de proje klasörüne girip `bash Baslat.command` çalıştırın. Python 3 gereklidir. Panel http://127.0.0.1:8765 adresinde açılır. Terminal açık kalmalıdır.
Altyazı yoksa Apple Silicon üzerinde isteğe bağlı Whisper desteği: `brew install ffmpeg` ve `.venv/bin/python -m pip install mlx-whisper`. İlk kullanımda model indirilir. Yalnızca erişim ve işleme izniniz olan videoları kullanın. Yerel sürümde internet erişimi ve YouTube kısıtlamaları yine etkili olabilir.
