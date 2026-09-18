import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = """<span className="block text-slate-500 mb-1 truncate">{key}</span>"""
replacement = """<span className="block text-slate-500 mb-1 truncate">{key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</span>"""

content = content.replace(target, replacement)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
