import re
import json

with open('src/data/anamnesisSchema.ts', 'r') as f:
    text = f.read()

strings = set()
# find all strings inside title, label, addLabel, options
titles = re.findall(r"title:\s*'([^']+)'", text)
labels = re.findall(r"label:\s*'([^']+)'", text)
addLabels = re.findall(r"addLabel:\s*'([^']+)'", text)

options_blocks = re.findall(r"options:\s*\[(.*?)\]", text)
for b in options_blocks:
    opts = re.findall(r"'([^']+)'", b)
    for o in opts:
        strings.add(o)

for t in titles + labels + addLabels:
    strings.add(t)

print(json.dumps(list(strings), indent=2))
