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
<head>
<title>Web Terminal</title>
<style>
body { background: #000; margin: 0; }
#terminal { color: #0f0; font-family: monospace; font-size: 14px; padding: 10px; height: 100vh; overflow-y: auto; }
#input { width: 100%; background: #000; color: #0f0; border: none; font-family: monospace; font-size: 14px; outline: none; padding: 5px; }
</style>
</head>
<body>
<div id="terminal"></div>
<input id="input" autofocus placeholder="اكتب أمر هنا..."/>
<script>
const ws = new WebSocket('wss://' + location.host);
const term = document.getElementById('terminal');
const input = document.getElementById('input');
ws.onmessage = e => { term.innerHTML += e.data; term.scrollTop = term.scrollHeight; };
input.addEventListener('keydown', e => { if(e.key === 'Enter') { ws.send(input.value); input.value = ''; } });
</script>
</body>
</html>`);
});

wss.on('connection', ws => {
  const shell = pty.spawn('bash', [], { env: process.env });
  shell.on('data', data => ws.send(data));
  ws.on('message', msg => shell.write(msg + '\n'));
  ws.on('close', () => shell.kill());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Running on port ' + PORT));
