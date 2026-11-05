import { processarArquivo } from './stream';

const nome = process.argv[2];
if (!nome){
    console.error('Uso: npx tsx src/indexStream.ts <nomedodataset>');
    process.exit(1);
}

async function main() {
    console.time('processamento');
    const total = await processarArquivo(`data/${nome}.txt`, `output/${nome}.json`);
    console.log(`${total} encontros detectados`);
    console.timeEnd('processamento');
}

main().catch((err) => { console.error(err); process.exit(1); })