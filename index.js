const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Terminal</title>
<style>
body{background:#000;margin:0;display:flex;flex-direction:column;height:100vh;}
#out{flex:1;color:#0f0;font-family:monospace;font-size:13px;padding:10px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;}
#inp{background:#111;color:#0f0;border:1px solid #0f0;font-family:monospace;font-size:13px;padding:8px;width:100%;outline:none;}
</style></head>
<body>
<div id="out">$ </div>
<input id="inp" placeholder="type command..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
<script>
const out=document.getElementById('out');
const inp=document.getElementById('inp');
const ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host);
ws.onopen=()=>{out.textContent='Connected! Type a command:\n$ ';inp.focus();}
ws.onmessage=e=>{out.textContent+=e.data+'\n$ ';out.scrollTop=out.scrollHeight;}
ws.onerror=()=>{out.textContent+='WebSocket Error\n';}
ws.onclose=()=>{out.textContent+='Disconnected\n';}
inp.onkeydown=e=>{if(e.key==='Enter'){ws.send(inp.value);out.textContent+='> '+inp.value+'\n';inp.value='';}};
</script></body></html>`);
});

wss.on('connection', ws => {
  ws.on('message', cmd => {
    exec(cmd.toString(), { timeout: 10000 }, (err, stdout, stderr) => {
      ws.send(stdout || stderr || (err ? err.message : 'done'));
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
