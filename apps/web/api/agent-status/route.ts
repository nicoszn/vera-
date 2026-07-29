import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const task = await prisma.agentTask.findUnique({
    where: { id: taskId },
  });

  return NextResponse.json(task);
}
