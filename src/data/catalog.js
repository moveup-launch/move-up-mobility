export const CATALOG = {
  bedroom: [
    {
      id: "bed",
      name: { fr: "Lit", en: "Bed" },
      icon: "🛏️",
      variants: [
        { id: "bed_single", label: { fr: "Lit simple (90cm)", en: "Single bed" }, volume_m3: 0.8, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bed_double", label: { fr: "Lit double (140cm)", en: "Double bed" }, volume_m3: 1.0, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bed_queen", label: { fr: "Lit queen (160cm)", en: "Queen bed" }, volume_m3: 1.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bed_king", label: { fr: "Lit king (180cm)", en: "King bed" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: true },
        { id: "bed_storage", label: { fr: "Lit coffre", en: "Storage bed" }, volume_m3: 1.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: true },
        { id: "bed_bunk", label: { fr: "Lit superposé", en: "Bunk bed" }, volume_m3: 2.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bed_baby", label: { fr: "Lit bébé / cododo", en: "Baby crib" }, volume_m3: 0.5, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "mattress",
      name: { fr: "Matelas", en: "Mattress" },
      icon: "🟦",
      variants: [
        { id: "mat_baby", label: { fr: "Matelas bébé", en: "Baby mattress" }, volume_m3: 0.1, fragile: false, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_child", label: { fr: "Matelas enfant", en: "Child mattress" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_single", label: { fr: "Matelas 1 place (90cm)", en: "Single mattress" }, volume_m3: 0.35, fragile: false, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_120", label: { fr: "Matelas 120 cm", en: "120cm mattress" }, volume_m3: 0.4, fragile: false, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_double", label: { fr: "Matelas 2 places (140cm)", en: "Double mattress" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_queen", label: { fr: "Matelas queen (160cm)", en: "Queen mattress" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mat_king", label: { fr: "Matelas king (180cm)", en: "King mattress" }, volume_m3: 0.7, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "nightstand",
      name: { fr: "Table de nuit", en: "Nightstand" },
      icon: "🪑",
      variants: [
        { id: "nightstand_std", label: { fr: "Table de nuit standard", en: "Standard nightstand" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "dresser",
      name: { fr: "Commode", en: "Dresser" },
      icon: "🗄️",
      variants: [
        { id: "dresser_chiffonnier", label: { fr: "Chiffonnier (étroit)", en: "Chiffonnier (narrow)" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dresser_small", label: { fr: "Petite commode", en: "Small dresser" }, volume_m3: 0.4, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dresser_std", label: { fr: "Commode standard", en: "Standard dresser" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dresser_large", label: { fr: "Grande commode", en: "Large dresser" }, volume_m3: 0.9, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dresser_double", label: { fr: "Commode double", en: "Double dresser" }, volume_m3: 1.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dresser_antique", label: { fr: "Commode ancienne lourde", en: "Heavy antique dresser" }, volume_m3: 1.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "wardrobe",
      name: { fr: "Armoire", en: "Wardrobe" },
      icon: "🚪",
      variants: [
        { id: "ward_1door", label: { fr: "1 porte", en: "1 door" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "ward_2door", label: { fr: "2 portes", en: "2 doors" }, volume_m3: 1.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: true },
        { id: "ward_3door", label: { fr: "3 portes", en: "3 doors" }, volume_m3: 1.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: true },
        { id: "ward_dressing", label: { fr: "Dressing modulaire", en: "Walk-in wardrobe" }, volume_m3: 3.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "desk",
      name: { fr: "Bureau", en: "Desk" },
      icon: "🖥️",
      variants: [
        { id: "desk_small", label: { fr: "Petit bureau", en: "Small desk" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "desk_std", label: { fr: "Bureau standard", en: "Standard desk" }, volume_m3: 0.5, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "desk_large", label: { fr: "Grand bureau", en: "Large desk" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "desk_corner", label: { fr: "Bureau d'angle", en: "Corner desk" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "desk_gaming", label: { fr: "Bureau gaming", en: "Gaming desk" }, volume_m3: 0.9, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "desk_secretary", label: { fr: "Secrétaire ancien", en: "Antique secretary desk" }, volume_m3: 0.7, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "officechair",
      name: { fr: "Chaise de bureau", en: "Office chair" },
      icon: "🪑",
      variants: [
        { id: "offchair_std", label: { fr: "Chaise de bureau standard", en: "Standard office chair" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "bookshelf",
      name: { fr: "Bibliothèque", en: "Bookshelf" },
      icon: "📚",
      variants: [
        { id: "bk_column", label: { fr: "Colonne étroite", en: "Narrow column" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bk_small", label: { fr: "Petite bibliothèque", en: "Small bookshelf" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bk_medium", label: { fr: "Bibliothèque moyenne", en: "Medium bookshelf" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bk_large", label: { fr: "Grande bibliothèque", en: "Large bookshelf" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: true },
        { id: "bk_wall", label: { fr: "Bibliothèque murale", en: "Wall-mounted bookshelf" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bk_kallax_s", label: { fr: "Kallax petit (2x2)", en: "Kallax small (2x2)" }, volume_m3: 0.4, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "bk_kallax_l", label: { fr: "Kallax grand (4x4)", en: "Kallax large (4x4)" }, volume_m3: 1.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "tv",
      name: { fr: "TV", en: "TV" },
      icon: "📺",
      variants: [
        { id: "tv_small", label: { fr: 'TV < 43"', en: 'TV < 43"' }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "tv_medium", label: { fr: 'TV 43" à 65"', en: 'TV 43" to 65"' }, volume_m3: 0.3, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "tv_large", label: { fr: 'TV > 65"', en: 'TV > 65"' }, volume_m3: 0.5, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "mirror",
      name: { fr: "Miroir", en: "Mirror" },
      icon: "🪞",
      variants: [
        { id: "mirror_small", label: { fr: "Petit miroir", en: "Small mirror" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mirror_large", label: { fr: "Grand miroir", en: "Large mirror" }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "frames",
      name: { fr: "Cadres / Tableaux", en: "Frames / Paintings" },
      icon: "🖼️",
      variants: [
        { id: "frames_lot", label: { fr: "Lot de cadres", en: "Set of frames" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "lamps",
      name: { fr: "Lampes", en: "Lamps" },
      icon: "💡",
      variants: [
        { id: "lamp_floor", label: { fr: "Lampadaire", en: "Floor lamp" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "lamp_table", label: { fr: "Lampe de table", en: "Table lamp" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
  ],

  livingRoom: [
    { id: "sofa2", name: { fr: "Canapé 2 places", en: "2-seat sofa" }, icon: "🛋️", variants: [{ id: "sofa2_std", label: { fr: "Canapé 2 places", en: "2-seat sofa" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "sofa3", name: { fr: "Canapé 3 places", en: "3-seat sofa" }, icon: "🛋️", variants: [{ id: "sofa3_std", label: { fr: "Canapé 3 places", en: "3-seat sofa" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "sofa_corner", name: { fr: "Canapé d'angle", en: "Corner sofa" }, icon: "🛋️", variants: [{ id: "sofa_corner_std", label: { fr: "Canapé d'angle", en: "Corner sofa" }, volume_m3: 3.0, fragile: false, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: true }] },
    { id: "sofa_bed", name: { fr: "Canapé convertible", en: "Sofa bed" }, icon: "🛋️", variants: [{ id: "sofabed_std", label: { fr: "Canapé convertible", en: "Sofa bed" }, volume_m3: 2.0, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: true }] },
    {
      id: "armchair",
      name: { fr: "Fauteuil", en: "Armchair" },
      icon: "💺",
      variants: [
        { id: "armchair_std", label: { fr: "Fauteuil standard", en: "Standard armchair" }, volume_m3: 0.5, fragile: false, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "armchair_relax", label: { fr: "Fauteuil relax / releveur", en: "Recliner" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "coffee_table",
      name: { fr: "Table basse", en: "Coffee table" },
      icon: "🪑",
      variants: [
        { id: "ct_small", label: { fr: "Petite table basse", en: "Small coffee table" }, volume_m3: 0.2, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "ct_std", label: { fr: "Table basse standard", en: "Standard coffee table" }, volume_m3: 0.35, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "ct_marble", label: { fr: "Table basse marbre / verre", en: "Marble / glass coffee table" }, volume_m3: 0.4, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "tv_unit",
      name: { fr: "Meuble TV", en: "TV unit" },
      icon: "📺",
      variants: [
        { id: "tvunit_small", label: { fr: "Petit meuble TV", en: "Small TV unit" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "tvunit_std", label: { fr: "Meuble TV standard", en: "Standard TV unit" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "tvunit_large", label: { fr: "Grand meuble TV / bibliothèque TV", en: "Large TV unit / media center" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "living_tv",
      name: { fr: "TV", en: "TV" },
      icon: "📺",
      variants: [
        { id: "ltv_small",  label: { fr: 'TV < 43"',      en: 'TV < 43"'       }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "ltv_medium", label: { fr: 'TV 43" à 65"',  en: 'TV 43" to 65"'  }, volume_m3: 0.3,  fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "ltv_large",  label: { fr: 'TV > 65"',      en: 'TV > 65"'       }, volume_m3: 0.5,  fragile: true, heavy: true,  requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "buffet",
      name: { fr: "Buffet / Bahut", en: "Buffet / Sideboard" },
      icon: "🗄️",
      variants: [
        { id: "buffet_small", label: { fr: "Petit buffet", en: "Small buffet" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "buffet_std", label: { fr: "Buffet standard", en: "Standard buffet" }, volume_m3: 0.9, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "buffet_antique", label: { fr: "Buffet ancien / massif", en: "Antique / solid buffet" }, volume_m3: 1.2, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: true },
      ]
    },
    { id: "console", name: { fr: "Console / Meuble d'entrée", en: "Console / Hallway unit" }, icon: "🪑", variants: [{ id: "console_std", label: { fr: "Console standard", en: "Standard console" }, volume_m3: 0.2, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "coat_rack", name: { fr: "Porte-manteau / Vestiaire", en: "Coat rack / Wardrobe stand" }, icon: "🧥", variants: [
      { id: "coat_rack_floor", label: { fr: "Porte-manteau sur pied", en: "Floor coat rack" }, volume_m3: 0.1, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "coat_rack_wall", label: { fr: "Patère murale / Vestiaire mural", en: "Wall-mounted coat rack" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "shoe_cabinet", name: { fr: "Meuble à chaussures", en: "Shoe cabinet" }, icon: "👟", variants: [
      { id: "shoe_small", label: { fr: "Petit meuble chaussures (2-4 niv.)", en: "Small shoe cabinet (2-4 tiers)" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "shoe_large", label: { fr: "Grand meuble chaussures", en: "Large shoe cabinet" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "bench_hallway", name: { fr: "Banc d'entrée", en: "Hallway bench" }, icon: "🪑", variants: [
      { id: "bench_std", label: { fr: "Banc d'entrée standard", en: "Standard hallway bench" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "fireplace_decor", name: { fr: "Cheminée décorative / Insert", en: "Decorative fireplace / Insert" }, icon: "🔥", variants: [
      { id: "fireplace_electric", label: { fr: "Cheminée électrique décorative", en: "Decorative electric fireplace" }, volume_m3: 0.5, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    {
      id: "rug",
      name: { fr: "Tapis", en: "Rug" },
      icon: "🟫",
      variants: [
        { id: "rug_small", label: { fr: "Petit tapis", en: "Small rug" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "rug_large", label: { fr: "Grand tapis", en: "Large rug" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "plants",
      name: { fr: "Plantes", en: "Plants" },
      icon: "🌿",
      variants: [
        { id: "plant_small", label: { fr: "Petites plantes", en: "Small plants" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "plant_large", label: { fr: "Grande plante / pot lourd", en: "Large plant / heavy pot" }, volume_m3: 0.2, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "deco_fragile", name: { fr: "Objets déco fragiles", en: "Fragile decor items" }, icon: "🏺", variants: [{ id: "deco_lot", label: { fr: "Lot objets déco fragiles", en: "Set of fragile decor" }, volume_m3: 0.2, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "living_mirror", name: { fr: "Miroir", en: "Mirror" }, icon: "🪞", variants: [{ id: "lm_small", label: { fr: "Petit miroir", en: "Small mirror" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }, { id: "lm_large", label: { fr: "Grand miroir", en: "Large mirror" }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "living_artwork", name: { fr: "Tableau / Oeuvre d'art", en: "Painting / Artwork" }, icon: "🖼️", variants: [{ id: "la_lot", label: { fr: "Tableau / oeuvre", en: "Painting / artwork" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
  ],

  kitchen: [
    { id: "fridge_small", name: { fr: "Frigo table top", en: "Tabletop fridge" }, icon: "🧊", variants: [{ id: "fridge_tt", label: { fr: "Frigo table top", en: "Tabletop fridge" }, volume_m3: 0.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "fridge", name: { fr: "Frigo 1 porte", en: "Single-door fridge" }, icon: "🧊", variants: [{ id: "fridge_1door", label: { fr: "Frigo 1 porte", en: "Single-door fridge" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "fridge_combo", name: { fr: "Combiné frigo/congélateur", en: "Fridge-freezer combo" }, icon: "🧊", variants: [{ id: "fridge_combo_std", label: { fr: "Combiné frigo/congélateur", en: "Fridge-freezer combo" }, volume_m3: 0.7, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "fridge_american", name: { fr: "Frigo américain", en: "American-style fridge" }, icon: "🧊", variants: [{ id: "fridge_us", label: { fr: "Frigo américain", en: "American-style fridge" }, volume_m3: 1.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: true }] },
    { id: "freezer_chest", name: { fr: "Congélateur coffre", en: "Chest freezer" }, icon: "🧊", variants: [{ id: "freezer_chest_std", label: { fr: "Congélateur coffre", en: "Chest freezer" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "freezer_upright", name: { fr: "Congélateur armoire", en: "Upright freezer" }, icon: "🧊", variants: [{ id: "freezer_up_std", label: { fr: "Congélateur armoire", en: "Upright freezer" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "dishwasher",
      name: { fr: "Lave-vaisselle", en: "Dishwasher" },
      icon: "🍽️",
      variants: [
        { id: "dw_std", label: { fr: "Lave-vaisselle standard", en: "Standard dishwasher" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dw_small", label: { fr: "Lave-vaisselle compact", en: "Compact dishwasher" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "oven",
      name: { fr: "Four / Cuisinière", en: "Oven / Range" },
      icon: "🔥",
      variants: [
        { id: "oven_builtin", label: { fr: "Four encastrable", en: "Built-in oven" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "oven_range", label: { fr: "Cuisinière", en: "Range" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "oven_piano", label: { fr: "Piano de cuisine", en: "Range cooker" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "microwave", name: { fr: "Micro-ondes", en: "Microwave" }, icon: "📦", variants: [{ id: "mw_std", label: { fr: "Micro-ondes standard", en: "Standard microwave" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "coffee_machine", name: { fr: "Machine à café", en: "Coffee machine" }, icon: "☕", variants: [{ id: "coffee_std", label: { fr: "Machine à café", en: "Coffee machine" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "robot_kitchen", name: { fr: "Robot cuisine", en: "Kitchen robot" }, icon: "🤖", variants: [{ id: "robot_std", label: { fr: "Robot cuisine (Thermomix...)", en: "Kitchen robot (Thermomix...)" }, volume_m3: 0.08, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "kitchen_mirror", name: { fr: "Miroir", en: "Mirror" }, icon: "🪞", variants: [{ id: "km_small", label: { fr: "Petit miroir cuisine", en: "Small kitchen mirror" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }, { id: "km_large", label: { fr: "Grand miroir cuisine", en: "Large kitchen mirror" }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "kitchen_artwork", name: { fr: "Tableau / Oeuvre d'art", en: "Painting / Artwork" }, icon: "🖼️", variants: [{ id: "ka_lot", label: { fr: "Tableau / oeuvre", en: "Painting / artwork" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "kitchen_table",
      name: { fr: "Table de cuisine", en: "Kitchen table" },
      icon: "🪑",
      variants: [
        { id: "ktable_small", label: { fr: "Petite table (2-4 pers)", en: "Small table (2-4 people)" }, volume_m3: 0.5, fragile: true, heavy: false, requires_protection: true, requires_disassembly: true, possible_furniture_lift: false },
        { id: "ktable_large", label: { fr: "Grande table (6-8 pers)", en: "Large table (6-8 people)" }, volume_m3: 1.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "chairs",
      name: { fr: "Chaises", en: "Chairs" },
      icon: "🪑",
      variants: [
        { id: "chair_std", label: { fr: "Chaise standard", en: "Standard chair" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "chair_design", label: { fr: "Chaise design / fragile", en: "Design / fragile chair" }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "china_cabinet", name: { fr: "Vaisselier", en: "China cabinet" }, icon: "🗄️", variants: [{ id: "china_std", label: { fr: "Vaisselier standard", en: "Standard china cabinet" }, volume_m3: 1.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: false }] },
  ],

  diningRoom: [
    {
      id: "dining_table",
      name: { fr: "Table de salle à manger", en: "Dining table" },
      icon: "🍽️",
      variants: [
        { id: "dt_round_4",    label: { fr: "Table ronde 4 personnes",           en: "Round table 4 people"            }, volume_m3: 0.6, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: true,  possible_furniture_lift: false },
        { id: "dt_rect_6",    label: { fr: "Table rectangulaire 6 personnes",    en: "Rectangular table 6 people"     }, volume_m3: 1.0, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: true,  possible_furniture_lift: false },
        { id: "dt_rect_10",   label: { fr: "Table rectangulaire 8-10 personnes", en: "Rectangular table 8-10 people"  }, volume_m3: 1.5, fragile: true,  heavy: true,  requires_protection: true,  requires_disassembly: true,  possible_furniture_lift: false },
        { id: "dt_extension", label: { fr: "Table avec rallonges",               en: "Table with extensions"           }, volume_m3: 1.2, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: true,  possible_furniture_lift: false },
        { id: "dt_marble",    label: { fr: "Table en marbre",                    en: "Marble table"                    }, volume_m3: 1.5, fragile: true,  heavy: true,  requires_protection: true,  requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "dining_chair",
      name: { fr: "Chaise / Assise", en: "Chair / Seating" },
      icon: "🪑",
      variants: [
        { id: "dc_std",       label: { fr: "Chaise standard",         en: "Standard chair"     }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dc_design",    label: { fr: "Chaise design / fragile", en: "Design chair"       }, volume_m3: 0.15, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: false, possible_furniture_lift: false },
        { id: "dc_armchair",  label: { fr: "Chaise avec accoudoirs",  en: "Chair with armrests"}, volume_m3: 0.2,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dc_stool",     label: { fr: "Tabouret haut",           en: "Bar stool"          }, volume_m3: 0.1,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dc_pouf",      label: { fr: "Pouf",                    en: "Pouf"               }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dc_banquette", label: { fr: "Banquette",               en: "Bench"              }, volume_m3: 0.5,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "dining_tv",
      name: { fr: "TV salle à manger", en: "Dining room TV" },
      icon: "📺",
      variants: [
        { id: "dtv_small",  label: { fr: 'TV < 43"',  en: 'TV < 43"'  }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dtv_medium", label: { fr: 'TV 43-65"', en: 'TV 43-65"' }, volume_m3: 0.3,  fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "dining_hifi",
      name: { fr: "Enceinte / Hi-fi", en: "Speaker / Hi-fi" },
      icon: "🔊",
      variants: [
        { id: "hifi_compact",  label: { fr: "Enceinte / hi-fi compact", en: "Speaker / compact hi-fi" }, volume_m3: 0.2,  fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "hifi_full",     label: { fr: "Système hi-fi complet",     en: "Full hi-fi system"       }, volume_m3: 0.5,  fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "hifi_soundbar", label: { fr: "Barre de son",              en: "Soundbar"                }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "dining_mirror",  name: { fr: "Miroir",                       en: "Mirror"            }, icon: "🪞", variants: [{ id: "dm_std",     label: { fr: "Miroir salle à manger",           en: "Dining room mirror"     }, volume_m3: 0.1, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "dining_artwork", name: { fr: "Tableau / Oeuvre d'art",        en: "Painting / Artwork"}, icon: "🖼️", variants: [{ id: "da_lot",    label: { fr: "Tableau / oeuvre d'art",            en: "Painting / artwork"     }, volume_m3: 0.1, fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "dining_console", name: { fr: "Console / Bahut bas",           en: "Console / Sideboard"},icon: "🗄️", variants: [{ id: "dc_console", label: { fr: "Console / bahut bas",              en: "Console / low sideboard"}, volume_m3: 0.5, fragile: false, heavy: true,  requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "dining_shelf",   name: { fr: "Bibliothèque / Étagère murale", en: "Bookcase / Wall shelf"},icon: "📚", variants: [{ id: "ds_std",    label: { fr: "Bibliothèque / étagère murale",    en: "Bookcase / wall shelf"  }, volume_m3: 0.8, fragile: false, heavy: true,  requires_protection: false, requires_disassembly: true,  possible_furniture_lift: false }] },
  ],

  office: [
    {
      id: "office_desk",
      name: { fr: "Bureau", en: "Desk" },
      icon: "🖥️",
      variants: [
        { id: "odesk_small", label: { fr: "Petit bureau", en: "Small desk" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "odesk_std", label: { fr: "Bureau standard", en: "Standard desk" }, volume_m3: 0.5, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "odesk_large", label: { fr: "Grand bureau / L", en: "Large / L-shaped desk" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    { id: "office_chair2", name: { fr: "Chaise de bureau", en: "Office chair" }, icon: "🪑", variants: [{ id: "ochair_std", label: { fr: "Chaise de bureau", en: "Office chair" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "monitor",
      name: { fr: "Écran / Monitor", en: "Monitor / Screen" },
      icon: "🖥️",
      variants: [
        { id: "monitor_std", label: { fr: "Écran standard", en: "Standard monitor" }, volume_m3: 0.08, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "monitor_large", label: { fr: 'Grand écran > 27"', en: 'Large screen > 27"' }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "computer",
      name: { fr: "Ordinateur", en: "Computer" },
      icon: "💻",
      variants: [
        { id: "pc_laptop", label: { fr: "Ordinateur portable", en: "Laptop" }, volume_m3: 0.02, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "pc_tower", label: { fr: "Tour / PC fixe", en: "Desktop tower" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "printer",
      name: { fr: "Imprimante", en: "Printer" },
      icon: "🖨️",
      variants: [
        { id: "printer_std", label: { fr: "Imprimante standard", en: "Standard printer" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "printer_large", label: { fr: "Imprimante grand format", en: "Large format printer" }, volume_m3: 0.3, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "filing_cabinet",
      name: { fr: "Caisson / Classeur", en: "Filing cabinet" },
      icon: "🗄️",
      variants: [
        { id: "fc_small", label: { fr: "Caisson bureau", en: "Desk pedestal" }, volume_m3: 0.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "fc_2drawer", label: { fr: "Classeur 2 tiroirs", en: "2-drawer filing cabinet" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "fc_4drawer", label: { fr: "Classeur 4 tiroirs", en: "4-drawer filing cabinet" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "office_shelf", name: { fr: "Étagère bureau", en: "Office shelf" }, icon: "📚", variants: [{ id: "oshelf_std", label: { fr: "Étagère standard", en: "Standard shelf" }, volume_m3: 0.4, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false }] },
    { id: "office_wardrobe", name: { fr: "Armoire à dossiers", en: "Document wardrobe" }, icon: "🚪", variants: [{ id: "oward_std", label: { fr: "Armoire à dossiers standard", en: "Standard document wardrobe" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "office_mirror", name: { fr: "Miroir", en: "Mirror" }, icon: "🪞", variants: [{ id: "om_std", label: { fr: "Miroir bureau", en: "Office mirror" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "office_artwork", name: { fr: "Tableau / Oeuvre d'art", en: "Painting / Artwork" }, icon: "🖼️", variants: [{ id: "oa_lot", label: { fr: "Tableau / oeuvre", en: "Painting / artwork" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "office_tv",
      name: { fr: "TV / Écran TV", en: "TV / Screen" },
      icon: "📺",
      variants: [
        { id: "otv_small",  label: { fr: 'TV < 43"',     en: 'TV < 43"'      }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "otv_medium", label: { fr: 'TV 43" à 65"', en: 'TV 43" to 65"' }, volume_m3: 0.3,  fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
  ],

  garden: [
    { id: "garden_table", name: { fr: "Table de jardin", en: "Garden table" }, icon: "🪑", variants: [
      { id: "garden_table_small", label: { fr: "Table jardin 4 places", en: "4-seater garden table" }, volume_m3: 0.5, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "garden_table_large", label: { fr: "Table jardin 6-8 places", en: "6-8 seater garden table" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_chairs", name: { fr: "Chaises de jardin", en: "Garden chairs" }, icon: "🪑", variants: [
      { id: "garden_chair_2", label: { fr: "2 chaises de jardin", en: "2 garden chairs" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "garden_chair_4", label: { fr: "4 chaises de jardin", en: "4 garden chairs" }, volume_m3: 0.4, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "garden_chair_6", label: { fr: "6 chaises de jardin", en: "6 garden chairs" }, volume_m3: 0.6, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_lounger", name: { fr: "Transat / Bain de soleil", en: "Lounger / Sun bed" }, icon: "🛋️", variants: [
      { id: "lounger_1", label: { fr: "1 transat", en: "1 lounger" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "lounger_2", label: { fr: "2 transats", en: "2 loungers" }, volume_m3: 0.4, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_parasol", name: { fr: "Parasol / Tonnelle", en: "Parasol / Canopy" }, icon: "☂️", variants: [
      { id: "parasol_std", label: { fr: "Parasol standard", en: "Standard parasol" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "tonnelle_std", label: { fr: "Tonnelle / Pergola", en: "Canopy / Pergola" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_bbq", name: { fr: "Barbecue", en: "BBQ" }, icon: "🔥", variants: [
      { id: "bbq_charcoal", label: { fr: "Barbecue charbon", en: "Charcoal BBQ" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "bbq_gas", label: { fr: "Barbecue à gaz", en: "Gas BBQ" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "bbq_plancha", label: { fr: "Plancha", en: "Plancha grill" }, volume_m3: 0.2, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_shed", name: { fr: "Abri de jardin / Serre", en: "Garden shed / Greenhouse" }, icon: "🏡", variants: [
      { id: "shed_small", label: { fr: "Petit abri de jardin", en: "Small garden shed" }, volume_m3: 2.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "shed_large", label: { fr: "Grand abri de jardin", en: "Large garden shed" }, volume_m3: 5.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_trampoline", name: { fr: "Trampoline", en: "Trampoline" }, icon: "⭕", variants: [
      { id: "trampoline_small", label: { fr: "Trampoline petit (< 3m)", en: "Small trampoline (< 3m)" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "trampoline_large", label: { fr: "Grand trampoline (3-4m)", en: "Large trampoline (3-4m)" }, volume_m3: 2.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_pool", name: { fr: "Piscine hors-sol", en: "Above-ground pool" }, icon: "🏊", variants: [
      { id: "pool_inflatable", label: { fr: "Piscine gonflable", en: "Inflatable pool" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "pool_frame", label: { fr: "Piscine tubulaire", en: "Frame pool" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_wheelbarrow", name: { fr: "Brouette", en: "Wheelbarrow" }, icon: "🛒", variants: [
      { id: "wheelbarrow_std", label: { fr: "Brouette standard", en: "Standard wheelbarrow" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_mower", name: { fr: "Tondeuse", en: "Lawnmower" }, icon: "🌿", variants: [
      { id: "mower_push_g", label: { fr: "Tondeuse poussée", en: "Push mower" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "mower_robotic", label: { fr: "Tondeuse robot", en: "Robotic mower" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      { id: "mower_ride_g", label: { fr: "Tondeuse autoportée", en: "Ride-on mower" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_tools", name: { fr: "Outils de jardin", en: "Garden tools" }, icon: "🔧", variants: [
      { id: "garden_tools_lot", label: { fr: "Lot d'outils de jardin", en: "Garden tool set" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_trimmer", name: { fr: "Débroussailleuse", en: "Brush cutter" }, icon: "🌿", variants: [
      { id: "trimmer_std", label: { fr: "Débroussailleuse standard", en: "Standard brush cutter" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_hedger", name: { fr: "Taille-haie", en: "Hedge trimmer" }, icon: "✂️", variants: [
      { id: "hedger_electric", label: { fr: "Taille-haie électrique", en: "Electric hedge trimmer" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_blower", name: { fr: "Souffleur de feuilles", en: "Leaf blower" }, icon: "💨", variants: [
      { id: "blower_std", label: { fr: "Souffleur de feuilles", en: "Leaf blower" }, volume_m3: 0.1, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_sandbox", name: { fr: "Bac à sable", en: "Sandpit" }, icon: "🏖️", variants: [
      { id: "sandbox_small", label: { fr: "Petit bac à sable", en: "Small sandpit" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "sandbox_large", label: { fr: "Grand bac à sable / couvercle", en: "Large sandpit with cover" }, volume_m3: 0.6, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_set", name: { fr: "Salon de jardin complet", en: "Complete garden set" }, icon: "🪑", variants: [
      { id: "garden_set_4", label: { fr: "Salon jardin 4 places (table + chaises)", en: "4-seater garden set (table + chairs)" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      { id: "garden_set_6", label: { fr: "Salon jardin 6-8 places (table + chaises)", en: "6-8 seater garden set (table + chairs)" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "garden_pot", name: { fr: "Pots / Jardinières", en: "Pots / Planters" }, icon: "🪴", variants: [
      { id: "pot_small_lot", label: { fr: "Petits pots (lot)", en: "Small pots (set)" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      { id: "pot_large", label: { fr: "Grand pot / jardinière", en: "Large pot / planter" }, volume_m3: 0.3, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "garden_bike", name: { fr: "Abri à vélos", en: "Bike shed" }, icon: "🚲", variants: [
      { id: "bike_shed_std", label: { fr: "Abri à vélos", en: "Bike shed" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
  ],

  garageBasement: [
    { id: "bike_child", name: { fr: "Vélo enfant", en: "Child bike" }, icon: "🚲", variants: [{ id: "bike_child_std", label: { fr: "Vélo enfant", en: "Child bike" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "bike_adult", name: { fr: "Vélo adulte", en: "Adult bike" }, icon: "🚲", variants: [{ id: "bike_adult_std", label: { fr: "Vélo adulte", en: "Adult bike" }, volume_m3: 0.6, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "bike_electric", name: { fr: "Vélo électrique", en: "Electric bike" }, icon: "⚡", variants: [{ id: "ebike_std", label: { fr: "Vélo électrique", en: "Electric bike" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "shelving",
      name: { fr: "Étagères garage/cave", en: "Garage/basement shelves" },
      icon: "🗄️",
      variants: [
        { id: "shelf_metal_std", label: { fr: "Étagères métal standard", en: "Standard metal shelves" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
        { id: "shelf_metal_large", label: { fr: "Étagères métal grandes", en: "Large metal shelves" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    { id: "tools", name: { fr: "Outils / Outillage", en: "Tools" }, icon: "🔧", variants: [{ id: "tools_lot", label: { fr: "Lot d'outils", en: "Tool set" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "workbench", name: { fr: "Établi", en: "Workbench" }, icon: "🪚", variants: [{ id: "wb_std", label: { fr: "Établi standard", en: "Standard workbench" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false }] },
    { id: "tires", name: { fr: "Pneus", en: "Tires" }, icon: "⭕", variants: [{ id: "tires_set", label: { fr: "Jeu de 4 pneus", en: "Set of 4 tires" }, volume_m3: 0.4, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "mower",
      name: { fr: "Tondeuse", en: "Lawnmower" },
      icon: "🌿",
      variants: [
        { id: "mower_push", label: { fr: "Tondeuse poussée", en: "Push mower" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "mower_ride", label: { fr: "Tondeuse autoportée", en: "Ride-on mower" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "stepladder", name: { fr: "Escabeau", en: "Step ladder" }, icon: "🪜", variants: [{ id: "stepladder_std", label: { fr: "Escabeau", en: "Step ladder" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "ladder", name: { fr: "Échelle", en: "Ladder" }, icon: "🪜", variants: [{ id: "ladder_std", label: { fr: "Échelle", en: "Ladder" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "suitcases", name: { fr: "Valises", en: "Suitcases" }, icon: "🧳", variants: [{ id: "suitcase_lot", label: { fr: "Lot de valises", en: "Set of suitcases" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
  ],

  laundry: [
    {
      id: "washing_machine",
      name: { fr: "Machine à laver", en: "Washing machine" },
      icon: "🫧",
      variants: [
        { id: "wm_top", label: { fr: "Machine à laver top (chargement dessus)", en: "Top-load washing machine" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "wm_front", label: { fr: "Machine à laver frontale (chargement frontal)", en: "Front-load washing machine" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "dryer",
      name: { fr: "Sèche-linge", en: "Dryer" },
      icon: "💨",
      variants: [
        { id: "dryer_front", label: { fr: "Sèche-linge frontal", en: "Front-load dryer" }, volume_m3: 0.35, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "dryer_condensation", label: { fr: "Sèche-linge à condensation", en: "Condensation dryer" }, volume_m3: 0.35, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "washer_dryer",
      name: { fr: "Lave-linge séchant", en: "Washer-dryer combo" },
      icon: "🫧",
      variants: [
        { id: "wd_std", label: { fr: "Lave-linge séchant", en: "Washer-dryer combo" }, volume_m3: 0.40, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "heated_towel_rail",
      name: { fr: "Sèche-serviettes", en: "Heated towel rail" },
      icon: "🌡️",
      variants: [
        { id: "htr_std", label: { fr: "Sèche-serviettes standard", en: "Standard heated towel rail" }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "iron_board",
      name: { fr: "Fer + table à repasser", en: "Iron + ironing board" },
      icon: "👕",
      variants: [
        { id: "iron_std", label: { fr: "Fer à repasser + table à repasser", en: "Iron + ironing board" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    { id: "ironing_board_standalone", name: { fr: "Table à repasser", en: "Ironing board" }, icon: "👕", variants: [{ id: "ib_std", label: { fr: "Table à repasser", en: "Ironing board" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    {
      id: "clothes_rack",
      name: { fr: "Étendoir", en: "Clothes rack" },
      icon: "👔",
      variants: [
        { id: "cr_std", label: { fr: "Étendoir standard", en: "Standard clothes rack" }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "laundry_basket",
      name: { fr: "Bac à linge", en: "Laundry basket" },
      icon: "🧺",
      variants: [
        { id: "lb_std", label: { fr: "Bac à linge standard", en: "Standard laundry basket" }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "laundry_cabinet",
      name: { fr: "Armoire buanderie", en: "Laundry cabinet" },
      icon: "🚪",
      variants: [
        { id: "lc_small", label: { fr: "Petite armoire buanderie", en: "Small laundry cabinet" }, volume_m3: 0.50, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "lc_large", label: { fr: "Grande armoire buanderie", en: "Large laundry cabinet" }, volume_m3: 1.00, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    { id: "vacuum_cleaner", name: { fr: "Aspirateur", en: "Vacuum cleaner" }, icon: "🧹", variants: [
      { id: "vac_upright", label: { fr: "Aspirateur balai / robot", en: "Upright / robot vacuum" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "vac_cylinder", label: { fr: "Aspirateur traîneau", en: "Cylinder vacuum" }, volume_m3: 0.08, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "steam_cleaner", name: { fr: "Nettoyeur vapeur", en: "Steam cleaner" }, icon: "💨", variants: [
      { id: "steam_std", label: { fr: "Nettoyeur vapeur standard", en: "Standard steam cleaner" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
  ],

  bathroom: [
    {
      id: "vanity_unit",
      name: { fr: "Meuble sous vasque", en: "Vanity unit" },
      icon: "🪣",
      variants: [
        { id: "vu_small", label: { fr: "Petit meuble sous vasque", en: "Small vanity unit" }, volume_m3: 0.3, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "vu_std", label: { fr: "Meuble sous vasque standard", en: "Standard vanity unit" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "vu_large", label: { fr: "Grand meuble sous vasque (double)", en: "Large double vanity" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "storage_column_bath",
      name: { fr: "Colonne de rangement", en: "Storage column" },
      icon: "🗄️",
      variants: [
        { id: "scb_std", label: { fr: "Colonne standard", en: "Standard column" }, volume_m3: 0.4, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "scb_large", label: { fr: "Grande colonne", en: "Large column" }, volume_m3: 0.8, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "medicine_cabinet",
      name: { fr: "Armoire de toilette", en: "Medicine cabinet" },
      icon: "🚪",
      variants: [
        { id: "mc_std", label: { fr: "Armoire de toilette standard", en: "Standard medicine cabinet" }, volume_m3: 0.2, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "bath_mirror",
      name: { fr: "Miroir salle de bain", en: "Bathroom mirror" },
      icon: "🪞",
      variants: [
        { id: "bm_small", label: { fr: "Petit miroir salle de bain", en: "Small bathroom mirror" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "bm_large", label: { fr: "Grand miroir salle de bain", en: "Large bathroom mirror" }, volume_m3: 0.12, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "laundry_hamper",
      name: { fr: "Panier a linge", en: "Laundry hamper" },
      icon: "🧺",
      variants: [
        { id: "lh_std", label: { fr: "Panier a linge standard", en: "Standard laundry hamper" }, volume_m3: 0.1, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "bath_shelf",
      name: { fr: "Etagere salle de bain", en: "Bathroom shelf" },
      icon: "📚",
      variants: [
        { id: "bs_std", label: { fr: "Etagere salle de bain", en: "Bathroom shelf" }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    { id: "bath_stool", name: { fr: "Tabouret / Chaise de salle de bain", en: "Bathroom stool / chair" }, icon: "🪑", variants: [
      { id: "bath_stool_std", label: { fr: "Tabouret salle de bain", en: "Bathroom stool" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "bath_towel_rack", name: { fr: "Porte-serviettes", en: "Towel rack" }, icon: "🪣", variants: [
      { id: "towelrack_wall", label: { fr: "Porte-serviettes mural", en: "Wall towel rack" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "bathtub", name: { fr: "Baignoire", en: "Bathtub" }, icon: "🛁", variants: [
      { id: "bathtub_freestanding", label: { fr: "Baignoire ilot / autoportante", en: "Freestanding bathtub" }, volume_m3: 1.5, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: true },
    ]},
    { id: "washbasin", name: { fr: "Vasque / Lavabo", en: "Washbasin / Sink" }, icon: "🪣", variants: [
      { id: "washbasin_freestanding", label: { fr: "Vasque à poser / lavabo autoportant", en: "Freestanding washbasin" }, volume_m3: 0.15, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
  ],

  babyEquip: [
    { id: "baby_changing_dresser", name: { fr: "Commode à langer",     en: "Changing dresser"    }, icon: "👶", variants: [{ id: "bcd_std",     label: { fr: "Commode à langer",      en: "Changing dresser"    }, volume_m3: 0.5,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "baby_changing_table",   name: { fr: "Table à langer",       en: "Changing table"      }, icon: "👶", variants: [{ id: "bct_std",     label: { fr: "Table à langer",        en: "Changing table"      }, volume_m3: 0.3,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "baby_bouncer",          name: { fr: "Transat bébé",         en: "Baby bouncer"        }, icon: "👶", variants: [{ id: "bb_std",      label: { fr: "Transat bébé",          en: "Baby bouncer"        }, volume_m3: 0.2,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "stroller_single",       name: { fr: "Poussette simple",     en: "Single stroller"     }, icon: "🍼", variants: [{ id: "stroller_s",  label: { fr: "Poussette simple",      en: "Single stroller"     }, volume_m3: 0.4,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "stroller_double",       name: { fr: "Poussette double",     en: "Double stroller"     }, icon: "🍼", variants: [{ id: "stroller_d",  label: { fr: "Poussette double",      en: "Double stroller"     }, volume_m3: 0.6,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "baby_pram",             name: { fr: "Landau",               en: "Pram"                }, icon: "🍼", variants: [{ id: "pram_std",    label: { fr: "Landau",                en: "Pram"                }, volume_m3: 0.5,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "car_seat",              name: { fr: "Siège auto",           en: "Car seat"            }, icon: "🚗", variants: [{ id: "carseat_std", label: { fr: "Siège auto",            en: "Car seat"            }, volume_m3: 0.2,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "baby_playpen",          name: { fr: "Parc bébé",           en: "Baby playpen"        }, icon: "👶", variants: [{ id: "playpen_std", label: { fr: "Parc bébé",             en: "Baby playpen"        }, volume_m3: 0.4,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: true,  possible_furniture_lift: false }] },
    { id: "baby_walker",           name: { fr: "Trotteur",             en: "Baby walker"         }, icon: "👶", variants: [{ id: "walker_std",  label: { fr: "Trotteur",              en: "Baby walker"         }, volume_m3: 0.2,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "high_chair",            name: { fr: "Chaise haute",         en: "High chair"          }, icon: "🪑", variants: [{ id: "hchair_std",  label: { fr: "Chaise haute",          en: "High chair"          }, volume_m3: 0.2,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "baby_swing",            name: { fr: "Balancelle électrique",en: "Electric baby swing" }, icon: "👶", variants: [{ id: "swing_std",   label: { fr: "Balancelle électrique", en: "Electric baby swing" }, volume_m3: 0.3,  fragile: true,  heavy: false, requires_protection: true,  requires_disassembly: true,  possible_furniture_lift: false }] },
    { id: "baby_bath",             name: { fr: "Baignoire bébé",       en: "Baby bathtub"        }, icon: "🛁", variants: [{ id: "bbath_std",   label: { fr: "Baignoire bébé",        en: "Baby bathtub"        }, volume_m3: 0.1,  fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
  ],

  exceptional: [
    {
      id: "piano_bench",
      name: { fr: "Banc de piano", en: "Piano bench" },
      icon: "🎹",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'entrance', 'misc'],
      variants: [{ id: "pb_std", label: { fr: "Banc de piano", en: "Piano bench" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }]
    },
    {
      id: "piano_upright",
      name: { fr: "Piano droit", en: "Upright piano" },
      icon: "🎹",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'storageBox', 'misc'],
      variants: [{ id: "piano_up_std", label: { fr: "Piano droit standard", en: "Standard upright piano" }, volume_m3: 1.5, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: true }]
    },
    {
      id: "piano_grand",
      name: { fr: "Piano à queue", en: "Grand piano" },
      icon: "🎹",
      allowedRooms: ['livingRoom', 'diningRoom', 'storageBox', 'misc'],
      variants: [
        { id: "piano_grand_baby", label: { fr: "Quart de queue", en: "Baby grand" }, volume_m3: 3.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: true },
        { id: "piano_grand_full", label: { fr: "Grand queue", en: "Full grand" }, volume_m3: 5.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: true },
      ]
    },
    {
      id: "guitar",
      name: { fr: "Guitare / Basse", en: "Guitar / Bass" },
      icon: "🎸",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'childBedroom', 'misc'],
      variants: [
        { id: "guitar_acoustic",  label: { fr: "Guitare acoustique / basse", en: "Acoustic guitar / bass"  }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "guitar_elec_amp",  label: { fr: "Guitare électrique + ampli", en: "Electric guitar + amp"   }, volume_m3: 0.3, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "drums",
      name: { fr: "Batterie", en: "Drum kit" },
      icon: "🥁",
      allowedRooms: ['livingRoom', 'office', 'garage', 'basement', 'misc'],
      variants: [
        { id: "drums_full", label: { fr: "Batterie complète", en: "Full drum kit" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
      ]
    },
    {
      id: "string_instrument",
      name: { fr: "Violon / Violoncelle", en: "Violin / Cello" },
      icon: "🎻",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'misc'],
      variants: [
        { id: "string_std", label: { fr: "Violon / violoncelle", en: "Violin / cello" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "wind_instrument",
      name: { fr: "Saxophone / Trompette", en: "Saxophone / Trumpet" },
      icon: "🎺",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'misc'],
      variants: [
        { id: "wind_std", label: { fr: "Saxophone / trompette", en: "Saxophone / trumpet" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "keyboard_instr",
      name: { fr: "Clavier électronique", en: "Electronic keyboard" },
      icon: "🎹",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'childBedroom', 'misc'],
      variants: [
        { id: "keyboard_std", label: { fr: "Clavier électronique", en: "Electronic keyboard" }, volume_m3: 0.3, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "sono",
      name: { fr: "Sono / Sonorisation", en: "PA / Sound system" },
      icon: "🔊",
      allowedRooms: ['livingRoom', 'office', 'garage', 'basement', 'misc'],
      variants: [
        { id: "sono_full", label: { fr: "Sono complète", en: "Full PA system" }, volume_m3: 1.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "safe",
      name: { fr: "Coffre-fort", en: "Safe" },
      icon: "🔒",
      allowedRooms: ['office', 'bedroom', 'garage', 'basement', 'storageBox', 'misc'],
      variants: [
        { id: "safe_small", label: { fr: "Petit coffre-fort", en: "Small safe" }, volume_m3: 0.1, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
        { id: "safe_large", label: { fr: "Grand coffre-fort", en: "Large safe" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: true },
      ]
    },
    {
      id: "pool_table",
      name: { fr: "Billard", en: "Pool table" },
      icon: "🎱",
      allowedRooms: ['livingRoom', 'garage', 'basement', 'storageBox', 'misc'],
      variants: [{ id: "pt_std", label: { fr: "Table de billard", en: "Pool table" }, volume_m3: 4.0, fragile: false, heavy: true, requires_protection: true, requires_disassembly: true, possible_furniture_lift: false }]
    },
    {
      id: "aquarium",
      name: { fr: "Aquarium", en: "Aquarium" },
      icon: "🐠",
      allowedRooms: ['livingRoom', 'office', 'bedroom', 'childBedroom', 'misc'],
      variants: [
        { id: "aq_small", label: { fr: "Petit aquarium < 100L", en: "Small aquarium < 100L" }, volume_m3: 0.2, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "aq_large", label: { fr: "Grand aquarium > 200L", en: "Large aquarium > 200L" }, volume_m3: 0.8, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "motorcycle",
      name: { fr: "Moto / Scooter", en: "Motorcycle / Scooter" },
      icon: "🏍️",
      allowedRooms: ['garage', 'basement', 'garden', 'storageBox', 'misc'],
      variants: [
        { id: "moto_scooter", label: { fr: "Scooter", en: "Scooter" }, volume_m3: 1.0, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "moto_std", label: { fr: "Moto standard", en: "Standard motorcycle" }, volume_m3: 1.5, fragile: false, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
    {
      id: "arcade",
      name: { fr: "Borne arcade", en: "Arcade machine" },
      icon: "🕹️",
      allowedRooms: ['livingRoom', 'garage', 'basement', 'storageBox', 'misc'],
      variants: [{ id: "arcade_std", label: { fr: "Borne arcade standard", en: "Standard arcade machine" }, volume_m3: 1.0, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false }]
    },
    {
      id: "server_rack",
      name: { fr: "Baie informatique", en: "Server rack" },
      icon: "🖥️",
      allowedRooms: ['office', 'garage', 'basement', 'storageBox', 'misc'],
      variants: [{ id: "rack_std", label: { fr: "Baie informatique", en: "Server rack" }, volume_m3: 0.8, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: true }]
    },
    {
      id: "artwork",
      name: { fr: "Sculpture / Oeuvre d'art", en: "Sculpture / Artwork" },
      icon: "🗿",
      allowedRooms: ['livingRoom', 'diningRoom', 'office', 'bedroom', 'misc'],
      variants: [
        { id: "art_small", label: { fr: "Petite oeuvre / tableau", en: "Small artwork / painting" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
        { id: "art_large", label: { fr: "Grande sculpture / oeuvre", en: "Large sculpture / artwork" }, volume_m3: 0.5, fragile: true, heavy: true, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      ]
    },
  ],

  boxes: [
    { id: "box_standard",  icon: "📦", name: { fr: "Carton standard",  en: "Standard box"  }, variants: [{ id: "v", label: { fr: "Standard",  en: "Standard"  }, volume_m3: 0.07, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_large",     icon: "📦", name: { fr: "Grand carton",      en: "Large box"     }, variants: [{ id: "v", label: { fr: "Grand",     en: "Large"     }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_books",     icon: "📚", name: { fr: "Carton livres",     en: "Books box"     }, variants: [{ id: "v", label: { fr: "Livres",    en: "Books"     }, volume_m3: 0.04, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_wardrobe",  icon: "👔", name: { fr: "Carton penderie",   en: "Wardrobe box"  }, variants: [{ id: "v", label: { fr: "Penderie",  en: "Wardrobe"  }, volume_m3: 0.40, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_dishes",    icon: "🍽️", name: { fr: "Carton vaisselle",  en: "Dishes box"    }, variants: [{ id: "v", label: { fr: "Vaisselle", en: "Dishes"    }, volume_m3: 0.07, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_archives",  icon: "🗂️", name: { fr: "Carton archives",   en: "Archives box"  }, variants: [{ id: "v", label: { fr: "Archives",  en: "Archives"  }, volume_m3: 0.04, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_fragile",   icon: "⚠️", name: { fr: "Carton fragile",    en: "Fragile box"   }, variants: [{ id: "v", label: { fr: "Fragile",   en: "Fragile"   }, volume_m3: 0.08, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_tv",        icon: "📺", name: { fr: "Carton TV",         en: "TV box"        }, variants: [{ id: "v", label: { fr: "TV",        en: "TV"        }, volume_m3: 0.15, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_linen",     icon: "🧺", name: { fr: "Carton linge",      en: "Linen box"     }, variants: [{ id: "v", label: { fr: "Linge",     en: "Linen"     }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
    { id: "box_plastic",   icon: "🗃️", name: { fr: "Caisse plastique",  en: "Plastic bin"   }, variants: [{ id: "v", label: { fr: "Caisse plastique", en: "Plastic bin" }, volume_m3: 0.10, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false }] },
  ],

  entrance: [
    { id: "entr_shoe_cabinet", name: { fr: "Meuble à chaussures", en: "Shoe cabinet" }, icon: "👟", variants: [
      { id: "esc_small", label: { fr: "Petit (2-4 niveaux)", en: "Small (2-4 tiers)" }, volume_m3: 0.2, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "esc_large", label: { fr: "Grand meuble à chaussures", en: "Large shoe cabinet" }, volume_m3: 0.5, fragile: false, heavy: true, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "entr_coat_rack", name: { fr: "Porte-manteau", en: "Coat rack" }, icon: "🧥", variants: [
      { id: "ecr_floor", label: { fr: "Porte-manteau sur pied", en: "Floor coat rack" }, volume_m3: 0.1, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
      { id: "ecr_wall", label: { fr: "Patère murale", en: "Wall coat rack" }, volume_m3: 0.05, fragile: false, heavy: false, requires_protection: false, requires_disassembly: true, possible_furniture_lift: false },
    ]},
    { id: "entr_console", name: { fr: "Console d'entrée", en: "Entry console" }, icon: "🪑", variants: [
      { id: "ec_std", label: { fr: "Console d'entrée", en: "Entry console" }, volume_m3: 0.2, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "entr_mirror", name: { fr: "Miroir d'entrée", en: "Entry mirror" }, icon: "🪞", variants: [
      { id: "em_small", label: { fr: "Petit miroir", en: "Small mirror" }, volume_m3: 0.05, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
      { id: "em_large", label: { fr: "Grand miroir", en: "Large mirror" }, volume_m3: 0.15, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "entr_bench", name: { fr: "Banc d'entrée", en: "Entry bench" }, icon: "🪑", variants: [
      { id: "eb_std", label: { fr: "Banc d'entrée", en: "Entry bench" }, volume_m3: 0.3, fragile: false, heavy: false, requires_protection: false, requires_disassembly: false, possible_furniture_lift: false },
    ]},
    { id: "entr_artwork", name: { fr: "Tableau / Oeuvre d'art", en: "Painting / Artwork" }, icon: "🖼️", variants: [
      { id: "entr_a_lot", label: { fr: "Tableau / oeuvre", en: "Painting / artwork" }, volume_m3: 0.1, fragile: true, heavy: false, requires_protection: true, requires_disassembly: false, possible_furniture_lift: false },
    ]},
  ],

  roomCatalogMap: {
    livingRoom:   ["livingRoom",   "diningRoom", "boxes"],
    diningRoom:   ["diningRoom",   "livingRoom", "kitchen", "boxes"],
    kitchen:      ["kitchen",      "boxes"],
    bedroom:      ["bedroom",      "babyEquip",  "boxes"],
    childBedroom: ["bedroom",      "babyEquip",  "boxes"],
    office:       ["office",       "boxes"],
    bathroom:     ["bathroom",     "boxes"],
    dressing:     ["bedroom",      "boxes"],
    laundry:      ["laundry",      "boxes"],
    garage:       ["garageBasement","boxes"],
    basement:     ["garageBasement","boxes"],
    attic:        ["garageBasement","boxes"],
    garden:       ["garden",       "garageBasement", "boxes"],
    storageBox:   ["garageBasement","boxes"],
    entrance:     ["entrance",     "boxes"],
    misc:         ["bedroom",      "livingRoom", "boxes"],
  },

  roomIcons: {
    livingRoom: "🛋️",
    diningRoom: "🍽️",
    kitchen: "🍳",
    bedroom: "🛏️",
    childBedroom: "🧸",
    office: "💻",
    bathroom: "🚿",
    dressing: "👗",
    laundry: "🫧",
    garage: "🚗",
    basement: "📦",
    attic: "🏚️",
    garden: "🌿",
    storageBox: "🗄️",
    entrance: "🚪",
    misc: "📋",
  }
};

export const CRATE_ELIGIBLE_IDS = new Set(['tv', 'mirror', 'artwork', 'piano_upright', 'piano_grand', 'aquarium', 'living_tv', 'dining_tv', 'office_tv']);
