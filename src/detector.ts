import {Registro, Encontro, TipoEncontro} from './types';
import {haversine} from './haversine';

//agrupa por timestamp
const CONFIG ={
    faccaoTambemGeraGenerico: false,
    vitimaEntraNoGenerico: false,
};

//classificar os pares
function ehProtetiva(a: Registro, b:Registro): boolean {
    const aVitimaDeB= a.medidaProtetiva && a.idsRestricaoMedida.includes(b.idMonitorado);
    const bVitimaDeA= b.medidaProtetiva && b.idsRestricaoMedida.includes(a.idMonitorado);
    return aVitimaDeB || bVitimaDeA;
}

function ehFaccao(a:Registro, b:Registro): boolean {
    return a.faccaoMonitorado !== null && b.faccaoMonitorado !==null && a.faccaoMonitorado === b.faccaoMonitorado;
}


export function detectarEncontros(registros: Registro[]): Encontro[]{
    const encontros: Encontro[]=[];
    const porTimestamp = new Map<string, Registro[]>();
    for(const r of registros) {
        const lista = porTimestamp.get(r.timestamp);
        if(lista) lista.push(r);
        else porTimestamp.set(r.timestamp, [r]);
    }

    //percorre os pares de cada timestamp 
    for(const[timestamp, grupo] of porTimestamp){
        for(let i=0;i<grupo.length;i++){
            for(let j=i+1;j<grupo.length;j++){
                const a = grupo[i];
                const b = grupo[j];
                
                const distancia = haversine(a.latitude, a.longitude, b.latitude, b.longitude);
                //calcular distancia se <20, classificar e criar o encontro
                if (distancia <20){
                    if (ehProtetiva(a,b)){
                        encontros.push(montarEncontro('protetiva', a, b, timestamp, distancia));
                    }
                    if (ehFaccao(a,b)){
                        encontros.push(montarEncontro('faccao',a,b,timestamp,distancia));
                    }
                    const algumaVitima = a.medidaProtetiva || b.medidaProtetiva;
                    const geraGenerico = (CONFIG.vitimaEntraNoGenerico || !algumaVitima) && (CONFIG.faccaoTambemGeraGenerico || !ehFaccao(a, b));
                    if (geraGenerico) {
                        encontros.push(montarEncontro('generico', a,b,timestamp,distancia));
                    }
                }
            }
        }
    }

    return encontros;
}

export function detectarNoGrupo(grupo: Registro[], timestamp: string):Encontro[]{
    const encontros: Encontro[]=[];
    const porTimestamp = new Map<string, Registro[]>();
    //percorre os pares de cada timestamp 
    for(const[timestamp, grupo] of porTimestamp){
        for(let i=0;i<grupo.length;i++){
            for(let j=i+1;j<grupo.length;j++){
                const a = grupo[i];
                const b = grupo[j];
                
                const distancia = haversine(a.latitude, a.longitude, b.latitude, b.longitude);
                //calcular distancia se <20, classificar e criar o encontro
                if (distancia <20){
                    if (ehProtetiva(a,b)){
                        encontros.push(montarEncontro('protetiva', a, b, timestamp, distancia));
                    }
                    if (ehFaccao(a,b)){
                        encontros.push(montarEncontro('faccao',a,b,timestamp,distancia));
                    }
                    const algumaVitima = a.medidaProtetiva || b.medidaProtetiva;
                    const geraGenerico = (CONFIG.vitimaEntraNoGenerico || !algumaVitima) && (CONFIG.faccaoTambemGeraGenerico || !ehFaccao(a, b));
                    if (geraGenerico) {
                        encontros.push(montarEncontro('generico', a,b,timestamp,distancia));
                    }
                }
            }
        }
    }
    return encontros;
}

function montarEncontro(tipo: TipoEncontro, a: Registro, b: Registro, timestamp: string, distancia: number):Encontro{
   return {
    tipo, 
    monitoradosEncontro:[a.idMonitorado,b.idMonitorado],
    timestamp,
    posicoes: {
        [a.idMonitorado]: {lat:a.latitude, lon:a.longitude},
        [b.idMonitorado]: {lat:b.latitude, lon:b.longitude},
    },
    distanciaMetros: distancia,
   };
}