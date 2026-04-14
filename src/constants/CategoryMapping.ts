export const CATEGORIES = [
  "Fine Arts",
  "Dance",
  "Singing",
  "Theatre"
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Fine Arts": "#f59e0b", // Amber
  "Dance": "#ec4899",     // Pink
  "Singing": "#3b82f6",   // Blue
  "Theatre": "#8b5cf6"    // Violet
};

export const EVENT_CATEGORY_MAP: Record<string, string> = {
  // Fine Arts
  "On the Spot Painting": "Fine Arts",
  "Mehndi": "Fine Arts",
  "Rangoli": "Fine Arts",
  "On the Spot Photography": "Fine Arts",
  "Cartooning": "Fine Arts",
  "Clay Modelling": "Fine Arts",
  "Collage Making": "Fine Arts",
  
  // Dance
  "Group Dance (Regional)": "Dance",
  "Luddi": "Dance",
  "Bhangra Boys": "Dance",
  "Western Dance": "Dance",
  "Classical Dance": "Dance",
  
  // Singing
  "Folk Song (Group)": "Singing",
  "Vaar Singing": "Singing",
  "Group Shabad/ Bhajan": "Singing",
  "Group Song Indian": "Singing",
  "Western Group Song": "Singing",
  
  // Theatre
  "Mime": "Theatre",
  "Mimicry": "Theatre",
  "One Act Play": "Theatre",
  "Fashion Show": "Theatre"
};
