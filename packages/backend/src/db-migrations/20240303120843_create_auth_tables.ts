import type { Kysely } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await db.schema.createSchema("auth").execute();

  await db.schema
    .createTable("auth.auth_user")
    .addColumn("id", "uuid", (col) => col.primaryKey().notNull())
    .addColumn("username", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("auth.oauth_account")
    .addColumn("provider_id", "varchar", (col) => col.notNull())
    .addColumn("provider_user_id", "varchar", (col) => col.notNull())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("auth.auth_user.id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("oAuthAccountPrimaryKey", [
      "provider_id",
      "provider_user_id",
    ])
    .execute();

  await db.schema
    .createTable("auth.user_session")
    .addColumn("id", "varchar(40)", (col) => col.primaryKey().notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("auth.auth_user.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable("auth.user_session").execute();
  await db.schema.dropTable("auth.oauth_account").execute();
  await db.schema.dropTable("auth.auth_user").execute();
  await db.schema.dropSchema("auth").execute();
}
