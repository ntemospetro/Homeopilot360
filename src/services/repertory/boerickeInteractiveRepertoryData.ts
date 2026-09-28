import { SymptomWeightGrade } from '../boerickeRepertoryService';
import { ClassicalAuthorFilterKey, matchesAuthorFilters } from '../../data/classicalAuthorsMap';
import { LocalizedRemedy } from '../../data/materiaMedicaData';

export interface BoerickeCategoryNode {
  id: string;
  name: string;
  nameTranslated: Record<string, string>;
  children?: BoerickeCategoryNode[];
  rubricKey?: string;
  remedyCount?: number;
  remedyGrades?: Record<string, SymptomWeightGrade>;
}

export interface SelectedRepertorySymptom {
  id: string;
  rubricId: string;
  rubricName: string;
  path: string;
  chapter: string;
  weight: number; // 1, 2, 3, 4
  patientNote?: string;
  color: string;
  remedyGrades: Record<string, SymptomWeightGrade>;
}

export interface BoerickeRepertoryRankResult {
  remedyKey: string;
  latinName: string;
  commonName: string;
  totalScore: number;
  coverageCount: number;
  totalSymptoms: number;
  isFullCoverage: boolean;
  rubricHits: Record<string, { grade: SymptomWeightGrade; scoreContribution: number }>;
  isPolychrest?: boolean;
}

export const BOERICKE_TREE_DATA: BoerickeCategoryNode[] = [
  // 1. ALLGEMEINES (GENERALITIES) - STARTET HIER!
  {
    id: 'generalities',
    name: 'Generalities (Allgemeines)',
    nameTranslated: {
      de: 'Allgemeines',
      en: 'Generalities',
      es: 'Generalidades',
      fr: 'Généralités',
      it: 'Generali',
      el: 'Γενικά συμπτώματα',
      ru: 'Общие симптомы'
    },
    children: [
      {
        id: 'gen_weakness_collapse',
        rubricKey: 'gen_weakness_collapse',
        name: 'Prostration, sudden collapse & rapid loss of strength',
        nameTranslated: {
          de: 'Schwäche, plötzlicher Kräfteverfall & Kollapsneigung',
          en: 'Prostration, sudden collapse & rapid loss of strength',
          es: 'Postración, colapso repentino y pérdida rápida de fuerzas',
          fr: 'Prostration, effondrement subit et perte rapide des forces',
          it: 'Prostrazione, collasso improvviso e rapida perdita di forze',
          el: 'Καταβολή, ξαφνική κατάρρευση & ραγδαία απώλεια δυνάμεων',
          ru: 'Упадок сил, внезапный коллапс и быстрая потеря сил'
        },
        remedyCount: 11,
        remedyGrades: {
          'arsenicum-album': 4,
          'carbo-vegetabilis': 4,
          'veratrum-album': 4,
          'gelsemium-sempervirens': 3,
          'phosphoricum-acidum': 3,
          'china-officinalis': 3,
          'baptisia-tinctoria': 2,
          'muriaticum-acidum': 2,
          'camphora': 2,
          'nux-vomica': 1,
        }
      },
      {
        id: 'gen_cold_agg',
        rubricKey: 'gen_cold_agg',
        name: 'Chilly patient, sensitive to cold, open air and uncovering',
        nameTranslated: {
          de: 'Frostig, hochempfindlich gegen Kälte, Zugluft & Entblößung',
          en: 'Chilly patient, sensitive to cold, open air and uncovering',
          es: 'Friolento, hipersensible al frío, corrientes de aire y destaparse',
          fr: 'Frialeux, hypersensible au froid, aux courants d’air et à se découvrir',
          it: 'Freddoloso, ipersensibile al freddo, spifferi e a scoprirsi',
          el: 'Κρυουλιάρης, υπερευαίσθητος στο κρύο, ρεύματα & ξεσκέπασμα',
          ru: 'Зябкий пациент, повышенная чувствительность к холоду и сквознякам'
        },
        remedyCount: 12,
        remedyGrades: {
          'hepar-sulfuris': 4,
          'silicea': 4,
          'arsenicum-album': 4,
          'nux-vomica': 4,
          'psorinum': 3,
          'causticum': 2,
          'rhus-toxicodendron': 2,
          'kali-carbonicum': 2,
        }
      },
      {
        id: 'gen_warmth_agg',
        rubricKey: 'gen_warmth_agg',
        name: 'Warm-blooded, worse in warm room, better cool open air',
        nameTranslated: {
          de: 'Hitzig, schlimmer in warmem Zimmer, besser im Freien',
          en: 'Warm-blooded, worse in warm room, better cool open air',
          es: 'Caluroso, peor en habitación caliente, mejor al aire libre',
          fr: 'Chaleureux, pire en pièce chaude, mieux au grand air frais',
          it: 'Caloroso, peggiora in stanza calda, migliora all’aria aperta',
          el: 'Ζεσταίνεται, επιδείνωση σε ζεστό δωμάτιο, βελτίωση έξω',
          ru: 'Жаркий пациент, хуже в тёплой комнате, лучше на свежем воздухе'
        },
        remedyCount: 10,
        remedyGrades: {
          'pulsatilla-pratensis': 4,
          'sulfur': 4,
          'apis-mellifica': 4,
          'iodum': 3,
          'lycopodium-clavatum': 3,
          'secale-cornutum': 3,
          'argentum-nitricum': 2,
        }
      },
      {
        id: 'gen_suppuration_wounds',
        rubricKey: 'gen_suppuration_wounds',
        name: 'Tendency to suppuration, unhealthy skin, slow healing wounds',
        nameTranslated: {
          de: 'Eiterungsneigung, schlechte Wundheilung, kleinste Wunden eitern',
          en: 'Tendency to suppuration, unhealthy skin, slow healing wounds',
          es: 'Tendencia a la supuración, mala cicatrización, cualquier herida supura',
          fr: 'Tendance à la suppuration, mauvaise cicatrisation, toute plaie suppure',
          it: 'Tendenza alla suppurazione, cattiva guarigione delle ferite',
          el: 'Τάση για διαπύηση, δύσκολη επούλωση πληγών',
          ru: 'Склонность к нагноению, плохое заживление ран'
        },
        remedyCount: 8,
        remedyGrades: {
          'hepar-sulfuris': 4,
          'silicea': 4,
          'mercurius-solubilis': 3,
          'calcarea-sulfurica': 3,
          'pyrogenium': 2,
          'sulfur': 2,
        }
      }
    ]
  },

  // 2. MIND (GEIST & GEMÜT)
  {
    id: 'mind',
    name: 'Mind (Geist & Gemüt)',
    nameTranslated: {
      de: 'Geist & Gemüt (Mind)',
      en: 'Mind',
      es: 'Mente & Psique',
      fr: 'Esprit & Mental',
      it: 'Mente & Psiche',
      el: 'Νους & Ψυχισμός',
      ru: 'Психика и разум'
    },
    children: [
      {
        id: 'mind_fear',
        name: 'Fear & Anxiety (Furcht & Angst)',
        nameTranslated: { de: 'Angst & Panik', en: 'Fear & Anxiety', es: 'Miedo y Ansiedad', fr: 'Peur et Anxiété', it: 'Paura e Ansia', el: 'Φόβος & Άγχος', ru: 'Страх и тревога' },
        children: [
          {
            id: 'mind_fear_death_panic',
            rubricKey: 'mind_fear_death_panic',
            name: 'Fear of death, sudden panic & restlessness',
            nameTranslated: {
              de: 'Todesangst, plötzliche Panik und Unruhe',
              en: 'Fear of death, sudden panic & restlessness',
              es: 'Miedo a la muerte, pánico repentino e inquietud',
              fr: 'Peur de la mort, panique soudaine et agitation',
              it: 'Paura della morte, panico improvviso e irrequietezza',
              el: 'Φόβος θανάτου, ξαφνικός πανικός & ανησυχία',
              ru: 'Страх смерти, внезапная паника и беспокойство'
            },
            remedyCount: 9,
            remedyGrades: {
              'aconitum-napellus': 4,
              'arsenicum-album': 4,
              'gelsemium-sempervirens': 2,
              'argentum-nitricum': 2,
              'belladonna': 2,
              'rhus-toxicodendron': 2,
              'phosphorus': 2,
              'veratrum-album': 2,
              'chamomilla': 1,
            }
          },
          {
            id: 'mind_anticipation_stage_fright',
            rubricKey: 'mind_anticipation_stage_fright',
            name: 'Anticipation anxiety, stage fright, exam nerves',
            nameTranslated: {
              de: 'Erwartungsangst, Lampenfieber, Prüfungsangst',
              en: 'Anticipation anxiety, stage fright, exam nerves',
              es: 'Ansiedad de anticipación, miedo escénico, exámenes',
              fr: 'Anxiété d’anticipation, trac, angoisse des examens',
              it: 'Ansia di anticipazione, paura del palcoscenico, esami',
              el: 'Άγχος προσμονής, τρακ, φόβος εξετάσεων',
              ru: 'Тревожное ожидание, страх сцены, экзаменационный стресс'
            },
            remedyCount: 8,
            remedyGrades: {
              'gelsemium-sempervirens': 4,
              'argentum-nitricum': 4,
              'lycopodium-clavatum': 3,
              'silicea': 2,
              'anacardium-orientale': 2,
              'pulsatilla-pratensis': 1,
            }
          }
        ]
      },
      {
        id: 'mind_temperament',
        name: 'Disposition & Temperament (Stimmung)',
        nameTranslated: { de: 'Stimmung & Wesen', en: 'Disposition & Temperament', es: 'Disposición y Temperamento', fr: 'Humeur & Tempérament', it: 'Umore & Temperamento', el: 'Διάθεση & Ιδιοσυγκρασία', ru: 'Настроение и темперамент' },
        children: [
          {
            id: 'mind_irritability_anger_oversensitive',
            rubricKey: 'mind_irritability_anger_oversensitive',
            name: 'Irritable, impatient, angry at trifles, oversensitive',
            nameTranslated: {
              de: 'Gereizt, ungeduldig, jähzornig, überempfindlich',
              en: 'Irritable, impatient, angry at trifles, oversensitive',
              es: 'Irritable, impaciente, colérico, hipersensible',
              fr: 'Irritable, impatient, colère pour des riens, hypersensible',
              it: 'Irritabile, impaziente, collerico per inezie, ipersensibile',
              el: 'Ευερέθιστος, ανυπόμονος, οξύθυμος, υπερευαίσθητος',
              ru: 'Раздражительный, нетерпеливый, вспыльчивый по пустякам'
            },
            remedyCount: 10,
            remedyGrades: {
              'nux-vomica': 4,
              'chamomilla': 4,
              'bryonia-alba': 3,
              'colocynthis': 2,
              'hepar-sulfuris': 2,
              'staphisagria': 2,
              'lycopodium-clavatum': 2,
              'sulfur': 1,
            }
          },
          {
            id: 'mind_weeping_gentle_consolation',
            rubricKey: 'mind_weeping_gentle_consolation',
            name: 'Weeping easily, gentle, seeks consolation',
            nameTranslated: {
              de: 'Weint leicht, sanftmütig, sucht Trost & Zuneigung',
              en: 'Weeps easily, gentle, seeks consolation',
              es: 'Llora con facilidad, dulce, busca consuelo',
              fr: 'Pleure facilement, doux, cherche la consolation',
              it: 'Piange facilmente, dolce, desidera consolazione',
              el: 'Κλαίει εύκολα, πράος, αναζητά παρηγοριά',
              ru: 'Легко плачет, кроткий, ищет утешения'
            },
            remedyCount: 7,
            remedyGrades: {
              'pulsatilla-pratensis': 4,
              'ignatia-amara': 3,
              'sepia-officinalis': 2,
              'natrium-muriaticum': 2,
              'silicea': 2,
              'staphisagria': 1,
            }
          },
          {
            id: 'mind_grief_sighing',
            rubricKey: 'mind_grief_sighing_brooding',
            name: 'Silent grief, brooding, sighing, emotional shock',
            nameTranslated: {
              de: 'Stiller Kummer, Brüten, Seufzen, Enttäuschung',
              en: 'Silent grief, brooding, sighing, emotional shock',
              es: 'Pena silenciosa, meditación melancólica, suspiros',
              fr: 'Chagrin silencieux, ruminations, soupirs, déception',
              it: 'Dolore silenzioso, rimuginare, sospiri, delusione',
              el: 'Σιωπηλή θλίψη, στεναγμοί, ψυχικό σοκ',
              ru: 'Тихое горе, подавленность, вздохи, эмоциональный шок'
            },
            remedyCount: 6,
            remedyGrades: {
              'ignatia-amara': 4,
              'natrium-muriaticum': 4,
              'phosphoricum-acidum': 3,
              'causticum': 2,
              'staphisagria': 2,
            }
          }
        ]
      }
    ]
  },

  // 3. HEAD (KOPF)
  {
    id: 'head',
    name: 'Head (Kopf)',
    nameTranslated: {
      de: 'Kopf (Head)',
      en: 'Head',
      es: 'Cabeza',
      fr: 'Tête',
      it: 'Testa',
      el: 'Κεφαλή',
      ru: 'Голова'
    },
    children: [
      {
        id: 'head_throbbing_congestive',
        rubricKey: 'head_throbbing_congestive_jarring',
        name: 'Throbbing, violent congestive headache, jarring agg.',
        nameTranslated: {
          de: 'Pochender, kongestiver Kopfschmerz, schlimmer Erschütterung',
          en: 'Throbbing, violent congestive headache, jarring agg.',
          es: 'Cefalea pulsátil, violenta congestión, peor por sacudidas',
          fr: 'Céphalée pulsatile, congestion violente, pire secousses',
          it: 'Cefalea pulsante, forte congestione, peggiora con scosse',
          el: 'Σφυγμικός έντονος πονοκέφαλος, χειρότερα με τραντάγματα',
          ru: 'Пульсирующая, приливная головная боль, хуже от сотрясения'
        },
        remedyCount: 9,
        remedyGrades: {
          'belladonna': 4,
          'glonoinum': 4,
          'bryonia-alba': 3,
          'gelsemium-sempervirens': 2,
          'melilotus-officinalis': 2,
          'natrium-muriaticum': 2,
          'ferrum-phosphoricum': 2,
        }
      },
      {
        id: 'head_bursting_motion_worse',
        rubricKey: 'head_bursting_stitching_motion_agg',
        name: 'Bursting, stitching pain, worse slightest motion or eye movement',
        nameTranslated: {
          de: 'Berstend, stechend, schlimmer bei geringster Bewegung & Augenwenden',
          en: 'Bursting, stitching pain, worse slightest motion or eye movement',
          es: 'Dolor punzante, estallante, peor por el menor movimiento',
          fr: 'Douleur éclatante, piquante, pire au moindre mouvement',
          it: 'Dolore lacerante, fitte, peggiora al minimo movimento',
          el: 'Σχιστικός, διαπεραστικός πόνος, χειρότερα με την παραμικρή κίνηση',
          ru: 'Разрывающий, колющий боль, хуже от малейшего движения'
        },
        remedyCount: 7,
        remedyGrades: {
          'bryonia-alba': 4,
          'kali-carbonicum': 3,
          'spigelia-anthelmia': 3,
          'belladonna': 2,
          'silicea': 2,
          'nux-vomica': 2,
        }
      },
      {
        id: 'head_occiput_band_sensation',
        rubricKey: 'head_occiput_band_sensation',
        name: 'Occipital headache extending to forehead, band around head',
        nameTranslated: {
          de: 'Hinterkopfschmerz bis zur Stirn, Gefühl eines Reifs/Bandes',
          en: 'Occipital headache extending to forehead, band around head',
          es: 'Cefalea occipital hacia la frente, sensación de venda apretada',
          fr: 'Céphalée occipitale vers le front, sensation de serre-tête',
          it: 'Cefalea occipitale che si irradia alla fronte, cerchio alla testa',
          el: 'Ινιακός πονοκέφαλος με αίσθημα σφιχτής στεφάνης',
          ru: 'Затылочная боль с иррадиацией ко лбу, ощущение обруча'
        },
        remedyCount: 6,
        remedyGrades: {
          'gelsemium-sempervirens': 4,
          'anacardium-orientale': 3,
          'carbolicum-acidum': 3,
          'silicea': 2,
          'spigelia-anthelmia': 2,
        }
      }
    ]
  },

  // 4. EYES (AUGEN)
  {
    id: 'eyes',
    name: 'Eyes (Augen)',
    nameTranslated: {
      de: 'Augen (Eyes)',
      en: 'Eyes',
      es: 'Ojos',
      fr: 'Yeux',
      it: 'Occhi',
      el: 'Οφθαλμοί',
      ru: 'Глаза'
    },
    children: [
      {
        id: 'eyes_photophobia_hot_tears',
        rubricKey: 'eyes_photophobia_hot_tears',
        name: 'Severe photophobia, burning hot tears, acrid lachrymation',
        nameTranslated: {
          de: 'Lichtscheu, heiße scharfe Tränen, Rötung der Bindehaut',
          en: 'Severe photophobia, burning hot tears, acrid lachrymation',
          es: 'Fotofobia intensa, lágrimas calientes e irritantes',
          fr: 'Photophobie intense, larmes brûlantes et âcres',
          it: 'Fotofobia marcata, lacrime brucianti e irritanti',
          el: 'Έντονη φωτοφοβία, καυστικά καυτά δάκρυα',
          ru: 'Светобоязнь, горячие едкие слёзы, покраснение конъюнктивы'
        },
        remedyCount: 8,
        remedyGrades: {
          'euphrasia-officinalis': 4,
          'allium-cepa': 3,
          'belladonna': 3,
          'arsenicum-album': 2,
          'mercurius-solubilis': 2,
          'pulsatilla-pratensis': 1,
        }
      },
      {
        id: 'eyes_swollen_edema_stinging',
        rubricKey: 'eyes_swollen_edema_stinging',
        name: 'Puffy bags under eyes, chemosis, stinging burning pains',
        nameTranslated: {
          de: 'Schwellung der Lider, wässrige Tränensäcke, stichender Schmerz',
          en: 'Puffy bags under eyes, chemosis, stinging burning pains',
          es: 'Hinchazón de párpados, bolsas de agua, dolor punzante',
          fr: 'Paupières gonflées en sacs d’eau, piqûres brûlantes',
          it: 'Palpebre gonfie come sacche d’acqua, fitte brucianti',
          el: 'Πρήξιμο βλεφάρων, υδατώδεις σάκοι, νυγμώδης πόνος',
          ru: 'Отёчность век в виде мешков с водой, колющая жгучая боль'
        },
        remedyCount: 6,
        remedyGrades: {
          'apis-mellifica': 4,
          'kali-carbonicum': 3,
          'phosphorus': 2,
          'arsenicum-album': 2,
          'rhus-toxicodendron': 2,
        }
      }
    ]
  },

  // 5. EARS (OHREN)
  {
    id: 'ears',
    name: 'Ears (Ohren)',
    nameTranslated: {
      de: 'Ohren (Ears)',
      en: 'Ears',
      es: 'Oídos',
      fr: 'Oreilles',
      it: 'Orecchie',
      el: 'Ώτα',
      ru: 'Уши'
    },
    children: [
      {
        id: 'ears_otitis_throbbing_night',
        rubricKey: 'ears_otitis_throbbing_night',
        name: 'Acute violent otitis media, throbbing pain, sudden onset',
        nameTranslated: {
          de: 'Akute heftige Mittelohrentzündung, pochender Schmerz, nachts <',
          en: 'Acute violent otitis media, throbbing pain, sudden onset',
          es: 'Otitis media aguda y violenta, dolor pulsátil, peor de noche',
          fr: 'Otite moyenne aiguë violente, douleur pulsatile, pire la nuit',
          it: 'Otite media acuta e violenta, dolore pulsante, peggiora di notte',
          el: 'Οξεία έντονη μέση ωτίτιδα, σφυγμικός πόνος, επιδείνωση νύχτα',
          ru: 'Острый бурный отит, пульсирующая боль, ухудшение ночью'
        },
        remedyCount: 7,
        remedyGrades: {
          'belladonna': 4,
          'chamomilla': 4,
          'hepar-sulfuris': 3,
          'pulsatilla-pratensis': 3,
          'ferrum-phosphoricum': 2,
          'silicea': 2,
        }
      },
      {
        id: 'ears_discharge_thick_bland',
        rubricKey: 'ears_discharge_thick_bland',
        name: 'Thick, yellow-green bland ear discharge, painless or mild',
        nameTranslated: {
          de: 'Dicker, gelb-grünlicher milder Ohrfluss, Verstopfungsgefühl',
          en: 'Thick, yellow-green bland ear discharge, painless or mild',
          es: 'Supuración del oído espesa, amarillenta-verdosa y blanda',
          fr: 'Écoulement auriculaire épais, jaune-vert et non irritant',
          it: 'Secrezione auricolare densa, giallo-verdastra e blanda',
          el: 'Παχύρρευστη κιτρινοπράσινη μη καυστική έκκριση ωτός',
          ru: 'Густые жёлто-зелёные мягкие выделения из уха'
        },
        remedyCount: 5,
        remedyGrades: {
          'pulsatilla-pratensis': 4,
          'silicea': 3,
          'hydrastis-canadensis': 2,
          'kali-bichromicum': 2,
        }
      }
    ]
  },

  // 6. NOSE (NASE)
  {
    id: 'nose',
    name: 'Nose (Nase)',
    nameTranslated: {
      de: 'Nase (Nose)',
      en: 'Nose',
      es: 'Nariz',
      fr: 'Nez',
      it: 'Naso',
      el: 'Ρινός',
      ru: 'Нос'
    },
    children: [
      {
        id: 'nose_coryza_watery_acrid',
        rubricKey: 'nose_coryza_watery_acrid',
        name: 'Profuse watery acrid coryza excoriating upper lip, sneezing',
        nameTranslated: {
          de: 'Fließschnupfen, wässrig und ätzend, brennt auf der Oberlippe',
          en: 'Profuse watery acrid coryza excoriating upper lip, sneezing',
          es: 'Coriza acuosa abundante y quemante, irrita el labio superior',
          fr: 'Coryza aqueux abondant et excoriant la lèvre supérieure',
          it: 'Corizza acquosa abbondante e bruciante che irrita il labbro',
          el: 'Ρευστή καυστική ρινόρροια που ερεθίζει το άνω χείλος',
          ru: 'Обильный водянистый едкий насморк, разъедающий верхнюю губу'
        },
        remedyCount: 8,
        remedyGrades: {
          'allium-cepa': 4,
          'arsenicum-album': 4,
          'sabadilla': 3,
          'mercurius-solubilis': 2,
          'gelsemium-sempervirens': 2,
        }
      },
      {
        id: 'nose_stopped_dry_night',
        rubricKey: 'nose_stopped_dry_night',
        name: 'Dry stuffed nose, unable to breathe through nose at night',
        nameTranslated: {
          de: 'Trockene verstopfte Nase, nachts keine Atmung durch die Nase möglich',
          en: 'Dry stuffed nose, unable to breathe through nose at night',
          es: 'Nariz seca y tapada, imposible respirar por la nariz de noche',
          fr: 'Nez sec et bouché, impossible de respirer par le nez la nuit',
          it: 'Naso secco e ostruito, respiro nasale impossibile la notte',
          el: 'Ξηρή βουλωμένη μύτη, αδυναμία ρινικής αναπνοής τη νύχτα',
          ru: 'Сухой заложенный нос, невозможность носового дыхания ночью'
        },
        remedyCount: 7,
        remedyGrades: {
          'sambucus-nigra': 4,
          'nux-vomica': 4,
          'sticta-pulmonaria': 3,
          'lycopodium-clavatum': 3,
          'dulcamara': 2,
        }
      }
    ]
  },

  // 7. FACE (GESICHT)
  {
    id: 'face',
    name: 'Face (Gesicht)',
    nameTranslated: {
      de: 'Gesicht (Face)',
      en: 'Face',
      es: 'Cara',
      fr: 'Visage',
      it: 'Volto',
      el: 'Πρόσωπο',
      ru: 'Лицо'
    },
    children: [
      {
        id: 'face_neuralgia_sharp_cold',
        rubricKey: 'face_neuralgia_sharp_cold',
        name: 'Trigeminal facial neuralgia, sudden stitching pains, wind agg.',
        nameTranslated: {
          de: 'Gesichtsneuralgie (Trigeminus), schneidend, durch kalten Wind <',
          en: 'Trigeminal facial neuralgia, sudden stitching pains, wind agg.',
          es: 'Neuralgia facial del trigémino, punzante, peor por viento frío',
          fr: 'Névralgie faciale du trijumeau, foudroyante, pire au vent froid',
          it: 'Nevralgia facciale del trigemino, fitte acute da vento freddo',
          el: 'Νευραλγία τριδύμου προσώπου, σουβλιές από κρύο άνεμο',
          ru: 'Невралгия тройничного нерва, острые прострелы от холодного ветра'
        },
        remedyCount: 7,
        remedyGrades: {
          'spigelia-anthelmia': 4,
          'magnesium-phosphoricum': 4,
          'aconitum-napellus': 3,
          'colocynthis': 3,
          'chamomilla': 2,
        }
      },
      {
        id: 'face_red_hot_congested',
        rubricKey: 'face_red_hot_congested',
        name: 'Glowing red, hot, dry flushed face with dilated pupils',
        nameTranslated: {
          de: 'Glühend rotes, heißes Gesicht, erweiterte Pupillen, Pulsieren',
          en: 'Glowing red, hot, dry flushed face with dilated pupils',
          es: 'Cara roja ardiente, caliente y brillante con pupilas dilatadas',
          fr: 'Visage rouge brûlant, chaud et luisant avec pupilles dilatées',
          it: 'Volto rosso acceso, caldo e pulsante con pupille dilatate',
          el: 'Κατακόκκινο πυρέσσον πρόσωπο, διασταλμένες κόρες, παλμοί',
          ru: 'Пылающее красное горячее лицо, расширенные зрачки, пульсация'
        },
        remedyCount: 6,
        remedyGrades: {
          'belladonna': 4,
          'aconitum-napellus': 3,
          'ferrum-phosphoricum': 2,
          'glonoinum': 2,
        }
      }
    ]
  },

  // 8. MOUTH & TEETH (MUND & ZÄHNE)
  {
    id: 'mouth',
    name: 'Mouth & Teeth (Mund & Zähne)',
    nameTranslated: {
      de: 'Mund & Zähne (Mouth & Teeth)',
      en: 'Mouth & Teeth',
      es: 'Boca y Dientes',
      fr: 'Bouche et Dents',
      it: 'Bocca e Denti',
      el: 'Στόμα & Οδόντες',
      ru: 'Рот и зубы'
    },
    children: [
      {
        id: 'mouth_aphthae_burning_salivation',
        rubricKey: 'mouth_aphthae_burning_salivation',
        name: 'Aphthae, ulcers, offensive breath, profuse bloody salivation',
        nameTranslated: {
          de: 'Aphthen, fauliger Mundgeruch, reichlicher Speichelfluss, Zahnabdrücke',
          en: 'Aphthae, ulcers, offensive breath, profuse bloody salivation',
          es: 'Aftas, aliento fétido, salivación abundante, huella dental',
          fr: 'Aphtes, haleine fétide, salivation abondante, empreinte des dents',
          it: 'Afte, alito fetido, salivazione profusa, impronte dei denti',
          el: 'Άφθες, δύσοσμη αναπνοή, έντονη σιελόρροια',
          ru: 'Афты, гнилостный запах изо рта, обильное слюнотечение, отпечатки зубов'
        },
        remedyCount: 7,
        remedyGrades: {
          'mercurius-solubilis': 4,
          'borax': 4,
          'nitricum-acidum': 3,
          'hydrastis-canadensis': 2,
          'arsenicum-album': 2,
        }
      },
      {
        id: 'teeth_toothache_warmth_agg_cold_better',
        rubricKey: 'teeth_toothache_warmth_agg_cold_better',
        name: 'Violent toothache, worse warm drinks/bed, holding ice relieves',
        nameTranslated: {
          de: 'Heftiges Zahnweh, schlimmer durch Wärme, Eiswasser im Mund bessert',
          en: 'Violent toothache, worse warm drinks/bed, holding ice relieves',
          es: 'Dolor de muelas violento, peor calor, mejora con hielo en la boca',
          fr: 'Rage de dents violente, pire chaleur, soulagée par l’eau glacée',
          it: 'Violento mal di denti, peggiora col caldo, ghiaccio in bocca migliora',
          el: 'Έντονος πονόδοντος, χειρότερα με ζέστη, βελτίωση με παγωμένο νερό',
          ru: 'Зубная боль, ухудшение от тепла, ледяная вода во рту облегчает'
        },
        remedyCount: 6,
        remedyGrades: {
          'coffea-cruda': 4,
          'chamomilla': 4,
          'pulsatilla-pratensis': 3,
          'bryonia-alba': 2,
        }
      }
    ]
  },

  // 9. THROAT (HALS & RACHEN)
  {
    id: 'throat',
    name: 'Throat (Hals & Rachen)',
    nameTranslated: {
      de: 'Hals & Rachen (Throat)',
      en: 'Throat',
      es: 'Garganta',
      fr: 'Gorge',
      it: 'Gola',
      el: 'Λαιμός & Φάρυγγας',
      ru: 'Горло и глотка'
    },
    children: [
      {
        id: 'throat_splinter_sensation_sharp',
        rubricKey: 'throat_splinter_sensation_sharp',
        name: 'Sharp splinter-like sticking pain on swallowing extending to ear',
        nameTranslated: {
          de: 'Splitterartiges Stechen beim Schlucken, Schmerz strahlt ins Ohr aus',
          en: 'Sharp splinter-like sticking pain on swallowing extending to ear',
          es: 'Dolor como una astilla al tragar que irradia al oído',
          fr: 'Douleur aiguë comme une écharde en avalant, irradiant à l’oreille',
          it: 'Fitta acuta come una spina deglutendo che si irradia all’orecchio',
          el: 'Οξύς πόνος σαν αγκίδα κατά την κατάποση με αντανάκλαση στο αυτί',
          ru: 'Боль как от занозы при глотании, иррадиирует в ухо'
        },
        remedyCount: 6,
        remedyGrades: {
          'hepar-sulfuris': 4,
          'nitricum-acidum': 4,
          'argentum-nitricum': 3,
          'phytolacca-decandra': 2,
        }
      },
      {
        id: 'throat_dark_red_burning_swallowing_drinks',
        rubricKey: 'throat_dark_red_burning_swallowing_drinks',
        name: 'Dark red fiery throat, painful swallowing, worse warm drinks',
        nameTranslated: {
          de: 'Dunkelroter feuriger Rachen, Schmerz beim Leerschlucken, Kälte bessert',
          en: 'Dark red fiery throat, painful swallowing, worse warm drinks',
          es: 'Garganta rojo oscuro ardiente, peor al tragar líquidos calientes',
          fr: 'Gorge rouge sombre enflammée, pire boissons chaudes, froid soulage',
          it: 'Gola rosso scuro fiammeggiante, peggiora con bevande calde',
          el: 'Σκούρος κόκκινος πυρέσσων λαιμός, χειρότερα με ζεστά ροφήματα',
          ru: 'Тёмно-красное пылающее горло, хуже от тёплого питья, холод облегчает'
        },
        remedyCount: 6,
        remedyGrades: {
          'phytolacca-decandra': 4,
          'apis-mellifica': 4,
          'belladonna': 3,
          'lachesis-muta': 3,
        }
      }
    ]
  },

  // 10. STOMACH (MAGEN)
  {
    id: 'stomach',
    name: 'Stomach (Magen)',
    nameTranslated: {
      de: 'Magen (Stomach)',
      en: 'Stomach',
      es: 'Estómago',
      fr: 'Estomac',
      it: 'Stomaco',
      el: 'Στόμαχος',
      ru: 'Желудок'
    },
    children: [
      {
        id: 'stomach_pain',
        name: 'Pain (Schmerz)',
        nameTranslated: { de: 'Schmerz (Pain)', en: 'Pain', es: 'Dolor', fr: 'Douleur', it: 'Dolore', el: 'Πόνος', ru: 'Боль' },
        children: [
          {
            id: 'stomach_pain_general',
            rubricKey: 'stomach_pain_general',
            name: 'Stomach – Pain (Magen-Schmerz allgemein)',
            nameTranslated: {
              de: 'Magen – Schmerz allgemein',
              en: 'Stomach – Pain general',
              es: 'Estómago – Dolor general',
              fr: 'Estomac – Douleur générale',
              it: 'Stomaco – Dolore generale',
              el: 'Στόμαχος – Πόνος γενικά',
              ru: 'Желудок – Боль общая'
            },
            remedyCount: 14,
            remedyGrades: {
              'nux-vomica': 4,
              'arsenicum-album': 4,
              'pulsatilla-pratensis': 3,
              'bryonia-alba': 3,
              'phosphorus': 3,
              'lycopodium-clavatum': 3,
              'carbo-vegetabilis': 2,
              'sepia-officinalis': 2,
              'ipecacuanha': 2,
              'natrium-muriaticum': 2,
              'sulfur': 2,
              'belladonna': 1,
            }
          },
          {
            id: 'stomach_pain_cramping',
            rubricKey: 'stomach_pain_cramping',
            name: 'Stomach – Pain – cramping (Krampfartig)',
            nameTranslated: {
              de: 'Magen – Schmerz – krampfartig',
              en: 'Stomach – Pain – cramping',
              es: 'Estómago – Dolor – espasmódico / cólico',
              fr: 'Estomac – Douleur – crampes',
              it: 'Stomaco – Dolore – crampiforme',
              el: 'Στόμαχος – Πόνος – σπασμωδικός',
              ru: 'Желудок – Боль – спастическая'
            },
            remedyCount: 12,
            remedyGrades: {
              'nux-vomica': 4,
              'colocynthis': 4,
              'magnesium-phosphoricum': 3,
              'pulsatilla-pratensis': 3,
              'arsenicum-album': 3,
              'carbo-vegetabilis': 2,
              'lycopodium-clavatum': 2,
              'phosphorus': 2,
              'cuprum-metallicum': 2,
              'belladonna': 1,
            }
          },
          {
            id: 'stomach_pain_burning',
            rubricKey: 'stomach_pain_burning',
            name: 'Stomach – Pain – burning (Brennend)',
            nameTranslated: {
              de: 'Magen – Schmerz – brennend',
              en: 'Stomach – Pain – burning',
              es: 'Estómago – Dolor – ardiente',
              fr: 'Estomac – Douleur – brûlante',
              it: 'Stomaco – Dolore – bruciante',
              el: 'Στόμαχος – Πόνος – καυστικός',
              ru: 'Желудок – Боль – жгучая'
            },
            remedyCount: 11,
            remedyGrades: {
              'arsenicum-album': 4,
              'phosphorus': 4,
              'nux-vomica': 2,
              'iris-versicolor': 2,
              'capsicum-annuum': 2,
              'carbo-vegetabilis': 2,
              'sulfur': 2,
              'lycopodium-clavatum': 1,
            }
          },
          {
            id: 'stomach_pain_evening_worse',
            rubricKey: 'stomach_pain_evening_worse',
            name: 'Stomach – Pain – evening – worse (Abends schlimmer)',
            nameTranslated: {
              de: 'Magen – Schmerz – abends schlimmer',
              en: 'Stomach – Pain – evening – worse',
              es: 'Estómago – Dolor – peor por la tarde / noche',
              fr: 'Estomac – Douleur – pire le soir',
              it: 'Stomaco – Dolore – peggiora la sera',
              el: 'Στόμαχος – Πόνος – επιδείνωση το βράδυ',
              ru: 'Желудок – Боль – ухудшение вечером'
            },
            remedyCount: 10,
            remedyGrades: {
              'pulsatilla-pratensis': 4,
              'nux-vomica': 3,
              'lycopodium-clavatum': 3,
              'arsenicum-album': 2,
              'carbo-vegetabilis': 2,
              'phosphorus': 2,
              'sepia-officinalis': 2,
              'sulfur': 1,
            }
          },
          {
            id: 'stomach_pain_morning_better',
            rubricKey: 'stomach_pain_morning_better',
            name: 'Stomach – Pain – morning – better (Morgens besser)',
            nameTranslated: {
              de: 'Magen – Schmerz – morgens besser',
              en: 'Stomach – Pain – morning – better',
              es: 'Estómago – Dolor – mejor por la mañana',
              fr: 'Estomac – Douleur – mieux le matin',
              it: 'Stomaco – Dolore – migliora al mattino',
              el: 'Στόμαχος – Πόνος – βελτίωση το πρωί',
              ru: 'Желудок – Боль – улучшение утром'
            },
            remedyCount: 8,
            remedyGrades: {
              'nux-vomica': 3,
              'pulsatilla-pratensis': 3,
              'arsenicum-album': 2,
              'natrium-muriaticum': 2,
              'lycopodium-clavatum': 2,
              'phosphorus': 1,
            }
          },
          {
            id: 'stomach_pain_cold_from',
            rubricKey: 'stomach_pain_cold_from',
            name: 'Stomach – Pain – cold – from (Durch Kälte / Eis)',
            nameTranslated: {
              de: 'Magen – Schmerz – durch Kälte / kalte Speisen',
              en: 'Stomach – Pain – cold – from',
              es: 'Estómago – Dolor – por frío / bebidas frías',
              fr: 'Estomac – Douleur – par le froid / glaces',
              it: 'Stomaco – Dolore – da freddo / cibi freddi',
              el: 'Στόμαχος – Πόνος – από κρύο / παγωτά',
              ru: 'Желудок – Боль – от холода / холодной пищи'
            },
            remedyCount: 9,
            remedyGrades: {
              'arsenicum-album': 4,
              'pulsatilla-pratensis': 3,
              'nux-vomica': 3,
              'phosphorus': 2,
              'carbo-vegetabilis': 2,
              'lycopodium-clavatum': 2,
              'rhus-toxicodendron': 1,
            }
          }
        ]
      },
      {
        id: 'stomach_nausea_vomiting',
        name: 'Nausea & Vomiting (Übelkeit & Erbrechen)',
        nameTranslated: { de: 'Übelkeit & Erbrechen', en: 'Nausea & Vomiting', es: 'Náuseas y Vómitos', fr: 'Nausées & Vomissements', it: 'Nausea e Vomito', el: 'Ναυτία & Έμετος', ru: 'Тошнота и рвота' },
        children: [
          {
            id: 'stomach_nausea_persistent_clean_tongue',
            rubricKey: 'stomach_nausea_persistent_clean_tongue',
            name: 'Persistent constant nausea with clean tongue',
            nameTranslated: {
              de: 'Ständige Übelkeit, nicht erleichtert durch Erbrechen, saubere Zunge',
              en: 'Persistent constant nausea with clean tongue',
              es: 'Náuseas continuas no aliviadas por vomitar, lengua limpia',
              fr: 'Nausées continuelles sans soulagement par vomissement, langue propre',
              it: 'Nausea costante non alleviata dal vomito, lingua pulita',
              el: 'Συνεχής ναυτία, καθαρή γλώσσα, χωρίς ανακούφιση',
              ru: 'Постоянная тошнота, чистый язык, не облегчается рвотой'
            },
            remedyCount: 8,
            remedyGrades: {
              'ipecacuanha': 4,
              'antimonium-tartaricum': 2,
              'arsenicum-album': 2,
              'pulsatilla-pratensis': 2,
              'tabacum': 2,
              'nux-vomica': 1,
            }
          },
          {
            id: 'stomach_vomiting_drinking_as_soon_as_cold_water_warm',
            rubricKey: 'stomach_vomiting_drinking_as_soon_as_cold_water_warm',
            name: 'Vomiting cold water as soon as it becomes warm in stomach',
            nameTranslated: {
              de: 'Erbrechen von kaltem Wasser, sobald es im Magen warm wird',
              en: 'Vomiting cold water as soon as it becomes warm in stomach',
              es: 'Vomita agua fría en cuanto se calienta en el estómago',
              fr: 'Vomissement d’eau froide dès qu’elle se réchauffe dans l’estomac',
              it: 'Vomito di acqua fredda non appena diventa calda nello stomaco',
              el: 'Έμετος κρύου νερού μόλις ζεσταθεί στο στομάχι',
              ru: 'Рвота холодной водой, как только она согревается в желудке'
            },
            remedyCount: 5,
            remedyGrades: {
              'phosphorus': 4,
              'arsenicum-album': 3,
              'bismuthum': 2,
              'nux-vomica': 1,
            }
          }
        ]
      }
    ]
  },

  // 11. ABDOMEN (BAUCH & DARM)
  {
    id: 'abdomen',
    name: 'Abdomen (Bauch & Darm)',
    nameTranslated: {
      de: 'Bauch & Darm (Abdomen)',
      en: 'Abdomen',
      es: 'Abdomen & Vientre',
      fr: 'Abdomen & Ventre',
      it: 'Addome & Intestino',
      el: 'Κοιλία & Έντερο',
      ru: 'Живот и кишечник'
    },
    children: [
      {
        id: 'abdomen_colic_double_up',
        rubricKey: 'gi_violent_colic_doubling_up_hard_pressure',
        name: 'Violent colic, doubling up & hard pressure relieves',
        nameTranslated: {
          de: 'Heftige Kolik, Besserung durch Zusammenkrümmen & festen Druck',
          en: 'Violent colic, doubling up & hard pressure relieves',
          es: 'Cólico violento, mejor doblándose en dos y fuerte presión',
          fr: 'Colique violente, plié en deux et forte pression soulage',
          it: 'Colica violenta, piegato in due e forte pressione migliora',
          el: 'Έντονος κολικός, βελτίωση με δίπλωμα στα δύο & πίεση',
          ru: 'Сильная колика, облегчение от сгибания пополам и сильного давления'
        },
        remedyCount: 7,
        remedyGrades: {
          'colocynthis': 4,
          'magnesium-phosphoricum': 4,
          'dioscorea-villosa': 3,
          'chamomilla': 2,
          'belladonna': 2,
          'nux-vomica': 1,
        }
      },
      {
        id: 'abdomen_flatulence_bloating',
        rubricKey: 'gi_flatulence_bloating_distension',
        name: 'Excessive distension, bloating, air hunger, eructations',
        nameTranslated: {
          de: 'Extreme Gasbildung, Blähbauch, Bedürfnis nach Luft',
          en: 'Excessive distension, bloating, air hunger, eructations',
          es: 'Gran distensión gaseosa, meteorismo, hambre de aire',
          fr: 'Ballonnements extrêmes, distension, besoin d’air frais',
          it: 'Forte distensione gassosa, meteorismo, fame d’aria',
          el: 'Έντονος τυμπανισμός, φούσκωμα, ανάγκη για αέρα',
          ru: 'Сильное вздутие живота, метеоризм, жажда свежего воздуха'
        },
        remedyCount: 9,
        remedyGrades: {
          'carbo-vegetabilis': 4,
          'lycopodium-clavatum': 4,
          'china-officinalis': 3,
          'nux-vomica': 2,
          'pulsatilla-pratensis': 2,
          'sulfur': 2,
          'argentum-nitricum': 2,
        }
      }
    ]
  },

  // 12. STOOL & RECTUM (STUHL & MASTDARM)
  {
    id: 'rectum',
    name: 'Stool & Rectum (Stuhl & Mastdarm)',
    nameTranslated: {
      de: 'Stuhl & Mastdarm (Stool & Rectum)',
      en: 'Stool & Rectum',
      es: 'Heces y Recto',
      fr: 'Selles et Rectum',
      it: 'Feci e Retto',
      el: 'Κενώσεις & Ορθό',
      ru: 'Стул и прямая кишка'
    },
    children: [
      {
        id: 'rectum_ineffectual_urging',
        rubricKey: 'rectum_ineffectual_urging',
        name: 'Frequent ineffectual urging to stool, incomplete evacuation',
        nameTranslated: {
          de: 'Häufiger vergeblicher Stuhldrang, Gefühl unvollständiger Entleerung',
          en: 'Frequent ineffectual urging to stool, incomplete evacuation',
          es: 'Tenesmo frecuente ineficaz, sensación de evacuación incompleta',
          fr: 'Besoins inefficaces fréquents, sensation d’évacuation incomplète',
          it: 'Tenesmo frequente e inefficace, sensazione di svuotamento incompleto',
          el: 'Συχνός ανώφελος τεινεσμός, αίσθημα ατελούς κένωσης',
          ru: 'Частые безрезультатные позывы на стул, чувство неполного опорожнения'
        },
        remedyCount: 6,
        remedyGrades: {
          'nux-vomica': 4,
          'lycopodium-clavatum': 3,
          'anacardium-orientale': 3,
          'sulfur': 2,
          'ignatia-amara': 2,
        }
      },
      {
        id: 'rectum_diarrhoea_morning_rush',
        rubricKey: 'rectum_diarrhoea_morning_rush',
        name: 'Painless exhausting morning diarrhoea drives out of bed early',
        nameTranslated: {
          de: 'Morgendlicher Durchfall treibt früh aus dem Bett, brennend',
          en: 'Painless exhausting morning diarrhoea drives out of bed early',
          es: 'Diarrea matutina temprana que saca de la cama, quemante',
          fr: 'Diarrhée matinale précoce chassant du lit, brûlante',
          it: 'Diarrea mattutina precoce che costringe ad alzarsi dal letto',
          el: 'Πρωινή διάρροια που αναγκάζει σε άμεση έγερση από το κρεβάτι',
          ru: 'Утренний понос, выгоняющий из постели, жжение'
        },
        remedyCount: 6,
        remedyGrades: {
          'sulfur': 4,
          'aloe-socotrina': 4,
          'podophyllum-peltatum': 3,
          'arsenicum-album': 3,
          'natrium-sulfuricum': 2,
        }
      }
    ]
  },

  // 13. URINARY ORGANS (HARNORGANE)
  {
    id: 'urinary',
    name: 'Urinary Organs (Harnorgane & Blase)',
    nameTranslated: {
      de: 'Harnorgane & Blase',
      en: 'Urinary Organs',
      es: 'Órganos urinarios & Vejiga',
      fr: 'Organes urinaires & Vessie',
      it: 'Organi urinari & Vescica',
      el: 'Ουροποιητικό σύστημα',
      ru: 'Мочевые органы и пузырь'
    },
    children: [
      {
        id: 'urine_burning_tenesmus_strangury',
        rubricKey: 'urine_burning_tenesmus_strangury',
        name: 'Severe burning cutting pain before, during and after urination',
        nameTranslated: {
          de: 'Schneidend brennender Schmerz bei der Blasenentleerung, Strangurie',
          en: 'Severe burning cutting pain before, during and after urination',
          es: 'Dolor cortante y ardiente violento al orinar, tenesmo vesical',
          fr: 'Douleur coupante et brûlante violente à la miction, strangurie',
          it: 'Dolore tagliente e bruciante violento alla minzione, stranguria',
          el: 'Έντονος καυστικός πόνος πριν, κατά και μετά την ούρηση',
          ru: 'Режущая жгучая боль до, во время и после мочеиспускания, тенезмы'
        },
        remedyCount: 6,
        remedyGrades: {
          'cantharis-vesicatoria': 4,
          'apis-mellifica': 3,
          'mercurius-corrosivus': 3,
          'staphisagria': 3,
          'nux-vomica': 2,
        }
      }
    ]
  },

  // 14. RESPIRATORY & CHEST (ATMUNG, HUSTEN & BRUST)
  {
    id: 'respiratory',
    name: 'Respiratory & Cough (Atmung, Husten & Brust)',
    nameTranslated: {
      de: 'Atmung & Husten (Respiratory)',
      en: 'Respiratory & Cough',
      es: 'Respiración y Tos',
      fr: 'Respiration et Toux',
      it: 'Respiro e Tosse',
      el: 'Αναπνευστικό & Βήχας',
      ru: 'Дыхание, кашель и грудь'
    },
    children: [
      {
        id: 'resp_dry_barking_croupy',
        rubricKey: 'resp_dry_barking_croupy',
        name: 'Dry barking croupy cough, suffocative, worse before midnight',
        nameTranslated: {
          de: 'Trockener bellender Krupp-Husten, Erstickungsgefühl, vor Mitternacht',
          en: 'Dry barking croupy cough, suffocative, worse before midnight',
          es: 'Tos seca perruna crupal, sofocación, peor antes de medianoche',
          fr: 'Toux sèche aboyante de faux-croup, suffocation, avant minuit',
          it: 'Tosse secca abbaiante tipo croup, soffocamento, prima di mezzanotte',
          el: 'Ξηρός υλακτικός βήχας κρούπ, αίσθημα ασφυξίας πριν τα μεσάνυχτα',
          ru: 'Сухой лающий крупозный кашель, удушье, хуже до полуночи'
        },
        remedyCount: 7,
        remedyGrades: {
          'aconitum-napellus': 4,
          'spongia-tosta': 4,
          'hepar-sulfuris': 4,
          'drosera-rotundifolia': 3,
          'bromium': 2,
        }
      },
      {
        id: 'resp_loose_rattling_mucus',
        rubricKey: 'resp_rattling_mucus_weak_expulsion',
        name: 'Rattling of loose mucus in chest, too weak to expectorate',
        nameTranslated: {
          de: 'Rasseln von viel Schleim auf der Brust, zu schwach zum Abhusten',
          en: 'Rattling of loose mucus in chest, too weak to expectorate',
          es: 'Estertores de moco en el pecho, sin fuerza para expectorar',
          fr: 'Râles muqueux abondants, trop faible pour expectorer',
          it: 'Rantoli di muco nel petto, troppo debole per espettorare',
          el: 'Βρόγχος βλέννας στο στήθος, αδυναμία απόχρεμψης λόγω εξάντλησης',
          ru: 'Обильные хрипы в груди, больной слишком слаб, чтобы откашлять'
        },
        remedyCount: 7,
        remedyGrades: {
          'antimonium-tartaricum': 4,
          'ipecacuanha': 3,
          'kali-bichromicum': 3,
          'hepar-sulfuris': 2,
          'phosphorus': 2,
        }
      }
    ]
  },

  // 15. LOCOMOTOR & EXTREMITIES (BEWEGUNGSAPPARAT & EXTREMITÄTEN)
  {
    id: 'locomotor',
    name: 'Locomotor & Extremities (Bewegungsapparat & Rücken)',
    nameTranslated: {
      de: 'Bewegungsapparat & Rücken',
      en: 'Locomotor & Extremities',
      es: 'Aparato locomotor y Extremidades',
      fr: 'Appareil locomoteur et Extrémités',
      it: 'Apparato locomotore e Arti',
      el: 'Μυοσκελετικό & Άκρα',
      ru: 'Опорно-двигательный аппарат и конечности'
    },
    children: [
      {
        id: 'loco_trauma_bruised_bed_hard',
        rubricKey: 'trauma_bruised_sore_bed_hard',
        name: 'Bruised soreness after trauma, falls, bed feels too hard',
        nameTranslated: {
          de: 'Zerschlagenheitsgefühl nach Sturz & Trauma, Bett zu hart',
          en: 'Bruised soreness after trauma, falls, bed feels too hard',
          es: 'Magulladura dolorosa tras caídas o golpes, la cama parece dura',
          fr: 'Courbature douloureuse après chute et choc, le lit paraît trop dur',
          it: 'Indolenzimento da contusione dopo caduta, il letto sembra duro',
          el: 'Αίσθημα μωλωπισμού μετά από πτώση, το κρεβάτι φαίνεται πολύ σκληρό',
          ru: 'Болезненная разбитость после травмы, постель кажется слишком твёрдой'
        },
        remedyCount: 6,
        remedyGrades: {
          'arnica-montana': 4,
          'bellis-perennis': 3,
          'rhus-toxicodendron': 2,
          'ruta-graveolens': 2,
          'baptisia-tinctoria': 2,
        }
      },
      {
        id: 'loco_first_motion_worse_continued_better',
        rubricKey: 'loco_first_motion_worse_continued_better',
        name: 'Stiffness worse first motion, relieved by continuous motion',
        nameTranslated: {
          de: 'Steifigkeit bei Beginn der Bewegung, Besserung durch Gehen',
          en: 'Stiffness worse first motion, relieved by continuous motion',
          es: 'Rigidez peor al primer movimiento, alivia con movimiento continuo',
          fr: 'Raideur pire au début du mouvement, soulagée par la marche continue',
          it: 'Rigidità che peggiora al primo movimento, migliora camminando',
          el: 'Δυσκαμψία χειρότερα στην αρχή της κίνησης, βελτίωση με συνεχή κίνηση',
          ru: 'Скованность хуже в начале движения, облегчение от ходьбы'
        },
        remedyCount: 6,
        remedyGrades: {
          'rhus-toxicodendron': 4,
          'radium-bromatum': 3,
          'ruta-graveolens': 2,
          'bryonia-alba': 1,
          'pulsatilla-pratensis': 1,
        }
      }
    ]
  },

  // 16. SKIN (HAUT)
  {
    id: 'skin',
    name: 'Skin (Haut)',
    nameTranslated: {
      de: 'Haut (Skin)',
      en: 'Skin',
      es: 'Piel',
      fr: 'Peau',
      it: 'Pelle',
      el: 'Δέρμα',
      ru: 'Кожа'
    },
    children: [
      {
        id: 'skin_itching_warmth_bed_worse',
        rubricKey: 'skin_itching_warmth_bed_worse',
        name: 'Voluptuous itching, scratching till it bleeds, worse warmth of bed',
        nameTranslated: {
          de: 'Heftiges Jucken, Kratzen bis aufs Blut, schlimmer Bettwärme & Waschen',
          en: 'Voluptuous itching, scratching till it bleeds, worse warmth of bed',
          es: 'Prurito voluptuoso, se rasca hasta sangrar, peor calor de la cama',
          fr: 'Démangeaisons voluptueuses, gratte jusqu’au sang, pire chaleur du lit',
          it: 'Prurito voluttuoso, si gratta a sangue, peggiora col caldo del letto',
          el: 'Έντονος κνησμός, ξύνεται μέχρι αίματος, χειρότερα με τη ζέστη του κρεβατιού',
          ru: 'Мучительный зуд, расчёсывает до крови, хуже от тепла постели'
        },
        remedyCount: 7,
        remedyGrades: {
          'sulfur': 4,
          'psorinum': 4,
          'mercurius-solubilis': 3,
          'rhus-toxicodendron': 2,
          'arsenicum-album': 2,
        }
      }
    ]
  },

  // 17. SLEEP & DREAMS (SCHLAF & TRÄUME)
  {
    id: 'sleep',
    name: 'Sleep & Dreams (Schlaf & Träume)',
    nameTranslated: {
      de: 'Schlaf & Träume',
      en: 'Sleep & Dreams',
      es: 'Sueño y Sueños',
      fr: 'Sommeil et Rêves',
      it: 'Sonno e Sogni',
      el: 'Ύπνος & Όνειρα',
      ru: 'Сон и сновидения'
    },
    children: [
      {
        id: 'sleep_waking_3am_mental_rush',
        rubricKey: 'sleep_waking_3am_mental_rush',
        name: 'Wakes 3:00 to 4:00 AM with crowding of thoughts, falls asleep at dawn',
        nameTranslated: {
          de: 'Erwachen um 3 Uhr morgens mit Gedankenandrang, schläft morgens schwer ein',
          en: 'Wakes 3:00 to 4:00 AM with crowding of thoughts, falls asleep at dawn',
          es: 'Despierta a las 3–4 AM con flujo mental, se duerme tarde con cansancio',
          fr: 'Réveil à 3h–4h du matin avec afflux d’idées, s’endort au matin épuisé',
          it: 'Risveglio alle 3–4 del mattino con pensieri affollati, si riaddormenta tardi',
          el: 'Αφύπνιση 3–4 π.μ. με καταιγισμό σκέψεων, ξανακοιμάται τα ξημερώματα',
          ru: 'Пробуждение в 3–4 часа утра с наплывом мыслей, засыпает на рассвете'
        },
        remedyCount: 6,
        remedyGrades: {
          'nux-vomica': 4,
          'coffea-cruda': 3,
          'kali-carbonicum': 3,
          'arsenicum-album': 2,
        }
      }
    ]
  },

  // 18. FEVER & CHILL (FIEBER & FROST)
  {
    id: 'fever',
    name: 'Fever & Chill (Fieber & Frost)',
    nameTranslated: {
      de: 'Fieber & Frost (Fever)',
      en: 'Fever & Chill',
      es: 'Fiebre y Escalofríos',
      fr: 'Fièvre et Frissons',
      it: 'Febbre e Brividi',
      el: 'Πυρετός & Ρίγος',
      ru: 'Лихорадка и озноб'
    },
    children: [
      {
        id: 'fever_dry_burning_restless_no_sweat',
        rubricKey: 'fever_dry_burning_restless_no_sweat',
        name: 'High dry burning heat, intense thirst, dark red face, restlessness',
        nameTranslated: {
          de: 'Hohes Fieber, trockene brennende Hitze, kein Schweiß, Unruhe & Durst',
          en: 'High dry burning heat, intense thirst, dark red face, restlessness',
          es: 'Fiebre alta ardiente seca, sin sudor, gran sed e inquietud',
          fr: 'Forte fièvre brûlante sèche, sans sueur, grande soif et agitation',
          it: 'Febbre alta bruciante e secca, senza sudore, grande sete e irrequietezza',
          el: 'Υψηλός ξηρός καυστικός πυρετός, χωρίς ιδρώτα, δίψα & ανησυχία',
          ru: 'Высокая лихорадка, сухой жгучий жар, без пота, беспокойство и жажда'
        },
        remedyCount: 6,
        remedyGrades: {
          'aconitum-napellus': 4,
          'belladonna': 4,
          'ferrum-phosphoricum': 3,
          'gelsemium-sempervirens': 2,
        }
      },
      {
        id: 'fever_bone_aching',
        rubricKey: 'fever_bone_aching_break_bone',
        name: 'Deep severe aching in bones as if broken with great chilliness',
        nameTranslated: {
          de: 'Knochenschmerzen wie zerschlagen/gebrochen bei Grippe & Schüttelfrost',
          en: 'Deep severe aching in bones as if broken with great chilliness',
          es: 'Dolores óseos profundos como si estuvieran rotos, con escalofríos',
          fr: 'Douleurs osseuses profondes comme brisées avec frissons intenses',
          it: 'Dolori profondi alle ossa come spezzate con forti brividi',
          el: 'Βαθύς πόνος στα οστά σαν σπασμένα, έντονο ρίγος',
          ru: 'Ломота в костях как будто они сломаны, сильный озноб'
        },
        remedyCount: 5,
        remedyGrades: {
          'eupatorium-perfoliatum': 4,
          'bryonia-alba': 3,
          'rhus-toxicodendron': 3,
          'gelsemium-sempervirens': 2,
        }
      }
    ]
  },

  // 19. MODALITIES (MODALITÄTEN NACH BOERICKE)
  {
    id: 'modalities',
    name: 'Modalities (Modalitäten & Bedingungen)',
    nameTranslated: {
      de: 'Modalitäten & Bedingungen',
      en: 'Modalities & Conditions',
      es: 'Modalidades & Condiciones',
      fr: 'Modalités & Conditions',
      it: 'Modalità & Condizioni',
      el: 'Τροποποιητικοί παράγοντες',
      ru: 'Модальности и условия'
    },
    children: [
      {
        id: 'mod_better_open_air',
        rubricKey: 'mod_better_open_air',
        name: 'Open air & cool fresh breeze – Better',
        nameTranslated: {
          de: 'Frische Luft & Kühle – Besserung',
          en: 'Open air & cool fresh breeze – Better',
          es: 'Aire libre y frescor – Mejor',
          fr: 'Air frais et brise fraîche – Amélioration',
          it: 'Aria fresca e brezza – Miglioramento',
          el: 'Φρέσκος αέρας – Βελτίωση',
          ru: 'Свежий прохладный воздух – Улучшение'
        },
        remedyCount: 7,
        remedyGrades: {
          'pulsatilla-pratensis': 4,
          'allium-cepa': 4,
          'apis-mellifica': 3,
          'argentum-nitricum': 2,
          'kali-sulphuricum': 2,
        }
      },
      {
        id: 'mod_worse_cold_dry_wind',
        rubricKey: 'mod_worse_cold_dry_wind',
        name: 'Cold dry wind & draft – Worse',
        nameTranslated: {
          de: 'Kalter trockener Wind & Zugluft – Verschlechterung',
          en: 'Cold dry wind & draft – Worse',
          es: 'Viento frío y seco, corrientes – Peor',
          fr: 'Vent froid et sec, courants d’air – Aggravation',
          it: 'Vento freddo e asciutto, spifferi – Peggioramento',
          el: 'Κρύος ξηρός άνεμος & ρεύματα – Επιδείνωση',
          ru: 'Холодный сухой ветер и сквозняк – Ухудшение'
        },
        remedyCount: 7,
        remedyGrades: {
          'aconitum-napellus': 4,
          'hepar-sulfuris': 4,
          'causticum': 3,
          'nux-vomica': 3,
          'silicea': 2,
        }
      },
      {
        id: 'mod_better_heat_warm_applications',
        rubricKey: 'mod_better_heat_warm_applications',
        name: 'Heat, warm applications, warm room – Better',
        nameTranslated: {
          de: 'Wärme, heiße Umschläge, warmes Zimmer – Besserung',
          en: 'Heat, warm applications, warm room – Better',
          es: 'Calor, aplicaciones calientes – Mejor',
          fr: 'Chaleur, compresses chaudes – Amélioration',
          it: 'Calore, applicazioni calde – Miglioramento',
          el: 'Θερμότητα, ζεστά επιθέματα – Βελτίωση',
          ru: 'Тепло, горячие компрессы, тёплая комната – Улучшение'
        },
        remedyCount: 8,
        remedyGrades: {
          'arsenicum-album': 4,
          'magnesium-phosphoricum': 4,
          'hepar-sulfuris': 4,
          'silicea': 3,
          'rhus-toxicodendron': 3,
        }
      },
      {
        id: 'mod_worse_4_to_8_pm',
        rubricKey: 'mod_worse_4_to_8_pm',
        name: 'Time modality: Aggravation regularly from 4:00 to 8:00 PM',
        nameTranslated: {
          de: 'Zeit-Modalität: Verschlimmerung regelmäßig 16:00 bis 20:00 Uhr',
          en: 'Time modality: Aggravation regularly from 4:00 to 8:00 PM',
          es: 'Modalidad horaria: Peor regularmente de 16:00 a 20:00 hs',
          fr: 'Modalité horaire: Pire régulièrement de 16h à 20h',
          it: 'Modalità oraria: Peggiora regolarmente dalle 16:00 alle 20:00',
          el: 'Χρονική επιδείνωση τακτικά 4 έως 8 μ.μ.',
          ru: 'Временная модальность: Ухудшение регулярно с 16 до 20 часов'
        },
        remedyCount: 5,
        remedyGrades: {
          'lycopodium-clavatum': 4,
          'colocynthis': 2,
          'causticum': 2,
        }
      }
    ]
  }
];

export const SYMPTOM_PALETTE = [
  { border: 'border-rose-400', bg: 'bg-rose-50', dot: 'bg-rose-500', text: 'text-rose-700', hex: '#f43f5e' },
  { border: 'border-emerald-400', bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700', hex: '#10b981' },
  { border: 'border-sky-400', bg: 'bg-sky-50', dot: 'bg-sky-500', text: 'text-sky-700', hex: '#0ea5e9' },
  { border: 'border-purple-400', bg: 'bg-purple-50', dot: 'bg-purple-500', text: 'text-purple-700', hex: '#a855f7' },
  { border: 'border-amber-400', bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700', hex: '#f59e0b' },
  { border: 'border-teal-400', bg: 'bg-teal-50', dot: 'bg-teal-500', text: 'text-teal-700', hex: '#14b8a6' },
  { border: 'border-indigo-400', bg: 'bg-indigo-50', dot: 'bg-indigo-500', text: 'text-indigo-700', hex: '#6366f1' },
  { border: 'border-pink-400', bg: 'bg-pink-50', dot: 'bg-pink-500', text: 'text-pink-700', hex: '#ec4899' },
];

/**
 * Calculates authentic Boericke Repertorisation:
 * Evaluates all entered/selected symptoms with their respective weight.
 * Multiplies symptom weight (1..4) with remedy rubric grade (1..4).
 */
export function calculateBoerickeRepertorisation(
  symptoms: SelectedRepertorySymptom[],
  allRemedies: { id: string; latinName: string; commonName?: string; isPolychrest?: boolean }[],
  authorFilter: ClassicalAuthorFilterKey | ClassicalAuthorFilterKey[] = 'all'
): BoerickeRepertoryRankResult[] {
  if (symptoms.length === 0) return [];

  const remedyMap = new Map<string, {
    remedyKey: string;
    latinName: string;
    commonName: string;
    totalScore: number;
    coverageCount: number;
    rubricHits: Record<string, { grade: SymptomWeightGrade; scoreContribution: number }>;
    isPolychrest: boolean;
  }>();

  const getRemedyInfo = (key: string) => {
    const found = allRemedies.find(r => r.id === key);
    if (found) {
      return {
        latinName: found.latinName,
        commonName: found.commonName || '',
        isPolychrest: Boolean(found.isPolychrest)
      };
    }
    const latin = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { latinName: latin, commonName: '', isPolychrest: false };
  };

  const authorFilters = Array.isArray(authorFilter) ? authorFilter : [authorFilter];

  symptoms.forEach(sym => {
    const symWeight = sym.weight ?? 1;
    Object.entries(sym.remedyGrades).forEach(([remedyKey, grade]) => {
      if (!grade || grade <= 0) return;

      // Author Filter Check
      if (authorFilters.length > 0 && !authorFilters.includes('all')) {
        if (!matchesAuthorFilters(remedyKey, authorFilters)) {
          return;
        }
      }

      const scoreContribution = symWeight * grade;

      let entry = remedyMap.get(remedyKey);
      if (!entry) {
        const info = getRemedyInfo(remedyKey);
        entry = {
          remedyKey,
          latinName: info.latinName,
          commonName: info.commonName,
          totalScore: 0,
          coverageCount: 0,
          rubricHits: {},
          isPolychrest: info.isPolychrest
        };
        remedyMap.set(remedyKey, entry);
      }

      entry.totalScore += scoreContribution;
      entry.coverageCount += 1;
      entry.rubricHits[sym.id] = {
        grade: grade as SymptomWeightGrade,
        scoreContribution
      };
    });
  });

  const totalSymptoms = symptoms.length;

  const results: BoerickeRepertoryRankResult[] = Array.from(remedyMap.values()).map(r => ({
    ...r,
    totalSymptoms,
    isFullCoverage: r.coverageCount === totalSymptoms
  }));

  results.sort((a, b) => {
    if (b.coverageCount !== a.coverageCount) {
      return b.coverageCount - a.coverageCount;
    }
    return b.totalScore - a.totalScore;
  });

  return results;
}
