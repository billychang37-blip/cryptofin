import os
from supabase import create_client

def parse_env(file_path):
    env_vars = {}
    with open(file_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                parts = line.strip().split('=', 1)
                if len(parts) == 2:
                    env_vars[parts[0]] = parts[1].strip('"').strip("'")
    return env_vars

env = parse_env('.env.local')
supabase = create_client(env.get('NEXT_PUBLIC_SUPABASE_URL'), env.get('SUPABASE_SERVICE_ROLE_KEY'))

try:
    res = supabase.auth.admin.create_user({
        'email': 'admin@cryptofin.org',
        'password': 'AdminPassword123!',
        'email_confirm': True
    })
    print('Successfully created admin@cryptofin.org!')
except Exception as e:
    print('Error:', e)
