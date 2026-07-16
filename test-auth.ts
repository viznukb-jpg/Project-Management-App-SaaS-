import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const { auth } = await import('./src/server/auth.js');
  const { db } = await import('./src/server/db/index.js');
  const schema = await import('./src/server/db/schema.js');
  const { eq } = await import('drizzle-orm');

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: 'test_auth2@example.com',
        password: 'password123',
        name: 'test',
      },
    });
    console.log('SignUp Success:', !!res);

    // Fetch the account to see the password format
    const account = await db.query.accounts.findFirst({
      where: eq(schema.accounts.accountId, 'test_auth2@example.com'),
    });
    console.log('Password hash format:', account?.password);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
