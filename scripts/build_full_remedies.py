# scripts/build_full_remedies.py
# Generator for complete classical remedies across Hahnemann, Kent, and Hering
import os, sys, json, re

# Category names across 7 languages
CATEGORIES = {
    'plant': {
        'de': 'Pflanzlich', 'en': 'Plant', 'es': 'Vegetal', 'fr': 'Végétal', 'it': 'Vegetale', 'el': 'Φυτικό', 'ru': 'Растительное'
    },
    'mineral': {
        'de': 'Mineralisch', 'en': 'Mineral', 'es': 'Mineral', 'fr': 'Minéral', 'it': 'Minerale', 'el': 'Ορυκτό', 'ru': 'Минеральное'
    },
    'animal': {
        'de': 'Tierisch', 'en': 'Animal', 'es': 'Animal', 'fr': 'Animal', 'it': 'Animale', 'el': 'Ζωικό', 'ru': 'Животное'
    },
    'nosode': {
        'de': 'Nosode', 'en': 'Nosode', 'es': 'Nosode', 'fr': 'Nosode', 'it': 'Nosode', 'el': 'Νοσώδες', 'ru': 'Нозод'
    },
    'acid': {
        'de': 'Säure / Mineralisch', 'en': 'Acid / Mineral', 'es': 'Ácido / Mineral', 'fr': 'Acide / Minéral', 'it': 'Acido / Minerale', 'el': 'Οξύ / Ορυκτό', 'ru': 'Кислота / Минерал'
    },
    'other': {
        'de': 'Sonstiges', 'en': 'Other', 'es': 'Otro', 'fr': 'Autre', 'it': 'Altro', 'el': 'Άλλο', 'ru': 'Другое'
    }
}

print("Categories configured.")
