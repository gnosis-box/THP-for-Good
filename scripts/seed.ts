import { insertMentor, addDbAdmin } from '../lib/db';

/** Default admins — see spec/seed.md */
const ADMINS = [
  '0x7C40dCa0e48BE4E0D218869a788eAf9F91dE3ad0',
  '0xEE4DE7682d5aCd906F7DcbBbD776554bD2DfB4A2',
  '0xa3bA0574518c689a9C48a217fD4624a0f1fA32c7',
];

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

for (const address of ADMINS) {
  addDbAdmin(address);
  console.log(`Seeded admin: ${address.toLowerCase()}`);
}

for (const mentor of MENTORS) {
  const id = insertMentor(mentor);
  console.log(`Seeded mentor: ${mentor.name} (id=${id})`);
}
