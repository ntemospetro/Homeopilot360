import json

with open('src/data/anamnesisSchema.ts', 'r') as f:
    lines = f.readlines()

out = []
for line in lines:
    out.append(line)

print("lines:", len(out))
