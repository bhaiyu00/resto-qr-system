import { MenuItem, RestaurantTable } from '../types/index.ts';

// Imported generated authentic high-res food images
import choleBhatureImg from '../assets/images/chole_bhature_1793770178266.jpg';
import pavBhajiImg from '../assets/images/pav_bhaji_1793770179282.jpg';
import masalaDosaImg from '../assets/images/masala_dosa_1793770179770.jpg';
import paneerTikkaImg from '../assets/images/paneer_tikka_1793770180364.jpg';
import vegHakkaNoodlesImg from '../assets/images/veg_hakka_noodles_1793770180734.jpg';
import mangoLassiImg from '../assets/images/mango_lassi_1793770181338.jpg';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Chole Bhature',
    category: 'Breakfast',
    price: 120,
    description: 'Fluffy golden bhature served with rich slow-cooked spiced chickpea curry, pickled onions, and mint chutney.',
    image: choleBhatureImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    badge: "Chef's Special",
    calories: '480 kcal',
    spiciness: 2,
    portionSize: '2 Bhature + Bowl Chole',
  },
  {
    id: 'item-2',
    name: 'Pav Bhaji',
    category: 'Snacks',
    price: 110,
    description: 'Iconic Mumbai style spiced mashed vegetables topped with melting Amul butter, served with two toasted soft pavs.',
    image: pavBhajiImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    badge: 'Popular',
    calories: '420 kcal',
    spiciness: 2,
    portionSize: '2 Pavs + 200ml Bhaji',
  },
  {
    id: 'item-3',
    name: 'Masala Dosa',
    category: 'South Indian',
    price: 100,
    description: 'Crisp golden crepe made from fermented rice-lentil batter, filled with spiced mashed potatoes, fresh chutneys & piping hot sambar.',
    image: masalaDosaImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 14,
    badge: 'Bestseller',
    calories: '350 kcal',
    spiciness: 1,
    portionSize: '1 Large Dosa + 3 Dips',
  },
  {
    id: 'item-4',
    name: 'Paneer Tikka',
    category: 'Main Course',
    price: 180,
    description: 'Fresh malai paneer cubes marinated in spiced hung curd, char-grilled in tandoor with crunchy bell peppers and red onions.',
    image: paneerTikkaImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 18,
    badge: 'Tandoor Special',
    calories: '390 kcal',
    spiciness: 2,
    portionSize: '6 Skewered Pieces',
  },
  {
    id: 'item-5',
    name: 'Veg Hakka Noodles',
    category: 'Main Course',
    price: 140,
    description: 'Wok-tossed noodles with shredded cabbage, crunchy carrots, bell peppers, spring garlic, and toasted sesame aromatics.',
    image: vegHakkaNoodlesImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    calories: '380 kcal',
    spiciness: 1,
    portionSize: 'Serves 1-2',
  },
  {
    id: 'item-6',
    name: 'Mango Lassi',
    category: 'Beverages',
    price: 70,
    description: 'Creamy yogurt smoothie blended with ripe Alphonso mangoes, topped with slivered pistachios and fragrant saffron strands.',
    image: mangoLassiImg,
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    badge: 'Refreshing',
    calories: '220 kcal',
    spiciness: 0,
    portionSize: '300 ml Kulhad',
  },
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', tableNumber: 'Table 01', qrSlug: 'table-01', capacity: 2, isActive: true, location: 'Window Side' },
  { id: 'tbl-2', tableNumber: 'Table 02', qrSlug: 'table-02', capacity: 2, isActive: true, location: 'Garden Patio' },
  { id: 'tbl-3', tableNumber: 'Table 03', qrSlug: 'table-03', capacity: 4, isActive: true, location: 'Main Dining' },
  { id: 'tbl-4', tableNumber: 'Table 04', qrSlug: 'table-04', capacity: 4, isActive: true, location: 'Cozy Booth' },
  { id: 'tbl-5', tableNumber: 'Table 05', qrSlug: 'table-05', capacity: 6, isActive: true, location: 'Family Lounge' },
  { id: 'tbl-6', tableNumber: 'Table 06', qrSlug: 'table-06', capacity: 4, isActive: true, location: 'Terrace View' },
  { id: 'tbl-7', tableNumber: 'Table 07', qrSlug: 'table-07', capacity: 2, isActive: true, location: 'Coffee Nook' },
  { id: 'tbl-8', tableNumber: 'Table 08', qrSlug: 'table-08', capacity: 8, isActive: true, location: 'Private Corner' },
];

export const CATEGORIES = [
  'All Items',
  'Breakfast',
  'Main Course',
  'Snacks',
  'South Indian',
  'Beverages',
] as const;
