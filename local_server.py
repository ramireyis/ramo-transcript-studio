import json, re, subprocess, tempfile, sys
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
ROOT=Path(__file__).resolve().parent

def transcript(url,lang):
    u=urlparse(url)
    if u.scheme not in ('https','http') or u.hostname not in ('youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be'): raise ValueError('Geçerli YouTube bağlantısı gir.')
    vid=(u.path.split('/')[1] if u.hostname.endswith('youtu.be') else parse_qs(u.query).get('v',[''])[0] or (u.path.split('/')[2] if len(u.path.split('/'))>2 else ''))
    if not re.fullmatch(r'[\w-]{11}',vid): raise ValueError('Geçersiz video kimliği.')
    url='https://www.youtube.com/watch?v='+vid
    if lang not in ('auto','es','tr','de','en'): lang='auto'
    with tempfile.TemporaryDirectory() as d:
        base=[sys.executable,'-m','yt_dlp','--no-playlist','--no-warnings']
        pattern='es.*,tr.*,de.*,en.*' if lang=='auto' else lang+'.*'
        subprocess.run(base+['--skip-download','--write-subs','--write-auto-subs','--sub-langs',pattern,'--sub-format','json3','-o',d+'/video',url],capture_output=True,timeout=180)
        for f in sorted(Path(d).glob('*.json3')):
            data=json.loads(f.read_text()); parts=[]
            for e in data.get('events',[]):
                t=''.join(x.get('utf8','') for x in e.get('segs',[])).strip()
                if t and (not parts or t!=parts[-1]): parts.append(t)
            if parts:return {'ok':True,'text':' '.join(' '.join(parts).split()),'source':'yt-dlp'}
        # Optional local speech recognition, no paid API.
        try: import mlx_whisper
        except ImportError: raise ValueError('Altyazı bulunamadı. Whisper kurulumu gerekli.')
        subprocess.run(base+['-x','--audio-format','wav','-o',d+'/audio.%(ext)s',url],check=True,capture_output=True,timeout=600)
        result=mlx_whisper.transcribe(d+'/audio.wav',path_or_hf_repo='mlx-community/whisper-small-mlx',language=None if lang=='auto' else lang)
        text=result.get('text','').strip()
        if not text: raise ValueError('Ses metne dönüştürülemedi.')
        return {'ok':True,'text':text,'source':'whisper'}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def do_POST(self):
        if self.path!='/api/transcript':self.send_error(404);return
        if self.headers.get('Origin') not in (None,'http://127.0.0.1:8765'):self.send_error(403);return
        try:
            n=int(self.headers.get('Content-Length','0'))
            if not 0<n<10000:raise ValueError('Geçersiz istek.')
            b=json.loads(self.rfile.read(n)); result=transcript(b.get('url',''),b.get('lang','auto'))
        except Exception as e:result={'ok':False,'reason':str(e)}
        payload=json.dumps(result,ensure_ascii=False).encode();self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
