export type ManualChunk = Readonly<{ id:string; title:string; pages:number[]; text:string; task?:number }>;

// Static, pre-extracted study context. The PDF is never parsed at runtime.
export const manualKnowledge: readonly ManualChunk[] = [
  {id:"constitution",title:"Constitución y organización del Estado",pages:[18,19,20,21,22,23,24,25,26],task:1,text:"La Constitución española es la ley fundamental. España es una monarquía parlamentaria y la soberanía nacional reside en el pueblo español. La organización territorial se articula en municipios, provincias y comunidades autónomas. Las instituciones del Estado ejercen sus competencias conforme a la Constitución y las leyes."},
  {id:"rights",title:"Derechos y deberes",pages:[33,34,35,36],task:2,text:"La ciudadanía y la convivencia democrática se apoyan en derechos, libertades y deberes recogidos por el ordenamiento constitucional. La igualdad, la participación y el respeto a la diversidad son principios de la vida pública."},
  {id:"territory",title:"Geografía física y política",pages:[43,44,45,46],task:3,text:"España se sitúa en el suroeste de Europa. Su territorio incluye la península, los archipiélagos y las ciudades autónomas. El mapa político distingue comunidades autónomas, provincias y capitales."},
  {id:"culture",title:"Cultura e historia",pages:[66,67,68,69,70],task:4,text:"El patrimonio histórico y cultural español reúne lenguas, tradiciones, monumentos, fiestas, literatura, arte y aportaciones científicas. Las referencias del manual deben entenderse en su contexto histórico y cultural."},
  {id:"economy",title:"Sociedad y economía",pages:[92,93,94,95,96,97,98],task:5,text:"La sociedad española incluye servicios públicos, trabajo, Seguridad Social y sectores económicos como el turismo, la industria y la agricultura. La vida laboral recoge los años de cotización a la Seguridad Social; los convenios colectivos regulan condiciones laborales."}
];
export function chunksForQuestion(task:number) { return manualKnowledge.filter(c => c.task === task); }
