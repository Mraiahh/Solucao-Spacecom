#Detecção de Encontros

Algoritmo em TypeScript (Node.js) que processa dados de geolocalização e detecta encontros físicos entre monitorados (tornozeleiras) e vítimas de medidas protetivas.

## O que não está incluído neste repositório

Para manter o repositório leve, estes itens ficam de fora (estão no `.gitignore`):

- **`node_modules/`**: reconstruir com `npm install` (usa `package.json` e `package-lock.json`).
- **`data/dataset1.txt` a `dataset7.txt`**: datasets originais do desafio. Para execução do programa, foram usados na pasta `/data`.

## Como executar

Requisitos: Node.js (versão LTS).

```
npm install
```
Coloque `dataset1.txt` a `dataset7.txt` na pasta `data/` e rode:
```
npx tsx src/index.ts dataset1
npx tsx src/index.ts dataset2
npx tsx src/index.ts dataset3
npx tsx src/index.ts dataset4
npx tsx src/index.ts dataset5
npx tsx src/indexStream.ts dataset6
npx tsx src/indexStream.ts dataset7
```
- `index.ts`: leitura simples, usada nos datasets 1 a 5.
- `indexStream.ts`: leitura em streaming, necessária para os datasets 6 e 7 (grandes demais para a memória).
- `validate.ts`: compara com `data/respostas1.json` e `respostas2.json` (só datasets 1 e 2).

Os resultados são gravados na pasta `output/`.

Para validar (só os datasets 1 e 2, que têm gabarito):

```
npx tsx src/validate.ts 1
npx tsx src/validate.ts 2
```

## Estrutura

| Arquivo | Responsabilidade |
| ------- | ---------------- |
| `src/types.ts` | Tipos `Registro` e `Encontro` |
| `src/haversine.ts` | Distância entre dois pontos (R = 6.371.000 m) |
| `src/parser.ts` | Converte uma linha do `.txt` em `Registro` |
| `src/detector.ts` | Procura pares próximos e classifica o tipo do encontro |
| `src/stream.ts` | Lê o arquivo em streaming, processa por timestamp e grava o JSON |
| `src/index.ts` | Ponto de entrada da versão simples (datasets 1 a 5) |
| `src/indexStream.ts` | Ponto de entrada da versão em streaming (datasets 6 e 7) |
| `src/validate.ts` | Compara a saída com o gabarito (chave, distância) |

## Como funciona

1. Os registros são agrupados por timestamp exato; só se comparam posições do mesmo instante.
2. Em cada grupo, todos os pares (i < j) são comparados. O `i < j` garante que cada par aparece uma única vez.
3. A distância é calculada com Haversine (raio da Terra de 6.371.000 m). Há encontro se a distância for menor que 20 m.
4. O encontro é classificado:
    - **protetiva:** um é vítima e o outro está na lista `idsRestricaoMedida` dela;
    - **faccao:** os dois têm facção preenchida e igual;
    - **generico:** os demais pares em que nenhum é vítima.
5. Existem dois caminhos de execução, com a mesma lógica de detecção:
    - **Versão simples (`index.ts`):** lê o arquivo inteiro, agrupa com um `Map` por timestamp e detecta os encontros.
    - **Versão streaming (`indexStream.ts`):** lê o arquivo linha a linha (`readline`), processa cada timestamp assim que ele termina e grava cada encontro no JSON conforme é encontrado. A memória depende apenas do tamanho de um timestamp.


## Decisões de regra (validadas contra os gabaritos)

- Um par de facção gera apenas `faccao`, não também `generico`.
- Vítimas não entram em encontros `generico`; só em `protetiva`.
- Limite estrito: distância `< 20` (20 m exatos não é encontro).
- Timestamps são comparados por igualdade de texto; não há conversão para data.

## Desempenho

A versão streaming exige que o arquivo esteja ordenado por timestamp. O programa valida isso e encerra com erro se encontrar um timestamp fora de ordem.

| Dataset | Registros | Encontros | Tempo |
| ------- | --------- | --------- | ----- |
| dataset5 | 1.000.000 | 21 | 6,2 s |
| dataset6 | 8.000.000 | 0 | 22,1 s |
| dataset7 | 12.000.000 | 0 | 29,6 s |

Nota: no dataset7 (12.000.000 de registros) nenhum par ficou a menos de 20 m no mesmo timestamp, portanto `output/dataset7.json` contém um array vazio (`[]`). 
O arquivo foi lido por completo e a ordenação por timestamp foi validada.

Complexidade por timestamp: 0(k^2), com k = registros daquele instante.

## Validação

Os datasets 1 e 2 foram validados contra `respostas1.json` e `respostas2.json`:
mesmos encontros (tipo, par, timestamp), mesmas posições e distâncias com tolerância de 1e-9.

## Uso de IA  

Usei a IA (Claude) como apoio para tornar o processo menos desafiador: para me ajudar a estruturar o passo a passo do projeto, revisar erros de TypeScript e sugerir melhorias pontuais, como a abordagem de streaming para os datasets grandes. As regras de classificação (facção não gera também genérico, vítima não entra em genérico) foram descobertas por mim comparando minha saída com os gabaritos. Escrevi o código, corrigi os erros de digitação, e comparei os resultados dos datasets 1 e 2 com as respostas oficiais.
