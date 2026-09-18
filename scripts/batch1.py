# scripts/batch1.py
# Classical remedies A through C (~80 remedies)

BATCH1 = [
    {
        "id": "ailanthus-glandulosa", "latin": "Ailanthus glandulosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Götterbaum", "en": "Tree of Heaven", "es": "Árbol del cielo", "fr": "Ailante glanduleux", "it": "Albero del paradiso", "el": "Αείλανθος", "ru": "Айлант высочайший"},
        "origin": {"de": "Frische Rinde und Blüten des Götterbaums (Simaroubaceae).", "en": "Fresh bark and flowers of Ailanthus glandulosa (Simaroubaceae)."},
        "essence": {"de": "Schwere septische Zustände mit tiefem Stupor, dunkelrotem Ausschlag und zyanotischem Rachen.", "en": "Severe septic conditions with profound stupor, dark livid rash, and malignant sore throat."},
        "indications": {"de": ["Malignes Scharlach", "Septische Diphtherie", "Zyanotische Angina", "Stuporöse Infekte"], "en": ["Malignant scarlatina", "Septic diphtheria", "Cyanotic tonsillitis", "Stuporous fevers"]},
        "keynotes": {
            "de": ["Tiefe Benommenheit und Apathie mit halboffenem Mund", "Maligner, dunkelroter oder livider Ausschlag", "Übelriechender Speichel und geschwollene Zunge", "Extreme Erschöpfung bei Infektionskrankheiten"],
            "en": ["Profound stupor and apathy with half-open mouth", "Livid, dark rash that fails to come out properly", "Fetid saliva and swollen tongue", "Extreme prostration in infectious diseases"]
        },
        "mind": {"de": "Völlige Gleichgültigkeit, erkennt die Umgebung nicht, delirierend.", "en": "Complete indifference, semi-conscious stupor, muttering delirium."},
        "better": {"de": ["Frische Luft", "Ruhelage"], "en": ["Fresh air", "Quiet rest"]},
        "worse": {"de": ["Aufrichten", "Schlucken", "Wärme"], "en": ["Sitting up", "Swallowing", "Warmth"]},
        "dosage": {"de": "D4 bis D12. Bei akuter Toxizität D6 alle 2 Stunden.", "en": "6X to 12X. In acute toxicity 6X every 2 hours."},
        "sphere": ["Hals & Rachen", "Blut & Sepsis", "ZNS", "Haut"], "diffs": ["Baptisia", "Belladonna", "Lachesis", "Rhus tox"], "keywords": ["scharlach", "angina", "stupor", "dunkler ausschlag", "sepsis"]
    },
    {
        "id": "aletris-farinosa", "latin": "Aletris farinosa", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Mehlige Sternwurzel", "en": "Star Grass / Colic Root", "es": "Hierba estrella", "fr": "Alétris farineux", "it": "Erba stella", "el": "Άλετρις", "ru": "Алетрис мучнистый"},
        "origin": {"de": "Getrockneter Wurzelstock von Aletris farinosa (Liliaceae).", "en": "Dried rhizome of Aletris farinosa (Liliaceae)."},
        "essence": {"de": "Müdigkeit, Uterusschwäche und Anämie bei erschöpften Frauen mit habitueller Abortneigung.", "en": "Exhaustion, uterine atony, and anemia in worn-out women prone to habitual miscarriage."},
        "indications": {"de": ["Uterussenkung", "Habitueller Abort", "Postpartale Erschöpfung", "Dyspepsie bei Anämie"], "en": ["Uterine prolapse", "Habitual abortion", "Postpartum exhaustion", "Dyspepsia in anemia"]},
        "keynotes": {
            "de": ["Ständiges Gefühl von Uterusschwäche und Schwere im Becken", "Müde, ausgezehrte Konstitution mit Verdauungsschwäche", "Erbrechen und Übelkeit während der Schwangerschaft", "Verstopfung mit hartem Stuhl durch Darmatonie"],
            "en": ["Constant feeling of uterine weakness and pelvic heaviness", "Tired, chlorotic constitution with poor digestion", "Obstinate vomiting and morning sickness in pregnancy", "Constipation from rectal and bowel atony"]
        },
        "mind": {"de": "Niedergeschlagen, müde des Lebens, nervöse Erschöpfung.", "en": "Depressed, tired of life, nervous fatigue."},
        "better": {"de": ["Ruhe", "Nach gutem Schlaf"], "en": ["Rest", "After restorative sleep"]},
        "worse": {"de": ["Geringste Anstrengung", "Bücken", "Schwangerschaft"], "en": ["Least exertion", "Bending over", "Pregnancy"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Weibliche Geschlechtsorgane", "Verdauungstrakt", "Blutbildung"], "diffs": ["Helonias", "Sepia", "Fraxinus", "China"], "keywords": ["uterussenkung", "abortneigung", "schwäche", "anämie", "übelkeit"]
    },
    {
        "id": "allium-sativum", "latin": "Allium sativum", "cat": "plant", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Knoblauch", "en": "Garlic", "es": "Ajo", "fr": "Ail cultivé", "it": "Aglio", "el": "Σκόρδο", "ru": "Чеснок посевной"},
        "origin": {"de": "Frische Zwiebelknolle von Allium sativum (Amaryllidaceae).", "en": "Fresh bulb of Allium sativum (Amaryllidaceae)."},
        "essence": {"de": "Dyspepsie bei Fleischessern mit zähem Bronchialsekret und brennendem Magendruck.", "en": "Dyspepsia in excessive meat-eaters with tenacious bronchial mucus and burning stomach pressure."},
        "indications": {"de": ["Chronische Bronchitis", "Dyspepsie nach Diätfehlern", "Bluthochdruck & Arteriosklerose", "Meteorismus"], "en": ["Chronic bronchitis", "Dyspepsia from dietary errors", "Hypertension & arteriosclerosis", "Flatulence"]},
        "keynotes": {
            "de": ["Reichlicher, zäher, klebriger Schleim in den Atemwegen", "Magenbeschwerden durch Fleischkonsum und Überernährung", "Heißhunger, aber das Essen verursacht Unbehagen", "Besserung der Magenbeschwerden durch Bücken"],
            "en": ["Copious, tenacious, sticky mucus in respiratory tract", "Stomach disturbances from meat eating and overeating", "Canine hunger, but eating causes distress", "Relief of gastric pain by bending double"]
        },
        "mind": {"de": "Ungeduldig, ängstlich bezüglich Gesundheit, empfindlich gegen Gerüche.", "en": "Impatient, anxious about health, sensitive to odors."},
        "better": {"de": ["Bücken nach vorne", "Sitzen"], "en": ["Bending forward", "Sitting"]},
        "worse": {"de": ["Kälte & Feuchtigkeit", "Fleischgenuss", "Gehen"], "en": ["Cold and damp", "Eating meat", "Walking"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Magen-Darm-Trakt", "Bronchien", "Kreislauf"], "diffs": ["Nux vomica", "Antimonium crudum", "Bryonia", "Pulsatilla"], "keywords": ["knoblauch", "dyspepsie", "fleisch", "bronchitis", "zäher schleim"]
    },
    {
        "id": "alumina-phosphorica", "latin": "Alumina phosphorica", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumphosphat", "en": "Aluminium Phosphate", "es": "Fosfato de aluminio", "fr": "Phosphate d'aluminium", "it": "Fosfato di alluminio", "el": "Φωσφορικό αργίλιο", "ru": "Фосфат алюминия"},
        "origin": {"de": "Chemische Verbindung aus Tonerde und Phosphorsäure.", "en": "Chemical compound of alumina and phosphoric acid."},
        "essence": {"de": "Tiefe Nervenschwäche mit Gedächtnisverlust, chronischer Verstopfung und Kälteempfindlichkeit.", "en": "Profound nervous debility with loss of memory, chronic constipation, and extreme chilliness."},
        "indications": {"de": ["Chronische Parästhesien", "Atonische Obstipation", "Geistige Erschöpfung & Demenzneigung", "Wirbelsäulenschwäche"], "en": ["Chronic paresthesia", "Atonic constipation", "Mental exhaustion & cognitive decline", "Spinal weakness"]},
        "keynotes": {
            "de": ["Große Trägheit des Mastdarms, selbst weicher Stuhl erfordert starkes Pressen", "Extreme Kälteempfindlichkeit und Frösteln", "Zittern der Gliedmaßen und Schwäche der Beine", "Verwirrung über die eigene Identität"],
            "en": ["Great inactivity of rectum, even soft stool requires heavy straining", "Extreme lack of vital heat and chilliness", "Trembling of limbs and weakness of legs", "Confusion regarding personal identity"]
        },
        "mind": {"de": "Verwirrt, ängstlich am Morgen, Gedächtnisschwund, Hastigkeit mit innerer Langsamkeit.", "en": "Confused, anxious in the morning, memory loss, hurried yet slow in action."},
        "better": {"de": ["Wärme", "Ruhe", "Warmes Einhüllen"], "en": ["Warmth", "Rest", "Warm wrapping"]},
        "worse": {"de": ["Kälte", "Geistige Anstrengung", "Morgens beim Erwachen"], "en": ["Cold", "Mental exertion", "Morning on waking"]},
        "dosage": {"de": "C30 oder C200. Einzeldosis.", "en": "30C or 200C. Single dose."},
        "sphere": ["Nervensystem & Rückenmark", "Mastdarm", "Gemüt"], "diffs": ["Alumina", "Phosphorus", "Plumbum", "Silicea"], "keywords": ["nervenschwäche", "obstipation", "gedächtnisverlust", "kälte", "wirbelsäule"]
    },
    {
        "id": "alumina-silicata", "latin": "Alumina silicata", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Aluminiumsilikat / Kaolin", "en": "Aluminium Silicate", "es": "Silicato de aluminio", "fr": "Silicate d'aluminium", "it": "Silicato di alluminio", "el": "Πυριτικό αργίλιο", "ru": "Силикат алюминия"},
        "origin": {"de": "Natürliches Aluminiumsilikat (Tonerdesilikat).", "en": "Natural aluminium silicate (porcelain clay)."},
        "essence": {"de": "Chronische Schwächezustände mit Eiterungsneigung, trockenem Katarrh und Verstopfung.", "en": "Chronic debilitated states with tendency to suppuration, dry catarrh, and constipation."},
        "indications": {"de": ["Chronische Rhinitis mit Krusten", "Tiefe Abmagerung", "Obstipation mit Schleimhauttrockenheit", "Wirbelsäulenschmerzen"], "en": ["Chronic crusty rhinitis", "Deep emaciation", "Constipation with mucosal dryness", "Spinal pains"]},
        "keynotes": {
            "de": ["Ausgeprägte Trockenheit aller Schleimhäute", "Kältegefühl in Knochen und Wirbelsäule", "Atonie des Rektums wie Alumina", "Frostig, magert trotz normalen Appetits ab"],
            "en": ["Marked dryness of all mucous membranes", "Coldness in bones and spine", "Inactivity of rectum like Alumina", "Chilly, emaciates despite normal appetite"]
        },
        "mind": {"de": "Niedergeschlagen, reizbar, abgeneigt gegen Gesellschaft, geistige Trägheit.", "en": "Despondent, irritable, averse to company, mental sluggishness."},
        "better": {"de": ["Wärme", "Trockenes Wetter", "Gemäßigte Bewegung"], "en": ["Warmth", "Dry weather", "Moderate motion"]},
        "worse": {"de": ["Kälte und Feuchtigkeit", "Geistige Arbeit", "Morgens"], "en": ["Cold and damp", "Mental labor", "Morning"]},
        "dosage": {"de": "C30 bis C200. Seltene Gabe.", "en": "30C to 200C. Infrequent dose."},
        "sphere": ["Schleimhäute", "Nervensystem", "Knochen & Gelenke"], "diffs": ["Alumina", "Silicea", "Calcarea silicata"], "keywords": ["krusten", "abmagerung", "schleimhauttrockenheit", "kaolin", "wirbelsäule"]
    },
    {
        "id": "ammonium-phosphoricum", "latin": "Ammonium phosphoricum", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Ammoniumphosphat", "en": "Ammonium Phosphate", "es": "Fosfato de amonio", "fr": "Phosphate d'ammonium", "it": "Fosfato di ammonio", "el": "Φωσφορικό αμμώνιο", "ru": "Фосфат аммония"},
        "origin": {"de": "Synthetisches Salz aus Ammoniak und Phosphorsäure.", "en": "Synthetic salt of ammonia and phosphoric acid."},
        "essence": {"de": "Gichtige Knötchen an Fingern und Gelenken bei Patienten mit Neigung zu Bronchitis und Harnsäureüberlastung.", "en": "Gouty nodosities in finger joints of patients subject to bronchitis and uric acid diathesis."},
        "indications": {"de": ["Arthritis urica (Gichtknoten)", "Heberden-Knoten", "Chronische Bronchitis bei Gicht", "Gelenksteifigkeit"], "en": ["Gouty arthritis (tophi)", "Heberden's nodes", "Chronic gouty bronchitis", "Joint stiffness"]},
        "keynotes": {
            "de": ["Gichtknoten an den Fingern und Fußgelenken", "Harnsäure-Urin mit stechendem Ammoniakgeruch", "Tiefer Husten mit zähem Schleim bei gichtigen Patienten", "Verdrehung und Verformung der Gelenke"],
            "en": ["Gouty concretions in finger and toe joints", "Uric acid urine with pungent ammoniacal odor", "Deep cough with tenacious mucus in gouty subjects", "Distortion and deformity of small joints"]
        },
        "mind": {"de": "Reizbar bei Schmerzen, unruhig, mürrisch.", "en": "Irritable during arthritic pains, restless, morose."},
        "better": {"de": ["Wärme", "Ruhige Lage"], "en": ["Warmth", "Quiet rest"]},
        "worse": {"de": ["Kälte & Nässe", "Wetterwechsel", "Fleischreiche Kost"], "en": ["Cold and wet", "Weather change", "Rich meat diet"]},
        "dosage": {"de": "D3 bis D6. 2x täglich 1 Tablette.", "en": "3X to 6X. 1 tablet twice daily."},
        "sphere": ["Gelenke & Sehnen", "Stoffwechsel (Harnsäure)", "Atemwege"], "diffs": ["Benzoic acidum", "Ledum", "Colchicum", "Ammonium carb"], "keywords": ["gicht", "gichtknoten", "harnsäure", "fingergelenke", "arthritis"]
    },
    {
        "id": "angustura-vera", "latin": "Angustura vera", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Echte Angusturarinde", "en": "Angostura Bark", "es": "Angostura verdadera", "fr": "Angusture vraie", "it": "Angostura vera", "el": "Ανγκωστούρα", "ru": "Ангустура настоящая"},
        "origin": {"de": "Rinde von Galipea officinalis (Rutaceae). Von Hahnemann geprüft.", "en": "Bark of Galipea officinalis (Rutaceae). Proved by Hahnemann."},
        "essence": {"de": "Krämpfe, Tetanusneigung, Steifigkeit der Gelenke und Karies der Knochen.", "en": "Convulsive spasms, tetanic rigidity, joint stiffness, and bone caries."},
        "indications": {"de": ["Trismus & Tetanuskrämpfe", "Knochenkaries & Knochenschmerzen", "Sehnenschmerzen", "Rheumatische Steifigkeit"], "en": ["Trismus & tetanic spasms", "Caries of long bones", "Tendon contractures", "Rheumatic stiffness"]},
        "keynotes": {
            "de": ["Krampfhaftes Zusammenziehen der Muskeln bei der geringsten Berührung", "Knochenschmerzen wie zerschlagen, besonders in den langen Röhrenknochen", "Knacken in allen Gelenken bei Bewegung", "Großes Verlangen nach Kaffee"],
            "en": ["Tetanic spasms of muscles on slightest touch", "Bruised pain in long bones, particularly tibia and femur", "Cracking in all joints upon motion", "Great craving for coffee"]
        },
        "mind": { "de": "Extrem reizbar, verstimmt, leicht beleidigt, jede Kleinigkeit kränkt.", "en": "Extremely irritable, touchy, offended by the slightest trifle." },
        "better": {"de": ["Wärme", "Ruhiges Liegen im Dunkeln"], "en": ["Warmth", "Quiet lying in dark"]},
        "worse": {"de": ["Berührung", "Kälte", "Plötzliche Bewegung"], "en": ["Touch", "Cold", "Sudden motion"]},
        "dosage": {"de": "D3 bis D12. 3x täglich 5 Tropfen.", "en": "3X to 12X. 5 drops 3 times daily."},
        "sphere": ["Knochen & Knochenhaut", "Muskulatur & Sehnen", "Nervensystem"], "diffs": ["Cicuta", "Nux vomica", "Ruta", "Hypericum"], "keywords": ["krämpfe", "knochenkaries", "tetanus", "steifigkeit", "angustura"]
    },
    {
        "id": "anisum-stellatum", "latin": "Anisum stellatum", "cat": "plant", "authors": ["hahnemann", "hering"], "poly": False, "tier": 3,
        "names": {"de": "Sternanis", "en": "Star Anise", "es": "Anís estrellado", "fr": "Anis étoilé", "it": "Anice stellato", "el": "Αστεροειδής γλυκάνισος", "ru": "Бадьян настоящий"},
        "origin": {"de": "Reife Früchte von Illicium verum (Schisandraceae).", "en": "Ripe fruit of Illicium verum (Schisandraceae)."},
        "essence": {"de": "Stechende Schmerzen in der dritten rechten Rippe mit Husten und Hämoptyse.", "en": "Sharp stitching pains in third right rib with cough and hemoptysis."},
        "indications": {"de": ["Interkostalneuralgie", "Krampfhusten mit Stechen", "Säuglingskoliken mit Blähungen", "Katarrh der Bronchien"], "en": ["Intercostal neuralgia", "Spasmodic cough with stitching", "Infantile flatulent colic", "Bronchial catarrh"]},
        "keynotes": {
            "de": ["Scharfer, stechender Schmerz an der Verbindungsstelle der 3. rechten Rippe zum Knorpel", "Kolikschmerzen bei Säuglingen mit starker Gasansammlung", "Zäher Schleim mit bitterem Geschmack", "Husten schlimmer morgens"],
            "en": ["Sharp stitching pain at junction of 3rd right rib and cartilage", "Flatulent infantile colic with painful rumbling", "Tough phlegm tasting bitter", "Cough worse in morning"]
        },
        "mind": {"de": "Unruhig, weinerlich bei Koliken, schreckhaft.", "en": "Restless, whimpering from colic, easily startled."},
        "better": {"de": ["Warme Auflagen", "Aufstoßen & Windabgang"], "en": ["Warm compresses", "Eructation and passing flatus"]},
        "worse": {"de": ["Bewegung des Brustkorbs", "Tiefes Einatmen", "Kälte"], "en": ["Chest movement", "Deep breathing", "Cold"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Brustkorb & Rippen", "Darm & Blähungen", "Atemwege"], "diffs": ["Bryonia", "Colocynthis", "Chamomilla", "Ranunculus"], "keywords": ["sternanis", "rippenschmerz", "dritte rippe", "blähungskolik", "stechen"]
    },
    {
        "id": "anthracinum", "latin": "Anthracinum", "cat": "nosode", "authors": ["hering"], "poly": False, "tier": 2,
        "names": {"de": "Milzbrand-Nosode", "en": "Anthrax Nosode", "es": "Nosode del ántrax", "fr": "Nosode du charbon", "it": "Nosode dell'antrace", "el": "Νοσώδες άνθρακα", "ru": "Антрацинум (нозод сибирской язвы)"},
        "origin": {"de": "Nosode aus Milzbrandgift (Bacillus anthracis), potenziert über C30.", "en": "Nosode prepared from anthrax poison (Bacillus anthracis), potentized above 30C."},
        "essence": {"de": "Maligne Eiterungen, Karbunkel mit unerträglichen brennenden Schmerzen und septischem Verfall.", "en": "Malignant suppurations, severe carbuncles with unbearable burning pain and septic collapse."},
        "indications": {"de": ["Schwere Karbunkel & Furunkulose", "Gangrän & septische Phlegmone", "Insektenstiche mit septischem Verlauf", "Nekrotische Geschwüre"], "en": ["Severe carbuncles & furunculosis", "Gangrene & septic phlegmon", "Septic insect bites", "Necrotic ulcers"]},
        "keynotes": {
            "de": ["Unerträgliche, brennende Schmerzen wie von glühenden Kohlen", "Karbunkel mit schwärzlichem Kern und übelriechender Absonderung", "Schneller Verfall der Lebenskräfte bei septischen Infekten", "Wenn Arsenicum das Brennen nicht lindert"],
            "en": ["Unbearable burning pain as from glowing coals", "Carbuncles with blackish center and fetid ichorous discharge", "Rapid sinking of strength in septic infections", "When Arsenicum fails to relieve burning"]
        },
        "mind": {"de": "Todesangst, Delirium mit großer Hinfälligkeit, Apathie.", "en": "Fear of death, low muttering delirium, apathy."},
        "better": {"de": ["Warme Anwendungen"], "en": ["Warm applications"]},
        "worse": {"de": ["Geringste Berührung", "Kälte", "Nachts"], "en": ["Slightest touch", "Cold", "Night"]},
        "dosage": {"de": "C30 bis C200. Einzeldosis unter ärztlicher Aufsicht.", "en": "30C to 200C. Single dose under medical guidance."},
        "sphere": ["Haut & Unterhautzellgewebe", "Blut & Lymphe", "Gefäße"], "diffs": ["Arsenicum album", "Tarentula cubensis", "Lachesis", "Echinacea"], "keywords": ["karbunkel", "milzbrand", "brennen wie feuer", "sepsis", "gangrän"]
    },
    {
        "id": "apium-graveolens", "latin": "Apium graveolens", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Echter Sellerie", "en": "Celery", "es": "Apio", "fr": "Céleri", "it": "Sedano", "el": "Σέλινο", "ru": "Сельдерей пахучий"},
        "origin": {"de": "Frische Samen und Kraut von Apium graveolens (Apiaceae).", "en": "Fresh seeds and herb of Apium graveolens (Apiaceae)."},
        "essence": {"de": "Nervöse Ruhelosigkeit, Urtikaria mit Juckreiz und Harnsäurediathese.", "en": "Nervous restlessness, urticaria with itching, and uric acid retention."},
        "indications": {"de": ["Urtikaria & Nesselsucht", "Nervöse Schlaflosigkeit", "Dysurie & Harnsäurebeschwerden", "Kopfschmerz über den Augen"], "en": ["Urticaria & hives", "Nervous insomnia", "Dysuria & uric acid gravel", "Headache over eyes"]},
        "keynotes": {
            "de": ["Starke Urtikaria mit juckenden Quaddeln, schlimmer durch Kälte", "Große Ruhelosigkeit, kann nicht stillsitzen", "Kopfschmerz von der Schläfe zum Scheitel", "Reichlicher Urindrang mit Stechen"],
            "en": ["Profuse urticaria with itchy wheals, worse from cold", "Fidgety restlessness, cannot sit still", "Headache from temple to vertex", "Frequent desire to urinate with stinging"]
        },
        "mind": {"de": "Nervös, fahrig, denkt über viele Dinge gleichzeitig nach, schlaflos.", "en": "Nervous, fidgety, busy mind, insomnia."},
        "better": {"de": ["Wärme", "Gähnen", "Essen"], "en": ["Warmth", "Yawning", "Eating"]},
        "worse": {"de": ["Kälte", "Entblößen", "Nachts"], "en": ["Cold", "Uncovering", "Night"]},
        "dosage": {"de": "D2 bis D6. 3x täglich 5 Tropfen.", "en": "2X to 6X. 5 drops 3 times daily."},
        "sphere": ["Nervensystem", "Haut (Urtikaria)", "Harnwege"], "diffs": ["Apis", "Urtica urens", "Rhus tox", "Zincum"], "keywords": ["sellerie", "urtikaria", "nervosität", "schlaflosigkeit", "quaddeln"]
    },
    {
        "id": "aranea-diadema", "latin": "Aranea diadema", "cat": "animal", "authors": ["hering"], "poly": False, "tier": 2,
        "names": {"de": "Kreuzspinne", "en": "Diadem Spider / Papal Cross Spider", "es": "Araña de la cruz", "fr": "Araignée porte-croix", "it": "Ragno crociato", "el": "Αράχνη του σταυρού", "ru": "Крестовик обыкновенный"},
        "origin": {"de": "Ganze lebende Kreuzspinne (Araneidae).", "en": "Whole living diadem spider (Araneidae)."},
        "essence": {"de": "Extremes, bis in die Knochen dringendes Kältegefühl bei feuchtem Wetter mit streng periodischen Neuralgien.", "en": "Icy coldness penetrating to the bones from damp weather, with strictly periodic neuralgias."},
        "indications": {"de": ["Periodische Intermittens-Fieber", "Knochenkälte & Knochenschmerzen", "Zahnschmerzen nachts", "Neuralgien bei Feuchtigkeit"], "en": ["Periodic intermittent fevers", "Bone chilliness & aching", "Nocturnal toothache", "Neuralgia from dampness"]},
        "keynotes": {
            "de": ["Patient friert bis ins Knochenmark, kann sich nicht erwärmen", "Verschlimmerung durch feuchtes Wetter und Wohnen in feuchten Räumen", "Präzise Periodizität der Symptome (jeden Tag zur selben Stunde)", "Hämorrhagische Diathese (Blutungen aus allen Schleimhäuten)"],
            "en": ["Patient feels chilled to the very marrow of the bones, cannot get warm", "Aggravation from damp rainy weather and living in damp basements", "Strict clock-like periodicity of complaints", "Hemorrhagic diathesis from mucous surfaces"]
        },
        "mind": {"de": "Furchtsam, ängstlich während des Frostes, niedergeschlagen.", "en": "Timid, anxious during chills, gloomy."},
        "better": {"de": ["Rauchen", "Druck", "Trockene Wärme"], "en": ["Smoking tobacco", "Hard pressure", "Dry warmth"]},
        "worse": {"de": ["Nasses, feuchtes Wetter", "Regen", "Baden in kaltem Wasser"], "en": ["Damp wet weather", "Rain", "Cold bathing"]},
        "dosage": {"de": "D6 bis C30. 2x täglich 5 Tropfen.", "en": "6X to 30C. 5 drops twice daily."},
        "sphere": ["Nervensystem & Periodizität", "Knochen & Knochenhaut", "Blut & Milz"], "diffs": ["China", "Arsenicum", "Cedron", "Natrum mur"], "keywords": ["kreuzspinne", "knochenkälte", "feuchtigkeit", "periodizität", "frost"]
    },
    {
        "id": "aristolochia-clematitis", "latin": "Aristolochia clematitis", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Osterluzei", "en": "Birthwort", "es": "Clematítide / Aristoloquia", "fr": "Aristoloche clématite", "it": "Aristolochia", "el": "Αριστολοχία", "ru": "Кирказон ломоносовидный"},
        "origin": {"de": "Frische blühende Pflanze von Aristolochia clematitis (Aristolochiaceae).", "en": "Fresh flowering plant of Aristolochia clematitis (Aristolochiaceae)."},
        "essence": {"de": "Gynäkologisches Mittel bei Amenorrhö, verzögerter Wundheilung und venöser Stauung.", "en": "Gynecological remedy for amenorrhea, delayed wound healing, and pelvic venous stasis."},
        "indications": {"de": ["Amenorrhö & Menstruationsstörungen", "Chronische Unterleibskongestion", "Schlecht heilende Wunden", "Akne vor der Menstruation"], "en": ["Amenorrhea & menstrual delays", "Chronic pelvic congestion", "Sluggish wound healing", "Premenstrual acne"]},
        "keynotes": {
            "de": ["Ausbleiben der Periode nach Erkältung oder seelischem Schock", "Schweregefühl im Becken wie vor der Regelblutung", "Verschlimmerung vor der Menstruation", "Depressive Verstimmung mit Weigneigung vor der Regel"],
            "en": ["Suppression of menses from chilling or emotional shock", "Heaviness and pelvic bearing-down as if menses would appear", "Aggravation prior to menstrual onset", "Depression with propensity to weep before periods"]
        },
        "mind": {"de": "Reizbar, weinerlich vor der Regel, niedergeschlagen, wie Pulsatilla.", "en": "Tearful, depressed before menses, like Pulsatilla."},
        "better": {"de": ["Eintreten des Menstruationsflusses", "Frische Luft"], "en": ["Onset of menstrual flow", "Fresh open air"]},
        "worse": {"de": ["Vor der Menstruation", "Kälte", "Sitzen"], "en": ["Before menses", "Cold", "Prolonged sitting"]},
        "dosage": {"de": "D6 bis D12. 2x täglich 5 Tropfen.", "en": "6X to 12X. 5 drops twice daily."},
        "sphere": ["Weibliche Geschlechtsorgane", "Venen", "Haut"], "diffs": ["Pulsatilla", "Sepia", "Caulophyllum", "Cimicifuga"], "keywords": ["osterluzei", "amenorrhö", "menstruation", "unterleib", "beckenstauung"]
    },
    {
        "id": "artemisia-vulgaris", "latin": "Artemisia vulgaris", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Gemeiner Beifuß", "en": "Mugwort", "es": "Artemisa común", "fr": "Armoise commune", "it": "Assenzio selvatico", "el": "Αρτεμισία", "ru": "Полынь обыкновенная"},
        "origin": {"de": "Frische Wurzel von Artemisia vulgaris (Asteraceae).", "en": "Fresh root of Artemisia vulgaris (Asteraceae)."},
        "essence": {"de": "Krämpfe, Petit-Mal-Anfälle und Chorea nach Schreck oder Zorn, besonders in der Pubertät.", "en": "Convulsive seizures, petit mal, and chorea brought on by fright or grief, especially during puberty."},
        "indications": {"de": ["Epileptiforme Anfälle", "Chorea minor bei Kindern", "Schlafwandeln", "Krämpfe während der Dentition"], "en": ["Epileptiform seizures", "Chorea minor in children", "Somnambulism", "Dentition convulsions"]},
        "keynotes": {
            "de": ["Anfälle ausgelöst durch Schreck, Erregung oder Schlag auf den Kopf", "Reichlicher, übelriechender Schweiß mit Knoblauchgeruch nach dem Anfall", "Kauen mit dem Kiefer und Grimassieren im Schlaf", "Krämpfe wiederholen sich in kurzen Schüben"],
            "en": ["Attacks provoked by fright, anger, or blow to head", "Profuse offensive sweat with garlicky odor after fit", "Chewing motion of jaws and grimacing in sleep", "Spasms repeated in rapid clusters"]
        },
        "mind": {"de": "Reizbar, schreckhaft, vergisst den Anfall völlig.", "en": "Irritable, easily frightened, amnesia for the seizure."},
        "better": {"de": ["Nach dem Anfall und Schlaf", "Wärme"], "en": ["After seizure and deep sleep", "Warmth"]},
        "worse": {"de": ["Schreck", "Kälte", "Mondphasen"], "en": ["Fright", "Cold", "Phases of moon"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Zentralnervensystem", "Muskulatur (Krämpfe)", "Schlaf"], "diffs": ["Cicuta", "Cuprum", "Hyoscyamus", "Stramonium"], "keywords": ["beifuß", "krämpfe", "epilepsie", "schlafwandeln", "schreck"]
    },
    {
        "id": "asclepias-tuberosa", "latin": "Asclepias tuberosa", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Knollige Schwalbenwurz / Pleurisiewurzel", "en": "Pleurisy Root / Butterfly Weed", "es": "Asclepia tuberosa", "fr": "Asclépiade tubéreuse", "it": "Asclepiade", "el": "Ασκληπιάς", "ru": "Ваточник клубневой"},
        "origin": {"de": "Frischer Wurzelstock von Asclepias tuberosa (Apocynaceae).", "en": "Fresh root of Asclepias tuberosa (Apocynaceae)."},
        "essence": {"de": "Brustfellentzündung (Pleuritis) mit stechenden Schmerzen, trockener Hitze und Atembeschwerden.", "en": "Pleurisy with sharp stitching pains, dry heat, and painful respiration."},
        "indications": {"de": ["Pleuritis & Rippenfellreizung", "Interkostalneuralgie", "Pneumonie im Anfangsstadium", "Katarrhalische Diarrhö"], "en": ["Pleurisy & pleural friction", "Intercostal neuralgia", "Early pneumonia", "Catarrhal diarrhea"]},
        "keynotes": {
            "de": ["Scharfe, stechende Schmerzen beim Einatmen und Husten", "Schmerz strahlt von der linken Brustwarze zur Schulter aus", "Trockener, schmerzhafter Husten, der den Thorax erschüttert", "Reichlicher warmer Schweiß bringt Erleichterung"],
            "en": ["Sharp stitching pains upon inspiration and cough", "Pain radiating from left nipple to scapula", "Dry, racking cough shaking the thorax", "Profuse warm sweat affords relief"]
        },
        "mind": {"de": "Niedergeschlagen, ängstlich wegen Kurzatmigkeit.", "en": "Dejected, anxious regarding breathing difficulty."},
        "better": {"de": ["Schwitzen", "Beugen nach vorne", "Liegen auf der schmerzhaften Seite"], "en": ["Perspiring", "Bending forward", "Lying on painful side"]},
        "worse": {"de": ["Tiefes Einatmen", "Bewegung der Arme", "Kälte"], "en": ["Deep inspiration", "Moving arms", "Cold"]},
        "dosage": {"de": "D2 bis D4. Alle 2 Stunden 5 Tropfen.", "en": "2X to 4X. 5 drops every 2 hours."},
        "sphere": ["Pleura & Lunge", "Interkostalnerven", "Darmschleimhaut"], "diffs": ["Bryonia", "Ranunculus bulbosus", "Kali carb"], "keywords": ["pleuritis", "rippenfell", "stechen", "atmung", "knollige schwalbenwurz"]
    },
    {
        "id": "asparagus-officinalis", "latin": "Asparagus officinalis", "cat": "plant", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Gemüsespargel", "en": "Asparagus", "es": "Espárrago", "fr": "Asperge officinale", "it": "Asparago", "el": "Σπαράγγι", "ru": "Спаржа лекарственная"},
        "origin": {"de": "Frische junge Triebe von Asparagus officinalis (Asparagaceae).", "en": "Fresh young shoots of Asparagus officinalis (Asparagaceae)."},
        "essence": {"de": "Starke Diurese, stinkender Urin, Herzklopfen mit Wassersucht bei älteren Patienten.", "en": "Marked diuresis with offensive urine, violent palpitations and dropsy in elderly patients."},
        "indications": {"de": ["Kardiale Ödeme", "Dysurie & Zystitis", "Herzrhythmusstörungen mit Pulsieren", "Rheumatische Gelenkschmerzen"], "en": ["Cardiac dropsy", "Dysuria & catarrhal cystitis", "Cardiac arrhythmia with throbbing", "Rheumatic joint pain"]},
        "keynotes": {
            "de": ["Urin riecht stark und penetrant", "Heftiges, sichtbares Herzklopfen bei der geringsten Bewegung", "Wassersucht mit Unterdrückung des Urins", "Stechende Schmerzen am linken Schulterblatt"],
            "en": ["Urine has a strong characteristic offensive odor", "Violent visible palpitations upon least movement", "Dropsy with suppressed or scanty urine", "Stitching pain about left scapula"]
        },
        "mind": {"de": "Ängstlich bezüglich des Herzens, unruhig.", "en": "Anxious about cardiac health, uneasy."},
        "better": {"de": ["Aufrechtes Sitzen", "Frische Luft"], "en": ["Sitting erect", "Fresh open air"]},
        "worse": {"de": ["Bewegung", "Liegen auf der linken Seite"], "en": ["Motion", "Lying on left side"]},
        "dosage": {"de": "D1 bis D6. 3x täglich 5 Tropfen.", "en": "1X to 6X. 5 drops 3 times daily."},
        "sphere": ["Herz & Gefäße", "Nieren & Blase", "Gelenke"], "diffs": ["Digitalis", "Apocynum", "Convallaria", "Cactus"], "keywords": ["spargel", "harngeruch", "herzklopfen", "ödeme", "diurese"]
    },
    {
        "id": "astacus-fluviatilis", "latin": "Astacus fluviatilis", "cat": "animal", "authors": ["hering"], "poly": False, "tier": 3,
        "names": {"de": "Flusskrebs", "en": "Crawfish / River Crayfish", "es": "Cangrejo de río", "fr": "Écrevisse de rivière", "it": "Gambero di fiume", "el": "Ποταμοκαραβίδα", "ru": "Речной рак"},
        "origin": {"de": "Der ganze lebende Flusskrebs (Astacidae).", "en": "Whole living river crawfish (Astacidae)."},
        "essence": {"de": "Generalisierte Urtikaria über den ganzen Körper mit Leberbeschwerden und geschwollenen Lymphdrüsen.", "en": "Generalized urticaria over entire body associated with hepatic disorders and lymphadenopathy."},
        "indications": {"de": ["Akute & chronische Urtikaria", "Nesselsucht nach Schalentieren", "Hepatomegalie mit Ikterus", "Lymphdrüsenschwellung"], "en": ["Acute & chronic urticaria", "Hives from shellfish ingestion", "Hepatomegaly with mild jaundice", "Lymphadenitis"]},
        "keynotes": {
            "de": ["Urtikaria am gesamten Körper mit heftigem Brennen und Jucken", "Nesselsucht geht mit Leberdrücken oder Gelbsucht einher", "Hautausschlag wird schlimmer durch Entblößen der Haut", "Geschwollene Halslymphknoten bei Kindern"],
            "en": ["Urticaria covers whole body with intense burning itching", "Hives accompanied by liver congestion or mild jaundice", "Rash aggravated by uncovering the skin", "Cervical lymphadenitis in scrofulous children"]
        },
        "mind": {"de": "Unruhig wegen quälendem Juckreiz, reizbar.", "en": "Restless due to tormenting itch, irritable."},
        "better": {"de": ["Wärme", "Bedeckt bleiben"], "en": ["Warmth", "Remaining warmly covered"]},
        "worse": {"de": ["Entblößen der Haut", "Kühle Luft", "Nach dem Essen"], "en": ["Uncovering skin", "Cool air", "After eating"]},
        "dosage": {"de": "D3 bis D6. 3x täglich 5 Tropfen.", "en": "3X to 6X. 5 drops 3 times daily."},
        "sphere": ["Haut & Quaddeln", "Leber & Galle", "Lymphsystem"], "diffs": ["Apis", "Urtica urens", "Rhus tox", "Natrum mur"], "keywords": ["flusskrebs", "urtikaria", "leber", "nesselsucht", "juckreiz"]
    },
    {
        "id": "aurum-arsenicosum", "latin": "Aurum arsenicosum", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Goldarsenid", "en": "Gold Arsenite", "es": "Arsenito de oro", "fr": "Arséniate d'or", "it": "Arsenito d'oro", "el": "Αρσενικικό χρυσό", "ru": "Арсенит золота"},
        "origin": {"de": "Chemische Verbindung aus Gold und Arsen.", "en": "Chemical compound of gold and arsenic."},
        "essence": {"de": "Tiefe Melancholie mit Suizidgedanken, brennenden Schmerzen und kardiovaskulärer Degeneration.", "en": "Profound melancholy with suicidal despair, burning pains, and cardiovascular degeneration."},
        "indications": {"de": ["Depression mit Suizidalität", "Arteriosklerose mit Angina pectoris", "Hypertonie bei älteren Menschen", "Chronische Kachexie"], "en": ["Depressive suicidal despair", "Arteriosclerosis with angina", "Hypertension in elderly", "Chronic cachexia"]},
        "keynotes": {
            "de": ["Verbindung der extremen Schwermut von Aurum mit der brennenden Unruhe von Arsenicum", "Patient sieht keinen Sinn mehr im Leben und sehnt den Tod herbei", "Nachtschmerz in Knochen und Brustkorb", "Brennen und Druck in der Herzgegend"],
            "en": ["Blends Aurum's severe depression with Arsenicum's burning restlessness", "Patient feels completely hopeless and longs for death", "Nocturnal bone and chest pains", "Burning and constrictive pressure in precordium"]
        },
        "mind": {"de": "Tiefste Verzweiflung, ruhelos getrieben, Selbstmordimpulse, Lebensüberdruss.", "en": "Utter despair, restless driving, suicidal impulses, weariness of life."},
        "better": {"de": ["Wärme", "Sanfte Musik", "Ruhiges Zureden"], "en": ["Warmth", "Gentle music", "Quiet consolation"]},
        "worse": {"de": ["Nachts", "Kälte", "Alleinsein"], "en": ["Night", "Cold", "Being alone"]},
        "dosage": {"de": "C30 oder C200. Nur als Einzeldosis.", "en": "30C or 200C. Single dose only."},
        "sphere": ["Gemüt (Depression)", "Herz & Kreislauf", "Knochen"], "diffs": ["Aurum metallicum", "Arsenicum album", "Lachesis"], "keywords": ["suizid", "depression", "lebensüberdruss", "arteriosklerose", "angina pectoris"]
    },
    {
        "id": "aurum-iodatum", "latin": "Aurum iodatum", "cat": "mineral", "authors": ["kent"], "poly": False, "tier": 3,
        "names": {"de": "Goldjodid", "en": "Gold Iodide", "es": "Yoduro de oro", "fr": "Iodure d'or", "it": "Ioduro d'oro", "el": "Ιωδιούχος χρυσός", "ru": "Иодид золота"},
        "origin": {"de": "Chemische Verbindung aus Gold und Jod (AuI3).", "en": "Chemical compound of gold and iodine (AuI3)."},
        "essence": {"de": "Chronische Drüsenverhärtungen, Arteriosklerose und Ovarialtumoren bei hitzigen, nervösen Patienten.", "en": "Chronic gland induration, advanced arteriosclerosis, and ovarian cysts in warm, restless patients."},
        "indications": {"de": ["Ovarialzysten & Myome", "Struma nodosa & Drüseninduration", "Zerebrale Arteriosklerose", "Chronische Salpingitis"], "en": ["Ovarian cysts & fibroids", "Nodular goiter & glandular induration", "Cerebral arteriosclerosis", "Chronic salpingitis"]},
        "keynotes": {
            "de": ["Extreme Härte von Organen und Drüsen (Ovarien, Schilddrüse, Hoden)", "Im Gegensatz zu Aurum ist der Patient hitzig und verträgt kein warmes Zimmer", "Heißes Aufsteigen zum Kopf mit Herzklopfen", "Abmagerung trotz gesteigertem Appetit"],
            "en": ["Stony hardness of indurated glands and organs (ovaries, thyroid, testes)", "Unlike Aurum, patient is warm-blooded and cannot tolerate warm rooms", "Surging of heat to head with palpitation", "Emaciation despite ravenous appetite"]
        },
        "mind": {"de": "Hektisch, reizbar, ruhelos, traurig mit Neigung zur Isolation.", "en": "Hectic, irritable, restless, melancholic with social withdrawal."},
        "better": {"de": ["Frische kühle Luft", "Kaltes Waschen"], "en": ["Fresh cool air", "Cold washing"]},
        "worse": {"de": ["Wärme", "Warmes Zimmer", "Nachts"], "en": ["Warmth", "Warm room", "Night"]},
        "dosage": {"de": "D6 bis C30. 1-2x täglich 1 Tablette.", "en": "6X to 30C. 1 tablet 1-2 times daily."},
        "sphere": ["Drüsen & Schilddrüse", "Gefäße", "Ovarien & Uterus"], "diffs": ["Iodium", "Aurum metallicum", "Baryta iodata"], "keywords": ["struma", "ovarialzyste", "drüsenverhärtung", "arteriosklerose", "goldjodid"]
    },
    {
        "id": "aurum-muriaticum", "latin": "Aurum muriaticum", "cat": "mineral", "authors": ["kent", "hering"], "poly": False, "tier": 2,
        "names": {"de": "Goldchlorid", "en": "Gold Chloride", "es": "Cloruro de oro", "fr": "Chlorure d'or", "it": "Cloruro d'oro", "el": "Χλωριούχος χρυσός", "ru": "Хлорид золота"},
        "origin": {"de": "Goldchlorid-Kristalle (AuCl3).", "en": "Gold chloride crystals (AuCl3)."},
        "essence": {"de": "Verhärtungen des Uterus und der Mammae, Ozaena und Herzhypertrophie mit starkem Blutandrang.", "en": "Indurations of uterus and breasts, destructive ozaena, and cardiac hypertrophy with vascular surges."},
        "indications": {"de": ["Uterusmyome & Gebärmutterverhärtung", "Ozaena mit stinkendem Eiter", "Chronische Kardiomegalie", "Kondylome der Genitalien"], "en": ["Uterine fibroids & induration", "Ozaena with foul purulence", "Cardiac hypertrophy", "Genital condylomata"]},
        "keynotes": {
            "de": ["Uterus verhärtet und geschwollen wie Holz", "Fäulnisartiger Geruch aus Nase und Mund bei Knochenkaries", "Pochendes, unregelmäßiges Herzklopfen, strahlt in den Hals aus", "Chronische Warzen und Feigwarzen am Anus"],
            "en": ["Uterus indurated and heavy as a block of wood", "Fetid putrid odor from nose and mouth with bony caries", "Violent throbbing irregular heart palpitations", "Chronic warty growths and condylomata around anus"]
        },
        "mind": {"de": "Launisch, gereizt, furchtsam, Abneigung gegen Widerspruch.", "en": "Capricious, peevish, fearful, cannot endure contradiction."},
        "better": {"de": ["Kühle Luft", "Kaltes Waschen"], "en": ["Cool air", "Cold washing"]},
        "worse": {"de": ["Wärme", "Ruhe", "Nasskaltes Wetter"], "en": ["Warmth", "Rest", "Damp cold weather"]},
        "dosage": {"de": "D6 bis C30. 2x täglich 5 Tropfen.", "en": "6X to 30C. 5 drops twice daily."},
        "sphere": ["Uterus & Beckenorgane", "Herz & Aorta", "Nasenknochen"], "diffs": ["Aurum met", "Thuja", "Nitricum acidum", "Sepia"], "keywords": ["myom", "ozaena", "gebärmutter", "herzhypertrophie", "goldchlorid"]
    },
    {
        "id": "aurum-muriaticum-natronatum", "latin": "Aurum muriaticum natronatum", "cat": "mineral", "authors": ["kent", "hering"], "poly": True, "tier": 2,
        "names": {"de": "Natriumgoldchlorid", "en": "Sodium Gold Chloride", "es": "Cloruro de oro y sodio", "fr": "Chlorure d'or et de sodium", "it": "Cloruro di oro e sodio", "el": "Χλωριούχο χρυσο-νάτριο", "ru": "Хлорид золота и натрия"},
        "origin": {"de": "Doppelsalz aus Natriumchlorid und Goldchlorid (NaAuCl4).", "en": "Double salt of sodium chloride and gold chloride (NaAuCl4)."},
        "essence": {"de": "Spezifisches Mittel für Uterusmyome, Ovarialinduration, Zervizitis und chronischen Fluor.", "en": "Specific remedy for uterine fibromas, ovarian induration, chronic cervicitis, and corrosive leucorrhea."},
        "indications": {"de": ["Uterusfibrome & Myome", "Chronische Endometritis", "Ovarialzysten & Verhärtungen", "Aszites bei Leberzirrhose"], "en": ["Uterine fibroids", "Chronic endometritis", "Ovarian cysts & sclerosis", "Ascites in cirrhosis"]},
        "keynotes": {
            "de": ["Gebärmuttermyome mit Drängen nach unten und starker Blutung", "Chronischer, ätzender, gelber Ausfluss mit Wundheit", "Verhärtung und Anschwellung der Portio uteri", "Bluthochdruck mit Neigung zu Schlaganfall"],
            "en": ["Uterine fibromas with heavy bearing-down and menorrhagia", "Chronic excoriating yellow leucorrhea causing pruritus", "Stony induration and swelling of uterine cervix", "Hypertension with apoplectic tendency"]
        },
        "mind": {"de": "Depressiv, still, melancholisch, unruhig bei Untätigkeit.", "en": "Depressed, quiet, gloomy, restless when idle."},
        "better": {"de": ["Frische Luft", "Kaltes Baden"], "en": ["Fresh open air", "Cold bathing"]},
        "worse": {"de": ["Wärme", "Bettwärme", "Vor der Menstruation"], "en": ["Warmth", "Warmth of bed", "Before menses"]},
        "dosage": {"de": "D4 bis D12. 2x täglich 1 Tablette über 6-8 Wochen.", "en": "4X to 12X. 1 tablet twice daily over 6-8 weeks."},
        "sphere": ["Uterus & Ovarien", "Leber", "Arterielles System"], "diffs": ["Sepia", "Fraxinus", "Aurum met", "Thuja"], "keywords": ["myom", "gebärmutterfibrom", "zervix", "ovarialzyste", "leukorrhö"]
    }
]

print(f"Batch 1 compiled with {len(BATCH1)} remedies.")
