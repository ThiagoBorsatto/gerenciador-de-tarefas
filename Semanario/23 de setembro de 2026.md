# Aula 06 — Adicionando Autenticação e Segurança (Registro e Login) - 23/09/2026

## O que eu aprendi
Boas práticas para tratamento de entradas de login e senha, que é muito importante ter o controle das informações que estão entrando no sistema. Válidações para fazer com que o usuário mande um dado de uma forma mais controlada.
Ultilização de TOKEN para que o usuário possa realizar suas operações sem precisar ficar tento de provar sua autenticação a todo o momento, e também que as senhas dos usuários não devem ser mantidas como texto plano precisa ter o uso do HASH para que fique salvo no banco os dados mas que se foram vazados não seja possivel fazer nada com eles sem ter a chave para desfazer o HASH.

## Principal dificuldade
O desafio dessa semana foi tranquilo.

## Como eu resolvi
Só quando eu cópiei os teste para o requests.http acabei quebrando teste pelo comentario ficou como HEADER, assim o teste mão rodou, mas foi apenas arrumar a linha que tinha ficado fora do lugar e o teste voltou a funcionar.

## Observações (opcional)
O uso do TOKEN é algo bem interessante, mas para entender melhor vou ter que dar uma olhada por fora, que nesse momento oque foi feito não revelou muitos detalhes.