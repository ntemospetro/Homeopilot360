/**
 * Cascade Anamnesis Matrix & Dynamic 3-Tier Funnel Engine
 * 
 * Implements the authentic Hahnemann & Bönninghausen funnel:
 * Level 1: Main Category / Domain (Grobe Orientierung)
 * Level 2: Adaptive Fine-Differentiation (Nuance with Multi-select)
 * Level 3: Qualification & Modality Direction (> Better / < Worse / Grad / Zeit)
 * 
 * Connects directly to Kent, Boericke and Boger clinical rubric scoring.
 */

export interface CascadeTier3Option {
  id: string;
  label: Record<string, string>;
  direction?: 'better' | 'worse' | 'neutral';
  timeframe?: string;
  grade?: number; // 1-4 Boericke grade
  remedyWeights?: Record<string, number>; // Specific remedy affinities
  rubric?: string;
}

export interface CascadeTier2Option {
  id: string;
  label: Record<string, string>;
  subQuestion?: Record<string, string>;
  direction?: 'better' | 'worse';
  remedyHints?: string[]; // e.g. ['staphisagria', 'chamomilla']
  grade?: number;
  rubrics?: string[];
  tier3Options?: CascadeTier3Option[];
}

export interface CascadeCategory {
  id: string;
  label: Record<string, string>;
  iconName?: string;
  description?: Record<string, string>;
  remedyHints?: string[];
  tier2Options: CascadeTier2Option[];
}

export interface CascadePillarData {
  pillar: 'location' | 'sensation' | 'causa' | 'modalities' | 'concomitants' | 'mind';
  leadQuestion: Record<string, string>;
  leadQuestionLocation?: Record<string, string>;
  leadQuestionRadiation?: Record<string, string>;
  categories: CascadeCategory[];
}

export const CASCADE_PILLAR_DEFINITIONS: Record<string, CascadePillarData> = {
  // SÄULE 1: WO? (Ort, Ausstrahlung, Seitigkeit)
  location: {
    pillar: 'location',
    leadQuestion: {
      de: 'Wo genau am Körper spüren Sie die Beschwerde?',
      en: 'Where exactly on the body do you feel the complaint?',
      es: '¿Dónde exactamente en el cuerpo siente la molestia?',
      fr: 'Où ressentez-vous exactement la douleur dans le corps ?',
      it: 'Dove sente esattamente il disturbo nel corpo?',
      el: 'Πού ακριβώς στο σώμα εντοπίζεται η ενόχληση;',
      ru: 'Где именно в теле локализуется недомогание?'
    },
    leadQuestionLocation: {
      de: 'Wo genau am Körper spüren Sie die Beschwerde?',
      en: 'Where exactly on the body do you feel the complaint?',
      es: '¿Dónde exactamente en el cuerpo siente la molestia?',
      fr: 'Où ressentez-vous exactement la douleur dans le corps ?',
      it: 'Dove sente esattamente il disturbo nel corpo?',
      el: 'Πού ακριβώς στο σώμα εντοπίζεται η ενόχληση;',
      ru: 'Где именно в теле локализуется недомогание?'
    },
    leadQuestionRadiation: {
      de: 'Wohin strahlt der Schmerz oder das Ziehen aus (oder bleibt er fest punktuell)?',
      en: 'Where does the pain or sensation radiate (or does it remain strictly point-fixed)?',
      es: '¿Hacia dónde se irradia el dolor o tirón (o permanece estrictamente puntual)?',
      fr: 'Où irradie la douleur ou le tiraillement (ou reste-t-elle strictement localisée) ?',
      it: 'Verso dove si irradia il dolore o la trazione (o resta strettamente localizzato)?',
      el: 'Προς τα πού αντανακλά ο πόνος ή το τράβηγμα (ή παραμένει αυστηρά σημειακός);',
      ru: 'Куда иррадиирует боль или тянущее ощущение (или остается строго точечной)?'
    },
    categories: [
      {
        id: 'loc-cat-upper-abdomen',
        label: {
          de: 'Oberbauch & Magengrube (Epigastrium)',
          en: 'Upper abdomen & stomach pit (Epigastrium)',
          es: 'Abdomen superior y boca del estómago',
          fr: 'Épigastre et creux de l\'estomac',
          it: 'Epigastrio e bocca dello stomaco',
          el: 'Άνω κοιλία & στομάχι (επιγάστριο)',
          ru: 'Верх живота и подложечная область'
        },
        tier2Options: [
          {
            id: 'loc-epigastrium-center',
            label: {
              de: 'Streng zentral in der Magengrube',
              en: 'Strictly central in the pit of the stomach',
              es: 'Estrictamente central en la boca del estómago',
              fr: 'Strictement central au creux de l\'estomac',
              it: 'Strettamente centrale nella bocca dello stomaco',
              el: 'Αυστηρά κεντρικά στο επιγάστριο',
              ru: 'Строго по центру в подложечной области'
            },
            remedyHints: ['nux-vomica', 'bismuthum', 'arsenicum-album', 'pulsatilla'],
            tier3Options: [
              { id: 'loc-rad-back', label: { de: 'Strahlt nach hinten in den Rücken / BWS', en: 'Radiates back into the spine', es: 'Irradia hacia la espalda', fr: 'Irradie vers le dos', it: 'Irradia verso la schiena', el: 'Αντανακλά πίσω στην πλάτη', ru: 'Иррадиирует назад в спину' } },
              { id: 'loc-rad-sternum', label: { de: 'Zieht nach oben hinter das Brustbein', en: 'Shoots upward behind sternum', es: 'Sube detrás del esternón', fr: 'Monte derrière le sternum', it: 'Sale dietro lo sterno', el: 'Ανεβαίνει πίσω από το στέρνο', ru: 'Поднимается за грудину' } },
              { id: 'loc-rad-none', label: { de: 'Bleibt streng punktuell fixiert', en: 'Remains strictly point-fixed', es: 'Permanece puntualmente fijo', fr: 'Reste strictement ponctuel', it: 'Resta strettamente puntuale', el: 'Παραμένει αυστηρά σημειακό', ru: 'Остается строго точечным' } }
            ]
          },
          {
            id: 'loc-hypochondrium-right',
            label: {
              de: 'Rechter Oberbauch (Leber- & Gallenregion)',
              en: 'Right upper quadrant (Liver & Gallbladder)',
              es: 'Hipocondrio derecho (Hígado y vesícula)',
              fr: 'Hypochondre droit (Foie et vésicule)',
              it: 'Ipocondrio destro (Fegato e colecisti)',
              el: 'Δεξιό υποχόνδριο (Ήπαρ & Χολή)',
              ru: 'Правое подреберье (область печени и желчного)'
            },
            remedyHints: ['chelidonium-majus', 'lycopodium-clavatum', 'bryonia-alba', 'carduus-marianus'],
            tier3Options: [
              { id: 'loc-rad-shoulder-r', label: { de: 'Strahlt unter das rechte Schulterblatt aus (Chelidonium-Leitsymptom)', en: 'Radiates under right scapula', es: 'Irradia bajo el omóplato derecho', fr: 'Irradie sous l\'omoplate droite', it: 'Irradia sotto la scapola destra', el: 'Αντανακλά κάτω από τη δεξιά ωμοπλάτη', ru: 'Иррадиирует под правую лопатку' } },
              { id: 'loc-rad-navel', label: { de: 'Zieht schräg nach unten zum Nabel', en: 'Pulls diagonally to navel', es: 'Tira diagonalmente al ombligo', fr: 'Tire vers le nombril', it: 'Tira verso l\'ombelico', el: 'Τραβά διαγώνια προς τον ομφαλό', ru: 'Тянет по диагонали к пупку' } }
            ]
          },
          {
            id: 'loc-hypochondrium-left',
            label: {
              de: 'Linker Oberbauch (Milz- / Magenfundusregion)',
              en: 'Left upper quadrant (Spleen / Gastric fundus)',
              es: 'Hipocondrio izquierdo (Bazo y estómago)',
              fr: 'Hypochondre gauche (Rate et estomac)',
              it: 'Ipocondrio sinistro (Milza e stomaco)',
              el: 'Αριστερό υποχόνδριο (Σπλήνας & στόμαχος)',
              ru: 'Левое подреберье (селезенка и желудок)'
            },
            remedyHints: ['ceanothus-americanus', 'china-officinalis', 'carbo-vegetabilis', 'scilla-maritima']
          }
        ]
      },
      {
        id: 'loc-cat-umbilical',
        label: {
          de: 'Nabel- & Mittelbauchregion (Mesogastrium)',
          en: 'Umbilical & mid-abdomen (Mesogastrium)',
          es: 'Región umbilical y mesogastrio',
          fr: 'Région ombilicale et mésogastre',
          it: 'Regione ombelicale e mesogastrio',
          el: 'Ομφαλική περιοχή & μέση κοιλία',
          ru: 'Околопупочная область и средний отдел живота'
        },
        tier2Options: [
          {
            id: 'loc-navel-center',
            label: {
              de: 'Kreisförmig um den Bauchnabel zentriert',
              en: 'Centered around the navel in a circle',
              es: 'Centrado alrededor del ombligo',
              fr: 'Centré autour du nombril',
              it: 'Centrato attorno all\'ombelico',
              el: 'Κυκλικά γύρω από τον ομφαλό',
              ru: 'Кругом вокруг пупка'
            },
            remedyHints: ['colocynthis', 'plumbum-metallicum', 'dioscorea-villosa'],
            tier3Options: [
              { id: 'loc-rad-spasm-all', label: { de: 'Strahlt sternförmig in den ganzen Bauch aus', en: 'Radiates like a star across entire belly', es: 'Irradia en estrella a todo el vientre', fr: 'Irradie en étoile dans tout le ventre', it: 'Irradia a stella in tutto il ventre', el: 'Ακτινωτά σε ολόκληρη την κοιλιά', ru: 'Иррадиирует звездообразно по всему животу' } },
              { id: 'loc-rad-groin', label: { de: 'Zieht tief in die Leisten / Becken', en: 'Pulls down to groin / pelvis', es: 'Baja hacia las ingles', fr: 'Descend vers les aines', it: 'Scende verso l\'inguine', el: 'Κατεβαίνει προς τις βουβωνικές χώρες', ru: 'Тянет вниз в пах' } }
            ]
          }
        ]
      },
      {
        id: 'loc-cat-lower-abdomen',
        label: {
          de: 'Unterbauch & Becken (Hypogastrium / Leisten)',
          en: 'Lower abdomen & pelvis (Hypogastrium / Groin)',
          es: 'Abdomen inferior y pelvis',
          fr: 'Bas-ventre et bassin',
          it: 'Basso ventre e bacino',
          el: 'Κάτω κοιλία & λεκάνη',
          ru: 'Низ живота и малый таз'
        },
        tier2Options: [
          {
            id: 'loc-iliac-right',
            label: {
              de: 'Rechter Unterbauch (Ileozökal- / Blinddarmregion)',
              en: 'Right lower quadrant (Ileocecal / Appendix)',
              es: 'Fosa ilíaca derecha (Apéndice)',
              fr: 'Fosse iliaque droite (Appendice)',
              it: 'Fossa iliaca destra (Appendice)',
              el: 'Δεξιός λαγόνιος βόθρος (τυφλό / σκωληκοειδής)',
              ru: 'Правая подвздошная область (аппендикс)'
            },
            remedyHints: ['bryonia-alba', 'belladonna', 'rhus-toxicodendron', 'iris-tenax']
          },
          {
            id: 'loc-iliac-left',
            label: {
              de: 'Linker Unterbauch (Sigmoid / Colon descendens)',
              en: 'Left lower quadrant (Sigmoid)',
              es: 'Fosa ilíaca izquierda (Sigma)',
              fr: 'Fosse iliaque gauche (Côlon sigmoïde)',
              it: 'Fossa iliaca sinistra (Sigma)',
              el: 'Αριστερός λαγόνιος βόθρος (σιγμοειδές)',
              ru: 'Левая подвздошная область (сигмовидная кишка)'
            },
            remedyHints: ['lachesis-mutus', 'lilium-tigrinum', 'mercurius-solubilis']
          },
          {
            id: 'loc-pelvis-diffuse',
            label: {
              de: 'Unterbauch mittig / Blasen- & Uterusregion',
              en: 'Hypogastrium central / Bladder & pelvic floor',
              es: 'Bajo vientre central / Vejiga y pelvis',
              fr: 'Bas-ventre central / Vessie et utérus',
              it: 'Ipogastrio centrale / Vescica e utero',
              el: 'Υπογάστριο κεντρικά / Ουροδόχος & μήτρα',
              ru: 'Центр низа живота / мочевой пузырь и матка'
            },
            remedyHints: ['sepia-officinalis', 'cantharis', 'pulsatilla-pratensis']
          }
        ]
      },
      {
        id: 'loc-cat-head-neck',
        label: {
          de: 'Kopf, Stirn, Schläfen & Nacken',
          en: 'Head, Forehead, Temples & Neck',
          es: 'Cabeza, frente, sienes y nuca',
          fr: 'Tête, front, tempes et nuque',
          it: 'Testa, fronte, tempie e nuca',
          el: 'Κεφάλι, μέτωπο, κρόταφοι & αυχένας',
          ru: 'Голова, лоб, виски и затылок'
        },
        tier2Options: [
          {
            id: 'loc-forehead-frontal',
            label: {
              de: 'Stirn (frontal / über den Augenbrauen)',
              en: 'Forehead (frontal / above eyebrows)',
              es: 'Frente (frontal / sobre las cejas)',
              fr: 'Front (frontal / au-dessus des sourcils)',
              it: 'Fronte (frontale / sopra le sopracciglia)',
              el: 'Μέτωπο (μετωπιαία / πάνω από τα φρύδια)',
              ru: 'Лоб (фронтально / над бровями)'
            },
            remedyHints: ['belladonna', 'bryonia-alba', 'gelsemium-sempervirens', 'glonoinum'],
            tier3Options: [
              { id: 'loc-rad-head-back-occiput', label: { de: 'Zieht von der Stirn nach hinten in den Hinterkopf & Nacken', en: 'Pulls from forehead back to occiput & neck', es: 'Tira de la frente hacia el occipucio y nuca', fr: 'Tire du front vers l\'occiput et la nuque', it: 'Tira dalla fronte verso l\'occipite e la nuca', el: 'Τραβά από το μέτωπο πίσω προς το ινίο & αυχένα', ru: 'Тянет со лба назад к затылку и шее' } },
              { id: 'loc-rad-head-eyes-root', label: { de: 'Strahlt tief in die Augenhöhlen / Nasenwurzel aus', en: 'Radiates deep into orbits / root of nose', es: 'Irradia a las órbitas y raíz de la nariz', fr: 'Irradie dans les orbites et racine du nez', it: 'Irradia nelle orbite e radice del naso', el: 'Αντανακλά βαθιά στις κόγχες / ρίζα μύτης', ru: 'Иррадиирует в глазницы и корень носа' } },
              { id: 'loc-rad-head-point-frontal', label: { de: 'Bleibt streng punktuell an der Stirn fixiert (abgrenzbar)', en: 'Remains strictly localized at the forehead', es: 'Permanece puntualmente fijo en la frente', fr: 'Reste strictement ponctuel au front', it: 'Resta strettamente puntuale alla fronte', el: 'Παραμένει αυστηρά σημειακό στο μέτωπο', ru: 'Остается строго точечным на лбу' } }
            ]
          },
          {
            id: 'loc-temple-right',
            label: {
              de: 'Rechte Schläfe (einseitig rechts)',
              en: 'Right temple (one-sided right)',
              es: 'Sien derecha (unilateral derecho)',
              fr: 'Tempe droite (unilatéral droit)',
              it: 'Tempia destra (unilaterale destro)',
              el: 'Δεξιός κρόταφος (μονόπλευρα δεξιά)',
              ru: 'Правый висок (односторонне справа)'
            },
            remedyHints: ['sanguinaria-canadensis', 'belladonna', 'lycopodium-clavatum', 'ignatia-amara'],
            tier3Options: [
              { id: 'loc-rad-temple-r-eye', label: { de: 'Beginnt im Nacken und setzt sich über dem rechten Auge fest (Sanguinaria)', en: 'Starts in neck and settles over right eye', es: 'Empieza en la nuca y se fija en el ojo derecho', fr: 'Débute à la nuque et se fixe sur l\'œil droit', it: 'Inizia alla nuca e si fissa sull\'occhio destro', el: 'Ξεκινά από τον αυχένα και κάθεται πάνω από το δεξί μάτι', ru: 'Начинается с затылка и фиксируется над правым глазом' } },
              { id: 'loc-rad-temple-r-teeth', label: { de: 'Strahlt in Zähne, Wange oder rechten Kiefer aus', en: 'Radiates into teeth, cheek or right jaw', es: 'Irradia a dientes, mejilla o mandíbula derecha', fr: 'Irradie aux dents, joue ou mâchoire droite', it: 'Irradia a denti, guancia o mascella destra', el: 'Αντανακλά σε δόντια, μάγουλο ή δεξιά γνάθο', ru: 'Иррадиирует в зубы, щеку или правую челюсть' } },
              { id: 'loc-rad-temple-r-fixed', label: { de: 'Bleibt scharf begrenzt in der rechten Schläfe (nagelartiger Schmerz)', en: 'Strictly localized in right temple (nail-like pain)', es: 'Estrictamente circunscrito en sien derecha (como un clavo)', fr: 'Strictement circonscrit à la tempe droite (comme un clou)', it: 'Strettamente circoscritto alla tempia destra (come un chiodo)', el: 'Αυστηρά περιορισμένος στον δεξιό κρόταφο (σαν καρφί)', ru: 'Строго ограничен в правом виске (как гвоздь)' } }
            ]
          },
          {
            id: 'loc-temple-left',
            label: {
              de: 'Linke Schläfe (einseitig links)',
              en: 'Left temple (one-sided left)',
              es: 'Sien izquierda (unilateral izquierdo)',
              fr: 'Tempe gauche (unilatéral gauche)',
              it: 'Tempia sinistra (unilaterale sinistro)',
              el: 'Αριστερός κρόταφος (μονόπλευρα αριστερά)',
              ru: 'Левый висок (односторонне слева)'
            },
            remedyHints: ['spigelia-anthelmia', 'lachesis-mutus', 'sepia-officinalis'],
            tier3Options: [
              { id: 'loc-rad-temple-l-eye', label: { de: 'Zieht vom Hinterkopf über die linke Schläfe ins linke Auge (Spigelia)', en: 'Pulls from occiput across left temple into left eye', es: 'Tira del occipucio por la sien al ojo izquierdo', fr: 'Tire de l\'occiput vers l\'œil gauche via la tempe', it: 'Tira dall\'occipite all\'occhio sinistro via tempia', el: 'Τραβά από το ινίο μέσω αριστερού κροτάφου στο αριστερό μάτι', ru: 'Тянет от затылка через левый висок в левый глаз' } },
              { id: 'loc-rad-temple-l-fixed', label: { de: 'Bleibt streng punktuell in der linken Schläfe', en: 'Strictly localized in left temple', es: 'Permanece puntualmente fijo en la sien izquierda', fr: 'Reste strictement ponctuel à la tempe gauche', it: 'Resta strettamente puntuale alla tempia sinistra', el: 'Παραμένει αυστηρά σημειακό στον αριστερό κρόταφο', ru: 'Остается строго точечным в левом виске' } }
            ]
          },
          {
            id: 'loc-occiput-neck',
            label: {
              de: 'Hinterkopf (Okziput) & Nacken',
              en: 'Occiput & Nape of neck',
              es: 'Occipucio y nuca',
              fr: 'Occiput et nuque',
              it: 'Occipite e nuca',
              el: 'Ινίο & αυχένας',
              ru: 'Затылок и задняя часть шеи'
            },
            remedyHints: ['gelsemium-sempervirens', 'silicea', 'cimicifuga-racemosa', 'cocculus-indicus'],
            tier3Options: [
              { id: 'loc-rad-occiput-forward', label: { de: 'Steigt vom Nacken auf und zieht wie eine Kappe nach vorne zur Stirn', en: 'Ascends from nape and pulls forward like a cap over forehead', es: 'Sube de la nuca y tira hacia adelante como un casco', fr: 'Monte de la nuque vers l\'avant comme une calotte', it: 'Sale dalla nuca in avanti come una cuffia verso la fronte', el: 'Ανεβαίνει από τον αυχένα προς τα εμπρός σαν κάλυμμα στο μέτωπο', ru: 'Поднимается с затылка вперед на лоб как шлем' } },
              { id: 'loc-rad-occiput-shoulders', label: { de: 'Strahlt nach unten in die Schultern & oberen Rücken aus', en: 'Radiates downwards into shoulders & upper back', es: 'Irradia hacia abajo a los hombros y espalda', fr: 'Irradie vers le bas dans les épaules et le haut du dos', it: 'Irradia verso il basso nelle spalle e dorso', el: 'Αντανακλά προς τα κάτω στους ώμους & άνω πλάτη', ru: 'Иррадиирует вниз в плечи и верхнюю часть спины' } },
              { id: 'loc-rad-occiput-fixed', label: { de: 'Sitzt steif und unbeweglich fest am Hinterhauptsansatz', en: 'Strictly localized stiffness at occipital base', es: 'Fijo y rígido en la base del occipucio', fr: 'Bloqué et rigide à la base de l\'occiput', it: 'Bloccato e rigido alla base dell\'occipite', el: 'Αγκυλωμένο και ακίνητο στη βάση του ινίου', ru: 'Жестко фиксирован у основания затылка' } }
            ]
          },
          {
            id: 'loc-vertex-crown',
            label: {
              de: 'Scheitel (Vertex) / Kopfmitte / Tief innen',
              en: 'Vertex / Top of head / Deep inside',
              es: 'Vértice / Cima de la cabeza / Profundo dentro',
              fr: 'Sommet du crâne (vertex) / Au fond de la tête',
              it: 'Vertice / Sommità del capo / Profondo all\'interno',
              el: 'Κορυφή της κεφαλής (vertex) / Εν τω βάθει',
              ru: 'Темечко / макушка головы / глубоко внутри'
            },
            remedyHints: ['sulphur', 'lachesis-mutus', 'calcarea-carbonica', 'actaea-racemosa'],
            tier3Options: [
              { id: 'loc-rad-vertex-diffuse', label: { de: 'Drückt von innen heraus, als würde der Schädel zersprengt', en: 'Presses from inside out as if skull would burst', es: 'Presiona de dentro afuera como si fuera a estallar', fr: 'Pousse de l\'intérieur comme si le crâne éclatait', it: 'Preme dall\'interno come se il cranio scoppiasse', el: 'Πιέζει από μέσα προς τα έξω σαν να σπάει το κρανίο', ru: 'Давит изнутри наружу, будто череп разорвется' } },
              { id: 'loc-rad-vertex-fixed', label: { de: 'Streng auf einem zentimetergroßen Punkt am Scheitel fixiert', en: 'Strictly fixed on a tiny point on the crown', es: 'Fijado estrictamente en un punto de la coronilla', fr: 'Strictement fixé sur un point au sommet du crâne', it: 'Strettamente fissato su un punto della cima della testa', el: 'Αυστηρά εντοπισμένο σε ένα σημείο στην κορυφή', ru: 'Строго зафиксировано в одной точке на макушке' } }
            ]
          },
          {
            id: 'loc-wandering-sides',
            label: {
              de: 'Wandernder Schmerz / Wechselt die Seite (rechts ⇄ links)',
              en: 'Wandering pain / Shifts sides (right ⇄ left)',
              es: 'Dolor errático / Cambia de lado (derecha ⇄ izquierda)',
              fr: 'Douleur erratique / Change de côté (droite ⇄ gauche)',
              it: 'Dolore erratico / Cambia lato (destra ⇄ sinistra)',
              el: 'Πλανώμενος πόνος / Αλλάζει πλευρά (δεξιά ⇄ αριστερά)',
              ru: 'Блуждающая боль / меняет сторону (справа ⇄ слева)'
            },
            remedyHints: ['pulsatilla-pratensis', 'lac-caninum', 'phytolacca-decandra', 'berberis-vulgaris'],
            tier3Options: [
              { id: 'loc-rad-wandering-alternating', label: { de: 'Wechselt täglich oder stündlich von einer Seite zur anderen', en: 'Changes from one side to the other daily or hourly', es: 'Cambia de un lado a otro a diario o por horas', fr: 'Passe d\'un côté à l\'autre chaque jour ou heure', it: 'Passa da un lato all\'altro ogni giorno o ora', el: 'Αλλάζει πλευρά καθημερινά ή ανά ώρα', ru: 'Переходит с одной стороны на другую ежедневно или ежечасно' } },
              { id: 'loc-rad-wandering-jumping', label: { de: 'Springt plötzlich an völlig andere Stellen', en: 'Jumps suddenly to entirely different locations', es: 'Salta súbitamente a lugares completamente distintos', fr: 'Saute brusquement vers d\'autres endroits', it: 'Salta improvvisamente in punti completamente diversi', el: 'Μεταπηδά ξαφνικά σε εντελώς διαφορετικά σημεία', ru: 'Внезапно перескакивает на совершенно другие места' } }
            ]
          }
        ]
      }
    ]
  },

  // SÄULE 2: WAS? (Empfindung, Schmerzqualität, Charakter)
  sensation: {
    pillar: 'sensation',
    leadQuestion: {
      de: 'Wie fühlt sich der Schmerz oder die Empfindung genau an?',
      en: 'What does the pain or sensation feel like exactly?',
      es: '¿Cómo se siente exactamente el dolor o la sensación?',
      fr: 'Quelle est la nature exacte de la douleur ou sensation ?',
      it: 'Come si manifesta esattamente la sensazione o il dolore?',
      el: 'Πώς ακριβώς νιώθετε τον πόνο ή την αίσθηση;',
      ru: 'Каков точный характер боли или ощущения?'
    },
    categories: [
      {
        id: 'sens-cat-cramp',
        label: {
          de: 'Krampfartig, Kolikartig & Zusammenziehend',
          en: 'Cramping, Colicky & Constricting',
          es: 'Cólico, espasmódico y constrictivo',
          fr: 'Spasmodique, colique et constrictif',
          it: 'Spasmodico, colico e costrittivo',
          el: 'Σπασμωδικός, κολικοειδής & σφικτικός',
          ru: 'Спастическая, коликообразная и сжимающая'
        },
        tier2Options: [
          {
            id: 'sens-clutching-grip',
            label: {
              de: 'Zusammenpressend wie eine eiserne Faust / Klaue',
              en: 'Grip like an iron fist / claw',
              es: 'Como un puño de hierro apretando',
              fr: 'Serrement comme par un étau / une griffe de fer',
              it: 'Come un pugno di ferro che stringe',
              el: 'Σαν σιδερένια γροθιά που σφίγγει',
              ru: 'Как железный кулак или когти'
            },
            remedyHints: ['cactus-grandiflorus', 'colocynthis', 'magnesium-phosphoricum'],
            tier3Options: [
              { id: 'sens-paroxysmal', label: { de: 'Anfallsweise einschießend mit schmerzfreien Pausen', en: 'Paroxysmal with pain-free intervals', es: 'En crisis con intervalos sin dolor', fr: 'Par crises avec intervalles libres', it: 'A crisi con intervalli liberi', el: 'Κατά παροξυσμούς με ελεύθερα διαστήματα', ru: 'Приступообразно с перерывами' } },
              { id: 'sens-continuous-cramp', label: { de: 'Anhaltender, ununterbrochener Krampfzustand', en: 'Constant uninterrupted spasm', es: 'Espasmo continuo sin pausa', fr: 'Spasme continu sans répit', it: 'Spasmo continuo', el: 'Συνεχής αδιάκοπος σπασμός', ru: 'Постоянный непрерывный спазм' } }
            ]
          },
          {
            id: 'sens-colic-violent',
            label: {
              de: 'Heftige Bauchkolik zwingt zum Zusammenkrümmen',
              en: 'Violent colic forcing patient to bend double',
              es: 'Cólico violento que obliga a doblarse',
              fr: 'Colique violente forçant à se plier en deux',
              it: 'Colica violenta che costringe a piegarsi',
              el: 'Βίαιος κολικός που αναγκάζει σε δίπλωμα στα δύο',
              ru: 'Острая колика, заставляющая согнуться пополам'
            },
            remedyHints: ['colocynthis', 'magnesium-phosphoricum', 'dioscorea-villosa', 'chamomilla']
          }
        ]
      },
      {
        id: 'sens-cat-burn-heat',
        label: {
          de: 'Brennend, Heiß & Glühend',
          en: 'Burning, Hot & Glowing',
          es: 'Ardiente, caliente y abrasador',
          fr: 'Brûlant, chaud et incandescent',
          it: 'Bruciante, caldo e rovente',
          el: 'Καυστικός, θερμός & πυρώδης',
          ru: 'Жгучая, горячая и пылающая'
        },
        tier2Options: [
          {
            id: 'sens-burn-coals',
            label: {
              de: 'Brennend wie glühende Kohlen',
              en: 'Burning like red-hot coals',
              es: 'Como brasas ardientes',
              fr: 'Comme des charbons ardents',
              it: 'Come carboni ardenti',
              el: 'Καυστικός σαν αναμμένα κάρβουνα',
              ru: 'Жжение как от раскаленных углей'
            },
            remedyHints: ['arsenicum-album', 'phosphorus', 'sulphur', 'cantharis']
          },
          {
            id: 'sens-burn-acrid-pyrosis',
            label: {
              de: 'Ätzendes, saures Brennen (Sodbrennen)',
              en: 'Acrid, sour burning (Heartburn / Pyrosis)',
              es: 'Ardor ácido y corrosivo (Acidez)',
              fr: 'Brûlure acide et corrosive (Aigreurs)',
              it: 'Bruciore acido e corrosivo (Pirosi)',
              el: 'Δριμύ, όξινο κάψιμο (καούρες)',
              ru: 'Едкое кислое жжение (изжога)'
            },
            remedyHints: ['iris-versicolor', 'robinia-pseudoacacia', 'nux-vomica', 'pulsatilla']
          }
        ]
      },
      {
        id: 'sens-cat-sharp-stitch',
        label: {
          de: 'Stechend, Schneidend & Scharf',
          en: 'Stitching, Cutting & Sharp',
          es: 'Punzante, cortante y agudo',
          fr: 'Piquant, coupant et acéré',
          it: 'Pungente, tagliente e acuto',
          el: 'Οξύς, διαξιφιστικός, κοφτερός & σαν βελόνες',
          ru: 'Колющая, режущая и острая'
        },
        tier2Options: [
          {
            id: 'sens-needle-knife',
            label: {
              de: 'Wie Nadelstiche oder scharfe Messerstiche',
              en: 'Like needle pricks or sharp knife stabs',
              es: 'Como pinchazos de aguja o puñaladas',
              fr: 'Comme des aiguilles ou coups de poignard',
              it: 'Come punture di spilli o stilettate',
              el: 'Σαν τσιμπήματα βελόνας ή μαχαιριές',
              ru: 'Как уколы иглы или удары ножом'
            },
            remedyHints: ['bryonia-alba', 'kali-carbonicum', 'apis-mellifica']
          },
          {
            id: 'sens-cutting-knife',
            label: {
              de: 'Schneidend wie mit Glasscherben / Klingen',
              en: 'Cutting as from glass shards / razors',
              es: 'Cortante como cristales rotos',
              fr: 'Coupant comme du verre brisé',
              it: 'Tagliente come vetri rotti',
              el: 'Κοφτερός σαν σπασμένα γυαλιά',
              ru: 'Режущая как осколками стекла'
            },
            remedyHints: ['nitricum-acidum', 'colocynthis', 'staphisagria']
          }
        ]
      },
      {
        id: 'sens-cat-throbbing-bursting',
        label: {
          de: 'Pochend, Pulsierend, Berstend & Völle',
          en: 'Throbbing, Pulsating, Bursting & Fullness',
          es: 'Pulsátil, palpitante y sensación de estallido',
          fr: 'Pulsatile, battant et sensation d\'éclatement',
          it: 'Pulsante, martellante e senso di scoppio',
          el: 'Σφύζων, παλμικός & διαρρηκτικός',
          ru: 'Пульсирующая, бьющаяся и распирающая'
        },
        tier2Options: [
          {
            id: 'sens-throbbing-pulse',
            label: {
              de: 'Hämmernd / pochend im Takt des Pulses',
              en: 'Hammering / throbbing synchronously with pulse',
              es: 'Martilleante al ritmo del pulso',
              fr: 'Battant au rythme du pouls',
              it: 'Martellante col battito cardiaco',
              el: 'Σφυροκόπημα στον ρυθμό του σφυγμού',
              ru: 'Молотящая в такт пульсу'
            },
            remedyHints: ['belladonna', 'glonoinum', 'melilotus-officinalis']
          },
          {
            id: 'sens-bursting-fullness',
            label: {
              de: 'Völle wie kurz vor dem Platzen / Zersprengen',
              en: 'Fullness as if about to burst / explode',
              es: 'Plenitud como si fuera a reventar',
              fr: 'Plénitude comme prête à éclater',
              it: 'Pienezza come sul punto di scoppiare',
              el: 'Πληρότητα σαν να πρόκειται να σπάσει',
              ru: 'Чувство распирания, будто сейчас лопнет'
            },
            remedyHints: ['carbo-vegetabilis', 'lycopodium-clavatum', 'china-officinalis', 'nux-vomica']
          }
        ]
      }
    ]
  },

  // SÄULE 3: WANN / MODALITÄTEN (Bedingungen OHNE TABS! Ebene 1 = Faktor, Ebene 2 = Nuance, Ebene 3 = Besser/Schlechter)
  modalities: {
    pillar: 'modalities',
    leadQuestion: {
      de: 'Unter welchen Bedingungen verbessert (>) oder verschlimmert (<) sich die Beschwerde spürbar?',
      en: 'Under which conditions does the complaint noticeably improve (>) or worsen (<)?',
      es: '¿En qué condiciones mejora (>) o empeora (<) la molestia notablemente?',
      fr: 'Dans quelles circonstances la douleur s\'améliore-t-elle (>) ou s\'aggrave-t-elle (<) ?',
      it: 'In quali condizioni il disturbo migliora (>) o peggiora (<) sensibilmente?',
      el: 'Υπό ποιες συνθήκες η ενόχληση βελτιώνεται (>) ή επιδεινώνεται (<);',
      ru: 'При каких условиях жалоба заметно облегчается (>) или ухудшается (<)?'
    },
    categories: [
      {
        id: 'mod-cat-motion-rest',
        label: {
          de: 'Bewegung, Lage & Erschütterung',
          en: 'Motion, Position & Jarring',
          es: 'Movimiento, postura y sacudida',
          fr: 'Mouvement, position et secousse',
          it: 'Movimento, posizione e scosse',
          el: 'Κίνηση, στάση σώματος & κραδασμοί',
          ru: 'Движение, положение тела и сотрясение'
        },
        tier2Options: [
          {
            id: 'mod-slightest-motion',
            label: {
              de: 'Geringste Bewegung / Erschütterung des Körpers',
              en: 'Slightest motion / jarring of body',
              es: 'El menor movimiento o sacudida',
              fr: 'Le moindre mouvement ou secousse',
              it: 'Il minimo movimento o scossa',
              el: 'Παραμικρή κίνηση ή τράνταγμα',
              ru: 'Малейшее движение или сотрясение'
            },
            remedyHints: ['bryonia-alba', 'belladonna'],
            tier3Options: [
              { id: 'mod-effect-motion-worse', label: { de: 'Verschlimmert massiv (zwingt zu absoluter Ruhe)', en: 'Aggravates severely (demands absolute rest)', es: 'Empeora mucho (obliga al reposo absoluto)', fr: 'Aggrave nettement (impose le repos absolu)', it: 'Peggiora molto (costringe al riposo assoluto)', el: 'Επιδεινώνει έντονα (επιβάλλει απόλυτη ηρεμία)', ru: 'Резко ухудшает (вынуждает к абсолютному покою)' }, direction: 'worse' },
              { id: 'mod-effect-motion-better', label: { de: 'Bringt Erleichterung (fortgesetzte Bewegung bessert)', en: 'Relieves (continued motion relieves)', es: 'Alivia con movimiento continuo', fr: 'Soulage en bougeant (mouvement continu)', it: 'Migliora muovendosi (movimento continuo)', el: 'Βελτιώνει με τη συνεχή κίνηση', ru: 'Облегчает при движении (продолжительное движение)' }, direction: 'better' }
            ]
          },
          {
            id: 'mod-bending-double',
            label: {
              de: 'Zusammenkrümmen / Vorbeugen der Oberschenkel',
              en: 'Bending double / drawing up legs',
              es: 'Doblarse en dos / recoger las piernas',
              fr: 'Se plier en deux / remonter les jambes',
              it: 'Piegarsi in due / raccogliere le gambe',
              el: 'Δίπλωμα στα δύο / μάζεμα των ποδιών',
              ru: 'Сгибание пополам / подтягивание ног'
            },
            remedyHints: ['colocynthis', 'magnesium-phosphoricum'],
            tier3Options: [
              { id: 'mod-effect-bend-better', label: { de: 'Bessert die Kolik spürbar (Colocynthis-Leitsymptom)', en: 'Relieves colic noticeably (Colocynthis hallmark)', es: 'Mejora el cólico notablemente (Colocynthis)', fr: 'Améliore nettement la colique (Colocynthis)', it: 'Migliora nettamente la colica (Colocynthis)', el: 'Βελτιώνει αισθητά τον κολικό (βασικό σύμπτωμα Colocynthis)', ru: 'Заметно облегчает колику (ключевой симптом Colocynthis)' }, direction: 'better' },
              { id: 'mod-effect-bend-worse', label: { de: 'Streckung bessert / Krümmen verschlimmert (Dioscorea)', en: 'Stretching relieves / bending worsens (Dioscorea)', es: 'Estirarse mejora / doblarse empeora (Dioscorea)', fr: 'S\'étirer soulage / se plier aggrave (Dioscorea)', it: 'Distendersi migliora / piegarsi peggiora (Dioscorea)', el: 'Επιδεινώνει με το δίπλωμα (μόνο το τέντωμα ανακουφίζει - Dioscorea)', ru: 'Разгибание облегчает / сгибание ухудшает (Dioscorea)' }, direction: 'worse' }
            ]
          }
        ]
      },
      {
        id: 'mod-cat-temperature-weather',
        label: {
          de: 'Temperatur, Wärme & Kälte',
          en: 'Temperature, Warmth & Cold',
          es: 'Temperatura, calor y frío',
          fr: 'Température, chaleur et froid',
          it: 'Temperatura, calore e freddo',
          el: 'Θερμοκρασία, ζέστη & κρύο',
          ru: 'Температура, тепло и холод'
        },
        tier2Options: [
          {
            id: 'mod-warmth-applications',
            label: {
              de: 'Äußere Wärme (Wärmflasche / heiße Umschläge)',
              en: 'External warmth (Hot water bottle / warm wraps)',
              es: 'Calor externo (Bolsa de agua caliente)',
              fr: 'Chaleur externe (Bouillotte / compresses chaudes)',
              it: 'Calore esterno (Borsa d\'acqua calda)',
              el: 'Εξωτερική ζέστη (θερμοφόρα / ζεστά επιθέματα)',
              ru: 'Внешнее тепло (грелка / горячие компрессы)'
            },
            remedyHints: ['magnesium-phosphoricum', 'arsenicum-album', 'nux-vomica'],
            tier3Options: [
              { id: 'mod-effect-warmth-better', label: { de: 'Bessert Beschwerden augenblicklich', en: 'Relieves complaints immediately', es: 'Mejora de inmediato', fr: 'Soulage immédiatement', it: 'Migliora immediatamente', el: 'Βελτιώνει αμέσως', ru: 'Мгновенно облегчает' }, direction: 'better' },
              { id: 'mod-effect-warmth-worse', label: { de: 'Hitze unerträglich / Kälte verlangt (Apis / Pulsatilla)', en: 'Heat unbearable / seeks cold (Apis / Pulsatilla)', es: 'Calor insoportable / pide frío (Apis / Pulsatilla)', fr: 'Chaleur insupportable / recherche le froid (Apis / Pulsatilla)', it: 'Calore insopportabile / cerca il freddo (Apis / Pulsatilla)', el: 'Αφόρητη ζέστη / ζητά κρύο (Apis / Pulsatilla)', ru: 'Жара невыносима / просит холода (Apis / Pulsatilla)' }, direction: 'worse' }
            ]
          },
          {
            id: 'mod-fresh-air',
            label: {
              de: 'Frische kühle Luft / Geöffnete Fenster',
              en: 'Fresh cool air / Open windows',
              es: 'Aire fresco / Ventanas abiertas',
              fr: 'Air frais / Fenêtres ouvertes',
              it: 'Aria fresca / Finestre aperte',
              el: 'Δροσερός καθαρός αέρας / Ανοιχτά παράθυρα',
              ru: 'Свежий прохладный воздух / открытые окна'
            },
            remedyHints: ['pulsatilla-pratensis', 'carbo-vegetabilis'],
            tier3Options: [
              { id: 'mod-effect-air-better', label: { de: 'Bessert deutlich (braucht kühle Luft zum Atmen)', en: 'Relieves markedly (craves cool air to breathe)', es: 'Mejora claramente (necesita aire fresco)', fr: 'Améliore nettement (besoin d\'air frais)', it: 'Migliora nettamente (ha bisogno di aria fresca)', el: 'Βελτιώνει έντονα (χρειάζεται δροσερό αέρα)', ru: 'Заметно облегчает (нуждается в прохладном воздухе)' }, direction: 'better' },
              { id: 'mod-effect-air-worse', label: { de: 'Zugluft / Kälteempfindlichkeit verschlimmert', en: 'Draft / chilling worsens', es: 'Corrientes de aire y frío empeoran', fr: 'Courants d\'air et froid aggravent', it: 'Correnti d\'aria e freddo peggiorano', el: 'Ρεύματα αέρα & ευαισθησία στο κρύο επιδεινώνουν', ru: 'Сквозняк и холод ухудшают' }, direction: 'worse' }
            ]
          }
        ]
      },
      {
        id: 'mod-cat-pressure-touch',
        label: {
          de: 'Druck, Berührung & Kleidung',
          en: 'Pressure, Touch & Clothing',
          es: 'Presión, tacto y ropa',
          fr: 'Pression, toucher et vêtements',
          it: 'Pressione, tocco e abiti',
          el: 'Πίεση, άγγιγμα & ρούχα',
          ru: 'Давление, прикосновение и одежда'
        },
        tier2Options: [
          {
            id: 'mod-hard-pressure',
            label: {
              de: 'Starker, harter Gegendruck (Hände auf den Bauch gepresst)',
              en: 'Hard, firm pressure (Hands pressed against abdomen)',
              es: 'Presión fuerte y firme con las manos',
              fr: 'Forte pression appuyée avec les mains',
              it: 'Forte pressione decisa con le mani',
              el: 'Δυνατή πίεση με τα χέρια στην κοιλιά',
              ru: 'Сильное твердое давление руками на живот'
            },
            remedyHints: ['colocynthis', 'bryonia-alba', 'magnesium-phosphoricum'],
            tier3Options: [
              { id: 'mod-effect-hard-press-better', label: { de: 'Bessert den Schmerz deutlich', en: 'Relieves pain distinctly', es: 'Mejora el dolor claramente', fr: 'Soulage nettement la douleur', it: 'Migliora nettamente il dolore', el: 'Βελτιώνει αισθητά τον πόνο', ru: 'Заметно облегчает боль' }, direction: 'better' },
              { id: 'mod-effect-hard-press-worse', label: { de: 'Selbst sanfter Druck unerträglich', en: 'Even gentle pressure intolerable', es: 'Incluso la presión suave es intolerable', fr: 'Même une légère pression est intolérable', it: 'Perfino la minima pressione è intollerabile', el: 'Αφόρητη ακόμα και η απαλή πίεση', ru: 'Даже легкое давление невыносимо' }, direction: 'worse' }
            ]
          },
          {
            id: 'mod-tight-clothes',
            label: {
              de: 'Eng anliegende Kleidung / Hosenbund',
              en: 'Tight clothing / waistband',
              es: 'Ropa ajustada / cinturón',
              fr: 'Vêtements serrés / ceinture',
              it: 'Abiti stretti / cintura',
              el: 'Στενά ρούχα / ζώνη',
              ru: 'Тесная одежда / пояс'
            },
            remedyHints: ['lachesis-mutus', 'lycopodium-clavatum', 'nux-vomica'],
            tier3Options: [
              { id: 'mod-effect-tight-worse', label: { de: 'Muss Kleidung öffnen / Lockern bringt Erleichterung', en: 'Must unbutton / loosening relieves', es: 'Debe desabrocharse la ropa / aflojar alivia', fr: 'Doit déboutonner ses vêtements / desserrer soulage', it: 'Deve allentare i vestiti / allentare dà sollievo', el: 'Πρέπει να χαλαρώσει τα ρούχα / το ξεκούμπωμα ανακουφίζει', ru: 'Должен расстегнуть одежду / ослабление приносит облегчение' }, direction: 'worse' }
            ]
          }
        ]
      },
      {
        id: 'mod-cat-time-food',
        label: {
          de: 'Tageszeit, Mahlzeiten & Schlaf',
          en: 'Time of day, Meals & Sleep',
          es: 'Hora del día, comidas y sueño',
          fr: 'Heure de la journée, repas et sommeil',
          it: 'Ora del giorno, pasti e sonno',
          el: 'Ώρα της ημέρας, γεύματα & ύπνος',
          ru: 'Время суток, прием пищи и сон'
        },
        tier2Options: [
          {
            id: 'mod-after-eating-sp',
            label: {
              de: 'Nach dem Essen / nach den Mahlzeiten',
              en: 'After eating / after meals',
              es: 'Después de comer / comidas',
              fr: 'Après le repas',
              it: 'Dopo mangiato / pasti',
              el: 'Μετά το φαγητό / γεύματα',
              ru: 'После еды / приемов пищи'
            },
            remedyHints: ['nux-vomica', 'pulsatilla-pratensis', 'lycopodium-clavatum', 'anacardium-orientale'],
            tier3Options: [
              { id: 'mod-effect-eating-worse', label: { de: 'Verschlimmert sofort oder 1-2h nach dem Essen', en: 'Worsens immediately or 1-2h after eating', es: 'Empeora inmediatamente o 1-2h después de comer', fr: 'Aggrave immédiatement ou 1-2h après avoir mangé', it: 'Peggiora subito o 1-2 ore dopo mangiato', el: 'Επιδεινώνει αμέσως ή 1-2 ώρες μετά το φαγητό', ru: 'Ухудшает сразу или через 1-2 часа после еды' }, direction: 'worse' },
              { id: 'mod-effect-eating-better', label: { de: 'Essen lindert vorübergehend den Schmerz (Anacardium)', en: 'Eating temporarily relieves pain (Anacardium)', es: 'Comer alivia temporalmente el dolor (Anacardium)', fr: 'Manger soulage temporairement la douleur (Anacardium)', it: 'Mangiare allevia temporaneamente il dolore (Anacardium)', el: 'Το φαγητό ανακουφίζει προσωρινά τον πόνο (Anacardium)', ru: 'Еда временно облегчает боль (Anacardium)' }, direction: 'better' }
            ]
          },
          {
            id: 'mod-periodic-time',
            label: {
              de: 'Spezifische Uhrzeit / Periodizität',
              en: 'Specific time of day / Periodicity',
              es: 'Hora específica del día',
              fr: 'Horaire spécifique',
              it: 'Orario specifico',
              el: 'Συγκεκριμένη ώρα της ημέρας',
              ru: 'Определенное время суток'
            },
            remedyHints: ['arsenicum-album', 'lycopodium-clavatum', 'nux-vomica', 'kali-carbonicum'],
            tier3Options: [
              { id: 'mod-effect-night-1-2', label: { de: 'Nachts 1:00 – 2:00 Uhr (Arsenicum-Maximum)', en: 'Night 1:00 – 2:00 AM (Arsenicum)', es: 'Noche 1:00 – 2:00 (Arsenicum)', fr: 'Nuit 1h – 2h (Arsenicum)', it: 'Notte 1:00 – 2:00 (Arsenicum)', el: 'Νύχτα 1:00 – 2:00 π.μ. (μέγιστο Arsenicum)', ru: 'Ночью 1:00 – 2:00 (максимум Arsenicum)' }, direction: 'worse' },
              { id: 'mod-effect-night-3-4', label: { de: 'Nachts 3:00 – 4:00 Uhr (Nux vomica / Kali carb)', en: 'Night 3:00 – 4:00 AM (Nux-v / Kali-c)', es: 'Noche 3:00 – 4:00 (Nux-v / Kali-c)', fr: 'Nuit 3h – 4h (Nux-v / Kali-c)', it: 'Notte 3:00 – 4:00 (Nux-v / Kali-c)', el: 'Νύχτα 3:00 – 4:00 π.μ. (Nux-v / Kali-c)', ru: 'Ночью 3:00 – 4:00 (Nux-v / Kali-c)' }, direction: 'worse' },
              { id: 'mod-effect-afternoon-4-8', label: { de: 'Nachmittags 16:00 – 20:00 Uhr (Lycopodium-Maximum)', en: 'Afternoon 4:00 – 8:00 PM (Lycopodium)', es: 'Tarde 16:00 – 20:00 (Lycopodium)', fr: 'Après-midi 16h – 20h (Lycopodium)', it: 'Pomeriggio 16:00 – 20:00 (Lycopodium)', el: 'Απόγευμα 16:00 – 20:00 (μέγιστο Lycopodium)', ru: 'Вечером 16:00 – 20:00 (максимум Lycopodium)' }, direction: 'worse' }
            ]
          }
        ]
      }
    ]
  },

  // SÄULE 4: WODURCH? (Kausal-Auslöser & Zeitbezug)
  causa: {
    pillar: 'causa',
    leadQuestion: {
      de: 'Welches Ereignis oder welche Einwirkung ging den Beschwerden unmittelbar voraus?',
      en: 'What event or influence immediately preceded the onset of complaints?',
      es: '¿Qué acontecimiento o influencia precedió directamente al inicio de las molestias?',
      fr: 'Quel événement ou influence a directement précédé l\'apparition des troubles ?',
      it: 'Quale evento o influenza ha preceduto direttamente l\'insorgenza dei disturbi?',
      el: 'Ποιο γεγονός ή επίδραση προηγήθηκε άμεσα της έναρξης των ενοχλήσεων;',
      ru: 'Какое событие или воздействие непосредственно предшествовало началу жалоб?'
    },
    categories: [
      {
        id: 'causa-cat-emotion',
        label: {
          de: 'Gemütsregung, Ärger, Schreck & Kränkung',
          en: 'Emotion, Anger, Fright & Mortification',
          es: 'Emoción, ira, susto y agravio',
          fr: 'Émotion, colère, frayeur et contrariété',
          it: 'Emozione, collera, spavento e risentimento',
          el: 'Συναίσθημα, θυμός, τρόμος & προσβολή',
          ru: 'Эмоции, гнев, испуг и обида'
        },
        tier2Options: [
          {
            id: 'causa-suppressed-anger',
            label: {
              de: 'Unterdrückter Ärger / Stiller Groll & Herunterschlucken',
              en: 'Suppressed anger / Silent grief & swallowing down',
              es: 'Ira reprimida / Rencor silencioso',
              fr: 'Colère rentrée / Ressentiment silencieux',
              it: 'Rabbia repressa / Rancore silenzioso',
              el: 'Καταπιεσμένος θυμός / Βουβή πικρία',
              ru: 'Подавленный гнев / скрытая обида'
            },
            remedyHints: ['staphisagria', 'ignatia-amara', 'colocynthis', 'lycopodium-clavatum'],
            tier3Options: [
              { id: 'causa-effect-immed-worse', label: { de: 'Hat Schmerz unmittelbar ausgelöst', en: 'Immediately triggered the pain', es: 'Desencadenó el dolor de inmediato', fr: 'A déclenché la douleur immédiatement', it: 'Ha scatenato il dolore immediatamente', el: 'Πυροδότησε άμεσα τον πόνο', ru: 'Мгновенно вызвало боль' }, direction: 'worse' },
              { id: 'causa-effect-delayed-worse', label: { de: 'Trat ca. 1–2 Stunden zeitverzögert auf', en: 'Occurred with 1-2h delay', es: 'Apareció 1-2h después', fr: 'Apparu 1-2h plus tard', it: 'Comparso 1-2h dopo', el: 'Εμφανίστηκε με καθυστέρηση 1-2 ωρών', ru: 'Появилось через 1-2 часа' }, direction: 'worse' }
            ]
          },
          {
            id: 'causa-violent-anger',
            label: {
              de: 'Heftiger Zornausbruch mit Aufbrausen & Schreien',
              en: 'Violent fit of anger with yelling & outbursts',
              es: 'Ataque violento de ira con gritos',
              fr: 'Crise de colère violente avec cris',
              it: 'Attacco violento di collera con urla',
              el: 'Βίαιο ξέσπασμα θυμού με φωνές',
              ru: 'Вспышка ярости с криками и возмущением'
            },
            remedyHints: ['chamomilla', 'nux-vomica', 'bryonia-alba'],
            tier3Options: [
              { id: 'causa-effect-immed-fury', label: { de: 'Magen- / Bauchkolik direkt während des Wutanfalls', en: 'Colic right during the fit of rage', es: 'Cólico durante el ataque de ira', fr: 'Colique pendant la colère', it: 'Colica durante l\'attacco di rabbia', el: 'Κολικός άμεσα κατά το ξέσπασμα', ru: 'Колика прямо во время приступа ярости' }, direction: 'worse' }
            ]
          },
          {
            id: 'causa-fright-shock',
            label: {
              de: 'Plötzlicher Schreck / Schock / Schlimme Nachricht',
              en: 'Sudden fright / shock / bad news',
              es: 'Susto repentino / shock / malas noticias',
              fr: 'Frayeur soudaine / choc / mauvaise nouvelle',
              it: 'Spavento improvviso / shock / brutte notizie',
              el: 'Ξαφνικός τρόμος / σοκ / δυσάρεστα νέα',
              ru: 'Внезапный испуг / шок / дурные вести'
            },
            remedyHints: ['aconitum-napellus', 'opium', 'gelsemium-sempervirens', 'ignatia-amara']
          }
        ]
      },
      {
        id: 'causa-cat-weather-cold',
        label: {
          de: 'Kälte, Zugluft, Nässe & Wetterumschwung',
          en: 'Cold, Draft, Wetness & Weather change',
          es: 'Frío, corrientes, humedad y cambio de tiempo',
          fr: 'Froid, courants d\'air, humidité et météo',
          it: 'Freddo, correnti d\'aria, umidità e cambio di tempo',
          el: 'Κρύο, ρεύματα αέρα, υγρασία & αλλαγή καιρού',
          ru: 'Холод, сквозняк, сырость и перемена погоды'
        },
        tier2Options: [
          {
            id: 'causa-cold-dry-wind',
            label: {
              de: 'Kalter, trockener Wind (Ostwind / Winterkälte)',
              en: 'Cold dry wind (East wind / sharp winter cold)',
              es: 'Viento frío y seco (Viento del este)',
              fr: 'Vent froid et sec (Vent d\'est)',
              it: 'Vento freddo e asciutto (Vento da est)',
              el: 'Κρύος ξηρός άνεμος (Βοριάς / χειμερινό ψύχος)',
              ru: 'Холодный сухой ветер (северный/восточный ветер)'
            },
            remedyHints: ['aconitum-napellus', 'bryonia-alba', 'hepar-sulfuris'],
            tier3Options: [
              { id: 'causa-effect-sudden-hours', label: { de: 'Plötzlicher, stürmischer Beginn innerhalb weniger Stunden', en: 'Sudden violent onset within hours', es: 'Inicio repentino en pocas horas', fr: 'Début soudain en quelques heures', it: 'Insorgenza improvvisa in poche ore', el: 'Ξαφνική έναρξη εντός ολίγων ωρών', ru: 'Внезапное бурное начало за несколько часов' }, direction: 'worse' }
            ]
          },
          {
            id: 'causa-cold-wet-feet',
            label: {
              de: 'Durchnässung / Nasse Füße / Kaltfeuchtes Wetter',
              en: 'Getting wet / wet cold feet / damp cold weather',
              es: 'Mojarse / pies mojados y fríos / tiempo húmedo',
              fr: 'Trempé / pieds mouillés / temps froid et humide',
              it: 'Bagnarsi / piedi bagnati e freddi / tempo umido',
              el: 'Βρέξιμο / βρεγμένα κρύα πόδια / υγρός καιρός',
              ru: 'Промокание / промоченные холодные ноги / сырость'
            },
            remedyHints: ['dulcamara', 'rhus-toxicodendron', 'pulsatilla-pratensis', 'calcarea-carbonica']
          },
          {
            id: 'causa-ac-draft',
            label: {
              de: 'Klimaanlage / kalte Zugluft im Nacken oder Bauch',
              en: 'Air conditioning / cold draft on neck or abdomen',
              es: 'Aire acondicionado / corriente fría',
              fr: 'Climatisation / courant d\'air froid',
              it: 'Aria condizionata / correnti d\'aria',
              el: 'Κλιματισμός / κρύο ρεύμα στον αυχένα ή την κοιλιά',
              ru: 'Кондиционер / сквозняк на шею или живот'
            },
            remedyHints: ['hepar-sulfuris', 'belladonna', 'silicea']
          }
        ]
      },
      {
        id: 'causa-cat-diet-toxic',
        label: {
          de: 'Ernährung, Genussmittel & Diätfehler',
          en: 'Diet, Stimulants & Indigestion',
          es: 'Dieta, estimulantes y excesos',
          fr: 'Alimentation, excitants et excès',
          it: 'Alimentazione, stimolanti ed eccessi',
          el: 'Διατροφή, διεγερτικά & διαιτητικά σφάλματα',
          ru: 'Питание, стимуляторы и погрешности в диете'
        },
        tier2Options: [
          {
            id: 'causa-heavy-alcohol-party',
            label: {
              de: 'Üppiges Essen, Alkohol, Kaffee & Tabak (Feier / Kater)',
              en: 'Rich heavy food, alcohol, coffee & tobacco (Party / Hangover)',
              es: 'Comida copiosa, alcohol, café y tabaco (Resaca)',
              fr: 'Repas copieux, alcool, café et tabac (Gueule de bois)',
              it: 'Pasto abbondante, alcol, caffè e tabacco (Postbornia)',
              el: 'Βαρύ φαγητό, αλκοόλ, καφές & καπνός (ξενύχτι)',
              ru: 'Тяжелая жирная пища, алкоголь, кофе и табак (похмелье)'
            },
            remedyHints: ['nux-vomica', 'pulsatilla-pratensis', 'arsenicum-album', 'carbo-vegetabilis'],
            tier3Options: [
              { id: 'causa-effect-morning-after', label: { de: 'Schmerz und Übelkeit am nächsten Morgen nach dem Erwachen', en: 'Pain and nausea next morning on waking', es: 'Dolor y náuseas a la mañana siguiente al despertar', fr: 'Douleur et nausée le lendemain matin au réveil', it: 'Dolore e nausea il mattino seguente al risveglio', el: 'Πόνος και ναυτία το επόμενο πρωί μετά το ξύπνημα', ru: 'Боль и тошнота на следующее утро после пробуждения' }, direction: 'worse' }
            ]
          },
          {
            id: 'causa-fatty-pork-pastry',
            label: {
              de: 'Fettes Schweinefleisch / Gebäck / Eiscreme',
              en: 'Fatty pork / rich pastry / ice cream',
              es: 'Cerdo graso / pasteles / helado',
              fr: 'Porc gras / pâtisseries / glaces',
              it: 'Maiale grasso / dolci / gelato',
              el: 'Λιπαρό χοιρινό / γλυκά / παγωτό',
              ru: 'Жирная свинина / сдобная выпечка / мороженое'
            },
            remedyHints: ['pulsatilla-pratensis', 'antimonium-crudum', 'carbo-vegetabilis']
          },
          {
            id: 'causa-spoiled-food',
            label: {
              de: 'Verdorbenes Essen / verdorbenes Fleisch oder Fisch',
              en: 'Spoiled food / tainted meat or fish',
              es: 'Comida en mal estado / carne o pescado pasado',
              fr: 'Aliments avariés / viande ou poisson gâté',
              it: 'Cibo avariato / carne o pesce andati a male',
              el: 'Αλλοιωμένη τροφή / χαλασμένο κρέας ή ψάρι',
              ru: 'Испорченная пища / несвежее мясо или рыба'
            },
            remedyHints: ['arsenicum-album', 'carbo-vegetabilis', 'china-officinalis']
          }
        ]
      },
      {
        id: 'causa-cat-strain-injury',
        label: {
          de: 'Körperliche Überanstrengung, Heben & Trauma',
          en: 'Physical Overexertion, Lifting & Trauma',
          es: 'Sobreesfuerzo físico, levantar peso y traumatismo',
          fr: 'Surmenage physique, port de charges et traumatisme',
          it: 'Sforzo fisico, sollevamento pesi e traumi',
          el: 'Σωματική καταπόνηση, άρση βάρους & τραύμα',
          ru: 'Физическое перенапряжение, подъем тяжестей и травма'
        },
        tier2Options: [
          {
            id: 'causa-lifting-strain',
            label: {
              de: 'Verhebt / schwere Lasten getragen',
              en: 'Strained from lifting / carrying heavy loads',
              es: 'Sobreesfuerzo al levantar cargas pesadas',
              fr: 'Effort en soulevant de lourdes charges',
              it: 'Sforzo nel sollevare carichi pesanti',
              el: 'Καταπόνηση από σήκωμα μεγάλου βάρους',
              ru: 'Надрыв от поднятия тяжестей'
            },
            remedyHints: ['arnica-montana', 'rhus-toxicodendron', 'ruta-graveolens']
          },
          {
            id: 'causa-blunt-blow',
            label: {
              de: 'Stumpfer Schlag / Sturz / Prellung auf den Bauch oder Rücken',
              en: 'Blunt blow / fall / contusion to abdomen or back',
              es: 'Golpe contundente / caída / contusión',
              fr: 'Coup contondant / chute / contusion',
              it: 'Colpo violento / caduta / contusione',
              el: 'Χτύπημα / πτώση / μώλωπας',
              ru: 'Тупой удар / падение / ушиб живота или спины'
            },
            remedyHints: ['arnica-montana', 'bellis-perennis', 'hypericum-perforatum']
          }
        ]
      },
      {
        id: 'causa-cat-no-event',
        label: {
          de: 'Kein erkennbarer Auslöser (Spontaner Beginn)',
          en: 'No noticeable trigger (Spontaneous onset)',
          es: 'Sin desencadenante apreciable (Inicio espontáneo)',
          fr: 'Aucun déclencheur identifiable (Début spontané)',
          it: 'Nessun fattore scatenante riconoscibile',
          el: 'Κανένας εμφανής εκλυτικός παράγοντας (αυτόματη έναρξη)',
          ru: 'Без видимой причины (спонтанное начало)'
        },
        tier2Options: [
          {
            id: 'causa-spontaneous-clean',
            label: {
              de: 'Aus völliger Gesundheit heraus ohne erkennbaren Grund',
              en: 'Out of complete health with no apparent reason',
              es: 'En pleno estado de salud sin causa aparente',
              fr: 'En pleine santé sans raison apparente',
              it: 'In piena salute senza motivo apparente',
              el: 'Εν μέσω πλήρους υγείας χωρίς προφανή αιτία',
              ru: 'На фоне полного здоровья без видимой причины'
            }
          }
        ]
      }
    ]
  },

  // SÄULE 4: WAS NOCH? (Körperliche Begleitsymptome & Gemüt)
  concomitants: {
    pillar: 'concomitants',
    leadQuestion: {
      de: 'Welche auffälligen Begleitreaktionen (Durst, Temperatur, Schweiß) oder Gemütszustände treten gleichzeitig auf?',
      en: 'What notable concomitant reactions (thirst, temperature, sweat) or mental states occur simultaneously?',
      es: '¿Qué reacciones concomitantes (sed, temperatura, sudor) o estados de ánimo ocurren al mismo tiempo?',
      fr: 'Quelles réactions concomitantes (soif, température, sueur) ou humeurs surviennent en même temps ?',
      it: 'Quali reazioni concomitanti (sete, temperatura, sudore) o stati d\'animo si manifestano contemporaneamente?',
      el: 'Ποιες αξιοσημείωτες συνοδές αντιδράσεις (δίψα, θερμοκρασία, εφίδρωση) ή ψυχικές καταστάσεις συνυπάρχουν;',
      ru: 'Какие сопутствующие реакции (жажда, температура, потливость) или психические состояния возникают одновременно?'
    },
    categories: [
      {
        id: 'con-cat-thirst',
        label: {
          de: 'Durst- & Trinkverhalten',
          en: 'Thirst & Drinking behavior',
          es: 'Sed y comportamiento al beber',
          fr: 'Soif et comportement hydrique',
          it: 'Sete e assunzione di liquidi',
          el: 'Δίψα & συμπεριφορά λήψης υγρών',
          ru: 'Жажда и режим питья'
        },
        tier2Options: [
          {
            id: 'con-thirst-large-cold',
            label: {
              de: 'Unstillbarer Durst auf große Mengen eiskaltes Wasser',
              en: 'Unquenchable thirst for large amounts of ice-cold water',
              es: 'Sed insaciable de grandes cantidades de agua helada',
              fr: 'Soif insatiable de grandes quantités d\'eau glacée',
              it: 'Sete inestinguibile di grandi quantità di acqua gelata',
              el: 'Ακατάσχετη δίψα για μεγάλες ποσότητες παγωμένου νερού',
              ru: 'Неутолимая жажда больших количеств ледяной воды'
            },
            remedyHints: ['bryonia-alba', 'phosphorus', 'aconitum-napellus']
          },
          {
            id: 'con-thirst-sips-often',
            label: {
              de: 'Ständiger Durst, trinkt aber nur kleine Schlucke häufig',
              en: 'Constant thirst, but drinks only small sips frequently',
              es: 'Sed constante pero solo a pequeños sorbos frecuentes',
              fr: 'Soif constante mais ne boit que de petites gorgées fréquentes',
              it: 'Sete continua ma beve solo piccoli sorsi frequenti',
              el: 'Συνεχής δίψα, πίνει συχνά μικρές γουλιές',
              ru: 'Постоянная жажда, пьет часто, но маленькими глотками'
            },
            remedyHints: ['arsenicum-album', 'china-officinalis']
          },
          {
            id: 'con-thirstless-complete',
            label: {
              de: 'Völlige Durstlosigkeit trotz Fieber oder Hitze',
              en: 'Complete thirstlessness despite fever or heat',
              es: 'Ausencia total de sed a pesar de la fiebre o calor',
              fr: 'Absence totale de soif malgré la fièvre ou la chaleur',
              it: 'Assenza totale di sete nonostante febbre o calore',
              el: 'Πλήρης έλλειψη δίψας παρά τον πυρετό ή τη ζέστη',
              ru: 'Полное отсутствие жажды, несмотря на жар или лихорадку'
            },
            remedyHints: ['pulsatilla-pratensis', 'apis-mellifica', 'gelsemium-sempervirens']
          }
        ]
      },
      {
        id: 'con-cat-mind-psych',
        label: {
          de: 'Gemütszustand & Verhalten während des Leidens',
          en: 'Mental State & Behavior during suffering',
          es: 'Estado de ánimo y comportamiento durante el malestar',
          fr: 'État mental et comportement pendant la souffrance',
          it: 'Stato d\'animo e comportamento durante la sofferenza',
          el: 'Ψυχική διάθεση & συμπεριφορά κατά την ασθένεια',
          ru: 'Психическое состояние и поведение во время болезни'
        },
        tier2Options: [
          {
            id: 'mind-restless-fear-death',
            label: {
              de: 'Ängstliche Ruhelosigkeit mit Furcht & Verzweiflung',
              en: 'Anxious restlessness with fear & despair',
              es: 'Inquietud ansiosa con miedo y desesperación',
              fr: 'Agitation anxieuse avec peur et désespoir',
              it: 'Irrequietezza ansiosa con paura e disperazione',
              el: 'Αγχώδης ανησυχία με φόβο & απόγνωση',
              ru: 'Тревожное беспокойство со страхом и отчаянием'
            },
            remedyHints: ['aconitum-napellus', 'arsenicum-album', 'rhus-toxicodendron']
          },
          {
            id: 'mind-irritable-anger-touch',
            label: {
              de: 'Extreme Reizbarkeit / Duldet keine Ansprache oder Berührung',
              en: 'Extreme irritability / tolerates no speech or touch',
              es: 'Extrema irritabilidad / no tolera que le hablen o toquen',
              fr: 'Irritabilité extrême / ne tolère ni parole ni contact',
              it: 'Estrema irritabilità / non tollera che gli si parli o tocchi',
              el: 'Έντονος εκνευρισμός / δεν ανέχεται κουβέντα ή άγγιγμα',
              ru: 'Крайняя раздражительность / не переносит разговоров или прикосновений'
            },
            remedyHints: ['chamomilla', 'nux-vomica', 'bryonia-alba', 'colocynthis']
          },
          {
            id: 'mind-weeps-craves-consolation',
            label: {
              de: 'Weinerlich, sanftmütig, sucht Trost & Zuwendung',
              en: 'Weepy, gentle, craves consolation & sympathy',
              es: 'Lloroso, suave, busca consuelo y compañía',
              fr: 'Larmoyant, doux, recherche consolation et réconfort',
              it: 'Piagnucoloso, dolce, cerca consolazione e vicinanza',
              el: 'Κλαψιάρης, πράος, αναζητά παρηγοριά & συμπαράσταση',
              ru: 'Плаксивый, кроткий, ищет утешения и ласки'
            },
            remedyHints: ['pulsatilla-pratensis', 'ignatia-amara']
          }
        ]
      }
    ]
  },
  // SÄULE 6: GEMÜT / PSYCHE (Ängste, Reizbarkeit, Stimmung, Trost & Erschöpfung)
  mind: {
    pillar: 'mind',
    leadQuestion: {
      de: 'Wie verändert sich Ihr seelisches Befinden, Ihre Stimmung oder Ihr Verhalten während der Beschwerden?',
      en: 'How does your state of mind, mood, or behavior change during the complaints?',
      es: '¿Cómo cambia su estado de ánimo, humor o comportamiento durante las molestias?',
      fr: 'Comment votre état d\'esprit, votre humeur ou votre comportement changent-ils pendant les troubles ?',
      it: 'Come cambia il suo stato d\'animo, l\'umore o il comportamento durante i disturbi?',
      el: 'Πώς μεταβάλλεται η ψυχική σας διάθεση, το συναίσθημα ή η συμπεριφορά σας κατά τη διάρκεια των ενοχλήσεων;',
      ru: 'Как изменяется ваше душевное состояние, настроение или поведение во время недомогания?'
    },
    categories: [
      {
        id: 'mind-cat-anxiety-fear',
        label: {
          de: 'Ängste, Panik & Rastlose Ruhelosigkeit',
          en: 'Anxiety, Panic & Restless Agitation',
          es: 'Ansiedad, pánico e inquietud agitada',
          fr: 'Anxiété, panique et agitation sans repos',
          it: 'Ansia, panico e irrequietezza agitata',
          el: 'Άγχος, πανικός & ανήσυχη υπερκινητικότητα',
          ru: 'Тревога, паника и беспокойная суетливость'
        },
        remedyHints: ['aconitum-napellus', 'arsenicum-album', 'phosphorus', 'argentum-nitricum'],
        tier2Options: [
          {
            id: 'mind-t2-death-fear',
            label: {
              de: 'Todesangst & panische Unruhe (mit Todeszeitahnung)',
              en: 'Fear of death & panic restlessness (predicts hour of death)',
              es: 'Miedo a la muerte e inquietud con pánico (predice la hora)',
              fr: 'Peur de la mort et agitation panique (prédit l\'heure)',
              it: 'Paura della morte e agitazione da panico (predice l\'ora)',
              el: 'Φόβος θανάτου & πανικός με ανησυχία (προβλέπει την ώρα)',
              ru: 'Страх смерти и паническое беспокойство (предсказывает час)'
            },
            remedyHints: ['aconitum-napellus', 'arsenicum-album'],
            rubrics: ['MIND - FEAR - death, of', 'MIND - RESTLESSNESS - anxious'],
            tier3Options: [
              {
                id: 'mind-t3-death-acute-sudden',
                label: {
                  de: 'Plötzlich stürmisch auftretend mit panischem Herzrasen',
                  en: 'Sudden violent onset with panic tachycardia',
                  es: 'Aparición repentina y violenta con taquicardia de pánico',
                  fr: 'Apparition soudaine et violente avec tachycardie panique',
                  it: 'Insorgenza improvvisa e violenta con tachicardia da panico',
                  el: 'Ξαφνική θυελλώδης έναρξη με ταχυκαρδία πανικού',
                  ru: 'Внезапное бурное начало с панической тахикардией'
                },
                rubric: 'MIND - FEAR - death, of - sudden'
              },
              {
                id: 'mind-t3-death-midnight-alone',
                label: {
                  de: 'Schlimmer nach Mitternacht (1-3 Uhr), treibt aus dem Bett, will nicht allein sein',
                  en: 'Worse after midnight (1-3 am), drives out of bed, fears being alone',
                  es: 'Peor pasada la medianoche (1-3 am), salta de la cama, teme estar solo',
                  fr: 'Pire après minuit (1-3 h), pousse hors du lit, craint la solitude',
                  it: 'Peggio dopo mezzanotte (1-3), scaccia dal letto, teme di stare solo',
                  el: 'Χειρότερα μετά τα μεσάνυχτα (1-3 π.μ.), πετάγεται από το κρεβάτι, φοβάται τη μοναξιά',
                  ru: 'Хуже после полуночи (1-3 ч), гонит из постели, боится оставаться один'
                },
                rubric: 'MIND - RESTLESSNESS - bed - out of bed, must get'
              }
            ]
          },
          {
            id: 'mind-t2-alone-fear',
            label: {
              de: 'Furcht vor dem Alleinsein & im Dunkeln (sucht ständig Gesellschaft)',
              en: 'Fear of being alone & in the dark (craves constant company)',
              es: 'Miedo a estar solo y a la oscuridad (busca compañía continua)',
              fr: 'Peur d\'être seul et de l\'obscurité (recherche compagnie constante)',
              it: 'Paura di stare solo e del buio (cerca compagnia continua)',
              el: 'Φόβος μοναξιάς & σκοταδιού (αναζητά συνεχώς παρέα)',
              ru: 'Страх одиночества и темноты (постоянно ищет общества)'
            },
            remedyHints: ['phosphorus', 'arsenicum-album', 'pulsatilla-pratensis', 'lycopodium-clavatum'],
            rubrics: ['MIND - FEAR - alone, of being', 'MIND - FEAR - dark, of']
          },
          {
            id: 'mind-t2-health-anxiety',
            label: {
              de: 'Ständige Angst um die eigene Gesundheit & Unheilbarkeit',
              en: 'Persistent anxiety about health & incurability',
              es: 'Ansiedad persistente por la salud y la incurabilidad',
              fr: 'Anxiété constante pour sa santé et incurabilité',
              it: 'Ansia costante per la salute e incurabilità',
              el: 'Συνεχής αγωνία για την υγεία & ανίατη νόσο',
              ru: 'Постоянная тревога за здоровье и неизлечимость'
            },
            remedyHints: ['nitricum-acidum', 'arsenicum-album', 'phosphorus', 'calcarea-carbonica'],
            rubrics: ['MIND - ANXIETY - health, about']
          },
          {
            id: 'mind-t2-anticipation-claustro',
            label: {
              de: 'Erwartungsangst, Lampenfieber & Klaustrophobie in geschlossenen Räumen',
              en: 'Anticipation anxiety, stage fright & claustrophobia in confined spaces',
              es: 'Ansiedad de anticipación, miedo escénico y claustrofobia',
              fr: 'Trac par anticipation et claustrophobie en lieux fermés',
              it: 'Ansia di anticipazione, paura del pubblico e claustrofobia',
              el: 'Άγχος προσμονής, τρακ & κλειστοφοβία σε κλειστούς χώρους',
              ru: 'Тревожное предчувствие, страх сцены и клаустрофобия'
            },
            remedyHints: ['argentum-nitricum', 'gelsemium-sempervirens', 'lycopodium-clavatum'],
            rubrics: ['MIND - ANXIETY - anticipating events', 'MIND - FEAR - narrow places']
          }
        ]
      },
      {
        id: 'mind-cat-anger-irritability',
        label: {
          de: 'Reizbarkeit, Jähzorn & Ungeduld',
          en: 'Irritability, Violent Anger & Impatience',
          es: 'Irritabilidad, cólera violenta e impaciencia',
          fr: 'Irritabilité, colère violente et impatience',
          it: 'Irritabilità, collera violenta e impazienza',
          el: 'Εκνευρισμός, έντονος θυμός & ανυπομονησία',
          ru: 'Раздражительность, вспыльчивый гнев и нетерпение'
        },
        remedyHints: ['nux-vomica', 'chamomilla', 'bryonia-alba', 'colocynthis', 'staphisagria'],
        tier2Options: [
          {
            id: 'mind-t2-anger-contradiction',
            label: {
              de: 'Extremer Jähzorn / Widerspruch & Unterbrechung absolut unerträglich',
              en: 'Violent anger / cannot tolerate contradiction or interruption',
              es: 'Cólera violenta / no tolera la contradicción ni interrupciones',
              fr: 'Colère violente / ne supporte aucune contradiction ni interruption',
              it: 'Collera violenta / intollerante a contraddizioni o interruzioni',
              el: 'Έντονος θυμός / δεν ανέχεται καμία αντίρρηση ή διακοπή',
              ru: 'Вспыльчивый гнев / совершенно не переносит возражений и помех'
            },
            remedyHints: ['nux-vomica', 'colocynthis', 'chamomilla', 'ignatia-amara'],
            rubrics: ['MIND - IRRITABILITY - contradiction, from', 'MIND - ANGER - violent'],
            tier3Options: [
              {
                id: 'mind-t3-anger-consequences-spasms',
                label: {
                  de: 'Krämpfe, Koliken oder Schüttelfrost als Folge des Zorns',
                  en: 'Spasms, colic or chills as a consequence of anger',
                  es: 'Espasmos, cólicos o escalofríos tras la cólera',
                  fr: 'Spasmes, coliques ou frissons suite à la colère',
                  it: 'Spasmi, coliche o brividi a seguito della collera',
                  el: 'Σπασμοί, κολικοί ή ρίγη ως συνέπεια του θυμού',
                  ru: 'Спазмы, колики или озноб как последствие гнева'
                },
                rubric: 'MIND - ANGER - ailments after'
              },
              {
                id: 'mind-t3-anger-hypersensitive-senses',
                label: {
                  de: 'Überempfindlich gegen geringste Geräusche, Gerüche und Licht',
                  en: 'Hypersensitive to slightest noise, odors and light',
                  es: 'Hipersensible al menor ruido, olores y luz',
                  fr: 'Hypersensible au moindre bruit, odeurs et lumière',
                  it: 'Ipersensibile al minimo rumore, odori e luce',
                  el: 'Υπερευαισθησία στον παραμικρό θόρυβο, οσμές και φως',
                  ru: 'Гиперчувствительность к малейшему шуму, запахам и свету'
                },
                rubric: 'MIND - SENSITIVE - noise, to'
              }
            ]
          },
          {
            id: 'mind-t2-unbearable-pain-snappy',
            label: {
              de: 'Schmerzen unerträglich, macht schnippisch, grob und bösartig',
              en: 'Pains unbearable, becomes snappy, uncivil and spiteful',
              es: 'Dolores insoportables, se vuelve hosco, grosero y mordaz',
              fr: 'Douleurs insupportables, devient cassant, agressif et hargneux',
              it: 'Dolori insopportabili, diventa sgarbato, aggressivo e dispettoso',
              el: 'Ανυπόφοροι πόνοι, γίνεται απότομος, αγενής και επιθετικός',
              ru: 'Невыносимые боли, становится резким, грубым и сварливым'
            },
            remedyHints: ['chamomilla', 'hepar-sulphuris', 'coffea-cruda'],
            rubrics: ['MIND - PAIN - unbearable', 'MIND - SNAPPISH']
          },
          {
            id: 'mind-t2-aversion-spoken-disturbed',
            label: {
              de: 'Will absolut seine Ruhe / Will weder angesprochen noch berührt werden',
              en: 'Wants absolute quiet / averse to being spoken to or touched',
              es: 'Desea calma absoluta / no quiere que le hablen ni toquen',
              fr: 'Veut le calme absolu / refuse qu\'on lui parle ou qu\'on le touche',
              it: 'Vuole calma assoluta / non vuole che gli si parli o tocchi',
              el: 'Θέλει απόλυτη ησυχία / δεν θέλει να του μιλούν ή να τον αγγίζουν',
              ru: 'Хочет полного покоя / не переносит, когда с ним говорят или трогают'
            },
            remedyHints: ['bryonia-alba', 'antimonium-crudum', 'arnica-montana'],
            rubrics: ['MIND - QUIET - wants to be', 'MIND - SPOKEN TO, averse to being']
          },
          {
            id: 'mind-t2-suppressed-mortification',
            label: {
              de: 'Stille Kränkung, Demütigung & unterdrückte Entrüstung',
              en: 'Silent mortification, humiliation & suppressed indignation',
              es: 'Resentimiento silencioso, humillación e indignación reprimida',
              fr: 'Mortification silencieuse, humiliation et indignation contenue',
              it: 'Risentimento silenzioso, umiliazione e indignazione repressa',
              el: 'Βουβή προσβολή, ταπείνωση & καταπιεσμένη αγανάκτηση',
              ru: 'Молчаливая обида, унижение и подавленное негодование'
            },
            remedyHints: ['staphisagria', 'ignatia-amara', 'natrium-muriaticum', 'colocynthis'],
            rubrics: ['MIND - MORTIFICATION, ailments after', 'MIND - INDIGNATION']
          }
        ]
      },
      {
        id: 'mind-cat-grief-consolation',
        label: {
          de: 'Stimmung, Trauer, Weinen & Trostverlangen',
          en: 'Mood, Grief, Weeping & Desire for Consolation',
          es: 'Humor, duelo, llanto y deseo de consuelo',
          fr: 'Humeur, chagrin, pleurs et désir de consolation',
          it: 'Umore, lutto, pianto e desiderio di consolazione',
          el: 'Διάθεση, πένθος, κλάμα & ανάγκη για παρηγοριά',
          ru: 'Настроение, печаль, плач и потребность в утешении'
        },
        remedyHints: ['pulsatilla-pratensis', 'natrium-muriaticum', 'ignatia-amara', 'sepia-officinalis'],
        tier2Options: [
          {
            id: 'mind-t2-weepy-craves-consolation',
            label: {
              de: 'Weinerlich, sanftmütig, klammernd – Trost bessert spürbar (> Trost)',
              en: 'Weepy, gentle, clingy – consolation noticeably relieves (> consolation)',
              es: 'Lloroso, dulce, apegado – el consuelo alivia notablemente (> consuelo)',
              fr: 'Larmoyant, doux, affectueux – la consolation soulage nettement (> consolation)',
              it: 'Piagnucoloso, dolce, affettuoso – la consolazione migliora (> consolazione)',
              el: 'Κλαψιάρης, πράος, αναζητά αγκαλιά – η παρηγοριά ανακουφίζει αισθητά (> παρηγοριά)',
              ru: 'Плаксивый, мягкий, ласковый – утешение заметно облегчает (> утешение)'
            },
            remedyHints: ['pulsatilla-pratensis'],
            rubrics: ['MIND - WEEPING - tearful mood', 'MIND - CONSOLATION - amel.'],
            tier3Options: [
              {
                id: 'mind-t3-weepy-fresh-air',
                label: {
                  de: 'Gleichzeitig Verlangen nach offener, kühler Luft (> frische Luft)',
                  en: 'Simultaneous craving for cool open air (> open air)',
                  es: 'Deseo simultáneo de aire fresco y libre (> aire libre)',
                  fr: 'Désir simultané d\'air frais et ouvert (> grand air)',
                  it: 'Desiderio simultaneo di aria fresca aperta (> aria aperta)',
                  el: 'Ταυτόχρονη έντονη ανάγκη για δροσερό καθαρό αέρα (> καθαρός αέρας)',
                  ru: 'Одновременная тяга к прохладному свежему воздуху (> свежий воздух)'
                },
                rubric: 'GENERALS - AIR - open - amel.'
              }
            ]
          },
          {
            id: 'mind-t2-silent-grief-consolation-agg',
            label: {
              de: 'Verschlossene Traurigkeit, weint heimlich – Trost verschlimmert (< Trost)',
              en: 'Closed sadness, weeps in secret – consolation worsens (< consolation)',
              es: 'Tristeza cerrada, llora a solas – el consuelo empeora (< consuelo)',
              fr: 'Tristesse renfermée, pleure en secret – la consolation aggrave (< consolation)',
              it: 'Tristezza chiusa, piange in segreto – la consolazione peggiora (< consolazione)',
              el: 'Κλειστή θλίψη, κλαίει κρυφά – η παρηγοριά επιδεινώνει (< παρηγοριά)',
              ru: 'Замкнутая печаль, плачет тайком – утешение ухудшает (< утешение)'
            },
            remedyHints: ['natrium-muriaticum', 'sepia-officinalis', 'ignatia-amara'],
            rubrics: ['MIND - CONSOLATION - agg.', 'MIND - GRIEF - silent', 'MIND - WEEPING - alone, when'],
            tier3Options: [
              {
                id: 'mind-t3-grief-solitude',
                label: {
                  de: 'Zieht sich völlig zurück, will allein mit dem Schmerz sein',
                  en: 'Withdraws completely, insists on being alone with the pain',
                  es: 'Se aísla por completo, quiere estar solo con su dolor',
                  fr: 'S\'isole totalement, tient à être seul avec sa souffrance',
                  it: 'Si isola del tutto, vuole stare da solo con il suo dolore',
                  el: 'Απομονώνεται πλήρως, απαιτεί να μείνει μόνος με τον πόνο',
                  ru: 'Полностью уходит в себя, хочет быть наедине со своей болью'
                },
                rubric: 'MIND - SOLITUDE - desire for'
              }
            ]
          },
          {
            id: 'mind-t2-hysterical-sighing-alternating',
            label: {
              de: 'Tiefes Seufzen, Kloßgefühl im Hals, rascher Stimmungswechsel (Lachen / Weinen)',
              en: 'Frequent deep sighing, lump in throat, rapid mood swings (laughing / weeping)',
              es: 'Suspiros profundos, nudo en la garganta, cambios de humor bruscos',
              fr: 'Soupirs profonds, boule dans la gorge, sautes d\'humeur rapides',
              it: 'Sospiri profondi, nodo alla gola, repentini sbalzi d\'umore',
              el: 'Βαθείς αναστεναγμοί, κόμπος στον λαιμό, γρήγορη εναλλαγή γέλιου / κλάματος',
              ru: 'Глубокие вздохи, ком в горле, быстрая смена смеха и слез'
            },
            remedyHints: ['ignatia-amara', 'crocus-sativus', 'pulsatilla-pratensis'],
            rubrics: ['MIND - SIGHING', 'MIND - MOOD - alternating', 'THROAT - GLOBUS HYSTERICUS']
          }
        ]
      },
      {
        id: 'mind-cat-exhaustion-indifference',
        label: {
          de: 'Geistige Erschöpfung, Apathie & Gleichgültigkeit',
          en: 'Mental Exhaustion, Apathy & Indifference',
          es: 'Agotamiento mental, apatía e indiferencia',
          fr: 'Épuisement mental, apathie et indifférence',
          it: 'Esaurimento mentale, apatia e indifferenza',
          el: 'Πνευματική εξάντληση, απάθεια & αδιαφορία',
          ru: 'Умственное истощение, апатия и безразличие'
        },
        remedyHints: ['sepia-officinalis', 'phosphoricum-acidum', 'gelsemium-sempervirens', 'baryta-carbonica'],
        tier2Options: [
          {
            id: 'mind-t2-indifference-loved-ones',
            label: {
              de: 'Gleichgültigkeit gegen die nächsten Angehörigen, Beruf & Pflichten',
              en: 'Indifference towards closest relatives, work & daily duties',
              es: 'Indiferencia hacia los seres queridos, el trabajo y las obligaciones',
              fr: 'Indifférence envers ses proches, son travail et ses devoirs',
              it: 'Indifferenza verso i propri cari, il lavoro e i doveri quotidiani',
              el: 'Αδιαφορία προς τους κοντινούς συγγενείς, την εργασία & τα καθήκοντα',
              ru: 'Безразличие к самым близким людям, работе и обязанностям'
            },
            remedyHints: ['sepia-officinalis', 'phosphoricum-acidum'],
            rubrics: ['MIND - INDIFFERENCE - loved ones, to', 'MIND - INDIFFERENCE - duties, to']
          },
          {
            id: 'mind-t2-dullness-sluggish-paralyzed',
            label: {
              de: 'Benommenheit, wie betäubt / Denken erfordert immense Überwindung',
              en: 'Drowsiness, as if stunned / thinking requires immense effort',
              es: 'Embotamiento, como aturdido / pensar requiere un esfuerzo inmenso',
              fr: 'Engourdissement mental, comme hébété / réfléchir demande un effort immense',
              it: 'Ottundimento, come stordito / pensare richiede uno sforzo immenso',
              el: 'Θόλωση, σαν ναρκωμένος / η σκέψη απαιτεί τεράστια προσπάθεια',
              ru: 'Заторможенность, как оглушенный / мысли требуют огромных усилий'
            },
            remedyHints: ['gelsemium-sempervirens', 'opium', 'helleborus-niger', 'baptisia-tinctoria'],
            rubrics: ['MIND - DULLNESS - sluggishness', 'MIND - THOUGHTS - difficult']
          },
          {
            id: 'mind-t2-burnout-grief-exhaustion',
            label: {
              de: 'Erschöpfung durch Kummer, Schlafmangel oder Überarbeitung (Apathie)',
              en: 'Burnout from grief, sleeplessness or overworked state (apathetic silence)',
              es: 'Agotamiento por pena, falta de sueño o exceso de trabajo (apatía)',
              fr: 'Épuisement par chagrin, manque de sommeil ou surmenage (silence apathique)',
              it: 'Esaurimento da dispiacere, insonnia o sovraccarico di lavoro (apatia)',
              el: 'Εξάντληση από πένθος, στέρηση ύπνου ή υπερκόπωση (απαθής σιωπή)',
              ru: 'Истощение от горя, недосыпания или переутомления (апатичное молчание)'
            },
            remedyHints: ['phosphoricum-acidum', 'cocculus-indicus', 'kali-phosphoricum'],
            rubrics: ['MIND - PROSTRATION of mind', 'MIND - INDIFFERENCE - everything, to']
          }
        ]
      }
    ]
  }
};
