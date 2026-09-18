with open('src/types.ts', 'r') as f:
    content = f.read()

target = "  befundText?: string;"
replacement = """  befundText?: string;
  befundDetails?: {
    gesamtbeurteilung?: string;
    blutdruck?: string;
    puls?: string;
    temperatur?: string;
    spo2?: string;
    gewicht?: string;
    allgemeinzustand?: string;
    herzLunge?: string;
    abdomen?: string;
    hautSchleimhaeute?: string;
    neurologisch?: string;
    weitereBefunde?: string;
  };"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/types.ts', 'w') as f:
        f.write(content)
    print("Patched types.ts")
else:
    print("target not found")
