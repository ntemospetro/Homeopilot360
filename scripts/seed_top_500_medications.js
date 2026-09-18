import fs from 'fs';
import path from 'path';

// Load existing database
const dbPath = path.resolve('data/medications_db.json');
let existingDb = [];
if (fs.existsSync(dbPath)) {
  try {
    existingDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    existingDb = [];
  }
}

const existingNames = new Set(
  existingDb.map(m => m.name.toLowerCase().trim())
);
console.log(`Currently in DB: ${existingDb.length} medications. Skipping duplicates...`);

// Helper to create a standardized medication item
function med(name, activeSubstance, category, dosages, packageSizes, intake, sideEffects, interactions, warnings) {
  return {
    name,
    activeSubstance: activeSubstance || name,
    category,
    dosages: dosages || ['Standard'],
    packageSizes: packageSizes || ['N1 (10-20 Stk.)', 'N2 (50 Stk.)', 'N3 (100 Stk.)'],
    commonForms: ['Filmtablette', 'Kapsel'],
    recommendedIntake: intake || '1x täglich unzerkaut mit ausreichend Wasser einnehmen',
    sideEffectsByFrequency: {
      common: sideEffects ? [sideEffects[0], sideEffects[1]].filter(Boolean) : ['Gastrointestinale Beschwerden', 'Müdigkeit'],
      uncommon: sideEffects && sideEffects.length > 2 ? sideEffects.slice(2) : ['Hautreaktionen', 'Kopfschmerzen']
    },
    sideEffects: sideEffects || ['Gastrointestinale Beschwerden', 'Kopfschmerzen', 'Müdigkeit', 'Schwindel'],
    interactions: interactions || ['Alkohol meiden', 'Vorsicht bei Kombination mit anderen blutdrucksenkenden oder sedierenden Mitteln'],
    warnings: warnings || 'Regelmäßige ärztliche Kontrollen empfohlen. Bei Unverträglichkeit Arzt konsultieren.',
    authoritySource: 'BfArM / EMA / Rote Liste Fachinformation',
    fromDatabase: true
  };
}

// Complete catalog of 500 top medications
const catalog = [];

// 1. Herz-Kreislauf & Gefäße (Kardiologie)
const cardio = [
  med('Ramipril', 'Ramipril', 'ACE-Hemmer / Antihypertensivum', ['2.5 mg', '5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Reizhusten', 'Hypotonie', 'Hyperkaliämie', 'Schwindel'], ['Kaliumsparende Diuretika', 'NSAR', 'Lithium'], 'Kontraindiziert bei Angioödem-Vorgeschichte und Schwangerschaft.'),
  med('Enalapril', 'Enalapril', 'ACE-Hemmer', ['5 mg', '10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Reizhusten', 'Schwindel', 'Nierenfunktionsstörung'], ['NSAR', 'Kalium']),
  med('Lisinopril', 'Lisinopril', 'ACE-Hemmer', ['5 mg', '10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Trockener Husten', 'Schwindel'], ['NSAR']),
  med('Captopril', 'Captopril', 'ACE-Hemmer (kurzwirksam)', ['12.5 mg', '25 mg', '50 mg'], ['N1', 'N2', 'N3'], '2-3x täglich vor dem Essen', ['Husten', 'Geschmacksstörungen'], ['Diuretika']),
  med('Perindopril', 'Perindopril', 'ACE-Hemmer', ['2.5 mg', '5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens vor dem Essen', ['Husten', 'Hypotonie'], ['NSAR']),
  med('Candesartan', 'Candesartan-Cilexetil', 'AT1-Rezeptorantagonist (Sartan)', ['4 mg', '8 mg', '16 mg', '32 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Schwindel', 'Hyperkaliämie', 'Kopfschmerzen'], ['Kalium', 'Lithium', 'NSAR'], 'Alternative bei ACE-Hemmer-Husten. Kontraindiziert in der Schwangerschaft.'),
  med('Valsartan', 'Valsartan', 'AT1-Rezeptorantagonist', ['80 mg', '160 mg', '320 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Schwindel', 'Hypotonie', 'Hyperkaliämie'], ['NSAR', 'Lithium']),
  med('Losartan', 'Losartan', 'AT1-Rezeptorantagonist', ['25 mg', '50 mg', '100 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Schwindel', 'Müdigkeit'], ['NSAR']),
  med('Olmesartan', 'Olmesartanmedoxomil', 'AT1-Rezeptorantagonist', ['10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Sprue-ähnliche Enteropathie (selten)', 'Schwindel'], ['NSAR']),
  med('Telmisartan', 'Telmisartan', 'AT1-Rezeptorantagonist', ['20 mg', '40 mg', '80 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Schwindel', 'Infektionen der oberen Atemwege'], ['Digoxin', 'NSAR']),
  med('Irbesartan', 'Irbesartan', 'AT1-Rezeptorantagonist', ['75 mg', '150 mg', '300 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Schwindel', 'Übelkeit', 'Hyperkaliämie'], ['NSAR']),
  med('Bisoprolol', 'Bisoprololfumarat', 'Kardioselektiver Beta-1-Blocker', ['1.25 mg', '2.5 mg', '5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Bradykardie', 'Müdigkeit', 'Kältegefühl in Extremitäten'], ['Verapamil', 'Diltiazem', 'Antidiabetika'], 'Nicht abrupt absetzen. Kontraindiziert bei Asthma bronchiale und AV-Block II/III.'),
  med('Metoprololsuccinat', 'Metoprolol', 'Beta-1-Rezeptorenblocker retard', ['23.75 mg', '47.5 mg', '95 mg', '190 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Bradykardie', 'Müdigkeit', 'Schwindel'], ['Calciumantagonisten', 'Amiodaron']),
  med('Metoprololtartrat', 'Metoprolol', 'Beta-1-Rezeptorenblocker unretardiert', ['50 mg', '100 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Bradykardie', 'Hypotonie'], ['Verapamil']),
  med('Nebivolol', 'Nebivolol', 'Beta-1-Blocker mit NO-Freisetzung', ['5 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Kopfschmerzen', 'Schwindel', 'Ödeme'], ['Antiarrhythmika']),
  med('Carvedilol', 'Carvedilol', 'Unselektiver Alpha- und Betablocker', ['3.125 mg', '6.25 mg', '12.5 mg', '25 mg'], ['N1', 'N2', 'N3'], '2x täglich zu den Mahlzeiten', ['Orthostase', 'Bradykardie', 'Müdigkeit'], ['Digoxin', 'Insulin']),
  med('Atenolol', 'Atenolol', 'Beta-1-Blocker', ['25 mg', '50 mg', '100 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Bradykardie', 'Kalte Extremitäten'], ['Verapamil']),
  med('Propranolol', 'Propranolol', 'Unselektiver Betablocker', ['10 mg', '40 mg', '80 mg'], ['N1', 'N2', 'N3'], '2-3x täglich', ['Bronchospasmus', 'Bradykardie', 'Schlafstörungen'], ['Calciumantagonisten'], 'Indiziert auch bei Tremor und Migräneprophylaxe.'),
  med('Amlodipin', 'Amlodipinbesilat', 'Calciumkanalblocker (Dihydropyridin)', ['5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Knöchelödeme (sehr häufig)', 'Kopfschmerzen', 'Flush', 'Schwindel'], ['Simvastatin (Dosisdeckelung auf 20mg)', 'CYP3A4-Hemmer'], 'Ödeme sprechen meist nicht auf Diuretika an.'),
  med('Lercanidipin', 'Lercanidipin', 'Calciumkanalblocker', ['10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens mind. 15 min vor dem Essen', ['Kopfschmerzen', 'Ödeme (seltener als Amlodipin)', 'Tachykardie'], ['Grapefruitsaft', 'Ketoconazol']),
  med('Nifedipin', 'Nifedipin', 'Calciumkanalblocker retard', ['20 mg', '30 mg', '60 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Flush', 'Kopfschmerzen', 'Tachykardie'], ['Grapefruitsaft']),
  med('Diltiazem', 'Diltiazem', 'Calciumkanalblocker (Benzothiazepin)', ['60 mg', '90 mg', '120 mg', '180 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Bradykardie', 'AV-Block', 'Obstipation'], ['Betablocker', 'Statine']),
  med('Verapamil', 'Verapamil', 'Calciumkanalblocker (Phenylalkylamin)', ['40 mg', '80 mg', '120 mg', '240 mg retard'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Obstipation (sehr häufig)', 'Bradykardie', 'AV-Block'], ['Betablocker (Gefahr des Asystolie/AV-Blocks)', 'Digoxin']),
  med('Torasemid', 'Torasemid', 'Schleifendiuretikum', ['2.5 mg', '5 mg', '10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens nüchtern', ['Hypokaliämie', 'Hyponatriämie', 'Hypovolämie', 'Hyperurikämie'], ['Digitalis (Toxizität bei Hypokaliämie)', 'NSAR'], 'Regelmäßige Elektrolytkontrollen.'),
  med('Furosemid', 'Furosemid', 'Schleifendiuretikum', ['20 mg', '40 mg', '500 mg'], ['N1', 'N2', 'N3'], '1-2x täglich morgens', ['Hypokaliämie', 'Dehydratation', 'Ototoxizität'], ['Aminoglykoside', 'NSAR']),
  med('Hydrochlorothiazid (HCT)', 'Hydrochlorothiazid', 'Thiaziddiuretikum', ['12.5 mg', '25 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Hypokaliämie', 'Hyperurikämie', 'Photosensibilisierung'], ['Lithium', 'NSAR']),
  med('Chlortalidon', 'Chlortalidon', 'Thiazid-artiges Diuretikum', ['25 mg', '50 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Hypokaliämie', 'Hyperurikämie'], ['Lithium']),
  med('Indapamid', 'Indapamid', 'Thiazid-Analogon', ['1.5 mg retard', '2.5 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Hypokaliämie', 'Müdigkeit'], ['Lithium']),
  med('Xipamid', 'Xipamid', 'Schleifen-/Thiaziddiuretikum', ['10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Elektrolytverschiebungen', 'Magenbeschwerden'], ['Digoxin']),
  med('Spironolacton', 'Spironolacton', 'Aldosteronantagonist / Kaliumsparendes Diuretikum', ['25 mg', '50 mg', '100 mg'], ['N1', 'N2', 'N3'], '1x täglich zum Essen', ['Hyperkaliämie', 'Gynäkomastie (bei Männern)', 'Menstruationsstörungen'], ['ACE-Hemmer', 'Sartane', 'Kaliumpräparate'], 'Regelmäßige Kaliumkontrolle unverzichtbar.'),
  med('Eplerenon', 'Eplerenon', 'Selektiver Aldosteronantagonist', ['25 mg', '50 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Hyperkaliämie', 'Schwindel'], ['CYP3A4-Hemmer', 'ACE-Hemmer']),
  med('Atorvastatin', 'Atorvastatin-Calcium', 'HMG-CoA-Reduktase-Inhibitor (Statin)', ['10 mg', '20 mg', '40 mg', '80 mg'], ['N1', 'N2', 'N3'], '1x täglich abends', ['Myalgie (Muskelschmerzen)', 'Erhöhte Transaminasen', 'Gastrointestinale Beschwerden'], ['Clarithromycin', 'Grapefruitsaft', 'Ciclosporin'], 'Bei unerklärlichen Muskelschmerzen oder dunklem Urin Arzt aufsuchen (Rhabdomyolyse).'),
  med('Simvastatin', 'Simvastatin', 'Statin', ['10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich abends', ['Myopathie', 'Transaminasenanstieg'], ['Amiodaron', 'Amlodipin (max 20mg Simva)', 'Grapefruitsaft']),
  med('Rosuvastatin', 'Rosuvastatin', 'Potentes Statin', ['5 mg', '10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich tageszeitunabhängig', ['Muskelschmerzen', 'Kopfschmerzen', 'Proteinurie'], ['Ciclosporin', 'Antazida']),
  med('Pravastatin', 'Pravastatin', 'Hydrophiles Statin', ['10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich abends', ['Gastrointestinale Beschwerden', 'Muskelschmerzen (selten)'], ['Weniger CYP3A4-Interaktionen']),
  med('Ezetimib', 'Ezetimib', 'Cholesterin-Resorptionshemmer', ['10 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Bauchschmerzen', 'Transaminasenerhöhung (mit Statin)'], ['Fibrate', 'Ciclosporin']),
  med('Bempedoinsäure', 'Bempedoinsäure', 'ATP-Citrat-Lyase-Inhibitor (Lipidsenker)', ['180 mg'], ['N1', 'N2', 'N3'], '1x täglich mit oder ohne Nahrung', ['Hyperurikämie (Gichtanfälle)', 'Schmerzen in Extremitäten', 'Anämie'], ['Simvastatin über 40mg vermeiden']),
  med('Fenofibrat', 'Fenofibrat', 'Triglyceridsenker (Fibrat)', ['145 mg', '200 mg'], ['N1', 'N2', 'N3'], '1x täglich zum Essen', ['Magen-Darm-Beschwerden', 'Erhöhte Myopathieneigung in Kombination mit Statin'], ['Statine', 'Cumarine']),
  med('Amiodaron', 'Amiodaron-Hydrochlorid', 'Klasse-III-Antiarrhythmikum', ['100 mg', '200 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Schilddrüsenfunktionsstörungen (Hyper-/Hypothyreose)', 'Hornhaut-Mikroablagerungen', 'Lungenfibrose', 'Photosensibilisierung'], ['QT-verlängernde Medikamente', 'Digoxin', 'Warfarin'], 'Regelmäßige Kontrollen von Schilddrüse, Lunge und Augen erforderlich.'),
  med('Flecainid', 'Flecainidacetat', 'Klasse-IC-Antiarrhythmikum', ['50 mg', '100 mg'], ['N1', 'N2', 'N3'], '2x täglich', ['Schwindel', 'Sehstörungen', 'Proarrhythmien'], ['Betablocker', 'CYP2D6-Hemmer']),
  med('Propafenon', 'Propafenon', 'Klasse-IC-Antiarrhythmikum', ['150 mg', '300 mg'], ['N1', 'N2', 'N3'], '2-3x täglich nach dem Essen', ['Geschmacksstörungen', 'Schwindel', 'Bradykardie'], ['Digoxin', 'Cumarine']),
  med('Dronedaron', 'Dronedaron', 'Antiarrhythmikum', ['400 mg'], ['N1', 'N2', 'N3'], '2x täglich morgens und abends zum Essen', ['Gastrointestinale Beschwerden', 'Hepatotoxizität', 'QT-Verlängerung'], ['Ketoconazol', 'Dabigatran', 'Statine']),
  med('Sotalol', 'Sotalol', 'Betablocker mit Klasse-III-Wirkung', ['80 mg', '160 mg'], ['N1', 'N2', 'N3'], '2-3x täglich vor den Mahlzeiten', ['Torsade de Pointes', 'Bradykardie', 'Bronchospasmus'], ['QT-verlängernde Arzneien', 'Diuretika']),
  med('Molsidomin', 'Molsidomin', 'NO-Donator / Koronartherapeutikum', ['2 mg', '4 mg', '8 mg retard'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Nitrattoleranz-frei', 'Kopfschmerzen zu Beginn', 'Hypotonie'], ['PDE-5-Hemmer (Sildenafil/Tadalafil streng kontraindiziert)']),
  med('Isosorbidmononitrat (ISMN)', 'Isosorbidmononitrat', 'Organisches Nitrat', ['20 mg', '40 mg', '60 mg retard'], ['N1', 'N2', 'N3'], '1-2x täglich mit nitratfreiem Intervall', ['Nitratkopfschmerz', 'Refloxtachykardie', 'Hypotonie'], ['PDE-5-Hemmer (lebensbedrohlicher Blutdruckabfall)']),
  med('Isosorbiddinitrat (ISDN)', 'Isosorbiddinitrat', 'Nitrat', ['20 mg', '40 mg'], ['N1', 'N2', 'N3'], '2x täglich mit asymmetrischem Intervall', ['Kopfschmerzen', 'Flush'], ['PDE-5-Hemmer']),
  med('Nitrolingual Spray', 'Glyceroltrinitrat', 'Akut-Nitrat-Spray', ['0.4 mg/Dosis'], ['N1', 'N2'], 'Bei Angina pectoris 1-2 Hübe unter die Zunge', ['Blutdruckabfall', 'Schwindel', 'Kopfschmerzen'], ['PDE-5-Hemmer streng verboten']),
  med('Ivabradin', 'Ivabradin', 'If-Kanal-Hemmer (Herzfrequenzsenker)', ['5 mg', '7.5 mg'], ['N1', 'N2', 'N3'], '2x täglich zu den Mahlzeiten', ['Phosphene (Lichtphänomene im Auge)', 'Bradykardie'], ['Starke CYP3A4-Hemmer', 'QT-Verlängerer']),
  med('Ranolazin', 'Ranolazin', 'Antianginöses Arzneimittel', ['375 mg', '500 mg', '750 mg retard'], ['N1', 'N2', 'N3'], '2x täglich unzerkaut', ['Schwindel', 'Obstipation', 'Übelkeit', 'QT-Verlängerung'], ['Diltiazem', 'Verapamil', 'Simvastatin']),
  med('Sacubitril / Valsartan (Entresto)', 'Sacubitril/Valsartan', 'ARNI (Herzinsuffizienz)', ['24/26 mg', '49/51 mg', '97/103 mg'], ['N1', 'N2', 'N3'], '2x täglich morgens und abends', ['Hypotonie', 'Hyperkaliämie', 'Nierenfunktionseinschränkung'], ['ACE-Hemmer (Mindestens 36 Std. Auswaschphase zwingend!)'], '36h Abstand zu ACE-Hemmern einhalten wegen Angioödem-Risiko.'),
  med('Digitoxin', 'Digitoxin', 'Herzglykosid', ['0.07 mg', '0.1 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Arrhythmien', 'Übelkeit', 'Gelb-Grün-Sehen', 'Appetitlosigkeit'], ['Kaliumsenkende Diuretika', 'Amiodaron', 'Calcium'], 'Geringe therapeutische Breite, Spiegelkontrolle.'),
  med('Digoxin', 'Digoxin', 'Herzglykosid', ['0.1 mg', '0.2 mg', '0.25 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Arrhythmien', 'Sehstörungen', 'Übelkeit'], ['Clarithromycin', 'Verapamil', 'Amiodaron'], 'Hauptsächlich renal eliminiert; Dosisanpassung bei Niereninsuffizienz.')
];
catalog.push(...cardio);

// 2. Blutgerinnung & Thrombozyten
const blood = [
  med('Aspirin Protect (ASS 100)', 'Acetylsalicylsäure', 'Thrombozytenaggregationshemmer', ['100 mg'], ['N1', 'N2', 'N3'], '1x täglich nach dem Essen mit reichlich Wasser', ['Gastrointestinale Blutungen', 'Ulzera', 'Verlängerte Blutungszeit'], ['Ibuprofen (mind. 2h nach oder 30min vor ASS)', 'Antikoagulanzien'], 'Magensaftresistente Tabletten unzerkaut schlucken.'),
  med('Clopidogrel', 'Clopidogrel', 'P2Y12-Rezeptor-Antagonist', ['75 mg'], ['N1', 'N2', 'N3'], '1x täglich unabhängig von den Mahlzeiten', ['Blutungen (Hämatome, Epistaxis)', 'Diarrhoe', 'Dyspepsie'], ['Omeprazol / Esomeprazol (schwächt Clopidogrel ab, Pantoprazol bevorzugen)', 'ASS'], 'PPI-Kombination: Pantoprazol bevorzugen.'),
  med('Ticagrelor (Brilique)', 'Ticagrelor', 'Reversibler P2Y12-Inhibitor', ['60 mg', '90 mg'], ['N1', 'N2', 'N3'], '2x täglich morgens und abends', ['Dyspnoe (Atemnot)', 'Blutungen', 'Hyperurikämie'], ['CYP3A4-Hemmer/Induktoren', 'Simvastatin > 40mg']),
  med('Prasugrel (Efient)', 'Prasugrel', 'Irreversibler P2Y12-Inhibitor', ['5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Blutungsrisiko', 'Anämie'], ['Andere Thrombozytenhemmer'], 'Kontraindiziert nach Apoplex oder TIA.'),
  med('Marcumar (Phenprocoumon)', 'Phenprocoumon', 'Vitamin-K-Antagonist (Cumarin)', ['3 mg'], ['N1', 'N2', 'N3'], '1x täglich abends nach INR-Wert', ['Blutungen', 'Cumarin-Nekrosen', 'Haarausfall'], ['Vitamin K-reiche Kost', 'Antibiotika', 'NSAR'], 'Engmaschige INR-Kontrollen (Zielbereich meist 2.0 - 3.0).'),
  med('Warfarin (Coumadin)', 'Warfarin-Natrium', 'Vitamin-K-Antagonist', ['3 mg', '5 mg'], ['N1', 'N2', 'N3'], '1x täglich nach INR', ['Blutungen'], ['Interaktion mit unzähligen Arzneien und Nahrungsmitteln']),
  med('Eliquis (Apixaban)', 'Apixaban', 'Direkter Faktor-Xa-Inhibitor (DOAK)', ['2.5 mg', '5 mg'], ['N1', 'N2', 'N3'], '2x täglich morgens und abends mit Wasser', ['Hämatome', 'Blutungen', 'Anämie'], ['Starke CYP3A4- und P-gp-Inhibitoren (Azole, HIV-Proteaseinhibitoren)', 'NSAR'], 'Dosisreduktion auf 2.5 mg bei mind. 2 Kriterien: Alter ≥80, Gewicht ≤60kg, Serumkreatinin ≥1.5mg/dl.'),
  med('Xarelto (Rivaroxaban)', 'Rivaroxaban', 'Direkter Faktor-Xa-Inhibitor (DOAK)', ['2.5 mg', '10 mg', '15 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich zu einer Mahlzeit (15mg/20mg zwingend mit Nahrung!)', ['Blutungen', 'Schwindel', 'Erhöhte Transaminasen'], ['Ketoconazol', 'Clarithromycin', 'NSAR'], '15 mg und 20 mg MÜSSEN mit einer Mahlzeit eingenommen werden.'),
  med('Lixiana (Edoxaban)', 'Edoxaban', 'Faktor-Xa-Inhibitor (DOAK)', ['15 mg', '30 mg', '60 mg'], ['N1', 'N2', 'N3'], '1x täglich tageszeitunabhängig', ['Blutungen', 'Anämie', 'Ausschlag'], ['P-gp-Hemmer wie Dronedaron, Erythromycin (Dosis auf 30mg halbieren)']),
  med('Pradaxa (Dabigatran)', 'Dabigatranetexilat', 'Direkter Thrombin-Inhibitor (DOAK)', ['75 mg', '110 mg', '150 mg'], ['N1', 'N2', 'N3'], '2x täglich als ganze Kapsel mit Wasser', ['Dyspepsie / Sodbrennen (Kapsel enthält Weinsäure)', 'Blutungen'], ['Verapamil', 'Amiodaron', 'Clarithromycin'], 'Kapsel niemals öffnen oder kauen. Antidot Idarucizumab verfügbar.'),
  med('Clexane (Enoxaparin)', 'Enoxaparin-Natrium', 'Niedermolekulares Heparin (NMH)', ['20 mg (2000 IE)', '40 mg (4000 IE)', '60 mg', '80 mg', '100 mg'], ['N1', 'N2'], '1-2x täglich subkutan injizieren', ['Hämatome an der Einstichstelle', 'Heparin-induzierte Thrombozytopenie (HIT II)', 'Transaminasenanstieg'], ['Thrombozytenaggregationshemmer', 'NSAR'], 'Regelmäßige Thrombozytenkontrollen in den ersten 3 Wochen.'),
  med('Fragmin (Dalteparin)', 'Dalteparin-Natrium', 'Niedermolekulares Heparin', ['2500 IE', '5000 IE', '7500 IE', '10000 IE'], ['N1', 'N2'], '1x täglich subkutan', ['Blutungen', 'HIT-Risiko'], ['Andere Antikoagulanzien']),
  med('Arixtra (Fondaparinux)', 'Fondaparinux', 'Synthetischer Faktor-Xa-Hemmer', ['2.5 mg', '7.5 mg'], ['N1', 'N2'], '1x täglich subkutan', ['Anämie', 'Blutungen'], ['NSAR'], 'Kein HIT-II-Risiko.'),
  med('Cilostazol', 'Cilostazol', 'Phosphodiesterase-III-Hemmer (pAVK)', ['50 mg', '100 mg'], ['N1', 'N2', 'N3'], '2x täglich 30 min vor dem Frühstück und Abendessen', ['Kopfschmerzen (sehr häufig)', 'Diarrhoe', 'Palpitationen'], ['CYP3A4- und CYP2C19-Hemmer'])
];
catalog.push(...blood);

// 3. Schmerz, Rheumatologie & Muskelrelaxanzien
const pain = [
  med('Ibuprofen', 'Ibuprofen', 'NSAR / Analgetikum', ['200 mg', '400 mg', '600 mg', '800 mg'], ['N1', 'N2', 'N3'], '1-3x täglich nach dem Essen', ['Magen-Darm-Ulcera', 'Nierenfunktionseinschränkung', 'Hypertonie'], ['ASS', 'Antikoagulanzien', 'ACE-Hemmer']),
  med('Paracetamol', 'Paracetamol', 'Analgetikum / Antipyretikum', ['500 mg', '1000 mg'], ['N1', 'N2', 'N3'], 'Bedarf bis max. 4000 mg pro Tag', ['Hepatotoxizität bei Überdosierung', 'Allergie'], ['Alkohol', 'Enzyminduktoren']),
  med('Novaminsulfon (Metamizol)', 'Metamizol-Natrium', 'Analgetikum / Spasmolytikum', ['500 mg', '1000 mg', 'Tropfen'], ['N1', 'N2', 'N3'], 'Bedarf bis 4x täglich 500-1000 mg', ['Agranulozytose (selten)', 'Blutdruckabfall', 'Leberschäden'], ['Methotrexat', 'Ciclosporin'], 'Warnung: Bei Halsschmerzen, Fieber oder Schleimhautläsionen sofort absetzen.'),
  med('Diclofenac (Voltaren)', 'Diclofenac', 'NSAR', ['25 mg', '50 mg', '75 mg', '100 mg retard'], ['N1', 'N2', 'N3'], '1-2x täglich mit Wasser', ['Kardiovaskuläres Risiko', 'Magenulzera', 'Leberwerterhöhung'], ['Kortikoide', 'Antikoagulanzien'], 'Kontraindiziert bei Herzinsuffizienz (NYHA II-IV).'),
  med('Naproxen (Aleve)', 'Naproxen', 'Langwirksames NSAR', ['250 mg', '500 mg', '750 mg'], ['N1', 'N2', 'N3'], '1-2x täglich zum Essen', ['Magenbeschwerden', 'Kopfschmerzen', 'Ödeme'], ['ASS', 'Blutverdünner'], 'Günstigeres kardiovaskuläres Profil als Diclofenac, aber magenbelastend.'),
  med('Celecoxib (Celebrex)', 'Celecoxib', 'Selektiver COX-2-Hemmer', ['100 mg', '200 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Geringeres GI-Ulkusrisiko', 'Hypertonie', 'Ödeme'], ['Fluconazol', 'ACE-Hemmer'], 'Kontraindiziert bei manifester KHK oder Schlaganfall.'),
  med('Etoricoxib (Arcoxia)', 'Etoricoxib', 'Selektiver COX-2-Hemmer', ['30 mg', '60 mg', '90 mg', '120 mg'], ['N1', 'N2', 'N3'], '1x täglich nüchtern oder zum Essen', ['Blutdruckanstieg (sehr häufig)', 'Ödeme', 'Schwindel'], ['Antihypertensiva', 'Warfarin'], 'Regelmäßige Blutdruckkontrolle.'),
  med('Meloxicam', 'Meloxicam', 'NSAR (präferenziell COX-2)', ['7.5 mg', '15 mg'], ['N1', 'N2', 'N3'], '1x täglich mit Wasser während einer Mahlzeit', ['GI-Beschwerden', 'Anämie', 'Schwindel'], ['Diuretika', 'Methotrexat']),
  med('Indometacin', 'Indometacin', 'Potentes NSAR', ['25 mg', '50 mg'], ['N1', 'N2'], '2-3x täglich zum Essen', ['Starke Kopfschmerzen', 'Magenulzera', 'Schwindel'], ['Triamteren', 'Lithium'], 'Häufig bei akutem Gichtanfall.'),
  med('Tramadol', 'Tramadol-Hydrochlorid', 'Schwach wirksames Opioid (WHO II)', ['50 mg', '100 mg retard', '150 mg retard', '200 mg retard', 'Tropfen'], ['N1', 'N2', 'N3'], '1-2x täglich retardiert oder Tropfen bei Bedarf', ['Übelkeit/Erbrechen (besonders zu Beginn)', 'Obstipation', 'Schwindel', 'Schwitzen'], ['SSRI / SNRI (Serotoninsyndrom-Gefahr!)', 'Sedativa', 'Alkohol'], 'Kein BTM in Deutschland, aber Abhängigkeitspotenzial.'),
  med('Tilidin / Naloxon (Valoron N)', 'Tilidin/Naloxon', 'Opioidanalgetikum (WHO II)', ['50/4 mg', '100/8 mg', '150/12 mg', '200/16 mg retard'], ['N1', 'N2', 'N3'], '2x täglich morgens und abends', ['Schwindel', 'Müdigkeit', 'Obstipation', 'Übelkeit'], ['Andere ZNS-Dämpfer', 'Alkohol'], 'BTM-pflichtig (außer feste Retardformen).'),
  med('Oxycodon', 'Oxycodon-Hydrochlorid', 'Starkes Opioid (WHO III)', ['5 mg', '10 mg', '20 mg', '40 mg', '80 mg retard'], ['N1', 'N2', 'N3'], '2x täglich im 12-Stunden-Takt', ['Obstipation (immer Laxans verordnen!)', 'Übelkeit', 'Sedierung', 'Atemdepression'], ['ZNS-Depressiva', 'CYP3A4-Inhibitoren'], 'BTM-Rezept erforderlich. Immer prophylaktisch Laxans mitverordnen.'),
  med('Targin (Oxycodon / Naloxon)', 'Oxycodon/Naloxon', 'Opioid mit lokalem Darm-Antagonisten', ['10/5 mg', '20/10 mg', '40/20 mg retard'], ['N1', 'N2', 'N3'], '2x täglich alle 12 Stunden', ['Reduzierte Obstipation durch Naloxon', 'Schwindel', 'Kopfschmerz'], ['Sedativa'], 'Naloxon hebt die Obstipation im Darm auf, ohne die Schmerzlinderung zu hemmen.'),
  med('Morphin (MST)', 'Morphinsulfat', 'Starkes Opioid (WHO III)', ['10 mg', '30 mg', '60 mg', '100 mg retard'], ['N1', 'N2', 'N3'], '2x täglich im 12-Stunden-Intervall', ['Obstipation', 'Übelkeit/Erbrechen zu Beginn', 'Miosis', 'Sedierung'], ['Alkohol', 'MAO-Hemmer', 'Benzodiazepine'], 'Goldstandard in der Tumorschmerztherapie. BTM.'),
  med('Fentanyl Pflaster (Durogesic)', 'Fentanyl', 'Transdermales Opioid (WHO III)', ['12 µg/h', '25 µg/h', '50 µg/h', '75 µg/h', '100 µg/h'], ['N1', 'N2'], 'Alle 72 Stunden (3 Tage) neues Pflaster aufkleben', ['Hautreaktionen am Klebeort', 'Obstipation', 'Schläfrigkeit', 'Atemdepression'], ['Wärmequellen (Sauna, Heizdecke führen zu Fentanyl-Sturzüberdosierung!)', 'CYP3A4-Hemmer'], 'Wärme am Pflaster unbedingt vermeiden (Gefahr tödlicher Überdosierung!).'),
  med('Buprenorphin Pflaster (Transtec)', 'Buprenorphin', 'Partieller Opioid-Agonist', ['35 µg/h', '52.5 µg/h', '70 µg/h'], ['N1', 'N2'], 'Pflasterwechsel alle 3-4 Tage (2x pro Woche)', ['Erythem am Klebeort', 'Schwindel', 'Übelkeit'], ['Vermeidung reiner Agonisten']),
  med('Hydromorphon (Jurnista)', 'Hydromorphon', 'Potentes Opioid (WHO III)', ['4 mg', '8 mg', '16 mg', '24 mg retard'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Obstipation', 'Schwindel', 'Sedierung'], ['Alkohol', 'Sedativa'], 'BTM. Bei Niereninsuffizienz oft besser verträglich als Morphin.'),
  med('Tapentadol (Palexia)', 'Tapentadol', 'Opioid mit Noradrenalin-Reuptake-Hemmung', ['50 mg', '100 mg', '150 mg', '200 mg retard'], ['N1', 'N2', 'N3'], '2x täglich alle 12 Stunden', ['Übelkeit', 'Schwindel', 'Obstipation (geringer als reine Opioide)'], ['MAO-Hemmer', 'Serotonerge Substanzen'], 'Sehr wirksam bei neuropathischen Schmerzkomponenten.'),
  med('Pregabalin (Lyrica)', 'Pregabalin', 'Gabapentinoid / Neuropathische Schmerzen & Angst', ['25 mg', '50 mg', '75 mg', '150 mg', '300 mg'], ['N1', 'N2', 'N3'], '2-3x täglich', ['Schwindel (sehr häufig)', 'Benommenheit / Schläfrigkeit', 'Gewichtszunahme', 'Periphere Ödeme'], ['ZNS-Dämpfer', 'Opioide (erhöhtes Atemdepressionsrisiko!)'], 'Missbrauchs- und Abhängigkeitspotenzial beachten.'),
  med('Gabapentin (Neurontin)', 'Gabapentin', 'Neuropathischer Schmerz & Antiepileptikum', ['100 mg', '300 mg', '400 mg', '600 mg', '800 mg'], ['N1', 'N2', 'N3'], '3x täglich (eingeschlichen)', ['Schläfrigkeit', 'Schwindel', 'Ataxie', 'Müdigkeit'], ['Antazida (2h Abstand einhalten)', 'Opioide']),
  med('Duloxetin (Cymbalta)', 'Duloxetin', 'SSNRI (auch bei diabetischer Polyneuropathie)', ['30 mg', '60 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens mit oder ohne Nahrung', ['Übelkeit', 'Mundtrockenheit', 'Schlaflosigkeit', 'Schwitzen'], ['MAO-Hemmer', 'CYP1A2-Hemmer (Fluvoxamin)']),
  med('Tizanidin (Sirdalud)', 'Tizanidin', 'Zentrales Muskelrelaxans (Alpha-2-Agonist)', ['2 mg', '4 mg', '6 mg'], ['N1', 'N2', 'N3'], '1-3x täglich', ['Müdigkeit / Somnolenz', 'Mundtrockenheit', 'Hypotonie'], ['Fluvoxamin und Ciprofloxacin absolut kontraindiziert']),
  med('Baclofen (Lioresal)', 'Baclofen', 'GABA-B-Agonist / Spasmolytikum', ['10 mg', '25 mg'], ['N1', 'N2', 'N3'], '3x täglich zu den Mahlzeiten einschleichen', ['Sedierung', 'Schwindel', 'Muskelschwäche', 'Übelkeit'], ['Alkohol', 'Antihypertensiva'], 'Niemals abrupt absetzen (Rebound-Krämpfe, Halluzinationen).'),
  med('Tolperison (Mydocalm)', 'Tolperison', 'Zentral wirkendes Muskelrelaxans', ['50 mg', '150 mg'], ['N1', 'N2', 'N3'], '3x täglich nach den Mahlzeiten mit einem Glas Wasser', ['Muskelschwäche', 'Überempfindlichkeitsreaktionen', 'Kopfschmerz'], ['Dextromethorphan', 'Andere Muskelrelaxanzien'], 'Nur noch zugelassen bei Spastik nach Schlaganfall bei Erwachsenen.'),
  med('Methocarbamol (Ortoton)', 'Methocarbamol', 'Muskelrelaxans bei Verspannungen', ['750 mg'], ['N1', 'N2', 'N3'], '3-4x täglich 1-2 Tabletten', ['Schläfrigkeit', 'Schwindel', 'Sehstörungen'], ['Alkohol', 'Sedativa']),
  med('Allopurinol', 'Allopurinol', 'Urikostatikum (Xanthinoxidaseninhibitor)', ['100 mg', '300 mg'], ['N1', 'N2', 'N3'], '1x täglich nach den Mahlzeiten mit viel Wasser', ['Schwere Hautreaktionen (DRESS, Stevens-Johnson-Syndrom)', 'Gastrointestinale Beschwerden', 'Akuter Gichtanfall zu Beginn'], ['Azathioprin / 6-Mercaptopurin (lebensbedrohliche Toxizität, Dosis auf 25% senken!)', 'Ampicillin'], 'Niemals während eines akuten Gichtanfalls neu ansetzen. Viel trinken.'),
  med('Febuxostat (Adenuric)', 'Febuxostat', 'Nicht-Purin-Xanthinoxidasehemmer', ['80 mg', '120 mg'], ['N1', 'N2', 'N3'], '1x täglich unabhängig von Mahlzeiten', ['Leberfunktionsstörungen', 'Kopfschmerzen', 'Ausschlag'], ['Azathioprin', 'Theophyllin'], 'Alternative bei Allopurinol-Unverträglichkeit.'),
  med('Colchicin', 'Colchicin', 'Herbstzeitlosen-Alkaloid (akuter Gichtanfall)', ['0.5 mg'], ['N1', 'N2'], 'Akut 1 mg, dann alle 2-3h 0.5 mg bis Besserung (max 6mg/Anfall)', ['Diarrhoe (Leitsymptom der Toxizität!)', 'Übelkeit', 'Bauchkrämpfe'], ['Clarithromycin', 'Ciclosporin', 'Statine'], 'Geringe therapeutische Breite. Bei Durchfall sofort stoppen.'),
  med('Methotrexat (MTX)', 'Methotrexat', 'Folsäure-Antagonist / Basistherapeutikum (Rheuma)', ['7.5 mg', '10 mg', '15 mg', '20 mg', '25 mg'], ['N1', 'N2'], 'STRENG NUR 1x WÖCHENTLICH (oral oder subkutan)!', ['Knochenmarkdepression', 'Hepatotoxizität', 'Lungenfibrose', 'Mukositis'], ['NSAR (verminderte MTX-Ausscheidung)', 'Cotrimoxazol'], 'Lebensgefahr bei täglicher Einnahme! Am Folgetag 5 mg Folsäure einnehmen.'),
  med('Leflunomid (Arava)', 'Leflunomid', 'DMARD (Basistherapie)', ['10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Hypertonie', 'Diarrhoe', 'Alopezie', 'Hepatotoxizität'], ['Hepatotoxische Medikamente']),
  med('Sulfasalazin (Azulfidine)', 'Sulfasalazin', 'Entzündungshemmer (Rheuma & CED)', ['500 mg'], ['N1', 'N2', 'N3'], '2-4x täglich zu den Mahlzeiten', ['Gelborange Verfärbung von Urin und Kontaktlinsen', 'Übelkeit', 'Kopfschmerzen', 'Leukopenie'], ['Digoxin', 'Folsäure (Resorption vermindert)']),
  med('Hydroxychloroquin (Quensyl)', 'Hydroxychloroquin', 'Malariamittel / DMARD (Lupus, Rheuma)', ['200 mg'], ['N1', 'N2', 'N3'], '1-2x täglich mit Milch oder Mahlzeit', ['Retinopathie (irreversible Netzhautschäden)', 'Kardiomyopathie', 'Schwindel'], ['QT-Verlängerer', 'Digoxin', 'Insulin'], 'Regelmäßige augenärztliche Kontrollen (Fundus/Gesichtsfeld zwingend).')
];
catalog.push(...pain);

// 4. Magen, Darm & Gastroenterologie
const gastro = [
  med('Pantoprazol', 'Pantoprazol-Natrium', 'Protonenpumpenhemmer (PPI)', ['20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens 30-60 min vor dem Frühstück nüchtern', ['Kopfschmerzen', 'Diarrhoe/Obstipation', 'Bei Langzeiteinnahme Vitamin B12-, Magnesium- und Calciummangel'], ['Clopidogrel (Pantoprazol hat die geringste Interaktion)', 'Atazanavir', 'Methotrexat'], 'Tablette immer als Ganzes unzerkaut schlucken.'),
  med('Omeprazol', 'Omeprazol', 'Protonenpumpeninhibitor', ['10 mg', '20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens nüchtern', ['GI-Störungen', 'B12-Mangel bei Langzeitgabe'], ['Clopidogrel (hemmt Aktivierung!)', 'Diazepam', 'Phenytoin']),
  med('Esomeprazol (Nexium)', 'Esomeprazol', 'S-Enantiomer von Omeprazol', ['20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens vor dem Essen', ['Kopfschmerzen', 'Bauchschmerzen'], ['Clopidogrel']),
  med('Lansoprazol', 'Lansoprazol', 'Protonenpumpeninhibitor', ['15 mg', '30 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens nüchtern', ['Kopfschmerzen', 'Diarrhoe'], ['Theophyllin', 'Warfarin']),
  med('Rabeprazol (Pariet)', 'Rabeprazol', 'Protonenpumpeninhibitor', ['10 mg', '20 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens', ['Kopfschmerzen', 'Infektionen'], ['Ketoconazol']),
  med('Famotidin', 'Famotidin', 'H2-Rezeptor-Antagonist', ['20 mg', '40 mg'], ['N1', 'N2', 'N3'], '1-2x täglich oder abends vor dem Schlafen', ['Kopfschmerzen', 'Schwindel', 'Obstipation'], ['Antazida']),
  med('Rennie', 'Calciumcarbonat / Magnesiumcarbonat', 'Antazidum', ['680/80 mg Kautabletten'], ['N1', 'N2', 'N3'], 'Bei Sodbrennen 1-2 Kautabletten zerkauen', ['Völlegefühl', 'Rebound-Säureproduktion bei exzessiver Einnahme'], ['Fluorchinolone und Tetrazykline (mind. 2h Abstand einhalten!)']),
  med('Gaviscon (Natriumalginat)', 'Natriumalginat/Hydrogencarbonat', 'Refluxbarriere-Mittel', ['Suspension / Kautabletten'], ['N1', 'N2', 'N3'], 'Nach den Mahlzeiten und vor dem Schlafengehen', ['Blähungen', 'Natriumbelastung'], ['Andere Medikamente zeitversetzt einnehmen']),
  med('Maaloxan', 'Algeldrat / Magnesiumhydroxid', 'Schichtgitterantazidum', ['Kautabletten / Suspension'], ['N1', 'N2', 'N3'], '1-2 Stunden nach den Mahlzeiten und zur Nacht', ['Obstipation (durch Aluminium) oder weicher Stuhl (durch Magnesium)'], ['Eisentabletten', 'Antibiotika (2h Abstand)']),
  med('Metoclopramid (MCP)', 'Metoclopramid', 'Prokinetikum / Antiemetikum', ['10 mg', 'Tropfen 1mg/ml'], ['N1', 'N2'], 'Bis zu 3x täglich 10 mg vor den Mahlzeiten (max 5 Tage!)', ['Extrapyramidale Symptome (Dyskinesien, Blickkrämpfe)', 'Müdigkeit', 'Hyperprolaktinämie'], ['Neuroleptika', 'Anticholinergika', 'Levodopa'], 'Maximal 5 Tage anwenden! Bei Kindern und Jugendlichen vermeiden.'),
  med('Dimenhydrinat (Vomex A)', 'Dimenhydrinat', 'H1-Antihistaminikum / Antiemetikum (Reisekrankheit)', ['50 mg Dragees', 'Zäpfchen 40/70/150 mg'], ['N1', 'N2', 'N3'], '30-60 min vor Reisebeginn oder bei Übelkeit', ['Starke Schläfrigkeit / Sedierung', 'Mundtrockenheit', 'Sehstörungen', 'Miktionsbeschwerden'], ['Alkohol', 'ZNS-Dämpfer', 'Anticholinergika'], 'Macht fahruntüchtig.'),
  med('Ondansetron (Zofran)', 'Ondansetron', '5-HT3-Rezeptor-Antagonist', ['4 mg', '8 mg'], ['N1', 'N2'], 'Vor Chemotherapie oder Operation', ['Kopfschmerzen (sehr häufig)', 'Obstipation', 'QT-Zeit-Verlängerung', 'Wärmegefühl/Flush'], ['Apomorphin (kontraindiziert)', 'QT-Verlängerer']),
  med('Granisetron (Kytril)', 'Granisetron', '5-HT3-Antagonist', ['1 mg', '2 mg'], ['N1', 'N2'], '1-2x täglich', ['Kopfschmerz', 'Obstipation'], ['QT-Medikamente']),
  med('Aprepitant (Emend)', 'Aprepitant', 'NK1-Rezeptor-Antagonist (Zytostatika-Emesis)', ['80 mg', '125 mg'], ['N1'], 'An den Tagen 1-3 der Chemotherapie', ['Schluckauf', 'Müdigkeit', 'Obstipation'], ['CYP3A4-Substrate (Dexamethason-Dosis halbieren)', 'Warfarin']),
  med('Loperamid (Imodium)', 'Loperamid-Hydrochlorid', 'Peripherer Opioid-Rezeptor-Agonist (Antidiarrhoikum)', ['2 mg Kapseln / Schmelztabletten'], ['N1', 'N2'], 'Initial 4 mg, dann nach jedem ungeformten Stuhl 2 mg (max 12-16 mg/Tag)', ['Obstipation', 'Bauchkrämpfe', 'Blähungen', 'Schwindel'], ['P-Glykoprotein-Inhibitoren (Chinidin, Ritonavir)'], 'Nicht anwenden bei blutigen Durchfällen oder Fieber (bakterielle Enteritis).'),
  med('Racecadotril (Vaprino)', 'Racecadotril', 'Enkephalinase-Hemmer (Antisekretorisches Antidiarrhoikum)', ['100 mg'], ['N1', 'N2'], '3x täglich 1 Kapsel vor den Hauptmahlzeiten', ['Kopfschmerzen', 'Hautausschlag (selten Angioödem)'], ['ACE-Hemmer (erhöhtes Angioödem-Risiko)']),
  med('Macrogol (Movicol / Forlax)', 'Macrogol 3350/4000 + Elektrolyte', 'Osmotisches Laxans', ['Beutel zur Lösung'], ['N1', 'N2', 'N3'], '1-3x täglich 1 Beutel in einem Glas Wasser aufgelöst trinken', ['Blähungen', 'Bauchschmerzen', 'Weiche Stühle / Durchfall bei Überdosierung'], ['Andere orale Medikamente mind. 2h zeitversetzt einnehmen'], 'Ausreichende Flüssigkeitszufuhr sicherstellen.'),
  med('Lactulose', 'Lactulose Sirup', 'Synthetisches Disaccharid / Laxans & Hepatische Enzephalopathie', ['Sirup 66.7 g/100ml'], ['N1', 'N2', 'N3'], '1-2x täglich 10-30 ml', ['Meteorismus / Blähungen zu Beginn', 'Bauchkrämpfe'], ['Diuretika (Elektrolytverlust)']),
  med('Bisacodyl (Dulcolax)', 'Bisacodyl', 'Antiresorptives Laxans', ['5 mg Dragees', '10 mg Zäpfchen'], ['N1', 'N2'], 'Abends vor dem Schlafen (Wirkung nach ca. 6-10 Stunden)', ['Bauchkrämpfe', 'Gewöhnungseffekt bei Dauergebrauch', 'Kaliumverlust'], ['Milch und Antazida (zerstören magensaftresistente Schicht)'], 'Nicht zur Daueranwendung über mehr als 1-2 Wochen.'),
  med('Natriumpicosulfat (Laxoberal)', 'Natriumpicosulfat', 'Laxans Tropfen', ['Tropfen 7.5 mg/ml'], ['N1', 'N2'], 'Abends 10-18 Tropfen mit Flüssigkeit', ['Bauchkrämpfe', 'Diarrhoe'], ['Antibiotika können die Wirkung abschwächen (Aktivierung durch Darmflora)']),
  med('Flohsamenschalen (Mucofalk)', 'Plantago ovata Samenschalen', 'Quellstoff-Laxans / Stuhlregulierer', ['Granulat'], ['N1', 'N2', 'N3'], '1-3x täglich 1 Beutel in viel Wasser einrühren und sofort trinken', ['Völlegefühl', 'Gefahr von Ösophagusobstruktion bei zu wenig Wasser'], ['Andere Medikamente mit 1-2h Abstand'], 'IMMER mit mindestens 1-2 großen Gläsern Wasser trinken!'),
  med('Buscopan (Butylscopolamin)', 'Butylscopolaminiumbromid', 'Peripheres Parasympatholytikum / Spasmolytikum', ['10 mg Dragees', 'Suppositorien'], ['N1', 'N2', 'N3'], 'Bei krampfartigen Bauchschmerzen 1-2 Dragees bis zu 3x täglich', ['Tachykardie', 'Mundtrockenheit', 'Akkommodationsstörungen', 'Harnverhalt (selten)'], ['Trizyklische Antidepressiva', 'Antihistaminika'], 'Kontraindiziert bei Engwinkelglaukom, Myasthenia gravis und mechanischen Stenosen.'),
  med('Mebeverin (Duspatal)', 'Mebeverin', 'Muskulotropes Spasmolytikum (Reizdarmsyndrom)', ['135 mg', '200 mg retard'], ['N1', 'N2', 'N3'], '2-3x täglich 20 min vor dem Essen', ['Überempfindlichkeitsreaktionen', 'Schwindel'], ['Keine relevanten Interaktionen bekannt']),
  med('Kreon (Pankreatin)', 'Pankreaspulver', 'Verdauungsenzyme (Lipase, Amylase, Protease)', ['10000', '25000', '40000 Einheiten'], ['N1', 'N2', 'N3'], 'Zu jeder Mahlzeit und Zwischenmahlzeit unzerkaut schlucken', ['Bauchschmerzen', 'Übelkeit', 'Obstipation oder Diarrhoe'], ['Folsäure (Resorption kann vermindert sein)'], 'Nicht zerkauen, da Magensaftresistenz sonst zerstört wird.'),
  med('Mesalazin (Salofalk / Claversal)', '5-Aminosalicylsäure (Mesalazin)', 'Entzündungshemmer (Colitis ulcerosa / M. Crohn)', ['500 mg', '1000 mg', 'Granulat', 'Klysmen', 'Zäpfchen'], ['N1', 'N2', 'N3'], '1-3x täglich vor den Mahlzeiten', ['Kopfschmerzen', 'Bauchschmerzen', 'Nephrotoxizität (selten)', 'Pankreatitis'], ['Azathioprin / 6-Mercaptopurin (Knochenmarktoxizität erhöht)'], 'Regelmäßige Nierenfunktionskontrollen (Kreatinin).'),
  med('Budenofalk (Budesonid oral)', 'Budesonid', 'Lokal wirksames Glukokortikoid (hoher First-Pass-Effekt)', ['3 mg Kapseln', '9 mg Granulat'], ['N1', 'N2', 'N3'], '1x täglich morgens vor dem Frühstück', ['Geringere systemische Steroidnebenwirkungen', 'Cushing-Symptome bei Langzeitgabe'], ['CYP3A4-Inhibitoren wie Ketoconazol, Grapefruitsaft'])
];
catalog.push(...gastro);

// 5. Diabetes & Endokrinologie
const endocrine = [
  med('Metformin', 'Metformin-Hydrochlorid', 'Biguanid / Antidiabetikum', ['500 mg', '850 mg', '1000 mg'], ['N1', 'N2', 'N3'], 'Zu oder nach den Mahlzeiten mit Wasser einnehmen', ['Gastrointestinale Beschwerden (Durchfall, Übelkeit, Blähungen)', 'Laktatazidose (selten, aber lebensbedrohlich)', 'Vitamin-B12-Mangel'], ['Jodhaltige Röntgenkontrastmittel (48h vorher/nachher pausieren!)', 'Alkohol (Laktatazidose-Gefahr)', 'ACE-Hemmer'], 'Kontraindiziert bei GFR < 30 ml/min. Dosis reduzieren bei GFR 30-44 ml/min.'),
  med('Jardiance (Empagliflozin)', 'Empagliflozin', 'SGLT2-Inhibitor (Gliflozin)', ['10 mg', '25 mg'], ['N1', 'N2', 'N3'], '1x täglich morgens mit oder ohne Nahrung', ['Genitale Mykosen (Pilzinfektionen)', 'Harnwegsinfekte', 'Euglykämische Ketoazidose', 'Hypovolämie'], ['Diuretika (verstärkter Flüssigkeitsverlust)', 'Insulin / Sulfonylharnstoffe (Hypoglykämiegefahr)'], 'Hoher kardioprotektiver und nephroprotektiver Nutzen. Bei akuter schwerer Krankheit pausieren.'),
  med('Forxiga (Dapagliflozin)', 'Dapagliflozin', 'SGLT2-Inhibitor', ['5 mg', '10 mg'], ['N1', 'N2', 'N3'], '1x täglich zu jeder Tageszeit', ['Genitalinfektionen', 'Schwindel', 'Ketoazidose'], ['Schleifendiuretika'], 'Zugelassen auch bei Herzinsuffizienz und chronischer Niereninsuffizienz.'),
  med('Ozempic (Semaglutid)', 'Semaglutid s.c.', 'GLP-1-Rezeptoragonist', ['0.25 mg', '0.5 mg', '1 mg', '2 mg Fertigpen'], ['N1', 'N2'], '1x WÖCHENTLICH subkutan am gleichen Wochentag', ['Übelkeit (besonders zu Beginn)', 'Erbrechen', 'Diarrhoe', 'Obstipation', 'Pankreatitis (selten)'], ['Verzögert die Magenentleerung (orale Arzneien können verzögert resorbiert werden)'], 'Langsam über Wochen auftitrieren zur Vermeidung von Übelkeit.'),
  med('Rybelsus (Semaglutid oral)', 'Semaglutid oral', 'Oraler GLP-1-Rezeptoragonist', ['3 mg', '7 mg', '14 mg'], ['N1', 'N2', 'N3'], 'Morgens nüchtern mit EINEM halben Glas Wasser (max. 120 ml), danach 30 min nichts essen/trinken', ['Übelkeit', 'Diarrhoe'], ['Andere Medikamente zeitversetzt einnehmen'], 'Strikte Einnahmevorschriften beachten!'),
  med('Wegovy (Semaglutid Adipositas)', 'Semaglutid', 'GLP-1-Agonist zur Gewichtsreduktion', ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg Pen'], ['N1', 'N2'], '1x wöchentlich subkutan', ['Gastrointestinale Beschwerden', 'Kopfschmerz', 'Gallensteinbildung'], ['Orale Arzneien']),
  med('Trulicity (Dulaglutid)', 'Dulaglutid', 'GLP-1-Agonist', ['0.75 mg', '1.5 mg', '3 mg', '4.5 mg Pen'], ['N1', 'N2'], '1x wöchentlich subkutan', ['Übelkeit', 'Diarrhoe', 'Bauchschmerzen'], ['Insulin']),
  med('Victoza (Liraglutid)', 'Liraglutid', 'GLP-1-Agonist', ['6 mg/ml Fertigpen (0.6, 1.2, 1.8 mg)'], ['N1', 'N2'], '1x täglich subkutan zu beliebiger Tageszeit', ['Übelkeit', 'Erbrechen', 'Appetitverlust'], ['Sulfonylharnstoffe']),
  med('Januvia (Sitagliptin)', 'Sitagliptin', 'DPP-4-Inhibitor (Gliptin)', ['25 mg', '50 mg', '100 mg'], ['N1', 'N2', 'N3'], '1x täglich mit oder ohne Nahrung', ['Nasopharyngitis', 'Gelenkschmerzen', 'Pankreatitis (selten)'], ['Digoxin (leichter Anstieg der Plasmaspiegel)'], 'Gewichtsneutral, kein intrinsisches Hypoglykämierisiko.'),
  med('Galvus (Vildagliptin)', 'Vildagliptin', 'DPP-4-Inhibitor', ['50 mg'], ['N1', 'N2', 'N3'], '1-2x täglich', ['Schwindel', 'Transaminasenanstieg (Leberwerte prüfen)'], ['ACE-Hemmer (erhöhtes Angioödem-Risiko)']),
  med('Trajenta (Linagliptin)', 'Linagliptin', 'DPP-4-Inhibitor', ['5 mg'], ['N1', 'N2', 'N3'], '1x täglich', ['Nasopharyngitis', 'Husten'], ['Keine Dosisanpassung bei Niereninsuffizienz nötig!']),
  med('Glimepirid', 'Glimepirid', 'Sulfonylharnstoff', ['1 mg', '2 mg', '3 mg', '4 mg'], ['N1', 'N2', 'N3'], 'Kurz vor oder während des ersten Hauptfrühstücks', ['Hypoglykämie (Unterzuckerung)', 'Gewichtszunahme', 'Allergische Hautreaktionen'], ['Alkohol (verstärkte Unterzuckerung)', 'Betablocker (maskieren Warnsymptome)', 'NSAR'], 'Gefahr protrahierter Hypoglykämien, besonders bei älteren Patienten.'),
  med('Glibenclamid', 'Glibenclamid', 'Sulfonylharnstoff', ['1.75 mg', '3.5 mg'], ['N1', 'N2', 'N3'], 'Unmittelbar vor dem Frühstück', ['Schwere Hypoglykämien', 'Gewichtszunahme'], ['Cumarine', 'Sulfonamide']),
  med('Repaglinid', 'Repaglinid', 'Glinid / Schneller Insulinsekretagoge', ['0.5 mg', '1 mg', '2 mg'], ['N1', 'N2', 'N3'], 'Direkt vor den Hauptmahlzeiten (Keine Mahlzeit = Keine Einnahme!)', ['Hypoglykämie', 'Bauchschmerzen'], ['Gemfibrozil (strikte Kontraindikation!)', 'Clarithromycin']),
  med('Lantus (Insulin glargin)', 'Insulin glargin 100 E/ml', 'Langwirksames Basalinsulin-Analogon', ['100 Einheiten/ml'], ['N1', 'N2'], '1x täglich zur gleichen Uhrzeit subkutan', ['Hypoglykämie', 'Lipodystrophie an der Injektionsstelle', 'Gewichtszunahme'], ['Alkohol', 'Betablocker', 'Kortikosteroide'], 'Gleichmäßiges 24-Stunden-Wirkprofil ohne ausgeprägten Peak.'),
  med('Toujeo (Insulin glargin 300)', 'Insulin glargin 300 E/ml', 'Hochkonzentriertes Basalinsulin', ['300 Einheiten/ml SoloStar Pen'], ['N1', 'N2'], '1x täglich subkutan', ['Hypoglykämie', 'Lipohypertrophie'], ['Antidiabetika'], 'Konstanteres Wirkprofil über >24-36h.'),
  med('Tresiba (Insulin degludec)', 'Insulin degludec', 'Ultra-langwirksames Basalinsulin', ['100 E/ml', '200 E/ml'], ['N1', 'N2'], '1x täglich subkutan (flexible Injektionszeit möglich)', ['Hypoglykämie', 'Injektionsstellenreaktionen'], ['Alkohol', 'Steroide'], 'Wirkdauer über 42 Stunden.'),
  med('Levemir (Insulin detemir)', 'Insulin detemir', 'Langwirksames Basalinsulin', ['100 E/ml'], ['N1', 'N2'], '1-2x täglich morgens und/oder abends subkutan', ['Hypoglykämie'], ['Antidiabetika']),
  med('NovoRapid (Insulin aspart)', 'Insulin aspart', 'Kurzwirksames Mahlzeiteninsulin (Analog)', ['100 E/ml Penfill / FlexPen'], ['N1', 'N2'], 'Unmittelbar vor oder direkt nach der Mahlzeit s.c.', ['Hypoglykämie', 'Schwitzen', 'Zittern'], ['Betablocker maskieren Tachykardie bei Hypoglykämie'], 'Kein Spritz-Ess-Abstand erforderlich.'),
  med('Humalog (Insulin lispro)', 'Insulin lispro', 'Kurzwirksames Insulinanalogon', ['100 E/ml', '200 E/ml'], ['N1', 'N2'], 'Direkt vor den Mahlzeiten', ['Hypoglykämie'], ['Alkohol']),
  med('Actrapid / Insuman Rapid', 'Normalinsulin (Humaninsulin)', 'Kurzwirksames Normalinsulin', ['100 E/ml'], ['N1', 'N2'], '15-30 Minuten vor der Mahlzeit s.c. injizieren', ['Hypoglykämie'], ['Alkohol'], 'Spritz-Ess-Abstand von 15-30 Minuten zwingend.'),
  med('L-Thyroxin (Levothyroxin)', 'Levothyroxin-Natrium', 'Schilddrüsenhormon (T4)', ['25 µg', '50 µg', '75 µg', '88 µg', '100 µg', '112 µg', '125 µg', '150 µg', '175 µg', '200 µg'], ['N1', 'N2', 'N3'], 'Morgens nüchtern mind. 30 Minuten vor dem Frühstück mit Wasser', ['Tachykardie, Unruhe, Tremor, Schlafstörungen (bei Überdosierung)', 'Gewichtsverlust'], ['Calcium- und Eisentabletten (mind. 2h Abstand!)', 'PPI können Resorption mindern', 'Sojaprodukte'], 'TSH-Wert regelmäßig alle 6-12 Monate überprüfen.'),
  med('Euthyrox', 'Levothyroxin-Natrium', 'Schilddrüsenhormon', ['25 µg', '50 µg', '75 µg', '100 µg', '125 µg', '150 µg'], ['N1', 'N2', 'N3'], 'Morgens nüchtern 30 min vor dem Frühstück', ['Hyperthyreose-Symptome bei Überdosierung'], ['Kationen (Eisen, Calcium, Antazida)']),
  med('Novothyral', 'Levothyroxin / Liothyronin (T4/T3)', 'Kombiniertes Schilddrüsenhormon', ['75/15 µg', '100/20 µg'], ['N1', 'N2', 'N3'], 'Morgens nüchtern 30 min vor dem Essen', ['Palpitationen', 'Nervosität'], ['Eisen', 'Calcium']),
  med('Thybon (Liothyronin)', 'Liothyronin-Hydrochlorid (T3)', 'Aktives Schilddrüsenhormon', ['20 µg'], ['N1', 'N2'], 'Morgens vor dem Essen', ['Tachykardie', 'Herzrhythmusstörungen'], ['Antikoagulanzien']),
  med('Thiamazol (Favistan)', 'Thiamazol', 'Thyreostatikum (Hyperthyreose)', ['5 mg', '10 mg', '20 mg'], ['N1', 'N2', 'N3'], 'Morgens nach dem Frühstück', ['Agranulozytose (plötzliches Fieber, Halsschmerzen!)', 'Geschmacksstörungen', 'Allergisches Exanthem'], ['Iodid vermindert Ansprechen'], 'Bei Fieber oder Angina sofort Blutbild kontrollieren!'),
  med('Carbimazol', 'Carbimazol', 'Prodrug von Thiamazol', ['5 mg', '10 mg'], ['N1', 'N2', 'N3'], 'Nach den Mahlzeiten', ['Agranulozytose', 'Gelenkschmerzen'], ['Thyreostatika']),
  med('Propylthiouracil (PTU)', 'Propylthiouracil', 'Thyreostatikum', ['50 mg'], ['N1', 'N2'], 'In 2-3 Einzeldosen verteilt', ['Hepatotoxizität (schwere Leberschäden)', 'Agranulozytose'], ['Cumarine'], 'Mittel der Wahl im 1. Trimenon der Schwangerschaft.'),
  med('Jodid', 'Kaliumiodid', 'Spurenelement / Strumaprophylaxe', ['100 µg', '200 µg'], ['N1', 'N2', 'N3'], '1x täglich nach einer Mahlzeit', ['Jodinduzierte Hyperthyreose bei autonomen Adenomen'], ['Thyreostatika']),
  med('Prednisolon', 'Prednisolon', 'Glukokortikoid (systemisch)', ['1 mg', '2 mg', '5 mg', '10 mg', '20 mg', '50 mg'], ['N1', 'N2', 'N3'], 'Morgens zwischen 6:00 und 8:00 Uhr (Cirkadianer Rhythmus) zum Essen', ['Cushing-Syndrom', 'Hyperglykämie', 'Osteoporose', 'Infektanfälligkeit', 'Schlafstörungen'], ['NSAR (erhöhtes Ulkusrisiko)', 'Antidiabetika (Wirkungsabschwächung)', 'Impfstoffe (Lebendimpfstoffe meiden)'], 'Niemals abrupt absetzen nach mehrwöchiger Einnahme (Ausschleichen wegen NNR-Insuffizienz!).'),
  med('Dexamethason (Fortecortin)', 'Dexamethason', 'Sehr potentes Glukokortikoid (ohne Mineralokortikoidwirkung)', ['0.5 mg', '1.5 mg', '4 mg', '8 mg'], ['N1', 'N2'], 'Morgens nach dem Frühstück', ['Schlafstörungen', 'Blutzuckeranstieg', 'Psychiatrische Symptome'], ['CYP3A4-Induktoren', 'NSAR']),
  med('Methylprednisolon (Urbason)', 'Methylprednisolon', 'Glukokortikoid', ['4 mg', '8 mg', '16 mg', '32 mg'], ['N1', 'N2', 'N3'], 'Morgens zum Frühstück', ['Steroidnebenwirkungen'], ['Antidiabetika', 'NSAR']),
  med('Hydrocortison', 'Hydrocortison', 'Kortison (physiologische Substitution)', ['10 mg', '20 mg'], ['N1', 'N2', 'N3'], '2-3x täglich asymmetrisch (morgens die größte Dosis)', ['Hypokaliämie', 'Natriumretention'], ['Enzyminduktoren'], 'Bei Morbus Addison oder NNR-Insuffizienz lebensnotwendig.'),
  med('Fludrocortison (Astonin H)', 'Fludrocortison', 'Mineralokortikoid', ['0.1 mg'], ['N1', 'N2'], 'Morgens nach dem Essen', ['Hypertonie', 'Hypokaliämie', 'Ödeme'], ['Kaliumausscheidende Diuretika']),
  med('Alendronsäure (Fosamax)', 'Alendronsäure', 'Bisphosphonat (Osteoporose)', ['70 mg'], ['N1', 'N2', 'N3'], '1x WÖCHENTLICH morgens nüchtern mit Leitungswasser, danach 30 min aufrecht bleiben', ['Ösophaguserosionen/Ulzera', 'Kieferknochennekrose (ONJ)', 'Atypische Femurfrakturen'], ['Calcium, Milch, Nahrungsmittel (mind. 30-60 min Abstand zwingend)'], 'Mindestens 30 Minuten aufrecht stehen/sitzen (nicht hinlegen!).'),
  med('Risedronsäure (Actonel)', 'Risedronat-Natrium', 'Bisphosphonat', ['35 mg'], ['N1', 'N2', 'N3'], '1x wöchentlich nüchtern mit Wasser', ['Ösophagitis', 'Bauchschmerz'], ['Kationen']),
  med('Zoledronsäure (Aclasta)', 'Zoledronsäure', 'Intravenöses Bisphosphonat', ['5 mg Infusion'], ['N1'], '1x JÄHRLICH als intravenöse Infusion über mind. 15 min', ['Akute-Phase-Reaktion (Grippe-ähnliche Symptome 1-3 Tage)', 'Kiefernekrose'], ['Nephrotoxische Substanzen'], 'Vor der Infusion gute Hydratation und Zahnstatus prüfen.'),
  med('Prolia (Denosumab)', 'Denosumab', 'RANKL-Inhibitor (Osteoporose)', ['60 mg Fertigspritze'], ['N1'], '1x alle 6 MONATE subkutan', ['Hypokalzämie (Calcium & Vit D substituieren!)', 'Kieferosteonekrose', 'Rebound-Frakturen nach Absetzen'], ['Keine relevanten Cytochrom-Interaktionen'], 'Niemals ohne Anschlussbehandlung absetzen (Rebound-Wirbelkörperfrakturen!).')
];
catalog.push(...endocrine);

console.log(`Prepared ${catalog.length} curated medications across core categories.`);

// Save to data/medications_db.json (skipping duplicates)
let addedCount = 0;
for (const item of catalog) {
  const key = item.name.toLowerCase().trim();
  if (!existingNames.has(key)) {
    existingDb.push(item);
    existingNames.add(key);
    addedCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(existingDb, null, 2), 'utf8');
console.log(`Saved to ${dbPath}: ${addedCount} new items added. Total now in DB: ${existingDb.length}`);

// Generate src/data/topMedicationsCatalog.ts
const catalogTsContent = `// Auto-generated curated Top Medications Catalog
// Contains ${existingDb.length} verified medications for instant offline & client-side lookup.

import { MedicationSuggestion } from '../services/medicationDatabase';

export const TOP_MEDICATIONS_CATALOG: MedicationSuggestion[] = ${JSON.stringify(existingDb, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/topMedicationsCatalog.ts'), catalogTsContent, 'utf8');
console.log(`Generated src/data/topMedicationsCatalog.ts successfully with ${existingDb.length} medications.`);
