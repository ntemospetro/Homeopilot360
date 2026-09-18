import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

translations = {
    'de': {
        'navProfile': 'Profil',
        'navSettings': 'Einstellungen',
        'navLogout': 'Abmelden',
        'btnStartQuestionnaire': 'Fragebogen starten'
    },
    'en': {
        'navProfile': 'Profile',
        'navSettings': 'Settings',
        'navLogout': 'Logout',
        'btnStartQuestionnaire': 'Start Questionnaire'
    },
    'fr': {
        'navProfile': 'Profil',
        'navSettings': 'Paramètres',
        'navLogout': 'Se déconnecter',
        'btnStartQuestionnaire': 'Démarrer le questionnaire'
    },
    'es': {
        'navProfile': 'Perfil',
        'navSettings': 'Ajustes',
        'navLogout': 'Cerrar sesión',
        'btnStartQuestionnaire': 'Iniciar cuestionario'
    },
    'el': {
        'navProfile': 'Προφίλ',
        'navSettings': 'Ρυθμίσεις',
        'navLogout': 'Αποσύνδεση',
        'btnStartQuestionnaire': 'Έναρξη ερωτηματολογίου'
    },
    'it': {
        'navProfile': 'Profilo',
        'navSettings': 'Impostazioni',
        'navLogout': 'Esci',
        'btnStartQuestionnaire': 'Inizia il questionario'
    },
    'ru': {
        'navProfile': 'Профиль',
        'navSettings': 'Настройки',
        'navLogout': 'Выйти',
        'btnStartQuestionnaire': 'Начать анкету'
    }
}

for lang, data in translations.items():
    lang_pattern = r"(\n\s*(" + lang + r")\s*:\s*\{)"
    match = re.search(lang_pattern, content)
    if match:
        insertion_point = match.end()
        new_keys = "\n"
        for key, value in data.items():
            safe_value = value.replace("'", "\\'")
            new_keys += f"    {key}: '{safe_value}',\n"
        content = content[:insertion_point] + new_keys + content[insertion_point:]
        
with open('src/i18n/translations.ts', 'w') as f:
    f.write(content)

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace(">Profil<", ">{t('navProfile' as TranslationKey)}<")
content = content.replace("Profil\n          </button>", "{t('navProfile' as TranslationKey)}\n          </button>")
content = content.replace(">Einstellungen<", ">{t('navSettings' as TranslationKey)}<")
content = content.replace("Einstellungen\n          </button>", "{t('navSettings' as TranslationKey)}\n          </button>")
content = content.replace(">Abmelden<", ">{t('navLogout' as TranslationKey)}<")
content = content.replace("Abmelden\n          </button>", "{t('navLogout' as TranslationKey)}\n          </button>")
content = content.replace("Fragebogen starten\n                          </button>", "{t('btnStartQuestionnaire' as TranslationKey)}\n                          </button>")
content = content.replace(">Fragebogen starten<", ">{t('btnStartQuestionnaire' as TranslationKey)}<")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Keys added and replaced.")
