import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """    weitereBefunde?: string;
  };"""
replacement = """    weitereBefunde?: string;
    customFelder?: { id: string; name: string; value: string }[];
  };"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("target not found")
    # try another way
    target2 = """    weitereBefunde?: string;\n  };"""
    if target2 in content:
        content = content.replace(target2, replacement)
    else:
        print("target2 not found")
        # print the block
        idx = content.find("weitereBefunde")
        print(content[idx-50:idx+50])

with open('src/types.ts', 'w') as f:
    f.write(content)

