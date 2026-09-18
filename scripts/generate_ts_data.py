#!/usr/bin/env python3
# scripts/generate_ts_data.py
import json
import os
import re

# Category map
CATEGORY_MAP = {
    "plant": {"de": "Pflanzlich", "en": "Plant", "es": "Vegetal", "fr": "Végétal", "el": "Φυτικό", "it": "Vegetale", "ru": "Растительный"},
    "mineral": {"de": "Mineralisch", "en": "Mineral", "es": "Mineral", "fr": "Minéral", "el": "Ορυκτό", "it": "Minerale", "ru": "Минеральный"},
    "animal": {"de": "Tierisch", "en": "Animal", "es": "Animal", "fr": "Animal", "el": "Ζωικό", "it": "Animale", "ru": "Животный"},
    "acid": {"de": "Säure", "en": "Acid", "es": "Ácido", "fr": "Acide", "el": "Οξύ", "it": "Acido", "ru": "Кислота"},
    "nosode": {"de": "Nosode", "en": "Nosode", "es": "Nosode", "fr": "Nosode", "el": "Νοσώδες", "it": "Nosode", "ru": "Нозод"},
    "other": {"de": "Sonstiges", "en": "Other", "es": "Otro", "fr": "Autre", "el": "Άλλο", "it": "Altro", "ru": "Другое"}
}

def slugify(text):
    text = text.lower()
    text = re.sub(r'[\(\)]', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

print("Helper functions ready")
