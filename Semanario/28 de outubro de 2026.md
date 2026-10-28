[← Semana anterior](21%20de%20outubro%20de%202026.md) · [↑ Voltar ao README](../README.md#semanário)

# Aula 08 — Laboratório Prático: Gerenciador de Tarefas (28/10/2026)

## O que eu aprendi
Momento 1: não teve algo que já não tinhamos visto dentro da diciplina, então foi bem tranquilo.
Momento 2: foi mais interessante por ter que descrobir como completar o código, principalmente o authHeaders() que diz para o servidor que está fazendo a requisição, serve como uma indentificação para que fez a chamada.

## Principal dificuldade
Novamente como o contéudo é algo que vimos anteriormente não tive muitas difículdades.
Única coisa que me atrapalhei foi um comentário da missão 1 que o professor colocou dentro da tag do button, e eu demorei para intender que era isso que estava dando erro.

## Como eu resolvi
Apenas removi o objeto com o coméntario dentro e assim ficou certo.

## Observações (opcional)
Acho que essa tarefa foi muito tranquila peli tempo que foi disponibilizado para a realização.

## Perguntas:
● Pergunta A: O que acontece na tela do React se tentarmos usar uma variável
comum em vez do useState para guardar dados que devem aparecer na
interface?
Nesse caso o React não tem como saber se algum dos dados da tela foi alterado, então se tivermos uma váriavel que muda a cada segundo sem o useState na tela nada vai mudar, mesmo que no backend o dado está se atualizando.
E sempre que tiver um refresh o valor da varialvel seá perdido.

● Pergunta B: Por que o formulário do Login recarregava a página inteira, e como o
type="button" resolveu esse problema?
Todo o botão que não tem um tipo definido dentro do form por padrão acabava funcionando como um submit do forms assim sempre que era clicado tentava enviar e dava refresh na tela.

● Pergunta C: No Momento 1, você alterou classes do Tailwind CSS. Na sua
opinião, qual a principal vantagem de usar o Tailwind em vez de um arquivo .css
tradicional?
Não precisar ficar cuidando de arquivo externo, posso fazer direto no ponto do código que preciso, sendo mais fácil controlar o estilo que eu quero.

---

[← Semana anterior](21%20de%20outubro%20de%202026.md) · [↑ Voltar ao README](../README.md#semanário)
