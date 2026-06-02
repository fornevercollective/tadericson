// Structured data for tadericson.com PWA
// Extracted and adapted from live site. Replace image URLs with self-hosted optimized assets when ready.

export type Project = {
  slug: string
  title: string
  category: 'tv' | 'film' | 'vevo' | '3d' | '2d' | 'tree' | 'info'
  year?: string
  role?: string
  description?: string
  imdb?: string
  vimeo?: string
  link?: string
  images: string[] // prefer self hosted later; using myportfolio cdn for initial fidelity
  tags?: string[]
}

export type CreditGroup = {
  title: string
  items: string[]
}

export const navSections = [
  { label: 'TV', path: '/tv' },
  { label: 'FILM', path: '/film' },
  { label: 'VEVO', path: '/vevo' },
  { label: '3D', path: '/3d' },
  { label: '2D', path: '/2d' },
  { label: 'TREE', path: '/tree' },
  { label: 'INFO', path: '/info' },
] as const

export const homeIntro = {
  location: 'OREGON USA',
  tagline: 'DM for COLABs',
  ancestryNote: 'Working on my interesting ancestry research with amazing help from elders of the world.',
}

export const summaryCredits: CreditGroup[] = [
  {
    title: 'FEATURE FILMS',
    items: ['A.C.O.D. • Adult Children Of Divorce', 'First Winter'],
  },
  {
    title: 'EPISODIC',
    items: ['Unbreakable Kimmy Schmidt', 'Smash', 'Borgia', 'Royal Pains', 'The Fuzz'],
  },
  {
    title: 'MUSIC VIDEOS',
    items: ['Kanye West – Mercy', 'Pit Bull – Penguins of Madagascar Soundtrack', 'Jimmy Eat World – My Best Theory'],
  },
  {
    title: 'COMMERCIALS',
    items: ['Tom Ford – Noir'],
  },
  {
    title: 'MOTION GRAPHICS',
    items: ["55th GRAMMY's – presented by PEPSI", 'WANDERLUST – Peace Love Car 50 State Tour', 'PENNZOIL – Turn Up The Music & Drive'],
  },
]

export const vevoCredits: CreditGroup[] = [
  {
    title: 'BRANDS',
    items: ['VEVO', '55th Grammys', 'PEPSI', 'McDonalds', 'Miracle Whip', 'NIKE', 'Toyota', 'Pennzoil', 'Virgin America', 'SXSW', 'Universal Music Group', 'Sony Music Entertainment', 'Abu Dhabi Media', 'VW'],
  },
  {
    title: 'ASK:REPLY',
    items: ['Thalia', 'Alejandro Sanz', 'David Bisbal', 'Bridgit Mendler', 'J King y Maximan', 'The Saturdays', 'Austin Mahone', 'Krewella', 'Joan Sebastian', 'Florida Georgia Line', 'The Neighbourhood', 'Prince Royce'],
  },
  {
    title: 'LIFT',
    items: ['Paloma Faith', 'Kacey Musgraves', 'The Saturdays', 'Austin Mahone', 'Krewella', 'Florida Georgia Line', 'Avicii'],
  },
  {
    title: 'CAM-OPP',
    items: ['A$AP Rocky', 'Sierra Noble', 'Mindless Behavior', 'Brian McKnight', 'Seal', 'Bullet For My Valentine', 'Krissy Krissy', 'Joell Ortiz', 'Nico Vega', 'YG', 'Everything Everything', 'Gin Wigmore', 'Selena Gomez', 'Guinevere', 'Mathew Koma', 'French Montana', 'Michael Franti', 'Ashanti', 'Nyzzy Nyce', 'Scotty Rebel', 'YoGotti', 'Bonnie Mckee'],
  },
]

export const infoCredits: CreditGroup[] = [
  {
    title: 'Retail',
    items: ['Apple (Fifth Avenue)', 'Discovery Cove Orlando', 'Queen Meb', 'Urban Outfitters', 'FTC Orlando – Steadicam'],
  },
  {
    title: 'Manufacturing',
    items: ['Bumble and bumble', 'Will Leather Goods', 'Stretch Shapes', 'Kəvən™ (Keven Craft Rituals)', 'Aaron Goodman Studios'],
  },
  {
    title: 'Entertainment / VFX',
    items: ['The Molecule VFX', 'Fireshot Productions', 'Omega Darling', 'Greencard Pictures', 'Ghost Robot', 'Capture This NYC', 'Driver Digital', 'D.O. Cariñena SPAIN Tourism Board'],
  },
  {
    title: 'Learning',
    items: ['Ghetto Film School', 'Yoga Slackers', 'The House Of Twigs'],
  },
  {
    title: 'Fundraising',
    items: ['American Lung Association', 'NASA Kennedy Space Center'],
  },
]

export const projects: Project[] = [
  // TV
  { slug: 'smash', title: 'Smash', category: 'tv', year: '2012', role: 'VFX / Graphics', imdb: 'https://www.imdb.com/title/tt2320807/', description: 'NBC musical drama series. Motion graphics and visual effects support.', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/7e3d6801-a2e5-4327-950f-8d26391ee9a3_rwc_0x122x519x405x32.jpg?h=d34328c1226552ecafb042475329761c'] },
  { slug: 'bates-motel', title: 'Bates Motel', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/32af9029-8d48-41fc-86c0-e460de991c59_rwc_69x0x465x364x32.jpg?h=9b7be87516a74dd0a61030e205494b20'] },
  { slug: 'unbreakable-kimmy-schmidt', title: 'Unbreakable Kimmy Schmidt', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/dfb23e3e-fea0-4a81-b672-7773fce9d775_rwc_53x0x729x570x32.jpg?h=c207dc99dfd4d98655c673967ab74129'] },
  { slug: 'borgia', title: 'Borgia', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/e6e3136c-d0b8-4eda-a3aa-3caed26ac799_rwc_248x0x959x750x32.jpeg?h=5395dbce4b9ef36a4d98df38f8c1e19b'] },
  { slug: 'the-fuzz', title: 'The Fuzz', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/e05bb8d2-c25b-461b-a90f-7c2f3b18f6aa_rwc_78x0x479x375x32.jpg?h=6c6fa8d7235698665f59650758adfc69'] },
  { slug: 'royal-pains', title: 'Royal Pains', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/d4259228-83b8-4175-864e-116de019e9ec_rwc_214x56x1387x1085x32.jpg?h=d7694e8f691af80e20dac59b60484c5f'] },
  { slug: 'tom-ford', title: 'Tom Ford – Noir', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/46c1a7f2-6122-4e34-b0cc-b42a230ce2ad_rwc_0x6x492x384x32.jpg?h=3fabe43bac71451365ff4e2d64cfb7bd'] },
  { slug: 'coco-rocha', title: 'Coco Rocha', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/0e74e550-2bf7-4391-bf3b-009f0e034d5d_carw_202x158x32.jpg?h=a40eaa8fc922265110801052ec65157e'] },
  { slug: 'volkswagen', title: 'Volkswagen', category: 'tv', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/418fd5cd-82d6-454a-810a-50d59a3779b3_rwc_205x0x2261x1768x32.png?h=58b6a076cf93d6cc7118af052fef78bc'] },

  // FILM
  { slug: 'penguins-of-madagascar', title: 'Penguins of Madagascar', category: 'film', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/f8b0b873-00af-42de-b01f-21f47a1d022a_carw_202x158x32.jpg?h=748fc606e1ba79808168aae88540f772'] },
  { slug: 'acod', title: 'A.C.O.D. (Adult Children of Divorce)', category: 'film', year: '2013', imdb: 'https://www.imdb.com/title/tt1935896/', description: 'Feature film. VFX contributions.', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/b6f060ef-c9d0-469a-bf4d-f392c309fc3c_rwc_0x160x1864x1457x32.png?h=0ef98282b6ee562b4e19700d69db452e'] },
  { slug: 'accident', title: 'Accident', category: 'film', year: '2017', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/55554e4e-4e48-4383-8cc8-72efb70d6090_carw_202x158x32.jpg?h=4f47f26e1d8e380d82b220233a952f0e'] },
  { slug: 'first-winter', title: 'First Winter', category: 'film', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/4d3a6005-f800-4dd7-95e4-455f7acff816_rwc_0x214x486x379x32.jpg?h=62098897a717b2093f3e32d403f7c606'] },
  { slug: 'yoga-slackers', title: 'Yoga Slackers', category: 'film', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/369de9b2-cd2f-45e0-9b91-27c5669e3775_rwc_184x226x488x381x32.jpg?h=aa1688bf553875a777997c16d21e0239'] },

  // VEVO / Music (representative)
  { slug: 'kanye-mercy', title: 'Kanye West – Mercy', category: 'vevo', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/875a1c28-5268-4d44-88dd-e0f92a0b7c93_carw_202x158x32.jpg?h=af0f4864cfdb61319cc8589424ffc578'] },

  // 3D
  { slug: 'ai-art', title: 'AI Art', category: '3d', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/875a1c28-5268-4d44-88dd-e0f92a0b7c93_carw_202x158x32.jpg?h=af0f4864cfdb61319cc8589424ffc578'] },
  { slug: 'justadrop', title: 'Just a Drop', category: '3d', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/816ce5cd-e026-4e1e-a329-f022c607effc_carw_202x158x32.jpg?h=f70c2bd0d4f1ca79a6fc11fd6aa8a958'] },
  { slug: '3d-renders', title: '3D Renders', category: '3d', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/bca908b8e00393e830b5c4ed889a1cefbd47bc853837fafdd0cd4f85ec085419a671cd87a9b65af1_carw_202x158x32.jpg?h=138d7d82ca722897f485d3101b5e2c32'] },
  { slug: 'arc', title: 'ARC', category: '3d', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/14fde351-9771-498e-af11-634fe63eba61_rwc_318x125x1192x934x32.jpg?h=c5afaf3650f7a1dbb73f6159df1276c2'] },

  // TREE / Ancestry
  { slug: 'ancestry', title: 'Ancestry', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/cdc5625f-3c94-4bde-b2c7-8494d4279ac5_rwc_0x168x1004x784x32.PNG?h=0362cd3b8dd2e9de958099eb037311ab'] },
  { slug: 'firstnation', title: 'First Nation', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/dba25640-9a1c-4287-9e9a-fa5e2712ab91_carw_202x158x32.jpg?h=a7be81a40d4f26eac8712c6505975617'] },
  { slug: 'powhatan', title: 'Powhatan', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/7dc976da-12b6-4ac3-bcda-e0501c2dcfda_rwc_0x108x460x359x32.jpg?h=534e180a2ad2dbeebaf3734d99d0a557'] },
  { slug: 'lenapehoking', title: 'Lenapehoking', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/8260e339-9ec7-46a1-aca2-881110b4541c_rwc_599x178x728x569x32.jpg?h=7516b367371b7d4d9deaa7ade22aec98'] },
  { slug: 'roskelyn', title: 'Roskelyn', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/e6220e4e-2867-473a-8ab8-02484d2de736_rwc_140x0x447x350x32.jpg?h=7bd75deb44185930dc14b278245ce8b4'] },
  { slug: 'dunkeld', title: 'Dunkeld', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/9a35c9b7-2633-4e74-9b82-996c980cf546_rwc_0x0x413x322x32.jpg?h=e1a83590d3f15bb33b18ef2d0ccaf470'] },
  { slug: 'hauteville', title: 'Hauteville', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/82c2994a-8fdf-4b47-b2ef-c0bcc9f9be5c_rwc_94x0x1089x852x32.jpg?h=9e957760bc2d2590c7d441caf14f4fba'] },
  { slug: 'lodbrock', title: 'Lodbrock', category: 'tree', images: ['https://cdn.myportfolio.com/a0bfb375047485c1e2494453e8c793bc/4fe6a0c0-4cb1-498b-8ad2-2c5daed866a7_carw_202x158x32.jpg?h=bb42b9dbfc53515f530dedfb5a0d4fa3'] },
]

export const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tadericson/' },
  { label: 'IMDB', url: 'http://www.imdb.com/name/nm2460024/' },
  { label: 'Vimeo', url: 'https://vimeo.com/fornever' },
  { label: 'Instagram', url: 'https://www.instagram.com/tadericson/' },
]

export function getProjectsByCategory(cat: Project['category']) {
  return projects.filter(p => p.category === cat)
}

export function getProject(slug: string) {
  return projects.find(p => p.slug === slug)
}
