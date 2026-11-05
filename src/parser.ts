//transforma o texo do .txt em uma lista de Registro
import * as fs from 'fs';
import {Registro} from './types';

export function parseLinha(linha: string): Registro {
    const [id, faccao, timestamp, lat, lon, protetiva, restricao] = linha.split(';');

    return {
        idMonitorado: Number(id),
        faccaoMonitorado: faccao && faccao.trim() !== '' ? Number(faccao) : null,
        timestamp: timestamp.replace(/"/g, '').trim(),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        medidaProtetiva: protetiva.trim().toLowerCase() === 'true',
        idsRestricaoMedida: restricao ? restricao.replace(/"/g, '').split(',').filter((x: string) => x.trim() !== '').map(Number): [],
    };
}

export function lerRegistros(caminho: string): Registro[] {
    const texto = fs.readFileSync(caminho, 'utf-8');
    const linhas = texto.split(/\r?\n/).filter((l: string)=> l.trim() !== '');
    const registros: Registro[] = [];

    for(let i=1;i<linhas.length;i++){
        registros.push(parseLinha(linhas[i]));
    }
    return registros;
}