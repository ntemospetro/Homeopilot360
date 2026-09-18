with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

radio_target = """            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${value === opt ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>"""

radio_replacement = """            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${value === opt ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>"""

checkbox_target = """              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>"""

checkbox_replacement = """              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isChecked} 
                  onChange={(e) => {
                    const currentArr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) currentArr.push(opt);
                    else {
                      const i = currentArr.indexOf(opt);
                      if (i > -1) currentArr.splice(i, 1);
                    }
                    onChange(currentArr);
                  }} 
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>"""

if radio_target in content:
    content = content.replace(radio_target, radio_replacement)
    print("Radio fixed")
if checkbox_target in content:
    content = content.replace(checkbox_target, checkbox_replacement)
    print("Checkbox fixed")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
