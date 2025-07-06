// packages/backend/src/index.ts
import express,{ Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, User } from '@prisma/client';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL;

let defaultUser: User | null = null;

app.get('/api/projects', async (req: Request, res: Response) => {
    if (!defaultUser) {
      // 先发送响应
      res.status(503).json({ error: 'Default user not ready' });
      // 然后用一个空的 return 来终止函数
      return;
    }
    const projects = await prisma.project.findMany({
      where: { userId: defaultUser.id },
      orderBy: { createdAt: 'desc' },
    });
    // 在函数末尾，只需要发送响应即可，不需要 return
    res.json(projects);
  });

app.post('/api/projects', async (req: Request, res: Response) => {
    if (!defaultUser) {
        res.status(503).json({ error: 'Default user not ready' });
        return;
    }
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
    }

    try {
        const difyResponse = await axios.post(
            `${DIFY_API_BASE_URL}/knowledge-bases`,
            { name },
            { headers: { Authorization: `Bearer ${DIFY_API_KEY}` } }
        );
        const knowledgeBaseId = difyResponse.data.id;

        const newProject = await prisma.project.create({
            data: {
                name,
                difyKnowledgeBaseId: knowledgeBaseId,
                userId: defaultUser.id,
            },
        });

        res.status(201).json(newProject);
    } catch (error: any) {
        console.error('Error creating project:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

const PORT = 3001;

async function startServer() {
    try {
        defaultUser = await prisma.user.findUnique({
            where: { email: 'admin@yourdomain.com' },
        });

        if (!defaultUser) {
            console.error('FATAL: Default admin user "admin@yourdomain.com" not found.');
            process.exit(1);
        }

        console.log(`✅ Default admin user loaded: ${defaultUser.email}`);
        app.listen(PORT, () => console.log(`🚀 Backend server running on http://localhost:${PORT}`));
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();