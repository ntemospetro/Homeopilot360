with open('src/components/TherapistProfileEditor.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const hasEmailChanged = emailInput.trim().toLowerCase() !== therapist.email.trim().toLowerCase();",
    "const hasEmailChanged = (emailInput || '').trim().toLowerCase() !== (therapist.email || '').trim().toLowerCase();"
)
content = content.replace(
    "const hasPhoneChanged = phoneInput.trim() !== therapist.telefon.trim();",
    "const hasPhoneChanged = (phoneInput || '').trim() !== (therapist.telefon || '').trim();"
)
content = content.replace(
    "praxisName.trim() !== (therapist.praxisName || '').trim() ||",
    "(praxisName || '').trim() !== (therapist.praxisName || '').trim() ||"
)
content = content.replace(
    "adresse.trim() !== (therapist.adresse || '').trim() ||",
    "(adresse || '').trim() !== (therapist.adresse || '').trim() ||"
)
content = content.replace(
    "land.trim() !== (therapist.land || 'Deutschland').trim();",
    "(land || '').trim() !== (therapist.land || 'Deutschland').trim();"
)
content = content.replace(
    "if (!emailInput.trim() || !emailInput.includes('@')) {",
    "if (!(emailInput || '').trim() || !(emailInput || '').includes('@')) {"
)
content = content.replace(
    "if (!phoneInput.trim()) {",
    "if (!(phoneInput || '').trim()) {"
)
content = content.replace(
    "if (passwordInput.trim().length < 6) {",
    "if ((passwordInput || '').trim().length < 6) {"
)
content = content.replace(
    "praxisName: praxisName.trim(),",
    "praxisName: (praxisName || '').trim(),"
)
content = content.replace(
    "adresse: adresse.trim(),",
    "adresse: (adresse || '').trim(),"
)
content = content.replace(
    "land: land.trim(),",
    "land: (land || '').trim(),"
)
content = content.replace(
    "email: emailInput.trim(),",
    "email: (emailInput || '').trim(),"
)
content = content.replace(
    "telefon: phoneInput.trim(),",
    "telefon: (phoneInput || '').trim(),"
)
content = content.replace(
    "if (praxisName.trim() !== (therapist.praxisName || '').trim()) {",
    "if ((praxisName || '').trim() !== (therapist.praxisName || '').trim()) {"
)
content = content.replace(
    "const useState emailInput = therapist.email;", # oops
    ""
)

# And replace the states to initialize with defaults
content = content.replace(
    "const [emailInput, setEmailInput] = useState(therapist.email);",
    "const [emailInput, setEmailInput] = useState(therapist.email || '');"
)
content = content.replace(
    "const [phoneInput, setPhoneInput] = useState(therapist.telefon);",
    "const [phoneInput, setPhoneInput] = useState(therapist.telefon || '');"
)


with open('src/components/TherapistProfileEditor.tsx', 'w') as f:
    f.write(content)

