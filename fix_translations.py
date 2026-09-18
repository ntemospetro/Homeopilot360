import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

# Let's just find and replace the double `ru` dictionary or whatever is duplicated
# Or I can just write a quick regex to delete the second occurrence of landingSubtitle to pricingQuota.
