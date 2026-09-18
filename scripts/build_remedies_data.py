# scripts/build_remedies_data.py
import json, os, re

# This script generates the additional classical parts materiaMedicaPart10.ts through Part20.ts
# covering all classical remedies of Kent, Hahnemann, and Hering.

print("Starting generation...")
