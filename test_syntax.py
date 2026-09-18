import re

with open('src/components/TherapistProfileEditor.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Bottom Save Bar' in line:
        print(f"Bottom Save Bar at {i+1}")
        for j in range(i-5, i+5):
            print(f"{j+1}: {lines[j].rstrip()}")
