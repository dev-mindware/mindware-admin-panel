import os
import re

hooks_dir = r"c:\Users\JonataoCardoso\Documents\GitHub\mindware-admin-panel\packages\hooks\src"

def fix_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace @/types with @workspace/types
    content = re.sub(r'from "@\/types"', 'from "@workspace/types"', content)
    content = re.sub(r'import type \{ (.*) \} from "@\/types"', r'import type { \1 } from "@workspace/types"', content)
    
    # Replace @/utils with @workspace/utils
    content = re.sub(r'from "@\/utils"', 'from "@workspace/utils"', content)
    
    # Replace @/services/api with @/services/api (wait, this might be tricky with relative)
    # But since I created src/services/api.ts, I should use relative if inside src
    
    rel_path = os.path.relpath(hooks_dir, os.path.dirname(file_path))
    if rel_path == ".":
        api_path = "./services/api"
    else:
        api_path = os.path.join(rel_path, "services", "api").replace("\\", "/")
        if not api_path.startswith("."):
            api_path = "./" + api_path

    content = re.sub(r'from "@\/services\/api"', f'from "{api_path}"', content)
    content = re.sub(r'import \{ api \} from "@\/services\/api"', f'import {{ api }} from "{api_path}"', content)

    # Replace @/hooks/auth with ./auth
    if "auth" not in file_path:
        content = re.sub(r'from "@\/hooks\/auth"', 'from "./auth"', content)
        content = re.sub(r'from "@\/hooks"', 'from "./"', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(hooks_dir):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            fix_imports(os.path.join(root, file))
