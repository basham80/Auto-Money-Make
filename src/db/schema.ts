import { pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relational Ledger Events table
export const ledgerRecords = pgTable('ledger_records', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  asset: text('asset').notNull().default('SOL'),
  grossAmount: doublePrecision('gross_amount').notNull().default(0),
  feeAmount: doublePrecision('fee_amount').notNull().default(0),
  netAmount: doublePrecision('net_amount').notNull().default(0),
  truthClass: text('truth_class').notNull().default('PENDING'),
  verificationStatus: text('verification_status').notNull().default('PENDING_VERIFICATION'),
  transactionSignature: text('transaction_signature'),
  destinationWallet: text('destination_wallet'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Events table
export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(),
  level: text('level').notNull().default('INFO'),
  category: text('category').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Treasury Snapshots table
export const treasurySnapshots = pgTable('treasury_snapshots', {
  id: serial('id').primaryKey(),
  balanceSol: doublePrecision('balance_sol').notNull().default(0),
  realizedProfitSol: doublePrecision('realized_profit_sol').notNull().default(0),
  lifetimeRevenueSol: doublePrecision('lifetime_revenue_sol').notNull().default(0),
  lifetimeCostSol: doublePrecision('lifetime_cost_sol').notNull().default(0),
  destinationWallet: text('destination_wallet'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, () => ({}));
