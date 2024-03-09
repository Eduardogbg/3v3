import { Database } from 'bun:sqlite'

const db = Database.open('test.db')

const SCHEMA_PATH = 'migrations/schema.sql'
const MIGRATIONS_PATH = 'migrations'

async function initialMigration() {
    const schema = await Bun.file(SCHEMA_PATH).text()
    db.exec(schema)

    db.exec(await Bun.file(`${MIGRATIONS_PATH}/0000_players.sql`).text())
}

function checkDbInitialized(): boolean {
    // FIXME: use an actual migration system?
    // @ts-expect-error
    const tablesCount = db.query("select count(*) as count from sqlite_master where type='table'").get().count as number;

    return tablesCount > 0
}

export async function getDbInstance(): Promise<Database> {
    console.log('???', checkDbInitialized())
    if (!checkDbInitialized()) {
        await initialMigration()

        // FIXME: REMOVE
        await import('./scripts/migrate_csv')
    }

    return db
}
