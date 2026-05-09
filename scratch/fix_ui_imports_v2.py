import os
import re

def get_relative_prefix(file_path):
    # depth relative to src
    # packages/ui/src/components/templates/global-sidebar/app-sidebar.tsx
    # parts: ['packages', 'ui', 'src', 'components', 'templates', 'global-sidebar', 'app-sidebar.tsx']
    # index of src is 2.
    # length is 7.
    # levels up to src: 7 - 2 - 2 = 3 (app-sidebar -> global-sidebar -> templates -> components)
    # levels up to components: 7 - 2 - 2 = 3.
    # Wait, if we want to reach src/components:
    # From packages/ui/src/components/templates/global-sidebar/app-sidebar.tsx
    # ../ is global-sidebar
    # ../../ is templates
    # ../../../ is components
    
    parts = file_path.replace('\\', '/').split('/')
    try:
        src_index = parts.index('src')
        depth = len(parts) - src_index - 2
        return '../' * depth
    except:
        return './'

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    prefix = get_relative_prefix(path)
    # prefix points to components/ folder if path is in components/something
    # Wait, if path is packages/ui/src/components/templates/global-sidebar/app-sidebar.tsx
    # depth is 3. prefix is ../../../
    # src/components is at depth 1.
    # so ../../../ takes us to components.
    
    # Let's be simpler: point to src/
    src_prefix = get_relative_prefix(path) + '../' # if depth is 3, ../../../../ takes us to src/
    # Wait, no. 
    # src/ (0)
    # src/components (1)
    # src/components/templates (2)
    # src/components/templates/sidebar (3)
    # depth is 3. ../../../ takes us to src/
    
    new_content = content
    
    # 1. Replace @/components with relative to components
    # If we are in src/components/..., @/components is ./ or ../ etc
    # Let's use @workspace/ui for simplicity if it works, or relative.
    
    # For now, let's just fix the specific broken ones manually or with a simpler rule.
    # Most common is @/components
    new_content = re.sub(r'from "@\/components"', rf'from "{src_prefix}components"', new_content)
    new_content = re.sub(r'from "@\/components\/ui"', rf'from "{src_prefix}components/ui"', new_content)
    new_content = re.sub(r'from "@\/lib\/utils"', 'from "@workspace/utils"', new_content)
    
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {path}")

def main():
    for root, dirs, files in os.walk("packages/ui/src"):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
