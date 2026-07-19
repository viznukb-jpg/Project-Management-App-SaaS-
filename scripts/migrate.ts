import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('No connection string');

const client = postgres(connectionString, { max: 1 });

async function main() {
  try {
    await client`ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "workspaces_name_unique";`;
    await client`ALTER TABLE "workspaces" ADD CONSTRAINT "workspace_owner_name_uq" UNIQUE("owner_id","name");`;
    console.log('Migration completed manually');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
  }
}

main();
