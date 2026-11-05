import * as fs from 'fs';

const chave = (e: any)=>{
    const[x,y]=[...e.monitoradosEncontro].sort((p:number,q:number)=>p-q);
    return `${e.tipo}|${x}-${y}|${e.timestamp}`;
};
const numero = process.argv[2];
const meu = JSON.parse(fs.readFileSync(`output/dataset${numero}.json`,'utf-8'));
const gabarito = JSON.parse(fs.readFileSync(`data/respostas${numero}.json`,'utf-8'));

const mapaMeu = new Map<string, any>(meu.map((e:any)=> [chave(e), e]));
const mapaGab = new Map<string, any>(gabarito.map((e:any)=>[chave(e), e]));
const faltam = [...mapaGab.keys()].filter((k)=>!mapaMeu.has(k));
const sobram = [...mapaMeu.keys()].filter((k)=>!mapaGab.has(k));
console.log(`Gabarito: ${gabarito.length}| Meu: ${meu.length}`);
console.log(`Faltam: ${faltam.length} | Sobram: ${sobram.length}`);
console.log('Exemplos que faltam:', faltam.slice(0,5));
console.log('Exemplos que sobram:', sobram.slice(0,5));

const comuns = [...mapaGab.keys()].filter((k)=>mapaMeu.has(k));
const comDiferencaDistancia: string[] = [];

for (const k of comuns){
    const itemGab = mapaGab.get(k);
    const itemMeu = mapaMeu.get(k);
    const distGab = itemGab.distanciaMetros;
    const distMeu = itemMeu.distanciaMetros;

    if (typeof distGab !== 'number' || typeof distMeu !== 'number' || Math.abs(distGab-distMeu)>= 1e-9){
        comDiferencaDistancia.push(k);
    }
}
console.log(`Em comum: ${comuns.length}`);
console.log(`Com diferença em distanciaMetros (>=1e-9): ${comDiferencaDistancia.length}`);
console.log(`Exemplos com divergência de distância:`, comDiferencaDistancia.slice(0, 5));