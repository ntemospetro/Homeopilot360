import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Separate the main part and the renderer part
parts = content.split("// Extracted Field Renderer to handle recursion easily")
main_content = parts[0]

new_renderer = """// Extracted Field Renderer to handle recursion easily
const FieldRenderer: React.FC<{ 
  field: AnamnesisField, 
  values: any, 
  onChange: (val: any) => void, 
  isConditionMet: (f: AnamnesisField) => boolean,
  index?: number,
  category?: string,
  isNested?: boolean
}> = ({ field, values, onChange, isConditionMet, index = 0, category = '', isNested = false }) => {
  const { language } = useLanguage();
  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = actualDicts[language] || actualDicts['en'] || {};
  const tSchema = (text: string) => dict[text] || text;
  
  if (!isConditionMet(field)) return null;

  const value = values[field.id];
  const isAnswered = value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);

  // Wrapper for top-level questions
  const Wrapper = isNested ? React.Fragment : ({ children }: { children: React.ReactNode }) => (
    <div
      id={index === 0 ? 'dynamic-complaint-first-question' : `question-card-${field.id}`}
      data-question-index={index}
      className={`p-5 rounded-2xl border transition-all scroll-mt-4 ${
        isAnswered
          ? 'bg-white border-teal-200/90 shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center font-mono shrink-0">
              {index + 1}
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                {tSchema(category)}
              </span>
            )}
            {isAnswered ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> {dict['complaintQuestionsStatusDone'] || 'Erledigt'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                {dict['complaintQuestionsStatusOpen'] || 'Offen'}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
            {tSchema(field.label)}
          </h4>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const innerContent = () => {
    if (field.type === 'conditional_group') {
      return (
        <div className="pl-4 border-l-2 border-teal-100 space-y-4 mt-2">
          {field.subFields?.map((sub, subIdx) => (
            <div key={sub.id} className="space-y-2">
              <label className="block text-sm font-bold text-slate-800">{tSchema(sub.label)}</label>
              <FieldRenderer 
                field={sub} 
                values={values[field.id] || {}} 
                onChange={(val) => {
                  const currentObj = values[field.id] || {};
                  onChange({ ...currentObj, [sub.id]: val });
                }} 
                isConditionMet={() => true} 
                isNested={true}
              />
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'dynamic_list') {
      const list = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-4">
          {isNested && <label className="block text-sm font-bold text-slate-800">{tSchema(field.label)}</label>}
          {list.map((item: any, i: number) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
              <button
                onClick={() => {
                  const newList = [...list];
                  newList.splice(i, 1);
                  onChange(newList);
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Entfernen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="space-y-4 pr-6">
                {field.subFields?.map(sub => (
                  <div key={sub.id}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{sub.label}</label>
                    {sub.type === 'radio' && sub.options && (
                      <div className="space-y-1.5">
                        {sub.options.map((opt, oIdx) => {
                          const isSelected = item[sub.id] === opt;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                const newList = [...list];
                                newList[i] = { ...newList[i], [sub.id]: opt };
                                onChange(newList);
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                                isSelected
                                  ? 'bg-teal-50 border-teal-600 text-teal-950 font-semibold shadow-2xs'
                                  : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="leading-snug">{tSchema(opt)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {sub.type === 'checkbox' && sub.options && (
                      <div className="space-y-1.5">
                        {sub.options.map((opt, oIdx) => {
                          const currentArr = Array.isArray(item[sub.id]) ? [...item[sub.id]] : [];
                          const isSelected = currentArr.includes(opt);
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                const newList = [...list];
                                if (isSelected) {
                                  const idxToRemove = currentArr.indexOf(opt);
                                  if (idxToRemove > -1) currentArr.splice(idxToRemove, 1);
                                } else {
                                  currentArr.push(opt);
                                }
                                newList[i] = { ...newList[i], [sub.id]: currentArr };
                                onChange(newList);
                              }}
                              className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                                isSelected
                                  ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                                  : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="leading-snug">{tSchema(opt)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {(sub.type === 'text' || sub.type === 'number') && (
                      <div className="relative flex items-center">
                        <input
                          type={sub.type}
                          placeholder={sub.placeholder ? tSchema(sub.placeholder) : ''}
                          value={item[sub.id] || ''}
                          onChange={(e) => {
                            const newList = [...list];
                            newList[i] = { ...newList[i], [sub.id]: e.target.value };
                            onChange(newList);
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                        />
                      </div>
                    )}
                    {sub.type === 'textarea' && (
                      <div className="relative flex items-center">
                        <textarea
                          placeholder={sub.placeholder ? tSchema(sub.placeholder) : ''}
                          value={item[sub.id] || ''}
                          onChange={(e) => {
                            const newList = [...list];
                            newList[i] = { ...newList[i], [sub.id]: e.target.value };
                            onChange(newList);
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => onChange([...list, {}])}
            className="flex items-center justify-center w-full gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-3 rounded-xl transition-colors border border-teal-200/60"
          >
            <Plus className="w-4 h-4" />
            {field.addLabel ? field.addLabel ? tSchema(field.addLabel) : '' : tSchema('+ Hinzufügen')}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 pt-1">
        {isNested && <label className="block text-sm font-bold text-slate-800">{tSchema(field.label)}</label>}
        
        {field.type === 'radio' && field.options && (
          <div className="space-y-1.5">
            {field.options.map((opt, oIdx) => {
              const isSelected = value === opt;
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-950 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="leading-snug">{tSchema(opt)}</span>
                </button>
              );
            })}
          </div>
        )}

        {field.type === 'checkbox' && field.options && (
          <div className="space-y-1.5">
            {field.options.map((opt, oIdx) => {
              const currentArr = Array.isArray(value) ? [...value] : [];
              const isSelected = currentArr.includes(opt);
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      const idxToRemove = currentArr.indexOf(opt);
                      if (idxToRemove > -1) currentArr.splice(idxToRemove, 1);
                    } else {
                      currentArr.push(opt);
                    }
                    onChange(currentArr);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                      : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="leading-snug">{tSchema(opt)}</span>
                </button>
              );
            })}
          </div>
        )}

        {(field.type === 'text' || field.type === 'number') && (
          <div className="relative flex items-center">
            <input
              type={field.type}
              placeholder={field.placeholder ? tSchema(field.placeholder) : ''}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
            {field.type === 'text' && (
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  value={value || ''}
                  onChange={(val) => onChange(val)}
                  size="xs"
                  mode="append"
                  id={`btn-voice-f-${field.id}`}
                />
              </div>
            )}
          </div>
        )}

        {field.type === 'textarea' && (
          <div className="relative flex items-center">
            <textarea
              placeholder={field.placeholder ? tSchema(field.placeholder) : ''}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors min-h-[80px]"
            />
            <div className="absolute right-1.5 top-3">
              <VoiceInputButton
                value={value || ''}
                onChange={(val) => onChange(val)}
                size="xs"
                mode="append"
                id={`btn-voice-f-${field.id}`}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Wrapper>
      {innerContent()}
    </Wrapper>
  );
};
"""

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(main_content + new_renderer)
