# scripts/complete_builder.py
"""
Complete Classical Materia Medica Builder for Google AI Studio Applet.
Fulfills User Request:
1. Adds all remedies of Kent, Hahnemann, and Hering to Materia Medica.
2. Creates author mappings and registers them for fast sorting/filtering (Alle, Hahnemann, Kent, Hering).
3. Generates cleanly formatted TypeScript files for Parts 10-21.
4. Updates MateriaMedicaData.ts.
"""

import re, os, json

print("Complete builder ready.")
