// The groups the closet files pieces under. Built so the labels from the common fashion datasets fall
// cleanly into one group each (see DATASET_LABELS below).
export const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Jewellery"] as const;

export type Category = (typeof CATEGORIES)[number];

// Where each dataset label lands, so a detector trained on any of them can file what it finds.
// Fashionpedia (27 garments and accessories; its 19 garment parts like collar or zipper aren't pieces and are left out),
// ModaNet (13) and DeepFashion2 (13). None of them has necklaces, earrings, rings or bracelets; Fashionpedia's watch
// is the only jewellery label, so the rest of that group needs another dataset or a model of its own.
export const DATASET_LABELS: Record<string, Category> =
  {
    // Fashionpedia
    "shirt, blouse": "Tops",
    "top, t-shirt, sweatshirt": "Tops",
    "sweater": "Tops",
    "cardigan": "Tops",
    "vest": "Tops",
    "pants": "Bottoms",
    "shorts": "Bottoms",
    "skirt": "Bottoms",
    "tights, stockings": "Bottoms",
    "dress": "Dresses",
    "jumpsuit": "Dresses",
    "jacket": "Outerwear",
    "coat": "Outerwear",
    "cape": "Outerwear",
    "shoe": "Shoes",
    "sock": "Shoes",
    "leg warmer": "Shoes",
    "bag, wallet": "Bags",
    "glasses": "Accessories",
    "hat": "Accessories",
    "headband, head covering, hair accessory": "Accessories",
    "tie": "Accessories",
    "glove": "Accessories",
    "belt": "Accessories",
    "scarf": "Accessories",
    "umbrella": "Accessories",
    "watch": "Jewellery",

    // ModaNet (the ones Fashionpedia doesn't already cover)
    "top": "Tops",
    "outer": "Outerwear",
    "boots": "Shoes",
    "footwear": "Shoes",
    "bag": "Bags",
    "sunglasses": "Accessories",
    "headwear": "Accessories",
    "scarf & tie": "Accessories",

    // DeepFashion2
    "short sleeve top": "Tops",
    "long sleeve top": "Tops",
    "sling": "Tops",
    "trousers": "Bottoms",
    "short sleeve outwear": "Outerwear",
    "long sleeve outwear": "Outerwear",
    "short sleeve dress": "Dresses",
    "long sleeve dress": "Dresses",
    "vest dress": "Dresses",
    "sling dress": "Dresses",
  };

// Only what a cutout can tell you: what the piece is (named by colour and type, like "Blue cargo pants")
// and which group it goes in.
export type Piece =
  {
    id: string;
    name: string;
    // Null until the piece has been sorted. Photos you add yourself start out that way.
    category: Category | null;
    photoUrl?: string;
  };

// Stand-in pieces so the closet has something in it while there's no server to keep the real ones.
// Each one looks for its photo in public/closet, named after its id (camel-coat.jpg and so on).
function sample(id: string, name: string, category: Category): Piece
  {
    return { id, name, category, photoUrl: `/closet/${id}.jpg` };
  }

export const SAMPLE_PIECES: Piece[] = [
  sample("oatmeal-jumper", "Oatmeal mock-neck jumper", "Tops"),
  sample("olive-skirt", "Olive midi skirt", "Bottoms"),
  sample("khaki-cargos", "Khaki cargo pants", "Bottoms"),
  sample("charcoal-blazer", "Charcoal double-breasted blazer", "Outerwear"),
  sample("camel-coat", "Camel long coat", "Outerwear"),
  sample("cream-trousers", "Cream straight trousers", "Bottoms"),
  sample("white-shirt", "White button-up shirt", "Tops"),
  sample("brown-loafers", "Brown penny loafers", "Shoes"),
  sample("blue-jeans", "Blue straight jeans", "Bottoms"),
  sample("navy-tee", "Navy T-shirt", "Tops"),
  sample("tan-bag", "Tan shoulder bag", "Bags"),
  sample("white-sneakers", "White low sneakers", "Shoes"),
  sample("black-slip-dress", "Black slip dress", "Dresses"),
  sample("black-boots", "Black ankle boots", "Shoes"),
  sample("brown-belt", "Brown leather belt", "Accessories"),
  sample("tortoise-sunglasses", "Tortoiseshell sunglasses", "Accessories"),
  sample("gold-hoops", "Gold hoop earrings", "Jewellery"),
  sample("silver-chain", "Silver chain necklace", "Jewellery"),
];
