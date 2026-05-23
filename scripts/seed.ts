import { insertExpert, addDbAdmin, syncExpertLanguages } from '../lib/db';

/** Default admins — see spec/seed.md */
const ADMINS = [
  '0x7C40dCa0e48BE4E0D218869a788eAf9F91dE3ad0',
  '0xEE4DE7682d5aCd906F7DcbBbD776554bD2DfB4A2',
  '0xa3bA0574518c689a9C48a217fD4624a0f1fA32c7',
];

const EXPERTS = [
  {
    circles_address: '0x3d0987dba0b79526f621eafca648e4d8cb3a4c6c',
    name: 'Zet',
    bio: "CTO @The Hacking Project. Contributor @Intuition protocol and @Intuition.box\nI don't believe in miracles -- only in decentralization.",
    skills: ['Web3', 'Relative Trust', 'Transitie Trust', 'DeGov', 'Delegation', 'Circles'],
    spoken_languages: ['en', 'fr'],
    call_languages: ['en', 'fr'],
    calendar_link: 'https://calendar.app.google/ZzmogbPxm9MbXt2WA',
    price_crc: 10,
  },
];

for (const address of ADMINS) {
  addDbAdmin(address);
  console.log(`Seeded admin: ${address.toLowerCase()}`);
}

for (const expert of EXPERTS) {
  const id = insertExpert(expert);
  const synced = syncExpertLanguages(
    expert.circles_address,
    [...expert.spoken_languages],
    [...expert.call_languages],
  );
  console.log(
    `Seeded expert: ${expert.name} (id=${id}${synced ? ', languages synced' : ''})`,
  );
}
