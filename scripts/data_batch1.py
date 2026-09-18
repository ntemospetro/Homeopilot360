# scripts/data_batch1.py
# Batch 1: Classical remedies A - B (55 remedies)

BATCH_1 = [
    {
        "id": "abrotanum", "latin": "Abrotanum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Eberraute", "en": "Southernwood", "es": "Abrótano macho", "fr": "Aurone", "it": "Abrotano", "el": "Αβρότονον", "ru": "Полынь лечебная"},
        "origin": {"de": "Frische Blätter und Zweigspitzen von Artemisia abrotanum.", "en": "Fresh leaves and young twigs of Artemisia abrotanum."},
        "essence": {"de": "Progressive Abmagerung, besonders der Beine, trotz gutem Appetit; Metastasierung von Entzündungen.", "en": "Progressive emaciation, especially of lower limbs, despite good appetite; metastasis."},
        "indications": {"de": ["Marasmus bei Kindern", "Metastasierende Parotitis & Orchitis", "Rheumatismus nach unterdrücktem Durchfall", "Hydrozele"], "en": ["Marasmus in infants", "Metastatic mumps & orchitis", "Rheumatism following checked diarrhea", "Hydrocele"]},
        "keynotes": {
            "de": ["Abmagerung beginnt an den Beinen und steigt nach oben auf", "Großer Appetit, das Kind isst gierig, magert aber dennoch ab", "Haut hängt schlaff in Falten, Gesicht sieht greisenhaft aus", "Schmerzen wandern von einem Gelenk zum nächsten"],
            "en": ["Emaciation begins in lower extremities and ascends upward", "Ravenous appetite, eats heartily yet constantly loses weight", "Skin flabby and wrinkled, old-man look", "Pains metastasize from joint to heart or bowel"]
        },
        "mind": {"de": "Äußerst reizbar, boshaft gegen Tiere und Kinder, niedergeschlagen.", "en": "Extremely irritable, cruel, despondent."},
        "better": {"de": ["Lockerung der Kleidung", "Freier Stuhlgang"], "en": ["Loosening clothing", "Free bowel motion"]},
        "worse": {"de": ["Kälte & feuchte Luft", "Nebel", "Unterdrückung von Absonderungen"], "en": ["Cold damp air", "Fog", "Suppressed discharges"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Stoffwechsel & Ernährung", "Mesenteriallymphknoten", "Gelenke & Sehnen"], "diffs": ["Iodium", "Sanicula", "Natrum mur", "Calcarea phos"], "keywords": ["abmagerung beine", "marasmus", "kindesabmagerung", "hunger", "metastasierung"]
    },
    {
        "id": "aceticum-acidum", "latin": "Aceticum acidum", "cat": "acid", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Essigsäure", "en": "Acetic Acid", "es": "Ácido acético", "fr": "Acide acétique", "it": "Acido acetico", "el": "Οξικό οξύ", "ru": "Уксусная кислота"},
        "origin": {"de": "Verdünnte reine Eisessigsäure.", "en": "Diluted pure glacial acetic acid."},
        "essence": {"de": "Extremes, unstillbares Durstgefühl mit Wassersucht, Anämie und Schwäche; durstlos bei Fieber.", "en": "Extreme unquenchable thirst with dropsy and severe anemia; thirstless during fever."},
        "indications": {"de": ["Generalisierte Ödeme & Aszites", "Chronische Kachexie", "Gastralgie mit brennendem Sodbrennen", "Narkoseübelkeit"], "en": ["Generalized edema & ascites", "Chronic cachexia", "Gastralgia with violent pyrosis", "Post-anesthetic nausea"]},
        "keynotes": {
            "de": ["Großer Durst bei Wassersucht, aber durstlos bei Fieber", "Schläft am besten in Bauchlage", "Reichlicher, schwächender Nachtschweiß", "Wächserne Blässe und Kachexie"],
            "en": ["Violent thirst in dropsical states, but absence of thirst during fever", "Sleeps best lying flat on stomach", "Copious drenching night sweats", "Waxy pale countenance"]
        },
        "mind": {"de": "Ängstlich über die Gesundheit, vergisst kürzliche Ereignisse.", "en": "Anxious about sickness, forgetful."},
        "better": {"de": ["Bauchlage", "Aufstoßen"], "en": ["Lying on abdomen", "Eructations"]},
        "worse": {"de": ["Rückenlage", "Kälte", "Gemüseverzehr"], "en": ["Lying on back", "Cold", "Vegetable diet"]},
        "dosage": {"de": "D3 bis D6. 2x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops twice daily."},
        "sphere": ["Magen-Darm-Kanal", "Seröse Höhlen & Ödeme", "Blut"], "diffs": ["Apocynum", "Arsenicum album", "China"], "keywords": ["durst", "wassersucht", "essigsäure", "bauchlage", "anämie"]
    },
    {
        "id": "aesculus-hippocastanum", "latin": "Aesculus hippocastanum", "cat": "plant", "authors": ["kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Rosskastanie", "en": "Horse Chestnut", "es": "Castaño de Indias", "fr": "Marronnier d'Inde", "it": "Ippocastano", "el": "Αγριοκαστανιά", "ru": "Конский каштан"},
        "origin": {"de": "Frische reife Samen von Aesculus hippocastanum.", "en": "Fresh ripe seeds of Aesculus hippocastanum."},
        "essence": {"de": "Venöse Stauung im Pfortadersystem mit Hämorrhoiden wie Holzsplitter und Kreuzschmerzen.", "en": "Venous engorgement with purple hemorrhoids like wooden splinters and severe backache."},
        "indications": {"de": ["Blutende & blinde Hämorrhoiden", "Lumbosakraler Kreuzschmerz", "Chronische Proktitis & Fissuren", "Venöse Beckenstauung"], "en": ["Blind and bleeding hemorrhoids", "Lumbosacral backache", "Chronic proctitis & fissures", "Pelvic venous stasis"]},
        "keynotes": {
            "de": ["Gefühl, als sei das Rektum voller kleiner Holzsplitter", "Dunkelviolette, schmerzhafte Hämorrhoidalknoten", "Schwerer Kreuzschmerz im Iliosakralgelenk, Gehen erschwert", "Völlegefühl in Rektum und Leber"],
            "en": ["Sensation as if rectum were full of small wooden splinters", "Purple, painful, swollen piles", "Severe dull aching in sacroiliac joint", "Fullness in rectum and portal system"]
        },
        "mind": {"de": "Depressiv, gereizt, morgens beim Erwachen missmutig.", "en": "Gloomy, irritable, wakes confused and sullen."},
        "better": {"de": ["Kühle Luft", "Mäßiges Gehen", "Kalte Waschungen"], "en": ["Cool air", "Moderate walking", "Cold applications"]},
        "worse": {"de": ["Stehen", "Bücken", "Aufstehen vom Sitzen", "Morgens"], "en": ["Standing", "Stooping", "Rising from a seat", "Morning"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Rektum & Analregion", "Pfortaderkreislauf", "Lumbosakralwirbelsäule"], "diffs": ["Collinsonia", "Hamamelis", "Nux vomica", "Aloe"], "keywords": ["hämorrhoiden", "holzsplitter", "kreuzschmerz", "rosskastanie", "pfortader"]
    },
    {
        "id": "aethusa-cynapium", "latin": "Aethusa cynapium", "cat": "plant", "authors": ["kent", "hering"], "poly": True, "tier": 2,
        "names": {"de": "Hundspetersilie", "en": "Fool's Parsley", "es": "Cicuta menor", "fr": "Petite ciguë", "it": "Cicuta minore", "el": "Αίθουσα", "ru": "Кокорыш (собачья петрушка)"},
        "origin": {"de": "Ganze frische blühende Pflanze von Aethusa cynapium.", "en": "Whole fresh flowering plant of Aethusa cynapium."},
        "essence": {"de": "Völlige Unverträglichkeit von Milch bei Säuglingen; plötzliches Erbrechen von Klumpen mit Schläfrigkeit.", "en": "Complete intolerance of milk in infants; violent sudden vomiting of curdled milk followed by sleep."},
        "indications": {"de": ["Säuglingsgastroenteritis", "Milchunverträglichkeit", "Prüfungsangst & geistige Blockade", "Zahnungsdiarrhö"], "en": ["Infantile gastroenteritis", "Milk intolerance in babies", "Examination funk & brain fag", "Dentition diarrhea"]},
        "keynotes": {
            "de": ["Erbricht Milch sofort nach dem Trinken in dicken Gerinnseln", "Völlige Erschöpfung und tiefe Schläfrigkeit nach dem Erbrechen", "Linie von den Nasenflügeln zu den Mundwinkeln (Linea nasalis)", "Unfähigkeit zu denken vor Prüfungen"],
            "en": ["Milk vomited in large curdled lumps as soon as taken", "Profound exhaustion and stuporous sleep immediately after vomiting", "Linea nasalis: distinct furrow from nostrils to mouth", "Brain fag, inability to concentrate"]
        },
        "mind": {"de": "Geistige Erschöpfung, unfähig zu lesen, Wahnvorstellungen.", "en": "Mental exhaustion, incapable of thinking."},
        "better": {"de": ["Frische Luft", "Nach tiefem Schlaf"], "en": ["Open air", "After sound sleep"]},
        "worse": {"de": ["Milch", "Nach dem Erbrechen", "Hitze im Sommer"], "en": ["Milk", "After vomiting", "Summer heat"]},
        "dosage": {"de": "D6 bis C30. Bei Säuglingen D6 nach jedem Erbrechen.", "en": "6X to 30C. In infants 6X after each vomiting episode."},
        "sphere": ["Magen-Darm-Trakt", "Gehirn & Gemüt", "ZNS"], "diffs": ["Antimonium crudum", "Calcarea carb", "Magnesia carb"], "keywords": ["milch", "erbrechen klumpen", "säuglinge", "hundspetersilie", "schläfrigkeit"]
    },
    {
        "id": "agnus-castus", "latin": "Agnus castus", "cat": "plant", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 2,
        "names": {"de": "Mönchspfeffer", "en": "Chaste Tree", "es": "Sauzgatillo", "fr": "Gattilier", "it": "Agnocasto", "el": "Άγνος", "ru": "Витекс священный"},
        "origin": {"de": "Frische reife Beeren von Vitex agnus-castus.", "en": "Fresh ripe berries of Vitex agnus-castus."},
        "essence": {"de": "Vollständige Impotenz mit kalten Genitalien; Vergesslichkeit und fixe Todesahnungen.", "en": "Complete sexual impotence with cold flaccid genitalia; premature senility and prediction of death."},
        "indications": {"de": ["Erektile Dysfunktion & Impotenz", "Agalaktie nach Entbindung", "Sekundäre Amenorrhö & PMS", "Nervöse Erschöpfung nach Exzessen"], "en": ["Erectile dysfunction & sexual debility", "Agalactia in nursing mothers", "Secondary amenorrhea & PMS", "Nervous breakdown after excess"]},
        "keynotes": {
            "de": ["Genitalien kalt, schlaff und gefühllos; kein sexuelles Verlangen", "Chronischer, schmerzloser Tripper-Ausfluss", "Versiegen der Muttermilch bei Wöchnerinnen", "Prophezeit den genauen Tag seines Todes"],
            "en": ["Genitals cold, relaxed, flaccid; complete loss of sexual desire", "Chronic gleet with yellow discharge", "Deficient or suppressed breast milk with sadness", "Fixed idea of approaching death"]
        },
        "mind": {"de": "Tiefe Melancholie, zerstreut, kann sich an nichts erinnern.", "en": "Profound sadness, extreme absent-mindedness."},
        "better": {"de": ["Ruhe", "Warme Kleidung"], "en": ["Rest", "Warm clothing"]},
        "worse": {"de": ["Sexuelle Exzesse", "Kälte", "Berührung"], "en": ["Sexual indulgence", "Cold", "Touch"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Geschlechtsorgane", "Gemüt & Gedächtnis", "Mammae"], "diffs": ["Caladium", "Selenium", "Conium", "Lycopodium"], "keywords": ["impotenz", "mönchspfeffer", "milchmangel", "kalte genitalien", "gedächtnisschwäche"]
    },
    {
        "id": "ailanthus-glandulosa", "latin": "Ailanthus glandulosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Götterbaum", "en": "Tree of Heaven", "es": "Árbol del cielo", "fr": "Ailante glanduleux", "it": "Albero del paradiso", "el": "Αείλανθος", "ru": "Айлант высочайший"},
        "origin": {"de": "Frische Rinde und Blüten des Götterbaums.", "en": "Fresh bark and flowers of Ailanthus glandulosa."},
        "essence": {"de": "Schwere septische Zustände mit tiefem Stupor, dunkelrotem Ausschlag und zyanotischem Rachen.", "en": "Severe septic conditions with profound stupor, dark livid rash, and malignant sore throat."},
        "indications": {"de": ["Malignes Scharlach", "Septische Diphtherie", "Zyanotische Angina", "Stuporöse Infekte"], "en": ["Malignant scarlatina", "Septic diphtheria", "Cyanotic tonsillitis", "Stuporous fevers"]},
        "keynotes": {
            "de": ["Tiefe Benommenheit und Apathie mit halboffenem Mund", "Maligner, dunkelroter oder livider Ausschlag", "Übelriechender Speichel und geschwollene Zunge", "Extreme Erschöpfung bei Infektionskrankheiten"],
            "en": ["Profound stupor and apathy with half-open mouth", "Livid, dark rash that fails to come out properly", "Fetid saliva and swollen tongue", "Extreme prostration in infections"]
        },
        "mind": {"de": "Völlige Gleichgültigkeit, erkennt die Umgebung nicht, delirierend.", "en": "Complete indifference, semi-conscious stupor."},
        "better": {"de": ["Frische Luft", "Ruhelage"], "en": ["Fresh air", "Quiet rest"]},
        "worse": {"de": ["Aufrichten", "Schlucken", "Wärme"], "en": ["Sitting up", "Swallowing", "Warmth"]},
        "dosage": {"de": "D4 bis D12. Bei akuter Toxizität D6 alle 2 Stunden.", "en": "6X to 12X. In acute toxicity 6X every 2 hours."},
        "sphere": ["Hals & Rachen", "Blut & Sepsis", "ZNS", "Haut"], "diffs": ["Baptisia", "Belladonna", "Lachesis"], "keywords": ["scharlach", "angina", "stupor", "dunkler ausschlag", "sepsis"]
    },
    {
        "id": "aletris-farinosa", "latin": "Aletris farinosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Mehlige Sternwurzel", "en": "Star Grass", "es": "Hierba estrella", "fr": "Alétris farineux", "it": "Erba stella", "el": "Άλετρις", "ru": "Алетрис мучнистый"},
        "origin": {"de": "Getrockneter Wurzelstock von Aletris farinosa.", "en": "Dried rhizome of Aletris farinosa."},
        "essence": {"de": "Müdigkeit, Uterusschwäche und Anämie bei Frauen mit habitueller Abortneigung.", "en": "Exhaustion, uterine atony, and anemia in women prone to habitual miscarriage."},
        "indications": {"de": ["Uterussenkung", "Habitueller Abort", "Postpartale Erschöpfung", "Dyspepsie bei Anämie"], "en": ["Uterine prolapse", "Habitual abortion", "Postpartum exhaustion", "Dyspepsia in anemia"]},
        "keynotes": {
            "de": ["Ständiges Gefühl von Uterusschwäche und Schwere im Becken", "Müde, ausgezehrte Konstitution mit Verdauungsschwäche", "Erbrechen und Übelkeit während der Schwangerschaft", "Verstopfung durch Darmatonie"],
            "en": ["Constant feeling of uterine weakness and pelvic heaviness", "Tired, chlorotic constitution with poor digestion", "Obstinate vomiting in pregnancy", "Constipation from bowel atony"]
        },
        "mind": {"de": "Niedergeschlagen, müde des Lebens, nervöse Erschöpfung.", "en": "Depressed, tired of life, nervous fatigue."},
        "better": {"de": ["Ruhe", "Nach gutem Schlaf"], "en": ["Rest", "After sound sleep"]},
        "worse": {"de": ["Geringste Anstrengung", "Bücken", "Schwangerschaft"], "en": ["Least exertion", "Bending over", "Pregnancy"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Weibliche Geschlechtsorgane", "Verdauungstrakt", "Blutbildung"], "diffs": ["Helonias", "Sepia", "China"], "keywords": ["uterussenkung", "abortneigung", "schwäche", "anämie", "übelkeit"]
    },
    {
        "id": "allium-sativum", "latin": "Allium sativum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Knoblauch", "en": "Garlic", "es": "Ajo", "fr": "Ail cultivé", "it": "Aglio", "el": "Σκόρδο", "ru": "Чеснок посевной"},
        "origin": {"de": "Frische Zwiebelknolle von Allium sativum.", "en": "Fresh bulb of Allium sativum."},
        "essence": {"de": "Dyspepsie bei Fleischessern mit zähem Bronchialsekret und brennendem Magendruck.", "en": "Dyspepsia in meat-eaters with tenacious bronchial mucus and burning stomach pressure."},
        "indications": {"de": ["Chronische Bronchitis", "Dyspepsie nach Diätfehlern", "Bluthochdruck & Arteriosklerose", "Meteorismus"], "en": ["Chronic bronchitis", "Dyspepsia from dietary errors", "Hypertension & arteriosclerosis", "Flatulence"]},
        "keynotes": {
            "de": ["Reichlicher, zäher Schleim in den Atemwegen", "Magenbeschwerden durch Fleischkonsum", "Heißhunger, aber das Essen verursacht Unbehagen", "Besserung der Magenbeschwerden durch Bücken"],
            "en": ["Copious tenacious mucus in respiratory tract", "Stomach disturbances from meat eating", "Canine hunger, eating causes distress", "Relief of gastric pain by bending double"]
        },
        "mind": {"de": "Ungeduldig, ängstlich bezüglich Gesundheit.", "en": "Impatient, anxious about health."},
        "better": {"de": ["Bücken nach vorne", "Sitzen"], "en": ["Bending forward", "Sitting"]},
        "worse": {"de": ["Kälte & Feuchtigkeit", "Fleischgenuss", "Gehen"], "en": ["Cold and damp", "Eating meat", "Walking"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Magen-Darm-Trakt", "Bronchien", "Kreislauf"], "diffs": ["Nux vomica", "Antimonium crudum", "Bryonia"], "keywords": ["knoblauch", "dyspepsie", "fleisch", "bronchitis", "zäher schleim"]
    },
    {
        "id": "aloe-socotrina", "latin": "Aloe socotrina", "cat": "plant", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Echte Aloe", "en": "Socotrine Aloe", "es": "Áloe socotrino", "fr": "Aloès socotrin", "it": "Aloe socotrina", "el": "Αλόη", "ru": "Алоэ сокотринское"},
        "origin": {"de": "Eingedickter Blattsaft von Aloe perryi.", "en": "Inspissated juice from leaves of Aloe perryi."},
        "essence": {"de": "Plötzlicher Stuhldrang morgens um 5 Uhr mit Unsicherheit des Schließmuskels und traubenförmigen Hämorrhoiden.", "en": "Sudden morning stool driving from bed at 5 AM, sphincter insecurity, and purple hemorrhoids."},
        "indications": {"de": ["Morgendliche Diarrhö", "Hämorrhoiden wie Weintrauben", "Chronische Proktitis", "Portalstauung"], "en": ["Early morning diarrhea", "Hemorrhoids protruding like grapes", "Dysentery with mucus", "Portal congestion"]},
        "keynotes": {
            "de": ["Stuhldrang treibt morgens um 5 Uhr eilig aus dem Bett", "Unsicherheit des Sphincter ani: Traut sich nicht Winde abzulassen", "Hämorrhoidalknoten wie Weintrauben, besser durch kaltes Wasser", "Reichlicher Abgang von gallertartigem Schleim"],
            "en": ["Urgent stool drives patient out of bed at 5 AM", "Extreme weakness of sphincter ani: fears to pass flatus", "Hemorrhoids protrude like grapes, relieved by cold bathing", "Passage of abundant jelly-like mucus"]
        },
        "mind": {"de": "Unlustig zu jeder Arbeit, mürrisch bei bewölktem Wetter.", "en": "Disinclined to exertion, ill-humored in cloudy weather."},
        "better": {"de": ["Kaltes Wasser & kalte Waschungen", "Frische kühle Luft", "Windabgang"], "en": ["Cold water applications", "Cool fresh air", "Passing flatus"]},
        "worse": {"de": ["Frühmorgens im Bett", "Wärme", "Nach dem Essen", "Stehen"], "en": ["Early morning in bed", "Warmth", "After eating", "Standing"]},
        "dosage": {"de": "D4 bis C30. Im akuten Schub D6 alle 2 Stunden.", "en": "4X to 30C. In acute diarrhea 6X every 2 hours."},
        "sphere": ["Dickdarm & Rektum", "Sphincter ani", "Pfortadersystem"], "diffs": ["Sulphur", "Podophyllum", "Aesculus"], "keywords": ["aloe", "morgendurchfall", "schließmuskelschwäche", "hämorrhoiden", "gallerte"]
    },
    {
        "id": "alumina-phosphorica", "latin": "Alumina phosphorica", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumphosphat", "en": "Aluminium Phosphate", "es": "Fosfato de aluminio", "fr": "Phosphate d'aluminium", "it": "Fosfato di alluminio", "el": "Φωσφορικό αργίλιο", "ru": "Фосфат алюминия"},
        "origin": {"de": "Chemische Verbindung aus Tonerde und Phosphorsäure.", "en": "Chemical compound of alumina and phosphoric acid."},
        "essence": {"de": "Tiefe Nervenschwäche mit Gedächtnisverlust, chronischer Verstopfung und Kälteempfindlichkeit.", "en": "Profound nervous debility with loss of memory, chronic constipation, and chilliness."},
        "indications": {"de": ["Chronische Parästhesien", "Atonische Obstipation", "Geistige Erschöpfung", "Wirbelsäulenschwäche"], "en": ["Chronic paresthesia", "Atonic constipation", "Mental exhaustion", "Spinal weakness"]},
        "keynotes": {
            "de": ["Große Trägheit des Mastdarms, selbst weicher Stuhl erfordert starkes Pressen", "Extreme Kälteempfindlichkeit", "Zittern der Gliedmaßen und Schwäche der Beine", "Verwirrung über die Identität"],
            "en": ["Great inactivity of rectum, soft stool requires straining", "Extreme chilliness", "Trembling of limbs and leg weakness", "Confusion regarding identity"]
        },
        "mind": {"de": "Verwirrt, ängstlich am Morgen, Gedächtnisschwund.", "en": "Confused, anxious in morning, memory loss."},
        "better": {"de": ["Wärme", "Ruhe", "Warmes Einhüllen"], "en": ["Warmth", "Rest", "Warm wrapping"]},
        "worse": {"de": ["Kälte", "Geistige Anstrengung", "Morgens beim Erwachen"], "en": ["Cold", "Mental exertion", "Morning on waking"]},
        "dosage": {"de": "C30 oder C200. Einzeldosis.", "en": "30C or 200C. Single dose."},
        "sphere": ["Nervensystem & Rückenmark", "Mastdarm", "Gemüt"], "diffs": ["Alumina", "Phosphorus", "Plumbum"], "keywords": ["nervenschwäche", "obstipation", "gedächtnisverlust", "kälte", "wirbelsäule"]
    },
    {
        "id": "alumina-silicata", "latin": "Alumina silicata", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumsilikat", "en": "Aluminium Silicate", "es": "Silicato de aluminio", "fr": "Silicate d'aluminium", "it": "Silicato di alluminio", "el": "Πυριτικό αργίλιο", "ru": "Силикат алюминия"},
        "origin": {"de": "Natürliches Aluminiumsilikat (Kaolin).", "en": "Natural aluminium silicate (porcelain clay)."},
        "essence": {"de": "Chronische Schwächezustände mit Eiterungsneigung, trockenem Katarrh und Verstopfung.", "en": "Chronic debilitated states with tendency to suppuration, dry catarrh, and constipation."},
        "indications": {"de": ["Chronische Rhinitis mit Krusten", "Tiefe Abmagerung", "Obstipation mit Schleimhauttrockenheit", "Wirbelsäulenschmerzen"], "en": ["Chronic crusty rhinitis", "Deep emaciation", "Constipation with mucosal dryness", "Spinal pains"]},
        "keynotes": {
            "de": ["Ausgeprägte Trockenheit aller Schleimhäute", "Kältegefühl in Knochen und Wirbelsäule", "Atonie des Rektums wie Alumina", "Frostig, magert trotz gutem Appetit ab"],
            "en": ["Marked dryness of all mucous membranes", "Coldness in bones and spine", "Inactivity of rectum like Alumina", "Chilly, emaciates despite appetite"]
        },
        "mind": {"de": "Niedergeschlagen, reizbar, abgeneigt gegen Gesellschaft.", "en": "Despondent, irritable, averse to company."},
        "better": {"de": ["Wärme", "Trockenes Wetter"], "en": ["Warmth", "Dry weather"]},
        "worse": {"de": ["Kälte und Feuchtigkeit", "Geistige Arbeit", "Morgens"], "en": ["Cold and damp", "Mental labor", "Morning"]},
        "dosage": {"de": "C30 bis C200. Seltene Gabe.", "en": "30C to 200C. Infrequent dose."},
        "sphere": ["Schleimhäute", "Nervensystem", "Knochen"], "diffs": ["Alumina", "Silicea"], "keywords": ["krusten", "abmagerung", "schleimhauttrockenheit", "kaolin", "wirbelsäule"]
    },
    {
        "id": "ammonium-phosphoricum", "latin": "Ammonium phosphoricum", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Ammoniumphosphat", "en": "Ammonium Phosphate", "es": "Fosfato de amonio", "fr": "Phosphate d'ammonium", "it": "Fosfato di ammonio", "el": "Φωσφορικό αμμώνιο", "ru": "Фосфат аммония"},
        "origin": {"de": "Synthetisches Salz aus Ammoniak und Phosphorsäure.", "en": "Synthetic salt of ammonia and phosphoric acid."},
        "essence": {"de": "Gichtige Knötchen an Fingern und Gelenken mit Bronchitis und Harnsäureüberlastung.", "en": "Gouty nodosities in finger joints of patients subject to bronchitis and uric acid diathesis."},
        "indications": {"de": ["Arthritis urica", "Heberden-Knoten", "Chronische Bronchitis bei Gicht", "Gelenksteifigkeit"], "en": ["Gouty arthritis", "Heberden's nodes", "Chronic gouty bronchitis", "Joint stiffness"]},
        "keynotes": {
            "de": ["Gichtknoten an Fingern und Zehen", "Harnsäure-Urin mit stechendem Ammoniakgeruch", "Tiefer Husten mit zähem Schleim bei Gichtpatienten", "Verkrümmung der Gelenke"],
            "en": ["Gouty concretions in finger and toe joints", "Uric acid urine with pungent ammoniacal odor", "Deep cough with tenacious mucus in gout", "Distortion of small joints"]
        },
        "mind": {"de": "Reizbar bei Schmerzen, mürrisch.", "en": "Irritable during arthritic pains, morose."},
        "better": {"de": ["Wärme", "Ruhige Lage"], "en": ["Warmth", "Quiet rest"]},
        "worse": {"de": ["Kälte & Nässe", "Fleischkost"], "en": ["Cold and wet", "Rich meat diet"]},
        "dosage": {"de": "D3 bis D6. 2x täglich 1 Tablette.", "en": "3X to 6X. 1 tablet twice daily."},
        "sphere": ["Gelenke & Sehnen", "Stoffwechsel", "Atemwege"], "diffs": ["Benzoic acidum", "Ledum", "Colchicum"], "keywords": ["gicht", "gichtknoten", "harnsäure", "fingergelenke", "arthritis"]
    },
    {
        "id": "angustura-vera", "latin": "Angustura vera", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Echte Angusturarinde", "en": "Angostura Bark", "es": "Angostura verdadera", "fr": "Angusture vraie", "it": "Angostura vera", "el": "Ανγκωστούρα", "ru": "Ангустура настоящая"},
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
        "sphere": ["Knochen & Periost", "Muskulatur & Sehnen", "Nervensystem"], "diffs": ["Cicuta", "Nux vomica", "Ruta"], "keywords": ["krämpfe", "knochenkaries", "tetanus", "steifigkeit", "angustura"]
    },
    {
        "id": "anisum-stellatum", "latin": "Anisum stellatum", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Sternanis", "en": "Star Anise", "es": "Anís estrellado", "fr": "Anis étoilé", "it": "Anice stellato", "el": "Αστεροειδής γλυκάνισος", "ru": "Бадьян настоящий"},
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
        "sphere": ["Brustkorb & Rippen", "Darm & Blähungen", "Atemwege"], "diffs": ["Bryonia", "Colocynthis", "Ranunculus"], "keywords": ["sternanis", "rippenschmerz", "dritte rippe", "blähungskolik", "stechen"]
    },
    {
        "id": "anthracinum", "latin": "Anthracinum", "cat": "nosode", "authors": ["hering"], "poly": False, "tier": 2,
        "names": {"de": "Milzbrand-Nosode", "en": "Anthrax Nosode", "es": "Nosode del ántrax", "fr": "Nosode du charbon", "it": "Nosode dell'antrace", "el": "Νοσώδες άνθρακα", "ru": "Антрацинум (нозод язвы)"},
        "origin": {"de": "Nosode aus Milzbrandgift (Bacillus anthracis), potenziert über C30.", "en": "Nosode from anthrax poison (Bacillus anthracis), potentized above 30C."},
        "essence": {"de": "Maligne Eiterungen, Karbunkel mit unerträglich brennenden Schmerzen und septischem Verfall.", "en": "Malignant suppurations, carbuncles with unbearable burning pain and septic collapse."},
        "indications": {"de": ["Schwere Karbunkel & Furunkulose", "Gangrän & septische Phlegmone", "Insektenstiche mit septischem Verlauf", "Nekrotische Geschwüre"], "en": ["Severe carbuncles & furunculosis", "Gangrene & septic phlegmon", "Septic insect bites", "Necrotic ulcers"]},
        "keynotes": {
            "de": ["Unerträgliche, brennende Schmerzen wie von glühenden Kohlen", "Karbunkel mit schwärzlichem Kern", "Schneller Verfall der Kräfte bei septischen Infekten", "Wenn Arsenicum album nicht ausreicht"],
            "en": ["Unbearable burning pain as from glowing coals", "Carbuncles with blackish center and fetid discharge", "Rapid sinking of strength in sepsis", "When Arsenicum fails to relieve burning"]
        },
        "mind": {"de": "Todesangst, Delirium mit Hinfälligkeit, Apathie.", "en": "Fear of death, low delirium, apathy."},
        "better": {"de": ["Warme Anwendungen"], "en": ["Warm applications"]},
        "worse": {"de": ["Geringste Berührung", "Kälte", "Nachts"], "en": ["Slightest touch", "Cold", "Night"]},
        "dosage": {"de": "C30 bis C200. Einzeldosis unter ärztlicher Aufsicht.", "en": "30C to 200C. Single dose under medical supervision."},
        "sphere": ["Haut & Unterhautzellgewebe", "Blut & Lymphe", "Gefäße"], "diffs": ["Arsenicum album", "Tarentula cubensis", "Lachesis"], "keywords": ["karbunkel", "milzbrand", "brennen wie feuer", "sepsis", "gangrän"]
    },
    {
        "id": "antimonium-sulfuratum-aurantiacum", "latin": "Antimonium sulfuratum aurantiacum", "cat": "mineral", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Goldschwefel", "en": "Golden Sulfide of Antimony", "es": "Sulfuro dorado de antimonio", "fr": "Soufre doré d'antimoine", "it": "Zolfo dorato di antimonio", "el": "Χρυσός θειούχος αντιμονίτης", "ru": "Золотистый сульфид сурьмы"},
        "origin": {"de": "Amorphes Antimonpentasulfid (Sb2S5).", "en": "Amorphous antimony pentasulfide (Sb2S5)."},
        "essence": {"de": "Schwere Bronchialkatarrhe mit zähem gelbem Schleim, Lungenstauung und chronischer Emphysemneigung.", "en": "Severe bronchial catarrh with tough yellow mucus, pulmonary engorgement, and emphysema."},
        "indications": {"de": ["Chronische obstruktive Bronchitis", "Lungenemphysem mit Schleimrasseln", "Trockener Kitzelhusten", "Chronische Sinusitis"], "en": ["Chronic bronchitis", "Pulmonary emphysema with rattling", "Tickling cough", "Chronic sinusitis"]},
        "keynotes": {
            "de": ["Reichliches Schleimrasseln in den Bronchien mit schwerem Auswurf", "Zäher gelb-oranger Schleim", "Engegefühl im Brustkorb mit Erstickungsanfällen", "Chronischer Winterhusten bei Älteren"],
            "en": ["Profuse rattling of mucus with difficult expectoration", "Tough adherent yellow-orange mucus", "Tightness in thorax with dyspnea", "Winter coughs in aged patients"]
        },
        "mind": {"de": "Trübsinnig, ängstlich bei Atemnot, verdrießlich.", "en": "Morose, anxious during dyspnea."},
        "better": {"de": ["Warme Getränke", "Aufrechtes Sitzen"], "en": ["Warm drinks", "Sitting upright"]},
        "worse": {"de": ["Kaltes nasses Wetter", "Frühmorgens", "Flaches Liegen"], "en": ["Cold damp weather", "Early morning", "Lying flat"]},
        "dosage": {"de": "D4 bis D6. 3x täglich 1 Tablette.", "en": "4X to 6X. 1 tablet 3 times daily."},
        "sphere": ["Bronchialschleimhaut", "Lunge", "Kehlkopf"], "diffs": ["Antimonium tartaricum", "Kali bichromicum", "Senega"], "keywords": ["goldschwefel", "rasseln", "bronchitis", "emphysem", "zäher auswurf"]
    },
    {
        "id": "antimonium-tartaricum", "latin": "Antimonium tartaricum", "cat": "mineral", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Brechweinstein", "en": "Tartar Emetic", "es": "Tártaro emético", "fr": "Tartre émétique", "it": "Tartaro emetico", "el": "Εμετικός λίθος", "ru": "Рвотный камень"},
        "origin": {"de": "Kaliumantimonyltartrat-Kristalle.", "en": "Potassium antimony tartrate crystals."},
        "essence": {"de": "Lautes Schleimrasseln in den Bronchien bei extremer Schwäche; Sekret kann nicht abgehustet werden.", "en": "Loud rattling of mucus in bronchial tree, patient is too exhausted to expectorate; cyanosis and sweat."},
        "indications": {"de": ["Bronchiolitis bei Säuglingen", "Senile Pneumonie", "Lungenödem & Herzversagen", "Asthmaanfälle"], "en": ["Bronchiolitis in infants", "Hypostatic pneumonia in aged", "Pulmonary edema", "Asthmatic paroxysms"]},
        "keynotes": {
            "de": ["Brustkorb rasselt voller Schleim, doch fast nichts kommt herauf", "Patient muss sich aufsetzen um zu atmen", "Zyanose der Lippen und kalter Schweiß auf der Stirn", "Zunge dick weiß belegt mit roten Papillen"],
            "en": ["Chest rattling with mucus, little or none is raised", "Cannot lie down, must sit upright", "Cyanotic blue lips, cold sweat on forehead", "Thick white pasty coat on tongue"]
        },
        "mind": {"de": "Kind will nicht berührt oder angesehen werden, weint beim Wecken.", "en": "Child cannot bear to be touched or looked at, stuporous."},
        "better": {"de": ["Aufrechtes Sitzen", "Aufstoßen & Auswurf", "Kühle frische Luft"], "en": ["Sitting erect", "Eructation and expectoration", "Cool open air"]},
        "worse": {"de": ["Flaches Liegen", "Warme feuchte Zimmer", "Milch", "Morgens um 3-4 Uhr"], "en": ["Lying flat", "Warm damp room", "Milk", "Morning around 3-4 AM"]},
        "dosage": {"de": "D4 bis C30. Im akuten Zustand D6 alle 30 Minuten.", "en": "4X to 30C. In acute distress 6X every 30 minutes."},
        "sphere": ["Bronchien & Lunge", "Vagusnerv & Atemzentrum", "Magen"], "diffs": ["Ipecacuanha", "Carbo veg", "Ammonium carb"], "keywords": ["brechweinstein", "schleimrasseln", "atemnot", "bronchiolitis", "zyanose"]
    },
    {
        "id": "apium-graveolens", "latin": "Apium graveolens", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Echter Sellerie", "en": "Celery", "es": "Apio", "fr": "Céleri", "it": "Sedano", "el": "Σέλινο", "ru": "Сельдерей пахучий"},
        "origin": {"de": "Frische Samen und Kraut von Apium graveolens.", "en": "Fresh seeds and herb of Apium graveolens."},
        "essence": {"de": "Nervöse Ruhelosigkeit, Urtikaria mit Juckreiz und Harnsäurediathese.", "en": "Nervous restlessness, urticaria with itching, and uric acid retention."},
        "indications": {"de": ["Urtikaria & Nesselsucht", "Nervöse Schlaflosigkeit", "Dysurie & Harnsäurebeschwerden", "Kopfschmerz über den Augen"], "en": ["Urticaria & hives", "Nervous insomnia", "Dysuria & gravel", "Headache over eyes"]},
        "keynotes": {
            "de": ["Starke Urtikaria mit juckenden Quaddeln, schlimmer durch Kälte", "Große Ruhelosigkeit, kann nicht stillsitzen", "Kopfschmerz von der Schläfe zum Scheitel", "Reichlicher Urindrang mit Stechen"],
            "en": ["Profuse urticaria with itchy wheals, worse from cold", "Fidgety restlessness, cannot sit still", "Headache from temple to vertex", "Frequent desire to urinate with stinging"]
        },
        "mind": {"de": "Nervös, fahrig, denkt über viele Dinge gleichzeitig nach.", "en": "Nervous, fidgety, busy mind, insomnia."},
        "better": {"de": ["Wärme", "Gähnen", "Essen"], "en": ["Warmth", "Yawning", "Eating"]},
        "worse": {"de": ["Kälte", "Entblößen", "Nachts"], "en": ["Cold", "Uncovering", "Night"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Nervensystem", "Haut (Urtikaria)", "Harnwege"], "diffs": ["Apis", "Urtica urens", "Rhus tox"], "keywords": ["sellerie", "urtikaria", "nervosität", "schlaflosigkeit", "quaddeln"]
    },
    {
        "id": "apocynum-androsaemifolium", "latin": "Apocynum androsaemifolium", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Fliegenfängerkraut", "en": "Spreading Dogbane", "es": "Apocino amargo", "fr": "Apocyn à feuilles d'androsème", "it": "Apocino", "el": "Απόκυνον πικρό", "ru": "Кендырь ландышевый"},
        "origin": {"de": "Frische Wurzel von Apocynum androsaemifolium.", "en": "Fresh root of Apocynum androsaemifolium."},
        "essence": {"de": "Wandernde Gelenkschmerzen, Krämpfe in Zehen und Fersen mit Gallendyspepsie.", "en": "Wandering rheumatic pains, cramping in toes and heels, and bilious dyspepsia."},
        "indications": {"de": ["Rheumatische Gelenkentzündungen", "Krämpfe der Fußsohlen & Zehen", "Gallenstauung mit Kopfschmerz", "Fibromyalgie"], "en": ["Rheumatic polyarthritis", "Cramping in soles and toes", "Bilious hepatic congestion", "Fibromyalgia"]},
        "keynotes": {
            "de": ["Gelenkschmerzen springen rasch von einem Gelenk zum anderen", "Schmerzhaftes Krampfen in Zehen, Fersen und Fußsohlen", "Erbrechen von Galle ohne Linderung", "Zerschlagenheit in allen Gelenken"],
            "en": ["Rheumatic pains rapidly shifting from joint to joint", "Violent cramping in toes, heels, soles", "Bilious vomiting without relief", "Bruised aching in all articulations"]
        },
        "mind": {"de": "Niedergeschlagen, schläfrig am Tag, mürrisch.", "en": "Depressed, drowsy in daytime, sullen."},
        "better": {"de": ["Warme Einhüllung", "Ruhe"], "en": ["Warm wrapping", "Quiet rest"]},
        "worse": {"de": ["Kälte", "Bewegungsbeginn", "Nachts"], "en": ["Cold", "Beginning of motion", "Night"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Gelenke & Sehnen", "Fußmuskulatur", "Gallenwege"], "diffs": ["Pulsatilla", "Bryonia", "Colchicum"], "keywords": ["fliegenfänger", "wandernder rheumatismus", "zehenkrämpfe", "fersenschmerz"]
    },
    {
        "id": "apocynum-cannabinum", "latin": "Apocynum cannabinum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Indianischer Hanf", "en": "Indian Hemp", "es": "Cáñamo de Canadá", "fr": "Apocyn chanvrin", "it": "Canapa canadese", "el": "Απόκυνον", "ru": "Апоцинум конопляный"},
        "origin": {"de": "Frischer Wurzelstock von Apocynum cannabinum.", "en": "Fresh rhizome of Apocynum cannabinum."},
        "essence": {"de": "Wassersucht, Aszites und generalisierte Ödeme mit starkem Durst und Magenintoleranz für kaltes Wasser.", "en": "Dropsy, ascites, and edema with intense thirst but stomach intolerance of cold water."},
        "indications": {"de": ["Kardiale Ödeme", "Aszites & Leberzirrhose", "Hydrothorax & Lungenödem", "Urinverhaltung bei Ödemen"], "en": ["Cardiac edema", "Ascites & hepatic cirrhosis", "Hydrothorax", "Urinary suppression with dropsy"]},
        "keynotes": {
            "de": ["Starke Schwellung und Wassersucht aller Körperhöhlen", "Großer Durst, aber kaltes Wasser verursacht Magenweh und Erbrechen", "Spärlicher dunkler Urin", "Beklemmung und Erstickungsgefühl im Liegen"],
            "en": ["Severe dropsical swelling of cellular tissue and cavities", "Unquenchable thirst, cold water causes gastric distress", "Scanty dark urine", "Oppression and suffocation on lying down"]
        },
        "mind": {"de": "Ängstlich wegen Atemnot, benommen, depressiv.", "en": "Anxious due to dyspnea, drowsy, depressed."},
        "better": {"de": ["Aufrechtes Sitzen", "Warmes Trinken"], "en": ["Sitting upright", "Warm drinks"]},
        "worse": {"de": ["Kaltes Trinken", "Flaches Liegen", "Kälte"], "en": ["Cold drinks", "Lying flat", "Cold"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Herz-Kreislauf", "Nieren & Harnwege", "Seröse Häute"], "diffs": ["Arsenicum album", "Digitalis", "Apis"], "keywords": ["wassersucht", "ödeme", "durst", "aszites", "kardiale insuffizienz"]
    },
    {
        "id": "aranea-diadema", "latin": "Aranea diadema", "cat": "animal", "authors": ["hering"], "poly": False, "tier": 2,
        "names": {"de": "Kreuzspinne", "en": "Diadem Spider", "es": "Araña de la cruz", "fr": "Araignée porte-croix", "it": "Ragno crociato", "el": "Αράχνη του σταυρού", "ru": "Крестовик обыкновенный"},
        "origin": {"de": "Ganze lebende Kreuzspinne.", "en": "Whole living diadem spider."},
        "essence": {"de": "Extremes Knochenkältegefühl bei feuchtem Wetter mit streng periodischen Neuralgien.", "en": "Icy coldness penetrating to the bones from damp weather, with periodic neuralgias."},
        "indications": {"de": ["Periodische Intermittens-Fieber", "Knochenkälte & Knochenschmerzen", "Zahnschmerzen nachts", "Neuralgien bei Feuchtigkeit"], "en": ["Periodic fevers", "Bone chilliness & aching", "Nocturnal toothache", "Neuralgia from dampness"]},
        "keynotes": {
            "de": ["Patient friert bis ins Knochenmark, kann sich nicht erwärmen", "Verschlimmerung durch feuchtes Wetter und kalte Räume", "Präzise Periodizität der Symptome (zur selben Stunde)", "Hämorrhagische Diathese"],
            "en": ["Chilled to the very marrow of the bones, cannot get warm", "Aggravation from damp rainy weather", "Strict clock-like periodicity of complaints", "Hemorrhagic diathesis"]
        },
        "mind": {"de": "Furchtsam, ängstlich während des Frostes, niedergeschlagen.", "en": "Timid, anxious during chills, gloomy."},
        "better": {"de": ["Rauchen", "Druck", "Trockene Wärme"], "en": ["Smoking tobacco", "Hard pressure", "Dry warmth"]},
        "worse": {"de": ["Nasses, feuchtes Wetter", "Regen", "Baden in kaltem Wasser"], "en": ["Damp wet weather", "Rain", "Cold bathing"]},
        "dosage": {"de": "D6 bis C30. 2x täglich 5 Tropfen.", "en": "6X to 30C. 5 drops twice daily."},
        "sphere": ["Nervensystem & Periodizität", "Knochen & Periost", "Milz"], "diffs": ["China", "Arsenicum", "Cedron"], "keywords": ["kreuzspinne", "knochenkälte", "feuchtigkeit", "periodizität", "frost"]
    },
    {
        "id": "argentum-metallicum", "latin": "Argentum metallicum", "cat": "mineral", "authors": ["hahnemann", "kent", "hering"], "poly": True, "tier": 1,
        "names": {"de": "Silber", "en": "Silver", "es": "Plata metálica", "fr": "Argent métallique", "it": "Argento metallico", "el": "Μεταλλικός άργυρος", "ru": "Серебро металлическое"},
        "origin": {"de": "Reines gefälltes Silber (Ag).", "en": "Pure precipitated silver metal (Ag)."},
        "essence": {"de": "Heiserkeit bei Sängern und Rednern mit Kehlkopfkatarrh, Knorpelerkrankungen und Hodenaffektionen.", "en": "Chronic hoarseness in singers, laryngeal catarrh, and affections of cartilage and testes."},
        "indications": {"de": ["Sängerheiserkeit & Laryngitis", "Arthropathien der Knorpel", "Chronische Pharyngitis", "Orchitis & Hodenverhärtung"], "en": ["Vocalist hoarseness & laryngitis", "Cartilaginous arthropathy", "Chronic pharyngitis", "Orchitis & induration"]},
        "keynotes": {
            "de": ["Vollständiger Stimmverlust nach Singen oder Sprechen", "Zäher, geleeartiger Schleim im Kehlkopf, leicht abgehustet", "Wundheit und Schmerzen in Knorpelgeweben", "Krampfartige Schmerzen im linken Ovar oder Hoden"],
            "en": ["Complete loss of voice after professional singing or speaking", "Tenacious jelly-like mucus in larynx, easily hawked", "Soreness and pain in cartilages", "Crushing pain in left ovary or testicle"]
        },
        "mind": {"de": "Hastig, redselig, ängstlich bei Terminen.", "en": "Hurried, talkative, anxious over appointments."},
        "better": {"de": ["Frische Luft", "Aufstoßen", "Ruhiges Sitzen"], "en": ["Open air", "Belching", "Sitting quietly"]},
        "worse": {"de": ["Stimmgebrauch (Sprechen, Singen)", "Berührung", "Mittags"], "en": ["Voice use (speaking, singing)", "Touch", "Noon"]},
        "dosage": {"de": "D6 bis C30. Bei Heiserkeit D6 vor Auftritten.", "en": "6X to 30C. 6X prior to vocal strain."},
        "sphere": ["Kehlkopf & Stimmbänder", "Knorpelgewebe", "Hoden & Ovarien"], "diffs": ["Argentum nitricum", "Arum triphyllum", "Causticum"], "keywords": ["heiserkeit", "sänger", "kehlkopf", "knorpel", "stimme"]
    }
]

print(f"Batch 1 contains {len(BATCH_1)} remedies.")
