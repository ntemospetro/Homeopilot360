# scripts/master_builder.py
"""
Master Builder for Classical Materia Medica.
Generates all remaining remedies for Hahnemann, Kent, and Hering with full i18n support in DE, EN, ES, FR, IT, EL, RU.
"""

import os, re, json

# Category mapping
CAT_NAMES = {
    'plant': {'de': 'Pflanzlich', 'en': 'Plant', 'es': 'Vegetal', 'fr': 'Végétal', 'it': 'Vegetale', 'el': 'Φυτικό', 'ru': 'Растительное'},
    'mineral': {'de': 'Mineralisch', 'en': 'Mineral', 'es': 'Mineral', 'fr': 'Minéral', 'it': 'Minerale', 'el': 'Ορυκτό', 'ru': 'Минеральное'},
    'animal': {'de': 'Tierisch', 'en': 'Animal', 'es': 'Animal', 'fr': 'Animal', 'it': 'Animale', 'el': 'Ζωικό', 'ru': 'Животное'},
    'acid': {'de': 'Säure / Mineralisch', 'en': 'Acid / Mineral', 'es': 'Ácido / Mineral', 'fr': 'Acide / Minéral', 'it': 'Acido / Minerale', 'el': 'Οξύ / Ορυκτό', 'ru': 'Кислота / Минерал'},
    'nosode': {'de': 'Nosode', 'en': 'Nosode', 'es': 'Nosode', 'fr': 'Nosode', 'it': 'Nosode', 'el': 'Νοσώδες', 'ru': 'Нозод'},
    'other': {'de': 'Sonstiges', 'en': 'Other', 'es': 'Otro', 'fr': 'Autre', 'it': 'Altro', 'el': 'Άλλο', 'ru': 'Другое'}
}

# Standard Dosages across languages
DOSAGES = {
    'de': 'D6 bis C30. Im akuten Zustand D6 alle 1-2 Stunden, bei chronischen Beschwerden C30 1x wöchentlich.',
    'en': '6X to 30C. In acute states 6X every 1-2 hours; for chronic conditions 30C once weekly.',
    'es': '6X a 30C. En estados agudos 6X cada 1-2 horas; en afecciones crónicas 30C una vez por semana.',
    'fr': '6X à 30C. Dans les états aigus 6X toutes les 1 à 2 heures ; pour les états chroniques 30C une fois par semaine.',
    'it': '6X a 30C. Negli stati acuti 6X ogni 1-2 ore; nelle affezioni croniche 30C una volta a settimana.',
    'el': '6X έως 30C. Σε οξείες καταστάσεις 6X κάθε 1-2 ώρες· σε χρόνιες παθήσεις 30C μία φορά την εβδομάδα.',
    'ru': '6X - 30C. При острых состояниях 6X каждые 1-2 часа; при хронических состояниях 30C раз в неделю.'
}

TAGESDOSIS = {
    'de': '3x täglich 5 Globuli oder Tropfen vor den Mahlzeiten.',
    'en': '3 times daily 5 globules or drops before meals.',
    'es': '3 veces al día 5 glóbulos o gotas antes de las comidas.',
    'fr': '3 fois par jour 5 granules ou gouttes avant les repas.',
    'it': '3 volte al giorno 5 globuli o gocce prima dei pasti.',
    'el': '3 φορές την ημέρα 5 σφαιρίδια ή σταγόνες πριν από τα γεύματα.',
    'ru': '3 раза в день по 5 гранул или капель до еды.'
}

print("Loaded master builder base definitions.")
