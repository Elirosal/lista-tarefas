import "dotenv/config";
import express from 'express';
import cors from 'cors';


import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';



const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const app = express();

app.use(cors());
app.use(express.json());



// cria rota GET / Lista de Tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await prisma.tarefa.findMany();
    res.json(tarefas);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro no servidor!');
  }
});

// cria rota POST / Adiciona uma nova tarefa
app.post('/tarefas', async (req, res) => {
    const { titulo, completo } = req.body;

    if (!titulo) {
        return res.status(400).json({ error: 'O campo "titulo" é obrigatório.' });
    }

    try {
        const tarefa = await prisma.tarefa.create({
            data: {
                titulo,
                completo: completo || false
            }
        });
        res.status(201).json(tarefa);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar a tarefa no servidor!');
    }
});
 
// cria rota PUT / Atualiza uma tarefa existente
app.put('/tarefas/:id', async (req, res) => {
    const idParam = parseInt(req.params.id);
    const { titulo, completo } = req.body;

    if (titulo === undefined && completo === undefined) {
        return res.status(400).json({ error: 'Pelo menos um campo (titulo ou completo) deve ser fornecido para atualização.' });
    }

    try {
        const tarefaAtualizada = await prisma.tarefa.update({
            where: { id: idParam },
            data: {
                titulo,
                completo
            }
        });
        res.json(tarefaAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar a tarefa no servidor!');
    }
});
   
    
// cria rota DELETE / Remove uma tarefa existente
app.delete('/tarefas/:id', async (req, res) => {
    const { id } =req.params;

    try {
        await prisma.tarefa.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            message: `Tarefa com ID ${id} removida com sucesso!`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao remover a tarefa no servidor!');
    }
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ocorreu um erro no servidor!');
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});