import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { execSync } from "child_process";

export const mcpServer = new McpServer({
  name: "RailwaySystemMcp",
  version: "1.0.0"
});

// System Command Execution Skill
mcpServer.tool(
  "executeSystemCommand",
  "Executes shell configuration scripts safely inside the containment zone.",
  { command: z.string().describe("The clean installation or diagnostic shell command string to process.") },
  async ({ command }) => {
    try {
      const output = execSync(command, { timeout: 15000 }).toString();
      return { content: [{ type: "text", text: output }] };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  }
);
