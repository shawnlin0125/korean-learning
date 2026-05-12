import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedData = [
  { word: '사랑', romanization: 'sarang', meaningZhTw: '愛', partOfSpeech: 'noun', level: 'beginner', category: 'emotion' },
  { word: '행복', romanization: 'haengbok', meaningZhTw: '幸福', partOfSpeech: 'noun', level: 'beginner', category: 'emotion' },
  { word: '슬프다', romanization: 'seulpeuda', meaningZhTw: '悲傷', partOfSpeech: 'adjective', level: 'beginner', category: 'emotion' },
  { word: '좋다', romanization: 'jota', meaningZhTw: '好、喜歡', partOfSpeech: 'adjective', level: 'beginner', category: 'emotion' },
  { word: '싫다', romanization: 'silta', meaningZhTw: '討厭', partOfSpeech: 'adjective', level: 'beginner', category: 'emotion' },
  { word: '학교', romanization: 'hakgyo', meaningZhTw: '學校', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '집', romanization: 'jip', meaningZhTw: '家', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '병원', romanization: 'byeongwon', meaningZhTw: '醫院', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '회사', romanization: 'hoesa', meaningZhTw: '公司', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '식당', romanization: 'sikdang', meaningZhTw: '餐廳', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '먹다', romanization: 'meokda', meaningZhTw: '吃', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '마시다', romanization: 'masida', meaningZhTw: '喝', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '가다', romanization: 'gada', meaningZhTw: '去', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '오다', romanization: 'oda', meaningZhTw: '來', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '보다', romanization: 'boda', meaningZhTw: '看', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '듣다', romanization: 'deutda', meaningZhTw: '聽', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '말하다', romanization: 'malhada', meaningZhTw: '說', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '읽다', romanization: 'ikda', meaningZhTw: '讀', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '쓰다', romanization: 'sseuda', meaningZhTw: '寫', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '배우다', romanization: 'baeuda', meaningZhTw: '學習', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '사람', romanization: 'saram', meaningZhTw: '人', partOfSpeech: 'noun', level: 'beginner', category: 'people' },
  { word: '친구', romanization: 'chingu', meaningZhTw: '朋友', partOfSpeech: 'noun', level: 'beginner', category: 'people' },
  { word: '가족', romanization: 'gajok', meaningZhTw: '家庭', partOfSpeech: 'noun', level: 'beginner', category: 'people' },
  { word: '엄마', romanization: 'eomma', meaningZhTw: '媽媽', partOfSpeech: 'noun', level: 'beginner', category: 'people' },
  { word: '아빠', romanization: 'appa', meaningZhTw: '爸爸', partOfSpeech: 'noun', level: 'beginner', category: 'people' },
  { word: '물', romanization: 'mul', meaningZhTw: '水', partOfSpeech: 'noun', level: 'beginner', category: 'food' },
  { word: '밥', romanization: 'bap', meaningZhTw: '飯', partOfSpeech: 'noun', level: 'beginner', category: 'food' },
  { word: '김치', romanization: 'gimchi', meaningZhTw: '泡菜', partOfSpeech: 'noun', level: 'beginner', category: 'food' },
  { word: '커피', romanization: 'keopi', meaningZhTw: '咖啡', partOfSpeech: 'noun', level: 'beginner', category: 'food' },
  { word: '우유', romanization: 'uyu', meaningZhTw: '牛奶', partOfSpeech: 'noun', level: 'beginner', category: 'food' },
  { word: '크다', romanization: 'keuda', meaningZhTw: '大', partOfSpeech: 'adjective', level: 'beginner', category: 'descriptive' },
  { word: '작다', romanization: 'jakda', meaningZhTw: '小', partOfSpeech: 'adjective', level: 'beginner', category: 'descriptive' },
  { word: '예쁘다', romanization: 'yeppeuda', meaningZhTw: '漂亮', partOfSpeech: 'adjective', level: 'beginner', category: 'descriptive' },
  { word: '맛있다', romanization: 'masitda', meaningZhTw: '好吃', partOfSpeech: 'adjective', level: 'beginner', category: 'descriptive' },
  { word: '재미있다', romanization: 'jaemiitda', meaningZhTw: '有趣', partOfSpeech: 'adjective', level: 'beginner', category: 'descriptive' },
  { word: '하나', romanization: 'hana', meaningZhTw: '一', partOfSpeech: 'number', level: 'beginner', category: 'number' },
  { word: '둘', romanization: 'dul', meaningZhTw: '二', partOfSpeech: 'number', level: 'beginner', category: 'number' },
  { word: '셋', romanization: 'set', meaningZhTw: '三', partOfSpeech: 'number', level: 'beginner', category: 'number' },
  { word: '오늘', romanization: 'oneul', meaningZhTw: '今天', partOfSpeech: 'noun', level: 'beginner', category: 'time' },
  { word: '내일', romanization: 'naeil', meaningZhTw: '明天', partOfSpeech: 'noun', level: 'beginner', category: 'time' },
  { word: '어제', romanization: 'eoje', meaningZhTw: '昨天', partOfSpeech: 'noun', level: 'beginner', category: 'time' },
  { word: '지금', romanization: 'jigeum', meaningZhTw: '現在', partOfSpeech: 'adverb', level: 'beginner', category: 'time' },
  { word: '감사합니다', romanization: 'gamsahamnida', meaningZhTw: '謝謝', partOfSpeech: 'expression', level: 'beginner', category: 'expression' },
  { word: '안녕하세요', romanization: 'annyeonghaseyo', meaningZhTw: '你好', partOfSpeech: 'expression', level: 'beginner', category: 'expression' },
  { word: '죄송합니다', romanization: 'joesonghamnida', meaningZhTw: '對不起', partOfSpeech: 'expression', level: 'beginner', category: 'expression' },
  { word: '괜찮아요', romanization: 'gwaenchanayo', meaningZhTw: '沒關係', partOfSpeech: 'expression', level: 'beginner', category: 'expression' },
  { word: '사진', romanization: 'sajin', meaningZhTw: '照片', partOfSpeech: 'noun', level: 'intermediate', category: 'object' },
  { word: '책', romanization: 'chaek', meaningZhTw: '書', partOfSpeech: 'noun', level: 'beginner', category: 'object' },
  { word: '핸드폰', romanization: 'haendeupon', meaningZhTw: '手機', partOfSpeech: 'noun', level: 'beginner', category: 'object' },
  { word: '컴퓨터', romanization: 'keompyuteo', meaningZhTw: '電腦', partOfSpeech: 'noun', level: 'beginner', category: 'object' },
];

async function seed() {
  console.log('Seeding vocabulary...');
  for (const item of seedData) {
    await prisma.vocabulary.upsert({
      where: { id: item.word },
      update: {},
      create: { id: item.word, ...item },
    });
  }
  console.log(`Seeded ${seedData.length} words`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
