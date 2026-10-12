import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";
import { gerarToken } from "./utils/jwt.js";

const router = Router();

// Cadastro
router.post("/register", async (req, res) => {
    const email = typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password = req.body.password;

    if (!email || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            erro: "Informe um email válido e uma senha com pelo menos 8 caracteres.",
        });
    }

    try {
        const usuarioExiste = await prisma.user.findUnique({
            where: { email },
        });

        if (usuarioExiste) {
            return res.status(409).json({
                erro: "Este email já está cadastrado.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const usuario = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
            },
            select: {
                id: true,
                email: true,
            },
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso.",
            usuario,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Este email já está cadastrado.",
            });
        }

        console.error("Erro no cadastro:", error);
        return res.status(500).json({
            erro: "Não foi possível cadastrar o usuário.",
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    const email = typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password = req.body.password;

    if (!email || typeof password !== "string" || !password) {
        return res.status(400).json({
            erro: "Informe email e senha.",
        });
    }

    try {
        const usuario = await prisma.user.findUnique({
            where: { email },
        });

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({
                erro: "Email ou senha incorretos.",
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET não está configurado.");
            return res.status(500).json({
                erro: "Autenticação não configurada no servidor.",
            });
        }

        const token = gerarToken(usuario.id);

        return res.status(200).json({
            token,
            tipo: "Bearer",
            expiraEm: 3600,
            usuario: {
                id: usuario.id,
                email: usuario.email,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({
            erro: "Não foi possível fazer login.",
        });
    }
});

export default router;