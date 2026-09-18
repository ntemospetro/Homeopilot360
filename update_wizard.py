import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# 1. Add auto-save to handleNext
target_next = """  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };"""

replacement_next = """  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onSave(values);
      setCurrentStep(prev => prev + 1);
    }
  };"""

content = content.replace(target_next, replacement_next)

# 2. Update the mapping in the main render to pass index and step title
target_map = """            <div className="space-y-8">
              {currentStepConfig.fields.map(field => (
                <FieldRenderer 
                  key={field.id} 
                  field={field} 
                  values={values} 
                  onChange={(val) => updateValue(field.id, val)} 
                  isConditionMet={isConditionMet}
                />
              ))}
            </div>"""

replacement_map = """            <div className="space-y-4">
              {currentStepConfig.fields.map((field, index) => (
                <FieldRenderer 
                  key={field.id} 
                  field={field}
                  index={index}
                  category={currentStepConfig.title}
                  values={values} 
                  onChange={(val) => updateValue(field.id, val)} 
                  isConditionMet={isConditionMet}
                />
              ))}
            </div>"""
            
content = content.replace(target_map, replacement_map)

# 3. Import VoiceInputButton and Check if not imported
if "import { VoiceInputButton }" not in content:
    content = content.replace("import { Check, X, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';", "import { Check, X, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';\nimport { VoiceInputButton } from './VoiceInputButton';")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
