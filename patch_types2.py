with open('src/types.ts', 'r') as f:
    content = f.read()

target = "extendedAnamnesis?: Record<string, any>;"
replacement = "extendedAnamnesis?: Record<string, any>;\n  befundGewuenscht?: boolean;\n  befundText?: string;\n  nimmtMedikamente?: boolean;\n  medikamenteList?: { name: string; dosierung: string; einnahmeart: string }[];"

if target in content:
    content = content.replace(target, replacement)
    with open('src/types.ts', 'w') as f:
        f.write(content)
    print("Patched types.ts")
else:
    print("target not found")
