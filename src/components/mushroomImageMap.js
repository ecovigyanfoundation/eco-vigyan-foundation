// Mapping of mushroom constants to their corresponding image files
export const MUSHROOM_IMAGE_MAP = {
  // Ecological Roles
  decomposer: "/mushrooms/decomposing mushroom.png",
  symbiont: "/mushrooms/symbiotic.png",
  parasite: "/mushrooms/parasitic mushroom.png",

  // Textures
  "soft-to-touch": "/mushrooms/soft to touch.png",
  "hard-to-touch": "/mushrooms/hard to touch.png",
  "jelly-like": "/mushrooms/Jelly texture.png",
  leathery: "/mushrooms/leather textured mushroom.png",

  // Undersides
  gills: "/mushrooms/gills.png",
  pores: "/mushrooms/pores.png",
  teeth: "/mushrooms/teeth.png",
  "ball-with-no-distinctive-bottom": "/mushrooms/ball shaped mushroom.png",
  "cup-with-no-distinctive-bottom": "/mushrooms/cup shaped.png",
  "star-with-no-distinctive-bottom": "/mushrooms/Star shape.png",
  "jelly-with-no-distinctive-bottom": "/mushrooms/jelly2.png",
  "sponge-with-no-distinctive-bottom": "/mushrooms/crusted mushroom.png",

  // Fruiting Surfaces
  ground: "/mushrooms/underground.png",
  leaf: "/mushrooms/mushroom on leaf.png",
  wood: "/mushrooms/Mushroom on wood.png",
  dung: "/mushrooms/mushroom on dung.png",

  // Stem Presence
  "has-stem": "/mushrooms/WITH STEM FINAL.png",
  "has-no-stem": "/mushrooms/WITHOUT STEM FINAL.png",

  // Common Uses
  edible: "/mushrooms/edible.png",
  inedible: "/mushrooms/inedible.png",
  poisonous: "/mushrooms/poisonous.png",
  medicinal: "/mushrooms/medicinal.png",
  hallucinogenic: "/mushrooms/magic mushroom.png",
  "other-uses": "/mushrooms/other utilities mushroom.png",
  mysterious: "/mushrooms/mysterious.png",
};

// Helper function to get image path for a constant value
export const getMushroomImage = (value) => {
  return MUSHROOM_IMAGE_MAP[value] || null;
};

// Helper function to get display name (formatted from constant value)
export const getDisplayName = (value) => {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
















