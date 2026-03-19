const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Terminal</title>
<style>
body{background:#000;color:#0f0;font-family:monospace;margin:0;padding:10px;}
#out{min-height:80vh;white-space:pre-wrap;word-break:break-all;}
#row{display:flex;gap:5px;margin-top:10px;}
#inp{flex:1;background:#000;color:#0f0;border:1px solid #0f0;padding:5px;font-family:monospace;font-size:14px;outline:none;}
button{background:#0f0;color:#000;border:none;padding:5px 10px;font-weight:bold;cursor:pointer;}
</style></head>
<body>
<div id="out">$ </div>
<div id="row">
<input id="inp" placeholder="type command..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
<button onclick="run()">Run</button>
</div>
<script>
async function run(){
  const cmd=document.getElementById('inp').value;
  const out=document.getElementById('out');
  out.textContent+='> '+cmd+'\n';
  document.getElementById('inp').value='';
  try{
    const r=await fetch('/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cmd})});
    const d=await r.json();
    out.textContent+=d.output+'\n$ ';
    out.scrollTop=out.scrollHeight;
  }catch(e){out.textContent+='Error: '+e+'\n$ ';}
}
document.getElementById('inp').addEventListener('keydown',e=>{if(e.key==='Enter')run();});
</script>
</body></html>`);
});

app.post('/run', (req, res) => {
  const cmd = req.body.cmd;
  exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
    res.json({ output: stdout || stderr || (err ? err.message : 'done') });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on ' + PORT));
