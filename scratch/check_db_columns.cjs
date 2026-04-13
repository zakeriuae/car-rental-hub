const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ampdpgwcjgoqbamfttlw.supabase.co';
const supabaseServiceKey = 'sb_secret_8uREf_ZA-QLiFDKcFj4dFQ_5E4aVNr-';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching vehicles:', error.message);
  } else if (data.length > 0) {
    console.log('Available columns:', Object.keys(data[0]));
  } else {
    console.log('No vehicles found to check columns.');
  }
}

checkColumns();
