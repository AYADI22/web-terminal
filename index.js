const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Terminal</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; display:flex; flex-direction:column; height:100vh; }
#output { flex:1; color:#0f0; font-family:monospace; font-size:14px; padding:10px; overflow-y:auto; white-space:pre-wrap; word-break:break-all; }
#input { background:#111; color:#0f0; border:1px solid #333; font-family:monospace; font-size:14px; padding:8px; width:100%; outline:none; }
</style>
</head>
<body>
<div id="output">Connecting...\n</div>
<input id="input" placeholder="Type command here..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
<script>
const out = document.getElementById('output');
const inp = document.getElementById('input');
const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(proto + '//' + location.host);
ws.onopen = () => { out.textContent = 'Connected!\n$ '; inp.focus(); };
ws.onmessage = e => { out.textContent += e.data; out.scrollTop = out.scrollHeight; };
ws.onclose = () => { out.textContent += '\nDisconnected!'; };
ws.onerror = e => { out.textContent += '\nError: ' + e; };
inp.addEventListener('keydown', e => {
  if(e.key === 'Enter') {
    const cmd = inp.value;
    inp.value = '';
    ws.send(cmd);
  }
});
</script>
</body>
</html>`);
});

wss.on('connection', ws => {
  const shell = pty.spawn('bash', [], { name:'xterm', cols:80, rows:24, env:process.env });
  shell.on('data', data => { try { ws.send(data); } catch(e){} });
  ws.on('message', msg => shell.write(msg + '\r'));
  ws.on('close', () => { try { shell.kill(); } catch(e){} });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server on port ' + PORT));
