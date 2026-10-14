import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes.js";
import { prisma } from "./lib/prisma.js";
import { autenticar } from "./middleware/auth.js";

const app = express();

// 1. O CORS deve ser a PRIMEIRA coisa configurada, antes de qualquer rota
app.use(cors({
  origin: [
    'https://lista-tarefas-green-two.vercel.app', // Sua URL de produção (Frontend)
    'http://localhost:3000', // Localhost do frontend (React/Next)
    'http://localhost:5173'  // Localhost do frontend (Vite)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Configuração para ler JSON
app.use(express.json());

// 3. Suas rotas vêm DEPOIS do CORS
app.use("/auth", authRoutes);

// Todas as rotas abaixo exigem um JWT válido.
app.use("/tarefas", autenticar);

// Todas as rotas abaixo exigem um JWT válido.
app.use("/tarefas", autenticar);

// GET: listar somente as tarefas do usuário autenticado.
app.get("/tarefas", async (req, res) => {
    try {
        const tarefas = await prisma.tarefa.findMany({
            where: { userId: req.userId },
            orderBy: { id: "desc" },
        });

        return res.json(tarefas);
    } catch (error) {
        console.error("Erro ao listar tarefas:", error);
        return res.status(500).json({ erro: "Erro ao listar tarefas." });
    }
});

// POST: criar tarefa vinculada ao usuário autenticado.
app.post("/tarefas", async (req, res) => {
    const { titulo, completo } = req.body;

    if (typeof titulo !== "string" || !titulo.trim()) {
        return res.status(400).json({
            erro: "O título da tarefa é obrigatório.",
        });
    }

    try {
        const tarefa = await prisma.tarefa.create({
            data: {
                titulo: titulo.trim(),
                completo: completo ?? false,
                userId: req.userId,
            },
        });

        return res.status(201).json(tarefa);
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        return res.status(500).json({ erro: "Erro ao criar tarefa." });
    }
});

// PUT: atualizar somente uma tarefa pertencente ao usuário.
app.put("/tarefas/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { titulo, completo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID de tarefa inválido." });
    }

    if (titulo === undefined && completo === undefined) {
        return res.status(400).json({
            erro: "Informe o título ou o estado da tarefa.",
        });
    }

    const data = {};

    if (titulo !== undefined) {
        if (typeof titulo !== "string" || !titulo.trim()) {
            return res.status(400).json({ erro: "Título inválido." });
        }
        data.titulo = titulo.trim();
    }

    if (completo !== undefined) {
        if (typeof completo !== "boolean") {
            return res.status(400).json({ erro: "Estado da tarefa inválido." });
        }
        data.completo = completo;
    }

    try {
        const resultado = await prisma.tarefa.updateMany({
            where: { id, userId: req.userId },
            data,
        });

        if (resultado.count === 0) {
            return res.status(404).json({
                erro: "Tarefa não encontrada.",
            });
        }

        const tarefaAtualizada = await prisma.tarefa.findFirst({
            where: { id, userId: req.userId },
        });

        return res.json(tarefaAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return res.status(500).json({ erro: "Erro ao atualizar tarefa." });
    }
});

// DELETE: excluir somente uma tarefa pertencente ao usuário.
app.delete("/tarefas/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID de tarefa inválido." });
    }

    try {
        const resultado = await prisma.tarefa.deleteMany({
            where: { id, userId: req.userId },
        });

        if (resultado.count === 0) {
            return res.status(404).json({
                erro: "Tarefa não encontrada.",
            });
        }

        return res.json({ mensagem: "Tarefa removida com sucesso." });
    } catch (error) {
        console.error("Erro ao remover tarefa:", error);
        return res.status(500).json({ erro: "Erro ao remover tarefa." });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

export default app;