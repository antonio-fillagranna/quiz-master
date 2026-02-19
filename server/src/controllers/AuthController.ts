import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("❌ FATAL ERROR: JWT_SECRET não definida no arquivo .env");
}

export class AuthController {
  async register(req: Request, res: Response) {
    const { nome, email, senha } = req.body;
    try {
      const hashSenha = await bcrypt.hash(senha, 8);
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashSenha,
          role: 'PLAYER'
        }
      });
      return res.status(201).json({ id: usuario.id, nome: usuario.nome });
    } catch (e) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      SECRET_KEY!,
      { expiresIn: '1d' }
    );

    return res.json({
      usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role },
      token
    });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const authenticatedUserId = req.userId;
    const authenticatedUserRole = req.userRole;

    if (authenticatedUserRole !== 'ADMIN' && id !== authenticatedUserId) {
      return res.status(403).json({ error: "Você só pode editar seu próprio perfil." });
    }

    const { nome, senha, telefone } = req.body;

    try {
      const data: any = { nome, telefone };
      if (senha) data.senha = await bcrypt.hash(senha, 8);

      const usuario = await prisma.usuario.update({
        where: { id },
        data
      });
      return res.json(usuario);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar dados" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const authenticatedUserId = req.userId;
    const authenticatedUserRole = req.userRole;

    if (id !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return res.status(403).json({ error: "Você não tem permissão para remover este usuário." });
    }

    try {
      await prisma.usuario.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: "Erro ao remover conta" });
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
        },
        orderBy: { nome: 'asc' }
      });
      return res.json(usuarios);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao listar usuários" });
    }
  }

  async updateMe(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    try {
      const data: any = { nome, email };

      if (senha && senha.trim() !== "") {
        data.senha = await bcrypt.hash(senha, 10);
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id },
        data
      });

      return res.json({
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email
      });
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar seus dados" });
    }
  }
}