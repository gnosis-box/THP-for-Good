import { insertMentor } from '../lib/db';
import Database from 'better-sqlite3';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'thp.db');
const db = new Database(dbPath);

const MENTORS = [
  {
    circles_address: '0x3d0987dba0b79526f621eafca648e4d8cb3a4c6c',
    name: 'Zet',
    bio: "CTO @The Hacking Project. Contributor @Intuition protocol and @Intuition.box\nI don't believe in miracles -- only in decentralization.",
    skills: ['Web3', 'Relative Trust', 'Transitie Trust', 'DeGov', 'Delegation', 'Circles'],
    calendar_link: 'https://calendar.app.google/ZzmogbPxm9MbXt2WA',
    price_crc: 50,
  },
];

for (const mentor of MENTORS) {
  const id = insertMentor(mentor);
  console.log(`Seeded mentor: ${mentor.name} (id=${id})`);
}
