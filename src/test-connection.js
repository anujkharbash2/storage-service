require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('accounts').select('*').limit(1);
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connected successfully. Accounts table accessible:', data);
  }
})();