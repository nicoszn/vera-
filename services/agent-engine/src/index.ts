import { db } from '@workspace/db';
import type { AgentTask } from '@workspace/db';
import { generateText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openRouterClient = createOpenAI({
  baseURL: 'https://openrouter.ai',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

function getCoreTools() {
  return {
    systemExecutor: tool({
      description: 'Allows execution of bash commands to check setups or edit files.',
      parameters: z.object({ command: z.string() }),
      execute: async ({ command }) => {
        const { execSync } = await import('child_process');
        try {
          return execSync(command, { timeout: 10000 }).toString();
        } catch(e: any) {
          return `Command execution failed: ${e.message}`;
        }
      }
    })
  };
}

async function processAgentTask(task: AgentTask) {
  await db.agentTask.update({ where: { id: task.id }, data: { status: 'RUNNING' } });
  
  let currentLogs = Array.isArray(task.logs) ? [...task.logs] : [];
  const appendLog = async (type: string, message: string) => {
    currentLogs.push({ type, message, timestamp: new Date().toISOString() });
    await db.agentTask.update({
      where: { id: task.id },
      data: { logs: currentLogs }
    });
  };

  try {
    await appendLog('info', `Initializing centralized Prisma 7 query layer.`);
    
    const result = await generateText({
      model: openRouterClient('anthropic/claude-3.5-sonnet'), 
      system: `You are an autonomous agent. Complete targets sequentially using your tools.`,
      prompt: task.objective,
      tools: getCoreTools(),
      maxSteps: 15,
      onStepFinish: async ({ text, toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          for (const call of toolCalls) {
            await appendLog('action', `Invoking tool: [${call.toolName}]`);
          }
        }
        if (text) {
          await appendLog('thought', `State update: ${text}`);
        }
      }
    });

    await db.agentTask.update({
      where: { id: task.id },
      data: { status: 'COMPLETED', output: result.text }
    });
    
  } catch (error: any) {
    await appendLog('error', `Fatal loop exit: ${error.message}`);
    await db.agentTask.update({ where: { id: task.id }, data: { status: 'FAILED' } });
  }
}

async function mainLoop() {
  console.log("Centralized backend tracking engine online.");
  while (true) {
    const nextTask = await db.agentTask.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });

    if (nextTask) {
      await processAgentTask(nextTask as AgentTask);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

mainLoop().catch(console.error);
