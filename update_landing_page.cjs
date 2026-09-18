const fs = require('fs');

let file = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

file = file.replace(/<span>Künstliche Intelligenz für die klassische Homöopathie<\/span>/g, "<span>{t('landingSubtitle')}</span>");
file = file.replace(/Präzise Repertorisation & <span/g, "{t('landingTitle1')} <span");
file = file.replace(/>intelligente Anamnese<\/span>/g, ">{t('landingTitle2')}</span>");
file = file.replace(/Revolutionieren Sie Ihre Praxis mit dem fortschrittlichsten digitalen Assistenten.[\s\S]*?Mittelwahl in Sekunden./g, "{t('landingDescription')}");
file = file.replace(/<span>Jetzt kostenlos testen<\/span>/g, "<span>{t('landingBtnTest')}</span>");
file = file.replace(/>\s*Zum Login\s*<\/button>/g, ">{t('landingBtnLogin')}</button>");
file = file.replace(/<span>DSGVO Konform<\/span>/g, "<span>{t('landingBadgeGdpr')}</span>");
file = file.replace(/<span>Keine Kreditkarte nötig<\/span>/g, "<span>{t('landingBadgeNoCard')}</span>");
file = file.replace(/>Entwickelt für den Praxisalltag<\/h2>/g, ">{t('landingFeaturesTitle')}</h2>");
file = file.replace(/Unsere Plattform kombiniert das klassische Wissen der Materia Medica mit modernster KI-Technologie,\s*um Sie bei der optimalen Mittelwahl zu unterstützen./g, "{t('landingFeaturesDesc')}");
file = file.replace(/>Intelligente Anamnese<\/h3>/g, ">{t('landingFeature1Title')}</h3>");
file = file.replace(/>\s*Dynamische, sich anpassende Fragen basierend auf der Hauptbeschwerde. Erkennt selbstständig, ob es sich um physische Leiden oder psychische Belastungen \(Organon §210-230\) handelt.\s*<\/p>/g, ">{t('landingFeature1Desc')}</p>");
file = file.replace(/>Präzise Repertorisation<\/h3>/g, ">{t('landingFeature2Title')}</h3>");
file = file.replace(/>\s*Der Algorithmus verknüpft Symptome, Gemüt, Modalitäten und Auslöser, um zielgenaue Mittel-Vorschläge inklusive Begründung und Potenzen zu generieren.\s*<\/p>/g, ">{t('landingFeature2Desc')}</p>");
file = file.replace(/>Digitale Patientenakte<\/h3>/g, ">{t('landingFeature3Title')}</h3>");
file = file.replace(/>\s*Verwalten Sie Fälle, Behandlungsverläufe und verordnete Mittel übersichtlich an einem Ort. Mit automatischer Zusammenfassung der Spontanberichte.\s*<\/p>/g, ">{t('landingFeature3Desc')}</p>");
file = file.replace(/>Mehrsprachigkeit<\/h3>/g, ">{t('landingFeature4Title')}</h3>");
file = file.replace(/>\s*Die Oberfläche sowie die Patientenfragen sind in 7 Sprachen verfügbar \(u\.a\. Deutsch, Englisch, Spanisch, Russisch\)\. Ideal für internationale Praxen.\s*<\/p>/g, ">{t('landingFeature4Desc')}</p>");
file = file.replace(/>Höchste Datensicherheit<\/h3>/g, ">{t('landingFeature5Title')}</h3>");
file = file.replace(/>\s*Alle Patientendaten werden strikt nach DSGVO-Richtlinien verarbeitet. Modernste Verschlüsselung sorgt für den Schutz sensibler Gesundheitsdaten.\s*<\/p>/g, ">{t('landingFeature5Desc')}</p>");
file = file.replace(/>Sichere Cloud-Speicherung<\/h3>/g, ">{t('landingFeature6Title')}</h3>");
file = file.replace(/>\s*Greifen Sie von überall auf Ihre Fälle zu. Egal ob am Praxis-PC, auf dem Tablet oder Smartphone – Ihre Daten sind sicher und geräteübergreifend synchronisiert.\s*<\/p>/g, ">{t('landingFeature6Desc')}</p>");

file = file.replace(/>In 3 Schritten zum passenden Mittel<\/h2>/g, ">{t('landingStepsTitle')}</h2>");
file = file.replace(/>\s*Der Behandlungsablauf ist intuitiv gestaltet, um Ihnen so viel Arbeit wie möglich abzunehmen.\s*<\/p>/g, ">{t('landingStepsDesc')}</p>");
file = file.replace(/>Symptome erfassen<\/h3>/g, ">{t('landingStep1Title')}</h3>");
file = file.replace(/>\s*Geben Sie die Hauptbeschwerde in eigenen Worten ein. Die KI analysiert den Text sofort.\s*<\/p>/g, ">{t('landingStep1Desc')}</p>");
file = file.replace(/>Gezielte Rückfragen<\/h3>/g, ">{t('landingStep2Title')}</h3>");
file = file.replace(/>\s*Das System generiert dynamische, auf den Patienten zugeschnittene Fragen zu Modalitäten und Gemüt.\s*<\/p>/g, ">{t('landingStep2Desc')}</p>");
file = file.replace(/>Analyse & Vorschlag<\/h3>/g, ">{t('landingStep3Title')}</h3>");
file = file.replace(/>\s*Erhalten Sie eine strukturierte Auswertung mit klaren Mittelvorschlägen und Materia Medica Hinweisen.\s*<\/p>/g, ">{t('landingStep3Desc')}</p>");

file = file.replace(/>Bereit für die Zukunft der Homöopathie\?<\/h2>/g, ">{t('landingCtaTitle')}</h2>");
file = file.replace(/>\s*Melden Sie sich jetzt an und testen Sie die Software kostenlos. Überzeugen Sie sich selbst von der präzisen Unterstützung im Praxisalltag.\s*<\/p>/g, ">{t('landingCtaDesc')}</p>");
file = file.replace(/<span>Jetzt Account erstellen<\/span>/g, "<span>{t('landingCtaBtn')}</span>");

fs.writeFileSync('src/components/LandingPage.tsx', file);
