import { LanguageCode } from '../types';

export interface TermsAndConditions {
  title: string;
  lastUpdated: string;
  version: string;
  content: string;
}

export const DEFAULT_TERMS_BY_LANG: Record<LanguageCode, TermsAndConditions> = {
  de: {
    title: 'Allgemeine Geschäftsbedingungen (AGB) & Nutzungsbedingungen',
    lastUpdated: '15. Januar 2025',
    version: '2.4.0',
    content: `### § 1 Geltungsbereich und Vertragsgegenstand
(1) Die nachfolgenden Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der cloudbasierten homöopathischen Praxisverwaltungs- und Repertorisations-Plattform (nachfolgend **„Software“** oder **„Dienst“**) durch registrierte Heilpraktiker, Ärzte für Homöopathie, Therapeuten und therapeutische Praxen (nachfolgend **„Nutzer“** oder **„Therapeut“**).
(2) Das Angebot richtet sich ausschließlich an gewerbliche bzw. freiberufliche Anwender im Sinne des § 14 BGB. Verbraucher im Sinne des § 13 BGB sind von der Nutzung ausgeschlossen.
(3) Abweichende oder ergänzende Geschäftsbedingungen des Nutzers werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.

---

### § 2 Zweck der Software & Therapeutischer Haftungsausschluss
(1) Die Software stellt ein digitales Assistenzsystem zur strukturierten Erfassung von Erst- und Folgeanamnesen, Repertorisationsunterstützung nach den Prinzipien Samuel Hahnemanns sowie zur Falldokumentation dar.
(2) **Ausdrücklicher Hinweis:** Die durch die Software bzw. integrierte Analysealgorithmen ausgegebenen Mittelvorschläge, Potenzen, Modalitäten-Zuordnungen und Wahrscheinlichkeitswerte stellen **keine verbindliche medizinische Diagnose oder Therapieempfehlung** dar. 
(3) Die fachliche und rechtliche Letztverantwortung für die Auswahl der homöopathischen Arznei, deren Potenzierung, Dosierung und die therapeutische Gesamtbehandlung des Patienten verbleibt ausnahmslos beim behandelnden Therapeuten bzw. Arzt. Die Software ersetzt in keinem Fall die persönliche klinische Untersuchung und Befunderhebung.

---

### § 3 Registrierung, Therapeuten-Konto & Sorgfaltspflichten
(1) Die Nutzung der Software setzt eine Registrierung unter Angabe wahrheitsgemäßer und vollständiger Stammdaten (Name, Praxisanschrift, E-Mail-Adresse, Telefonnummer und Land) voraus.
(2) Der Nutzer ist verpflichtet, seine Zugangsdaten vor dem Zugriff unbefugter Dritter zu schützen. Bei Verdacht auf Missbrauch oder Datenverlust ist der Betreiber unverzüglich zu unterrichten.
(3) Jeder Nutzer darf nur ein Therapeuten-Konto führen, sofern nicht gesonderte Mehrplatz- oder Praxis-Lizenzvereinbarungen getroffen wurden.

---

### § 4 Tarife, Kontingente & Abrechnung
(1) **Kostenloser Test-Tarif:** Neu registrierte Nutzer erhalten standardmäßig Zugriff auf einen Test-Tarif mit einem Startkontingent von 3 vollständigen Analysen. Nach Erreichen des Limits wird die Repertorisationsfunktion gesperrt, bis ein Upgrade oder eine Freischaltung durch die Administration erfolgt.
(2) **Kostenpflichtige Pakete & Abonnements:** Über das System können individuelle Kontingent-Pakete (z. B. 10 Analysen) oder wiederkehrende Flatrate-Abonnements (z. B. Pro Unbegrenzt) gebucht werden.
(3) Alle angegebenen Preise verstehen sich in Euro (€) zuzüglich der jeweils geltenden gesetzlichen Mehrwertsteuer, sofern nicht anders ausgewiesen.
(4) Gebuchte Kontingente sind an das jeweilige Therapeuten-Konto gebunden und nicht auf Dritte übertragbar.

---

### § 5 Datenschutz, Berufsgeheimnis & Auftragsverarbeitung (DSGVO)
(1) Der Schutz personenbezogener Gesundheitsdaten der Patienten genießt höchste Priorität. Die Verarbeitung erfolgt im Einklang mit der EU-Datenschutz-Grundverordnung (DSGVO) sowie dem Bundesdatenschutzgesetz (BDSG).
(2) Soweit der Therapeut im Rahmen der Falldokumentation Patientendaten verarbeitet, schließen die Parteien auf Verlangen eine Vereinbarung zur Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO.
(3) Der Therapeut stellt sicher, dass Patientendaten vor der Eingabe pseudonymisiert werden oder die nach Art. 9 Abs. 2 lit. h DSGVO erforderliche Einwilligung der betroffenen Patienten zur digitalen Speicherung vorliegt.
(4) Sämtliche Datenübertragungen erfolgen verschlüsselt nach aktuellem Stand der Technik (TLS/SSL).

---

### § 6 Verfügbarkeit & Gewährleistung
(1) Der Betreiber bemüht sich um eine durchgehende Verfügbarkeit der Plattform von 99% im Jahresmittel. Ausgenommen hiervon sind notwendige Wartungsfenster sowie Ausfallzeiten aufgrund höherer Gewalt oder unverschuldeter technischer Störungen bei Netzinfrastruktur-Anbietern.
(2) Es gelten die gesetzlichen Gewährleistungsregelungen mit der Maßgabe, dass Mängelansprüche bei unentgeltlicher Nutzung (Test-Tarif) auf Vorsatz und grobe Fahrlässigkeit beschränkt sind.

---

### § 7 Haftungsbeschränkung
(1) Der Betreiber haftet uneingeschränkt bei Vorsatz, grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz.
(2) Bei leichter Fahrlässigkeit haftet der Betreiber nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht). In diesem Fall ist die Haftung der Höhe nach auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.
(3) Für Behandlungsfehler oder Fehlinterpretationen von Arzneimittelbildern durch den Therapeuten übernimmt der Betreiber keinerlei Haftung.

---

### § 8 Laufzeit, Kündigung & Datenexport
(1) Verträge über kostenlose Test-Tarife können von beiden Seiten jederzeit ohne Einhaltung einer Frist beendet werden.
(2) Abonnements mit monatlicher Laufzeit können mit einer Frist von 14 Tagen zum Monatsende gekündigt werden.
(3) Nach Beendigung des Nutzungsverhältnisses hat der Therapeut vor der Kontolöschung die Möglichkeit, seine erfassten Patientenfälle und Berichte in gängigen Datenformaten (z. B. PDF, CSV) zu exportieren.

---

### § 9 Änderungen der AGB
(1) Der Betreiber behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern, sofern hierfür triftige Gründe (z. B. Gesetzesänderungen, Erweiterung des Funktionsumfangs) vorliegen.
(2) Änderungen werden dem Therapeuten mindestens 4 Wochen vor Inkrafttreten per E-Mail oder über die Plattform mitgeteilt. Widerspricht der Nutzer nicht innerhalb dieser Frist, gelten die geänderten AGB als akzeptiert.

---

### § 10 Schlussbestimmungen
(1) Es gilt ausschließlich das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
(2) Erfüllungsort und ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist, soweit gesetzlich zulässig, der Sitz des Betreibers.
(3) Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt.`
  },

  en: {
    title: 'General Terms and Conditions (GTC) & Terms of Use',
    lastUpdated: 'January 15, 2025',
    version: '2.4.0',
    content: `### § 1 Scope of Application and Subject Matter
(1) The following General Terms and Conditions (GTC) govern the use of the cloud-based homeopathic practice management and repertorization platform (hereinafter **"Software"** or **"Service"**) by registered naturopaths, homeopathic physicians, therapists, and clinics (hereinafter **"User"** or **"Therapist"**).
(2) The service is intended exclusively for commercial and professional practitioners. Consumers are excluded from use.
(3) Differing or supplementary terms of the user do not become part of the agreement unless explicitly approved in writing.

---

### § 2 Purpose of the Software & Medical Disclaimer
(1) The software serves as a digital assistance system for structured recording of initial and follow-up case histories, repertorization support based on Samuel Hahnemann's classical principles, and clinical documentation.
(2) **Explicit Notice:** Remedy suggestions, potencies, modality ratings, and probability calculations generated by the software or integrated algorithms **do not constitute binding medical diagnoses or treatment recommendations**.
(3) Full professional and legal responsibility for the selection of remedies, dosage, potencies, and overall patient treatment remains strictly with the treating practitioner. The software does not replace physical examination or clinical diagnostic evaluation.

---

### § 3 Registration, Account & Due Diligence
(1) Use of the software requires prior registration providing truthful and complete information (name, practice address, email, telephone number, and country).
(2) The user is obligated to safeguard login credentials against unauthorized third-party access. In case of suspected security breaches, the operator must be notified immediately.
(3) Each practitioner may maintain only one active therapist account unless multi-seat license agreements have been established.

---

### § 4 Tariffs, Quotas & Billing
(1) **Free Trial Plan:** Newly registered users receive default access to a trial tier with an initial quota of 3 complete case analyses. Once the limit is reached, repertorization is locked until an upgrade or administrative unlocking occurs.
(2) **Paid Packages & Subscriptions:** Individual quota packages (e.g., 10 analyses) or unlimited flat-rate subscriptions (e.g., Pro Unlimited) can be booked via the system.
(3) All listed prices are in Euros (€) plus applicable statutory VAT, unless stated otherwise.
(4) Booked quotas are tied to the therapist's account and are non-transferable.

---

### § 5 Data Protection, Confidentiality & GDPR Compliance
(1) The protection of personal patient health data is paramount. Processing complies with the EU General Data Protection Regulation (GDPR) and applicable data privacy statutes.
(2) Where patient data is processed during documentation, the parties enter into a Data Processing Agreement (DPA) pursuant to Art. 28 GDPR upon request.
(3) The therapist ensures that patient records are either pseudonymized or that explicit patient consent under Art. 9(2)(h) GDPR is secured before digital storage.
(4) All network data transmissions are encrypted according to modern TLS/SSL cryptographic standards.

---

### § 6 Availability & Warranty
(1) The operator endeavors to maintain an average platform availability of 99% annually, excluding scheduled maintenance windows and force majeure incidents.
(2) Statutory warranty rules apply; claims under the free trial plan are limited to intent and gross negligence.

---

### § 7 Limitation of Liability
(1) The operator is liable without limitation for willful misconduct, gross negligence, injury to life, body, or health, and under mandatory product liability laws.
(2) In cases of slight negligence, liability is limited to breaches of material contractual obligations and capped at predictable, contract-typical damages.
(3) The operator assumes no liability for treatment errors or homeopathic remedy misinterpretations made by the practitioner.

---

### § 8 Duration, Cancellation & Data Export
(1) Free trial accounts may be terminated by either party at any time without notice.
(2) Monthly subscriptions may be cancelled with a 14-day notice period to the end of the billing month.
(3) Upon termination, the practitioner retains the ability to export patient records, anamnesis logs, and reports in standard formats (e.g., PDF, CSV) prior to account deletion.

---

### § 9 Amendments to Terms
(1) The operator reserves the right to amend these terms for legitimate reasons (e.g., regulatory changes, feature expansion).
(2) Amendments will be announced at least 4 weeks prior to taking effect. Continued use without objection constitutes acceptance.

---

### § 10 Final Provisions
(1) The laws of the Federal Republic of Germany apply, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).
(2) Jurisdiction and place of performance is the registered seat of the operator, as permitted by law.
(3) Should individual provisions be invalid, the validity of the remaining terms remains unaffected.`
  },

  fr: {
    title: 'Conditions Générales de Vente (CGV) & Conditions d\'Utilisation',
    lastUpdated: '15 janvier 2025',
    version: '2.4.0',
    content: `### § 1 Champ d'application et objet du contrat
(1) Les présentes Conditions Générales (CGV) régissent l'utilisation de la plateforme logicielle en ligne de gestion de cabinet et de répertorisation homéopathique (ci-après le **« Logiciel »** ou le **« Service »**) par les naturopathes, médecins homéopathes et thérapeutes certifiés (ci-après **« Utilisateur »** ou **« Thérapeute »**).
(2) L'offre s'adresse exclusivement aux professionnels et praticiens libéraux. Les consommateurs au sens de la loi sont exclus.
(3) Les conditions générales dérogatoires du client ne s'appliquent pas, sauf accord écrit préalable.

---

### § 2 Objet du logiciel & Exclusion de responsabilité thérapeutique
(1) Le logiciel constitue un système d'assistance numérique pour la saisie structurée des anamnèses, l'aide à la répertorisation selon Samuel Hahnemann et la tenue des dossiers patients.
(2) **Avertissement formel :** Les suggestions de remèdes, dilutions et modalités calculées par le logiciel **ne constituent en aucun cas un diagnostic médical ou une prescription obligatoire**.
(3) La responsabilité clinique et juridique du choix du remède, du dosage et de la prise en charge globale incombe exclusivement au praticien traitant. Le logiciel ne remplace pas l'examen clinique direct.

---

### § 3 Inscription, compte praticien et devoir de diligence
(1) L'accès requiert une inscription préalable avec des coordonnées exactes (nom, adresse professionnelle, courriel, téléphone et pays).
(2) L'utilisateur s'engage à protéger ses identifiants contre tout accès non autorisé par des tiers.
(3) Chaque praticien ne peut détenir qu'un seul compte individuel, hors accords multi-postes spécifiques.

---

### § 4 Tarifs, quotas et facturation
(1) **Formule d'essai gratuite :** Les nouveaux utilisateurs bénéficient d'un quota de départ de 3 analyses complètes. Une fois le quota atteint, la répertorisation est verrouillée jusqu'à mise à niveau ou déblocage par l'administrateur.
(2) **Forfaits et abonnements payants :** Des forfaits de recharges ou des abonnements illimités (Pro Illimité) sont disponibles.
(3) Les prix s'entendent en euros (€) hors taxes, sauf mention contraire.
(4) Les crédits d'analyse sont attachés au compte du thérapeute et sont non transmissibles.

---

### § 5 Protection des données & Conformité RGPD
(1) La protection des données de santé à caractère personnel est prioritaire. Le traitement respecte le Règlement Général sur la Protection des Données (RGPD).
(2) Sur demande, un contrat de sous-traitance de données (DPA) conformément à l'Art. 28 RGPD est conclu entre les parties.
(3) Le praticien s'assure que les données patients sont pseudonymisées ou couvertes par le consentement explicite requis à l'Art. 9(2)(h) RGPD.
(4) Tous les flux de données sont chiffrés selon les standards TLS/SSL actuels.

---

### § 6 Disponibilité et garantie
(1) L'opérateur vise une disponibilité annuelle moyenne de 99%, hors maintenances programmées et force majeure.
(2) Les garanties légales s'appliquent, avec responsabilité limitée à la faute lourde pour la formule d'essai gratuite.

---

### § 7 Limitation de responsabilité
(1) La responsabilité est engagée de plein droit en cas de faute intentionnelle ou d'atteinte à l'intégrité physique.
(2) En cas de négligence légère, la responsabilité est limitée aux dommages prévisibles et directs.
(3) Aucune responsabilité n'est encourue au titre des choix thérapeutiques ou erreurs d'interprétation du praticien.

---

### § 8 Durée, résiliation et exportation des données
(1) Les comptes gratuits peuvent être résiliés à tout moment sans préavis.
(2) Les abonnements mensuels sont résiliables avec un préavis de 14 jours avant la fin de la période mensuelle.
(3) Avant clôture définitive du compte, le praticien peut exporter ses dossiers patients et rapports aux formats standards (PDF, CSV).

---

### § 9 Modification des conditions
(1) L'opérateur se réserve le droit de modifier les présentes conditions pour des motifs légitimes.
(2) Tout changement sera notifié au moins 4 semaines avant son entrée en vigueur.

---

### § 10 Dispositions finales
(1) Le droit de la République fédérale d'Allemagne est seul applicable, à l'exclusion de la CVIM (CISG).
(2) Le tribunal compétent est celui du siège de l'opérateur, dans les limites permises par la loi.`
  },

  es: {
    title: 'Términos y Condiciones Generales (TCG) & Condiciones de Uso',
    lastUpdated: '15 de enero de 2025',
    version: '2.4.0',
    content: `### § 1 Ámbito de aplicación y objeto contractual
(1) Los siguientes Términos y Condiciones Generales (TCG) regulan el uso de la plataforma en la nube para la gestión de consultas y repertorización homeopática (en adelante, **«Software»** o **«Servicio»**) por parte de naturópatas, médicos homeópatas y terapeutas registrados (en adelante, **«Usuario»** o **«Terapeuta»**).
(2) El servicio está destinado exclusivamente a profesionales y autónomos. Quedan excluidos los consumidores finales.
(3) No se aceptarán condiciones generales divergentes salvo confirmación previa por escrito.

---

### § 2 Finalidad del software y descargo de responsabilidad terapéutica
(1) El software es un sistema de asistencia digital para el registro estructurado de anamnesis, repertorización según Samuel Hahnemann y documentación clínica.
(2) **Advertencia expresa:** Las sugerencias de remedios, potencias y modalidades emitidas por el software **no constituyen un diagnóstico médico vinculante ni una pauta prescriptiva obligatoria**.
(3) La responsabilidad profesional y legal en la elección de la medicina homeopática, posología y tratamiento del paciente recae exclusivamente en el terapeuta o médico tratante. El software no sustituye el examen clínico personal.

---

### § 3 Registro, cuenta de terapeuta y deber de diligencia
(1) El uso requiere registro previo con datos veraces (nombre, dirección de consulta, correo, teléfono y país).
(2) El usuario debe custodiar sus claves de acceso evitando el acceso no autorizado de terceros.
(3) Cada terapeuta solo podrá disponer de una cuenta de usuario, salvo acuerdos multiusuario específicos.

---

### § 4 Tarifas, cuotas y facturación
(1) **Plan de prueba gratuito:** Los nuevos usuarios disponen de una cuota inicial de 3 análisis completos. Al alcanzar el límite, la repertorización se bloquea hasta su ampliación o desbloqueo por el administrador.
(2) **Paquetes y suscripciones:** Se pueden adquirir paquetes de análisis adicionales o suscripciones planas (Pro Ilimitado).
(3) Los precios se expresan en euros (€) más los impuestos legalmente aplicables.
(4) Las cuotas contratadas están vinculadas a la cuenta del terapeuta y no son transferibles.

---

### § 5 Protección de datos y RGPD
(1) La protección de los datos de salud de los pacientes es prioritaria, conforme al Reglamento General de Protección de Datos (RGPD).
(2) A petición, se formalizará un contrato de encargo de tratamiento (DPA) según el Art. 28 del RGPD.
(3) El terapeuta se asegurará de seudonimizar los registros o contar con el consentimiento del paciente exigido por el Art. 9(2)(h) del RGPD.
(4) Todas las transmisiones se cifran mediante estándares modernos TLS/SSL.

---

### § 6 Disponibilidad y garantía
(1) Se procura una disponibilidad media anual del 99%, salvo tareas de mantenimiento y causas de fuerza mayor.
(2) Rigen las garantías legales, limitándose en el plan gratuito a dolo y negligencia grave.

---

### § 7 Limitación de responsabilidad
(1) La responsabilidad es ilimitada en casos de dolo, negligencia grave o daños a la vida o integridad física.
(2) En negligencia leve, la responsabilidad queda limitada a daños previsibles típicos del contrato.
(3) No se asume responsabilidad alguna por errores de tratamiento o interpretación de síntomas por parte del terapeuta.

---

### § 8 Duración, rescisión y exportación de datos
(1) Las cuentas gratuitas pueden cancelarse en cualquier momento sin plazo previo.
(2) Las suscripciones mensuales pueden cancelarse con 14 días de preaviso respecto al fin de mes.
(3) Antes del cierre de la cuenta, el terapeuta puede exportar todos sus casos e informes en formatos estándar (PDF, CSV).

---

### § 9 Modificaciones de los términos
(1) El operador se reserva el derecho de modificar los términos por causas justificadas con un preaviso mínimo de 4 semanas.

---

### § 10 Disposiciones finales
(1) Se aplica exclusivamente el derecho de la República Federal de Alemania, con exclusión de la Convención de Viena (CISG).
(2) La jurisdicción corresponde a la sede del operador según los términos legalmente permitidos.`
  },

  it: {
    title: 'Termini e Condizioni Generali (TCG) & Condizioni d\'Uso',
    lastUpdated: '15 gennaio 2025',
    version: '2.4.0',
    content: `### § 1 Ambito di applicazione e oggetto del contratto
(1) Le presenti Condizioni Generali regolano l'uso della piattaforma cloud per la gestione dello studio e la repertorizzazione omeopatica (di seguito **«Software»** o **«Servizio»**) da parte di naturopati, medici omeopati e terapisti registrati (di seguito **«Utente»** o **«Terapeuta»**).
(2) Il servizio è destinato esclusivamente a professionisti. I consumatori privati sono esclusi.
(3) Eventuali condizioni contrattuali difformi dell'utente non si applicano, salvo accettazione scritta.

---

### § 2 Finalità del software & Esclusione di responsabilità medica
(1) Il software è un sistema di assistenza digitale per la raccolta strutturata di anamnesi, il supporto alla repertorizzazione secondo Samuel Hahnemann e la documentazione clinica.
(2) **Avvertenza espressa:** I suggerimenti di rimedi, le potenze e le scale di probabilità calcolate dal sistema **non costituiscono una diagnosi medica o una terapia vincolante**.
(3) La piena responsabilità clinica e giuridica nella scelta del rimedio, dosaggio e percorso terapeutico ricade sempre sul medico o terapeuta curante. Il software non sostituisce la visita medica diretta.

---

### § 3 Registrazione, account e obbligo di diligenza
(1) L'uso richiede una registrazione completa e veritiera dei dati di contatto (nome, indirizzo professionale, email, telefono e paese).
(2) L'utente è tenuto a custodire le proprie credenziali per impedire accessi non autorizzati.
(3) È consentito un solo account per terapeuta, salvo specifici accordi per studi associati.

---

### § 4 Tariffe, crediti e fatturazione
(1) **Piano di prova gratuito:** I nuovi registrati ricevono un credito iniziale di 3 analisi complete. Raggiunto il limite, la repertorizzazione viene bloccata fino al passaggio a un piano Pro o allo sblocco amministrativo.
(2) **Pacchetti e abbonamenti:** È possibile acquistare pacchetti di analisi o abbonamenti a tariffa fissa illimitata (Pro Illimitato).
(3) Tutti i prezzi indicati sono in Euro (€) più IVA di legge, ove applicabile.
(4) I crediti sono personali e non trasferibili a terzi.

---

### § 5 Protezione dei dati e conformità GDPR
(1) La tutela dei dati sanitari dei pazienti è prioritaria e conforme al Regolamento Generale sulla Protezione dei Dati (GDPR).
(2) Su richiesta, viene stipulato un accordo sul trattamento dei dati (DPA) ai sensi dell'Art. 28 GDPR.
(3) Il terapeuta assicura che i dati siano pseudonimizzati o coperti dal consenso informato previsto dall'Art. 9(2)(h) GDPR.
(4) Tutti i dati sono trasmessi con crittografia moderna TLS/SSL.

---

### § 6 Disponibilità e garanzia
(1) Il gestore garantisce una disponibilità media annua del 99%, escluse manutenzioni ordinarie e cause di forza maggiore.
(2) Nel piano di prova gratuito la responsabilità è limitata a dolo e colpa grave.

---

### § 7 Limitazione di responsabilità
(1) La responsabilità è illimitata per dolo, colpa grave o lesioni alla salute.
(2) In caso di colpa lieve, la responsabilità è limitata ai danni diretti e prevedibili.
(3) Nessuna responsabilità è assunta per errori diagnostici o prescrizioni errate del terapeuta.

---

### § 8 Durata, recesso ed esportazione dati
(1) I profili di prova gratuiti possono essere revocati in qualsiasi momento.
(2) Gli abbonamenti mensili possono essere disdetti con 14 giorni di preavviso rispetto alla fine del mese.
(3) Prima della cancellazione definitiva dell'account, il terapeuta può esportare tutti i dati e le cartelle nei formati standard (PDF, CSV).

---

### § 9 Modifiche contrattuali
(1) Il gestore si riserva il diritto di aggiornare i termini con un preavviso minimo di 4 settimane.

---

### § 10 Disposizioni finali
(1) Si applica esclusivamente il diritto della Repubblica Federale di Germania, con esclusione della Convenzione ONU sulla compravendita (CISG).
(2) Foro competente esclusivo è la sede del gestore nei limiti di legge.`
  },

  el: {
    title: 'Γενικοί Όροι Συναλλαγών (ΓΟΣ) & Όροι Χρήσης',
    lastUpdated: '15 Ιανουαρίου 2025',
    version: '2.4.0',
    content: `### § 1 Πεδίο εφαρμογής και αντικείμενο σύμβασης
(1) Οι ακόλουθοι Γενικοί Όροι Συναλλαγών (ΓΟΣ) ρυθμίζουν τη χρήση της διαδικτυακής πλατφόρμας διαχείρισης ιατρείου και ομοιοπαθητικής ρεπερτοριοποίησης (εφεξής **«Λογισμικό»** ή **«Υπηρεσία»**) από πιστοποιημένους ομοιοπαθητικούς ιατρούς, θεραπευτές και θεραπευτικά κέντρα (εφεξής **«Χρήστης»** ή **«Θεραπευτής»**).
(2) Η υπηρεσία απευθύνεται αποκλειστικά σε επαγγελματίες υγείας. Οι τελικοί καταναλωτές αποκλείονται από τη χρήση.
(3) Αποκλίνοντες όροι του χρήστη δεν ισχύουν χωρίς ρητή έγγραφη συναίνεση.

---

### § 2 Σκοπός λογισμικού & Θεραπευτική αποποίηση ευθύνης
(1) Το λογισμικό αποτελεί ψηφιακό σύστημα υποστήριξης για τη δομημένη καταγραφή αρχικών και επαναληπτικών αναμνήσεων, την υποβοήθηση ρεπερτοριοποίησης κατά Samuel Hahnemann και την τεκμηρίωση περιστατικών.
(2) **Ρητή επισήμανση:** Οι προτάσεις ομοιοπαθητικών φαρμάκων, δυναμοποιήσεων και πιθανοτήτων που εξάγονται από το λογισμικό **δεν αποτελούν ιατρική διάγνωση ή δεσμευτική θεραπευτική οδηγία**.
(3) Η απόλυτη επιστημονική και νομική ευθύνη για την επιλογή φαρμάκου, δοσολογίας και συνολικής αγωγής παραμένει εξ ολοκλήρου στον θεράποντα ιατρό ή θεραπευτή. Το λογισμικό δεν υποκαθιστά την κλινική εξέταση.

---

### § 3 Εγγραφή, λογαριασμός θεραπευτή & υποχρέωση επιμέλειας
(1) Η χρήση προϋποθέτει εγγραφή με ακριβή στοιχεία (ονοματεπώνυμο, διεύθυνση ιατρείου, email, τηλέφωνο και χώρα).
(2) Ο χρήστης οφείλει να προστατεύει τα στοιχεία πρόσβασής του από μη εξουσιοδοτημένα τρίτα πρόσωπα.
(3) Επιτρέπεται μόνο ένας ενεργός λογαριασμός ανά θεραπευτή, εκτός εάν υπάρχει ειδική συμφωνία πολλαπλών θέσεων.

---

### § 4 Τιμολόγια, όρια χρήσης & χρεώσεις
(1) **Δωρεάν δοκιμαστικό πακέτο:** Οι νέοι χρήστες λαμβάνουν αρχικό όριο 3 πλήρων αναλύσεων περιστατικών. Μετά την εξάντληση του ορίου, η λειτουργία ρεπερτοριοποίησης κλειδώνει έως ότου γίνει αναβάθμιση ή ενεργοποίηση από τη διαχείριση.
(2) **Συνδρομές και πακέτα αναλύσεων:** Διατίθενται πακέτα αναλύσεων ή απεριόριστες συνδρομές (Pro Απεριόριστο).
(3) Όλες οι τιμές εκφράζονται σε Ευρώ (€) πλέον του νόμιμου ΦΠΑ.
(4) Οι μονάδες αναλύσεων συνδέονται με τον λογαριασμό και δεν μεταβιβάζονται.

---

### § 5 Προστασία δεδομένων & Συμμόρφωση GDPR
(1) Η προστασία των προσωπικών δεδομένων υγείας των ασθενών αποτελεί ύψιστη προτεραιότητα σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR).
(2) Κατόπιν αιτήματος, συνάπτεται σύμβαση επεξεργασίας δεδομένων (DPA) κατά το Άρθρο 28 GDPR.
(3) Ο θεραπευτής διασφαλίζει ότι τα δεδομένα είναι ψευδωνυμοποιημένα ή καλύπτονται από τη ρητή συγκατάθεση του ασθενούς βάσει του Άρθρου 9(2)(h) GDPR.
(4) Όλες οι μεταφορές δεδομένων κρυπτογραφούνται με σύγχρονα πρωτόκολλα TLS/SSL.

---

### § 6 Διαθεσιμότητα & εγγύηση
(1) Ο διαχειριστής επιδιώκει μέση ετήσια διαθεσιμότητα 99%, εξαιρουμένων προγραμματισμένων συντηρήσεων και ανωτέρας βίας.
(2) Στο δοκιμαστικό πακέτο η ευθύνη περιορίζεται σε δόλο και βαριά αμέλεια.

---

### § 7 Περιορισμός ευθύνης
(1) Η ευθύνη είναι απεριόριστη σε περιπτώσεις δόλου, βαριάς αμέλειας ή βλάβης της ζωής και της σωματικής ακεραιότητας.
(2) Σε ελαφρά αμέλεια, η ευθύνη περιορίζεται στις προβλέψιμες τυπικές ζημίες.
(3) Δεν αναλαμβάνεται καμία ευθύνη για θεραπευτικά σφάλματα ή λανθασμένη αξιολόγηση συμπτωμάτων από τον θεραπευτή.

---

### § 8 Διάρκεια, καταγγελία & εξαγωγή δεδομένων
(1) Οι δωρεάν δοκιμαστικοί λογαριασμοί μπορούν να τερματιστούν ανά πάσα στιγμή χωρίς προθεσμία.
(2) Οι μηνιαίες συνδρομές καταγγέλλονται με προειδοποίηση 14 ημερών πριν το τέλος του μήνα.
(3) Πριν την οριστική διαγραφή του λογαριασμού, ο θεραπευτής μπορεί να εξάγει όλα τα αρχεία ασθενών και αναλύσεων σε τυπικές μορφές (PDF, CSV).

---

### § 9 Τροποποίηση όρων
(1) Ο διαχειριστής διατηρεί το δικαίωμα τροποποίησης των όρων με ειδοποίηση τουλάχιστον 4 εβδομάδων.

---

### § 10 Τελικές διατάξεις
(1) Εφαρμόζεται αποκλειστικά το δίκαιο της Ομοσπονδιακής Δημοκρατίας της Γερμανίας.
(2) Αρμόδια δικαστήρια ορίζονται τα δικαστήρια της έδρας του διαχειριστή.`
  },

  ru: {
    title: 'Общие условия заключения сделок (ОУС) & Правила использования',
    lastUpdated: '15 января 2025 г.',
    version: '2.4.0',
    content: `### § 1 Область применения и предмет договора
(1) Настоящие Общие условия (ОУС) регулируют использование облачной платформы для ведения гомеопатической практики и реперторизации (далее **«Программное обеспечение»** или **«Сервис»**) зарегистрированными натуропатами, врачами-гомеопатами и клиниками (далее **«Пользователь»** или **«Терапевт»**).
(2) Сервис предназначен исключительно для профессионального и коммерческого использования. Потребители к использованию не допускаются.
(3) Любые противоречащие условия пользователя признаются недействительными без предварительного письменного согласия.

---

### § 2 Назначение ПО & Медицинский отказ от ответственности
(1) ПО представляет собой цифровую систему поддержки для структурированного сбора анамнеза, реперторизации по классическим принципам Самуэля Ганемана и документирования историй болезни.
(2) **Прямое уведомление:** Рекомендации препаратов, потенций и модальностей, выдаваемые системой, **не являются обязательным медицинским диагнозом или назначением**.
(3) Вся профессиональная и юридическая ответственность за выбор гомеопатического средства, дозировку и общее лечение пациента лежит исключительно на лечащем враче. Программа не заменяет личного клинического осмотра.

---

### § 3 Регистрация, аккаунт терапевта и правила безопасности
(1) Использование требует регистрации с указанием достоверных данных (ФИО, адрес практики, email, телефон и страна).
(2) Пользователь обязан защищать данные учетной записи от доступа третьих лиц.
(3) Разрешено иметь только один аккаунт терапевта, если не оформлена корпоративная лицензия.

---

### § 4 Тарифы, квоты и оплата
(1) **Бесплатный тестовый тариф:** Новые пользователи получают стартовую квоту на 3 полных анализа. При исчерпании квоты реперторизация блокируется до перехода на платный тариф или разблокировки администратором.
(2) **Пакеты и подписки:** Доступны дополнительные пакеты анализов или безлимитные тарифы (Pro Безлимитный).
(3) Все цены указаны в евро (€) без учета установленного законом НДС.
(4) Квоты привязаны к аккаунту терапевта и не подлежат передаче другим лицам.

---

### § 5 Защита данных и соответствие GDPR
(1) Защита персональных данных пациентов о здоровье имеет приоритетное значение и осуществляется в соответствии с регламентом GDPR.
(2) По запросу стороны заключают соглашение об обработке данных (DPA) в соответствии со ст. 28 GDPR.
(3) Терапевт гарантирует псевдонимизацию данных либо наличие согласия пациента согласно ст. 9(2)(h) GDPR.
(4) Все соединения шифруются по современным стандартам TLS/SSL.

---

### § 6 Доступность и гарантии
(1) Среднегодовая доступность платформы составляет 99%, за исключением плановых технических работ и форс-мажора.
(2) В бесплатном тарифе ответственность ограничивается умыслом и грубой неосторожностью.

---

### § 7 Ограничение ответственности
(1) Ответственность не ограничивается в случаях умысла, грубой неосторожности или причинения вреда здоровью.
(2) При легкой неосторожности ответственность ограничена предвидимым ущербом.
(3) Разработчик не несет ответственности за ошибки в лечении или неверную интерпретацию симптомов терапевтом.

---

### § 8 Срок действия, расторжение и экспорт данных
(1) Бесплатные аккаунты могут быть закрыты в любой момент без предварительного уведомления.
(2) Ежемесячные подписки расторгаются с уведомлением за 14 дней до окончания расчетного периода.
(3) До удаления аккаунта терапевт может экспортировать все истории болезни и отчеты в форматах PDF и CSV.

---

### § 9 Изменение условий
(1) Администратор оставляет за собой право обновлять условия с предварительным уведомлением за 4 недели.

---

### § 10 Заключительные положения
(1) Применяется исключительно законодательство Федеративной Республики Германия.
(2) Местом подсудности является местонахождение администратора сервиса.`
  }
};

export const DEFAULT_TERMS: TermsAndConditions = DEFAULT_TERMS_BY_LANG.de;

export function getDefaultTermsForLanguage(lang?: LanguageCode): TermsAndConditions {
  if (!lang || !DEFAULT_TERMS_BY_LANG[lang]) {
    return DEFAULT_TERMS_BY_LANG.de;
  }
  return DEFAULT_TERMS_BY_LANG[lang];
}
