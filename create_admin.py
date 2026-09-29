import os
from supabase import create_client, Client
import time

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

url: str = env.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = env.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

email = "admin@gmail.com"
password = "AdminPassword123!"

try:
    print(f"Creating admin user {email}...")
    # 1. Create the user in Auth
    res = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True
    })
    
    user_id = res.user.id
    print(f"User created with ID: {user_id}")
    
    # Wait for trigger to create profile
    time.sleep(2)
    
    # 2. Update the profile
    print("Updating profile account_type to 'admin'...")
    update_res = supabase.table('profiles').update({
        "account_type": "admin",
        "first_name": "Admin",
        "last_name": "User"
    }).eq("id", user_id).execute()
    
    print("Admin account successfully created and hooked up!")
except Exception as e:
    print(f"Error: {e}")
