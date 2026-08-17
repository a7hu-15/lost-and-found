import os
import re

directory = 'frontend/e2e'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Remove category clicks
            content = re.sub(r"[ \t]*await page\.getByRole\('button', \{ name: 'Electronics' \}\)\.click\(\);\n?", "", content)
            content = re.sub(r"[ \t]*await page\.getByRole\('button', \{ name: 'Accessories' \}\)\.click\(\);\n?", "", content)
            
            # Change placeholders to match new UI
            content = content.replace("getByPlaceholder(/e.g. Silver Macbook Pro/i)", "getByPlaceholder('e.g. Blue Macbook Air')")
            content = content.replace("getByPlaceholder('e.g. Silver Macbook Pro 14-inch')", "getByPlaceholder('e.g. Blue Macbook Air')")
            content = content.replace("getByPlaceholder('e.g. Silver Macbook Pro 14-inch', { exact: true })", "getByPlaceholder('e.g. Blue Macbook Air')")
            
            # Found report placeholders
            content = content.replace("getByPlaceholder('Electronics')", "getByPlaceholder('e.g. Apple, Dell, Titan')")
            content = content.replace("getByPlaceholder('Apple')", "getByPlaceholder('e.g. Apple, Dell, Titan')")
            content = content.replace("getByPlaceholder('Silver', { exact: true })", "getByPlaceholder('e.g. Black, Navy Blue')")
            
            # Lost/Found Date placeholders or finding them by locator
            # If the tests try to fill category as a text input because of old placeholders:
            content = re.sub(r"await page\.getByPlaceholder\('Electronics'\)\.fill\('.*?'\);\n?", "", content)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filepath}")
