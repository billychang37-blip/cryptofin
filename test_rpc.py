
import os
from dotenv import load_dotenv
load_dotenv('.env.local')
import requests

url = f'{os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")}/rest/v1/rpc/get_next_hd_index'
headers = {
    'apikey': os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
    'Authorization': f"Bearer {os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')}",
    'Content-Profile': 'public'
}
r = requests.post(url, headers=headers)
print(r.status_code, r.text)

