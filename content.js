// Every piece of editable content lives in this file.
// Before going live: replace the sample values, set `sample: false`, and paste the Apps Script URL into `endpoint`.
// If you change a price or size here, change it in backend/Code.gs too. `node check.cjs` fails if they differ.
window.ELEVATE = {
  sample: true, // shows the "sample content" ribbon
  endpoint: '', // Apps Script web app URL. Empty = preview mode, nothing is sent anywhere.

  campStart: '2027-02-12T08:00:00+05:30', // SAMPLE
  countdownFrom: '2026-11-01T00:00:00+05:30', // when the hourglass starts running
  datesLabel: '12 to 14 February 2027', // SAMPLE
  venue: 'Venue to be revealed', // SAMPLE
  days: 3, // SAMPLE
  delegates: 150, // SAMPLE
  partnerEmail: 'partners@example.com', // SAMPLE

  currency: 'LKR',
  fee: 7500, // SAMPLE

  bank: { // SAMPLE
    bank: 'Your Bank Name',
    branch: 'Branch Name',
    account: '0000 0000 0000',
    holder: 'Account Holder Name',
  },

  agenda: [ // SAMPLE. art: gate | tower | forest | peak
    { label: 'The Gates', when: 'Arrival', art: 'gate', sessions: ['Check-in and house banners', 'Opening ceremony', 'The first fire: meet your house'] },
    { label: 'The Tower of Mirrors', when: 'Day I', art: 'tower', sessions: ['Who are you when nobody is watching?', 'Self-awareness workshop', 'Night walk and reflection'] },
    { label: 'The Forest of Problems', when: 'Day II', art: 'forest', sessions: ['Team challenge across the grounds', 'Keynote from a partner company', 'House versus house showcase'] },
    { label: 'The Summit', when: 'Day III', art: 'peak', sessions: ['Your leadership pledge', 'Awards and house cup', 'Closing ceremony'] },
  ],

  // SAMPLE testimonials. Replace with real quotes before launch. Add `photo: 'images/name.jpg'` to use a real portrait.
  portraits: [
    { name: 'Delegate Name', role: 'ELEVATE 4.0', hair: 'short', quote: 'Sample testimonial. I walked in sure I had nothing to say, and walked out running a team of twelve.' },
    { name: 'Delegate Name', role: 'ELEVATE 3.0', hair: 'long', quote: 'Sample testimonial. Three days in, I had said my real fears out loud to people who became my closest friends.' },
    { name: 'Delegate Name', role: 'ELEVATE 4.0', hair: 'bun', quote: 'Sample testimonial. The camp handed me a problem I could not solve alone. That was the entire lesson.' },
    { name: 'Delegate Name', role: 'ELEVATE 2.0', hair: 'short', quote: 'Sample testimonial. An interviewer asked when I had led through chaos. I smiled, because I had a story ready.' },
    { name: 'Delegate Name', role: 'ELEVATE 4.0', hair: 'long', quote: 'Sample testimonial. Nobody tells you how much you will miss the people from those three days.' },
  ],

  // Items with no `image` stay off the shelf. To sell one, add its photo: image: 'images/name.webp'
  merch: [ // SAMPLE
    { id: 'tee', name: "The Keeper's Tee", note: 'Heavy cotton, gold crest', price: 2500, image: 'images/tee.webp', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'hoodie', name: 'Midnight Hoodie', note: 'Lined hood, embroidered E5', price: 5500, image: 'images/hoodie.webp', sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'book', name: 'The Grimoire', note: 'Dot-grid notebook, 200 pages', price: 1500 },
    { id: 'pin', name: 'House Pin', note: 'Enamel, choose yours', price: 600, sizes: ['Lumen', 'Forge', 'Meridian', 'Kindle'] },
    { id: 'flask', name: 'Potion Flask', note: 'Steel bottle, 750 ml', price: 2800 },
    { id: 'tote', name: "Apprentice's Tote", note: 'Canvas, carries everything', price: 1200 },
  ],

  partners: [ // SAMPLE
    { tier: 'Title Patron', name: 'Your Name Here' },
    { tier: 'Knowledge Patron', name: 'Your Name Here' },
    { tier: 'Hiring Patron', name: 'Your Name Here' },
    { tier: 'Media Patron', name: 'Your Name Here' },
    { tier: 'Feast Patron', name: 'Your Name Here' },
  ],

  houses: {
    lumen: { name: 'House Lumen', quality: 'Self-aware', color: '#7fb5e6', line: 'You see clearly, starting with yourself. Others come to you for the truth.' },
    forge: { name: 'House Forge', quality: 'Solution-oriented', color: '#ee8644', line: 'When the plan collapses, you are already building the next one.' },
    meridian: { name: 'House Meridian', quality: 'World citizen', color: '#4cc2a4', line: 'Every stranger is a story you have not heard yet. You make the room bigger.' },
    kindle: { name: 'House Kindle', quality: 'Empowering others', color: '#e2649c', line: 'You light other people and lose nothing by it.' },
  },

  quiz: [
    { q: 'A storm strands your team on the road to camp. What do you do first?', a: {
      lumen: 'Stop, and check how everyone is really doing, me included',
      forge: 'Spread out the map and find a way through',
      meridian: 'Ask the locals what they know that we do not',
      kindle: 'Hand the lantern to the quietest person and follow them',
    } },
    { q: 'A door appears in the castle that was not there yesterday. Inside is...', a: {
      lumen: 'A mirror showing who you are becoming',
      forge: 'A workshop with one half-built machine',
      meridian: 'A long table set for guests from every country',
      kindle: 'A room of people waiting for someone to believe in them',
    } },
    { q: 'What do people usually thank you for?', a: {
      lumen: 'Saying the honest thing nobody else would',
      forge: 'Getting it done when everything fell apart',
      meridian: 'Making strangers feel like they belong',
      kindle: 'Seeing something in them before they did',
    } },
    { q: 'Choose one relic to carry.', a: {
      lumen: 'A lantern that reveals only what is true',
      forge: 'A hammer that never breaks',
      meridian: 'A compass that points to whoever needs you',
      kindle: 'A candle that lights a thousand others and never dims',
    } },
    { q: 'On the last night of camp, you want to leave with...', a: {
      lumen: 'A clearer sense of who I am',
      forge: 'Proof I can solve what used to scare me',
      meridian: 'Friends and a wider view of the world',
      kindle: 'A team I helped rise',
    } },
  ],

  faq: [
    { q: 'Who can attend?', a: 'Undergraduates who want to grow as leaders. No experience in AIESEC is needed. Sample answer, please edit.' },
    { q: 'What does the fee cover?', a: 'Your place at the camp, meals, accommodation and your delegate kit. Sample answer, please edit.' },
    { q: 'How do I pay?', a: 'Transfer the amount to the account shown on the form, then upload your slip when you register. Our team checks each slip and confirms by email.' },
    { q: 'How do I get my merch?', a: 'Collect your order at the camp or from the AIESEC in NSBM team, with your order reference. Sample answer, please edit.' },
    { q: 'Can I get a refund?', a: 'Sample answer, please add your refund policy here.' },
  ],
};
