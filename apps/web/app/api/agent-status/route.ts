import { NextResponse } from 'next/server';
import { db } from '@workspace/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

    const task = await db.agentTask.findUnique({
      where: { id: taskId },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
