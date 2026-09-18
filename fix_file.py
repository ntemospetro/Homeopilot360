import re

# Since I don't have git history, I will download the file from the current state and repair it manually or better, just fix the syntax.
with open('src/components/TherapistProfileEditor.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{/* Land */}' in line:
        print(f"Land is at line {i+1}")
    if '{/* Bottom Save Bar */}' in line:
        print(f"Bottom Save Bar is at line {i+1}")

