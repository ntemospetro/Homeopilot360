with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = '  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);\n  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);'
replacement = '  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);\n  const [isExtendedAnamnesisWizardOpen, setIsExtendedAnamnesisWizardOpen] = useState(false);\n  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);'

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/TherapistPanel.tsx', 'w') as f:
        f.write(content)
    print("State added")
else:
    print("Target not found")
