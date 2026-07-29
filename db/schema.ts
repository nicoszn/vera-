import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const agentTasks = pgTable('agent_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  objective: text('objective').notNull(),
  status: text('status').default('PENDING').notNull(), // PENDING, RUNNING, COMPLETED, FAILED
  logs: jsonb('logs').$type<Array<{type: string; message: string; timestamp: string}>>().default([]).notNull(),
  output: text('output'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type NewAgentTask = typeof agentTasks.$inferInsert;
