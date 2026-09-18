with open('src/components/TherapistPanel.tsx', 'r') as f:
    lines = f.readlines()

# find index of '          <div className="w-full">\n'
idx1 = -1
for i, l in enumerate(lines):
    if '<div className="w-full">' in l and 'Main Workspace Layout' in lines[i-1]:
        idx1 = i
        break

idx2 = -1
for i, l in enumerate(lines):
    if '{/* Right Column: SEQUENTIAL CASE INPUT WIZARD */}' in l:
        idx2 = i
        break

print("idx1:", idx1, "idx2:", idx2)

if idx1 != -1 and idx2 != -1:
    new_lines = lines[:idx1+1] + lines[idx2:]
    with open('src/components/TherapistPanel.tsx', 'w') as f:
        f.writelines(new_lines)
    print("Fixed.")

