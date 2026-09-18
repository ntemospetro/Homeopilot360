import { AnamnesisStepConfig, AnamnesisField } from '../types.extendedAnamnesis';

export const translateSchema = (
  schema: AnamnesisStepConfig[], 
  translations: Record<string, string>
): AnamnesisStepConfig[] => {
  if (!translations) return schema;
  const t = (text: string) => translations[text] || text;

  const translateField = (field: AnamnesisField): AnamnesisField => {
    return {
      ...field,
      label: t(field.label),
      options: field.options?.map(o => t(o)),
      addLabel: field.addLabel ? t(field.addLabel) : undefined,
      subFields: field.subFields?.map(sub => translateField(sub)),
    };
  };

  return schema.map(step => ({
    ...step,
    title: t(step.title),
    fields: step.fields.map(field => translateField(field)),
  }));
};
