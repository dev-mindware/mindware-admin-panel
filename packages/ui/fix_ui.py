import os
import re

ui_src = r"c:\Users\JonataoCardoso\Documents\GitHub\mindware-admin-panel\packages\ui\src"

def fix_ui_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Identify how many levels deep we are from 'src'
    rel_to_src = os.path.relpath(ui_src, os.path.dirname(file_path)).replace("\\", "/")
    
    # If we find ../../../../components, it's trying to reach an index that doesn't exist in the package structure
    # Most likely it wants components/ui or components/common
    
    # Common components in ui package:
    # packages/ui/src/components/ui/... (primitive components)
    # packages/ui/src/components/common/... (shared complex components)
    
    # Pattern to match any of the broken paths
    pattern = r'from "\.\.\/\.\.\/\.\.\/\.\.\/components"'
    pattern2 = r'from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components"'
    
    # We'll replace with absolute-ish workspace paths or correct relative ones.
    # For now, let's use relative to 'src/components'
    
    # Calculate path to src/components
    path_to_components = os.path.join(rel_to_src, "components").replace("\\", "/")
    if not path_to_components.startswith("."):
        path_to_components = "./" + path_to_components

    # Actually, it's easier to replace with specific component paths if we know what's being imported.
    # But let's try a generic approach first.
    
    def replacement(match):
        # We need to know what's being imported to direct to ui/ or common/
        # This is hard with regex. 
        # Let's try to just use the components index if it exists.
        return f'from "{path_to_components}"'

    content = re.sub(pattern, replacement, content)
    content = re.sub(pattern2, replacement, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# We also need to fix "@/components" imports in packages/ui
def fix_alias_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    rel_to_src = os.path.relpath(ui_src, os.path.dirname(file_path)).replace("\\", "/")
    path_to_components = os.path.join(rel_to_src, "components").replace("\\", "/")
    if not path_to_components.startswith("."):
        path_to_components = "./" + path_to_components

    content = re.sub(r'from "@\/components"', f'from "{path_to_components}"', content)
    content = re.sub(r'from "@\/hooks"', 'from "@workspace/hooks"', content) # Hooks should use workspace

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(ui_src):
    for file in files:
        if file.endswith((".ts", ".tsx")):
            fix_ui_imports(os.path.join(root, file))
            fix_alias_imports(os.path.join(root, file))
