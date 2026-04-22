const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let url = '';
let key = '';

try {
  const env = fs.readFileSync('.env', 'utf8');
  const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
  const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
  const serviceKeyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

  url = urlMatch ? urlMatch[1].trim().replace(/['"]/g, '') : '';
  // Try service key first for better access
  key = serviceKeyMatch ? serviceKeyMatch[1].trim().replace(/['"]/g, '') : (keyMatch ? keyMatch[1].trim().replace(/['"]/g, '') : '');
  
  // If still empty, use defaults from previous script
  if (!url) url = 'https://ampdpgwcjgoqbamfttlw.supabase.co';
} catch (e) {
  url = 'https://ampdpgwcjgoqbamfttlw.supabase.co';
}

if (!key) {
  console.error('No Supabase key found in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkDocs() {
  const { data, error } = await supabase
    .from('customer_documents')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching docs:', error.message);
    return;
  }

  console.log('Docs data:', JSON.stringify(data, null, 2));
}

checkDocs();
