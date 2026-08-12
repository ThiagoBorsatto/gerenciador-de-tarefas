import express from "express";

const app = express();
const PORT = 3000;

// Rota de integridade do sistema (Health Check)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor do Gestor de Tarefas ativo!"});
});

app.listen(PORT, () => {
    console.log(`Servido rodando em: http://localhost:${PORT}`);
});