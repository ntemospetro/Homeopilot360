with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target1 = """                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                const newList = [...list];
                                const currentArr = Array.isArray(newList[index][sub.id]) ? [...newList[index][sub.id]] : [];
                                if (e.target.checked) currentArr.push(opt);
                                else {
                                  const i = currentArr.indexOf(opt);
                                  if(i > -1) currentArr.splice(i, 1);
                                }
                                newList[index] = { ...newList[index], [sub.id]: currentArr };
                                onChange(newList);
                              }}
                              className="rounded text-teal-600 focus:ring-teal-600"
                            />
                            <span>{opt}</span>
                          </label>"""

repl1 = """                          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isChecked}
                              onChange={(e) => {
                                const newList = [...list];
                                const currentArr = Array.isArray(newList[index][sub.id]) ? [...newList[index][sub.id]] : [];
                                if (e.target.checked) currentArr.push(opt);
                                else {
                                  const i = currentArr.indexOf(opt);
                                  if(i > -1) currentArr.splice(i, 1);
                                }
                                newList[index] = { ...newList[index], [sub.id]: currentArr };
                                onChange(newList);
                              }}
                            />
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>
                              {isChecked && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt}</span>
                          </label>"""

content = content.replace(target1, repl1)

content = content.replace("CheckCircle2 className=", "Check className=")
content = content.replace("rounded border flex items-center", "rounded-md border flex items-center")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Patched ExtendedAnamnesisWizard")
