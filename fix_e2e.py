import os

directory = 'frontend/e2e'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content.replace('"title":', '"item_name":')
            new_content = new_content.replace("'title':", "'item_name':")
            new_content = new_content.replace('["title"]', '["item_name"]')
            new_content = new_content.replace("['title']", "['item_name']")
            
            new_content = new_content.replace('"contact_email":', '"email":')
            new_content = new_content.replace("'contact_email':", "'email':")
            
            # Form field names if they use FormData in JS tests (if applicable)
            new_content = new_content.replace("append('title'", "append('item_name'")
            new_content = new_content.replace('append("title"', 'append("item_name"')
            new_content = new_content.replace("append('contact_email'", "append('email'")
            new_content = new_content.replace('append("contact_email"', 'append("email"')

            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
