import re

with open('src/app/admin/AdminLayoutClient.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

find_str = '''const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile?.account_type !== 'admin') {
        router.push("/dashboard");
        return;
      }'''

replace_str = '''// HARDCODED ADMIN CHECK PER USER REQUEST
      if (session.user.email?.toLowerCase() !== 'admin@gmail.com') {
        router.push("/dashboard");
        return;
      }'''

new_content = content.replace(find_str, replace_str)

with open('src/app/admin/AdminLayoutClient.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
