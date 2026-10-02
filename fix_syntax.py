import re

with open('src/app/api/admin/add-funds/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken string
new_string = '''let emailHtml = `<div style="font-family: sans-serif; max-w-lg: mx-auto; p-4;">
          <h2 style="color: #2196F3;">Deposit Successful</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your deposit of <strong>${numAmount} ${symbol}</strong> has been successfully processed and credited to your account.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Amount:</strong> ${numAmount} ${symbol}</li>
            <li><strong>Date:</strong> ${new Date(date || Date.now()).toLocaleString()}</li>
            ${txHash ? `<li><strong>Transaction Hash:</strong> ${txHash}</li>` : ''}
            ${fromAddress ? `<li><strong>From Address:</strong> ${fromAddress}</li>` : ''}
          </ul>
          <p>Log in to your account to view your updated balance.</p>
          <p>Thank you.</p>
        </div>`;'''

content = re.sub(r'let emailHtml = \\\<div.*?</p>\\n        </div>\\`;', new_string, content, flags=re.DOTALL)
content = re.sub(r'let emailHtml = \\<div.*?</p>\\n        </div>\\`;', new_string, content, flags=re.DOTALL)
content = re.sub(r'let emailHtml = \\<div.*?</p>\s*</div>`;', new_string, content, flags=re.DOTALL)

with open('src/app/api/admin/add-funds/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
