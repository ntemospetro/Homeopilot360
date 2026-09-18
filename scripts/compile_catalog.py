# scripts/compile_catalog.py
import os, sys, json, re

# Category map for multi-language
CATEGORY_NAMES = {
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
        'de': 'Säure', 'en': 'Acid', 'es': 'Ácido', 'fr': 'Acide', 'it': 'Acido', 'el': 'Οξύ', 'ru': 'Кислота'
    },
    'other': {
        'de': 'Sonstiges', 'en': 'Other', 'es': 'Otro', 'fr': 'Autre', 'it': 'Altro', 'el': 'Άλλο', 'ru': 'Другое'
    }
}

print("Catalog compiler ready.")
