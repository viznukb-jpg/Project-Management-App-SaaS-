import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    const { data, error } = await supabase.storage.createBucket('attachments', {
      public: false,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.warn(
          'Bucket "attachments" already exists. Updating it to private...'
        );
        const { error: updateError } = await supabase.storage.updateBucket(
          'attachments',
          {
            public: false,
          }
        );
        if (updateError) {
          throw updateError;
        }
        console.log('Bucket "attachments" updated to private successfully.');
      } else {
        throw error;
      }
    } else {
      console.log(
        'Bucket "attachments" created successfully as private.',
        data
      );
    }
  } catch (err) {
    console.error('Failed to setup storage:', err);
  }
}

main();
