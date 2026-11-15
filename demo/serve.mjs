import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const folder=path.resolve(fileURLToPath(new URL('./site/',import.meta.url)));
const port=Number(process.env.DEMO_PORT||4321);
const origin=`http://127.0.0.1:${port}`;
let running=false;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.map':'application/json','.png':'image/png'};
async function execute(args){
 let command='npm',prefix=['exec','--yes','--package=node@24.22.1','--package=rea-agents@6.9.0','--','rea'];
 if(process.env.REA_ENTRY){command=process.execPath;prefix=[path.resolve(process.env.REA_ENTRY)];}
 return new Promise((resolve,reject)=>{
  const child=spawn(command,[...prefix,...args,'--json'],{cwd:folder,env:process.env,stdio:['ignore','pipe','pipe']});
  let out='',err='';let killed=false;
  const timer=setTimeout(()=>{killed=true;child.kill('SIGTERM');},180000);
  child.stdout.on('data',x=>{out+=x;if(out.length>40_000_000)child.kill('SIGTERM');});
  child.stderr.on('data',x=>{err=(err+x).slice(-8000);});
  child.on('error',e=>{clearTimeout(timer);reject(e);});
  child.on('close',code=>{clearTimeout(timer);if(killed)return reject(new Error('REA exceeded the demo deadline. No result is claimed.'));try{const result=JSON.parse(out);if(code!==0||result.error||result.category)return reject(new Error(result.message||result.error||err||`REA exited ${code}`));resolve(result);}catch(e){reject(new Error(e.message||err));}});
 });
}
async function browserPath(){
 const candidates=[process.env.REA_CHROME,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Brave Browser.app/Contents/MacOS/Brave Browser','/usr/bin/chromium','/usr/bin/google-chrome'].filter(Boolean);
 for(const p of candidates){try{await access(p);return p;}catch{}}
 throw new Error('Chrome or Brave was not found. Set REA_CHROME to its executable path.');
}
async function capture(version,chrome){
 const input=JSON.parse(await readFile(new URL(`./${version}.scenario.json`,import.meta.url),'utf8'));
 input.browser.executable_path=chrome;input.start_url.url=`${origin}/${version}/demo.html`;
 input.capture={at_end:['screenshot','accessibility','url']};
 const evidence=await execute(['capture-browser-scenario',JSON.stringify(input)]);
 const capture=evidence.normalized_result;
 const final=capture?.steps?.at(-1);
 if(final?.artifacts?.accessibility?.state!=='captured')throw new Error(`REA did not capture final accessibility for ${version}.`);
 const text=final.artifacts.accessibility.value.text;
 const match=text.match(/textbox "HV- kV"[^\n]*?:\s*"?(-?\d+(?:\.\d+)?)/);
 if(!match)throw new Error(`The final HV- value was not found in ${version} Evidence. Review the retained capture.`);
 await writeFile(path.join(folder,'evidence',`browser-${version}.json`),JSON.stringify(evidence));
 if(final.artifacts.screenshot.state==='captured')await writeFile(path.join(folder,'evidence',`browser-${version}.png`),Buffer.from(final.artifacts.screenshot.value.data_base64,'base64'));
 return {value:Number(match[1]),evidence_id:evidence.evidence_id};
}
async function applyLiveFix(prepare) {
 const source=new URL('../src/components/ui/NumericField.tsx',import.meta.url);
 const before=await readFile(new URL('./NumericField.before.tsx',import.meta.url),'utf8');
 const fixed=await readFile(new URL('./NumericField.fixed.tsx',import.meta.url),'utf8');
 const current=await readFile(source,'utf8');
 if(current!==before && current!==fixed) throw new Error('The component contains other edits. They were preserved; use a clean demo checkout.');
 const root=fileURLToPath(new URL('..',import.meta.url));
 const vite=path.join(root,'node_modules/vite/bin/vite.js');
 try{await access(vite)}catch{throw new Error('Run npm ci before using the live patch controls.');}
 await writeFile(source,prepare?before:fixed);
 try {
  await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,[vite,'build','--config','vite.demo.config.ts','--outDir','demo/site/after'],{cwd:root,env:{...process.env,DEMO_BASELINE:'false'},stdio:['ignore','pipe','pipe']});
   let log='';child.stdout.on('data',x=>log=(log+x).slice(-8000));child.stderr.on('data',x=>log=(log+x).slice(-8000));child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(log)));
  });
 } catch(error) { await writeFile(source,current); throw error; }
 return {mode:prepare?'original-source-restored':'correction-applied',source:'src/components/ui/NumericField.tsx',rebuilt:true};
}
export const handleRequest=async(req,res)=>{
 const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
 if(['/api/prepare-live','/api/apply-fix'].includes(req.url)&&req.method==='POST'){
  if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Use this local demo origin.'});
  if(running)return send(409,{error:'Another demo operation is running.'});
  running=true;
  try{send(200,await applyLiveFix(req.url==='/api/prepare-live'));}catch(e){send(409,{error:e.message});}finally{running=false;}return;
 }
 if(req.url==='/api/rea-capture'&&req.method==='POST'){
  if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Use this local demo origin.'});
  if(running)return send(409,{error:'A capture is already running.'});
  running=true;
  try{await mkdir(path.join(folder,'evidence'),{recursive:true});const chrome=await browserPath();const before=await capture('before',chrome);const after=await capture('after',chrome);const result={source:'REA capture_browser_scenario',captured_at:new Date().toISOString(),before,after,passed:before.value===3&&after.value===-3};await writeFile(path.join(folder,'evidence','browser-comparison.json'),JSON.stringify(result,null,2));send(200,result);}catch(e){send(502,{error:e.message,verified:false});}finally{running=false;}return;
 }
 if(req.method!=='GET')return send(405,{error:'Method not allowed.'});
 try{const pathname=decodeURIComponent(new URL(req.url,origin).pathname);const file=path.resolve(folder,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(folder+path.sep)&&file!==folder)return send(403,{error:'Invalid path.'});const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{send(404,{error:'File not found. Run npm run demo:build first.'});}
};
const server=http.createServer(handleRequest);
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(port,'127.0.0.1',()=>console.log(`Fluidnatek REA visual demo: ${origin}\nNo production data, cloud account or machine connection is used.`));
