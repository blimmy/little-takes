export const LAYOUTS = [
  { id: 'strip3', name: 'Classic strip', detail: '3 ช่อง', count: 3, cols: 1, width: 600, height: 1536 },
  { id: 'strip4', name: 'More memories', detail: '4 ช่อง', count: 4, cols: 1, width: 600, height: 1908 },
  { id: 'grid', name: 'Together', detail: '2 × 2', count: 4, cols: 2, width: 1200, height: 1200 },
  { id: 'polaroid', name: 'One sweet day', detail: '1 ช่อง', count: 1, cols: 1, width: 900, height: 1100 },
];

export const FRAMES = [
  { id: 'meadow', name: 'Little meadow', thai: 'สวนเล็ก ๆ', bg: '#e5edcc', ink: '#4a6550', accent: '#a2b87d', light: '#f7f7de', sticker: 'flower', secondary: 'frog', pattern: 'grass' },
  { id: 'berry', name: 'Berry picnic', thai: 'ปิกนิกสตรอว์เบอร์รี', bg: '#f6d9dc', ink: '#a35769', accent: '#de929e', light: '#fff0e8', sticker: 'berry', secondary: 'heart', pattern: 'gingham' },
  { id: 'cloud', name: 'Cloud nine', thai: 'บนก้อนเมฆ', bg: '#dcecf1', ink: '#587a92', accent: '#a3c6d9', light: '#f6f7eb', sticker: 'cloud', secondary: 'star', pattern: 'cloud' },
  { id: 'moon', name: 'Moon magic', thai: 'คืนดาวพราว', bg: '#e5dcf1', ink: '#77648d', accent: '#b5a0d0', light: '#fff2d7', sticker: 'moon', secondary: 'star', pattern: 'stars' },
  { id: 'sunny', name: 'Sunny side', thai: 'วันแดดอุ่น', bg: '#f7ecc7', ink: '#92744d', accent: '#d7b66c', light: '#fff9df', sticker: 'sunflower', secondary: 'bee', pattern: 'dots' },
  { id: 'peach', name: 'Peach please', thai: 'พีชใจฟู', bg: '#f6dfcf', ink: '#ab795e', accent: '#e3b18b', light: '#fff2db', sticker: 'peach', secondary: 'heart', pattern: 'gingham' },
  { id: 'sakura', name: 'Sakura dreams', thai: 'ใต้ต้นซากุระ', bg: '#f4deed', ink: '#a27593', accent: '#d9adcb', light: '#fff0f5', sticker: 'flower', secondary: 'bow', pattern: 'petals' },
  { id: 'mint', name: 'Mint to be', thai: 'เพื่อนรักสีมิ้นต์', bg: '#d7ebe1', ink: '#5d8a78', accent: '#97c5ae', light: '#eff9e8', sticker: 'frog', secondary: 'mushroom', pattern: 'grass' },
];

export const FILTERS = [
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'peach', name: 'Peachy', css: 'sepia(.15) saturate(.88) brightness(1.08)' },
  { id: 'dream', name: 'Daydream', css: 'saturate(.65) contrast(.86) brightness(1.12)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(.5) saturate(.75) contrast(.9)' },
  { id: 'mono', name: 'B & W', css: 'grayscale(1) contrast(1.1)' },
  { id: 'pixel', name: '8-bit', css: 'saturate(1.2)' },
];

export const STICKERS = [
  ['flower', 'ดอกไม้'], ['berry', 'สตรอว์เบอร์รี'], ['frog', 'น้องกบ'], ['heart', 'หัวใจ'],
  ['star', 'ดาว'], ['mushroom', 'เห็ด'], ['cloud', 'ก้อนเมฆ'], ['moon', 'พระจันทร์'],
  ['sunflower', 'ทานตะวัน'], ['bee', 'ผึ้ง'], ['peach', 'ลูกพีช'], ['bow', 'โบว์'],
  ['cat', 'แมว'], ['cherry', 'เชอร์รี'], ['sprout', 'ต้นกล้า'], ['camera', 'กล้อง'],
  ['bunny', 'กระต่าย'], ['duck', 'เป็ด'], ['bear', 'หมี'], ['pig', 'หมู'],
  ['dog', 'หมา'], ['chicken', 'ไก่'], ['butterfly', 'ผีเสื้อ'], ['ghost', 'ผีน้อย'],
];

export const COLORS = ['#4a6550', '#d47c93', '#a389bb', '#77a8c6', '#e6b554', '#fff9ed', '#473e46'];
