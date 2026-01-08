import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktilwqazrimaqkgqdxjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aWx3cWF6cmltYXFrZ3FkeGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTUxNDksImV4cCI6MjA4MzQ3MTE0OX0.zygz-cL8wcM1Ly2ZjY5LD9clck9UsroUAVAc-N70dRY';

export const supabase = createClient(supabaseUrl, supabaseKey);