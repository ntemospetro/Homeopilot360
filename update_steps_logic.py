import re

with open('/tmp/TherapistPanel.tsx.intermediate', 'r') as f:
    content = f.read()

# Step 1: Remove "Erweiterte Homöopathische Anamnese (Fragebogen)" block from Step 1
block_start = '<div className="mt-8 p-6 bg-teal-50/50 border border-teal-200 rounded-xl space-y-4">'
block_end = '</div>\n                  </div>\n                )}\n\n                {/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}'

# Wait, let's use string operations carefully
idx_start = content.find(block_start)
idx_end = content.find('{/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}')
if idx_start != -1 and idx_end != -1:
    extracted_block = content[idx_start:idx_end].strip()
    
    # We remove this block from Step 1, except we need to keep `</div>` for step 1 container.
    # Actually, let's just replace the exact text.
    step1_end_str = """                  </div>
                )}"""
    
    content = content[:idx_start] + step1_end_str + "\n\n                {/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}" + content[idx_end + len('{/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}'):]

# Step 3: Replace Spontanbericht with the extracted block
step3_start = "{/* 3. SPONTANBERICHT */}"
# Wait, what was the actual comment for step 3? Let's check previous output.
