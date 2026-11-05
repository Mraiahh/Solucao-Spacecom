import * as fs from 'fs';
import * as readline from 'readline';
import { Registro } from './types';
import { parseLinha } from './parser';
import { detectarNoGrupo } from './detector';

export async function processarArquivo(
    caminhoEntrada: string,
    caminhoSaida: string
): Promise<number> {
    const rl = readline.createInterface({
        input: fs.createReadStream(caminhoEntrada, 'utf-8'),
        crlfDelay: Infinity,
    });

    const saida = fs.openSync(caminhoSaida, 'w');
    fs.writeSync(saida, '[\n');

    let total = 0;
    let cabecalho = true;
    let timestampAtual = '';
    let grupo: Registro[] = [];

    const fecharGrupo = () => {
        for (const e of detectarNoGrupo(grupo, timestampAtual)){
            fs.writeSync(saida, (total > 0 ? ',\n' : '') + JSON.stringify(e));
            total++;
        }
        grupo = [];
    };

    try{
        for await (const linha of rl){
            if (cabecalho) { cabecalho = false; continue; }
            if (linha.trim() === '') continue;
            const registro = parseLinha(linha);
            if(timestampAtual !== '' && registro.timestamp < timestampAtual){
                throw new Error(
                    `Arquivo fora de ordem: ${registro.timestamp} veio depois de ${timestampAtual}`
                );
            }
            if (timestampAtual !== '' && registro.timestamp !== timestampAtual){
                fecharGrupo();
            }

            timestampAtual = registro.timestamp;
            grupo.push(registro);
        }

        if (grupo.length > 0) fecharGrupo();
        fs.writeSync(saida, '\n]\n');
    } finally {
        fs.closeSync(saida);
    }
    return total;
}