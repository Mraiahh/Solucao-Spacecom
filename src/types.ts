//define o formato dos dados em um lugar só
export interface Registro {
    idMonitorado: number;
    faccaoMonitorado: number | null;
    timestamp: string;
    latitude: number;
    longitude: number;
    medidaProtetiva: boolean;
    idsRestricaoMedida: number[];
}

export type TipoEncontro = 'generico' | 'faccao' | 'protetiva';

export interface Encontro {
    tipo: TipoEncontro;
    monitoradosEncontro: [number, number];
    timestamp: string;
    posicoes: Record<string, { lat: number; lon: number }>;
    distanciaMetros: number;
}