"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/prisma.config.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.default = prisma;
