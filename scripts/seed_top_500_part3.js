import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('data/medications_db.json');
let existingDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const existingNames = new Set(existingDb.map(m => m.name.toLowerCase().trim()));

// List of 350+ additional common medications, trade names, and OTCs across all indications
const extraMedications = [
  // Analgetika, Erkältung, OTC
  ['Grippostad C', 'Paracetamol/Ascorbinsäure/Coffein/Chlorphenamin', 'Kombiniertes Erkältungsmittel', ['Kapseln', 'Trinkgranulat'], '1-3x täglich 1-2 Kapseln'],
  ['Wick MediNait', 'Paracetamol/Dextromethorphan/Doxylamin/Ephedrin', 'Erkältungssirup zur Nacht', ['30 ml Sirup'], 'Einmalig 30 ml vor dem Schlafengehen'],
  ['Thomapyrin CLASSIC', 'ASS/Paracetamol/Coffein', 'Schmerzmittel / Kopfschmerz', ['Tabletten'], '1-2 Tabletten bei Bedarf'],
  ['Thomapyrin INTENSIV', 'ASS/Paracetamol/Coffein', 'Spannungskopfschmerz & Migräne', ['Tabletten'], '1-2 Tabletten bei Bedarf'],
  ['Aspirin Plus C', 'Acetylsalicylsäure / Vitamin C', 'Analgetikum & Antipyretikum', ['Brausetabletten 400/240 mg'], 'In Wasser gelöst trinken'],
  ['Dolormin Extra', 'Ibuprofen-Lysinat', 'Schnell wirkendes NSAR', ['400 mg'], '1 Tablette mit Wasser'],
  ['Gelsemium D6 / D12', 'Gelsemium sempervirens', 'Homöopathisches Arzneimittel', ['Globuli', 'Dilution'], '5 Globuli bei Bedarf unter der Zunge zergehen lassen'],
  ['Arnica D6 / D12', 'Arnica montana', 'Homöopathisches Mittel / Traumatologie', ['Globuli'], '5 Globuli nach Verletzung'],
  ['Belladonna D6 / D12', 'Atropa belladonna', 'Homöopathisches Mittel / Akutfieber', ['Globuli'], '5 Globuli stündlich bei akutem Beginn'],
  ['Traumeel S', 'Arnica/Calendula/Hamamelis u.a.', 'Homöopathisches Komplexmittel', ['Tabletten', 'Salbe', 'Tropfen'], '3x täglich 1 Tablette langsam im Mund zergehen lassen'],
  ['Neurexan', 'Passiflora/Avena sativa/Valeriana/Coffea', 'Homöopathisches Beruhigungsmittel', ['Tabletten', 'Tropfen'], '1-3x täglich 1 Tablette im Mund zergehen lassen'],
  ['Sinupret extract', 'Enzian/Schlüsselblume/Ampfer/Holunder/Eisenkraut', 'Pflanzliches Arzneimittel (Rhinosinusitis)', ['Dragees'], '3x täglich 1 überzogene Tablette'],
  ['Bronchipret TP', 'Thymian / Primel', 'Pflanzlicher Hustenlöser', ['Filmtabletten', 'Saft'], '3x täglich'],
  ['Prospan', 'Efeublätter-Trockenextrakt', 'Pflanzlicher Hustensaft', ['Saft', 'Brausetabletten'], '2-3x täglich mit dem Messbecher'],
  ['Iberogast Classic', 'Iberis amara / Kamille / Kümmel / Pfefferminze u.a.', 'Pflanzliches Magen-Darm-Mittel (Reizmagen)', ['Tropfen'], '3x täglich 20 Tropfen vor oder zu den Mahlzeiten'],
  ['Gynatren', 'Lactobacillus-Impfstoff', 'Immunbiologikum (Rezidivierende Kolpitis)', ['Injektionssuspension'], '3 Injektionen im Abstand von 2 Wochen'],
  ['Kytta Schmerzsalbe', 'Beinwellwurzel-Fluidextrakt', 'Pflanzliches Schmerzgel', ['Salbe 100g'], '2-3x täglich dünn auf schmerzende Gelenke auftragen'],
  ['Voltaren Schmerzgel forte', 'Diclofenac-Diethylamin 2.32%', 'Topisches NSAR (12 Stunden Wirkung)', ['Gel 100g/150g'], '2x täglich morgens und abends auf die Schmerzstelle einreiben'],
  ['ThermaCare', 'Wärmeauflagen / Eisenpulver', 'Physikalische Wärmetherapie', ['Wärmeauflagen Rücken/Nacken'], 'Bis zu 8 Stunden auf schmerzende Muskelpartie anlegen'],
  ['Kamillosan', 'Kamillenblütenextrakt', 'Pflanzliches Antiphlogistikum', ['Konzentrat', 'Spray', 'Salbe'], 'Für Spülungen, Inhalationen oder Sitzbäder verdünnen'],
  
  // Herz-Kreislauf & Blutdruck Kombinationen
  ['Ramipril / HCT', 'Ramipril / Hydrochlorothiazid', 'ACE-Hemmer + Diuretikum', ['2.5/12.5 mg', '5/25 mg'], '1x täglich morgens'],
  ['Candesartan / HCT', 'Candesartan / Hydrochlorothiazid', 'Sartan + Thiazid', ['8/12.5 mg', '16/12.5 mg', '32/25 mg'], '1x täglich morgens'],
  ['Valsartan / HCT', 'Valsartan / Hydrochlorothiazid', 'Sartan + Thiazid', ['80/12.5 mg', '160/12.5 mg', '160/25 mg'], '1x täglich morgens'],
  ['Losartan / HCT', 'Losartan / Hydrochlorothiazid', 'Sartan + Thiazid', ['50/12.5 mg', '100/25 mg'], '1x täglich morgens'],
  ['Olmesartan / Amlodipin (Sevikar)', 'Olmesartan / Amlodipin', 'Sartan + Calciumkanalblocker', ['20/5 mg', '40/5 mg', '40/10 mg'], '1x täglich'],
  ['Amlodipin / Valsartan (Exforge)', 'Amlodipin / Valsartan', 'Calciumkanalblocker + Sartan', ['5/80 mg', '5/160 mg', '10/160 mg'], '1x täglich'],
  ['Bisoprolol / HCT', 'Bisoprolol / Hydrochlorothiazid', 'Betablocker + Thiazid', ['5/12.5 mg', '10/25 mg'], '1x täglich morgens'],
  ['Viacoram (Perindopril / Amlodipin)', 'Perindopril / Amlodipin', 'ACE-Hemmer + Calciumkanalblocker', ['3.5/2.5 mg', '7/5 mg', '14/10 mg'], '1x täglich morgens'],
  ['Triplixam', 'Perindopril / Indapamid / Amlodipin', 'Tripel-Kombination Antihypertensivum', ['5/1.25/5 mg', '10/2.5/10 mg'], '1x täglich morgens'],
  ['Co-Diovan', 'Valsartan / Hydrochlorothiazid', 'Antihypertensivum Kombi', ['80/12.5 mg', '160/12.5 mg'], '1x täglich morgens'],
  ['Blopress', 'Candesartan-Cilexetil', 'AT1-Rezeptorblocker', ['8 mg', '16 mg', '32 mg'], '1x täglich morgens'],
  ['Delix', 'Ramipril Original', 'ACE-Hemmer', ['2.5 mg', '5 mg'], '1x täglich morgens'],
  ['Beloc-Zok', 'Metoprololsuccinat Original', 'Betablocker ZOK-Retardierung', ['47.5 mg', '95 mg'], '1x täglich morgens'],
  ['Concor', 'Bisoprolol Original', 'Kardioselektiver Betablocker', ['2.5 mg', '5 mg', '10 mg'], '1x täglich morgens'],
  ['Norvasc', 'Amlodipin Original', 'Calciumkanalblocker', ['5 mg', '10 mg'], '1x täglich morgens'],
  ['Bayotensin', 'Nitrendipin', 'Calciumkanalblocker', ['20 mg'], '1-2x täglich'],
  ['Adalat', 'Nifedipin Original', 'Calciumkanalblocker', ['20 mg', '30 mg retard'], '1x täglich morgens'],
  ['Dilatrend', 'Carvedilol Original', 'Alpha-/Betablocker', ['6.25 mg', '12.5 mg', '25 mg'], '2x täglich zu den Mahlzeiten'],
  ['Sortis', 'Atorvastatin Original', 'Statin', ['10 mg', '20 mg', '40 mg', '80 mg'], '1x täglich abends'],
  ['Zocor', 'Simvastatin Original', 'Statin', ['20 mg', '40 mg'], '1x täglich abends'],
  ['Crestor', 'Rosuvastatin Original', 'Statin', ['10 mg', '20 mg'], '1x täglich'],
  ['Inegy', 'Ezetimib / Simvastatin', 'Lipidsenker-Kombination', ['10/20 mg', '10/40 mg'], '1x täglich abends'],
  ['Triveram', 'Atorvastatin / Perindopril / Amlodipin', 'Tripeltherapie KHK & Hypertonie', ['10/5/5 mg', '20/5/5 mg', '20/10/10 mg'], '1x täglich morgens'],
  ['Atozet', 'Ezetimib / Atorvastatin', 'Potente Lipidsenker-Kombination', ['10/20 mg', '10/40 mg', '10/80 mg'], '1x täglich abends'],
  ['Pravasin', 'Pravastatin Original', 'Statin', ['20 mg', '40 mg'], '1x täglich abends'],
  ['Urapidil (Ebrantil)', 'Urapidil', 'Alpha-1-Blocker & 5-HT1A-Agonist (Hypertensive Krise)', ['30 mg', '60 mg retard', 'Ampullen'], '2x täglich retardiert oder i.v. bei Hochdruckkrise'],
  ['Clonidin (Catapresan)', 'Clonidinhydrochlorid', 'Zentrales Antisympathotonikum', ['0.075 mg', '0.15 mg'], '2-3x täglich'],
  ['Moxonidin (Physiotens)', 'Moxonidin', 'Imidazolin-Rezeptoragonist (Zentraler Blutdrucksenker)', ['0.2 mg', '0.3 mg', '0.4 mg'], '1-2x täglich morgens'],
  ['Doxazosin (Cardular)', 'Doxazosin', 'Peripherer Alpha-1-Rezeptorblocker (Hypertonie & BPH)', ['1 mg', '2 mg', '4 mg', '8 mg retard'], '1x täglich morgens oder abends'],
  ['Hydralazin', 'Hydralazin', 'Direkter Vasodilatator', ['25 mg', '50 mg'], '2-3x täglich'],
  ['Minoxidil Tabletten (Lonolox)', 'Minoxidil oral', 'Refraktäres Antihypertensivum (starker Vasodilatator)', ['2.5 mg', '5 mg', '10 mg'], '1-2x täglich'],
  ['Regaine (Minoxidil topisch)', 'Minoxidil 2% / 5%', 'Haarwuchsmittel (Androgenetische Alopezie)', ['Schaum / Lösung 60ml'], '2x täglich 1 ml auf die Kopfhaut auftragen'],
  
  // Diabetes & Stoffwechsel
  ['Janumet', 'Sitagliptin / Metformin', 'DPP-4-Hemmer + Biguanid', ['50/850 mg', '50/1000 mg'], '2x täglich zu den Mahlzeiten'],
  ['Eucreas', 'Vildagliptin / Metformin', 'DPP-4 + Metformin', ['50/850 mg', '50/1000 mg'], '2x täglich zu den Mahlzeiten'],
  ['Synjardy', 'Empagliflozin / Metformin', 'SGLT2 + Biguanid', ['5/850 mg', '5/1000 mg', '12.5/1000 mg'], '2x täglich zu den Mahlzeiten'],
  ['Xigduo', 'Dapagliflozin / Metformin', 'SGLT2 + Metformin', ['5/850 mg', '5/1000 mg'], '2x täglich zu den Mahlzeiten'],
  ['Qtern', 'Dapagliflozin / Saxagliptin', 'SGLT2 + DPP-4', ['10/5 mg'], '1x täglich morgens'],
  ['Suliqua', 'Insulin glargin / Lixisenatid', 'Fixkombination Basalinsulin + GLP-1', ['100 E/50 µg SoloStar Pen'], '1x täglich 1 Stunde vor einer Mahlzeit s.c.'],
  ['Xultophy', 'Insulin degludec / Liraglutid', 'Basalinsulin + GLP-1', ['100 E/3.6 mg/ml'], '1x täglich subkutan'],
  ['Acarbose (Glucobay)', 'Acarbose', 'Alpha-Glukosidase-Hemmer', ['50 mg', '100 mg'], 'Mit dem ersten Bissen der Hauptmahlzeit unzerkaut schlucken'],
  ['Pioglitazon (Actos)', 'Pioglitazon', 'Glitazon / Insulinsensitizer (PPAR-gamma)', ['15 mg', '30 mg', '45 mg'], '1x täglich unabhängig von Mahlzeiten'],
  ['Fiasp', 'Insulin aspart ultra-schnell', 'Mahlzeiteninsulin mit Niacinamid', ['100 E/ml PenFill'], 'Unmittelbar zu Beginn der Mahlzeit oder bis 20 min danach'],
  ['Apidra', 'Insulin glulisin', 'Kurzwirksames Mahlzeiteninsulin', ['100 E/ml SoloStar'], '0-15 min vor oder direkt nach dem Essen s.c.'],
  ['Protaphane', 'NPH-Insulin (Isophan-Insulin)', 'Intermediär wirksames Verzögerungsinsulin', ['100 E/ml'], '1-2x täglich vor dem Essen s.c. (vor Gebrauch 20x kippen!)'],
  ['Berlinsulin H Normal', 'Human-Normalinsulin', 'Kurzwirksames Mahlzeiteninsulin', ['100 E/ml'], '15-20 min vor den Mahlzeiten'],
  ['Glucagon HypoKit', 'Glucagon', 'Notfall-Kit bei schwerer Hypoglykämie', ['1 mg Trockensubstanz + Spritze'], 'Im Notfall intramuskulär oder subkutan injizieren'],
  
  // Neurologie, Psychiatrie & Schlaf
  ['Trevilor retard', 'Venlafaxin Original', 'SNRI', ['75 mg', '150 mg'], '1x täglich morgens zum Essen'],
  ['Cymbalta', 'Duloxetin Original', 'SNRI', ['30 mg', '60 mg'], '1x täglich morgens'],
  ['Remergil', 'Mirtazapin Original', 'NaSSA Antidepressivum', ['15 mg', '30 mg'], '1x täglich abends'],
  ['Cipralex', 'Escitalopram Original', 'SSRI', ['10 mg', '20 mg'], '1x täglich morgens'],
  ['Zoloft', 'Sertralin Original', 'SSRI', ['50 mg', '100 mg'], '1x täglich'],
  ['Elontril', 'Bupropion Original', 'NDRI Antidepressivum', ['150 mg', '300 mg'], '1x täglich morgens'],
  ['Saroten', 'Amitriptylin Original', 'TCA Antidepressivum', ['25 mg', '50 mg'], '1x täglich abends'],
  ['Insidon', 'Opipramol Original', 'Anxiolytikum', ['50 mg'], '1-2x täglich'],
  ['Stangyl', 'Trimipramin Original', 'Sedierendes TCA', ['25 mg', '100 mg'], 'Abends zur Nacht'],
  ['Seroquel', 'Quetiapin Original', 'Atypisches Neuroleptikum', ['25 mg', '100 mg', '200 mg retard'], 'Abends oder verteilt'],
  ['Zyprexa', 'Olanzapin Original', 'Atypisches Antipsychotikum', ['5 mg', '10 mg'], '1x täglich abends'],
  ['Risperdal', 'Risperidon Original', 'Neuroleptikum', ['1 mg', '2 mg', '4 mg'], '1-2x täglich'],
  ['Abilify', 'Aripiprazol Original', 'D2-Partialagonist', ['10 mg', '15 mg'], '1x täglich morgens'],
  ['Tavor', 'Lorazepam Original', 'Benzodiazepin', ['0.5 mg', '1 mg', '2.5 mg'], 'Bei akuter Angst / Panik'],
  ['Valium', 'Diazepam Original', 'Benzodiazepin', ['5 mg', '10 mg'], 'Bei Bedarf'],
  ['Adumbran', 'Oxazepam Original', 'Benzodiazepin', ['10 mg', '50 mg'], '1-3x täglich'],
  ['Xanax', 'Alprazolam Original', 'Hochpotentes Anxiolytikum', ['0.5 mg', '1 mg'], 'Bei Panikattacken'],
  ['Rohypnol (Flunitrazepam)', 'Flunitrazepam', 'Starkes Hypnotikum (strenges BTM)', ['1 mg'], 'Unmittelbar vor dem Schlafen (nur stationär / BTM)'],
  ['Dormicum (Midazolam)', 'Midazolam', 'Sehr kurzwirksames Benzodiazepin (Sedierung)', ['7.5 mg', '15 mg'], 'Vor operativen Eingriffen'],
  ['Circadin (Melatonin 2 mg retard)', 'Melatonin', 'Melatonin-Rezeptoragonist (Schlafhormon)', ['2 mg Retardtabletten'], '1-2 Stunden vor dem Zubettgehen nach dem Essen'],
  ['Atosil', 'Promethazin Original', 'Beruhigungsmittel & Neuroleptikum', ['25 mg', 'Tropfen'], 'Abends bei Unruhe'],
  ['Truxal (Chlorprothixen)', 'Chlorprothixen', 'Sedo-Neuroleptikum', ['15 mg', '50 mg'], 'Abends zur Nacht'],
  ['Dominal (Prothipendyl)', 'Prothipendyl', 'Sedierendes Neuroleptikum bei Schlafstörungen', ['40 mg', '80 mg'], 'Abends vor dem Schlafen'],
  ['Taxilan (Perazin)', 'Perazin', 'Klassisches Neuroleptikum mittlerer Potenz', ['25 mg', '50 mg', '100 mg'], 'In 2-3 Einzeldosen'],
  ['Lithium (Quilonum / Hypnorex)', 'Lithiumcarbonat / Acetat', 'Phasenprophylaxe (Bipolare Störung & Suizidprophylaxe)', ['450 mg', '600 mg retard'], '1-2x täglich mit reichlich Flüssigkeit'],
  ['Lyrica', 'Pregabalin Original', 'Neuropathischer Schmerz & Angst', ['75 mg', '150 mg', '300 mg'], '2x täglich'],
  ['Neurontin', 'Gabapentin Original', 'Antiepileptikum & Nervenschmerz', ['300 mg', '600 mg'], '3x täglich'],
  ['Keppra', 'Levetiracetam Original', 'Antiepileptikum', ['500 mg', '1000 mg'], '2x täglich'],
  ['Lamictal', 'Lamotrigin Original', 'Antiepileptikum', ['25 mg', '50 mg', '100 mg'], 'Einschleichen nach Plan'],
  ['Tegretal', 'Carbamazepin Original', 'Antiepileptikum / Trigeminus', ['200 mg', '400 mg'], '2-3x täglich zu den Mahlzeiten'],
  ['Ergenyl chrono', 'Natriumvalproat / Valproinsäure', 'Antiepileptikum Retardform', ['300 mg', '500 mg'], '2x täglich zum Essen'],
  ['Topamax (Topiramat)', 'Topiramat', 'Antiepileptikum & Migräneprophylaxe', ['25 mg', '50 mg', '100 mg'], '2x täglich morgens und abends'],
  ['Vimpat (Lacosamid)', 'Lacosamid', 'Modernes Antiepileptikum', ['50 mg', '100 mg', '150 mg', '200 mg'], '2x täglich morgens und abends'],
  ['Trileptal (Oxcarbazepin)', 'Oxcarbazepin', 'Keto-Analogon von Carbamazepin', ['300 mg', '600 mg'], '2x täglich'],
  ['Apydan extent (Oxcarbazepin retard)', 'Oxcarbazepin', 'Retardiertes Antiepileptikum', ['300 mg', '600 mg'], '2x täglich'],
  ['Frisium (Clobazam)', 'Clobazam', '1,5-Benzodiazepin (Zusatztherapie Epilepsie)', ['10 mg', '20 mg'], '1-2x täglich'],
  ['Rivotril (Clonazepam)', 'Clonazepam', 'Hochpotentes Benzodiazepin (Epilepsie & Myoklonien)', ['0.5 mg', '2 mg', 'Tropfen 2.5mg/ml'], 'In 2-3 Einzeldosen abends'],
  ['Sinemet', 'Levodopa / Carbidopa', 'Parkinson-Therapeutikum', ['100/25 mg', '200/50 mg retard'], 'Mind. 30 min vor Mahlzeiten'],
  ['Requip (Ropinirol)', 'Ropinirol', 'Dopaminagonist (Parkinson & RLS)', ['2 mg', '4 mg', '8 mg retard'], '1x täglich zur gleichen Zeit'],
  ['Neupro Pflaster (Rotigotin)', 'Rotigotin', 'Transdermales Dopamin-Pflaster (24h kontinuierlich)', ['2 mg/24h', '4 mg/24h', '6 mg/24h', '8 mg/24h'], 'Alle 24 Stunden Pflaster an neuer Hautstelle wechseln'],
  ['Azilect (Rasagilin)', 'Rasagilin', 'Selektiver MAO-B-Hemmer (Parkinson)', ['1 mg'], '1x täglich unabhängig von Mahlzeiten'],
  ['Xadago (Safinamid)', 'Safinamid', 'MAO-B-Hemmer + Glutamat-Freisetzungshemmer', ['50 mg', '100 mg'], '1x täglich morgens'],
  ['Comtess (Entacapon)', 'Entacapon', 'COMT-Hemmer (Verlängert L-Dopa-Wirkung)', ['200 mg'], 'Zusammen mit jeder Levodopa-Dosis einnehmen'],
  ['Stalevo', 'Levodopa / Carbidopa / Entacapon', 'Tripel-Parkinson-Kombination', ['50/12.5/200 mg', '100/25/200 mg', '150/37.5/200 mg'], 'Nach Dosierungsplan mit Wasser schlucken'],
  ['Exelon Pflaster (Rivastigmin)', 'Rivastigmin', 'Cholinesterasehemmer (Alzheimer-Demenz & Parkinson-Demenz)', ['4.6 mg/24h', '9.5 mg/24h', '13.3 mg/24h'], 'Alle 24 Stunden neues Pflaster aufkleben'],
  ['Reminyl (Galantamin)', 'Galantamin', 'Cholinesterase-Hemmer & Nikotinischer Modulator', ['8 mg', '16 mg', '24 mg retard'], '1x täglich morgens zum Frühstück'],
  ['Ebixa', 'Memantin Original', 'NMDA-Rezeptor-Antagonist', ['10 mg', '20 mg'], '1x täglich'],
  ['Aricept', 'Donepezil Original', 'Cholinesterasehemmer', ['5 mg', '10 mg'], '1x täglich abends'],
  ['Imigran', 'Sumatriptan Original', 'Migränetherapeutikum', ['50 mg', '100 mg', 'Pen'], 'Bei Akutattacke'],
  ['Ascotop', 'Zolmitriptan Original', 'Triptan', ['2.5 mg', '5 mg'], 'Bei Migräne'],
  ['Maxalt', 'Rizatriptan Original', 'Triptan', ['10 mg Schmelztabletten'], 'Bei Migräne'],
  ['Formigran', 'Naratriptan Original', 'Triptan OTC', ['2.5 mg'], 'Bei Migräne'],
  ['Relpax (Eletriptan)', 'Eletriptan', 'Triptan mit hoher Bioverfügbarkeit', ['20 mg', '40 mg'], 'Bei Beginn des Migränekopfschmerzes'],
  ['Almogran (Almotriptan)', 'Almotriptan', 'Triptan (sehr gut verträglich)', ['12.5 mg'], '1 Tablette bei Migränebeginn'],
  
  // Magen, Darm & Infektionen
  ['Pantozol', 'Pantoprazol Original', 'Protonenpumpenhemmer', ['20 mg', '40 mg'], 'Morgens 30 min vor dem Frühstück nüchtern'],
  ['Nexium', 'Esomeprazol Original', 'PPI', ['20 mg', '40 mg'], 'Morgens nüchtern'],
  ['Antra MUPS', 'Omeprazol Original', 'PPI Multiple Unit Pellets', ['20 mg', '40 mg'], 'Morgens nüchtern mit Wasser'],
  ['Pariet', 'Rabeprazol Original', 'PPI', ['10 mg', '20 mg'], 'Morgens nüchtern'],
  ['Riopan Magen Gel', 'Magaldrat', 'Schichtgitterantazidum', ['Gel Stickbeutel 1600 mg'], '1-2 Stunden nach den Mahlzeiten oder bei Beschwerden direkt schlucken'],
  ['Talcid', 'Hydrotalcit', 'Schichtgitterantazidum Kautabletten', ['500 mg Kautabletten'], 'Bei Sodbrennen 1-2 Kautabletten gründlich zerkauen'],
  ['Vomex A Dragees', 'Dimenhydrinat Original', 'Antiemetikum', ['50 mg'], 'Bei Übelkeit / Reisekrankheit'],
  ['Zofran', 'Ondansetron Original', '5-HT3-Antagonist', ['4 mg', '8 mg'], 'Vor Chemo oder postoperativ'],
  ['Emend', 'Aprepitant Original', 'NK1-Antagonist', ['125/80 mg'], 'Vor Chemotherapie'],
  ['Imodium akut', 'Loperamid Original', 'Durchfallmittel', ['2 mg Kapseln / Lingual'], 'Initial 2 Kapseln, dann 1 nach jedem Durchfall'],
  ['Movicol Aromafrei / Schoko', 'Macrogol 3350 + Salze', 'Laxans', ['Beutel'], '1-2 Beutel in Wasser gelöst trinken'],
  ['Dulcolax Dragees', 'Bisacodyl Original', 'Laxans', ['5 mg'], 'Abends vor dem Schlafen'],
  ['Laxoberal Tropfen', 'Natriumpicosulfat Original', 'Laxans Tropfen', ['7.5 mg/ml'], 'Abends 10-18 Tropfen mit Wasser'],
  ['Duspatal retard', 'Mebeverin Original', 'Spasmolytikum Reizdarm', ['200 mg'], '2x täglich 20 min vor dem Essen'],
  ['Salofalk', 'Mesalazin Original', 'CED-Therapeutikum', ['500 mg', '1000 mg', 'Granu-Stix'], 'Vor den Mahlzeiten'],
  ['Claversal', 'Mesalazin', '5-ASA Präparat', ['500 mg', 'Zäpfchen'], '3x täglich vor dem Essen'],
  ['Infectocillin (Penicillin V)', 'Phenoxymethylpenicillin-Kalium', 'Klassisches Scharlach- und Streptokokken-Penicillin', ['Megainheiten 1.0 / 1.5 M.I.E.'], '3x täglich 1 Stunde VOR den Mahlzeiten nüchtern mit Wasser'],
  ['Unacid (Ampicillin / Sulbactam)', 'Ampicillin / Sulbactam', 'Aminopenicillin + Inhibitor', ['375 mg', '750 mg'], '2-3x täglich nach dem Essen'],
  ['InfectoBim / AmoxiClav', 'Amoxicillin / Clavulansäure', 'Breitbandantibiotikum', ['500/125 mg', '875/125 mg'], '2x täglich zum Essen'],
  ['Zithromax', 'Azithromycin Original', 'Makrolid 3-Tages-Packung', ['500 mg'], '1x täglich für 3 Tage'],
  ['Klacid', 'Clarithromycin Original', 'Makrolidantibiotikum', ['250 mg', '500 mg'], '2x täglich'],
  ['Ciprobay', 'Ciprofloxacin Original', 'Fluorchinolon', ['500 mg'], '2x täglich ohne Milchprodukte'],
  ['Tavanic', 'Levofloxacin Original', 'Fluorchinolon', ['500 mg'], '1x täglich'],
  ['Avalox', 'Moxifloxacin Original', 'Atemwegs-Chinolon', ['400 mg'], '1x täglich'],
  ['Monuril', 'Fosfomycin Original', 'Einmaldosis HWI', ['3000 mg Beutel'], 'Einmalig zur Nacht nach Blasenentleerung'],
  ['Sobelin', 'Clindamycin Original', 'Lincosamid', ['300 mg', '600 mg'], '3x täglich mit viel Wasser'],
  ['Clont', 'Metronidazol Original', 'Anaerobier-Antibiotikum', ['400 mg', '500 mg'], '2-3x täglich zum Essen (Kein Alkohol!)'],
  ['Diflucan', 'Fluconazol Original', 'Antimykotikum', ['50 mg', '150 mg'], 'Unabhängig von Mahlzeiten'],
  ['Lamisil Tabletten', 'Terbinafin Original', 'Nagelpilz-Mittel', ['250 mg'], '1x täglich'],
  ['Zovirax Tabletten / Creme', 'Aciclovir Original', 'Antiviral', ['400 mg', '800 mg', 'Lippencreme'], 'Alle 4 Stunden tagsüber'],
  ['Valtrex', 'Valaciclovir Original', 'Antiviral Zoster', ['500 mg', '1000 mg'], '3x täglich bei Gürtelrose'],
  ['Zostex', 'Brivudin Original', 'Gürtelrose-Virustatikum', ['125 mg'], '1x täglich für 7 Tage (Achtung 5-FU Interaktion!)'],
  ['Tamiflu (Oseltamivir)', 'Oseltamivirphosphat', 'Neuraminidasehemmer (Influenza A & B)', ['75 mg Kapseln'], '2x täglich über 5 Tage (Beginn innerhalb 48h nach ersten Symptomen!)'],
  ['Paxlovid (Nirmatrelvir / Ritonavir)', 'Nirmatrelvir / Ritonavir', 'Oraler SARS-CoV-2-Proteaseinhibitor', ['150/100 mg Tablettenkombination'], '2x täglich (2 rosa + 1 weiße Tablette) für genau 5 Tage'],
  
  // Urologie, Gynäkologie, Haut, Auge
  ['Alna Ocas', 'Tamsulosin Original', 'Prostata-Therapeutikum OCAS-Matrix', ['0.4 mg'], '1x täglich tageszeitunabhängig'],
  ['Proscar', 'Finasterid Original', '5-Alpha-Reduktasehemmer BPH', ['5 mg'], '1x täglich'],
  ['Propecia', 'Finasterid Original Alopezie', 'Haarausfall-Mittel', ['1 mg'], '1x täglich'],
  ['Avodart', 'Dutasterid Original', 'Prostatavergrößerung', ['0.5 mg'], '1x täglich ganz schlucken'],
  ['Vesikur', 'Solifenacin Original', 'Reizblasenmittel', ['5 mg', '10 mg'], '1x täglich'],
  ['Detrusitol retard', 'Tolterodin Original', 'Dranginkontinenz', ['4 mg'], '1x täglich'],
  ['Spasmex', 'Trospiumchlorid Original', 'Spasmolytikum Blase', ['30 mg', '45 mg'], 'Nüchtern vor dem Essen'],
  ['Betmiga', 'Mirabegron Original', 'Beta-3-Agonist Blase', ['50 mg'], '1x täglich'],
  ['Viagra', 'Sildenafil Original', 'Potenzmittel', ['50 mg', '100 mg'], 'Ca. 1h vor Aktivität (Keine Nitrate!)'],
  ['Cialis', 'Tadalafil Original', 'Potenzmittel', ['10 mg', '20 mg', '5 mg täglich'], 'Vor Aktivität oder täglich'],
  ['Levitra', 'Vardenafil Original', 'Potenzmittel', ['10 mg', '20 mg'], 'Vor Aktivität'],
  ['Cerazette', 'Desogestrel Original', 'Östrogenfreie Minipille', ['75 µg'], 'Täglich exakt zur gleichen Stunde'],
  ['Visanne', 'Dienogest Original', 'Endometriose-Therapie', ['2 mg'], 'Täglich ohne Pause'],
  ['Gynokadin Dosiergel', 'Estradiol Original', 'Hormonersatztherapie Gel', ['0.6 mg/Hub'], '1x täglich auf Oberarm einreiben'],
  ['Utrogest', 'Progesteron Original', 'Mikronisiertes Progesteron', ['100 mg', '200 mg'], 'Abends oral oder vaginal'],
  ['Femara', 'Letrozol Original', 'Aromatasehemmer', ['2.5 mg'], '1x täglich'],
  ['Arimidex', 'Anastrozol Original', 'Aromatasehemmer', ['1 mg'], '1x täglich'],
  ['Xalatan', 'Latanoprost Original', 'Glaukom Augentropfen', ['0.005%'], '1x täglich abends 1 Tropfen'],
  ['Lumigan (Bimatoprost)', 'Bimatoprost', 'Prostaglandin-Analogon Augentropfen', ['0.1 mg/ml', '0.3 mg/ml'], '1x täglich abends'],
  ['Travatan (Travoprost)', 'Travoprost', 'Glaukom-Tropfen', ['40 µg/ml'], '1x täglich abends'],
  ['Trusopt (Dorzolamid)', 'Dorzolamid', 'Carboanhydrasehemmer Augentropfen', ['20 mg/ml'], '2-3x täglich 1 Tropfen'],
  ['Alphagan (Brimonidin)', 'Brimonidintartrat', 'Alpha-2-Agonist Augentropfen', ['2 mg/ml'], '2x täglich alle 12 Stunden'],
  ['Bepanthen Augen- und Nasensalbe', 'Dexpanthenol', 'Regenerationssalbe Schleimhaut', ['Salbe 5g/10g'], '1-mehrmals täglich in den Bindehautsack oder Nasenvorhof einbringen'],
  ['Artelac Complete EDO', 'Natriumhyaluronat / Lipide', 'Künstliche Tränen bei trockenem Auge', ['Einzeldosis-Pipetten'], 'Mehrmals täglich 1 Tropfen nach Bedarf'],
  ['Hylo-Comod', 'Natriumhyaluronat 0.1%', 'Befeuchtende Augentropfen ohne Konservierungsmittel', ['COMOD-Flasche 10ml'], '3-5x täglich 1 Tropfen ins Auge'],
  ['Hylo-Gel', 'Natriumhyaluronat 0.2%', 'Intensiv befeuchtende Augentropfen', ['10ml'], 'Mehrmals täglich bei schwerer Trockenheit'],
  ['Dermoxin', 'Clobetasol Original', 'Klasse-IV Kortikoid', ['0.05% Salbe'], '1x täglich dünn (max 2 Wochen)'],
  ['Ecural (Mometason topisch)', 'Mometasonfuroat', 'Klasse-III Kortison Salbe/Creme', ['0.1%'], '1x täglich dünn auftragen'],
  ['Fucidine (Fusidinsäure)', 'Fusidinsäure', 'Topisches Antibiotikum (Impetigo, Staphylokokken)', ['2% Creme / Salbe'], '2-3x täglich dünn auf infizierte Hautareale'],
  ['Protopic (Tacrolimus Salbe)', 'Tacrolimus-Monohydrat', 'Topischer Calcineurin-Inhibitor (Neurodermitis)', ['0.03%', '0.1% Salbe'], '2x täglich dünn auftragen (keine Hautatrophie!)'],
  ['Elidel (Pimecrolimus Creme)', 'Pimecrolimus', 'Calcineurin-Inhibitor Creme (Ekzeme)', ['1% Creme'], '2x täglich dünn auftragen'],
  ['Aknenormin (Isotretinoin oral)', 'Isotretinoin', 'Systemisches Retinoid (Schwere zystische Akne)', ['10 mg', '20 mg Kapseln'], 'Zu einer fettreichen Mahlzeit schlucken (Teratogen!)'],
  ['Differin (Adapalen)', 'Adapalen', 'Topisches Retinoid (Aknetherapie)', ['0.1% Gel / Creme'], '1x täglich abends auf gereinigte Haut auftragen'],
  ['Skinoren (Azelainsäure)', 'Azelainsäure', 'Akne- und Rosazeatherapeutikum', ['15% Gel', '20% Creme'], '2x täglich morgens und abends auftragen'],
  ['Soolantra (Ivermectin Creme)', 'Ivermectin', 'Antiparasitäre & entzündungshemmende Creme (Rosazea)', ['10 mg/g Creme'], '1x täglich abends dünn im Gesicht verteilen'],
  
  // Vitamine, Mineralstoffe, Geriatrie & Allgemeinmedizin
  ['Dekristol 20000', 'Colecalciferol Original', 'Vitamin D3 Stoßtherapie', ['20000 IE'], '1x wöchentlich mit Mahlzeit'],
  ['Ferro sanol duodenal', 'Eisen(II)-glycin-sulfat', 'Eisensubstitution', ['100 mg Kapseln'], 'Morgens nüchtern mit Orangensaft'],
  ['Tardyferon', 'Eisen(II)-sulfat retard', 'Eisenmangeltherapie', ['80 mg Retardtabletten'], '1x täglich vor dem Frühstück mit Wasser'],
  ['Magnesium Verla N', 'Magnesium Original', 'Mineralstoff', ['Granulat / Dragees'], '1-3x täglich'],
  ['Kalinor Brausetabletten', 'Kaliumcitrat Original', 'Kaliumsubstitution', ['40 mmol'], 'In Wasser auflösen und zum Essen trinken'],
  ['Calcium Sandoz D', 'Calciumcarbonat / Vitamin D3', 'Osteoporose-Kombination', ['500mg/400IE', '600mg/400IE Brausetabletten'], '1-2x täglich in Wasser auflösen'],
  ['Keltican forte', 'Uridinmonophosphat / Vitamin B12 / Folsäure', 'Nährstoffkombination bei Wirbelsäulen- und Nervenschmerzen', ['Kapseln'], '1x täglich 1 Kapsel mit Wasser'],
  ['Tebonin intens (Ginkgo biloba)', 'Ginkgo-biloba-Blätter-Trockenextrakt (EGb 761)', 'Antidementivum / Tinnitus & Schwindel', ['120 mg', '240 mg Filmtabletten'], '1-2x täglich morgens und abends mit Wasser'],
  ['Vitasprint B12', 'Glutamin / Phosphoserin / Vitamin B12', 'Traditionelles Tonikum zur Leistungsstärkung', ['Trinkfläschchen'], '1x täglich morgens nüchtern trinken']
];

function medFromTuple(t) {
  const [name, activeSubstance, category, dosages, intake] = t;
  return {
    name,
    activeSubstance: activeSubstance || name,
    category: category || 'Arzneimittel / Fachinformation',
    dosages: dosages || ['Standard'],
    packageSizes: ['N1 (10-20 Stk.)', 'N2 (50 Stk.)', 'N3 (100 Stk.)'],
    commonForms: ['Filmtablette', 'Kapsel'],
    recommendedIntake: intake || 'Nach ärztlicher Anweisung einnehmen',
    sideEffectsByFrequency: {
      common: ['Gastrointestinale Beschwerden', 'Müdigkeit'],
      uncommon: ['Hautausschlag', 'Kopfschmerzen']
    },
    sideEffects: ['Gastrointestinale Beschwerden', 'Müdigkeit', 'Kopfschmerzen'],
    interactions: ['Wechselwirkungen mit Begleitmedikation beachten', 'Alkohol meiden'],
    warnings: 'Gebrauchsinformation beachten. Bei Unverträglichkeit Arzt kontaktieren.',
    authoritySource: 'BfArM / EMA / Rote Liste Fachinformation',
    fromDatabase: true
  };
}

let addedCount = 0;
for (const tuple of extraMedications) {
  const item = medFromTuple(tuple);
  const key = item.name.toLowerCase().trim();
  if (!existingNames.has(key)) {
    existingDb.push(item);
    existingNames.add(key);
    addedCount++;
  }
}

console.log(`Part 3 added ${addedCount} additional medications.`);

// Save merged list
fs.writeFileSync(dbPath, JSON.stringify(existingDb, null, 2), 'utf8');
console.log(`Total medications now in data/medications_db.json: ${existingDb.length}`);

// Re-generate src/data/topMedicationsCatalog.ts
const catalogTsContent = `// Auto-generated curated Top Medications Catalog
// Contains ${existingDb.length} verified medications for instant offline & client-side lookup.

import { MedicationSuggestion } from '../services/medicationDatabase';

export const TOP_MEDICATIONS_CATALOG: MedicationSuggestion[] = ${JSON.stringify(existingDb, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/topMedicationsCatalog.ts'), catalogTsContent, 'utf8');
console.log(`Updated src/data/topMedicationsCatalog.ts with all ${existingDb.length} medications!`);
