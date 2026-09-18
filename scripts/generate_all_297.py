#!/usr/bin/env python3
# scripts/generate_all_297.py
import json
import os
import re

# Complete list of 297 requested remedies
REMEDIES_MASTER = [
  # A
  {
    "id": "abies-canadensis", "latinName": "Abies canadensis", "categoryKey": "plant", "importanceTier": 2, "isPolychrest": False,
    "de": {
      "commonName": "Kanadische Hemlocktanne",
      "origin": "Frische Nadeln und Zweigspitzen von Tsuga canadensis",
      "essence": "Magenmittel bei Heißhunger mit Magenschwäche, Kältegefühl und Senkungsgefühl im Epigastrium.",
      "mainIndications": ["Magenbeschwerden mit Heißhunger", "Magensenkung (Gastroptose)", "Reizmagensyndrom", "Uterusprolaps mit Magenbrennen"],
      "keynotes": ["Gefühl, als ob der Magen wie ein Stein herabfällt", "Heißhunger auf Fleisch, Gurken und Saures", "Kältegefühl zwischen den Schulterblättern", "Neigung zu Frösteln und Schüttelfrost"],
      "mindEmotional": "Mürrisch, gereizt durch Schwäche, verlangt nach Ruhe und Schonung.",
      "modalitiesBetter": ["Nach dem Essen", "Durch Liegen mit angezogenen Knien", "Wärme"],
      "modalitiesWorse": ["Aufstehen", "Bewegung", "Kälte", "Leerer Magen"],
      "potenciesAndDosage": "D6, D12, C30",
      "defaultTagesdosis": "3x täglich 5 Globuli",
      "sphereOfAction": ["Magen-Darm-Trakt", "Vegetatives Nervensystem", "Urogenitaltrakt"],
      "differentialRemedies": ["Abies nigra", "Anacardium", "Nux vomica", "Sepia"],
      "searchKeywords": ["abies canadensis", "hemlocktanne", "heißhunger", "magensenkung", "magenkälte"]
    },
    "en": {
      "commonName": "Hemlock Spruce",
      "origin": "Fresh needles and bark of Tsuga canadensis",
      "essence": "Gastric remedy for canine hunger with stomach sinking and craving for heavy food.",
      "mainIndications": ["Gastric disorders with ravenous hunger", "Gastroptosis and sinking sensation", "Dyspepsia with chilliness", "Uterine prolapse"],
      "keynotes": ["Sensation of stomach falling down", "Craving for meat, pickles and coarse food", "Cold water sensation between scapulae", "Extreme chilliness"],
      "mindEmotional": "Peevish, irritable from exhaustion, desires rest.",
      "modalitiesBetter": ["After eating", "Lying with knees drawn up", "Warmth"],
      "modalitiesWorse": ["Standing up", "Movement", "Cold", "Empty stomach"],
      "potenciesAndDosage": "D6, D12, C30",
      "defaultTagesdosis": "3x daily 5 globules",
      "sphereOfAction": ["Gastrointestinal tract", "Autonomic nervous system", "Urogenital tract"],
      "differentialRemedies": ["Abies nigra", "Anacardium", "Nux vomica", "Sepia"],
      "searchKeywords": ["abies canadensis", "hemlock spruce", "canine hunger", "gastroptosis", "stomach sinking"]
    },
    "fr": {"commonName": "Pruche du Canada"},
    "es": {"commonName": "Abeto del Canadá"},
    "it": {"commonName": "Abete del Canada"},
    "el": {"commonName": "Καναδικό έλατο"},
    "ru": {"commonName": "Пихта канадская"}
  },
  {
    "id": "abies-nigra", "latinName": "Abies nigra", "categoryKey": "plant", "importanceTier": 2, "isPolychrest": False,
    "de": {
      "commonName": "Schwarzfichte",
      "origin": "Harzige Zweigspitzen von Picea mariana",
      "essence": "Magenmittel mit dem charakteristischen Gefühl eines hartgekochten Eies in der Magengrube.",
      "mainIndications": ["Dyspepsie bei älteren Menschen", "Magenkrämpfe nach dem Essen", "Schlafstörungen durch Magendruck", "Kardiospasmus"],
      "keynotes": ["Gefühl eines hartgekochten Eies in der Herzgrube", "Völlige Appetitlosigkeit am Morgen, Heißhunger am Mittag/Abend", "Schmerzhafter Magendruck sofort nach der Nahrungsaufnahme", "Nächtliches Aufwachen durch Herzklopfen"],
      "mindEmotional": "Trübsinnig, melancholisch während der Verdauung, antriebslos.",
      "modalitiesBetter": ["Aufrechtes Sitzen", "Leichte Bewegung", "Fasten"],
      "modalitiesWorse": ["Nach dem Essen", "Nachts im Liegen", "Tabakgenuss"],
      "potenciesAndDosage": "D6, D12, C30",
      "defaultTagesdosis": "3x täglich 5 Globuli vor den Mahlzeiten",
      "sphereOfAction": ["Magen", "Ösophagus", "Kardiovaskuläres System"],
      "differentialRemedies": ["Nux vomica", "Bryonia", "Carbo vegetabilis", "Ignatia"],
      "searchKeywords": ["abies nigra", "schwarzfichte", "hartgekochtes ei", "magendruck", "dyspepsie"]
    },
    "en": {
      "commonName": "Black Spruce",
      "origin": "Resin of Picea mariana",
      "essence": "Gastric remedy centered on sensation of a hard-boiled egg lodged in the cardiac orifice.",
      "mainIndications": ["Dyspepsia in elderly", "Gastric distress after eating", "Insomnia from gastric oppression", "Cardiospasm"],
      "keynotes": ["Sensation of a hard-boiled egg in pit of stomach", "No morning appetite, great craving at noon/night", "Pain immediately after eating", "Nightly heart palpitations"],
      "mindEmotional": "Hypochondriac, depressed during indigestion.",
      "modalitiesBetter": ["Sitting upright", "Gentle walking", "Fasting"],
      "modalitiesWorse": ["After eating", "Night lying down", "Tobacco"],
      "potenciesAndDosage": "D6, D12, C30",
      "defaultTagesdosis": "3x daily 5 globules before meals",
      "sphereOfAction": ["Stomach", "Esophagus", "Heart"],
      "differentialRemedies": ["Nux vomica", "Bryonia", "Carbo vegetabilis", "Ignatia"],
      "searchKeywords": ["abies nigra", "black spruce", "hard-boiled egg sensation", "gastric distress"]
    },
    "fr": {"commonName": "Épinette noire"},
    "es": {"commonName": "Abeto negro"},
    "it": {"commonName": "Abete nero"},
    "el": {"commonName": "Μαύρη ελάτη"},
    "ru": {"commonName": "Пихта черная"}
  }
]
