import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """  patientAge?: number;
  patientGender?: 'weiblich' | 'männlich' | 'divers';"""

replacement = """  patientAge?: number;
  patientBirthDate?: string;
  patientGender?: 'weiblich' | 'männlich' | 'divers';
  patientWeightKg?: number;
  patientMaritalStatus?: 'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet' | 'sonstiges';"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
