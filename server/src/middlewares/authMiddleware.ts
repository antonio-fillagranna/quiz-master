import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("❌ FATAL ERROR: JWT_SECRET não definida no arquivo .env");
}

interface TokenPayload {
  id: string;
  role: 'ADMIN' | 'PLAYER';
  iat: number;
  exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authorization.replace('Bearer', '').trim();

  try {
    const decoded = jwt.verify(token, SECRET_KEY!);
    const data = (decoded as unknown) as TokenPayload;

    req.userId = data.id;
    req.userRole = data.role;

    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Acesso negado: permissão insuficiente" });
    }
    return next();
  };
}