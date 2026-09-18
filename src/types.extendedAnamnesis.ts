export type QuestionFieldType = 'radio' | 'checkbox' | 'text' | 'textarea' | 'number' | 'dynamic_list' | 'conditional_group';

export interface AnamnesisField {
  id: string;
  label: string;
  type: QuestionFieldType;
  options?: string[];
  placeholder?: string;
  condition?: { fieldId: string; value: any; operator?: 'eq' | 'includes' }; // 'eq' is default
  subFields?: AnamnesisField[]; // for dynamic_list or conditional_group
  addLabel?: string; // label for "+ Hinzufügen" button in dynamic_list
  multiple?: boolean; // for select/checkbox
  unit?: string; // unit label e.g. 'Tassen', 'Liter'
  compact?: boolean; // display in compact inline layout
}

export interface AnamnesisStepConfig {
  id: string;
  title: string;
  fields: AnamnesisField[];
}
