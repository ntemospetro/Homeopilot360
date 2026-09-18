import json

with open('tsconfig.json', 'r') as f:
    data = json.load(f)

data['compilerOptions']['resolveJsonModule'] = True

with open('tsconfig.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Fixed tsconfig")
