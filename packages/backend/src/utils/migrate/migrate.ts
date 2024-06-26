import { promises as fs } from "node:fs";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  NO_MIGRATIONS,
  PostgresDialect,
} from "kysely";
import type { DB } from "kysely-codegen";
import pg from "pg";
const { Pool } = pg;
const __filename = fileURLToPath(import.meta.resolve("../../db-migrations"));
const __dirname = dirname(__filename);

const kyselyDB = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: "postgres://postgres@localhost:15432/archtika",
    }),
  }),
});

const migrator = new Migrator({
  db: kyselyDB,
  migrationTableSchema: "kysely",
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "db-migrations"),
  }),
});

export async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest();

  if (!results) return;

  for (const it of results) {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  }

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await kyselyDB.destroy();
}

export async function migrateToNext() {
  const { error, results } = await migrator.migrateUp();

  const result = results?.[0];

  if (result?.status === "Success") {
    console.log(
      `Migration "${result.migrationName}" was executed successfully`,
    );
  } else if (result?.status === "Error") {
    console.error(`Failed to execute migration "${result.migrationName}"`);
  }

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await kyselyDB.destroy();
}

export async function migrateToInitial() {
  const { error, results } = await migrator.migrateTo(NO_MIGRATIONS);

  if (!results) return;

  for (const it of results) {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was reverted successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  }

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await kyselyDB.destroy();
}

export async function migrateToPrevious() {
  const { error, results } = await migrator.migrateDown();

  const result = results?.[0];

  if (result?.status === "Success") {
    console.log(
      `Migration "${result.migrationName}" was reverted successfully`,
    );
  } else if (result?.status === "Error") {
    console.error(`Failed to execute migration "${result.migrationName}"`);
  }

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await kyselyDB.destroy();
}
