# Aula 05 — Segurança das rotas de escrita (16/09/2026)

## O que eu aprendi
Arquitetura: os helpers ficam no topo do arquivo e as rotas só chamam eles, isso me ajudou bastante, se eu precisar mudar uma URL ou rota se ele usar essa arquitetura eu posso trocar bem mais fácil.
Também aprendi a diferenciar o 400 do 500 no catch. O erro de validação volta a mensagem pro cliente, o erro de banco volta uma mensagem genérica, sem vazar detalhe nenhum da estrutura das tabelas.

## Principal dificuldade
Aconteceram duas coisas. A primeira foi que a rota PATCH ficou sem o começo inteiro, e o código ficou quebrado assim não conseguia rodar. A segunda foi que sobrou um pedaço da versão antiga do PUT solto fora de qualquer rota, usando variáveis que nem existiam mais naquele escopo.

## Como eu resolvi
Conferindo o arquivo e oque eu tenho no local consegui achar a parte que faltou, depois foi só cópiar e colar.

## Observações (opcional)
Nada pra hoje também.