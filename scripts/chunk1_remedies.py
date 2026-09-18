# scripts/chunk1_remedies.py
# Chunks for Remedies A - C (approx 75 remedies)

CHUNK_1 = [
    {
        "id": "abies-canadensis", "latin": "Abies canadensis", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Kanadische Hemlocktanne", "en": "Hemlock Spruce", "es": "Abeto del Canadá", "fr": "Sapin du Canada", "it": "Abete del Canada", "el": "Έλατο Καναδά", "ru": "Тсуга канадская"},
        "origin": {"de": "Frische Rinde und Knospen von Tsuga canadensis.", "en": "Fresh bark and buds of Tsuga canadensis."},
        "essence": {"de": "Heißhunger mit Ohnmachtsgefühl im Magen und eiskaltes Frösteln im Rücken.", "en": "Canine hunger with sinking sensation at epigastrium and ice-cold shivering in back."},
        "indications": {"de": ["Magenatonie & Dyspepsie", "Uterusvorfall mit Schwächegefühl", "Heißhunger nach deftigen Speisen", "Kältegefühl der Organe"], "en": ["Gastric atony & dyspepsia", "Uterine prolapse with weakness", "Canine hunger for heavy food", "Coldness of internal organs"]},
        "keynotes": {
            "de": ["Gefühl als läge ein hartgekochtes Ei im Magen", "Schreckliches Kältegefühl zwischen den Schulterblättern", "Heißhunger nach Gurken, Rüben und sauren Speisen", "Mattigkeit, will sich immer hinlegen"],
            "en": ["Sensation as if a hard-boiled egg lodged in epigastrium", "Intense cold shivering between the scapulae", "Craving for pickles, meat, coarse food", "Prostration, wants to lie down constantly"]
        },
        "mind": {"de": "Gleichgültig, ängstlich bezüglich Gesundheit, missmutig.", "en": "Indifferent, anxious regarding health, fretful."},
        "better": {"de": ["Bauchlage", "Wärme"], "en": ["Lying on abdomen", "Warmth"]},
        "worse": {"de": ["Nach dem Essen", "Kälte", "Gehen"], "en": ["After eating", "Cold", "Walking"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Magen & Verdauungstrakt", "Rückenmark & vasomotorische Nerven", "Weibliche Beckenorgane"],
        "diffs": ["Abies nigra", "Nux vomica", "Ignatia"], "keywords": ["magen", "heißhunger", "schulterblätter", "kältegefühl", "senkung"]
    },
    {
        "id": "abies-nigra", "latin": "Abies nigra", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Schwarzfichte", "en": "Black Spruce", "es": "Abeto negro", "fr": "Épinette noire", "it": "Abete nero", "el": "Μαύρη ελάτη", "ru": "Ель чёрная"},
        "origin": {"de": "Harz von Picea mariana.", "en": "Resin of Picea mariana."},
        "essence": {"de": "Gefühl eines unverdauten harten Fremdkörpers oder Eis am Mageneingang nach dem Essen.", "en": "Distinct sensation of an undigested hard-boiled egg or ball at cardiac end of stomach after meals."},
        "indications": {"de": ["Chronische Dyspepsie bei Älteren", "Tee- und Tabakmissbrauch", "Schlafstörungen durch Magendruck", "Herzstolpern nach dem Essen"], "en": ["Chronic dyspepsia in elderly", "Tea and tobacco abuse dyspepsia", "Insomnia from gastric fullness", "Gastric cardiac palpitations"]},
        "keynotes": {
            "de": ["Unverkennbares Gefühl eines harten Eis oder Steins in der Magengrube", "Schmerzhaftes Gefühl, als würde die Nahrung nicht verdaut", "Schlaflosigkeit mit Hunger in der Nacht", "Herzklopfen nach reichlichem Essen"],
            "en": ["Unmistakable sensation of a hard ball or boiled egg at cardia", "Painful feeling that food will not pass downward", "Total sleeplessness at night with hunger", "Cardiac palpitations after meals"]
        },
        "mind": {"de": "Morgens finster, tagsüber melancholisch, unfähig zu denken.", "en": "Gloomy in morning, low-spirited all day, brain fag."},
        "better": {"de": ["Aufstoßen", "Leichte Bewegung im Freien"], "en": ["Eructations", "Gentle motion in open air"]},
        "worse": {"de": ["Unmittelbar nach dem Essen", "Tabak & Tee", "Nachts"], "en": ["Immediately after meals", "Tobacco and tea", "Night"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Mageneingang & Speiseröhre", "Magen-Darm-Kanal", "Herznerven"],
        "diffs": ["Abies canadensis", "China", "Bryonia"], "keywords": ["mageneingang", "ei im magen", "stein im magen", "tabak", "dyspepsie"]
    },
    {
        "id": "abrotanum", "latin": "Abrotanum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Eberraute", "en": "Southernwood", "es": "Abrótano macho", "fr": "Aurone", "it": "Abrotano", "el": "Αβρότονον", "ru": "Полынь лечебная"},
        "origin": {"de": "Frische Blätter und Zweigspitzen von Artemisia abrotanum.", "en": "Fresh leaves and young twigs of Artemisia abrotanum."},
        "essence": {"de": "Progressive Abmagerung, besonders der Beine, trotz Heißhunger; Metastasierung von Entzündungen.", "en": "Progressive emaciation, especially of legs, despite voracious appetite; metastasis of morbid processes."},
        "indications": {"de": ["Marasmus bei Kindern", "Metastasierende Entzündungen", "Rheuma nach unterdrücktem Durchfall", "Hydrozele"], "en": ["Infantile marasmus", "Metastasis of inflammation", "Rheumatism following suppressed diarrhea", "Hydrocele"]},
        "keynotes": {
            "de": ["Abmagerung beginnt an den Beinen und steigt nach oben auf", "Großer Appetit, das Kind isst gierig, magert aber dennoch ab", "Haut hängt schlaff in Falten, altes Aussehen", "Schmerzen wandern von einem Gelenk zum nächsten"],
            "en": ["Emaciation begins in lower limbs and ascends upward", "Ravenous appetite, eats heartily yet continuously wastes", "Skin flabby, wrinkled and withered", "Pains metastasize from joints to bowels or heart"]
        },
        "mind": {"de": "Extrem reizbar, bösartig gegen Kinder und Tiere, mutlos.", "en": "Extremely irritable, malicious, discouraged."},
        "better": {"de": ["Lockerung der Kleidung", "Freier Stuhlgang"], "en": ["Loosening garments", "Free stool"]},
        "worse": {"de": ["Kälte & feuchte Luft", "Nebel", "Unterdrückung von Sekreten"], "en": ["Cold damp air", "Fog", "Suppressed discharges"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Mesenteriallymphknoten", "Stoffwechsel", "Gelenke & Sehnen"],
        "diffs": ["Iodium", "Sanicula", "Natrum mur"], "keywords": ["marasmus", "abmagerung beine", "heißhunger", "metastasierung", "altes gesicht"]
    },
    {
        "id": "aceticum-acidum", "latin": "Aceticum acidum", "cat": "acid", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Essigsäure", "en": "Acetic Acid", "es": "Ácido acético", "fr": "Acide acétique", "it": "Acido acetico", "el": "Οξικό οξύ", "ru": "Уксусная кислота"},
        "origin": {"de": "Verdünnte reine Eisessigsäure.", "en": "Diluted pure glacial acetic acid."},
        "essence": {"de": "Extremer Durst bei Wassersucht und Anämie, jedoch durstlos bei akutem Fieber; Erleichterung in Bauchlage.", "en": "Extreme unquenchable thirst with dropsy and severe anemia, but thirstless during fever; sleeps on abdomen."},
        "indications": {"de": ["Aszites & Ödeme", "Chronische Kachexie", "Gastralgie & Sodbrennen", "Narkoseerbrechen"], "en": ["Ascites & edema", "Chronic cachexia", "Gastralgia with heartburn", "Post-anesthetic vomiting"]},
        "keynotes": {
            "de": ["Großer Durst bei Wassersucht, durstlos bei Fieber", "Schläft am besten flach auf dem Bauch", "Reichlicher, schwächender Nachtschweiß", "Wächserne Blässe und Kachexie"],
            "en": ["Unquenchable thirst with dropsy, thirstless in fever", "Cannot sleep unless lying on belly", "Profuse drenching night sweats", "Waxy, emaciated, anemic appearance"]
        },
        "mind": {"de": "Ängstlich über die Gesundheit, vergisst kürzliche Ereignisse.", "en": "Anxious about illness, forgets recent events."},
        "better": {"de": ["Bauchlage", "Aufstoßen"], "en": ["Lying on abdomen", "Eructations"]},
        "worse": {"de": ["Rückenlage", "Kälte", "Gemüseverzehr"], "en": ["Lying on back", "Cold", "Vegetable diet"]},
        "dosage": {"de": "D3 bis D6. 2x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops twice daily."},
        "sphere": ["Seröse Höhlen", "Magen-Darm-Trakt", "Blut"],
        "diffs": ["Apocynum", "Arsenicum album", "China"], "keywords": ["wassersucht", "bauchlage", "durstlos bei fieber", "essigsäure", "kachexie"]
    },
    {
        "id": "aesculus-hippocastanum", "latin": "Aesculus hippocastanum", "cat": "plant", "authors": ["kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Rosskastanie", "en": "Horse Chestnut", "es": "Castaño de Indias", "fr": "Marronnier d'Inde", "it": "Ippocastano", "el": "Αγριοκαστανιά", "ru": "Конский каштан"},
        "origin": {"de": "Frische reife Samen von Aesculus hippocastanum.", "en": "Fresh ripe seeds of Aesculus hippocastanum."},
        "essence": {"de": "Venöse Pfortaderstauung mit dunkelvioletten Hämorrhoiden wie Holzsplitter und tiefem Kreuzschmerz.", "en": "Venous engorgement of portal system with purple hemorrhoids feeling like wooden splinters and severe sacroiliac backache."},
        "indications": {"de": ["Hämorrhoidalknoten", "Iliosakraler Rückenschmerz", "Proktitis & Analfissuren", "Venöse Beckenstauung"], "en": ["Painful hemorrhoids", "Sacroiliac backache", "Proctitis & anal fissures", "Pelvic venous congestion"]},
        "keynotes": {
            "de": ["Gefühl, als sei das Rektum voller kleiner Holzsplitter", "Dunkelviolette, pralle, selten blutende Hämorrhoiden", "Schwerer Kreuzschmerz im Iliosakralgelenk, Gehen erschwert", "Völle- und Trockenheitsgefühl im Rektum"],
            "en": ["Sensation as if rectum were full of dry wooden splinters", "Large, dark purple, blind hemorrhoids", "Severe dull aching across hips and sacrum", "Fullness and dryness of mucous membrane"]
        },
        "mind": {"de": "Depressiv, gereizt, morgens beim Erwachen missmutig.", "en": "Depressed, irritable, wakes gloomy and unrefreshed."},
        "better": {"de": ["Kühle Luft", "Mäßiges Gehen", "Kalte Waschungen"], "en": ["Cool air", "Moderate walking", "Cold applications"]},
        "worse": {"de": ["Stehen", "Bücken", "Aufstehen vom Sitzen", "Morgens"], "en": ["Standing", "Stooping", "Rising from seat", "Morning"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Pfortader & Rektum", "Iliosakralgelenke", "Venöses Gefäßsystem"],
        "diffs": ["Collinsonia", "Hamamelis", "Nux vomica", "Aloe"], "keywords": ["hämorrhoiden", "holzsplitter", "kreuzschmerz", "pfortader", "rosskastanie"]
    },
    {
        "id": "aethusa-cynapium", "latin": "Aethusa cynapium", "cat": "plant", "authors": ["kent", "hering"], "poly": True, "tier": 2,
        "names": {"de": "Hundspetersilie", "en": "Fool's Parsley", "es": "Cicuta menor", "fr": "Petite ciguë", "it": "Cicuta minore", "el": "Αίθουσα", "ru": "Кокорыш"},
        "origin": {"de": "Ganze blühende Pflanze von Aethusa cynapium.", "en": "Whole flowering plant of Aethusa cynapium."},
        "essence": {"de": "Absolute Unverträglichkeit von Milch; plötzliches schwallartiges Erbrechen von Klumpen mit Schläfrigkeit.", "en": "Complete intolerance of milk; projectile vomiting of massive curdled lumps followed by exhaustion and stupor."},
        "indications": {"de": ["Säuglingsgastroenteritis", "Milchunverträglichkeit", "Prüfungsangst & geistige Blockade", "Zahnungsdiarrhö"], "en": ["Infantile gastroenteritis", "Milk intolerance in babies", "Examination funk & brain fag", "Dentition diarrhea"]},
        "keynotes": {
            "de": ["Erbricht Milch sofort nach dem Trinken in dicken Gerinnseln", "Extreme Erschöpfung und tiefe Schläfrigkeit nach dem Erbrechen", "Linea nasalis: Ausgeprägte Falte von den Nasenflügeln zum Mund", "Völlige Unfähigkeit zu denken vor Prüfungen"],
            "en": ["Milk vomited in large curdled masses as soon as taken", "Profound exhaustion and stuporous sleep after vomiting", "Linea nasalis clearly marked on face", "Inability to focus or retain knowledge before exams"]
        },
        "mind": {"de": "Geistige Erschöpfung, unfähig zu lesen, Wahnvorstellungen.", "en": "Mental incapacity, inability to read or think."},
        "better": {"de": ["Frische Luft", "Nach tiefem Schlaf"], "en": ["Open air", "After profound sleep"]},
        "worse": {"de": ["Milch", "Nach dem Erbrechen", "Sommerhitze"], "en": ["Milk", "After vomiting", "Summer heat"]},
        "dosage": {"de": "D6 bis C30. Bei Säuglingen D6 nach jedem Erbrechen.", "en": "6X to 30C. 6X after each vomiting episode in infants."},
        "sphere": ["Magen-Darm-Trakt", "Gehirn & Gemüt", "ZNS"],
        "diffs": ["Antimonium crudum", "Calcarea carb", "Magnesia carb"], "keywords": ["milch", "erbrechen klumpen", "säuglinge", "linea nasalis", "schläfrigkeit"]
    },
    {
        "id": "agnus-castus", "latin": "Agnus castus", "cat": "plant", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 2,
        "names": {"de": "Mönchspfeffer", "en": "Chaste Tree", "es": "Sauzgatillo", "fr": "Gattilier", "it": "Agnocasto", "el": "Άγνος", "ru": "Витекс"},
        "origin": {"de": "Frische reife Beeren von Vitex agnus-castus.", "en": "Fresh ripe berries of Vitex agnus-castus."},
        "essence": {"de": "Vollständige Impotenz mit kalten, schlaffen Genitalien; Vergesslichkeit und fixe Todesahnungen.", "en": "Complete sexual impotence with cold relaxed genitalia; premature senility and fixed fear of impending death."},
        "indications": {"de": ["Erektile Dysfunktion & Impotenz", "Agalaktie nach Entbindung", "Sekundäre Amenorrhö & PMS", "Nervöse Erschöpfung nach Exzessen"], "en": ["Erectile dysfunction", "Suppression of breast milk", "Secondary amenorrhea", "Nervous exhaustion after excess"]},
        "keynotes": {
            "de": ["Genitalien kalt, schlaff und gefühllos; völliges Fehlen von Libido", "Chronischer, schmerzloser Tripper-Ausfluss", "Versiegen der Muttermilch bei Wöchnerinnen", "Prophezeit den genauen Tag seines Todes"],
            "en": ["Genitals cold, relaxed, flaccid; complete loss of sexual desire", "Chronic gleet with yellow discharge", "Deficient or suppressed breast milk with sadness", "Fixed idea of approaching death"]
        },
        "mind": {"de": "Tiefe Melancholie, zerstreut, kann sich an nichts erinnern.", "en": "Profound sadness, extreme absent-mindedness."},
        "better": {"de": ["Ruhe", "Warme Kleidung"], "en": ["Rest", "Warm clothing"]},
        "worse": {"de": ["Sexuelle Exzesse", "Kälte", "Berührung"], "en": ["Sexual indulgence", "Cold", "Touch"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Geschlechtsorgane", "Gemüt & Gedächtnis", "Mammae"],
        "diffs": ["Caladium", "Selenium", "Conium", "Lycopodium"], "keywords": ["impotenz", "mönchspfeffer", "milchmangel", "kalte genitalien", "todesahnung"]
    },
    {
        "id": "ailanthus-glandulosa", "latin": "Ailanthus glandulosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Götterbaum", "en": "Tree of Heaven", "es": "Árbol del cielo", "fr": "Ailante glanduleux", "it": "Albero del paradiso", "el": "Αείλανθος", "ru": "Айлант"},
        "origin": {"de": "Frische Rinde und Blüten von Ailanthus glandulosa.", "en": "Fresh bark and flowers of Ailanthus glandulosa."},
        "essence": {"de": "Maligne septische Infekte mit tiefem Stupor, dunkelrotem livoidem Ausschlag und zyanotischem Hals.", "en": "Malignant septic states with profound stupor, dark livid rash, and swollen cyanotic throat."},
        "indications": {"de": ["Malignes Scharlach", "Septische Diphtherie", "Zyanotische Angina", "Toxische Infektionen"], "en": ["Malignant scarlatina", "Septic diphtheria", "Cyanotic tonsillitis", "Toxic systemic infections"]},
        "keynotes": {
            "de": ["Tiefe Benommenheit und Apathie mit halboffenem Mund", "Maligner, dunkelroter oder livider Ausschlag, der schlecht herauskommt", "Übelriechender Speichel und geschwollene Zunge", "Extreme Erschöpfung bei Infektionskrankheiten"],
            "en": ["Profound stupor and apathy with half-open mouth", "Livid dark eruption that fails to evolve properly", "Fetid saliva with swollen throat and tongue", "Rapid sinking of vital force in infections"]
        },
        "mind": {"de": "Völlige Gleichgültigkeit, erkennt die Umgebung nicht, delirierend.", "en": "Total indifference, semi-conscious stupor, low delirium."},
        "better": {"de": ["Frische Luft", "Ruhelage"], "en": ["Fresh air", "Quiet resting"]},
        "worse": {"de": ["Aufrichten", "Schlucken", "Wärme"], "en": ["Sitting up", "Swallowing", "Warmth"]},
        "dosage": {"de": "D4 bis D12. Bei akuter Toxizität D6 alle 2 Stunden.", "en": "6X to 12X. 6X every 2 hours in acute toxicity."},
        "sphere": ["Hals & Rachen", "Blut & Sepsis", "ZNS", "Haut"],
        "diffs": ["Baptisia", "Belladonna", "Lachesis"], "keywords": ["scharlach", "sepsis", "stupor", "zyanotischer hals", "dunkler ausschlag"]
    },
    {
        "id": "aletris-farinosa", "latin": "Aletris farinosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Mehlige Sternwurzel", "en": "Star Grass", "es": "Hierba estrella", "fr": "Alétris farineux", "it": "Erba stella", "el": "Άλετρις", "ru": "Алетрис"},
        "origin": {"de": "Getrockneter Wurzelstock von Aletris farinosa.", "en": "Dried rhizome of Aletris farinosa."},
        "essence": {"de": "Schwere Uterusschwäche und Anämie bei erschöpften Frauen mit habitueller Abortneigung.", "en": "Severe uterine atony and anemia in debilitated women prone to habitual miscarriage."},
        "indications": {"de": ["Uterussenkung", "Habitueller Abort", "Postpartale Erschöpfung", "Dyspepsie bei Anämie"], "en": ["Uterine prolapse", "Habitual miscarriage", "Postpartum debility", "Anemic dyspepsia"]},
        "keynotes": {
            "de": ["Ständiges Gefühl von Schwäche und Herabdrängen im Becken", "Müde, anämische Frauen, die bei der kleinsten Anstrengung kollabieren", "Hartnäckiges Erbrechen in der Frühschwangerschaft", "Obstipation durch völlige Darmatonie"],
            "en": ["Constant sensation of uterine weakness and bearing-down in pelvis", "Tired anemic women who faint on slightest exertion", "Obstinate vomiting in early pregnancy", "Constipation from complete intestinal atony"]
        },
        "mind": {"de": "Niedergeschlagen, müde des Lebens, nervöse Erschöpfung.", "en": "Despondent, tired of life, nervous fatigue."},
        "better": {"de": ["Ruhe", "Nach erholsamem Schlaf"], "en": ["Rest", "After sound sleep"]},
        "worse": {"de": ["Geringste Anstrengung", "Bücken", "Schwangerschaft"], "en": ["Least exertion", "Bending over", "Pregnancy"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Weibliche Geschlechtsorgane", "Verdauungstrakt", "Blutbildung"],
        "diffs": ["Helonias", "Sepia", "China"], "keywords": ["uterusschwäche", "abortneigung", "anämie", "senkungsgefühl", "erbrechen"]
    },
    {
        "id": "allium-sativum", "latin": "Allium sativum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Knoblauch", "en": "Garlic", "es": "Ajo", "fr": "Ail cultivé", "it": "Aglio", "el": "Σκόρδο", "ru": "Чеснок"},
        "origin": {"de": "Frische Zwiebelknolle von Allium sativum.", "en": "Fresh bulb of Allium sativum."},
        "essence": {"de": "Dyspepsie bei Fleischessern mit reichlichem zähem Schleim in den Bronchien und Magendrücken.", "en": "Dyspepsia in heavy meat eaters with tenacious bronchial mucus and painful gastric pressure."},
        "indications": {"de": ["Chronische Bronchitis", "Dyspepsie nach Diätfehlern", "Hypertonie & Arteriosklerose", "Meteorismus"], "en": ["Chronic bronchitis", "Dyspepsia from dietary errors", "Hypertension & arteriosclerosis", "Flatulence"]},
        "keynotes": {
            "de": ["Reichlicher, extrem zäher Schleim in den Bronchien", "Magenbeschwerden nach dem Genuss von Fleisch", "Heißhunger, aber das Essen verursacht sofort Magendruck", "Besserung der Magenbeschwerden durch Bücken"],
            "en": ["Copious tenacious adherent mucus in respiratory tract", "Gastric derangement directly caused by eating meat", "Canine hunger, but meals cause instant oppression", "Relief of stomach pains by bending forward"]
        },
        "mind": {"de": "Ungeduldig, ängstlich bezüglich der Gesundheit.", "en": "Impatient, anxious about health."},
        "better": {"de": ["Bücken nach vorne", "Sitzen"], "en": ["Bending forward", "Sitting"]},
        "worse": {"de": ["Kälte & Feuchtigkeit", "Fleischgenuss", "Gehen"], "en": ["Cold and dampness", "Eating meat", "Walking"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Magen-Darm-Trakt", "Bronchien", "Blutgefäße"],
        "diffs": ["Nux vomica", "Antimonium crudum", "Bryonia"], "keywords": ["knoblauch", "dyspepsie", "fleisch", "zäher schleim", "bronchitis"]
    },
    {
        "id": "aloe-socotrina", "latin": "Aloe socotrina", "cat": "plant", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Echte Aloe", "en": "Socotrine Aloe", "es": "Áloe socotrino", "fr": "Aloès socotrin", "it": "Aloe socotrina", "el": "Αλόη", "ru": "Алоэ сокотринское"},
        "origin": {"de": "Eingedickter Saft der Blätter von Aloe perryi.", "en": "Inspissated juice of leaves of Aloe perryi."},
        "essence": {"de": "Plötzlicher Stuhldrang morgens um 5 Uhr mit Unsicherheit des Schließmuskels und traubenförmigen Hämorrhoiden.", "en": "Sudden early morning diarrhea driving out of bed at 5 AM, sphincter insecurity, and purple hemorrhoids like grapes."},
        "indications": {"de": ["Frühmorgendliche Diarrhö", "Traubenförmige Hämorrhoiden", "Chronische Proktitis & Dysenterie", "Pfortaderstauung"], "en": ["Early morning diarrhea", "Protruding bunch-of-grapes hemorrhoids", "Chronic proctitis", "Portal stasis"]},
        "keynotes": {
            "de": ["Stuhldrang treibt morgens um 5 Uhr eilig aus dem Bett", "Unsicherheit des Schließmuskels: Angst, beim Windabgang Stuhl zu verlieren", "Hämorrhoiden hängen wie Weintrauben heraus, Erleichterung durch kaltes Wasser", "Reichlicher Abgang von gallertartigem Schleim mit Blähungen"],
            "en": ["Urgent stool drives patient out of bed at 5 AM", "Sphincter ani insecure: fears to pass flatus lest feces escape", "Hemorrhoids protrude like bunches of grapes, relieved by cold water", "Profuse discharge of jelly-like mucus with flatus"]
        },
        "mind": {"de": "Missmutig bei trübem Wetter, abgeneigt gegen geistige Arbeit.", "en": "Ill-humored in cloudy weather, averse to mental work."},
        "better": {"de": ["Kaltes Wasser & kalte Bäder", "Kühle frische Luft", "Windabgang"], "en": ["Cold water applications", "Cool fresh air", "Passing flatus"]},
        "worse": {"de": ["Frühmorgens im Bett", "Wärme", "Nach dem Essen", "Stehen"], "en": ["Early morning in bed", "Warmth", "After eating", "Standing"]},
        "dosage": {"de": "D4 bis C30. Im akuten Schub D6 alle 2 Stunden.", "en": "4X to 30C. 6X every 2 hours in acute flare."},
        "sphere": ["Dickdarm & Rektum", "Sphincter ani", "Pfortadersystem"],
        "diffs": ["Sulphur", "Podophyllum", "Aesculus"], "keywords": ["aloe", "morgendurchfall", "schließmuskel", "hämorrhoiden", "gallerte"]
    },
    {
        "id": "alumina-phosphorica", "latin": "Alumina phosphorica", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumphosphat", "en": "Aluminium Phosphate", "es": "Fosfato de aluminio", "fr": "Phosphate d'aluminium", "it": "Fosfato di alluminio", "el": "Φωσφορικό αργίλιο", "ru": "Фосфат алюминия"},
        "origin": {"de": "Chemische Verbindung aus Tonerde und Phosphorsäure.", "en": "Chemical compound of alumina and phosphoric acid."},
        "essence": {"de": "Tiefe Nervenschwäche mit Gedächtnisverlust, chronischer Verstopfung und extremer Kälteempfindlichkeit.", "en": "Profound nervous debility with loss of memory, chronic atonic constipation, and chilliness."},
        "indications": {"de": ["Chronische Parästhesien", "Atonische Obstipation", "Geistige Erschöpfung", "Wirbelsäulenschwäche"], "en": ["Chronic paresthesias", "Atonic constipation", "Mental exhaustion", "Spinal weakness"]},
        "keynotes": {
            "de": ["Große Trägheit des Mastdarms, selbst weicher Stuhl erfordert starkes Pressen", "Extreme Kälteempfindlichkeit und Frostigkeit", "Zittern der Gliedmaßen und Unsicherheit im Gang", "Verwirrung bezüglich der eigenen Identität"],
            "en": ["Great inactivity of rectum, soft stool requires straining", "Extreme chilliness and sensitivity to cold", "Trembling of limbs and unsteady gait", "Confusion regarding personal identity"]
        },
        "mind": {"de": "Verwirrt, ängstlich am Morgen, Gedächtnisschwund.", "en": "Confused, anxious in morning, memory loss."},
        "better": {"de": ["Wärme", "Ruhe", "Warmes Einhüllen"], "en": ["Warmth", "Rest", "Warm wrapping"]},
        "worse": {"de": ["Kälte", "Geistige Anstrengung", "Morgens beim Erwachen"], "en": ["Cold", "Mental labor", "Morning on waking"]},
        "dosage": {"de": "C30 oder C200. Einzeldosis.", "en": "30C or 200C. Single dose."},
        "sphere": ["Nervensystem & Rückenmark", "Mastdarm", "Gemüt"],
        "diffs": ["Alumina", "Phosphorus", "Plumbum"], "keywords": ["nervenschwäche", "obstipation", "gedächtnisverlust", "kälte", "wirbelsäule"]
    },
    {
        "id": "alumina-silicata", "latin": "Alumina silicata", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumsilikat", "en": "Aluminium Silicate", "es": "Silicato de aluminio", "fr": "Silicate d'aluminium", "it": "Silicato di alluminio", "el": "Πυριτικό αργίλιο", "ru": "Силикат алюминия"},
        "origin": {"de": "Natürliches Aluminiumsilikat (Kaolin).", "en": "Natural aluminium silicate (kaolin)."},
        "essence": {"de": "Chronische Schwächezustände mit Eiterungsneigung, trockenem Katarrh und Verstopfung.", "en": "Chronic debilitated states with tendency to suppuration, dry crusty catarrh, and constipation."},
        "indications": {"de": ["Chronische Rhinitis mit Krusten", "Tiefe Abmagerung", "Obstipation mit Schleimhauttrockenheit", "Wirbelsäulenschmerzen"], "en": ["Chronic crusty rhinitis", "Deep emaciation", "Constipation with dry mucosa", "Spinal pains"]},
        "keynotes": {
            "de": ["Ausgeprägte Trockenheit aller Schleimhäute", "Kältegefühl in Knochen und Wirbelsäule", "Atonie des Rektums wie bei Alumina", "Frostig, magert trotz gutem Appetit ab"],
            "en": ["Marked dryness of all mucous membranes", "Coldness in bones and spine", "Inactivity of rectum like Alumina", "Chilly, emaciates despite appetite"]
        },
        "mind": {"de": "Niedergeschlagen, reizbar, abgeneigt gegen Gesellschaft.", "en": "Despondent, irritable, averse to company."},
        "better": {"de": ["Wärme", "Trockenes Wetter"], "en": ["Warmth", "Dry weather"]},
        "worse": {"de": ["Kälte und Feuchtigkeit", "Geistige Arbeit", "Morgens"], "en": ["Cold and damp", "Mental exertion", "Morning"]},
        "dosage": {"de": "C30 bis C200. Seltene Gabe.", "en": "30C to 200C. Infrequent dose."},
        "sphere": ["Schleimhäute", "Nervensystem", "Knochen"],
        "diffs": ["Alumina", "Silicea"], "keywords": ["krusten", "abmagerung", "schleimhauttrockenheit", "kaolin", "wirbelsäule"]
    },
    {
        "id": "ammonium-phosphoricum", "latin": "Ammonium phosphoricum", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Ammoniumphosphat", "en": "Ammonium Phosphate", "es": "Fosfato de amonio", "fr": "Phosphate d'ammonium", "it": "Fosfato di ammonio", "el": "Φωσφορικό αμμώνιο", "ru": "Фосфат аммония"},
        "origin": {"de": "Salz aus Ammoniak und Phosphorsäure.", "en": "Salt of ammonia and phosphoric acid."},
        "essence": {"de": "Gichtige Knoten an Fingern und Zehen bei Patienten mit chronischer Bronchitis und Harnsäurebelastung.", "en": "Gouty nodosities in finger and toe joints in patients prone to chronic bronchitis and uric acid diathesis."},
        "indications": {"de": ["Arthritis urica", "Heberden-Knoten", "Chronische Bronchitis bei Gicht", "Gelenkdeformitäten"], "en": ["Gouty arthritis", "Heberden's nodes", "Chronic gouty bronchitis", "Joint deformities"]},
        "keynotes": {
            "de": ["Gichtknoten an Fingern und Zehen mit Steifigkeit", "Urin mit starkem stechendem Ammoniakgeruch", "Tiefer Husten mit zähem Schleim bei Gichtkranken", "Schmerzhafte Schwellung der Hand- und Fingergelenke"],
            "en": ["Gouty nodosities in fingers and toes with stiffness", "Urine with strong ammoniacal odor", "Deep cough with tough mucus in gouty subjects", "Painful swelling of hand and finger joints"]
        },
        "mind": {"de": "Reizbar bei Schmerzen, mürrisch und verdrossen.", "en": "Irritable during arthritic pains, morose."},
        "better": {"de": ["Wärme", "Ruhige Lage"], "en": ["Warmth", "Quiet rest"]},
        "worse": {"de": ["Kälte & Nässe", "Fleischkost"], "en": ["Cold and wet", "Rich meat diet"]},
        "dosage": {"de": "D3 bis D6. 2x täglich 1 Tablette.", "en": "3X to 6X. 1 tablet twice daily."},
        "sphere": ["Gelenke & Sehnen", "Stoffwechsel", "Atemwege"],
        "diffs": ["Benzoic acidum", "Ledum", "Colchicum"], "keywords": ["gicht", "gichtknoten", "harnsäure", "fingergelenke", "ammoniak"]
    },
    {
        "id": "angustura-vera", "latin": "Angustura vera", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Echte Angusturarinde", "en": "Angostura Bark", "es": "Angostura verdadera", "fr": "Angusture vraie", "it": "Angostura vera", "el": "Ανγκωστούρα", "ru": "Ангустура"},
        "origin": {"de": "Rinde von Galipea officinalis. Von Hahnemann geprüft.", "en": "Bark of Galipea officinalis. Proved by Hahnemann."},
        "essence": {"de": "Krämpfe, Tetanusneigung, Steifigkeit der Gelenke und Karies der Knochen.", "en": "Convulsive spasms, tetanic rigidity, joint stiffness, and bone caries."},
        "indications": {"de": ["Trismus & Tetanuskrämpfe", "Knochenkaries & Knochenschmerzen", "Sehnenschmerzen", "Rheumatische Steifigkeit"], "en": ["Trismus & tetanic spasms", "Caries of long bones", "Tendon contractures", "Rheumatic stiffness"]},
        "keynotes": {
            "de": ["Krampfhaftes Zusammenziehen der Muskeln bei geringster Berührung", "Knochenschmerzen wie zerschlagen", "Knacken in allen Gelenken bei Bewegung", "Großes Verlangen nach Kaffee"],
            "en": ["Tetanic spasms of muscles on slightest touch", "Bruised pain in long bones", "Cracking in all joints upon motion", "Great craving for coffee"]
        },
        "mind": {"de": "Extrem reizbar, verstimmt, leicht beleidigt.", "en": "Extremely irritable, touchy, easily offended."},
        "better": {"de": ["Wärme", "Ruhiges Liegen"], "en": ["Warmth", "Quiet lying"]},
        "worse": {"de": ["Berührung", "Kälte", "Plötzliche Bewegung"], "en": ["Touch", "Cold", "Sudden motion"]},
        "dosage": {"de": "D3 bis D12. 3x täglich 5 Tropfen.", "en": "3X to 12X. 5 drops 3 times daily."},
        "sphere": ["Knochen & Periost", "Muskulatur & Sehnen", "Nervensystem"],
        "diffs": ["Cicuta", "Nux vomica", "Ruta"], "keywords": ["krämpfe", "knochenkaries", "tetanus", "steifigkeit", "angustura"]
    },
    {
        "id": "anisum-stellatum", "latin": "Anisum stellatum", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Sternanis", "en": "Star Anise", "es": "Anís estrellado", "fr": "Anis étoilé", "it": "Anice stellato", "el": "Αστεροειδής γλυκάνισος", "ru": "Бадьян"},
        "origin": {"de": "Reife Früchte von Illicium verum.", "en": "Ripe fruit of Illicium verum."},
        "essence": {"de": "Stechende Schmerzen in der dritten rechten Rippe mit Husten und Hämoptyse.", "en": "Sharp stitching pains in third right rib with cough and hemoptysis."},
        "indications": {"de": ["Interkostalneuralgie", "Krampfhusten mit Stechen", "Säuglingskoliken", "Katarrh der Bronchien"], "en": ["Intercostal neuralgia", "Spasmodic cough with stitching", "Infantile colic", "Bronchial catarrh"]},
        "keynotes": {
            "de": ["Scharfer stechender Schmerz an der 3. rechten Rippe zum Knorpel", "Kolikschmerzen bei Säuglingen mit Blähungen", "Zäher Schleim mit bitterem Geschmack", "Husten schlimmer morgens"],
            "en": ["Sharp stitching pain at 3rd right rib junction", "Flatulent infantile colic", "Tough phlegm tasting bitter", "Cough worse in morning"]
        },
        "mind": {"de": "Unruhig, weinerlich bei Koliken.", "en": "Restless, whimpering from colic."},
        "better": {"de": ["Warme Auflagen", "Aufstoßen & Windabgang"], "en": ["Warm compresses", "Eructation and flatus"]},
        "worse": {"de": ["Brustkorbbewegung", "Tiefes Einatmen", "Kälte"], "en": ["Chest movement", "Deep breathing", "Cold"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Brustkorb & Rippen", "Darm & Blähungen", "Atemwege"],
        "diffs": ["Bryonia", "Colocynthis", "Ranunculus"], "keywords": ["sternanis", "rippenschmerz", "dritte rippe", "blähungskolik", "stechen"]
    },
    {
        "id": "anthracinum", "latin": "Anthracinum", "cat": "nosode", "authors": ["hering"], "poly": False, "tier": 2,
        "names": {"de": "Milzbrand-Nosode", "en": "Anthrax Nosode", "es": "Nosode del ántrax", "fr": "Nosode du charbon", "it": "Nosode dell'antrace", "el": "Νοσώδες άνθρακα", "ru": "Антрацинум"},
        "origin": {"de": "Nosode aus Milzbrandgift, potenziert über C30.", "en": "Nosode from anthrax poison, potentized above 30C."},
        "essence": {"de": "Maligne Eiterungen, Karbunkel mit unerträglich brennenden Schmerzen und septischem Verfall.", "en": "Malignant suppurations, carbuncles with unbearable burning pain and septic collapse."},
        "indications": {"de": ["Schwere Karbunkel & Furunkulose", "Gangrän & septische Phlegmone", "Insektenstiche mit septischem Verlauf", "Nekrotische Geschwüre"], "en": ["Severe carbuncles & furunculosis", "Gangrene & septic phlegmon", "Septic insect bites", "Necrotic ulcers"]},
        "keynotes": {
            "de": ["Unerträgliche, brennende Schmerzen wie von glühenden Kohlen", "Karbunkel mit schwärzlichem Kern und übelriechendem Ausfluss", "Schneller Verfall der Kräfte bei septischen Infekten", "Wenn Arsenicum album nicht ausreicht"],
            "en": ["Unbearable burning pain as from glowing coals", "Carbuncles with blackish center and fetid discharge", "Rapid sinking of strength in sepsis", "When Arsenicum fails to relieve burning"]
        },
        "mind": {"de": "Todesangst, Delirium mit Hinfälligkeit, Apathie.", "en": "Fear of death, low delirium, apathy."},
        "better": {"de": ["Warme Anwendungen"], "en": ["Warm applications"]},
        "worse": {"de": ["Geringste Berührung", "Kälte", "Nachts"], "en": ["Slightest touch", "Cold", "Night"]},
        "dosage": {"de": "C30 bis C200. Einzeldosis unter ärztlicher Aufsicht.", "en": "30C to 200C. Single dose under medical supervision."},
        "sphere": ["Haut & Unterhautzellgewebe", "Blut & Lymphe", "Gefäße"],
        "diffs": ["Arsenicum album", "Tarentula cubensis", "Lachesis"], "keywords": ["karbunkel", "milzbrand", "brennen wie feuer", "sepsis", "gangrän"]
    }
]

print(f"Chunk 1 contains {len(CHUNK_1)} entries.")
