import fs from 'fs';
import path from 'path';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { sql } from 'drizzle-orm';

import { initLocalDatabase, LocalDatabaseStorage, getLocalDb } from '../server/localDB';
import * as schema from '@shared/schema';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'roguesim_local.db');

describe('LocalDatabaseStorage persistence', () => {
  beforeAll(async () => {
    if (fs.existsSync(DB_PATH)) {
      fs.rmSync(DB_PATH, { force: true });
    }
    if (fs.existsSync(DATA_DIR)) {
      const entries = fs.readdirSync(DATA_DIR);
      if (entries.length === 0) {
        fs.rmdirSync(DATA_DIR);
      }
    }

    await initLocalDatabase();
  });

  beforeEach(async () => {
    const db = getLocalDb();
    if (db) {
      await db.run(sql`DELETE FROM game_data`);
      await db.run(sql`DELETE FROM user_activity_logs`);
      await db.run(sql`DELETE FROM users`);
    }
  });

  test('saveGameData persists and returns structured data', async () => {
    const storage = new LocalDatabaseStorage();

    const db = getLocalDb();
    await db.run(sql`
      INSERT INTO users (id, hacker_name, email, password, created_at, updated_at)
      VALUES (${ 'user-123' }, ${ 'TestUser123' }, ${ 'user123@example.com' }, ${ 'hashed' }, ${ new Date().toISOString() }, ${ new Date().toISOString() })
    `);

    await storage.saveGameData('user-123', {
      credits: 900,
      playerLevel: 4,
      unlockedCommands: ['help', 'scan'],
      completedMissions: ['mission-1'],
      skillTree: { hacking: 2 },
      factionStandings: { rogue: 10 },
      psychProfile: { alignment: 'neutral' },
    });

    const record = await storage.getGameData('user-123');

    expect(record).toBeTruthy();
    expect(record?.credits).toBe(900);
    expect(record?.playerLevel).toBe(4);
    expect(record?.unlockedCommands).toEqual(['help', 'scan']);
    expect(record?.completedMissions).toEqual(['mission-1']);
  });

  test('logUserActivity writes entries when schema tables exist', async () => {
    const storage = new LocalDatabaseStorage();

    const db = getLocalDb();
    await db.run(sql`
      INSERT INTO users (id, hacker_name, email, password, created_at, updated_at)
      VALUES (${ 'user-456' }, ${ 'Tester' }, ${ 'tester@example.com' }, ${ 'hashed' }, ${ new Date().toISOString() }, ${ new Date().toISOString() })
    `);

    await storage.logUserActivity('user-456', 'Tester', 'LOGIN', { ip: '127.0.0.1' });

    const rows = await db.select().from(schema.userActivityLogs);

    expect(rows.length).toBe(1);
    expect(rows[0].action).toBe('LOGIN');
    expect(rows[0].username).toBe('Tester');
  });
});
