import { IndianState } from './CultureTypes';

export interface StateVisualProfile {
  id: IndianState;
  displayName: string;
  regionalHeritage: string;
  terrainAssetSet: string;
  vegetationAssetSet: string;
  architectureAssetSet: string;
  decorationAssetSet: string;
  materialSet: string;
  characterAssetSet: string;
  landmarkAssets: string[];
  buildingAssets: string[];
  craftAssets: string[];
  environmentalProps: string[];
  landscapeProfile: string;
}

export const STATE_VISUAL_PROFILES: Record<IndianState, StateVisualProfile> = {
  bihar: {
    id: 'bihar',
    displayName: 'Bihar (Mithila)',
    regionalHeritage: 'Mithila / Madhubani art, Sikki golden grass crafts, terracotta clay vessels',
    terrainAssetSet: 'bihar_alluvial_earth',
    vegetationAssetSet: 'bihar_peepal_banana_bamboo',
    architectureAssetSet: 'bihar_mithila_cottages',
    decorationAssetSet: 'bihar_madhubani_murals',
    materialSet: 'bihar_clay_ochre_plaster',
    characterAssetSet: 'specialist_mithila_artisan',
    landmarkAssets: ['mithila_art_pavilion', 'tulsi_chaura', 'earthen_workshop'],
    buildingAssets: ['earthen_village_house', 'bamboo_farm', 'sikki_bazaar_stall', 'craft_atelier'],
    craftAssets: ['sikki_grass_baskets', 'terracotta_diyas', 'madhubani_canvas', 'pigment_pots'],
    environmentalProps: ['marigold_clumps', 'earthen_matkas', 'charpai_cot', 'bamboo_fences'],
    landscapeProfile: 'Fertile alluvial plain with clay-paved courtyards and riverbank silt'
  },
  maharashtra: {
    id: 'maharashtra',
    displayName: 'Maharashtra (Sahyadri)',
    regionalHeritage: 'Sahyadri hill forts, Maratha wada architecture, Paithani silk weaving',
    terrainAssetSet: 'maha_basalt_plateau',
    vegetationAssetSet: 'maha_banyan_teak_scrub',
    architectureAssetSet: 'maha_sahyadri_forts',
    decorationAssetSet: 'maha_paithani_zari_flags',
    materialSet: 'maha_dark_basalt_timber',
    characterAssetSet: 'specialist_sahyadri_architect',
    landmarkAssets: ['sahyadri_heritage_gateway', 'fort_watchtower', 'stone_bastion'],
    buildingAssets: ['stone_timber_wada', 'terraced_hill_farm', 'fortified_bazaar', 'paithani_loom_house'],
    craftAssets: ['paithani_silk_saree', 'zari_pallu_banner', 'brass_ghagar', 'cannonball_stack'],
    environmentalProps: ['basalt_boulders', 'saffron_flags', 'stone_retaining_walls', 'grinding_stone'],
    landscapeProfile: 'Rugged elevated basalt rock plateau with fortified terraces and stone steps'
  },
  west_bengal: {
    id: 'west_bengal',
    displayName: 'West Bengal (Bishnupur & Delta)',
    regionalHeritage: 'Bishnupur carved terracotta temples, do-chala roofs, festive pandals, Jamdani handloom',
    terrainAssetSet: 'bengal_delta_riverbank',
    vegetationAssetSet: 'bengal_coconut_betel_lotus',
    architectureAssetSet: 'bengal_terracotta_chala',
    decorationAssetSet: 'bengal_carved_terracotta_kantha',
    materialSet: 'bengal_terracotta_bamboo_lime',
    characterAssetSet: 'specialist_pandal_designer',
    landmarkAssets: ['terracotta_heritage_pavilion', 'river_ghat_steps', 'festival_pandal_arch'],
    buildingAssets: ['curved_dochala_house', 'flooded_rice_paddy', 'riverfront_fish_bazaar', 'terracotta_atelier'],
    craftAssets: ['carved_terracotta_panels', 'kantha_embroidery', 'ceremonial_dhak_drum', 'clay_idols'],
    environmentalProps: ['water_lily_ponds', 'dinghy_boats', 'bamboo_scaffolding', 'earthen_bhars'],
    landscapeProfile: 'Lush alluvial delta waterfront with river ghat steps and water channels'
  },
  karnataka: {
    id: 'karnataka',
    displayName: 'Karnataka (Vijayanagara & Channapatna)',
    regionalHeritage: 'Vijayanagara granite mandapas, Channapatna lacquered wooden toys, sandalwood crafts',
    terrainAssetSet: 'karnataka_granite_boulder',
    vegetationAssetSet: 'karnataka_sandalwood_neem_jasmine',
    architectureAssetSet: 'karnataka_vijayanagara_mandapas',
    decorationAssetSet: 'karnataka_channapatna_lacquerware',
    materialSet: 'karnataka_grey_granite_teak',
    characterAssetSet: 'specialist_channapatna_craftmaster',
    landmarkAssets: ['pillared_heritage_mandapa', 'carved_stone_gateway', 'temple_tank'],
    buildingAssets: ['granite_pillared_residence', 'coconut_orchard_farm', 'mandapa_stone_bazaar', 'toy_woodturner_shop'],
    craftAssets: ['lacquered_spinning_tops', 'rocking_horse_toy', 'sandalwood_carvings', 'yali_brackets'],
    environmentalProps: ['granite_monoliths', 'brass_deepa_lamps', 'jasmine_garlands', 'incense_burners'],
    landscapeProfile: 'Warm golden granite bedrock with stepped stone courtyards and garden terraces'
  },
  gujarat: {
    id: 'gujarat',
    displayName: 'Gujarat (Patan & Saurashtra)',
    regionalHeritage: 'Carved wooden pol houses, Rani ki Vav stepwells, Patola double-ikat and Bandhani textiles',
    terrainAssetSet: 'gujarat_alluvial_salt_earth',
    vegetationAssetSet: 'gujarat_acacia_neem_bougainvillea',
    architectureAssetSet: 'gujarat_pol_stepwells',
    decorationAssetSet: 'gujarat_patola_bandhani_fabrics',
    materialSet: 'gujarat_sandstone_lime_fabrics',
    characterAssetSet: 'specialist_haat_negotiator',
    landmarkAssets: ['artisan_vav_stepwell', 'carved_pol_gateway', 'reservoir_cistern'],
    buildingAssets: ['carved_wooden_pol_house', 'cotton_plantation_farm', 'textile_merchants_haat', 'patola_dye_workshop'],
    craftAssets: ['patola_ikat_fabric', 'bandhani_tie_dye_lengths', 'kutchi_mirrored_hangings', 'trade_ledgers'],
    environmentalProps: ['wooden_dye_vats', 'fabric_drying_frames', 'brass_weighing_scales', 'water_cisterns'],
    landscapeProfile: 'Semi-arid courtyard town with stepped water architecture and shaded alleys'
  },
  rajasthan: {
    id: 'rajasthan',
    displayName: 'Rajasthan (Marwar & Shekhawati)',
    regionalHeritage: 'Golden sandstone havelis, ornate jharokhas, Jaipur blue pottery, Kathputli puppets',
    terrainAssetSet: 'rajasthan_thar_sandstone',
    vegetationAssetSet: 'rajasthan_khejri_cactus_datepalm',
    architectureAssetSet: 'rajasthan_sandstone_havelis',
    decorationAssetSet: 'rajasthan_blue_pottery_jharokha',
    materialSet: 'rajasthan_golden_sandstone_cobalt',
    characterAssetSet: 'specialist_stepwell_engineer',
    landmarkAssets: ['sandstone_haveli_courtyard', 'chhatri_domed_pavilion', 'baori_reservoir'],
    buildingAssets: ['ornate_jharokha_haveli', 'bajra_oasis_farm', 'sanganeri_shaded_bazaar', 'blue_pottery_kiln'],
    craftAssets: ['jaipur_blue_pottery_urns', 'kathputli_puppets', 'block_printed_sanganeri', 'brass_lanterns'],
    environmentalProps: ['sandstone_boulders', 'prickly_pear_cactus', 'camel_saddles', 'marbled_fountain'],
    landscapeProfile: 'Golden sandstone desert oasis with shaded colonnaded courtyards and jaali screens'
  }
};
