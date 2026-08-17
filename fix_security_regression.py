import re

with open("scripts/security_regression.py", "r") as f:
    content = f.read()

# Replace title with item_name in test_xss
content = content.replace('"title": xss_payload', '"item_name": xss_payload')
content = content.replace('item["title"]', 'item["item_name"]')

# Replace contact_email with email in test_xss
content = content.replace('"contact_email": "xss@example.com"', '"email": "xss@example.com"')

# Replace title with item_name in test_file_upload
content = content.replace('"title": "Malicious Upload"', '"item_name": "Malicious Upload"')

# Replace contact_email with email in test_file_upload
content = content.replace('"contact_email": "hacker@example.com"', '"email": "hacker@example.com"')

with open("scripts/security_regression.py", "w") as f:
    f.write(content)
