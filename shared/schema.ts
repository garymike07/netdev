import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const networkTools = pgTable("network_tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  icon: text("icon"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toolResults = pgTable("tool_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolName: text("tool_name").notNull(),
  userId: varchar("user_id"),
  parameters: jsonb("parameters"),
  results: jsonb("results"),
  status: text("status").notNull().default("completed"),
  executionTime: integer("execution_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const networkEvents = pgTable("network_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  source: text("source"),
  metadata: jsonb("metadata"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNetworkToolSchema = createInsertSchema(networkTools).omit({
  id: true,
  createdAt: true,
});

export const insertToolResultSchema = createInsertSchema(toolResults).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkEventSchema = createInsertSchema(networkEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type NetworkTool = typeof networkTools.$inferSelect;
export type InsertNetworkTool = z.infer<typeof insertNetworkToolSchema>;

export type ToolResult = typeof toolResults.$inferSelect;
export type InsertToolResult = z.infer<typeof insertToolResultSchema>;

export type NetworkEvent = typeof networkEvents.$inferSelect;
export type InsertNetworkEvent = z.infer<typeof insertNetworkEventSchema>;
