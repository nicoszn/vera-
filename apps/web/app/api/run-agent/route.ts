import { NextResponse } from 'next/server';
import { db } from '@workspace/db';

export async function POST(req: Request) {
  try {
    const { objective } = await req.json();
    if (!objective) return NextResponse.json({ error: "Objective missing" }, { status: 400 });

    const task = await db.agentTask.create({
      data: { objective, status: "PENDING" },
    });

    return NextResponse.json({ taskId: task.id, status: task.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
