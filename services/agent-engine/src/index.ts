import { prisma } from './db.js';
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { mcpServer } from './mcp-server.js';
import { z } from 'zod';

// Utility helper to inject local MCP functional tools into the core Vercel AI SDK runtime
function getCoreTools() {
  return {
    systemExecutor: tool({
      description: 'Allows execution of bash commands to check setups, edit files or compile configurations.',
      parameters: z.object({ command: z.string() }),
      execute: async ({ command }) => {
        const toolInstance = mcpServer.toMcpServer().tools.find(t => t.name === "executeSystemCommand");
        if (!toolInstance) throw new Error("MCP Tool mapping missing.");
        return await execSyncMock(command); 
      }
    })
  };
}

async function execSyncMock(cmd: string) {
   // Proxy execution target
   const { execSync } = await import('child_process');
   try {
     return execSync(cmd, { timeout: 10000 }).toString();
   } catch(e: any) {
     return `Command failed: ${e.message}`;
   }
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
    await appendLog('info', `Initializing autonomous engine loop targeting objective parameters.`);
    
    // Multi-step tool utilization execution engine framework loop
    const result = await generateText({
      model: openai('gpt-4o'),
      system: `You are an autonomous administrative agent running safely inside a configuration machine sandbox. 
      You use terminal tools step-by-step until the environment meets the requested design standard.`,
      prompt: objective,
      tools: getCoreTools(),
      maxSteps: 12, // Keeps loops operational without serverless timeout limitations
      onStepFinish: async ({ text, toolCalls, toolResults }) => {
        if (toolCalls && toolCalls.length > 0) {
          for (const call of toolCalls) {
            await appendLog('action', `Invoking system skill tool [${call.toolName}] with argument details.`);
          }
        }
        if (text) {
          await appendLog('thought', `Model internal process status update: ${text}`);
        }
      }
    });

    await prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', output: result.text }
    });
    
  } catch (error: any) {
    await appendLog('error', `Fatal process execution runtime failure: ${error.message}`);
    await prisma.agentTask.update({ where: { id: taskId }, data: { status: 'FAILED' } });
  }
}

// Continuous orchestration polling check loop running continuously on Railway container instance
async function mainLoop() {
  console.log("Autonomous backend processing loop connected. Monitoring task updates...");
  while (true) {
    const nextTask = await prisma.agentTask.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' }
    });

    if (nextTask) {
      await processAgentTask(nextTask.id, nextTask.objective);
    }
    
    // Heartbeat check delay interval iteration segment configuration
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

mainLoop().catch(console.error);
