# scripts/data_kent_a_m.py
# Kent and classical remedies A through M

REMEDIES_A_M = [
    {
        "id": "ailanthus-glandulosa",
        "latin": "Ailanthus glandulosa",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Götterbaum", "en": "Tree of Heaven", "es": "Árbol del cielo",
            "fr": "Ailante glanduleux", "it": "Albero del paradiso", "el": "Αείλανθος", "ru": "Айлант"
        },
        "origin": {
            "de": "Frische Rinde und Blüten des Götterbaums (Simaroubaceae).",
            "en": "Fresh bark and flowers of Ailanthus glandulosa (Simaroubaceae)."
        },
        "essence": {
            "de": "Schwere septische Zustände mit tiefem Stupor, dunkelrotem Ausschlag und zyanotischem Rachen.",
            "en": "Severe septic conditions with profound stupor, dark livid rash, and malignant sore throat."
        },
        "indications": {
            "de": ["Malignes Scharlach", "Septische Diphtherie", "Zyanotische Angina", "Stuporöse Infekte"],
            "en": ["Malignant scarlatina", "Septic diphtheria", "Cyanotic tonsillitis", "Stuporous fevers"]
        },
        "keynotes": {
            "de": ["Tiefe Benommenheit und Apathie mit halboffenem Mund", "Maligner, dunkelroter oder livider Ausschlag", "Übelriechender Speichel und geschwollene Zunge", "Extreme Erschöpfung bei Infektionskrankheiten"],
            "en": ["Profound stupor and apathy with half-open mouth", "Livid, dark rash that fails to come out properly", "Fetid saliva and swollen tongue", "Extreme prostration in infectious diseases"]
        },
        "mind": {
            "de": "Völlige Gleichgültigkeit, erkennt die Umgebung nicht, delirierend.",
            "en": "Complete indifference, semi-conscious stupor, muttering delirium."
        },
        "better": {
            "de": ["Frische Luft", "Ruhelage"],
            "en": ["Fresh air", "Quiet rest"]
        },
        "worse": {
            "de": ["Aufrichten", "Schlucken", "Wärme"],
            "en": ["Sitting up", "Swallowing", "Warmth"]
        },
        "dosage": {
            "de": "D4 bis D12. Bei akuter Toxizität D6 alle 2 Stunden.",
            "en": "6X to 12X. In acute toxicity 6X every 2 hours."
        },
        "sphere": ["Hals & Rachen", "Blut & Sepsis", "ZNS", "Haut"],
        "diffs": ["Baptisia", "Belladonna", "Lachesis", "Rhus tox"],
        "keywords": ["scharlach", "angina", "stupor", "dunkler ausschlag", "sepsis"]
    },
    {
        "id": "aletris-farinosa",
        "latin": "Aletris farinosa",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Mehlige Sternwurzel", "en": "Star Grass", "es": "Hierba estrella",
            "fr": "Alétris farineux", "it": "Erba stella", "el": "Άλετρις", "ru": "Алетрис"
        },
        "origin": {
            "de": "Getrockneter Wurzelstock von Aletris farinosa (Liliaceae).",
            "en": "Dried rhizome of Aletris farinosa (Liliaceae)."
        },
        "essence": {
            "de": "Müdigkeit, Uterusschwäche und Anämie bei erschöpften Frauen mit habitueller Abortneigung.",
            "en": "Exhaustion, uterine atony, and anemia in worn-out women prone to habitual miscarriage."
        },
        "indications": {
            "de": ["Uterussenkung", "Habitueller Abort", "Postpartale Erschöpfung", "Dyspepsie bei Anämie"],
            "en": ["Uterine prolapse", "Habitual abortion", "Postpartum exhaustion", "Dyspepsia in anemia"]
        },
        "keynotes": {
            "de": ["Ständiges Gefühl von Uterusschwäche und Schwere im Becken", "Müde, ausgezehrte Konstitution mit Verdauungsschwäche", "Erbrechen und Übelkeit während der Schwangerschaft", "Verstopfung mit hartem Stuhl durch Darmatonie"],
            "en": ["Constant feeling of uterine weakness and pelvic heaviness", "Tired, chlorotic constitution with poor digestion", "Obstinate vomiting and morning sickness in pregnancy", "Constipation from rectal and bowel atony"]
        },
        "mind": {
            "de": "Niedergeschlagen, müde des Lebens, nervöse Erschöpfung.",
            "en": "Depressed, tired of life, nervous fatigue."
        },
        "better": {
            "de": ["Ruhe", "Nach gutem Schlaf"],
            "en": ["Rest", "After restorative sleep"]
        },
        "worse": {
            "de": ["Geringste Anstrengung", "Bücken", "Schwangerschaft"],
            "en": ["Least exertion", "Bending over", "Pregnancy"]
        },
        "dosage": {
            "de": "D3 bis D6. 3x täglich 5 Tropfen.",
            "en": "3X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Weibliche Geschlechtsorgane", "Verdauungstrakt", "Blutbildung"],
        "diffs": ["Helonias", "Sepia", "Fraxinus", "China"],
        "keywords": ["uterussenkung", "abortneigung", "schwäche", "anämie", "übelkeit"]
    },
    {
        "id": "allium-sativum",
        "latin": "Allium sativum",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Knoblauch", "en": "Garlic", "es": "Ajo",
            "fr": "Ail cultivé", "it": "Aglio", "el": "Σκόρδο", "ru": "Чеснок"
        },
        "origin": {
            "de": "Frische Zwiebelknolle von Allium sativum (Amaryllidaceae).",
            "en": "Fresh bulb of Allium sativum (Amaryllidaceae)."
        },
        "essence": {
            "de": "Dyspepsie bei Fleischessern mit zähem Bronchialsekret und brennendem Magendruck.",
            "en": "Dyspepsia in excessive meat-eaters with tenacious bronchial mucus and burning stomach pressure."
        },
        "indications": {
            "de": ["Chronische Bronchitis", "Dyspepsie nach Diätfehlern", "Bluthochdruck & Arteriosklerose", "Meteorismus"],
            "en": ["Chronic bronchitis", "Dyspepsia from dietary errors", "Hypertension & arteriosclerosis", "Flatulence"]
        },
        "keynotes": {
            "de": ["Reichlicher, zäher, klebriger Schleim in den Atemwegen", "Magenbeschwerden durch Fleischkonsum und Überernährung", "Heißhunger, aber das Essen verursacht Unbehagen", "Besserung der Magenbeschwerden durch Bücken"],
            "en": ["Copious, tenacious, sticky mucus in respiratory tract", "Stomach disturbances from meat eating and overeating", "Canine hunger, but eating causes distress", "Relief of gastric pain by bending double"]
        },
        "mind": {
            "de": "Ungeduldig, ängstlich bezüglich Gesundheit, empfindlich gegen Gerüche.",
            "en": "Impatient, anxious about health, sensitive to odors."
        },
        "better": {
            "de": ["Bücken nach vorne", "Sitzen"],
            "en": ["Bending forward", "Sitting"]
        },
        "worse": {
            "de": ["Kälte & Feuchtigkeit", "Fleischgenuss", "Gehen"],
            "en": ["Cold and damp", "Eating meat", "Walking"]
        },
        "dosage": {
            "de": "D2 bis D6. 3x täglich 5 Tropfen.",
            "en": "2X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Magen-Darm-Trakt", "Bronchien", "Kreislauf"],
        "diffs": ["Nux vomica", "Antimonium crudum", "Bryonia", "Pulsatilla"],
        "keywords": ["knoblauch", "dyspepsie", "fleisch", "bronchitis", "zäher schleim"]
    },
    {
        "id": "alumina-phosphorica",
        "latin": "Alumina phosphorica",
        "cat": "mineral",
        "authors": ["kent"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Aluminiumphosphat", "en": "Aluminium Phosphate", "es": "Fosfato de aluminio",
            "fr": "Phosphate d'aluminium", "it": "Fosfato di alluminio", "el": "Φωσφορικό αργίλιο", "ru": "Фосфат алюминия"
        },
        "origin": {
            "de": "Chemische Verbindung aus Tonerde und Phosphorsäure.",
            "en": "Chemical compound of alumina and phosphoric acid."
        },
        "essence": {
            "de": "Tiefe Nervenschwäche mit Gedächtnisverlust, chronischer Verstopfung und Kälteempfindlichkeit.",
            "en": "Profound nervous debility with loss of memory, chronic constipation, and extreme chilliness."
        },
        "indications": {
            "de": ["Chronische Parästhesien", "Atonische Obstipation", "Geistige Erschöpfung & Demenzneigung", "Wirbelsäulenschwäche"],
            "en": ["Chronic paresthesia", "Atonic constipation", "Mental exhaustion & cognitive decline", "Spinal weakness"]
        },
        "keynotes": {
            "de": ["Große Trägheit des Mastdarms, selbst weicher Stuhl erfordert starkes Pressen", "Extreme Kälteempfindlichkeit und Frösteln", "Zittern der Gliedmaßen und Schwäche der Beine", "Verwirrung über die eigene Identität"],
            "en": ["Great inactivity of rectum, even soft stool requires heavy straining", "Extreme lack of vital heat and chilliness", "Trembling of limbs and weakness of legs", "Confusion regarding personal identity"]
        },
        "mind": {
            "de": "Verwirrt, ängstlich am Morgen, Gedächtnisschwund, Hastigkeit mit innerer Langsamkeit.",
            "en": "Confused, anxious in the morning, memory loss, hurried yet slow in action."
        },
        "better": {
            "de": ["Wärme", "Ruhe", "Warmes Einhüllen"],
            "en": ["Warmth", "Rest", "Warm wrapping"]
        },
        "worse": {
            "de": ["Kälte", "Geistige Anstrengung", "Morgens beim Erwachen"],
            "en": ["Cold", "Mental exertion", "Morning on waking"]
        },
        "dosage": {
            "de": "C30 oder C200. Einzeldosis.",
            "en": "30C or 200C. Single dose."
        },
        "sphere": ["Nervensystem & Rückenmark", "Mastdarm", "Gemüt"],
        "diffs": ["Alumina", "Phosphorus", "Plumbum", "Silicea"],
        "keywords": ["nervenschwäche", "obstipation", "gedächtnisverlust", "kälte", "wirbelsäule"]
    },
    {
        "id": "alumina-silicata",
        "latin": "Alumina silicata",
        "cat": "mineral",
        "authors": ["kent"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Aluminiumsilikat / Kaolin", "en": "Aluminium Silicate", "es": "Silicato de aluminio",
            "fr": "Silicate d'aluminium", "it": "Silicato di alluminio", "el": "Πυριτικό αργίλιο", "ru": "Силикат алюминия"
        },
        "origin": {
            "de": "Natürliches Aluminiumsilikat (Tonerdesilikat).",
            "en": "Natural aluminium silicate (porcelain clay)."
        },
        "essence": {
            "de": "Chronische Schwächezustände mit Eiterungsneigung, trockenem Katarrh und Verstopfung.",
            "en": "Chronic debilitated states with tendency to suppuration, dry catarrh, and constipation."
        },
        "indications": {
            "de": ["Chronische Rhinitis mit Krusten", "Tiefe Abmagerung", "Obstipation mit Schleimhauttrockenheit", "Wirbelsäulenschmerzen"],
            "en": ["Chronic crusty rhinitis", "Deep emaciation", "Constipation with mucosal dryness", "Spinal pains"]
        },
        "keynotes": {
            "de": ["Ausgeprägte Trockenheit aller Schleimhäute", "Kältegefühl in Knochen und Wirbelsäule", "Atonie des Rektums wie Alumina", "Frostig, magert trotz normalen Appetits ab"],
            "en": ["Marked dryness of all mucous membranes", "Coldness in bones and spine", "Inactivity of rectum like Alumina", "Chilly, emaciates despite normal appetite"]
        },
        "mind": {
            "de": "Niedergeschlagen, reizbar, abgeneigt gegen Gesellschaft, geistige Trägheit.",
            "en": "Despondent, irritable, averse to company, mental sluggishness."
        },
        "better": {
            "de": ["Wärme", "Trockenes Wetter", "Gemäßigte Bewegung"],
            "en": ["Warmth", "Dry weather", "Moderate motion"]
        },
        "worse": {
            "de": ["Kälte und Feuchtigkeit", "Geistige Arbeit", "Morgens"],
            "en": ["Cold and damp", "Mental labor", "Morning"]
        },
        "dosage": {
            "de": "C30 bis C200. Seltene Gabe.",
            "en": "30C to 200C. Infrequent dose."
        },
        "sphere": ["Schleimhäute", "Nervensystem", "Knochen & Gelenke"],
        "diffs": ["Alumina", "Silicea", "Calcarea silicata"],
        "keywords": ["krusten", "abmagerung", "schleimhauttrockenheit", "kaolin", "wirbelsäule"]
    },
    {
        "id": "ammonium-phosphoricum",
        "latin": "Ammonium phosphoricum",
        "cat": "mineral",
        "authors": ["kent"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Ammoniumphosphat", "en": "Ammonium Phosphate", "es": "Fosfato de amonio",
            "fr": "Phosphate d'ammonium", "it": "Fosfato di ammonio", "el": "Φωσφορικό αμμώνιο", "ru": "Фосфат аммония"
        },
        "origin": {
            "de": "Synthetisches Salz aus Ammoniak und Phosphorsäure.",
            "en": "Synthetic salt of ammonia and phosphoric acid."
        },
        "essence": {
            "de": "Gichtige Knötchen an Fingern und Gelenken bei Patienten mit Neigung zu Bronchitis und Harnsäureüberlastung.",
            "en": "Gouty nodosities in finger joints of patients subject to bronchitis and uric acid diathesis."
        },
        "indications": {
            "de": ["Arthritis urica (Gichtknoten)", "Heberden-Knoten", "Chronische Bronchitis bei Gicht", "Gelenksteifigkeit"],
            "en": ["Gouty arthritis (tophi)", "Heberden's nodes", "Chronic gouty bronchitis", "Joint stiffness"]
        },
        "keynotes": {
            "de": ["Gichtknoten an den Fingern und Fußgelenken", "Harnsäure-Urin mit stechendem Ammoniakgeruch", "Tiefer Husten mit zähem Schleim bei gichtigen Patienten", "Verdrehung und Verformung der Gelenke"],
            "en": ["Gouty concretions in finger and toe joints", "Uric acid urine with pungent ammoniacal odor", "Deep cough with tenacious mucus in gouty subjects", "Distortion and deformity of small joints"]
        },
        "mind": {
            "de": "Reizbar bei Schmerzen, unruhig, mürrisch.",
            "en": "Irritable during arthritic pains, restless, morose."
        },
        "better": {
            "de": ["Wärme", "Ruhige Lage"],
            "en": ["Warmth", "Quiet rest"]
        },
        "worse": {
            "de": ["Kälte & Nässe", "Wetterwechsel", "Fleischreiche Kost"],
            "en": ["Cold and wet", "Weather change", "Rich meat diet"]
        },
        "dosage": {
            "de": "D3 bis D6. 2x täglich 1 Tablette.",
            "en": "3X to 6X. 1 tablet twice daily."
        },
        "sphere": ["Gelenke & Sehnen", "Stoffwechsel (Harnsäure)", "Atemwege"],
        "diffs": ["Benzoic acidum", "Ledum", "Colchicum", "Ammonium carb"],
        "keywords": ["gicht", "gichtknoten", "harnsäure", "fingergelenke", "arthritis"]
    },
    {
        "id": "apocynum-cannabinum",
        "latin": "Apocynum cannabinum",
        "cat": "plant",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Indianischer Hanf / Hundsgift", "en": "Indian Hemp / Dogbane", "es": "Cáñamo de Canadá",
            "fr": "Apocyn chanvrin", "it": "Canapa canadese", "el": "Απόκυνον", "ru": "Апоцинум конопляный"
        },
        "origin": {
            "de": "Frischer Wurzelstock von Apocynum cannabinum (Apocynaceae).",
            "en": "Fresh rhizome of Apocynum cannabinum (Apocynaceae)."
        },
        "essence": {
            "de": "Wassersucht, Aszites und generalisierte Ödeme mit starkem Durst und Magenintoleranz für kaltes Wasser.",
            "en": "Dropsy, ascites, and generalized edema with intense thirst but stomach intolerance of cold water."
        },
        "indications": {
            "de": ["Kardiale Ödeme", "Aszites & Leberzirrhose", "Hydrothorax & Lungenödem", "Urinverhaltung bei Ödemen"],
            "en": ["Cardiac edema", "Ascites & hepatic cirrhosis", "Hydrothorax & pulmonary edema", "Urinary suppression with dropsy"]
        },
        "keynotes": {
            "de": ["Starke Schwellung und Wassersucht aller Körperhöhlen", "Großer Durst, aber kaltes Wasser verursacht Magenweh und Erbrechen", "Spärlicher, dunkler Urin", "Beklemmung und Erstickungsgefühl im Liegen"],
            "en": ["Severe dropsical swelling of cellular tissue and serous cavities", "Unquenchable thirst, but cold water causes stomach ache and vomiting", "Scanty, dark, turbid urine", "Oppression and suffocation on lying down"]
        },
        "mind": {
            "de": "Ängstlich wegen Atemnot, benommen, depressiv.",
            "en": "Anxious due to dyspnea, drowsy, depressed."
        },
        "better": {
            "de": ["Aufrechtes Sitzen", "Warmes Trinken"],
            "en": ["Sitting upright", "Warm drinks"]
        },
        "worse": {
            "de": ["Kaltes Trinken", "Flaches Liegen", "Kälte"],
            "en": ["Cold drinks", "Lying flat", "Cold"]
        },
        "dosage": {
            "de": "D2 bis D6. 3x täglich 5 Tropfen.",
            "en": "2X to 6X. 5 drops 3 times daily."
        },
        "sphere": ["Herz-Kreislauf", "Nieren & Harnwege", "Seröse Häute"],
        "diffs": ["Arsenicum album", "Digitalis", "Helleborus", "Apis"],
        "keywords": ["wassersucht", "ödeme", "durst", "aszites", "kardiale insuffizienz"]
    },
    {
        "id": "argentum-metallicum",
        "latin": "Argentum metallicum",
        "cat": "mineral",
        "authors": ["hahnemann", "kent", "hering"],
        "poly": True,
        "tier": 1,
        "names": {
            "de": "Silber", "en": "Silver", "es": "Plata metálica",
            "fr": "Argent métallique", "it": "Argento metallico", "el": "Μεταλλικός άργυρος", "ru": "Серебро металлическое"
        },
        "origin": {
            "de": "Reines gefälltes Silber (Ag).",
            "en": "Pure precipitated silver metal (Ag)."
        },
        "essence": {
            "de": "Heiserkeit bei Sängern und Rednern mit Kehlkopfkatarrh, Knorpelerkrankungen und Hodenaffektionen.",
            "en": "Chronic hoarseness in singers and public speakers, laryngeal catarrh, and affections of cartilage and testes."
        },
        "indications": {
            "de": ["Sängerheiserkeit & Laryngitis", "Arthropathien der Knorpel", "Chronische Pharyngitis", "Orchitis & Hodenverhärtung"],
            "en": ["Vocalist hoarseness & laryngitis", "Cartilaginous arthropathy", "Chronic pharyngitis", "Orchitis & testicular induration"]
        },
        "keynotes": {
            "de": ["Vollständiger Stimmverlust nach Singen oder Sprechen", "Zäher, geleeartiger Schleim im Kehlkopf, der leicht abgehustet wird", "Wundheit und Schmerzen in Knorpelgeweben (Ohren, Rippen, Gelenke)", "Krampfartige Schmerzen im linken Ovar oder Hoden"],
            "en": ["Complete loss of voice after professional singing or speaking", "Tenacious, jelly-like mucus in larynx, easily hawked up", "Soreness and pain in cartilaginous tissues (ears, ribs, joints)", "Crushing pain in left ovary or testicle"]
        },
        "mind": {
            "de": "Hastig, redselig, ängstlich bei Terminen, Gedächtnisschwund.",
            "en": "Hurried, talkative, anxious over appointments, memory failure."
        },
        "better": {
            "de": ["Frische Luft", "Aufstoßen", "Ruhiges Sitzen"],
            "en": ["Open air", "Belching", "Sitting quietly"]
        },
        "worse": {
            "de": ["Stimmgebrauch (Sprechen, Singen)", "Berührung", "Mittags"],
            "en": ["Voice use (speaking, singing)", "Touch", "Noon"]
        },
        "dosage": {
            "de": "D6 bis C30. Bei Heiserkeit D6 vor Auftritten.",
            "en": "6X to 30C. 6X prior to vocal strain."
        },
        "sphere": ["Kehlkopf & Stimmbänder", "Knorpelgewebe", "Hoden & Ovarien"],
        "diffs": ["Argentum nitricum", "Arum triphyllum", "Causticum", "Phosphorus"],
        "keywords": ["heiserkeit", "sänger", "kehlkopf", "knorpel", "stimme"]
    },
    {
        "id": "arsenicum-hydrogenisatum",
        "latin": "Arsenicum hydrogenisatum",
        "cat": "mineral",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Arsenwasserstoff", "en": "Arseniuretted Hydrogen", "es": "Hidrógeno arseniado",
            "fr": "Hydrogène arsénié", "it": "Idrogeno arsenicale", "el": "Αρσενιούχο υδρογόνο", "ru": "Мышьяковистый водород"
        },
        "origin": {
            "de": "Gereinigtes Arsenwasserstoffgas in Wasser gelöst.",
            "en": "Arseniuretted hydrogen gas dissolved in water."
        },
        "essence": {
            "de": "Tiefgreifende Hämolyse mit Hämaturie, Schockzustand und brennenden Schmerzen.",
            "en": "Profound hemolysis with hematuria, collapse, and severe burning pains."
        },
        "indications": {
            "de": ["Hämolytische Anämie", "Hämaturie & Urämie", "Schwere toxische Nephrose", "Kollaps mit Kälte"],
            "en": ["Hemolytic anemia", "Hematuria & uremia", "Toxic nephrosis", "Collapse with coldness"]
        },
        "keynotes": {
            "de": ["Dunkler, blutiger Urin mit totaler Erschöpfung", "Brennende Hitze im Magen mit kaltem Körperschweiß", "Bronzefarbene oder zyanotische Hautverfärbung", "Plötzlicher Kräfteverfall innerhalb von Stunden"],
            "en": ["Dark bloody urine accompanied by rapid collapse", "Burning heat in epigastrium with icy cold sweat", "Bronze or cyanotic discoloration of skin", "Sudden sinking of vital power within hours"]
        },
        "mind": {
            "de": "Extreme Todesangst, Agonie, motorische Ruhelosigkeit.",
            "en": "Intense fear of death, agony, driven restlessness."
        },
        "better": {
            "de": ["Äußere Wärme", "Einhüllen"],
            "en": ["External heat", "Warm wrapping"]
        },
        "worse": {
            "de": ["Kälte", "Nacht (nach Mitternacht)", "Bewegung"],
            "en": ["Cold", "Night (after midnight)", "Motion"]
        },
        "dosage": {
            "de": "C30 bis C200. Seltene Gabe unter ärztlicher Führung.",
            "en": "30C to 200C. Infrequent administration."
        },
        "sphere": ["Erythrozyten & Blut", "Nieren & Harnwege", "Gefäßsystem"],
        "diffs": ["Arsenicum album", "Phosphorus", "Crotalus", "Lachesis"],
        "keywords": ["hämolyse", "hämaturie", "kollaps", "schock", "bluturin"]
    },
    {
        "id": "arsenicum-iodatum",
        "latin": "Arsenicum iodatum",
        "cat": "mineral",
        "authors": ["kent", "hering"],
        "poly": True,
        "tier": 2,
        "names": {
            "de": "Arsentrijodid", "en": "Arsenic Triiodide", "es": "Yoduro de arsénico",
            "fr": "Iodure d'arsenic", "it": "Ioduro di arsenico", "el": "Ιωδιούχο αρσενικό", "ru": "Йодид мышьяка"
        },
        "origin": {
            "de": "Chemische Verbindung aus Arsen und Jod (AsI3).",
            "en": "Chemical compound of arsenic and iodine (AsI3)."
        },
        "essence": {
            "de": "Scharfer, brennender, ätzender Katarrh bei abgemagerten Patienten mit chronischer Bronchitis oder Psoriasis.",
            "en": "Acrid, corrosive, excoriating catarrh in emaciated patients with chronic bronchitis or psoriasis."
        },
        "indications": {
            "de": ["Chronischer Heuschnupfen mit wundmachendem Sekret", "Psoriasis & schuppende Ekzeme", "Chronische Tuberkulose & Bronchitis", "Arteriosklerose mit Herzmuskelschwäche"],
            "en": ["Chronic hay fever with excoriating discharge", "Psoriasis & exfoliative eczema", "Chronic bronchitis and phthisis", "Arteriosclerosis with cardiac weakness"]
        },
        "keynotes": {
            "de": ["Ätzende, dünne, wässrige Sekrete, die Lippen und Nasenflügel wund brennen", "Ständiges Frösteln trotz Neigung zu Hitzewallungen", "Ausgeprägte Abmagerung trotz gutem Appetit", "Trockene, schuppige Hauteruptionen mit starkem Brennen"],
            "en": ["Acrid, thin, watery discharges excoriating the upper lip and nose", "Continuous chilliness alternating with hot flushes", "Marked emaciation despite ravenous hunger", "Dry scaly skin eruptions with severe burning"]
        },
        "mind": {
            "de": "Unruhig, ängstlich, ungeduldig, muss ständig in Bewegung sein.",
            "en": "Restless, anxious, impatient, driven to keep moving."
        },
        "better": {
            "de": ["Warmes trockenes Wetter", "Frische Luft (beim Atmen)"],
            "en": ["Warm dry weather", "Open air (for respiration)"]
        },
        "worse": {
            "de": ["Kalter Wind & Nässe", "Anstrengung", "Nachts"],
            "en": ["Cold wind and dampness", "Exertion", "Night"]
        },
        "dosage": {
            "de": "D4 bis D12. 2-3x täglich 1 Tablette.",
            "en": "4X to 12X. 1 tablet 2-3 times daily."
        },
        "sphere": ["Atemwege & Lunge", "Haut & Epithelien", "Herz & Kreislauf"],
        "diffs": ["Arsenicum album", "Iodium", "Kali iodatum", "Tuberculinum"],
        "keywords": ["heuschnupfen", "ätzender schnupfen", "psoriasis", "abmagerung", "schuppen"]
    },
    {
        "id": "arsenicum-metallicum",
        "latin": "Arsenicum metallicum",
        "cat": "mineral",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Metallisches Arsen", "en": "Metallic Arsenic", "es": "Arsénico metálico",
            "fr": "Arsenic métallique", "it": "Arsenico metallico", "el": "Μεταλλικό αρσενικό", "ru": "Мышьяк металлический"
        },
        "origin": {
            "de": "Reines kristallines metallisches Arsen.",
            "en": "Pure crystalline metallic arsenic."
        },
        "essence": {
            "de": "Generalisierte Schwellungen, Schläfrigkeit und brennende Hitze mit Kopfschmerzen.",
            "en": "Generalized puffiness, intense drowsiness, and burning heat with congestive headache."
        },
        "indications": {
            "de": ["Gesichtsödem & Lidschwellung", "Kongestive Kopfschmerzen", "Magenbrennen mit Aufstoßen", "Chronische Hautulzeration"],
            "en": ["Facial edema & puffy eyelids", "Congestive headaches", "Pyrosis with belching", "Chronic skin ulceration"]
        },
        "keynotes": {
            "de": ["Aufgedunsenes Gesicht mit Schwellung der Augenlider", "Übermäßige Schläfrigkeit tagsüber mit Schwäche", "Brennende Schmerzen in Magen und Brustkorb", "Verlangen nach warmen Getränken"],
            "en": ["Puffiness of face with marked edema of eyelids", "Excessive daytime drowsiness with debility", "Burning pains in stomach and chest", "Desire for warm drinks"]
        },
        "mind": {
            "de": "Apathisch, reizbar bei Störung, traurig ohne Grund.",
            "en": "Apathetic, irritable when disturbed, melancholic."
        },
        "better": {
            "de": ["Wärme", "Aufrechtes Sitzen"],
            "en": ["Warmth", "Sitting upright"]
        },
        "worse": {
            "de": ["Kälte", "Zugluft", "Nach Mitternacht"],
            "en": ["Cold", "Drafts", "After midnight"]
        },
        "dosage": {
            "de": "C6 bis C30. Einzeldosis.",
            "en": "6C to 30C. Single dose."
        },
        "sphere": ["Gefäße", "Haut & Bindegewebe", "Magen-Darm-Trakt"],
        "diffs": ["Arsenicum album", "Apis", "Kali carbonicum"],
        "keywords": ["lidschwellung", "ödeme", "schläfrigkeit", "magenbrennen", "brennen"]
    },
    {
        "id": "arsenicum-sulfuratum-flavum",
        "latin": "Arsenicum sulfuratum flavum",
        "cat": "mineral",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 3,
        "names": {
            "de": "Auripigment / Operment", "en": "Yellow Sulfide of Arsenic / Orpiment", "es": "Oropimente",
            "fr": "Orpiment", "it": "Orpimento", "el": "Αρσενοπυρίτης κίτρινος", "ru": "Аурипигмент"
        },
        "origin": {
            "de": "Natürliches Arsentrisulfid (As2S3).",
            "en": "Natural arsenic trisulfide (As2S3)."
        },
        "essence": {
            "de": "Hartnäckige feuchte Ekzeme, Aphthen und brennende Hautausschläge mit gelblicher Schorfbildung.",
            "en": "Obstinate moist eczema, aphthae, and burning skin eruptions with yellow crusting."
        },
        "indications": {
            "de": ["Leukodermie & Vitiligo", "Chronische Psoriasis", "Aphthen im Mund & Stomatitis", "Feuchtes Krustenekzem"],
            "en": ["Leukoderma & vitiligo", "Chronic psoriasis", "Aphthous stomatitis", "Moist crusty eczema"]
        },
        "keynotes": {
            "de": ["Intensives Brennen und Jucken der Haut, schlimmer nachts", "Gelbe, feuchte Krusten mit scharfem Sekret", "Mundschleimhaut voller schmerzhafter weiß-gelblicher Aphthen", "Unverträglichkeit von Berührung und Wasser"],
            "en": ["Intense burning and itching of skin, worse at night", "Yellow moist crusts with irritating discharge", "Oral mucosa studded with painful aphthous ulcers", "Intolerance of washing and touch"]
        },
        "mind": {
            "de": "Ängstlich, argwöhnisch, reizbar, unruhig.",
            "en": "Anxious, suspicious, fretful, physically restless."
        },
        "better": {
            "de": ["Trockene Wärme", "Einhüllen"],
            "en": ["Dry warmth", "Wrapping up"]
        },
        "worse": {
            "de": ["Kaltes Waschen", "Kratzen", "Nacht"],
            "en": ["Cold washing", "Scratching", "Night"]
        },
        "dosage": {
            "de": "D6 bis C30. 2x täglich 1 Tablette.",
            "en": "6X to 30C. 1 tablet twice daily."
        },
        "sphere": ["Haut & Nägel", "Mundschleimhaut", "Darm"],
        "diffs": ["Sulphur", "Arsenicum album", "Mezereum", "Graphites"],
        "keywords": ["aphthen", "vitiligo", "ekzem", "gelbe krusten", "hautbrennen"]
    },
    {
        "id": "asterias-rubens",
        "latin": "Asterias rubens",
        "cat": "animal",
        "authors": ["kent", "hering"],
        "poly": False,
        "tier": 2,
        "names": {
            "de": "Roter Seestern", "en": "Red Starfish", "es": "Estrella de mar roja",
            "fr": "Étoile de mer rouge", "it": "Stella marina rossa", "el": "Ερυθρός αστερίας", "ru": "Красная морская звезда"
        },
        "origin": {
            "de": "Der ganze lebende rote Seestern (Asteriidae).",
            "en": "Whole living red starfish (Asteriidae)."
        },
        "essence": {
            "de": "Brustdrüsenerkrankungen mit stechenden Schmerzen und Kongestionen zu Kopf und Brust.",
            "en": "Mammary gland affections with lancinating pains and severe vascular congestions."
        },
        "indications": {
            "de": ["Mamma-Induration & Mastitis", "Knoten in der Brustdrüse", "Zerebrale Kongestionen", "Akne vulgaris"],
            "en": ["Mammary induration & mastitis", "Breast nodules", "Cerebral congestion", "Acne vulgaris"]
        },
        "keynotes": {
            "de": ["Stechende, ziehende Schmerzen in den Brüsten, die bis in die linke Schulter und den Arm ausstrahlen", "Brustdrüsen hart und knotig verbacken", "Gefühl, als würde das Gehirn durch Hitze explodieren", "Neigung zu hartnäckigen roten Pusteln im Gesicht"],
            "en": ["Lancinating drawing pains in breasts extending to left scapula and down arm", "Mammary glands indurated, swollen, and knotty", "Sensation as if brain would explode from surging heat", "Obstinate red acne and pustules on face"]
        },
        "mind": {
            "de": "Reizbar, weinerlich, Angst vor bevorstehendem Unglück oder Schlaganfall.",
            "en": "Irritable, weeping, fear of impending disaster or apoplexy."
        },
        "better": {
            "de": ["Frische Luft", "Aufrechtes Gehen"],
            "en": ["Fresh open air", "Walking erect"]
        },
        "worse": {
            "de": ["Kälte & feuchtes Wetter", "Nachts", "Widerspruch"],
            "en": ["Cold and damp weather", "Night", "Contradiction"]
        },
        "dosage": {
            "de": "D6 bis C30. 2x täglich 5 Tropfen.",
            "en": "6X to 30C. 5 drops twice daily."
        },
        "sphere": ["Brustdrüsen", "Kopfgefäße", "Haut (Talgdrüsen)"],
        "diffs": ["Conium", "Phytolacca", "Silicea", "Belladonna"],
        "keywords": ["brustdrüse", "mastitis", "knoten in der brust", "seestern", "akne"]
    }
]
