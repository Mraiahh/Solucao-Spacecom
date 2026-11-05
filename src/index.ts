import * as fs from 'fs';
import {lerRegistros} from './parser';
import {detectarEncontros} from './detector';

const nome=process.argv[2];
if(!nome){
    console.error('Uso: npx tsx src/index.ts <nomedodataset>');
    process.exit(1);
}

console.time('processamento');
const registros=lerRegistros(`data/${nome}.txt`);
console.log(`${registros.length} registros lidos`);
const encontros = detectarEncontros(registros);
console.log(`${encontros.length} encontros detectados`);

fs.writeFileSync(`output/${nome}.json`, JSON.stringify(encontros, null, 2));
console.timeEnd('processamento');