import re

with open('src/i18n/translations.ts', 'r', encoding='utf8') as f:
    content = f.read()

# We need to remove the block from landingSubtitle to landingCtaBtn + the closing brace and whatever text is left.
# Wait, no. We just need to replace the whole chunk from `modalAnalysisRemaining:` up to `modalRecordedSymptoms:`
# with the correct `modalAnalysisRemaining:` and then append the correct landing variables AT THE END of the language block!

# Let's map out the correct modalAnalysisRemaining for each language:
rem = {
    'de': "Verbleibende Analysen: {count}",
    'en': "Remaining analyses: {count}",
    'es': "Análisis restantes: {count} de 3",
    'fr': "Analyses restantes : {count} sur 3",
    'el': "Απομένουσες αναλύσεις: {count} από 3",
    'it': "Analisi rimanenti: {count} di 3",
    'ru': "Осталось анализов: {count} из 3"
}

for lang, text in rem.items():
    # Find the modalAnalysisRemaining line and everything until modalRecordedSymptoms
    pattern = r"modalAnalysisRemaining:\s*'[^']*?'(?:,?\s*landingSubtitle[\s\S]*?landingCtaBtn:\s*'[^']+',?\s*\}[^']*')?,?\s*(?=modalRecordedSymptoms:)"
    
    # Wait, the string was ` modalAnalysisRemaining: 'Verbleibende Analysen: {count}', \n landingSubtitle... \n } von 3', \n modalRecordedSymptoms:`
    
    replacement = f"modalAnalysisRemaining: '{text}',\n    "
    # Actually, we don't know which language block we are in with a global replace unless we are careful.
    
