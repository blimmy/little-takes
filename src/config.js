export const CAPTURE_LIMIT = 8;
export const LAYOUTS = [
  {id:'strip2',name:'Just us two',detail:'2 ช่อง',category:'strips',count:2,cols:1,width:600,height:1020},
  {id:'strip3',name:'Classic trio',detail:'3 ช่อง',category:'strips',count:3,cols:1,width:600,height:1536},
  {id:'strip4',name:'Four little takes',detail:'4 ช่อง',category:'strips',count:4,cols:1,width:600,height:1908},
  {id:'strip5',name:'One more smile',detail:'5 ช่อง',category:'strips',count:5,cols:1,width:600,height:2220},
  {id:'strip6',name:'Long story',detail:'6 ช่อง',category:'strips',count:6,cols:1,width:600,height:2480},
  {id:'mini4',name:'Pocket memories',detail:'4 ช่องจัตุรัส',category:'strips',count:4,cols:1,width:600,height:2330,radius:.1,photoAspect:1},
  {id:'polaroid',name:'A little keepsake',detail:'1 ช่อง',category:'cards',count:1,cols:1,width:900,height:1100},
  {id:'square',name:'Dear diary',detail:'1 ช่องจัตุรัส',category:'cards',count:1,cols:1,width:1000,height:1000,radius:.04,photoAspect:1},
  {id:'duo',name:'Better together',detail:'2 ช่องคู่กัน',category:'cards',count:2,cols:2,width:1200,height:900},
  {id:'postcard3',name:'A postcard to you',detail:'3 ช่องต่างขนาด',category:'cards',count:3,cols:2,width:1400,height:1100,slots:[[0,0,.57,1],[.61,0,.39,.48],[.61,.52,.39,.48]]},
  {id:'cover5',name:'Cover story',detail:'5 ช่องต่างขนาด',category:'cards',count:5,cols:2,width:1200,height:1600,slots:[[0,0,1,.46],[0,.5,.48,.23],[.52,.5,.48,.23],[0,.77,.48,.23],[.52,.77,.48,.23]]},
  {id:'grid',name:'The best four',detail:'4 ช่อง · 2 × 2',category:'grids',count:4,cols:2,width:1200,height:1200},
  {id:'grid6',name:'Six happy things',detail:'6 ช่อง · 2 × 3',category:'grids',count:6,cols:2,width:1200,height:1660},
  {id:'grid8',name:'All of us',detail:'8 ช่อง · 2 × 4',category:'grids',count:8,cols:2,width:1200,height:2000},
  {id:'contact6',name:'Weekend contact',detail:'6 ช่อง · 3 × 2',category:'grids',count:6,cols:3,width:1600,height:1200,design:'contact'},
  {id:'contact8',name:'Memory archive',detail:'8 ช่อง · 4 × 2',category:'grids',count:8,cols:4,width:1800,height:1200,design:'contact'},
  {id:'gallery7',name:'Seven sweet days',detail:'7 ช่องต่างขนาด',category:'grids',count:7,cols:3,width:1400,height:1600,slots:[[0,0,1,.42],[0,.46,.307,.25],[.347,.46,.306,.25],[.693,.46,.307,.25],[0,.75,.307,.25],[.347,.75,.306,.25],[.693,.75,.307,.25]]},
  {id:'round4',name:'In our little orbit',detail:'4 ช่องวงกลม',category:'special',count:4,cols:2,width:1200,height:1400,shape:'circle'},
  {id:'heart2',name:'Two hearts',detail:'2 ช่องหัวใจ',category:'special',count:2,cols:1,width:900,height:1900,shape:'heart'},
  {id:'film4',name:'On a roll',detail:'4 ช่องฟิล์ม',category:'special',count:4,cols:1,width:700,height:2000,design:'film'},
];
export const LAYOUT_CATEGORIES = [['all','ทั้งหมด'],['strips','Photo strips'],['cards','Postcards'],['grids','Contact sheets'],['special','Special shapes']];

export const FRAMES = [
  {id:'paper',name:'Milk paper',thai:'กระดาษครีม',bg:'#fffef8',ink:'#6d8291',accent:'#c8d9df',light:'#ffffff',sticker:'bow',secondary:'butterfly',pattern:'dots'},
  {id:'blue',name:'Baby blue',thai:'ฟ้าใส',bg:'#edf6fc',ink:'#66869e',accent:'#b4d2e5',light:'#ffffff',sticker:'cloud',secondary:'star',pattern:'cloud'},
  {id:'rose',name:'Rose milk',thai:'ชมพูนม',bg:'#fff0f3',ink:'#a76f83',accent:'#e7bdcd',light:'#ffffff',sticker:'heart',secondary:'bow',pattern:'gingham'},
  {id:'peach',name:'Peach cream',thai:'พีชครีม',bg:'#fff1e5',ink:'#a9826c',accent:'#e9c8af',light:'#ffffff',sticker:'peach',secondary:'heart',pattern:'petals'},
  {id:'mint',name:'Mint garden',thai:'สวนมิ้นต์',bg:'#edf8f0',ink:'#6e9580',accent:'#b6d8c2',light:'#ffffff',sticker:'frog',secondary:'sprout',pattern:'grass'},
  {id:'butter',name:'Butter sunshine',thai:'เหลืองเนย',bg:'#fff9df',ink:'#a18d54',accent:'#e2d49c',light:'#ffffff',sticker:'sunflower',secondary:'bee',pattern:'dots'},
  {id:'berry',name:'Strawberry soda',thai:'สตรอว์เบอร์รีโซดา',bg:'#ffeee9',ink:'#ad7972',accent:'#e6b9b2',light:'#ffffff',sticker:'berry',secondary:'cherry',pattern:'gingham'},
  {id:'sky',name:'Daydream sky',thai:'ท้องฟ้าในฝัน',bg:'#eef3ff',ink:'#7289a8',accent:'#bfcfe6',light:'#ffffff',sticker:'moon',secondary:'star',pattern:'stars'},
  {id:'sage',name:'Sage picnic',thai:'ปิกนิกสีเสจ',bg:'#f3f6e8',ink:'#87946e',accent:'#cfdbb5',light:'#ffffff',sticker:'mushroom',secondary:'flower',pattern:'grass'},
  {id:'oat',name:'Oat latte',thai:'โอ๊ตลาเต้',bg:'#faf2e8',ink:'#968270',accent:'#dfd0bb',light:'#ffffff',sticker:'bear',secondary:'bow',pattern:'dots'},
  {id:'candy',name:'Candy floss',thai:'สายไหม',bg:'#faeef4',ink:'#a68197',accent:'#e2bfd3',light:'#ffffff',sticker:'bunny',secondary:'heart',pattern:'petals'},
  {id:'sea',name:'Sea glass',thai:'แก้วสีทะเล',bg:'#eaf7f5',ink:'#6d9695',accent:'#b5d9d5',light:'#ffffff',sticker:'butterfly',secondary:'cloud',pattern:'cloud'},
];

export const FILTERS = [
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'peach', name: 'Peachy', css: 'sepia(.15) saturate(.88) brightness(1.08)' },
  { id: 'dream', name: 'Daydream', css: 'saturate(.65) contrast(.86) brightness(1.12)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(.5) saturate(.75) contrast(.9)' },
  { id: 'mono', name: 'B & W', css: 'grayscale(1) contrast(1.1)' },
  { id: 'pixel', name: '8-bit', css: 'saturate(1.2)' },
  { id: 'ascii', name: 'ASCII', css: 'none' },
];

export { STICKERS, STICKER_CATEGORIES } from './stickers.js?v=retro-3';

export const COLORS = ['#6a8293','#b97e91','#94b49b','#b5a26b','#dca88f','#ffffff','#454957'];
