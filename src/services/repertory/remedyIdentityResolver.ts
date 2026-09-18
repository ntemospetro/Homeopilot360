import { CanonicalRemedyIdentity } from './canonicalTypes';

const KNOWN_REMEDIES: CanonicalRemedyIdentity[] = [
  {
    canonical_id: 'bryonia-alba',
    abbreviation: 'bry',
    latin_name: 'Bryonia alba',
    alternative_ids: ['bry', 'bryonia'],
    source_specific_ids: { kent: 'bry', allen: 'bryonia-alba', boericke: 'bryonia' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'aconitum-napellus',
    abbreviation: 'acon',
    latin_name: 'Aconitum napellus',
    alternative_ids: ['acon', 'aconitum'],
    source_specific_ids: { kent: 'acon', allen: 'aconitum-napellus', boericke: 'aconitum' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'arsenicum-album',
    abbreviation: 'ars',
    latin_name: 'Arsenicum album',
    alternative_ids: ['ars', 'arsenicum'],
    source_specific_ids: { kent: 'ars', allen: 'arsenicum-album', boericke: 'arsenicum' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'rhus-toxicodendron',
    abbreviation: 'rhus_t',
    latin_name: 'Rhus toxicodendron',
    alternative_ids: ['rhus-t', 'rhustox', 'rhus_tox'],
    source_specific_ids: { kent: 'rhus_t', allen: 'rhus-toxicodendron', boericke: 'rhus-tox' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'belladonna',
    abbreviation: 'bell',
    latin_name: 'Atropa belladonna',
    alternative_ids: ['bell', 'belladonna'],
    source_specific_ids: { kent: 'bell', allen: 'belladonna' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'apis-mellifica',
    abbreviation: 'apis',
    latin_name: 'Apis mellifica',
    alternative_ids: ['apis'],
    source_specific_ids: { kent: 'apis', allen: 'apis-mellifica' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'chamomilla',
    abbreviation: 'cham',
    latin_name: 'Chamomilla',
    alternative_ids: ['cham'],
    source_specific_ids: { kent: 'cham', allen: 'chamomilla' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'calcarea-carbonica',
    abbreviation: 'calc',
    latin_name: 'Calcarea carbonica',
    alternative_ids: ['calc', 'calc-c'],
    source_specific_ids: { kent: 'calc' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'lycopodium-clavatum',
    abbreviation: 'lyc',
    latin_name: 'Lycopodium clavatum',
    alternative_ids: ['lyc'],
    source_specific_ids: { kent: 'lyc' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'pulsatilla-nigricans',
    abbreviation: 'puls',
    latin_name: 'Pulsatilla nigricans',
    alternative_ids: ['puls'],
    source_specific_ids: { kent: 'puls' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'sepia-officinalis',
    abbreviation: 'sep',
    latin_name: 'Sepia officinalis',
    alternative_ids: ['sep'],
    source_specific_ids: { kent: 'sep' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'silicea',
    abbreviation: 'sil',
    latin_name: 'Silicea terra',
    alternative_ids: ['sil'],
    source_specific_ids: { kent: 'sil' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'sulphur',
    abbreviation: 'sulph',
    latin_name: 'Sulphur',
    alternative_ids: ['sulph'],
    source_specific_ids: { kent: 'sulph' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'graphites',
    abbreviation: 'graph',
    latin_name: 'Graphites',
    alternative_ids: ['graph'],
    source_specific_ids: { kent: 'graph' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'kali-carbonicum',
    abbreviation: 'kali-c',
    latin_name: 'Kali carbonicum',
    alternative_ids: ['kali-c', 'kali_c'],
    source_specific_ids: { kent: 'kali-c' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'calcarea-phosphorica',
    abbreviation: 'calc-p',
    latin_name: 'Calcarea phosphorica',
    alternative_ids: ['calc-p'],
    source_specific_ids: { kent: 'calc-p' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'kali-bichromicum',
    abbreviation: 'kali-bi',
    latin_name: 'Kali bichromicum',
    alternative_ids: ['kali-bi'],
    source_specific_ids: { kent: 'kali-bi' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'veratrum-viride',
    abbreviation: 'verat-v',
    latin_name: 'Veratrum viride',
    alternative_ids: ['verat-v'],
    source_specific_ids: { kent: 'verat-v' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'abrotanum',
    abbreviation: 'abrot',
    latin_name: 'Abrotanum',
    alternative_ids: ['abrot'],
    source_specific_ids: { kent: 'abrot' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'zincum-metallicum',
    abbreviation: 'zinc',
    latin_name: 'Zincum metallicum',
    alternative_ids: ['zinc'],
    source_specific_ids: { kent: 'zinc' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'baptisia-tinctoria',
    abbreviation: 'bapt',
    latin_name: 'Baptisia tinctoria',
    alternative_ids: ['bapt'],
    source_specific_ids: { kent: 'bapt' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'berberis-vulgaris',
    abbreviation: 'berb',
    latin_name: 'Berberis vulgaris',
    alternative_ids: ['berb'],
    source_specific_ids: { kent: 'berb' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'laurocerasus',
    abbreviation: 'laur',
    latin_name: 'Laurocerasus',
    alternative_ids: ['laur'],
    source_specific_ids: { kent: 'laur' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'allium-cepa',
    abbreviation: 'all-c',
    latin_name: 'Allium cepa',
    alternative_ids: ['all-c'],
    source_specific_ids: { kent: 'all-c' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'angustura-vera',
    abbreviation: 'ang',
    latin_name: 'Angustura vera',
    alternative_ids: ['ang'],
    source_specific_ids: { kent: 'ang' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'agaricus-muscarius',
    abbreviation: 'agar',
    latin_name: 'Agaricus muscarius',
    alternative_ids: ['agar'],
    source_specific_ids: { kent: 'agar' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'euphorbium-officinarum',
    abbreviation: 'euph',
    latin_name: 'Euphorbium officinarum',
    alternative_ids: ['euph'],
    source_specific_ids: { kent: 'euph' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'kreosotum',
    abbreviation: 'kreos',
    latin_name: 'Kreosotum',
    alternative_ids: ['kreos'],
    source_specific_ids: { kent: 'kreos' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'mancinella',
    abbreviation: 'manc',
    latin_name: 'Hippomane mancinella',
    alternative_ids: ['manc'],
    source_specific_ids: { kent: 'manc' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'natrum-carbonicum',
    abbreviation: 'nat-c',
    latin_name: 'Natrum carbonicum',
    alternative_ids: ['nat-c'],
    source_specific_ids: { kent: 'nat-c' },
    status: 'RESOLVED'
  },
  {
    canonical_id: 'platina',
    abbreviation: 'plat',
    latin_name: 'Platina',
    alternative_ids: ['plat'],
    source_specific_ids: { kent: 'plat' },
    status: 'RESOLVED'
  },
  { canonical_id: 'ambra-grisea', abbreviation: 'ambr', latin_name: 'Ambra grisea', alternative_ids: ['ambr'], source_specific_ids: { kent: 'ambr' }, status: 'RESOLVED' },
  { canonical_id: 'antimonium-crudum', abbreviation: 'ant-c', latin_name: 'Antimonium crudum', alternative_ids: ['ant-c'], source_specific_ids: { kent: 'ant-c' }, status: 'RESOLVED' },
  { canonical_id: 'apocynum-cannabinum', abbreviation: 'apoc', latin_name: 'Apocynum cannabinum', alternative_ids: ['apoc'], source_specific_ids: { kent: 'apoc' }, status: 'RESOLVED' },
  { canonical_id: 'argentum-nitricum', abbreviation: 'arg-n', latin_name: 'Argentum nitricum', alternative_ids: ['arg-n'], source_specific_ids: { kent: 'arg-n' }, status: 'RESOLVED' },
  { canonical_id: 'arnica-montana', abbreviation: 'arn', latin_name: 'Arnica montana', alternative_ids: ['arn'], source_specific_ids: { kent: 'arn' }, status: 'RESOLVED' },
  { canonical_id: 'arsenicum-iodatum', abbreviation: 'ars-i', latin_name: 'Arsenicum iodatum', alternative_ids: ['ars-i'], source_specific_ids: { kent: 'ars-i' }, status: 'RESOLVED' },
  { canonical_id: 'asarum-europaeum', abbreviation: 'asar', latin_name: 'Asarum europaeum', alternative_ids: ['asar'], source_specific_ids: { kent: 'asar' }, status: 'RESOLVED' },
  { canonical_id: 'baryta-carbonica', abbreviation: 'bar-c', latin_name: 'Baryta carbonica', alternative_ids: ['bar-c'], source_specific_ids: { kent: 'bar-c' }, status: 'RESOLVED' },
  { canonical_id: 'bovista', abbreviation: 'bov', latin_name: 'Bovista', alternative_ids: ['bov'], source_specific_ids: { kent: 'bov' }, status: 'RESOLVED' },
  { canonical_id: 'cannabis-sativa', abbreviation: 'cann-s', latin_name: 'Cannabis sativa', alternative_ids: ['cann-s'], source_specific_ids: { kent: 'cann-s' }, status: 'RESOLVED' },
  { canonical_id: 'carbo-vegetabilis', abbreviation: 'carb-v', latin_name: 'Carbo vegetabilis', alternative_ids: ['carb-v'], source_specific_ids: { kent: 'carb-v' }, status: 'RESOLVED' },
  { canonical_id: 'causticum', abbreviation: 'caust', latin_name: 'Causticum', alternative_ids: ['caust'], source_specific_ids: { kent: 'caust' }, status: 'RESOLVED' },
  { canonical_id: 'chelidonium-majus', abbreviation: 'chel', latin_name: 'Chelidonium majus', alternative_ids: ['chel'], source_specific_ids: { kent: 'chel' }, status: 'RESOLVED' },
  { canonical_id: 'chininum-sulphuricum', abbreviation: 'chin-s', latin_name: 'Chininum sulphuricum', alternative_ids: ['chin-s'], source_specific_ids: { kent: 'chin-s' }, status: 'RESOLVED' },
  { canonical_id: 'clematis-erecta', abbreviation: 'clem', latin_name: 'Clematis erecta', alternative_ids: ['clem'], source_specific_ids: { kent: 'clem' }, status: 'RESOLVED' },
  { canonical_id: 'coffea-cruda', abbreviation: 'coff', latin_name: 'Coffea cruda', alternative_ids: ['coff'], source_specific_ids: { kent: 'coff' }, status: 'RESOLVED' },
  { canonical_id: 'colchicum-autumnale', abbreviation: 'colch', latin_name: 'Colchicum autumnale', alternative_ids: ['colch'], source_specific_ids: { kent: 'colch' }, status: 'RESOLVED' },
  { canonical_id: 'colocynthis', abbreviation: 'coloc', latin_name: 'Colocynthis', alternative_ids: ['coloc'], source_specific_ids: { kent: 'coloc' }, status: 'RESOLVED' },
  { canonical_id: 'croton-tiglium', abbreviation: 'crot-t', latin_name: 'Croton tiglium', alternative_ids: ['crot-t'], source_specific_ids: { kent: 'crot-t' }, status: 'RESOLVED' },
  { canonical_id: 'dioscorea-villosa', abbreviation: 'dios', latin_name: 'Dioscorea villosa', alternative_ids: ['dios'], source_specific_ids: { kent: 'dios' }, status: 'RESOLVED' },
  { canonical_id: 'drosera-rotundifolia', abbreviation: 'dros', latin_name: 'Drosera rotundifolia', alternative_ids: ['dros'], source_specific_ids: { kent: 'dros' }, status: 'RESOLVED' },
  { canonical_id: 'formica-rufa', abbreviation: 'form', latin_name: 'Formica rufa', alternative_ids: ['form'], source_specific_ids: { kent: 'form' }, status: 'RESOLVED' },
  { canonical_id: 'granatum', abbreviation: 'gran', latin_name: 'Granatum', alternative_ids: ['gran'], source_specific_ids: { kent: 'gran' }, status: 'RESOLVED' },
  { canonical_id: 'guajacum', abbreviation: 'guaj', latin_name: 'Guajacum officinale', alternative_ids: ['guaj'], source_specific_ids: { kent: 'guaj' }, status: 'RESOLVED' },
  { canonical_id: 'helleborus-niger', abbreviation: 'hell', latin_name: 'Helleborus niger', alternative_ids: ['hell'], source_specific_ids: { kent: 'hell' }, status: 'RESOLVED' },
  { canonical_id: 'hepar-sulphuris', abbreviation: 'hep', latin_name: 'Hepar sulphuris', alternative_ids: ['hep'], source_specific_ids: { kent: 'hep' }, status: 'RESOLVED' },
  { canonical_id: 'ignatia-amara', abbreviation: 'ign', latin_name: 'Ignatia amara', alternative_ids: ['ign'], source_specific_ids: { kent: 'ign' }, status: 'RESOLVED' },
  { canonical_id: 'indigo', abbreviation: 'indg', latin_name: 'Indigo', alternative_ids: ['indg'], source_specific_ids: { kent: 'indg' }, status: 'RESOLVED' },
  { canonical_id: 'lachesis-mutus', abbreviation: 'lach', latin_name: 'Lachesis mutus', alternative_ids: ['lach'], source_specific_ids: { kent: 'lach' }, status: 'RESOLVED' },
  { canonical_id: 'ledum-palustre', abbreviation: 'led', latin_name: 'Ledum palustre', alternative_ids: ['led'], source_specific_ids: { kent: 'led' }, status: 'RESOLVED' },
  { canonical_id: 'lithium-carbonicum', abbreviation: 'lith', latin_name: 'Lithium carbonicum', alternative_ids: ['lith'], source_specific_ids: { kent: 'lith' }, status: 'RESOLVED' },
  { canonical_id: 'manganum', abbreviation: 'mang', latin_name: 'Manganum', alternative_ids: ['mang'], source_specific_ids: { kent: 'mang' }, status: 'RESOLVED' },
  { canonical_id: 'mercurius-solubilis', abbreviation: 'merc', latin_name: 'Mercurius solubilis', alternative_ids: ['merc'], source_specific_ids: { kent: 'merc' }, status: 'RESOLVED' },
  { canonical_id: 'moschus', abbreviation: 'mosch', latin_name: 'Moschus', alternative_ids: ['mosch'], source_specific_ids: { kent: 'mosch' }, status: 'RESOLVED' },
  { canonical_id: 'natrum-muriaticum', abbreviation: 'nat-m', latin_name: 'Natrum muriaticum', alternative_ids: ['nat-m'], source_specific_ids: { kent: 'nat-m' }, status: 'RESOLVED' },
  { canonical_id: 'oleum-animalis', abbreviation: 'ol-an', latin_name: 'Oleum animalis', alternative_ids: ['ol-an'], source_specific_ids: { kent: 'ol-an' }, status: 'RESOLVED' },
  { canonical_id: 'petroleum', abbreviation: 'petr', latin_name: 'Petroleum', alternative_ids: ['petr'], source_specific_ids: { kent: 'petr' }, status: 'RESOLVED' },
  { canonical_id: 'phosphorus', abbreviation: 'phos', latin_name: 'Phosphorus', alternative_ids: ['phos'], source_specific_ids: { kent: 'phos' }, status: 'RESOLVED' },
  { canonical_id: 'psorinum', abbreviation: 'psor', latin_name: 'Psorinum', alternative_ids: ['psor'], source_specific_ids: { kent: 'psor' }, status: 'RESOLVED' },
  { canonical_id: 'rhododendron-chrysanthum', abbreviation: 'rhodo', latin_name: 'Rhododendron chrysanthum', alternative_ids: ['rhodo'], source_specific_ids: { kent: 'rhodo' }, status: 'RESOLVED' },
  { canonical_id: 'ruta-graveolens', abbreviation: 'ruta', latin_name: 'Ruta graveolens', alternative_ids: ['ruta'], source_specific_ids: { kent: 'ruta' }, status: 'RESOLVED' },
  { canonical_id: 'sanguinaria-canadensis', abbreviation: 'sang', latin_name: 'Sanguinaria canadensis', alternative_ids: ['sang'], source_specific_ids: { kent: 'sang' }, status: 'RESOLVED' },
  { canonical_id: 'spigelia-anthelmia', abbreviation: 'spig', latin_name: 'Spigelia anthelmia', alternative_ids: ['spig'], source_specific_ids: { kent: 'spig' }, status: 'RESOLVED' },
  { canonical_id: 'staphysagria', abbreviation: 'staph', latin_name: 'Staphysagria', alternative_ids: ['staph'], source_specific_ids: { kent: 'staph' }, status: 'RESOLVED' },
  { canonical_id: 'strontium-carbonicum', abbreviation: 'stront', latin_name: 'Strontium carbonicum', alternative_ids: ['stront'], source_specific_ids: { kent: 'stront' }, status: 'RESOLVED' },
  { canonical_id: 'thuja-occidentalis', abbreviation: 'thuj', latin_name: 'Thuja occidentalis', alternative_ids: ['thuj'], source_specific_ids: { kent: 'thuj' }, status: 'RESOLVED' },
  { canonical_id: 'viola-tricolor', abbreviation: 'viol-t', latin_name: 'Viola tricolor', alternative_ids: ['viol-t'], source_specific_ids: { kent: 'viol-t' }, status: 'RESOLVED' },
  { canonical_id: 'iodum', abbreviation: 'iod', latin_name: 'Iodum', alternative_ids: ['iod'], source_specific_ids: { kent: 'iod' }, status: 'RESOLVED' },
  { canonical_id: 'acidum-nitricum', abbreviation: 'nit-ac', latin_name: 'Acidum nitricum', alternative_ids: ['nit-ac'], source_specific_ids: { kent: 'nit-ac' }, status: 'RESOLVED' },
  { canonical_id: 'valeriana-officinalis', abbreviation: 'valer', latin_name: 'Valeriana officinalis', alternative_ids: ['valer'], source_specific_ids: { kent: 'valer' }, status: 'RESOLVED' },
  { canonical_id: 'coccus-cacti', abbreviation: 'coc-c', latin_name: 'Coccus cacti', alternative_ids: ['coc-c'], source_specific_ids: { kent: 'coc-c' }, status: 'RESOLVED' },
  { canonical_id: 'paris-quadrifolia', abbreviation: 'par', latin_name: 'Paris quadrifolia', alternative_ids: ['par'], source_specific_ids: { kent: 'par' }, status: 'RESOLVED' },
  { canonical_id: 'taraxacum-officinale', abbreviation: 'tarax', latin_name: 'Taraxacum officinale', alternative_ids: ['tarax'], source_specific_ids: { kent: 'tarax' }, status: 'RESOLVED' },
  { canonical_id: 'sarsaparilla', abbreviation: 'sars', latin_name: 'Sarsaparilla', alternative_ids: ['sars'], source_specific_ids: { kent: 'sars' }, status: 'RESOLVED' },
  { canonical_id: 'aurum-metallicum', abbreviation: 'aur', latin_name: 'Aurum metallicum', alternative_ids: ['aur'], source_specific_ids: { kent: 'aur' }, status: 'RESOLVED' },
  { canonical_id: 'aurum-muriaticum-natronatum', abbreviation: 'aur-m-n', latin_name: 'Aurum muriaticum natronatum', alternative_ids: ['aur-m-n'], source_specific_ids: { kent: 'aur-m-n' }, status: 'RESOLVED' },
  { canonical_id: 'bromium', abbreviation: 'brom', latin_name: 'Bromium', alternative_ids: ['brom'], source_specific_ids: { kent: 'brom' }, status: 'RESOLVED' },
  { canonical_id: 'camphora', abbreviation: 'camph', latin_name: 'Camphora', alternative_ids: ['camph'], source_specific_ids: { kent: 'camph' }, status: 'RESOLVED' },
  { canonical_id: 'digitalis-purpurea', abbreviation: 'dig', latin_name: 'Digitalis purpurea', alternative_ids: ['dig'], source_specific_ids: { kent: 'dig' }, status: 'RESOLVED' },
  { canonical_id: 'mezereum', abbreviation: 'mez', latin_name: 'Mezereum', alternative_ids: ['mez'], source_specific_ids: { kent: 'mez' }, status: 'RESOLVED' },
  { canonical_id: 'natrum-sulphuricum', abbreviation: 'nat-s', latin_name: 'Natrum sulphuricum', alternative_ids: ['nat-s'], source_specific_ids: { kent: 'nat-s' }, status: 'RESOLVED' },
  { canonical_id: 'senega', abbreviation: 'seneg', latin_name: 'Senega', alternative_ids: ['seneg'], source_specific_ids: { kent: 'seneg' }, status: 'RESOLVED' },
  { canonical_id: 'sulphuricum-acidum', abbreviation: 'sul-ac', latin_name: 'Sulphuricum acidum', alternative_ids: ['sul-ac'], source_specific_ids: { kent: 'sul-ac' }, status: 'RESOLVED' },
  { canonical_id: 'veratrum-album', abbreviation: 'verat', latin_name: 'Veratrum album', alternative_ids: ['verat'], source_specific_ids: { kent: 'verat' }, status: 'RESOLVED' },
  { canonical_id: 'verbascum-thapsus', abbreviation: 'verb', latin_name: 'Verbascum thapsus', alternative_ids: ['verb'], source_specific_ids: { kent: 'verb' }, status: 'RESOLVED' },
  { canonical_id: 'cuprum-metallicum', abbreviation: 'cupr', latin_name: 'Cuprum metallicum', alternative_ids: ['cupr'], source_specific_ids: { kent: 'cupr' }, status: 'RESOLVED' },
  { canonical_id: 'sabina', abbreviation: 'sabin', latin_name: 'Sabina', alternative_ids: ['sabin'], source_specific_ids: { kent: 'sabin' }, status: 'RESOLVED' },
  { canonical_id: 'ginseng', abbreviation: 'gins', latin_name: 'Ginseng', alternative_ids: ['gins'], source_specific_ids: { kent: 'gins' }, status: 'RESOLVED' },
  { canonical_id: 'manganum-muriaticum', abbreviation: 'mang-m', latin_name: 'Manganum muriaticum', alternative_ids: ['mang-m'], source_specific_ids: { kent: 'mang-m' }, status: 'RESOLVED' },
  // Kent scan variant abbreviation 'bism.' resolved to 'bism-ox.' / Bismuthum oxidum based on Kent remedy abbreviation list.
  { canonical_id: 'bismuthum-oxidum', abbreviation: 'bism-ox', latin_name: 'Bismuthum oxidum', alternative_ids: ['bism-ox', 'bism'], source_specific_ids: { kent: 'bism-ox', kent_scan: 'bism' }, status: 'RESOLVED' },
  { canonical_id: 'alumina', abbreviation: 'alum', latin_name: 'Alumina', alternative_ids: ['alum'], source_specific_ids: { kent: 'alum' }, status: 'RESOLVED' },
  { canonical_id: 'ammonium-carbonicum', abbreviation: 'am-c', latin_name: 'Ammonium carbonicum', alternative_ids: ['am-c'], source_specific_ids: { kent: 'am-c' }, status: 'RESOLVED' },
  { canonical_id: 'ammoniacum', abbreviation: 'ammc', latin_name: 'Ammoniacum gummi', alternative_ids: ['ammc'], source_specific_ids: { kent: 'ammc' }, status: 'RESOLVED' },
  { canonical_id: 'argentum-metallicum', abbreviation: 'arg-m', latin_name: 'Argentum metallicum', alternative_ids: ['arg-m'], source_specific_ids: { kent: 'arg-m' }, status: 'RESOLVED' },
  { canonical_id: 'carbo-animalis', abbreviation: 'carb-an', latin_name: 'Carbo animalis', alternative_ids: ['carb-an'], source_specific_ids: { kent: 'carb-an' }, status: 'RESOLVED' },
  { canonical_id: 'carboneum-sulphuratum', abbreviation: 'carb-s', latin_name: 'Carboneum sulphuratum', alternative_ids: ['carb-s'], source_specific_ids: { kent: 'carb-s' }, status: 'RESOLVED' },
  { canonical_id: 'china-officinalis', abbreviation: 'chin', latin_name: 'China officinalis', alternative_ids: ['chin'], source_specific_ids: { kent: 'chin' }, status: 'RESOLVED' },
  { canonical_id: 'conium-maculatum', abbreviation: 'con', latin_name: 'Conium maculatum', alternative_ids: ['con'], source_specific_ids: { kent: 'con' }, status: 'RESOLVED' },
  { canonical_id: 'kali-nitricum', abbreviation: 'kali-n', latin_name: 'Kali nitricum', alternative_ids: ['kali-n'], source_specific_ids: { kent: 'kali-n' }, status: 'RESOLVED' },
  { canonical_id: 'lac-caninum', abbreviation: 'lac-c', latin_name: 'Lac caninum', alternative_ids: ['lac-c'], source_specific_ids: { kent: 'lac-c' }, status: 'RESOLVED' },
  { canonical_id: 'lactuca-virosa', abbreviation: 'lact', latin_name: 'Lactuca virosa', alternative_ids: ['lact'], source_specific_ids: { kent: 'lact' }, status: 'RESOLVED' },
  { canonical_id: 'ratanhia', abbreviation: 'rat', latin_name: 'Ratanhia', alternative_ids: ['rat'], source_specific_ids: { kent: 'rat' }, status: 'RESOLVED' },
  { canonical_id: 'rumex-crispus', abbreviation: 'rumx', latin_name: 'Rumex crispus', alternative_ids: ['rumx'], source_specific_ids: { kent: 'rumx' }, status: 'RESOLVED' },
  { canonical_id: 'sambucus-nigra', abbreviation: 'samb', latin_name: 'Sambucus nigra', alternative_ids: ['samb'], source_specific_ids: { kent: 'samb' }, status: 'RESOLVED' },
  { canonical_id: 'spongia-tosta', abbreviation: 'spong', latin_name: 'Spongia tosta', alternative_ids: ['spong'], source_specific_ids: { kent: 'spong' }, status: 'RESOLVED' },
  { canonical_id: 'stannum-metallicum', abbreviation: 'stann', latin_name: 'Stannum metallicum', alternative_ids: ['stann'], source_specific_ids: { kent: 'stann' }, status: 'RESOLVED' },
  { canonical_id: 'teplitz', abbreviation: 'tep', latin_name: 'Teplitz', alternative_ids: ['tep'], source_specific_ids: { kent: 'tep' }, status: 'RESOLVED' },
  { canonical_id: 'teucrium-marum', abbreviation: 'teucr', latin_name: 'Teucrium marum verum', alternative_ids: ['teucr'], source_specific_ids: { kent: 'teucr' }, status: 'RESOLVED' },
  { canonical_id: 'tilia-europaea', abbreviation: 'til', latin_name: 'Tilia europaea', alternative_ids: ['til'], source_specific_ids: { kent: 'til' }, status: 'RESOLVED' },
  { canonical_id: 'plantago-major', abbreviation: 'plant', latin_name: 'Plantago major', alternative_ids: ['plant'], source_specific_ids: { kent: 'plant' }, status: 'RESOLVED' },
  { canonical_id: 'mercurialis', abbreviation: 'merl', latin_name: 'Mercurialis', alternative_ids: ['merl'], source_specific_ids: { kent: 'merl' }, status: 'RESOLVED' },
  { canonical_id: 'gratiola-officinalis', abbreviation: 'grat', latin_name: 'Gratiola officinalis', alternative_ids: ['grat'], source_specific_ids: { kent: 'grat' }, status: 'RESOLVED' },
  { canonical_id: 'cantharis', abbreviation: 'canth', latin_name: 'Cantharis vesicatoria', alternative_ids: ['canth'], source_specific_ids: { kent: 'canth' }, status: 'RESOLVED' },
  { canonical_id: 'magnesia-muriatica', abbreviation: 'mag-m', latin_name: 'Magnesia muriatica', alternative_ids: ['mag-m'], source_specific_ids: { kent: 'mag-m' }, status: 'RESOLVED' }
];

export function resolveRemedyIdentity(rawId: string): CanonicalRemedyIdentity {
  const clean = rawId.trim().toLowerCase();
  for (const rem of KNOWN_REMEDIES) {
    if (rem.canonical_id === clean || rem.abbreviation === clean || rem.alternative_ids.includes(clean)) {
      return rem;
    }
    for (const [src, sId] of Object.entries(rem.source_specific_ids)) {
      if (sId.toLowerCase() === clean) {
        return rem;
      }
    }
  }

  // Unresolved fallback
  return {
    canonical_id: clean,
    abbreviation: clean,
    latin_name: rawId,
    alternative_ids: [],
    source_specific_ids: { unknown: rawId },
    status: 'UNRESOLVED'
  };
}
