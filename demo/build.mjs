import {spawnSync} from 'node:child_process';
import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
for(const baseline of [true,false]){
 const r=spawnSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build','--config','vite.demo.config.ts','--outDir',baseline?'demo/site/before':'demo/site/after'],{cwd:root,env:{...process.env,DEMO_BASELINE:String(baseline)},stdio:'inherit'});
 if(r.status!==0)process.exit(r.status??1);
}
await mkdir(new URL('./site/evidence/',import.meta.url),{recursive:true});
await copyFile(new URL('./index.html',import.meta.url),new URL('./site/index.html',import.meta.url));
try{await copyFile(new URL('./evidence/summary.json',import.meta.url),new URL('./site/evidence/summary.json',import.meta.url));}catch{}
