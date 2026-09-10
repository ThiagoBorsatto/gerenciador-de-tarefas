# Aula 01 — Começo da sanitização do código (09/09/2026)

## O que eu aprendi
O uso de centralizadores para facilitar a manutenção do código, onde nos tinhamos as declarações em diferentes parte do código para representar a mesma coisa, tendo muitas repetições, então as prioridades das tarefas foi passado de algo que tinha que ser sempre reescrito para uma variável.
A tratativa de erros e algo que eu não tinha parado para pensar sobre, já destemunhei casos que o sistema recebia em seus parâmetros valores indevidos e o servido retornava o erro inteiro do banco para o usuário, com todas as informações das colunas relacionadas aquela função.

## Principal dificuldade
Entender a lógica da validação do que os dois novos testes passam, primeiramente entendi que os mesmos não deveriam passar, achei que o código tinha algum erro, mas o novo desenho da /api/tasks era para deixar os dois testes passarem.

## Como eu resolvi
Investiguei o próprio código do endpoint /api/tasks para entende o mótivo que os testes tinha o retorno da lista com as infomações.
A resposta esta nessa parte: 
    const search = typeof req.query.search === "string" ? req.query.search : "";
Onde o dois testes caíam na segunda parte do código.

## Observações (opcional)
Hoje nenhuma.