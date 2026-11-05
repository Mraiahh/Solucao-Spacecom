#Detecção de Encontros

Algoritmo em TypeScript (Node.js) que processa dados de geolocalização e detecta encontros físicos 
entre monitorados (tornozeleiras) e v´timas de medidas protetivas.

## Como executar

Requisitos: Node.js [versão, ex.: 24].

```
npm install 
npm tsx src/index.ts dataset1 #gera output/dataset1.json
npm tsx src/validade.ts 1     #compara com data/respostas1.json (só datasets 1 e 2)
```

Os arquivos de entrada ficam em `data/`e os JSONs gerados na pasta `output/`.

## Estrutura

| Arquivo | Responsabilidade |
| ------- | ---------------- |
| `src/types.ts` | Tipos `Registro` e `Encontro` |
| `src/haversine.ts` | Distância entre dois pontos (R = 6.371.000 m) |
| `src/parser.ts` | Converte uma linha do `.txt` em `Registro` |
| `src/detector.ts` | Procura pares próximos e classifica o tipo do encontro |
| `src/stream.ts` | Lê o arquivo em streaming, processa por timestamp e grava o JSON |
| `src/index.ts` | Ponto de entrada |
| `src/validate.ts` | Compara a saída com o gabarito (chave, distância) |

## Como funciona

1. O arquivo é lido linha a linha (`readline`), sem carregar tudo na memória.
2. Os registros são agrupados por timestamp exato; só se comparam posições do mesmo instante.
3. Em cada grupo, todos os pares (i < j) são comparado. O `i < j` garante que cada par aparece uma única vez.
4. A distância é calculada com Haversine. Há encontro se a distância for menor que 20m.
5. O encontro é classificado:
    - PROTETIVA: um é vítima e o outro está na lista `idsRestricaoMedida` dela;
    - FACCAO: os dois têm facção preenchida e igual;
    - GENERICO: os demais pares em que nenhum é vítima.
6. Cada encontro é gravado no JSON assim que é encontrado.

## Decisões de regra (validadas contra os gabaritos)

- Um par de facção gera apenas `faccao`, não também `generico`.
- Vítimas não entram em encontros `generico`; só em `protetiva`.
- Limite estrito: distância `< 20` (20m exatos não é encontro).
- Timestamps são comparados por igualdade de texto; não há conversão para data.

## Desempenho

O arquivo precisa estar ordenado por timestamp. O programa valida isso e encerra com erro se não estiver.
Por causa do streaming, a memória depende apenas do tamanho de um timestamp.

| Dataset | Registros | Encontros | Tempo |
| ------- | --------- | --------- | ----- |
| dataset5 | 1.000.000 | 21 | [3,6 s] |
| dataset6 | [..] | [..] | [..] |
| dataset7 | [..] | [..] | [..] |

Complexidade por timestamp: 0(k^2), com k = registros daquele instante.

## Validação

Os datasets 1 e 2 foram validados contra `respostas1.json` e `respostas.json`:
mesmos encontros (tipo, par, timestamp), mesmas posições e distâncias com tolerância de 1e-9.

## Uso de IA  

Usei a IA (Claude) como apoio para tornar o processo menos desafiador, pedindo auxílio para estruturação de cada etapa 
e a ordem que deveria seguir (passo a passo), na revisão de erros de TypeScript e no caso de melhorias pontuais, 
como no caso do streaming. Escrevi o código sempre conferindo a lógica e validei os resultados na comparação com os gabaritos. 