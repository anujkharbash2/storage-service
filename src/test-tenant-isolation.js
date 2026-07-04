require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Using the ANON key, not service_role — simulates an unprivileged client
const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await supabaseAnon.from('extraction_results').select('*');

  if (error) {
    console.log('Blocked as expected:', error.message);
  } else if (data.length === 0) {
    console.log('RLS working: query succeeded but returned zero rows (no policy grants access without account context)');
  } else {
    console.log('WARNING: anon key could read data without restriction!', data);
  }
})();