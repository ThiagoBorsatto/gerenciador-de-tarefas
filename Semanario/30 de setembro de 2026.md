[← Semana anterior](23%20de%20setembro%20de%202026.md) · [↑ Voltar ao README](../README.md#semanário)

# Aula 07 — Protegendo rotas com JWT e isolamento de usuários (30/09/2026)

## O que eu aprendi
Autenticação e autorização são coisas diferentes. Autenticar é saber quem o usuário é (o token do login). Autorizar é deixar ele mexer só no que é dele.
Middleware: é uma função com a forma (req, res, next) que roda antes da rota. Se chama next(), a requisição segue. Se devolve 401, a rota nem executa. Assim a verificação do token fica em um lugar só, sem repetir código em cada rota.

## Principal dificuldade
Depois de aplicar a apostila, o servidor nem subia. Aparecia o erro:

    The requested module 'express' does not provide an export named 'NextFunction'

O tsc também reclamava de duas coisas:

## Como eu resolvi
Resolvi marcando os três como tipo:

    import express, { type Request, type Response, type NextFunction } from "express";

## Observações (opcional)
Testei com dois usuários: um não consegue ver, editar nem apagar a tarefa do outro, e sem token a resposta é sempre 401.

---

[← Semana anterior](23%20de%20setembro%20de%202026.md) · [↑ Voltar ao README](../README.md#semanário)
