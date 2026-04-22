const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.*)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/);

const url = urlMatch[1];
const key = keyMatch[1];

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

  if (data.length > 0) {
    const paths = data.map(d => d.storage_path);
    const bucket = data[0].storage_bucket || 'customer-documents';
    console.log('Fetching signed URLs for paths:', paths, 'in bucket:', bucket);
    const { data: signedData, error: sError } = await supabase.storage.from(bucket).createSignedUrls(paths, 3600);
    if (sError) {
      console.error('Error fetching signed URLs:', sError.message);
    } else {
      console.log('Signed URLs response:', JSON.stringify(signedData, null, 2));
    }
  }
}

checkDocs();
