#!/usr/bin/env python3
# add_stammdaten_keys.py
import re

locale_files = ['de', 'en', 'es', 'fr', 'it', 'el', 'ru']

new_translations = {
    'memberSince': {
        'de': 'Mitglied seit:',
        'en': 'Member since:',
        'es': 'Miembro desde:',
        'fr': 'Membre depuis :',
        'it': 'Membro dal:',
        'el': 'Μέλος από:',
        'ru': 'Участник с:'
    },
    'historyTracking': {
        'de': 'Historien-Tracking',
        'en': 'History Tracking',
        'es': 'Historial de cambios',
        'fr': "Suivi de l'historique",
        'it': 'Tracciamento cronologia',
        'el': 'Ιστορικό αλλαγών',
        'ru': 'История изменений'
    },
    'profileContactManagementDesc': {
        'de': 'Frühere Kontaktdaten bleiben inaktiv gespeichert. Neue Adressen werden direkt darunter aktiv verwaltet.',
        'en': 'Previous contact details remain stored as inactive. New addresses are actively managed directly below.',
        'es': 'Los datos de contacto anteriores se guardan como inactivos. Las nuevas direcciones se gestionan activamente a continuación.',
        'fr': 'Les anciennes coordonnées restent enregistrées comme inactives. Les nouvelles sont gérées activement ci-dessous.',
        'it': 'I precedenti contatti rimangono archiviati come inattivi. I nuovi indirizzi sono gestiti attivamente sotto.',
        'el': 'Τα προηγούμενα στοιχεία επικοινωνίας παραμένουν ανενεργά. Τα νέα στοιχεία διαχειρίζονται ενεργά παρακάτω.',
        'ru': 'Предыдущие контактные данные сохраняются как неактивные. Новые адреса активно управляются ниже.'
    },
    'profileActiveEmailLabel': {
        'de': 'Aktuell aktive E-Mail-Adresse:',
        'en': 'Currently active email address:',
        'es': 'Dirección de correo actualmente activa:',
        'fr': 'Adresse e-mail actuellement active :',
        'it': 'Indirizzo email attualmente attivo:',
        'el': 'Τρέχουσα ενεργή διεύθυνση email:',
        'ru': 'Текущий активный адрес эл. почты:'
    },
    'profileEmailPurposeDesc': {
        'de': 'Dient als Ihre Login-E-Mail und für Benachrichtigungen & Fallanalysen.',
        'en': 'Used as your login email and for notifications & case analyses.',
        'es': 'Se utiliza como su correo de acceso y para notificaciones y análisis de casos.',
        'fr': "Sert d'identifiant de connexion et pour les notifications et analyses de cas.",
        'it': 'Serve come email di accesso e per notifiche & analisi dei casi.',
        'el': 'Χρησιμεύει ως email σύνδεσης και για ειδοποιήσεις & αναλύσεις περιστατικών.',
        'ru': 'Используется для входа в систему, уведомлений и анализа случаев.'
    },
    'profilePreviousEmailsTitle': {
        'de': 'Bisherige E-Mail-Adressen [Deaktiviert]',
        'en': 'Previous Email Addresses [Deactivated]',
        'es': 'Direcciones de correo anteriores [Desactivadas]',
        'fr': 'Anciennes adresses e-mail [Désactivées]',
        'it': 'Precedenti indirizzi email [Disattivati]',
        'el': 'Προηγούμενες διευθύνσεις email [Ανενεργές]',
        'ru': 'Предыдущие адреса эл. почты [Отключены]'
    },
    'profileActivePhoneLabel': {
        'de': 'Aktuell aktive Telefonnummer:',
        'en': 'Currently active phone number:',
        'es': 'Número de teléfono actualmente activo:',
        'fr': 'Numéro de téléphone actuellement actif :',
        'it': 'Numero di telefono attualmente attivo:',
        'el': 'Τρέχων ενεργός αριθμός τηλεφώνου:',
        'ru': 'Текущий активный номер телефона:'
    },
    'profilePhonePurposeDesc': {
        'de': 'Direkte Durchwahl oder Mobilnummer für Praxiserreichbarkeit.',
        'en': 'Direct line or mobile number for practice reachability.',
        'es': 'Línea directa o número de móvil para la accesibilidad de la consulta.',
        'fr': 'Ligne directe ou numéro de mobile pour joindre le cabinet.',
        'it': 'Linea diretta o cellulare per la reperibilità dello studio.',
        'el': 'Απευθείας γραμμή ή κινητό για επικοινωνία με το ιατρείο.',
        'ru': 'Прямой номер или мобильный для связи с практикой.'
    },
    'profilePreviousPhonesTitle': {
        'de': 'Bisherige Telefonnummern [Deaktiviert]',
        'en': 'Previous Phone Numbers [Deactivated]',
        'es': 'Números de teléfono anteriores [Desactivados]',
        'fr': 'Anciens numéros de téléphone [Désactivés]',
        'it': 'Precedenti numeri di telefono [Disattivati]',
        'el': 'Προηγούμενοι αριθμοί τηλεφώνου [Ανενεργοί]',
        'ru': 'Предыдущие номера телефонов [Отключены]'
    },
    'profilePersonalDataDesc': {
        'de': 'Angaben zur Person, Praxisbezeichnung und Standortadresse. Name und Vorname können nur auf Anfrage geändert werden.',
        'en': 'Personal details, practice name, and location address. First and last name can only be changed upon request.',
        'es': 'Datos personales, nombre de la consulta y dirección. El nombre y apellidos solo pueden cambiarse previa solicitud.',
        'fr': 'Informations personnelles, nom du cabinet et adresse. Le prénom et le nom ne peuvent être modifiés que sur demande.',
        'it': 'Dati personali, denominazione dello studio e indirizzo. Nome e cognome possono essere modificati solo su richiesta.',
        'el': 'Προσωπικά στοιχεία, όνομα ιατρείου και διεύθυνση. Το όνομα και το επώνυμο αλλάζουν μόνο κατόπιν αιτήματος.',
        'ru': 'Персональные данные, название практики и адрес. Имя и фамилия могут быть изменены только по запросу.'
    },
    'profileRequestNameChange': {
        'de': 'Änderung beantragen',
        'en': 'Request Change',
        'es': 'Solicitar cambio',
        'fr': 'Demander une modification',
        'it': 'Richiedi modifica',
        'el': 'Αίτημα αλλαγής',
        'ru': 'Запросить изменение'
    },
    'profileLoggedChanges': {
        'de': 'Protokollierte Änderungen',
        'en': 'Logged Changes',
        'es': 'Cambios registrados',
        'fr': 'Modifications enregistrées',
        'it': 'Modifiche registrate',
        'el': 'Καταγεγραμμένες αλλαγές',
        'ru': 'Зарегистрированные изменения'
    },
    'profileFirstAndLastName': {
        'de': 'Name & Vorname',
        'en': 'First & Last Name',
        'es': 'Nombre y apellidos',
        'fr': 'Nom & Prénom',
        'it': 'Nome & Cognome',
        'el': 'Όνομα & Επώνυμο',
        'ru': 'Имя и фамилия'
    },
    'profileNoPreviousNames': {
        'de': 'Keine vorherigen Namen vorhanden.',
        'en': 'No previous names recorded.',
        'es': 'No hay nombres anteriores registrados.',
        'fr': 'Aucun ancien nom enregistré.',
        'it': 'Nessun nome precedente registrato.',
        'el': 'Δεν υπάρχουν προηγούμενα ονόματα.',
        'ru': 'Предыдущих имен нет.'
    },
    'profilePraxisNameTitle': {
        'de': 'Praxisbezeichnung',
        'en': 'Practice Name',
        'es': 'Nombre de la consulta',
        'fr': 'Nom du cabinet',
        'it': 'Nome dello studio',
        'el': 'Ονομασία ιατρείου',
        'ru': 'Название практики'
    },
    'profileNoPreviousPraxisNames': {
        'de': 'Keine vorherigen Praxisnamen vorhanden.',
        'en': 'No previous practice names recorded.',
        'es': 'No hay nombres de consulta anteriores registrados.',
        'fr': 'Aucun ancien nom de cabinet enregistré.',
        'it': 'Nessun nome di studio precedente registrato.',
        'el': 'Δεν υπάρχουν προηγούμενες ονομασίες ιατρείου.',
        'ru': 'Предыдущих названий практики нет.'
    },
    'profileLocationAddressTitle': {
        'de': 'Standortadresse',
        'en': 'Location Address',
        'es': 'Dirección de la consulta',
        'fr': 'Adresse du cabinet',
        'it': 'Indirizzo della sede',
        'el': 'Διεύθυνση ιατρείου',
        'ru': 'Адрес практики'
    },
    'profileNoPreviousAddresses': {
        'de': 'Keine vorherigen Adressen vorhanden.',
        'en': 'No previous addresses recorded.',
        'es': 'No hay direcciones anteriores registradas.',
        'fr': 'Aucune ancienne adresse enregistrée.',
        'it': 'Nessun indirizzo precedente registrato.',
        'el': 'Δεν υπάρχουν προηγούμενες διευθύνσεις.',
        'ru': 'Предыдущих адресов нет.'
    },
    'profileSecurityTitle': {
        'de': 'Sicherheit & Passwort',
        'en': 'Security & Password',
        'es': 'Seguridad y contraseña',
        'fr': 'Sécurité & Mot de passe',
        'it': 'Sicurezza & Password',
        'el': 'Ασφάλεια & Κωδικός πρόσβασης',
        'ru': 'Безопасность и пароль'
    },
    'profileSecurityDesc': {
        'de': 'Passwort ändern. Lassen Sie die Felder leer, wenn Sie das Passwort nicht ändern möchten.',
        'en': 'Change password. Leave fields blank if you do not want to change your password.',
        'es': 'Cambiar contraseña. Deje los campos vacíos si no desea cambiar la contraseña.',
        'fr': 'Changer le mot de passe. Laissez les champs vides si vous ne souhaitez pas modifier le mot de passe.',
        'it': 'Modifica password. Lascia i campi vuoti se non desideri modificare la password.',
        'el': 'Αλλαγή κωδικού πρόσβασης. Αφήστε τα πεδία κενά αν δεν επιθυμείτε να αλλάξετε τον κωδικό.',
        'ru': 'Смена пароля. Оставьте поля пустыми, если не хотите менять пароль.'
    },
    'profileNewPasswordLabel': {
        'de': 'Neues Passwort',
        'en': 'New Password',
        'es': 'Nueva contraseña',
        'fr': 'Nouveau mot de passe',
        'it': 'Nuova password',
        'el': 'Νέος κωδικός πρόσβασης',
        'ru': 'Новый пароль'
    },
    'profileMin6Chars': {
        'de': 'Min. 6 Zeichen',
        'en': 'Min. 6 characters',
        'es': 'Mín. 6 caracteres',
        'fr': 'Min. 6 caractères',
        'it': 'Min. 6 caratteri',
        'el': 'Τουλάχιστον 6 χαρακτήρες',
        'ru': 'Мин. 6 символов'
    },
    'profileErrValidEmail': {
        'de': 'Bitte eine gültige E-Mail-Adresse eingeben.',
        'en': 'Please enter a valid email address.',
        'es': 'Por favor, introduzca una dirección de correo válida.',
        'fr': 'Veuillez saisir une adresse e-mail valide.',
        'it': 'Inserisci un indirizzo email valido.',
        'el': 'Παρακαλούμε εισάγετε μια έγκυρη διεύθυνση email.',
        'ru': 'Пожалуйста, введите корректный адрес эл. почты.'
    },
    'profileErrPhone': {
        'de': 'Bitte eine Telefonnummer eingeben.',
        'en': 'Please enter a phone number.',
        'es': 'Por favor, introduzca un número de teléfono.',
        'fr': 'Veuillez saisir un numéro de téléphone.',
        'it': 'Inserisci un numero di telefono.',
        'el': 'Παρακαλούμε εισάγετε έναν αριθμό τηλεφώνου.',
        'ru': 'Пожалуйста, введите номер телефона.'
    },
    'profileErrPasswordLen': {
        'de': 'Das neue Passwort muss mindestens 6 Zeichen lang sein.',
        'en': 'The new password must be at least 6 characters long.',
        'es': 'La nueva contraseña debe tener al menos 6 caracteres.',
        'fr': 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
        'it': 'La nuova password deve contenere almeno 6 caratteri.',
        'el': 'Ο νέος κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
        'ru': 'Новый пароль должен содержать не менее 6 символов.'
    },
    'profileErrPasswordMismatch': {
        'de': 'Die Passwörter stimmen nicht überein.',
        'en': 'Passwords do not match.',
        'es': 'Las contraseñas no coinciden.',
        'fr': 'Les mots de passe ne correspondent pas.',
        'it': 'Le password non coincidono.',
        'el': 'Οι κωδικοί πρόσβασης δεν ταιριάζουν.',
        'ru': 'Пароли не совпадают.'
    },
    'customFieldNameLabel': {
        'de': 'Feldbezeichnung',
        'en': 'Field Name',
        'es': 'Nombre del campo',
        'fr': 'Nom du champ',
        'it': 'Nome del campo',
        'el': 'Όνομα πεδίου',
        'ru': 'Название поля'
    },
    'customFieldValueLabel': {
        'de': 'Wert / Information',
        'en': 'Value / Information',
        'es': 'Valor / Información',
        'fr': 'Valeur / Information',
        'it': 'Valore / Informazione',
        'el': 'Τιμή / Πληροφορία',
        'ru': 'Значение / Информация'
    },
    'newCaseToast': {
        'de': 'Neuer Fall angelegt – alle Felder wurden geleert.',
        'en': 'New case created – all fields have been cleared.',
        'es': 'Nuevo caso creado: todos los campos han sido limpiados.',
        'fr': 'Nouveau cas créé – tous les champs ont été réinitialisés.',
        'it': 'Nuovo caso creato – tutti i campi sono stati azzerati.',
        'el': 'Δημιουργήθηκε νέα υπόθεση – όλα τα πεδία εκκαθαρίστηκαν.',
        'ru': 'Создан новый случай – все поля очищены.'
    },
    'nameLabel': {
        'de': 'Name',
        'en': 'Name',
        'es': 'Nombre',
        'fr': 'Nom',
        'it': 'Nome',
        'el': 'Όνομα',
        'ru': 'Имя'
    },
    'ageAndBirthDateLabel': {
        'de': 'Alter / Geburtsdatum',
        'en': 'Age / Birth Date',
        'es': 'Edad / Fecha de nacimiento',
        'fr': 'Âge / Date de naissance',
        'it': 'Età / Data di nascita',
        'el': 'Ηλικία / Ημερομηνία γέννησης',
        'ru': 'Возраст / Дата рождения'
    },
    'genderLabel': {
        'de': 'Geschlecht',
        'en': 'Gender',
        'es': 'Género',
        'fr': 'Genre',
        'it': 'Genere',
        'el': 'Φύλο',
        'ru': 'Пол'
    },
    'childrenLabel': {
        'de': 'Kinder',
        'en': 'Children',
        'es': 'Hijos',
        'fr': 'Enfants',
        'it': 'Figli',
        'el': 'Παιδιά',
        'ru': 'Дети'
    },
    'pregnancyLabel': {
        'de': 'Schwangerschaft',
        'en': 'Pregnancy',
        'es': 'Embarazo',
        'fr': 'Grossesse',
        'it': 'Gravidanza',
        'el': 'Εγκυμοσύνη',
        'ru': 'Беременность'
    },
    'unnamed': {
        'de': 'Unbenannt',
        'en': 'Unnamed',
        'es': 'Sin nombre',
        'fr': 'Sans nom',
        'it': 'Senza nome',
        'el': 'Χωρίς όνομα',
        'ru': 'Без имени'
    },
    'monthOrdinal': {
        'de': '{month}. Monat',
        'en': 'Month {month}',
        'es': 'Mes {month}',
        'fr': 'Mois {month}',
        'it': 'Mese {month}',
        'el': '{month}ος μήνας',
        'ru': '{month}-й месяц'
    },
    'countryGermany': {
        'de': 'Deutschland',
        'en': 'Germany',
        'es': 'Alemania',
        'fr': 'Allemagne',
        'it': 'Germania',
        'el': 'Γερμανία',
        'ru': 'Германия'
    },
    'countryAustria': {
        'de': 'Österreich',
        'en': 'Austria',
        'es': 'Austria',
        'fr': 'Autriche',
        'it': 'Austria',
        'el': 'Αυστρία',
        'ru': 'Австрия'
    },
    'countrySwitzerland': {
        'de': 'Schweiz',
        'en': 'Switzerland',
        'es': 'Suiza',
        'fr': 'Suisse',
        'it': 'Svizzera',
        'el': 'Ελβετία',
        'ru': 'Швейцария'
    },
    'countryOther': {
        'de': 'Andere',
        'en': 'Other',
        'es': 'Otro',
        'fr': 'Autre',
        'it': 'Altro',
        'el': 'Άλλο',
        'ru': 'Другое'
    }
}

for lang in locale_files:
    filepath = f'src/i18n/locales/{lang}.ts'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    to_add = {}
    for k, trans in new_translations.items():
        if f'"{k}":' not in content:
            to_add[k] = trans[lang]

    if to_add:
        lines = []
        for k, v in to_add.items():
            escaped_v = v.replace('"', '\\"')
            lines.append(f'  "{k}": "{escaped_v}",')
        
        insert_str = '\n' + '\n'.join(lines) + '\n};'
        content = re.sub(r'\n\};\s*$', insert_str, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Added {len(to_add)} keys to {lang}.ts')
    else:
        print(f'All keys already in {lang}.ts')
