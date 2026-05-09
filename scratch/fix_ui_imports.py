import os
import re

def get_relative_path(file_path, target_path):
    # This is a bit complex to do generic, but for components it's easier
    # If in packages/ui/src/components/common/page-wrapper/index.tsx
    # and target is packages/ui/src/components/custom/bread-crumb/dinamic-breadcrumb
    # depth is 4 (src is 1, components is 2, common is 3, page-wrapper is 4)
    # relative to src: ../../../custom/...
    
    parts = file_path.replace('\\', '/').split('/')
    try:
        src_index = parts.index('src')
        depth = len(parts) - src_index - 2
        return '../' * depth
    except:
        return './'

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                
                # cn helper
                new_content = re.sub(r'from "@\/lib\/utils"', 'from "@workspace/utils"', new_content)
                new_content = re.sub(r'import { cn } from "@\/lib"', 'import { cn } from "@workspace/utils"', new_content)
                
                # Relative imports for components inside the same package
                rel = get_relative_path(path, "")
                
                # components/ui
                new_content = re.sub(r'from "@\/components\/ui\/([^"]+)"', rf'from "{rel}ui/\1"', new_content)
                new_content = re.sub(r'from "@\/components\/ui"', rf'from "{rel}ui"', new_content)
                
                # components/custom
                new_content = re.sub(r'from "@\/components\/custom\/([^"]+)"', rf'from "{rel}custom/\1"', new_content)
                
                # components/common
                new_content = re.sub(r'from "@\/components\/common\/([^"]+)"', rf'from "{rel}common/\1"', new_content)

                # hooks
                new_content = re.sub(r'from "@\/hooks\/use-mobile"', 'from "@workspace/hooks"', new_content)
                new_content = re.sub(r'from "@\/hooks\/auth"', 'from "@workspace/hooks"', new_content) # Assuming we'll move it

                if content != new_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {path}")

if __name__ == "__main__":
    fix_imports("packages/ui/src/components")
