# scripts/classical_remedies_data_1.py
# Classical remedies A through C (~75 remedies)

REMEDIES_PART_1 = [
    {
        "id": "abrotanum",
        "latin": "Abrotanum",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Eberraute", "en": "Southernwood", "es": "Abrótano macho",
            "fr": "Aurone", "it": "Abrotano", "el": "Αβρότονον", "ru": "Полынь лечебная (Абротан)"
        },
        "origin": {
            "de": "Frische Blätter und Zweigspitzen von Artemisia abrotanum (Asteraceae).",
            "en": "Fresh leaves and young twigs of Artemisia abrotanum (Asteraceae)."
        },
        "essence": {
            "de": "Progressive Abmagerung, besonders der Beine, bei Kindern trotz gutem Appetit; Metastasierung von Entzündungen.",
            "en": "Progressive emaciation, especially of the lower limbs, in children despite ravenous appetite; metastasis of disease."
        },
        "indications": {
            "de": ["Marasmus bei Kindern", "Metastasierende Parotitis & Orchitis", "Rheumatismus nach unterdrücktem Durchfall", "Hydrozele"],
            "en": ["Marasmus in infants", "Metastatic mumps & orchitis", "Rheumatism following checked diarrhea", "Hydrocele"]
        },
        "keynotes": {
            "de": ["Abmagerung beginnt an den Beinen und steigt nach oben auf", "Großer Appetit, das Kind isst gierig, magert aber dennoch ab", "Haut hängt schlaff in Falten, Gesicht sieht greisenhaft aus", "Schmerzen wandern von einem Gelenk zum nächsten"],
            "en": ["Emaciation begins in lower extremities and ascends upward", "Ravenous appetite, eats heartily yet constantly loses weight", "Skin flabby and wrinkled, child has an old-man look", "Pains metastasize from joint to heart or bowel"]
        },
        "mind": {
            "de": "Äußerst reizbar, grausam, boshaft gegen Tiere und Kinder, niedergeschlagen.",
            "en": "Extremely irritable, morose, cruel to animals, depressed."
        },
        "better": {
            "de": ["Lockerung der Kleidung", "Freier Stuhlgang"],
            "en": ["Loosening clothing", "Free bowel motion"]
        },
        "worse": {
            "de": ["Kälte & feuchte Luft", "Nebel", "Unterdrückung von Absonderungen"],
            "en": ["Cold damp air", "Fog", "Suppressed discharges"]
        },
        "dosage": {
            "de": "D3 bis D6. 3x täglich 5 Tropfen.",
            "en": "3X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Stoffwechsel & Ernährung", "Mesenteriallymphknoten", "Gelenke & Sehnen"],
        "diffs": ["Iodium", "Sanicula", "Natrum mur", "Calcarea phos"],
        "keywords": ["abmagerung beine", "marasmus", "kindesabmagerung", "hunger", "metastasierung"]
    },
    {
        "id": "aceticum-acidum",
        "latin": "Aceticum acidum",
        "cat": "acid",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Essigsäure", "en": "Acetic Acid / Glacial Acetic Acid", "es": "Ácido acético",
            "fr": "Acide acétique", "it": "Acido acetico", "el": "Οξικό οξύ", "ru": "Уксусная кислота"
        },
        "origin": {
            "de": "Verdünnte reine Eisessigsäure (CH3COOH).",
            "en": "Diluted pure glacial acetic acid (CH3COOH)."
        },
        "essence": {
            "de": "Extremes, unstillbares Durstgefühl mit Wassersucht, Anämie und Schwäche; kein Durst im Fieber.",
            "en": "Extreme unquenchable thirst with dropsy, severe anemia, and prostration; thirstless during fever."
        },
        "indications": {
            "de": ["Generalisierte Ödeme & Aszites", "Chronische Kachexie", "Gastralgie mit brennendem Sodbrennen", "Postoperative Narkoseübelkeit"],
            "en": ["Generalized edema & ascites", "Chronic cachexia", "Gastralgia with violent pyrosis", "Post-anesthetic nausea"]
        },
        "keynotes": {
            "de": ["Großer Durst bei Wassersucht, aber fieberlos und durstlos bei Fieberhitze", "Schläft am besten in Bauchlage (wie Carbo animalis)", "Reichlicher, schwächender Nachtschweiß", "Wächserne Blässe und Kachexie"],
            "en": ["Violent thirst in dropsical states, but absence of thirst during fever", "Sleeps best lying flat on the stomach", "Copious, drenching, debilitating night sweats", "Waxy, pale countenance with emaciation"]
        },
        "mind": {
            "de": "Ängstlich über die Gesundheit, vergisst kürzliche Ereignisse, schwermütig.",
            "en": "Anxious about sickness, forgetful of recent events, despondent."
        },
        "better": {
            "de": ["Bauchlage", "Aufstoßen"],
            "en": ["Lying on abdomen", "Eructations"]
        },
        "worse": {
            "de": ["Rückenlage", "Kälte", "Gemüseverzehr"],
            "en": ["Lying on back", "Cold", "Vegetable diet"]
        },
        "dosage": {
            "de": "D3 bis D6. 2x täglich 5 Tropfen.",
            "en": "3X to 6X. 5 drops twice daily."
        },
        "sphere": ["Magen-Darm-Kanal", "Seröse Höhlen & Ödeme", "Blut & Zellgewebe"],
        "diffs": ["Apocynum", "Arsenicum album", "China"],
        "keywords": ["durst", "wassersucht", "essigsäure", "bauchlage", "anämie"]
    },
    {
        "id": "aesculus-hippocastanum",
        "latin": "Aesculus hippocastanum",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": True,
        "tier": 1,
        "names": {
            "de": "Rosskastanie", "en": "Horse Chestnut", "es": "Castaño de Indias",
            "fr": "Marronnier d'Inde", "it": "Ippocastano", "el": "Αγριοκαστανιά", "ru": "Конский каштан обыкновенный"
        },
        "origin": {
            "de": "Frische reife Samen (Kastanien) von Aesculus hippocastanum (Sapindaceae).",
            "en": "Fresh ripe seeds of Aesculus hippocastanum (Sapindaceae)."
        },
        "essence": {
            "de": "Venöse Stauung im Pfortadersystem mit Hämorrhoiden wie Holzsplitter, Kreuzschmerzen und Völlegefühl.",
            "en": "Venous engorgement of portal system with purple hemorrhoids like wooden splinters, sacroiliac backache, and fullness."
        },
        "indications": {
            "de": ["Blutende & blinde Hämorrhoiden", "Lumbosakraler Kreuzschmerz", "Chronische Proktitis & Fissuren", "Venöse Beckenstauung"],
            "en": ["Blind and bleeding hemorrhoids", "Lumbosacral backache", "Chronic proctitis & fissures", "Pelvic venous stasis"]
        },
        "keynotes": {
            "de": ["Gefühl, als sei das Rektum voller kleiner Holzsplitter oder Nadeln", "Dunkelviolette, schmerzhafte Hämorrhoidalknoten, selten blutend", "Schwerer, dumpfer Kreuzschmerz im Iliosakralgelenk, Gehen fast unmöglich", "Völlegefühl in Rektum, Leber und Becken"],
            "en": ["Sensation as if rectum were full of small wooden sticks or splinters", "Purple, painful, swollen piles that rarely bleed", "Severe, dull aching in sacroiliac joint, walking is difficult", "Fullness in rectum, portal system, and pelvis"]
        },
        "mind": {
            "de": "Depressiv, gereizt, morgens beim Erwachen verwirrt und missmutig.",
            "en": "Gloomy, irritable, wakes in the morning confused and irritable."
        },
        "better": {
            "de": ["Kühle Luft", "Mäßiges Gehen", "Kalte Waschungen"],
            "en": ["Cool air", "Moderate walking", "Cold applications"]
        },
        "worse": {
            "de": ["Stehen", "Bücken", "Aufstehen vom Sitzen", "Morgens"],
            "en": ["Standing", "Stooping", "Rising from a seat", "Morning"]
        },
        "dosage": {
            "de": "D2 bis D6. 3x täglich 5 Tropfen.",
            "en": "2X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Rektum & Analregion", "Pfortaderkreislauf", "Lumbosakralwirbelsäule"],
        "diffs": ["Collinsonia", "Hamamelis", "Nux vomica", "Aloe"],
        "keywords": ["hämorrhoiden", "holzsplitter", "kreuzschmerz", "rosskastanie", "pfortader"]
    },
    {
        "id": "aethusa-cynapium",
        "latin": "Aethusa cynapium",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": True,
        "tier": 2,
        "names": {
            "de": "Hundspetersilie", "en": "Fool's Parsley", "es": "Cicuta menor",
            "fr": "Petite ciguë", "it": "Cicuta minore", "el": "Αίθουσα", "ru": "Кокорыш обыкновенный (собачья петрушка)"
        },
        "origin": {
            "de": "Ganze frische blühende Pflanze von Aethusa cynapium (Apiaceae).",
            "en": "Whole fresh flowering plant of Aethusa cynapium (Apiaceae)."
        },
        "essence": {
            "de": "Völlige Unverträglichkeit von Milch bei Säuglingen; plötzliches Erbrechen von dicken Klumpen mit Schläfrigkeit.",
            "en": "Complete intolerance of milk in infants; violent sudden vomiting of curdled milk followed by deep sleep."
        },
        "indications": {
            "de": ["Säuglingsgastroenteritis", "Milchunverträglichkeit", "Prüfungsangst & geistige Blockade", "Zahnungsdiarrhö"],
            "en": ["Infantile gastroenteritis", "Milk intolerance in babies", "Examination funk & mental incapacity", "Dentition diarrhea"]
        },
        "keynotes": {
            "de": ["Erbricht Milch sofort nach dem Trinken in dicken, zähen Gerinnseln", "Völlige Erschöpfung und tiefe Schläfrigkeit unmittelbar nach dem Erbrechen", "Linie von den Nasenflügeln zu den Mundwinkeln (Linea nasalis)", "Unfähigkeit zu denken oder sich zu konzentrieren vor Prüfungen"],
            "en": ["Inability to digest milk; vomited in large curdled lumps as soon as taken", "Profound exhaustion and stuporous sleep immediately after vomiting", "Linea nasalis: distinct furrow from nostrils to mouth", "Brain fag, inability to concentrate or fix mind on study"]
        },
        "mind": {
            "de": "Geistige Erschöpfung, unfähig zu lesen, Angst vor dem Einschlafen, Wahnvorstellungen von Katzen und Hunden.",
            "en": "Mental exhaustion, incapable of thinking, fear of going to sleep, hallucination of cats/dogs."
        },
        "better": {
            "de": ["Frische Luft", "Nach tiefem Schlaf", "Unterhaltung"],
            "en": ["Open air", "After sound sleep", "Conversation"]
        },
        "worse": {
            "de": ["Milch", "Nach dem Erbrechen", "Hitze im Sommer", "Geistige Anstrengung"],
            "en": ["Milk", "After vomiting", "Summer heat", "Mental exertion"]
        },
        "dosage": {
            "de": "D6 bis C30. Bei Säuglingen D6 nach jedem Erbrechen.",
            "en": "6X to 30C. In infants 6X after each vomiting episode."
        },
        "sphere": ["Magen-Darm-Trakt", "Gehirn & Gemüt", "ZNS"],
        "diffs": ["Antimonium crudum", "Calcarea carb", "Magnesia carb", "Baryta carb"],
        "keywords": ["milch", "erbrechen klumpen", "säuglinge", "hundspetersilie", "schläfrigkeit"]
    },
    {
        "id": "agnus-castus",
        "latin": "Agnus castus",
        "cat": "plant",
        "authors": ["hahnemann", "kent", "hering"],
        "poly": True,
        "tier": 2,
        "names": {
            "de": "Mönchspfeffer / Keuschlamm", "en": "Chaste Tree", "es": "Sauzgatillo",
            "fr": "Gattilier", "it": "Agnocasto", "el": "Άγνος", "ru": "Витекс священный (Авраамово дерево)"
        },
        "origin": {
            "de": "Frische reife Beeren von Vitex agnus-castus (Lamiaceae).",
            "en": "Fresh ripe berries of Vitex agnus-castus (Lamiaceae)."
        },
        "essence": {
            "de": "Vollständige Impotenz mit kalten, erschlafften Genitalien; Vergesslichkeit und fixe Todesahnungen.",
            "en": "Complete sexual impotence with cold, flaccid genitalia; premature senility and fixed prediction of death."
        },
        "indications": {
            "de": ["Erektile Dysfunktion & Impotenz", "Agalaktie nach Entbindung", "Sekundäre Amenorrhö & PMS", "Nervöse Erschöpfung nach Exzessen"],
            "en": ["Erectile dysfunction & sexual debility", "Agalactia in nursing mothers", "Secondary amenorrhea & PMS", "Nervous breakdown after sexual excess"]
        },
        "keynotes": {
            "de": ["Genitalien kalt, schlaff und gefühllos; kein sexuelles Verlangen", "Chronischer, schmerzloser Tripper-Ausfluss (Gleitfluss)", "Versiegen der Muttermilch bei Wöchnerinnen mit Traurigkeit", "Prophezeit den genauen Tag seines Todes"],
            "en": ["Genitals cold, relaxed, flaccid; complete loss of sexual desire", "Chronic gleet with yellow discharge and relaxed parts", "Deficient or suppressed breast milk with sadness", "Fixed idea of approaching death, foretells the day"]
        },
        "mind": {
            "de": "Tiefe Melancholie, zerstreut, kann sich an nichts erinnern, wiederholt Gesagtes.",
            "en": "Profound sadness, extreme absent-mindedness, cannot recall names or words."
        },
        "better": {
            "de": ["Ruhe", "Warme Kleidung"],
            "en": ["Rest", "Warm clothing"]
        },
        "worse": {
            "de": ["Sexuelle Exzesse", "Kälte", "Berührung"],
            "en": ["Sexual indulgence", "Cold", "Touch"]
        },
        "dosage": {
            "de": "D2 bis D6. 3x täglich 5 Tropfen.",
            "en": "2X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Geschlechtsorgane (männlich & weiblich)", "Gemüt & Gedächtnis", "Mammae"],
        "diffs": ["Caladium", "Selenium", "Conium", "Lycopodium"],
        "keywords": ["impotenz", "mönchspfeffer", "milchmangel", "kalte genitalien", "gedächtnisschwäche"]
    },
    {
        "id": "aloe-socotrina",
        "latin": "Aloe socotrina",
        "cat": "plant",
        "authors": ["hahnemann", "kent", "hering"],
        "poly": True,
        "tier": 1,
        "names": {
            "de": "Echte Aloe", "en": "Socotrine Aloe", "es": "Áloe socotrino",
            "fr": "Aloès socotrin", "it": "Aloe socotrina", "el": "Αλόη", "ru": "Алоэ сокотринское"
        },
        "origin": {
            "de": "Eingedickter Saft der Blätter von Aloe perryi (Asphodelaceae).",
            "en": "Inspissated juice from leaves of Aloe perryi (Asphodelaceae)."
        },
        "essence": {
            "de": "Plötzlicher, unhaltbarer Stuhldrang morgens um 5 Uhr mit Unsicherheit des Schließmuskels und traubenförmigen Hämorrhoiden.",
            "en": "Sudden, uncontrollable morning stool driving from bed at 5 AM, sphincter insecurity, and bunches of grapes hemorrhoids."
        },
        "indications": {
            "de": ["Morgendliche Diarrhö", "Hämorrhoiden wie Weintrauben", "Chronische Proktitis mit Schleimabgang", "Portalstauung mit Kopfschmerz"],
            "en": ["Early morning diarrhea", "Hemorrhoids protruding like grapes", "Dysentery with copious jelly-like mucus", "Portal congestion with fronto-occipital headache"]
        },
        "keynotes": {
            "de": ["Stuhldrang treibt den Patienten morgens um 5 Uhr eilig aus dem Bett", "Unsicherheit des Sphincter ani: Traut sich nicht, Winde abzulassen", "Hämorrhoidalknoten hängen wie Weintrauben heraus, Besserung durch kaltes Wasser", "Reichlicher Abgang von gallertartigem, zähem Schleim mit dem Stuhl"],
            "en": ["Urgent stool drives patient out of bed at 5 AM", "Extreme weakness of sphincter ani: fears to pass flatus or urinate", "Hemorrhoids protrude like a bunch of grapes, relieved by cold bathing", "Passage of abundant jelly-like, transparent mucus"]
        },
        "mind": {
            "de": "Unlustig zu jeder Arbeit, mürrisch bei bewölktem Wetter, gereizt.",
            "en": "Disinclined to any exertion, ill-humored in cloudy weather, irritable."
        },
        "better": {
            "de": ["Kaltes Wasser & kalte Waschungen", "Frische kühle Luft", "Entleeren von Winden"],
            "en": ["Cold water applications", "Cool fresh air", "Expulsion of flatus"]
        },
        "worse": {
            "de": ["Frühmorgens im Bett", "Wärme", "Nach dem Essen oder Trinken", "Stehen"],
            "en": ["Early morning in bed", "Warmth", "Immediately after eating/drinking", "Standing"]
        },
        "dosage": {
            "de": "D4 bis C30. Im akuten Schub D6 alle 2 Stunden.",
            "en": "4X to 30C. In acute diarrhea 6X every 2 hours."
        },
        "sphere": ["Dickdarm & Rektum", "Sphincter ani", "Pfortadersystem", "Leber"],
        "diffs": ["Sulphur", "Podophyllum", "Aesculus", "Gambogia"],
        "keywords": ["aloe", "morgendurchfall", "schließmuskelschwäche", "hämorrhoiden weintrauben", "gallerte"]
    },
    {
        "id": "antimonium-sulfuratum-aurantiacum",
        "latin": "Antimonium sulfuratum aurantiacum",
        "cat": "mineral",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Goldschwefel / Antimonpentasulfid", "en": "Golden Sulfide of Antimony", "es": "Sulfuro dorado de antimonio",
            "fr": "Soufre doré d'antimoine", "it": "Zolfo dorato di antimonio", "el": "Χρυσός θειούχος αντιμονίτης", "ru": "Золотистый сульфид сурьмы"
        },
        "origin": {
            "de": "Amorphes Antimonpentasulfid (Sb2S5).",
            "en": "Amorphous antimony pentasulfide (Sb2S5)."
        },
        "essence": {
            "de": "Schwere Bronchialkatarrhe mit zähem, gelbem Schleim, Lungenstauung und chronischer Emphysemneigung.",
            "en": "Severe bronchial catarrh with tough yellow mucus, pulmonary engorgement, and emphysematous dyspnea."
        },
        "indications": {
            "de": ["Chronische obstruktive Bronchitis", "Lungenemphysem mit Schleimrasseln", "Trockener, harter Kitzelhusten", "Chronische Sinusitis"],
            "en": ["Chronic obstructive bronchitis", "Pulmonary emphysema with rattling", "Tickling dry racking cough", "Chronic purulent sinusitis"]
        },
        "keynotes": {
            "de": ["Reichliches Schleimrasseln in den Bronchien mit großer Auswurfschwierigkeit", "Zäher, gelb-oranger Schleim, der kaum abgehustet werden kann", "Enge- und Völlegefühl im Brustkorb mit Erstickungsanfällen", "Chronischer Katarrh bei älteren Menschen"],
            "en": ["Profuse rattling of mucus in respiratory tree with difficult expectoration", "Tough, adherent, yellow-orange mucus", "Tightness and constriction in thorax with dyspnea", "Winter coughs in aged, worn-out patients"]
        },
        "mind": {
            "de": "Trübsinnig, ängstlich bei Atemnot, verdrießlich.",
            "en": "Morose, apprehensive during dyspnea, fretful."
        },
        "better": {
            "de": ["Warme Getränke", "Aufrechtes Sitzen"],
            "en": ["Warm drinks", "Sitting upright"]
        },
        "worse": {
            "de": ["Kaltes nasses Wetter", "Frühmorgens", "Flaches Liegen"],
            "en": ["Cold damp weather", "Early morning", "Lying flat"]
        },
        "dosage": {
            "de": "D4 bis D6. 3x täglich 1 Tablette.",
            "en": "4X to 6X. 1 tablet 3 times daily."
        },
        "sphere": ["Bronchialschleimhaut", "Lunge", "Kehlkopf"],
        "diffs": ["Antimonium tartaricum", "Kali bichromicum", "Senega", "Ipecacuanha"],
        "keywords": ["goldschwefel", "rasseln", "bronchitis", "emphysem", "zäher auswurf"]
    },
    {
        "id": "antimonium-tartaricum",
        "latin": "Antimonium tartaricum",
        "cat": "mineral",
        "authors": ["hahnemann", "kent", "hering"],
        "poly": True,
        "tier": 1,
        "names": {
            "de": "Brechweinstein / Tartarus stibiatus", "en": "Tartar Emetic", "es": "Tártaro emético",
            "fr": "Tartre émétique", "it": "Tartaro emetico", "el": "Εμετικός λίθος", "ru": "Рвотный камень (Тартарус эметикус)"
        },
        "origin": {
            "de": "Kaliumantimonyltartrat-Kristalle (C4H4KO7Sb).",
            "en": "Potassium antimony tartrate crystals (C4H4KO7Sb)."
        },
        "essence": {
            "de": "Lautes Schleimrasseln in den Bronchien bei extremer Schwäche, das zähe Sekret kann nicht abgehustet werden.",
            "en": "Loud, coarse rattling of mucus in bronchial tree, patient is too exhausted to expectorate; cyanosis and cold sweat."
        },
        "indications": {
            "de": ["Bronchiolitis bei Säuglingen", "Senile Pneumonie", "Lungenödem & Herzversagen", "Erststickungsanfälle bei Asthma"],
            "en": ["Capillary bronchitis in infants", "Hypostatic pneumonia in the elderly", "Pulmonary edema & cardiac failure", "Suffocative asthmatic paroxysms"]
        },
        "keynotes": {
            "de": ["Brustkorb rasselt voller Schleim, doch fast nichts kommt beim Husten herauf", "Patient muss sich aufsetzen, um überhaupt atmen zu können", "Zyanose der Lippen und kalter Schweiß auf der Stirn", "Zunge dick weiß belegt mit roten Rändern"],
            "en": ["Chest rattling with mucus, seems full of phlegm yet little or none is raised", "Cannot lie down, must be supported upright in bed", "Cyanotic blue lips, pale face, and beaded cold sweat on forehead", "Thick white pasty coat on tongue with reddened papillae"]
        },
        "mind": {
            "de": "Kind will nicht berührt oder angeschaut werden, weint beim Wecken, apathisch.",
            "en": "Child cannot bear to be touched or looked at, whimpers, stuporous."
        },
        "better": {
            "de": ["Aufrechtes Sitzen", "Aufstoßen & Auswurf", "Kühle frische Luft"],
            "en": ["Sitting erect", "Eructation and expectoration", "Cool open air"]
        },
        "worse": {
            "de": ["Flaches Liegen", "Warme feuchte Zimmer", "Milch", "Morgens um 3-4 Uhr"],
            "en": ["Lying flat", "Warm damp room", "Milk", "Morning around 3-4 AM"]
        },
        "dosage": {
            "de": "D4 bis C30. Im akuten Zustand D6 alle 30 Minuten.",
            "en": "4X to 30C. In acute distress 6X every 30 minutes."
        },
        "sphere": ["Bronchien & Lungenbläschen", "Vagusnerv & Atemzentrum", "Magen"],
        "diffs": ["Ipecacuanha", "Carbo veg", "Ammonium carb", "Kali carb"],
        "keywords": ["brechweinstein", "schleimrasseln", "atemnot", "bronchiolitis", "zyanose"]
    },
    {
        "id": "apocynum-androsaemifolium",
        "latin": "Apocynum androsaemifolium",
        "cat": "plant",
        "authors": ["hering"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Fliegenfängerkraut", "en": "Spreading Dogbane / Bitterroot", "es": "Apocino amargo",
            "fr": "Apocyn à feuilles d'androsème", "it": "Apocino", "el": "Απόκυνον πικρό", "ru": "Кендырь ландышевый"
        },
        "origin": {
            "de": "Frische Wurzel von Apocynum androsaemifolium (Apocynaceae).",
            "en": "Fresh root of Apocynum androsaemifolium (Apocynaceae)."
        },
        "essence": {
            "de": "Wandernde Gelenkschmerzen, Krämpfe in Zehen und Fersen mit Gallendyspepsie.",
            "en": "Wandering rheumatic pains, severe cramping in toes and heels, and bilious dyspepsia."
        },
        "indications": {
            "de": ["Rheumatische Gelenkentzündungen", "Krämpfe der Fußsohlen & Zehen", "Gallenstauung mit Kopfschmerz", "Fibromyalgie"],
            "en": ["Rheumatic polyarthritis", "Cramping in soles and toes", "Bilious hepatic congestion", "Fibromyalgia"]
        },
        "keynotes": {
            "de": ["Gelenkschmerzen springen rasch von einem Gelenk zum anderen", "Schmerzhaftes Krampfen in Zehen, Fersen und Fußsohlen", "Erbrechen von Galle und reichlicher Schweiß ohne Linderung", "Gefühl von Zerschlagenheit in allen Gelenken"],
            "en": ["Rheumatic pains rapidly shifting from joint to joint", "Violent cramping in toes, heels, and bottoms of feet", "Bilious vomiting with profuse sweat affording no relief", "Severe bruised aching in all articulations"]
        },
        "mind": {
            "de": "Niedergeschlagen, schläfrig am Tag, mürrisch.",
            "en": "Depressed, drowsy in daytime, sullen."
        },
        "better": {
            "de": ["Warme Einhüllung", "Ruhe"],
            "en": ["Warm wrapping", "Quiet rest"]
        },
        "worse": {
            "de": ["Kälte", "Bewegungsbeginn", "Nachts"],
            "en": ["Cold", "Beginning of motion", "Night"]
        },
        "dosage": {
            "de": "D2 bis D6. 3x täglich 5 Tropfen.",
            "en": "2X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Gelenke & Sehnen", "Fußmuskulatur", "Gallenwege"],
        "diffs": ["Pulsatilla", "Bryonia", "Colchicum", "Ledum"],
        "keywords": ["fliegenfänger", "wandernder rheumatismus", "zehenkrämpfe", "fersenschmerz"]
    },
    {
        "id": "arum-triphyllum",
        "latin": "Arum triphyllum",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": True,
        "tier": 2,
        "names": {
            "de": "Dreiblättriger Aronstab / Zehrwurz", "en": "Jack-in-the-Pulpit / Indian Turnip", "es": "Aro triphylo",
            "fr": "Arum d'Amérique", "it": "Aro americano", "el": "Άρον τρίφυλλον", "ru": "Аронник трехлистный"
        },
        "origin": {
            "de": "Frischer Wurzelknollen von Arisaema triphyllum (Araceae).",
            "en": "Fresh tuberous root of Arisaema triphyllum (Araceae)."
        },
        "essence": {
            "de": "Extrem ätzender, wundmachender Scharlachkatarrh mit ständigem, zwanghaftem Bohren in Nase und Lippen bis zur Blutung.",
            "en": "Violently acrid, excoriating catarrh with irresistible compulsive picking at lips and nose until raw and bleeding."
        },
        "indications": {
            "de": ["Malignes Scharlach", "Ulzeröse Tonsillitis & Diphtherie", "Akute Heiserkeit bei Rednern", "Ätzender Fließschnupfen"],
            "en": ["Malignant scarlet fever", "Ulcerative tonsillitis & diphtheria", "Acute vocal strain hoarseness", "Excoriating coryza"]
        },
        "keynotes": {
            "de": ["Patient bohrt zwanghaft in Nase, Lippen und Mundwinkeln, bis alles blutet", "Ätzendes Nasensekret macht Oberlippe und Nasenflügel scharlachrot und wund", "Stimme bricht plötzlich und überschlägt sich beim Sprechen", "Mund und Zunge brennen wie feurige Kohlen"],
            "en": ["Compulsive boring into nose, lips, and facial corners until raw and bleeding", "Acrid, ichorous coryza burning and eroding the skin of upper lip", "Voice suddenly breaks, changes pitch unpredictably when speaking", "Mouth, lips, and tongue feel as if raw and scalded by fire"]
        },
        "mind": {
            "de": "Extrem unruhig, zupft an Decken und Lippen, wütend, schreit vor Schmerz.",
            "en": "Restless, picks at bedclothes and lips, furious, screams with pain."
        },
        "better": {
            "de": ["Aufrechtes Halten", "Frische Luft"],
            "en": ["Erect posture", "Fresh air"]
        },
        "worse": {
            "de": ["Stimmbelastung (Sprechen)", "Kalter Nordwind", "Liegen"],
            "en": ["Vocal exertion", "Cold dry north wind", "Lying down"]
        },
        "dosage": {
            "de": "D4 bis C30. Im Akutstadium D6 stündlich.",
            "en": "4X to 30C. In acute conditions 6X every hour."
        },
        "sphere": ["Mund- und Rachenschleimhaut", "Stimmbänder", "Nasenflügel & Lippen"],
        "diffs": ["Ailanthus", "Baptisia", "Argentum nitricum", "Belladonna"],
        "keywords": ["aronstab", "lippenzupfen", "bohren nase", "blutige lippen", "heiserkeit"]
    }
]

print(f"Data part 1 initialized with {len(REMEDIES_PART_1)} entries.")
