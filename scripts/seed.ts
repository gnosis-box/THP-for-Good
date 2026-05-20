import { getAllTags, insertMentor } from '../lib/db';
import Database from 'better-sqlite3';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'thp.db');
const db = new Database(dbPath);

const TAGS = ['AI', 'Dev', 'Legal', 'Backend', 'Data', 'Image', 'RoR', 'Photo'];

const insertTagStmt = db.prepare(
  'INSERT OR IGNORE INTO skill_tags (label) VALUES (?)'
);

for (const tag of TAGS) {
  insertTagStmt.run(tag);
}

const seededTags = getAllTags();
console.log('Seeded tags:', seededTags.map((t) => t.label).join(', '));

const MENTORS = [
  {
    circles_address: '0x0000000000000000000000000000000000000001',
    name: 'Zet',
    bio: 'CTO @THP, contributor web3 on Intuition',
    skills: ['AI', 'Dev'],
    calendar_link: 'https://cal.google.com/placeholder-zet',
    price_crc: 100,
  },
  {
    circles_address: '0x0000000000000000000000000000000000000002',
    name: 'Flo',
    bio: 'Legal expert & AI enthusiast',
    skills: ['AI', 'Legal'],
    calendar_link: 'https://cal.google.com/placeholder-flo',
    price_crc: 100,
  },
  {
    circles_address: '0x0000000000000000000000000000000000000003',
    name: 'Dimitry',
    bio: 'Ruby on Rails engineer',
    skills: ['RoR', 'Backend'],
    calendar_link: 'https://cal.google.com/placeholder-dimitry',
    price_crc: 100,
  },
  {
    circles_address: '0x0000000000000000000000000000000000000004',
    name: 'Vincent',
    bio: 'Creative director & photographer',
    skills: ['Image', 'Photo'],
    calendar_link: 'https://cal.google.com/placeholder-vincent',
    price_crc: 100,
  },
];

for (const mentor of MENTORS) {
  const id = insertMentor(mentor);
  console.log(`Seeded mentor: ${mentor.name} (id=${id})`);
}
