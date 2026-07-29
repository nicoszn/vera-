import { prisma } from './db.js';
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
      // Refactored: Leverages strict Zod 4 type schema evaluations
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

async function processAgentTask(taskId: string, objective: string) {
  await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'RUNNING' } });
  
  let currentLogs: any[] = [];
  const appendLog = async (type: string, message: string) => {
    currentLogs.push({ type, message, timestamp: new Date().toISOString() });
    await prisma.agentTask.update({
      where: { id: taskId },
      data: { logs: currentLogs }
    });
  };

  try {
    await appendLog('info', `Initializing AI SDK 7 process agent loop.`);
    
    const result = await generateText({
      model: openRouterClient('anthropic/claude-3.5-sonnet'), 
      system: `You are an autonomous administrative agent. Complete instructions sequentially using tools.`,
      prompt: objective,
      tools: getCoreTools(),
      maxSteps: 15,
      onStepFinish: async ({ text, toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          for (const call of toolCalls) {
            await appendLog('action', `Invoking: [${call.toolName}]`);
          }
        }
        if (text) {
          await appendLog('thought', `Analysis update: ${text}`);
        }
      }
    });

    await prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', output: result.text }
    });
    
  } catch (error: any) {
    await appendLog('error', `Process failure: ${error.message}`);
    await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'FAILED' } });
  }
}

async function mainLoop() {
  console.log("Autonomous core online. Monitoring tasks...");
  while (true) {
    const nextTask = await prisma.agentTask.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });

    if (nextTask) {
      await processAgentTask(nextTask.id, nextTask.objective);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

mainLoop().catch(console.error);
