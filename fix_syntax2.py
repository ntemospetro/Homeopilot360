with open('src/components/TherapistProfileEditor.tsx', 'r') as f:
    content = f.read()

# Did I delete the entire password section?
if 'Passwort ändern' not in content:
    print("PASSWORD SECTION IS MISSING!")

# Did I delete the form end tag?
if '</form>' not in content:
    print("FORM END TAG IS MISSING!")
    
