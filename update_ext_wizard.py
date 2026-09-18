import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Replace CheckBox List Option
target_cb_list = """                          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
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

repl_cb_list = """                          <label key={opt} className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                              isChecked
                                ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                                : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                            }`}>
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
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                              isChecked
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="leading-snug">{opt}</span>
                          </label>"""
content = content.replace(target_cb_list, repl_cb_list)


# Replace Radio List Option
target_radio_list = """                          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" className="hidden" checked={item[sub.id] === opt} onChange={() => {
                              const newList = [...list];
                              newList[index] = { ...newList[index], [sub.id]: opt };
                              onChange(newList);
                            }} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${item[sub.id] === opt ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>
                              {item[sub.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt}</span>
                          </label>"""

repl_radio_list = """                          <label key={opt} className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                              item[sub.id] === opt
                                ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                                : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                            }`}>
                            <input type="radio" className="hidden" checked={item[sub.id] === opt} onChange={() => {
                              const newList = [...list];
                              newList[index] = { ...newList[index], [sub.id]: opt };
                              onChange(newList);
                            }} />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              item[sub.id] === opt
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}>
                              {item[sub.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="leading-snug">{opt}</span>
                          </label>"""
content = content.replace(target_radio_list, repl_radio_list)


# Replace Main Radio Option
target_radio = """            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${value === opt ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>
                {value === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt}</span>
            </label>"""

repl_radio = """            <label key={opt} className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                value === opt
                  ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                  : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
              }`}>
              <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                value === opt
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {value === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="leading-snug">{opt}</span>
            </label>"""
content = content.replace(target_radio, repl_radio)


# Replace Main Checkbox Option
target_cb = """              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
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
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-500'}`}>
                  {isChecked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{opt}</span>
              </label>"""

repl_cb = """              <label key={opt} className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                  isChecked
                    ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                    : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                }`}>
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
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  isChecked
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="leading-snug">{opt}</span>
              </label>"""
content = content.replace(target_cb, repl_cb)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
print("Updated ExtendedAnamnesisWizard radio/checkbox styling.")

