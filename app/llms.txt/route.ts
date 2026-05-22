import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { data } = await supabaseServer
    .from('admin_settings')
    .select('value')
    .eq('key', 'llms_txt_content')
    .maybeSingle();

  const content = data?.value || '# AstroGTM\nNo llms.txt content configured.';

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
