import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createSchema('components').execute()
    await db.schema
        .createType('components.component_type')
        .asEnum(['text', 'button', 'image', 'video', 'audio', 'accordion'])
        .execute()

    await db.schema
        .createTable('components.component')
        .addColumn('id', 'uuid', (col) =>
            col
                .primaryKey()
                .notNull()
                .defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('type', sql`components.component_type`, (col) =>
            col.notNull()
        )
        .addColumn('page_id', 'uuid', (col) =>
            col.notNull().references('structure.page.id').onDelete('cascade')
        )
        .addColumn('content', 'jsonb', (col) => col.notNull())
        .addColumn('asset_id', 'uuid', (col) =>
            col
                .references('media.media_asset.id')
                .check(
                    sql`type NOT IN ('image', 'video', 'audio') OR asset_id IS NOT NULL`
                )
        )
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz')
        .execute()

    await db.schema
        .createTable('components.component_position')
        .addColumn('component_id', 'uuid', (col) =>
            col
                .notNull()
                .primaryKey()
                .references('components.component.id')
                .onDelete('cascade')
        )
        .addColumn('grid_x', 'integer', (col) => col.notNull())
        .addColumn('grid_y', 'integer', (col) => col.notNull())
        .addColumn('grid_width', 'integer', (col) => col.notNull())
        .addColumn('grid_height', 'integer', (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('components.component_position').execute()
    await db.schema.dropTable('components.component').execute()
    await db.schema.dropType('components.component_type').execute()
    await db.schema.dropSchema('components').execute()
}
