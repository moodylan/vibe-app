import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yfchmszzpwnexqsqjmqs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY2htc3p6cHduZXhxc3FqbXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzg3MzQsImV4cCI6MjA2MDk1NDczNH0.PRZHoqTa3fmwlmUif3YR_Lauukr7YRhQ8tHnxmG3_To";

export const supabase = createClient(supabaseUrl, supabaseKey);
