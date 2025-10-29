import knex, { type Knex } from 'knex';
import { log } from './utils';

const MIGRATION_TABLE = 'roguesim_knex_migrations';

type Migration = {
    id: string;
    run: (db: Knex | Knex.Transaction) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
    {
        id: '20250214120000_add_admin_flags',
        run: async (db) => {
            const hasBanned = await db.schema.hasColumn('users', 'is_banned');
            if (!hasBanned) {
                log('Adding users.is_banned column via knex migration', 'db');
                await db.schema.alterTable('users', (table) => {
                    table.boolean('is_banned').notNullable().defaultTo(false);
                });
            }

            const hasTestUser = await db.schema.hasColumn('users', 'is_test_user');
            if (!hasTestUser) {
                log('Adding users.is_test_user column via knex migration', 'db');
                await db.schema.alterTable('users', (table) => {
                    table.boolean('is_test_user').notNullable().defaultTo(false);
                });
            }
        },
    },
];

export async function runDatabaseMigrations(connectionString: string): Promise<void> {
    if (!connectionString) {
        log('Skipping knex migrations: no DATABASE_URL configured', 'db');
        return;
    }

    const db = knex({
        client: 'pg',
        connection: connectionString,
        pool: { min: 0, max: 1 },
        migrations: { tableName: MIGRATION_TABLE },
    });

    try {
        const hasTable = await db.schema.hasTable(MIGRATION_TABLE);
        if (!hasTable) {
            await db.schema.createTable(MIGRATION_TABLE, (table) => {
                table.string('id').primary();
                table.timestamp('executed_at').notNullable().defaultTo(db.fn.now());
            });
        }

        const applied = await db<{ id: string }>(MIGRATION_TABLE).select('id');
        const appliedIds = new Set(applied.map((row) => row.id));

        for (const migration of MIGRATIONS) {
            if (appliedIds.has(migration.id)) {
                continue;
            }

            log(`Running knex migration ${migration.id}`, 'db');
            await db.transaction(async (trx) => {
                await migration.run(trx);
                await trx(MIGRATION_TABLE).insert({ id: migration.id });
            });
            log(`Completed knex migration ${migration.id}`, 'db');
        }
    } catch (error) {
        log(`Knex migration failure: ${(error as Error).message}`, 'error');
        throw error;
    } finally {
        await db.destroy();
    }
}
