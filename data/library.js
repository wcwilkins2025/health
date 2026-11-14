/* Weight Target food library and recipes: the shared, read-only part every user starts from.
   Edit here to add or change a food or a recipe. Ids are permanent (plans refer to them); add new ones, never rename one.
   Nutrition is per 100 g as the recipe measures it (raw meat, cooked bacon, drained fish), net carbs; unit_grams gives
   grams for the units recipes use. Estimates within about 10 percent. */
window.HT_LIB = {
 "foods": [
  {
   "id": "ground-beef-80-20",
   "name": "Ground beef 80/20",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "4 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 254,
   "protein_100": 17,
   "fat_100": 20,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "sirloin-steak",
   "name": "Sirloin steak",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "8 oz",
   "store_section": "Meat",
   "note": "Top sirloin, trimmed",
   "unlocked": true,
   "kcal_100": 205,
   "protein_100": 21,
   "fat_100": 13,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "chuck-roast",
   "name": "Chuck roast",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 220,
   "protein_100": 18,
   "fat_100": 16,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "beef-short-ribs",
   "name": "Beef short ribs",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "8 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 280,
   "protein_100": 16,
   "fat_100": 24,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "pork-chops",
   "name": "Pork chops",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 200,
   "protein_100": 20,
   "fat_100": 13,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "pork-shoulder",
   "name": "Pork shoulder",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Meat",
   "note": "Slow cooker pulled pork, no sauce",
   "unlocked": true,
   "kcal_100": 240,
   "protein_100": 17,
   "fat_100": 19,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "pork-ribs",
   "name": "Pork ribs",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "8 oz",
   "store_section": "Meat",
   "note": "Dry rub only, no BBQ sauce",
   "unlocked": true,
   "kcal_100": 280,
   "protein_100": 16,
   "fat_100": 24,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "bacon",
   "name": "Bacon",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "3 slices",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 541,
   "protein_100": 37,
   "fat_100": 42,
   "carbs_100": 1,
   "unit_grams": {
    "slice": 8
   }
  },
  {
   "id": "breakfast-sausage",
   "name": "Breakfast sausage",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 links",
   "store_section": "Meat",
   "note": "Check label for sugar",
   "unlocked": true,
   "kcal_100": 300,
   "protein_100": 14,
   "fat_100": 27,
   "carbs_100": 1,
   "unit_grams": {
    "link": 28
   }
  },
  {
   "id": "jimmy-dean-sausage-patties",
   "name": "Jimmy Dean sausage patties",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 patties",
   "store_section": "Meat",
   "note": "Original. Fresh or fully cooked",
   "unlocked": true,
   "kcal_100": 410,
   "protein_100": 12,
   "fat_100": 40,
   "carbs_100": 1,
   "unit_grams": {
    "patty": 34
   }
  },
  {
   "id": "italian-sausage",
   "name": "Italian sausage",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 link",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 290,
   "protein_100": 15,
   "fat_100": 25,
   "carbs_100": 2,
   "unit_grams": {
    "link": 85
   }
  },
  {
   "id": "chicken-thighs",
   "name": "Chicken thighs",
   "category": "poultry",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Meat",
   "note": "Skin on, bone in",
   "unlocked": true,
   "kcal_100": 180,
   "protein_100": 15,
   "fat_100": 13,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "chicken-wings",
   "name": "Chicken wings",
   "category": "poultry",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "8 wings",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 290,
   "protein_100": 27,
   "fat_100": 19,
   "carbs_100": 0,
   "unit_grams": {
    "wing": 32
   }
  },
  {
   "id": "chicken-breast",
   "name": "Chicken breast",
   "category": "poultry",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 120,
   "protein_100": 22,
   "fat_100": 2.6,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "rotisserie-chicken",
   "name": "Rotisserie chicken",
   "category": "poultry",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Deli",
   "note": "Great lazy option",
   "unlocked": true,
   "kcal_100": 200,
   "protein_100": 25,
   "fat_100": 11,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "ground-turkey",
   "name": "Ground turkey",
   "category": "poultry",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "4 oz",
   "store_section": "Meat",
   "note": "",
   "unlocked": true,
   "kcal_100": 150,
   "protein_100": 19,
   "fat_100": 8,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "pepperoni",
   "name": "Pepperoni",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 oz",
   "store_section": "Deli",
   "note": "",
   "unlocked": true,
   "kcal_100": 494,
   "protein_100": 23,
   "fat_100": 44,
   "carbs_100": 1,
   "unit_grams": {}
  },
  {
   "id": "salami",
   "name": "Salami",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 oz",
   "store_section": "Deli",
   "note": "",
   "unlocked": true,
   "kcal_100": 407,
   "protein_100": 22,
   "fat_100": 34,
   "carbs_100": 1,
   "unit_grams": {}
  },
  {
   "id": "deli-turkey",
   "name": "Deli turkey",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "4 oz",
   "store_section": "Deli",
   "note": "No sugar added, under 1g carb",
   "unlocked": true,
   "kcal_100": 105,
   "protein_100": 18,
   "fat_100": 2,
   "carbs_100": 2,
   "unit_grams": {}
  },
  {
   "id": "deli-ham",
   "name": "Deli ham",
   "category": "meat",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "4 oz",
   "store_section": "Deli",
   "note": "No honey or brown sugar glaze",
   "unlocked": true,
   "kcal_100": 120,
   "protein_100": 17,
   "fat_100": 4,
   "carbs_100": 2,
   "unit_grams": {}
  },
  {
   "id": "beef-jerky-sugar-free",
   "name": "Beef jerky (sugar-free)",
   "category": "snack",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "Read the label; most jerky has sugar",
   "unlocked": true,
   "kcal_100": 300,
   "protein_100": 40,
   "fat_100": 12,
   "carbs_100": 4,
   "unit_grams": {}
  },
  {
   "id": "landjaeger-sticks",
   "name": "Landjaeger sticks",
   "category": "snack",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "3 sticks",
   "store_section": "Deli",
   "note": "Bavarian Meats Lil' Landjaeger, hot and spicy. Dry smoked sausage, no fridge needed",
   "unlocked": true,
   "kcal_100": 370,
   "protein_100": 25,
   "fat_100": 29,
   "carbs_100": 2,
   "unit_grams": {
    "stick": 28
   }
  },
  {
   "id": "pork-rinds",
   "name": "Pork rinds",
   "category": "snack",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "",
   "unlocked": true,
   "kcal_100": 544,
   "protein_100": 61,
   "fat_100": 31,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "salmon-fillet",
   "name": "Salmon fillet",
   "category": "seafood",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Seafood",
   "note": "",
   "unlocked": true,
   "kcal_100": 208,
   "protein_100": 20,
   "fat_100": 13,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "canned-tuna",
   "name": "Canned tuna",
   "category": "seafood",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 can",
   "store_section": "Pantry",
   "note": "Pop-top cans travel well",
   "unlocked": true,
   "kcal_100": 116,
   "protein_100": 26,
   "fat_100": 1,
   "carbs_100": 0,
   "unit_grams": {
    "can": 120
   }
  },
  {
   "id": "canned-sardines",
   "name": "Canned sardines",
   "category": "seafood",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 can",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 208,
   "protein_100": 25,
   "fat_100": 11,
   "carbs_100": 0,
   "unit_grams": {
    "can": 92
   }
  },
  {
   "id": "shrimp",
   "name": "Shrimp",
   "category": "seafood",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "6 oz",
   "store_section": "Seafood",
   "note": "Frozen raw is cheapest",
   "unlocked": true,
   "kcal_100": 85,
   "protein_100": 20,
   "fat_100": 0.5,
   "carbs_100": 1,
   "unit_grams": {}
  },
  {
   "id": "cod-or-tilapia",
   "name": "Cod or tilapia",
   "category": "seafood",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "6 oz",
   "store_section": "Seafood",
   "note": "",
   "unlocked": true,
   "kcal_100": 90,
   "protein_100": 19,
   "fat_100": 1.5,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "eggs",
   "name": "Eggs",
   "category": "eggs",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 egg",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 143,
   "protein_100": 12.6,
   "fat_100": 9.5,
   "carbs_100": 0.7,
   "unit_grams": {
    "egg": 50
   }
  },
  {
   "id": "cheddar-cheese",
   "name": "Cheddar cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 oz",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 403,
   "protein_100": 23,
   "fat_100": 33,
   "carbs_100": 1.3,
   "unit_grams": {
    "slice": 28
   }
  },
  {
   "id": "mozzarella-cheese",
   "name": "Mozzarella cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 oz",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 300,
   "protein_100": 22,
   "fat_100": 22,
   "carbs_100": 2.2,
   "unit_grams": {}
  },
  {
   "id": "swiss-cheese",
   "name": "Swiss cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 slice",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 380,
   "protein_100": 27,
   "fat_100": 28,
   "carbs_100": 1.5,
   "unit_grams": {
    "slice": 28
   }
  },
  {
   "id": "cream-cheese",
   "name": "Cream cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 oz",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 342,
   "protein_100": 6,
   "fat_100": 34,
   "carbs_100": 4,
   "unit_grams": {
    "tbsp": 14.5
   }
  },
  {
   "id": "string-cheese",
   "name": "String cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 stick",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 280,
   "protein_100": 24,
   "fat_100": 18,
   "carbs_100": 2,
   "unit_grams": {
    "stick": 28
   }
  },
  {
   "id": "parmesan-cheese",
   "name": "Parmesan cheese",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 oz",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 431,
   "protein_100": 38,
   "fat_100": 29,
   "carbs_100": 4,
   "unit_grams": {
    "tbsp": 5
   }
  },
  {
   "id": "heavy-cream",
   "name": "Heavy cream",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 0.5,
   "serving": "1 tbsp",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 340,
   "protein_100": 2.8,
   "fat_100": 36,
   "carbs_100": 2.8,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "butter",
   "name": "Butter",
   "category": "fat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tbsp",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 717,
   "protein_100": 0.9,
   "fat_100": 81,
   "carbs_100": 0,
   "unit_grams": {
    "tbsp": 14
   }
  },
  {
   "id": "sour-cream",
   "name": "Sour cream",
   "category": "dairy",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 tbsp",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": true,
   "kcal_100": 198,
   "protein_100": 2.4,
   "fat_100": 19,
   "carbs_100": 4.6,
   "unit_grams": {
    "tbsp": 12
   }
  },
  {
   "id": "olive-oil",
   "name": "Olive oil",
   "category": "fat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tbsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 884,
   "protein_100": 0,
   "fat_100": 100,
   "carbs_100": 0,
   "unit_grams": {
    "tbsp": 13.5
   }
  },
  {
   "id": "avocado-oil",
   "name": "Avocado oil",
   "category": "fat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tbsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 884,
   "protein_100": 0,
   "fat_100": 100,
   "carbs_100": 0,
   "unit_grams": {
    "tbsp": 13.5
   }
  },
  {
   "id": "mayonnaise",
   "name": "Mayonnaise",
   "category": "fat",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tbsp",
   "store_section": "Pantry",
   "note": "Real mayo, not light",
   "unlocked": true,
   "kcal_100": 680,
   "protein_100": 1,
   "fat_100": 75,
   "carbs_100": 0.6,
   "unit_grams": {
    "tbsp": 14
   }
  },
  {
   "id": "ranch-dressing",
   "name": "Ranch dressing",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 tbsp",
   "store_section": "Pantry",
   "note": "Full fat",
   "unlocked": true,
   "kcal_100": 430,
   "protein_100": 1,
   "fat_100": 45,
   "carbs_100": 5,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "blue-cheese-dressing",
   "name": "Blue cheese dressing",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 tbsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 480,
   "protein_100": 2,
   "fat_100": 50,
   "carbs_100": 4,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "caesar-dressing",
   "name": "Caesar dressing",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 tbsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 480,
   "protein_100": 2,
   "fat_100": 50,
   "carbs_100": 3,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "light-italian-dressing",
   "name": "Light Italian dressing",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "2 tbsp",
   "store_section": "Pantry",
   "note": "Check the label: under 3 g sugar",
   "unlocked": true,
   "kcal_100": 80,
   "protein_100": 0.3,
   "fat_100": 5,
   "carbs_100": 6,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "mustard",
   "name": "Mustard",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 60,
   "protein_100": 4,
   "fat_100": 3,
   "carbs_100": 3,
   "unit_grams": {
    "tsp": 5
   }
  },
  {
   "id": "hot-sauce",
   "name": "Hot sauce",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 tsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 10,
   "protein_100": 0.5,
   "fat_100": 0.4,
   "carbs_100": 1,
   "unit_grams": {
    "tsp": 5,
    "tbsp": 15
   }
  },
  {
   "id": "pickles",
   "name": "Pickles",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 spears",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 12,
   "protein_100": 0.5,
   "fat_100": 0.2,
   "carbs_100": 1,
   "unit_grams": {
    "spear": 35
   }
  },
  {
   "id": "olives",
   "name": "Olives",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "10 olives",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 115,
   "protein_100": 0.8,
   "fat_100": 11,
   "carbs_100": 3,
   "unit_grams": {
    "olive": 4
   }
  },
  {
   "id": "salt",
   "name": "Salt",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "to taste",
   "store_section": "Pantry",
   "note": "Use generously the first two weeks",
   "unlocked": true,
   "kcal_100": 0,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {
    "tsp": 6
   }
  },
  {
   "id": "black-pepper",
   "name": "Black pepper",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "to taste",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 250,
   "protein_100": 10,
   "fat_100": 3,
   "carbs_100": 38,
   "unit_grams": {
    "tsp": 2.3
   }
  },
  {
   "id": "garlic-powder",
   "name": "Garlic powder",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "to taste",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 330,
   "protein_100": 17,
   "fat_100": 0.7,
   "carbs_100": 60,
   "unit_grams": {
    "tsp": 3
   }
  },
  {
   "id": "taco-seasoning",
   "name": "Taco seasoning",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "1 tbsp",
   "store_section": "Pantry",
   "note": "Check for sugar or make your own",
   "unlocked": true,
   "kcal_100": 300,
   "protein_100": 8,
   "fat_100": 5,
   "carbs_100": 40,
   "unit_grams": {
    "tbsp": 9,
    "tsp": 3
   }
  },
  {
   "id": "italian-seasoning",
   "name": "Italian seasoning",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "to taste",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 250,
   "protein_100": 10,
   "fat_100": 6,
   "carbs_100": 30,
   "unit_grams": {
    "tsp": 1
   }
  },
  {
   "id": "soy-sauce",
   "name": "Soy sauce",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 tbsp",
   "store_section": "Pantry",
   "note": "",
   "unlocked": true,
   "kcal_100": 53,
   "protein_100": 8,
   "fat_100": 0,
   "carbs_100": 5,
   "unit_grams": {
    "tbsp": 16
   }
  },
  {
   "id": "lemon-juice",
   "name": "Lemon juice",
   "category": "condiment",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 tbsp",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 22,
   "protein_100": 0.4,
   "fat_100": 0.2,
   "carbs_100": 6.5,
   "unit_grams": {
    "tbsp": 15
   }
  },
  {
   "id": "avocado",
   "name": "Avocado",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "1/2 avocado",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 160,
   "protein_100": 2,
   "fat_100": 15,
   "carbs_100": 1.8,
   "unit_grams": {
    "avocado": 150
   }
  },
  {
   "id": "spinach",
   "name": "Spinach",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 cups",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 23,
   "protein_100": 2.9,
   "fat_100": 0.4,
   "carbs_100": 1.4,
   "unit_grams": {
    "cup": 30
   }
  },
  {
   "id": "romaine-lettuce",
   "name": "Romaine lettuce",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 cups",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 17,
   "protein_100": 1.2,
   "fat_100": 0.3,
   "carbs_100": 1.2,
   "unit_grams": {
    "cup": 47
   }
  },
  {
   "id": "broccoli",
   "name": "Broccoli",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 4,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 34,
   "protein_100": 2.8,
   "fat_100": 0.4,
   "carbs_100": 4.0,
   "unit_grams": {
    "cup": 91
   }
  },
  {
   "id": "cauliflower",
   "name": "Cauliflower",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 3,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "Riced cauliflower stands in for rice",
   "unlocked": true,
   "kcal_100": 25,
   "protein_100": 1.9,
   "fat_100": 0.3,
   "carbs_100": 3.0,
   "unit_grams": {
    "cup": 107
   }
  },
  {
   "id": "green-beans",
   "name": "Green beans",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 4,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 31,
   "protein_100": 1.8,
   "fat_100": 0.1,
   "carbs_100": 4.3,
   "unit_grams": {
    "cup": 100
   }
  },
  {
   "id": "asparagus",
   "name": "Asparagus",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "6 spears",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 20,
   "protein_100": 2.2,
   "fat_100": 0.1,
   "carbs_100": 1.8,
   "unit_grams": {
    "spear": 16
   }
  },
  {
   "id": "zucchini",
   "name": "Zucchini",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 3,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 17,
   "protein_100": 1.2,
   "fat_100": 0.3,
   "carbs_100": 2.1,
   "unit_grams": {
    "cup": 124
   }
  },
  {
   "id": "cabbage",
   "name": "Cabbage",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 3,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 25,
   "protein_100": 1.3,
   "fat_100": 0.1,
   "carbs_100": 3.3,
   "unit_grams": {
    "cup": 89
   }
  },
  {
   "id": "tri-color-slaw-mix",
   "name": "Tri-color slaw mix",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 3,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "Bagged cabbage, red cabbage, a little carrot",
   "unlocked": true,
   "kcal_100": 27,
   "protein_100": 1.3,
   "fat_100": 0.1,
   "carbs_100": 3.6,
   "unit_grams": {
    "cup": 85
   }
  },
  {
   "id": "bell-pepper",
   "name": "Bell pepper",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 4,
   "serving": "1/2 pepper",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 31,
   "protein_100": 1,
   "fat_100": 0.3,
   "carbs_100": 3.9,
   "unit_grams": {
    "pepper": 120
   }
  },
  {
   "id": "mushrooms",
   "name": "Mushrooms",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 22,
   "protein_100": 3.1,
   "fat_100": 0.3,
   "carbs_100": 2.3,
   "unit_grams": {
    "cup": 70
   }
  },
  {
   "id": "cucumber",
   "name": "Cucumber",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 2,
   "serving": "1/2 cucumber",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 15,
   "protein_100": 0.7,
   "fat_100": 0.1,
   "carbs_100": 3.1,
   "unit_grams": {
    "cucumber": 300
   }
  },
  {
   "id": "celery",
   "name": "Celery",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "2 stalks",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 16,
   "protein_100": 0.7,
   "fat_100": 0.2,
   "carbs_100": 1.4,
   "unit_grams": {
    "stalk": 40
   }
  },
  {
   "id": "onion",
   "name": "Onion",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 4,
   "serving": "1/4 onion",
   "store_section": "Produce",
   "note": "Small amounts for flavor",
   "unlocked": true,
   "kcal_100": 40,
   "protein_100": 1.1,
   "fat_100": 0.1,
   "carbs_100": 7.6,
   "unit_grams": {
    "onion": 110
   }
  },
  {
   "id": "garlic",
   "name": "Garlic",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 clove",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 149,
   "protein_100": 6.4,
   "fat_100": 0.5,
   "carbs_100": 31,
   "unit_grams": {
    "clove": 3
   }
  },
  {
   "id": "tomato",
   "name": "Tomato",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 3,
   "serving": "2 slices",
   "store_section": "Produce",
   "note": "Small amounts",
   "unlocked": true,
   "kcal_100": 18,
   "protein_100": 0.9,
   "fat_100": 0.2,
   "carbs_100": 2.7,
   "unit_grams": {
    "slice": 20
   }
  },
  {
   "id": "jalapeno",
   "name": "Jalapeno",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 pepper",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 29,
   "protein_100": 0.9,
   "fat_100": 0.4,
   "carbs_100": 3.7,
   "unit_grams": {
    "pepper": 14
   }
  },
  {
   "id": "brussels-sprouts",
   "name": "Brussels sprouts",
   "category": "vegetable",
   "light": "green",
   "carbs_per_serving": 5,
   "serving": "1 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": true,
   "kcal_100": 43,
   "protein_100": 3.4,
   "fat_100": 0.3,
   "carbs_100": 5.2,
   "unit_grams": {
    "cup": 88
   }
  },
  {
   "id": "coffee",
   "name": "Coffee",
   "category": "drink",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 cup",
   "store_section": "Drinks",
   "note": "Black, or with heavy cream",
   "unlocked": true,
   "kcal_100": 1,
   "protein_100": 0.1,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {
    "cup": 240
   }
  },
  {
   "id": "unsweetened-tea",
   "name": "Unsweetened tea",
   "category": "drink",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 cup",
   "store_section": "Drinks",
   "note": "",
   "unlocked": true,
   "kcal_100": 1,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {
    "cup": 240
   }
  },
  {
   "id": "sparkling-water",
   "name": "Sparkling water",
   "category": "drink",
   "light": "green",
   "carbs_per_serving": 0,
   "serving": "1 can",
   "store_section": "Drinks",
   "note": "",
   "unlocked": true,
   "kcal_100": 0,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {
    "can": 355
   }
  },
  {
   "id": "bone-broth",
   "name": "Bone broth",
   "category": "drink",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 cup",
   "store_section": "Pantry",
   "note": "Good for salt the first two weeks",
   "unlocked": true,
   "kcal_100": 18,
   "protein_100": 4,
   "fat_100": 0.3,
   "carbs_100": 0.4,
   "unit_grams": {
    "cup": 240
   }
  },
  {
   "id": "unsweetened-almond-milk",
   "name": "Unsweetened almond milk",
   "category": "drink",
   "light": "green",
   "carbs_per_serving": 1,
   "serving": "1 cup",
   "store_section": "Dairy & Eggs",
   "note": "Replaces milk",
   "unlocked": true,
   "kcal_100": 15,
   "protein_100": 0.5,
   "fat_100": 1.2,
   "carbs_100": 0.3,
   "unit_grams": {
    "cup": 240
   }
  },
  {
   "id": "almonds",
   "name": "Almonds",
   "category": "nuts",
   "light": "yellow",
   "carbs_per_serving": 3,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "Easy to overeat; pre-portion",
   "unlocked": false,
   "kcal_100": 579,
   "protein_100": 21,
   "fat_100": 50,
   "carbs_100": 9,
   "unit_grams": {}
  },
  {
   "id": "pecans",
   "name": "Pecans",
   "category": "nuts",
   "light": "yellow",
   "carbs_per_serving": 1,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "",
   "unlocked": false,
   "kcal_100": 691,
   "protein_100": 9,
   "fat_100": 72,
   "carbs_100": 4,
   "unit_grams": {}
  },
  {
   "id": "macadamia-nuts",
   "name": "Macadamia nuts",
   "category": "nuts",
   "light": "yellow",
   "carbs_per_serving": 2,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "",
   "unlocked": false,
   "kcal_100": 718,
   "protein_100": 8,
   "fat_100": 76,
   "carbs_100": 5,
   "unit_grams": {}
  },
  {
   "id": "walnuts",
   "name": "Walnuts",
   "category": "nuts",
   "light": "yellow",
   "carbs_per_serving": 2,
   "serving": "1 oz",
   "store_section": "Snacks",
   "note": "",
   "unlocked": false,
   "kcal_100": 654,
   "protein_100": 15,
   "fat_100": 65,
   "carbs_100": 7,
   "unit_grams": {}
  },
  {
   "id": "peanut-butter-no-sugar",
   "name": "Peanut butter (no sugar)",
   "category": "nuts",
   "light": "yellow",
   "carbs_per_serving": 4,
   "serving": "2 tbsp",
   "store_section": "Pantry",
   "note": "Same overeating risk as nuts",
   "unlocked": false,
   "kcal_100": 588,
   "protein_100": 25,
   "fat_100": 50,
   "carbs_100": 14,
   "unit_grams": {
    "tbsp": 16
   }
  },
  {
   "id": "blueberries",
   "name": "Blueberries",
   "category": "fruit",
   "light": "yellow",
   "carbs_per_serving": 10,
   "serving": "1/2 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": false,
   "kcal_100": 57,
   "protein_100": 0.7,
   "fat_100": 0.3,
   "carbs_100": 12,
   "unit_grams": {
    "cup": 148
   }
  },
  {
   "id": "raspberries",
   "name": "Raspberries",
   "category": "fruit",
   "light": "yellow",
   "carbs_per_serving": 4,
   "serving": "1/2 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": false,
   "kcal_100": 52,
   "protein_100": 1.2,
   "fat_100": 0.7,
   "carbs_100": 5.4,
   "unit_grams": {
    "cup": 123
   }
  },
  {
   "id": "strawberries",
   "name": "Strawberries",
   "category": "fruit",
   "light": "yellow",
   "carbs_per_serving": 6,
   "serving": "1/2 cup",
   "store_section": "Produce",
   "note": "",
   "unlocked": false,
   "kcal_100": 32,
   "protein_100": 0.7,
   "fat_100": 0.3,
   "carbs_100": 5.7,
   "unit_grams": {
    "cup": 152
   }
  },
  {
   "id": "greek-yogurt-plain-full-fat",
   "name": "Greek yogurt (plain, full fat)",
   "category": "dairy",
   "light": "yellow",
   "carbs_per_serving": 5,
   "serving": "3/4 cup",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": false,
   "kcal_100": 97,
   "protein_100": 9,
   "fat_100": 5,
   "carbs_100": 4,
   "unit_grams": {
    "cup": 245
   }
  },
  {
   "id": "cottage-cheese",
   "name": "Cottage cheese",
   "category": "dairy",
   "light": "yellow",
   "carbs_per_serving": 5,
   "serving": "1/2 cup",
   "store_section": "Dairy & Eggs",
   "note": "",
   "unlocked": false,
   "kcal_100": 98,
   "protein_100": 11,
   "fat_100": 4.3,
   "carbs_100": 3.4,
   "unit_grams": {
    "cup": 225
   }
  },
  {
   "id": "dark-chocolate-85",
   "name": "Dark chocolate 85%",
   "category": "snack",
   "light": "yellow",
   "carbs_per_serving": 5,
   "serving": "2 squares",
   "store_section": "Snacks",
   "note": "",
   "unlocked": false,
   "kcal_100": 600,
   "protein_100": 10,
   "fat_100": 46,
   "carbs_100": 18,
   "unit_grams": {
    "square": 10
   }
  },
  {
   "id": "low-carb-tortillas",
   "name": "Low-carb tortillas",
   "category": "grain",
   "light": "yellow",
   "carbs_per_serving": 4,
   "serving": "1 tortilla",
   "store_section": "Pantry",
   "note": "Tends to reopen the door; probably skip",
   "unlocked": false,
   "kcal_100": 133,
   "protein_100": 11,
   "fat_100": 5.5,
   "carbs_100": 9,
   "unit_grams": {
    "tortilla": 45
   }
  },
  {
   "id": "diet-soda",
   "name": "Diet soda",
   "category": "drink",
   "light": "yellow",
   "carbs_per_serving": 0,
   "serving": "1 can",
   "store_section": "Drinks",
   "note": "Sweet taste can fire cravings",
   "unlocked": false,
   "kcal_100": 0,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {
    "can": 355
   }
  },
  {
   "id": "dry-red-wine",
   "name": "Dry red wine",
   "category": "drink",
   "light": "yellow",
   "carbs_per_serving": 4,
   "serving": "5 oz",
   "store_section": "Drinks",
   "note": "Lowers your guard around food",
   "unlocked": false,
   "kcal_100": 85,
   "protein_100": 0.1,
   "fat_100": 0,
   "carbs_100": 2.6,
   "unit_grams": {}
  },
  {
   "id": "whiskey-or-vodka",
   "name": "Whiskey or vodka",
   "category": "drink",
   "light": "yellow",
   "carbs_per_serving": 0,
   "serving": "1.5 oz",
   "store_section": "Drinks",
   "note": "",
   "unlocked": false,
   "kcal_100": 250,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 0,
   "unit_grams": {}
  },
  {
   "id": "bread",
   "name": "Bread",
   "category": "grain",
   "light": "red",
   "carbs_per_serving": 15,
   "serving": "1 slice",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 265,
   "protein_100": 9,
   "fat_100": 3.2,
   "carbs_100": 46,
   "unit_grams": {
    "slice": 30
   }
  },
  {
   "id": "pasta",
   "name": "Pasta",
   "category": "grain",
   "light": "red",
   "carbs_per_serving": 40,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 158,
   "protein_100": 5.8,
   "fat_100": 0.9,
   "carbs_100": 29,
   "unit_grams": {
    "cup": 140
   }
  },
  {
   "id": "white-rice",
   "name": "White rice",
   "category": "grain",
   "light": "red",
   "carbs_per_serving": 45,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 130,
   "protein_100": 2.7,
   "fat_100": 0.3,
   "carbs_100": 28,
   "unit_grams": {
    "cup": 158
   }
  },
  {
   "id": "potatoes",
   "name": "Potatoes",
   "category": "vegetable",
   "light": "red",
   "carbs_per_serving": 30,
   "serving": "1 medium",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 77,
   "protein_100": 2,
   "fat_100": 0.1,
   "carbs_100": 15,
   "unit_grams": {
    "medium": 173
   }
  },
  {
   "id": "french-fries",
   "name": "French fries",
   "category": "vegetable",
   "light": "red",
   "carbs_per_serving": 45,
   "serving": "1 serving",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 312,
   "protein_100": 3.4,
   "fat_100": 15,
   "carbs_100": 38,
   "unit_grams": {
    "serving": 117
   }
  },
  {
   "id": "corn",
   "name": "Corn",
   "category": "vegetable",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1 ear",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 86,
   "protein_100": 3.3,
   "fat_100": 1.4,
   "carbs_100": 16,
   "unit_grams": {
    "ear": 90
   }
  },
  {
   "id": "beans",
   "name": "Beans",
   "category": "vegetable",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1/2 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 127,
   "protein_100": 8.7,
   "fat_100": 0.5,
   "carbs_100": 16,
   "unit_grams": {
    "cup": 172
   }
  },
  {
   "id": "oatmeal",
   "name": "Oatmeal",
   "category": "grain",
   "light": "red",
   "carbs_per_serving": 27,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 71,
   "protein_100": 2.5,
   "fat_100": 1.5,
   "carbs_100": 10,
   "unit_grams": {
    "cup": 234
   }
  },
  {
   "id": "cereal",
   "name": "Cereal",
   "category": "grain",
   "light": "red",
   "carbs_per_serving": 30,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 380,
   "protein_100": 7,
   "fat_100": 3,
   "carbs_100": 80,
   "unit_grams": {
    "cup": 30
   }
  },
  {
   "id": "chips",
   "name": "Chips",
   "category": "snack",
   "light": "red",
   "carbs_per_serving": 15,
   "serving": "1 oz",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 536,
   "protein_100": 7,
   "fat_100": 35,
   "carbs_100": 48,
   "unit_grams": {}
  },
  {
   "id": "crackers",
   "name": "Crackers",
   "category": "snack",
   "light": "red",
   "carbs_per_serving": 20,
   "serving": "10 crackers",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 500,
   "protein_100": 7,
   "fat_100": 25,
   "carbs_100": 60,
   "unit_grams": {
    "cracker": 3
   }
  },
  {
   "id": "sugar",
   "name": "Sugar",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 4,
   "serving": "1 tsp",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 387,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 100,
   "unit_grams": {
    "tsp": 4
   }
  },
  {
   "id": "candy",
   "name": "Candy",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1 serving",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 400,
   "protein_100": 2,
   "fat_100": 10,
   "carbs_100": 75,
   "unit_grams": {
    "serving": 40
   }
  },
  {
   "id": "ice-cream",
   "name": "Ice cream",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 30,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 207,
   "protein_100": 3.5,
   "fat_100": 11,
   "carbs_100": 24,
   "unit_grams": {
    "cup": 132
   }
  },
  {
   "id": "soda",
   "name": "Soda",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 39,
   "serving": "1 can",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 41,
   "protein_100": 0,
   "fat_100": 0,
   "carbs_100": 10.6,
   "unit_grams": {
    "can": 355
   }
  },
  {
   "id": "fruit-juice",
   "name": "Fruit juice",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 28,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 46,
   "protein_100": 0.7,
   "fat_100": 0.1,
   "carbs_100": 10.4,
   "unit_grams": {
    "cup": 248
   }
  },
  {
   "id": "beer",
   "name": "Beer",
   "category": "drink",
   "light": "red",
   "carbs_per_serving": 13,
   "serving": "12 oz",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 43,
   "protein_100": 0.5,
   "fat_100": 0,
   "carbs_100": 3.6,
   "unit_grams": {}
  },
  {
   "id": "banana",
   "name": "Banana",
   "category": "fruit",
   "light": "red",
   "carbs_per_serving": 27,
   "serving": "1 medium",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 89,
   "protein_100": 1.1,
   "fat_100": 0.3,
   "carbs_100": 20,
   "unit_grams": {
    "medium": 118
   }
  },
  {
   "id": "apple",
   "name": "Apple",
   "category": "fruit",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1 medium",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 52,
   "protein_100": 0.3,
   "fat_100": 0.2,
   "carbs_100": 11.4,
   "unit_grams": {
    "medium": 182
   }
  },
  {
   "id": "grapes",
   "name": "Grapes",
   "category": "fruit",
   "light": "red",
   "carbs_per_serving": 27,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 69,
   "protein_100": 0.7,
   "fat_100": 0.2,
   "carbs_100": 17,
   "unit_grams": {
    "cup": 151
   }
  },
  {
   "id": "milk",
   "name": "Milk",
   "category": "dairy",
   "light": "red",
   "carbs_per_serving": 12,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "Use heavy cream or almond milk",
   "unlocked": false,
   "kcal_100": 61,
   "protein_100": 3.2,
   "fat_100": 3.3,
   "carbs_100": 4.8,
   "unit_grams": {
    "cup": 244
   }
  },
  {
   "id": "ketchup",
   "name": "Ketchup",
   "category": "condiment",
   "light": "red",
   "carbs_per_serving": 5,
   "serving": "1 tbsp",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 101,
   "protein_100": 1,
   "fat_100": 0.1,
   "carbs_100": 26,
   "unit_grams": {
    "tbsp": 17
   }
  },
  {
   "id": "bbq-sauce",
   "name": "BBQ sauce",
   "category": "condiment",
   "light": "red",
   "carbs_per_serving": 9,
   "serving": "1 tbsp",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 172,
   "protein_100": 0.8,
   "fat_100": 0.6,
   "carbs_100": 40,
   "unit_grams": {
    "tbsp": 17
   }
  },
  {
   "id": "honey",
   "name": "Honey",
   "category": "sugar",
   "light": "red",
   "carbs_per_serving": 17,
   "serving": "1 tbsp",
   "store_section": "Other",
   "note": "",
   "unlocked": false,
   "kcal_100": 304,
   "protein_100": 0.3,
   "fat_100": 0,
   "carbs_100": 82,
   "unit_grams": {
    "tbsp": 21
   }
  },
  {
   "id": "flavored-yogurt",
   "name": "Flavored yogurt",
   "category": "dairy",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1 cup",
   "store_section": "Other",
   "note": "Dessert in disguise",
   "unlocked": false,
   "kcal_100": 100,
   "protein_100": 3.5,
   "fat_100": 1,
   "carbs_100": 18,
   "unit_grams": {
    "cup": 245
   }
  },
  {
   "id": "protein-bars",
   "name": "Protein bars",
   "category": "snack",
   "light": "red",
   "carbs_per_serving": 25,
   "serving": "1 bar",
   "store_section": "Other",
   "note": "Mostly candy",
   "unlocked": false,
   "kcal_100": 400,
   "protein_100": 30,
   "fat_100": 12,
   "carbs_100": 40,
   "unit_grams": {
    "bar": 60
   }
  },
  {
   "id": "breaded-chicken",
   "name": "Breaded chicken",
   "category": "poultry",
   "light": "red",
   "carbs_per_serving": 15,
   "serving": "1 serving",
   "store_section": "Other",
   "note": "Batter and breading are carbs",
   "unlocked": false,
   "kcal_100": 250,
   "protein_100": 17,
   "fat_100": 13,
   "carbs_100": 15,
   "unit_grams": {
    "serving": 120
   }
  }
 ],
 "meals": [
  {
   "id": "bacon-and-eggs",
   "name": "Bacon and eggs",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Fry 3 slices bacon. Scramble or fry 3 eggs in the bacon fat with a little butter. Salt well.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "bacon",
     "qty": 3,
     "unit": "slice"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "sausage-patties-and-eggs",
   "name": "Sausage patties and eggs",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Brown 2 Jimmy Dean patties in a dry pan, about 4 min a side. Fry 3 eggs in the sausage fat. Salt.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "jimmy-dean-sausage-patties",
     "qty": 2,
     "unit": "patty"
    }
   ]
  },
  {
   "id": "sausage-and-cheddar-omelet",
   "name": "Sausage and cheddar omelet",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Brown 2 sausage links, chop. Beat 3 eggs, pour into buttered pan, add sausage and cheddar, fold.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "breakfast-sausage",
     "qty": 2,
     "unit": "link"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "egg-muffins",
   "name": "Egg muffins",
   "meal_type": "breakfast",
   "portable": true,
   "batch": true,
   "instructions": "Batch of 12: brown 8 oz sausage. Whisk 10 eggs, stir in sausage, 4 oz cheddar, diced bell pepper. Pour into greased muffin tin, bake 350F for 20-25 min. Fridge 5 days. Serving is 3 muffins, eat cold or microwave 45 sec.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 2.5,
     "unit": "egg"
    },
    {
     "food_id": "breakfast-sausage",
     "qty": 2,
     "unit": "link"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "bell-pepper",
     "qty": 0.25,
     "unit": "pepper"
    }
   ]
  },
  {
   "id": "steak-and-eggs",
   "name": "Steak and eggs",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Sear 6 oz steak (or reheat leftover), fry 2 eggs in butter.",
   "ingredients": [
    {
     "food_id": "sirloin-steak",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "eggs",
     "qty": 2,
     "unit": "egg"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "spinach-and-cheese-scramble",
   "name": "Spinach and cheese scramble",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Wilt 2 cups spinach in butter, add 3 beaten eggs and 1 oz mozzarella, scramble.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "spinach",
     "qty": 2,
     "unit": "cup"
    },
    {
     "food_id": "mozzarella-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "hard-boiled-eggs-and-string-cheese",
   "name": "Hard-boiled eggs and string cheese",
   "meal_type": "breakfast",
   "portable": true,
   "batch": true,
   "instructions": "Grab 3 hard-boiled eggs from the batch and 2 string cheese. Salt the eggs.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "string-cheese",
     "qty": 2,
     "unit": "stick"
    }
   ]
  },
  {
   "id": "ham-and-swiss-scramble",
   "name": "Ham and Swiss scramble",
   "meal_type": "breakfast",
   "portable": false,
   "batch": false,
   "instructions": "Dice 3 oz deli ham, warm in butter, add 3 eggs and a slice of Swiss torn up, scramble.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "deli-ham",
     "qty": 3,
     "unit": "oz"
    },
    {
     "food_id": "swiss-cheese",
     "qty": 1,
     "unit": "slice"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "shrimp-garlic-and-jalapeno-soup",
   "name": "Shrimp, garlic and jalapeno soup",
   "meal_type": "lunch",
   "portable": false,
   "batch": false,
   "instructions": "Melt the butter in a pot over medium heat. Slice the jalapeno (seeds in for heat, out for mild), chop the celery and a quarter onion; cook them 3 min until the onion softens. Add the minced garlic and cook 30 sec, do not let it brown. Pour in the broth, add the slaw mix, and simmer 5 min until the cabbage softens. Add the shrimp and cook 2 to 3 min, until pink and curled. Off the heat, stir in the lemon juice. Salt and pepper to taste. Hot sauce if you want more heat.",
   "ingredients": [
    {
     "food_id": "shrimp",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic",
     "qty": 3,
     "unit": "clove"
    },
    {
     "food_id": "jalapeno",
     "qty": 1,
     "unit": "pepper"
    },
    {
     "food_id": "onion",
     "qty": 0.25,
     "unit": "onion"
    },
    {
     "food_id": "celery",
     "qty": 2,
     "unit": "stalk"
    },
    {
     "food_id": "tri-color-slaw-mix",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "bone-broth",
     "qty": 2,
     "unit": "cup"
    },
    {
     "food_id": "lemon-juice",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "salt",
     "qty": 0.5,
     "unit": "tsp"
    },
    {
     "food_id": "black-pepper",
     "qty": 0.25,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "rotisserie-chicken-salad-to-go",
   "name": "Rotisserie chicken salad to go",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "Pull 8 oz of meat off the rotisserie chicken and pack it in one container. Pack 3 cups chopped romaine, half a cucumber sliced and 2 tomato slices in another. Carry the dressing in a small jar so the greens stay crisp. At lunch, dress the greens, lay the chicken on top, salt and pepper.",
   "ingredients": [
    {
     "food_id": "rotisserie-chicken",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 3,
     "unit": "cup"
    },
    {
     "food_id": "cucumber",
     "qty": 0.5,
     "unit": "cucumber"
    },
    {
     "food_id": "tomato",
     "qty": 2,
     "unit": "slice"
    },
    {
     "food_id": "light-italian-dressing",
     "qty": 2,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "rotisserie-chicken-plate",
   "name": "Rotisserie chicken plate",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "6 oz pulled rotisserie chicken, 1 oz cheddar, pickles. Eat cold.",
   "ingredients": [
    {
     "food_id": "rotisserie-chicken",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    }
   ]
  },
  {
   "id": "tuna-salad-with-celery",
   "name": "Tuna salad with celery",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "Drain 1 can tuna, mix with 2 tbsp mayo, chopped celery, mustard, salt and pepper. Eat with pickles or on cucumber slices.",
   "ingredients": [
    {
     "food_id": "canned-tuna",
     "qty": 1,
     "unit": "can"
    },
    {
     "food_id": "mayonnaise",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "celery",
     "qty": 1,
     "unit": "stalk"
    },
    {
     "food_id": "mustard",
     "qty": 1,
     "unit": "tsp"
    },
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    }
   ]
  },
  {
   "id": "deli-roll-ups",
   "name": "Deli roll-ups",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "Lay out 4 oz deli turkey, top each slice with Swiss and a smear of mustard, roll. Pickles on the side.",
   "ingredients": [
    {
     "food_id": "deli-turkey",
     "qty": 4,
     "unit": "oz"
    },
    {
     "food_id": "swiss-cheese",
     "qty": 2,
     "unit": "slice"
    },
    {
     "food_id": "mustard",
     "qty": 1,
     "unit": "tsp"
    },
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    }
   ]
  },
  {
   "id": "taco-meat-bowl",
   "name": "Taco meat bowl",
   "meal_type": "lunch",
   "portable": true,
   "batch": true,
   "instructions": "Batch: brown 3 lb ground beef with taco seasoning. Serving: 6 oz meat over shredded lettuce with 1 oz cheddar, 2 tbsp sour cream, jalapeno, hot sauce.",
   "ingredients": [
    {
     "food_id": "ground-beef-80-20",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "taco-seasoning",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "sour-cream",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "jalapeno",
     "qty": 1,
     "unit": "pepper"
    }
   ]
  },
  {
   "id": "chicken-thighs-and-broccoli",
   "name": "Chicken thighs and broccoli",
   "meal_type": "lunch",
   "portable": true,
   "batch": true,
   "instructions": "From the Sunday sheet pan: 2 chicken thighs and a cup of roasted broccoli. Good cold or reheated.",
   "ingredients": [
    {
     "food_id": "chicken-thighs",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "broccoli",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "olive-oil",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "chef-salad",
   "name": "Chef salad",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "Romaine, 2 oz ham, 2 oz turkey, 2 hard-boiled eggs chopped, 1 oz cheddar, cucumber, ranch.",
   "ingredients": [
    {
     "food_id": "romaine-lettuce",
     "qty": 2,
     "unit": "cup"
    },
    {
     "food_id": "deli-ham",
     "qty": 2,
     "unit": "oz"
    },
    {
     "food_id": "deli-turkey",
     "qty": 2,
     "unit": "oz"
    },
    {
     "food_id": "eggs",
     "qty": 2,
     "unit": "egg"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "cucumber",
     "qty": 0.5,
     "unit": "cucumber"
    },
    {
     "food_id": "ranch-dressing",
     "qty": 2,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "egg-salad",
   "name": "Egg salad",
   "meal_type": "lunch",
   "portable": true,
   "batch": true,
   "instructions": "Chop 3 hard-boiled eggs, mix with 2 tbsp mayo, 1 tsp mustard, chopped celery, salt, pepper. Scoop with celery sticks.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 3,
     "unit": "egg"
    },
    {
     "food_id": "mayonnaise",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "mustard",
     "qty": 1,
     "unit": "tsp"
    },
    {
     "food_id": "celery",
     "qty": 2,
     "unit": "stalk"
    }
   ]
  },
  {
   "id": "salami-mozzarella-and-olives",
   "name": "Salami, mozzarella and olives",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "3 oz salami, 2 oz mozzarella, 10 olives, a few pickles. No cooking.",
   "ingredients": [
    {
     "food_id": "salami",
     "qty": 3,
     "unit": "oz"
    },
    {
     "food_id": "mozzarella-cheese",
     "qty": 2,
     "unit": "oz"
    },
    {
     "food_id": "olives",
     "qty": 10,
     "unit": "olive"
    },
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    }
   ]
  },
  {
   "id": "sardines-and-avocado",
   "name": "Sardines and avocado",
   "meal_type": "lunch",
   "portable": true,
   "batch": false,
   "instructions": "1 can sardines, half an avocado, squeeze of lemon, salt, hot sauce.",
   "ingredients": [
    {
     "food_id": "canned-sardines",
     "qty": 1,
     "unit": "can"
    },
    {
     "food_id": "avocado",
     "qty": 0.5,
     "unit": "avocado"
    },
    {
     "food_id": "lemon-juice",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "hot-sauce",
     "qty": 1,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "pulled-pork-and-cabbage",
   "name": "Pulled pork and cabbage",
   "meal_type": "lunch",
   "portable": true,
   "batch": true,
   "instructions": "From the slow cooker batch: 6 oz pulled pork with a cup of buttered cabbage.",
   "ingredients": [
    {
     "food_id": "pork-shoulder",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "cabbage",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "sirloin-with-asparagus",
   "name": "Sirloin with asparagus",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Salt the steak, sear in a hot cast iron pan 4 min a side, rest. Asparagus in the same pan with butter and garlic.",
   "ingredients": [
    {
     "food_id": "sirloin-steak",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "asparagus",
     "qty": 6,
     "unit": "spear"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic",
     "qty": 1,
     "unit": "clove"
    }
   ]
  },
  {
   "id": "lettuce-wrapped-cheeseburgers",
   "name": "Lettuce-wrapped cheeseburgers",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Two 4 oz patties, salt and pepper, cook 4 min a side, top with cheddar. Wrap in romaine leaves with tomato, pickles, mayo, mustard.",
   "ingredients": [
    {
     "food_id": "ground-beef-80-20",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 2,
     "unit": "oz"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "tomato",
     "qty": 2,
     "unit": "slice"
    },
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    },
    {
     "food_id": "mayonnaise",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "mustard",
     "qty": 1,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "pork-chops-with-green-beans",
   "name": "Pork chops with green beans",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Season chops, sear 4 min a side in butter. Green beans in the same pan with garlic and salt.",
   "ingredients": [
    {
     "food_id": "pork-chops",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "green-beans",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic",
     "qty": 1,
     "unit": "clove"
    }
   ]
  },
  {
   "id": "sheet-pan-chicken-thighs-and-broccoli",
   "name": "Sheet pan chicken thighs and broccoli",
   "meal_type": "dinner",
   "portable": false,
   "batch": true,
   "instructions": "Batch: 8 thighs skin up on a sheet pan, oil, salt, pepper, garlic powder. Broccoli around them with oil and salt. 425F for 40 min.",
   "ingredients": [
    {
     "food_id": "chicken-thighs",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "broccoli",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "olive-oil",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic-powder",
     "qty": 1,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "salmon-with-zucchini",
   "name": "Salmon with zucchini",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Salmon skin down in a buttered pan 5 min, flip 3 min. Zucchini rounds in the pan after, salt and lemon.",
   "ingredients": [
    {
     "food_id": "salmon-fillet",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "zucchini",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "lemon-juice",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "taco-salad",
   "name": "Taco salad",
   "meal_type": "dinner",
   "portable": false,
   "batch": true,
   "instructions": "6 oz batch taco meat over romaine with cheddar, sour cream, avocado, jalapeno and hot sauce.",
   "ingredients": [
    {
     "food_id": "ground-beef-80-20",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "taco-seasoning",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 2,
     "unit": "cup"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "sour-cream",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "avocado",
     "qty": 0.5,
     "unit": "avocado"
    },
    {
     "food_id": "jalapeno",
     "qty": 1,
     "unit": "pepper"
    }
   ]
  },
  {
   "id": "garlic-butter-shrimp-with-cauliflower-rice",
   "name": "Garlic butter shrimp with cauliflower rice",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Saute riced cauliflower in butter until soft. Shrimp in a second pan with butter and garlic 2 min a side. Salt, lemon.",
   "ingredients": [
    {
     "food_id": "shrimp",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "cauliflower",
     "qty": 1.5,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 3,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic",
     "qty": 2,
     "unit": "clove"
    },
    {
     "food_id": "lemon-juice",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "chicken-wings-with-celery-and-ranch",
   "name": "Chicken wings with celery and ranch",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Dry wings, salt, bake 425F for 45 min or air fry. Toss in hot sauce and butter. Celery and ranch on the side.",
   "ingredients": [
    {
     "food_id": "chicken-wings",
     "qty": 8,
     "unit": "wing"
    },
    {
     "food_id": "hot-sauce",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "celery",
     "qty": 2,
     "unit": "stalk"
    },
    {
     "food_id": "ranch-dressing",
     "qty": 2,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "slow-cooker-pulled-pork-with-cabbage",
   "name": "Slow cooker pulled pork with cabbage",
   "meal_type": "dinner",
   "portable": false,
   "batch": true,
   "instructions": "Batch: 4 lb pork shoulder, salt, pepper, garlic powder, 8 hours low. Shred. Serve with cabbage sauteed in butter.",
   "ingredients": [
    {
     "food_id": "pork-shoulder",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "cabbage",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic-powder",
     "qty": 1,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "pot-roast-with-mushrooms",
   "name": "Pot roast with mushrooms",
   "meal_type": "dinner",
   "portable": false,
   "batch": true,
   "instructions": "Batch: 3 lb chuck roast seared, into the slow cooker with mushrooms, onion, garlic, a cup of bone broth. 8 hours low.",
   "ingredients": [
    {
     "food_id": "chuck-roast",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "mushrooms",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "onion",
     "qty": 0.25,
     "unit": "onion"
    },
    {
     "food_id": "garlic",
     "qty": 1,
     "unit": "clove"
    },
    {
     "food_id": "bone-broth",
     "qty": 0.5,
     "unit": "cup"
    }
   ]
  },
  {
   "id": "sausage-and-cabbage-skillet",
   "name": "Sausage and cabbage skillet",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Brown 2 Italian sausage links sliced, add shredded cabbage and butter, cook until soft. Mustard on the side.",
   "ingredients": [
    {
     "food_id": "italian-sausage",
     "qty": 2,
     "unit": "link"
    },
    {
     "food_id": "cabbage",
     "qty": 2,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "mustard",
     "qty": 1,
     "unit": "tsp"
    }
   ]
  },
  {
   "id": "meatballs-with-mozzarella-and-zucchini",
   "name": "Meatballs with mozzarella and zucchini",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Mix 8 oz ground beef, 1 egg, 1 oz parmesan, Italian seasoning, salt. Form, bake 400F 18 min, top with mozzarella to melt. Zucchini in butter.",
   "ingredients": [
    {
     "food_id": "ground-beef-80-20",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "eggs",
     "qty": 1,
     "unit": "egg"
    },
    {
     "food_id": "parmesan-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "mozzarella-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "italian-seasoning",
     "qty": 1,
     "unit": "tsp"
    },
    {
     "food_id": "zucchini",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "chicken-caesar-salad",
   "name": "Chicken Caesar salad",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "6 oz grilled chicken breast sliced over romaine with Caesar dressing and parmesan. No croutons.",
   "ingredients": [
    {
     "food_id": "chicken-breast",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 3,
     "unit": "cup"
    },
    {
     "food_id": "caesar-dressing",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "parmesan-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "olive-oil",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "rotisserie-chicken-salad",
   "name": "Rotisserie chicken salad",
   "meal_type": "dinner",
   "portable": true,
   "batch": false,
   "instructions": "Pull 8 oz of meat off the rotisserie chicken while it is warm, breast and thigh both. Chop 3 cups romaine into a big bowl. Slice half a cucumber and add 2 tomato slices cut in wedges. Toss the greens with 2 tbsp light Italian dressing. Lay the chicken on top. Salt and pepper. Save the rest of the bird and the carcass for sandwiches or broth.",
   "ingredients": [
    {
     "food_id": "rotisserie-chicken",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "romaine-lettuce",
     "qty": 3,
     "unit": "cup"
    },
    {
     "food_id": "cucumber",
     "qty": 0.5,
     "unit": "cucumber"
    },
    {
     "food_id": "tomato",
     "qty": 2,
     "unit": "slice"
    },
    {
     "food_id": "light-italian-dressing",
     "qty": 2,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "short-ribs-with-brussels-sprouts",
   "name": "Short ribs with Brussels sprouts",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Salt short ribs, sear, roast 300F for 2.5 hours covered. Halve Brussels sprouts, roast in oil at 425F 25 min.",
   "ingredients": [
    {
     "food_id": "beef-short-ribs",
     "qty": 8,
     "unit": "oz"
    },
    {
     "food_id": "brussels-sprouts",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "avocado-oil",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "cheesy-cauliflower-beef-bake",
   "name": "Cheesy cauliflower beef bake",
   "meal_type": "dinner",
   "portable": false,
   "batch": true,
   "instructions": "Brown 1.5 lb ground beef with onion. Mix with 4 cups steamed cauliflower, 4 oz cream cheese, 6 oz cheddar. Bake 375F 25 min. Serves 4.",
   "ingredients": [
    {
     "food_id": "ground-beef-80-20",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "cauliflower",
     "qty": 1,
     "unit": "cup"
    },
    {
     "food_id": "cream-cheese",
     "qty": 1,
     "unit": "oz"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1.5,
     "unit": "oz"
    },
    {
     "food_id": "onion",
     "qty": 0.25,
     "unit": "onion"
    }
   ]
  },
  {
   "id": "pan-fried-cod-with-spinach",
   "name": "Pan-fried cod with spinach",
   "meal_type": "dinner",
   "portable": false,
   "batch": false,
   "instructions": "Salt cod, fry in butter 4 min a side. Spinach wilted in the pan with garlic. Lemon over everything.",
   "ingredients": [
    {
     "food_id": "cod-or-tilapia",
     "qty": 6,
     "unit": "oz"
    },
    {
     "food_id": "spinach",
     "qty": 3,
     "unit": "cup"
    },
    {
     "food_id": "butter",
     "qty": 2,
     "unit": "tbsp"
    },
    {
     "food_id": "garlic",
     "qty": 1,
     "unit": "clove"
    },
    {
     "food_id": "lemon-juice",
     "qty": 1,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "two-hard-boiled-eggs",
   "name": "Two hard-boiled eggs",
   "meal_type": "snack",
   "portable": true,
   "batch": true,
   "instructions": "Salt and hot sauce.",
   "ingredients": [
    {
     "food_id": "eggs",
     "qty": 2,
     "unit": "egg"
    }
   ]
  },
  {
   "id": "two-string-cheese",
   "name": "Two string cheese",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "",
   "ingredients": [
    {
     "food_id": "string-cheese",
     "qty": 2,
     "unit": "stick"
    }
   ]
  },
  {
   "id": "pepperoni-slices",
   "name": "Pepperoni slices",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "1 oz, about 14 slices.",
   "ingredients": [
    {
     "food_id": "pepperoni",
     "qty": 1,
     "unit": "oz"
    }
   ]
  },
  {
   "id": "pork-rinds",
   "name": "Pork rinds",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "1 oz bag.",
   "ingredients": [
    {
     "food_id": "pork-rinds",
     "qty": 1,
     "unit": "oz"
    }
   ]
  },
  {
   "id": "beef-jerky",
   "name": "Beef jerky",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "1 oz, sugar-free.",
   "ingredients": [
    {
     "food_id": "beef-jerky-sugar-free",
     "qty": 1,
     "unit": "oz"
    }
   ]
  },
  {
   "id": "landjaeger-sticks",
   "name": "Landjaeger sticks",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "Three Lil' Landjaeger sticks, hot and spicy. Straight from the bag, keeps in the truck.",
   "ingredients": [
    {
     "food_id": "landjaeger-sticks",
     "qty": 3,
     "unit": "stick"
    }
   ]
  },
  {
   "id": "turkey-and-cheese-roll-up",
   "name": "Turkey and cheese roll-up",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "2 oz turkey around a stick of string cheese.",
   "ingredients": [
    {
     "food_id": "deli-turkey",
     "qty": 2,
     "unit": "oz"
    },
    {
     "food_id": "string-cheese",
     "qty": 1,
     "unit": "stick"
    }
   ]
  },
  {
   "id": "celery-with-cream-cheese",
   "name": "Celery with cream cheese",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "",
   "ingredients": [
    {
     "food_id": "celery",
     "qty": 2,
     "unit": "stalk"
    },
    {
     "food_id": "cream-cheese",
     "qty": 2,
     "unit": "oz"
    }
   ]
  },
  {
   "id": "pickles-and-cheddar-cubes",
   "name": "Pickles and cheddar cubes",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "",
   "ingredients": [
    {
     "food_id": "pickles",
     "qty": 2,
     "unit": "spear"
    },
    {
     "food_id": "cheddar-cheese",
     "qty": 1.5,
     "unit": "oz"
    }
   ]
  },
  {
   "id": "salami-and-olives",
   "name": "Salami and olives",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "",
   "ingredients": [
    {
     "food_id": "salami",
     "qty": 1.5,
     "unit": "oz"
    },
    {
     "food_id": "olives",
     "qty": 10,
     "unit": "olive"
    }
   ]
  },
  {
   "id": "cucumber-with-ranch",
   "name": "Cucumber with ranch",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "",
   "ingredients": [
    {
     "food_id": "cucumber",
     "qty": 0.5,
     "unit": "cucumber"
    },
    {
     "food_id": "ranch-dressing",
     "qty": 2,
     "unit": "tbsp"
    }
   ]
  },
  {
   "id": "cup-of-bone-broth",
   "name": "Cup of bone broth",
   "meal_type": "snack",
   "portable": true,
   "batch": false,
   "instructions": "Hot, salted. Good on low-energy days.",
   "ingredients": [
    {
     "food_id": "bone-broth",
     "qty": 1,
     "unit": "cup"
    }
   ]
  }
 ]
};
