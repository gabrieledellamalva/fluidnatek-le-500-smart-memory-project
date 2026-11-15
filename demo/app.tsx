import React from 'react';
import {createRoot} from 'react-dom/client';
import RunConfig from '../src/components/RunConfig';
import type {ExperimentalSetup} from '../src/core/types/setup';
import {SEED_PROJECTS,SEED_FORMULATIONS} from '../src/seedData';
import '../src/index.css';
const project={...SEED_PROJECTS[0],name:'REA interview · synthetic research project'};
const formulation={...SEED_FORMULATIONS[0],name:'Nylon-6 · demonstration formulation'};
const setup:ExperimentalSetup={id:'DEMO-SETUP',projectId:project.id,name:'LE-500 · demo configuration',machine:{model:'LE-500'},injector:{type:'Single needle'},collector:{type:'Plate'},createdAt:'2026-11-15T00:00:00Z',updatedAt:'2026-11-15T00:00:00Z'};
const baseline=import.meta.env.VITE_DEMO_BASELINE==='true';
createRoot(document.getElementById('root')!).render(<>
  <div style={{background:baseline?'#78350f':'#065f46',color:'white',padding:'12px 28px',fontSize:13,display:'flex',justifyContent:'space-between'}}>
    <strong>FLUIDNATEK SMART MEMORY · {baseline?'Original component':'Working copy · patch branch'}</strong>
    <span>Offline interview fixture · synthetic data · no machine or cloud connection</span>
  </div>
  <main style={{padding:24,maxWidth:1600,margin:'auto'}}><RunConfig project={project} formulation={formulation} setup={setup} projects={[project]} formulations={[formulation]} characterizations={[]} setups={[setup]} experiments={[]} materials={[]} lang="en" onAddExperiment={async()=>{throw new Error('Saving is disabled in this isolated investigation fixture.')}}/></main>
</>);
