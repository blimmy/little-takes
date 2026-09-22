import { spriteSVG, svgData } from './ascii.js?v=retro-3';
import { fontsReady } from './typography.js?v=retro-3';

const BASE = [
  ['flower','ดอกไม้','nature'],['berry','สตรอว์เบอร์รี','treats'],['frog','น้องกบ','friends'],['heart','หัวใจ','things'],
  ['star','ดาว','nature'],['mushroom','เห็ด','nature'],['cloud','ก้อนเมฆ','nature'],['moon','พระจันทร์','nature'],
  ['sunflower','ทานตะวัน','nature'],['bee','ผึ้ง','friends'],['peach','ลูกพีช','treats'],['bow','โบว์','things'],
  ['cat','แมว','friends'],['cherry','เชอร์รี','treats'],['sprout','ต้นกล้า','nature'],['camera','กล้อง','things'],
  ['bunny','กระต่าย','friends'],['duck','เป็ด','friends'],['bear','หมี','friends'],['pig','หมู','friends'],
  ['dog','หมา','friends'],['chicken','ไก่','friends'],['butterfly','ผีเสื้อ','nature'],['ghost','ผีน้อย','friends'],
  ['rose','กุหลาบ','nature'],['bouquet','ช่อดอกไม้','nature'],
];
const EXTRA = [
  ['coffee','กาแฟ','treats',['  (  )  (  ','   )  (    ',' .--------.',' |  LOVE  |)',' |        |','  `------\' ','  =========']],
  ['cake','เค้ก','treats',['    i i i    ','   .------.  ','  (~~~~~~~~) ','  | : : : :| ','  |--------| ',' (__________)']],
  ['cupcake','คัพเค้ก','treats',['     .-.     ','   .(   ).   ',' .(   o   ). ','(___________)',' \\ | | | | / ','  \\|_|_|_|/  ']],
  ['icecream','ไอศกรีม','treats',['    .--.    ','  .(    ).  ',' (  .  .  ) ','  \\------/  ','   \\ / /   ','    \\ /    ','     V     ']],
  ['candy','ลูกอม','treats',[' /\\  .----.  /\\ ','<  >| SWEET |<  >',' \\/  `----\'  \\/ ']],
  ['cookie','คุกกี้','treats',['   .----.   ',' .\' o  o `. ','/  .  o    \\','| o    . o |','\\   o   . /',' `-------\' ']],
  ['balloon','ลูกโป่ง','things',['   .----.   ',' /        \\ ','|  LOVE U  |',' \\        / ','  `--v---\'  ','     |      ','    /       ','    `-.     ']],
  ['planet','ดาวเสาร์','nature',['      .---.     ','  _.=(  *  )=._ ',' /  .(     ).  \\',' `=---`---\'---=\'']],
  ['envelope','จดหมาย','things',[' .------------. ',' |\\    <3    /| ',' |  \\      /  | ',' |    \\  /    | ',' |_____/\\_____| ']],
  ['music','โน้ตเพลง','things',['     ______  ','    |_____ | ','    |      | ','    |      | ','  (o)    (o) ']],
  ['headphones','หูฟัง','things',['    .----.    ','  /        \\  ',' |          | ','[||]      [||]','[||]      [||]']],
  ['book','หนังสือ','things',[' .-----.-----. ',' | . . | . . | ',' | . . | . . | ',' | . . | . . | ',' |_____|_____| ']],
  ['computer','คอมพิวเตอร์','things',[' .-----------. ',' |  HELLO :) | ',' |           | ',' |___________| ','      | |      ','    __|_|__    ']],
  ['cursor','เคอร์เซอร์','things',[' |\\         ',' | \\        ',' |  \\       ',' |   \\      ',' |____\\     ','    \\ \\    ','     \\_\\   ']],
  ['floppy','แผ่นบันทึก','things',[' .---------. ',' | [_SAVE] | ',' |         | ',' | .-----. | ',' | | <3  | | ',' |_|_____|_| ']],
  ['film','ฟิล์ม','things',[' .------------. ',' |: [ TAKE ] :| ',' |: [  01  ] :| ',' |: [  02  ] :| ',' `------------\' ']],
  ['gift','ของขวัญ','things',['    __  __    ','   (  \\/  )   ',' .----||----. ',' |____||____| ',' |    ||    | ',' |____||____| ']],
  ['clover','โคลเวอร์','nature',['   .-. .-.   ','  (   Y   )  ','   >--+--<   ','  (   |   )  ','   `-\' `-\'   ','      |      ','       \\     ']],
  ['shell','เปลือกหอย','nature',['    .-.-.-.    ','  .( / | \\ ).  ',' (  /  |  \\  ) ','  \\   |   /   ','   \\  |  /    ','    `-----\'    ']],
  ['crown','มงกุฎ','things',['  o   o   o  ','  |\\ / \\ /|  ','  | V   V |  ','  |=======|  ']],
  ['umbrella','ร่ม','things',['    .----.    ',' .-\' / | `-. ','(____|_|____)','     |       ','     |       ','  (__|       ']],
  ['smile','หน้ายิ้ม','friends',['   .------.   ',' /          \\ ','|   o    o   |','|    \\__/    |',' \\          / ','   `------\'   ']],
];
const WORDS = ['Love you','Besties','XOXO','Hello, lovely','Lucky us','Forever','With love','Smile!','Sweet memory','Made of love','For you','Little joys','Happily ever after','Good day','Just us','Little magic'];
export const STICKER_CATEGORIES = [['all','ทั้งหมด'],['friends','เพื่อนตัวจิ๋ว'],['nature','ดอกไม้ & สวน'],['treats','ของหวาน'],['things','ของน่ารัก'],['words','ข้อความ']];
export const STICKERS = [
  ...BASE.map(([id,name,category])=>({id,name,category,kind:'sprite'})),
  ...EXTRA.map(([id,name,category,lines])=>({id,name,category,kind:'ascii',lines})),
  ...WORDS.map((label,i)=>({id:`word-${i+1}`,name:label,label,category:'words',kind:'word'})),
].map(s=>({...s,src:`./assets/stickers/${s.id}.png`}));

// Original code-native artwork, rendered once to transparent PNG assets.
export async function stickerAsset(id) {
  await fontsReady;
  const s=STICKERS.find(s=>s.id===id),c=document.createElement('canvas');c.width=384;c.height=384;
  const ctx=c.getContext('2d'),colors=['#b47987','#7c9b87','#7595ad','#b59e66','#ad8b74'],ink=colors[STICKERS.indexOf(s)%colors.length];
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(s.kind==='word') {
    ctx.font='52px "Great Vibes", "Fahkwang", cursive';ctx.fillStyle=ink;
    ctx.shadowColor='#ffffff';ctx.shadowBlur=0;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;
    ctx.fillText(s.label,192,190,335);
    ctx.shadowColor='transparent';ctx.font='21px "Courier New",monospace';ctx.fillText('.  *  .  +  .  *  .',192,244);
    ctx.fillText('+',80,127);ctx.fillText('*',315,151);
  }else if(s.kind==='ascii') {
    const cols=Math.max(...s.lines.map(l=>l.length)),size=Math.min(330/(cols*.6),310/(s.lines.length*1.1));
    ctx.font=`bold ${size}px "Courier New",monospace`;ctx.fillStyle=ink;ctx.textAlign='left';
    const x=(384-cols*size*.6)/2,y=(384-s.lines.length*size*1.1)/2;
    s.lines.forEach((line,i)=>ctx.fillText(line,x,y+size*.55+i*size*1.1));
  }else {
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=svgData(spriteSVG(id,350));});
    ctx.drawImage(img,17,17,350,350);
  }
  return c.toDataURL('image/png');
}
