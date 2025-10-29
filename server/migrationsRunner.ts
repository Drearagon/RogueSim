import knex, { type Knex } from 'knex';
import { log } from './utils';

const MIGRATION_TABLE = 'roguesim_knex_migrations';
const USERS_TABLE = 'users';

type AdminAlterTableBuilder = Knex.AlterTableBuilder;

const ADMIN_COLUMN_DEFINITIONS = {
    is_banned: (table: AdminAlterTableBuilder) =>
        table.boolean('is_banned').notNullable().defaultTo(false),
    is_test_user: (table: AdminAlterTableBuilder) =>
        table.boolean('is_test_user').notNullable().defaultTo(false),
} as const;

type AdminColumnName = keyof typeof ADMIN_COLUMN_DEFINITIONS;

type Migration = {
    id: string;
    kind: 'admin-columns';
    columns: AdminColumnName[];
};

const MIGRATIONS: Migration[] = [
    {
        id: '20250214120000_add_admin_flags',
        kind: 'admin-columns',
        columns: ['is_banned', 'is_test_user'],
    },
];

function assertAdminColumn(column: string): asserts column is AdminColumnName {
    if (!(column in ADMIN_COLUMN_DEFINITIONS)) {
        throw new Error(`Knex migrations may not modify column "${column}"`);
    }
}

async function getMissingAdminColumns(
    db: Knex,
    columns: AdminColumnName[],
): Promise<AdminColumnName[]> {
    const uniqueColumns = Array.from(new Set(columns));
    const missing: AdminColumnName[] = [];

    for (const column of uniqueColumns) {
        assertAdminColumn(column);
        const hasColumn = await db.schema.hasColumn(USERS_TABLE, column);
        if (!hasColumn) {
            missing.push(column);
        }
    }

    return missing;
}

async function addAdminColumns(
    trx: Knex.Transaction,
    columns: AdminColumnName[],
): Promise<void> {
    if (columns.length === 0) {
        return;
    }

    await trx.schema.alterTable(USERS_TABLE, (table: AdminAlterTableBuilder) => {
        for (const column of columns) {
            assertAdminColumn(column);
            ADMIN_COLUMN_DEFINITIONS[column](table);
        }
    });
}

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
            await db.schema.createTable(MIGRATION_TABLE, (table: Knex.CreateTableBuilder) => {
                table.string('id').primary();
                table.timestamp('executed_at').notNullable().defaultTo(db.fn.now());
            });
        }

        const applied = await db<{ id: string }>(MIGRATION_TABLE).select('id');
        const appliedIds = new Set(applied.map(({ id }) => id));

        for (const migration of MIGRATIONS) {
            if (appliedIds.has(migration.id)) {
                continue;
            }

            switch (migration.kind) {
                case 'admin-columns': {
                    const missingColumns = await getMissingAdminColumns(db, migration.columns);

                    if (missingColumns.length === 0) {
                        log(
                            `Skipping knex migration ${migration.id}: admin columns already exist (likely created by Drizzle)`,
                            'db',
                        );
                        continue;
                    }

                    log(
                        `Running knex migration ${migration.id} for columns: ${missingColumns.join(', ')}`,
                        'db',
                    );
                    await db.transaction(async (trx: Knex.Transaction) => {
                        await addAdminColumns(trx, missingColumns);
                        await trx(MIGRATION_TABLE).insert({ id: migration.id });
                    });
                    log(`Completed knex migration ${migration.id}`, 'db');
                    break;
                }
                default: {
                    throw new Error(`Unsupported knex migration kind: ${(migration as { kind: string }).kind}`);
                }
            }
        }
    } catch (error) {
        log(`Knex migration failure: ${(error as Error).message}`, 'error');
        throw error;
    } finally {
        await db.destroy();
    }
}
