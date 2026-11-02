import { unsplash } from '../lib/utils.js';

export const festivalCollections = [
  {
    id: 1,
    slug: 'diwali-hampers',
    name: 'Diwali Gift Hampers',
    tagline: 'Light up every relationship',
    image: unsplash('photo-1513885535751-8b9238bd345a'),
    link: '/categories/festival-hampers/diwali-hampers',
  },
  {
    id: 2,
    slug: 'holiday-gifts',
    name: 'Holiday Gift Boxes',
    tagline: 'Season\u2019s greetings, delivered',
    image: unsplash('photo-1513201099705-a9746e1e201f'),
    link: '/categories/festival-hampers/holiday-gifts',
  },
  {
    id: 3,
    slug: 'celebration-hampers',
    name: 'Celebration Hampers',
    tagline: 'For milestones & wins',
    image: unsplash('photo-1549465220-1a8b9238cd48'),
    link: '/categories/festival-hampers/celebration-hampers',
  },
  {
    id: 4,
    slug: 'new-year-hampers',
    name: 'New Year Hampers',
    tagline: 'Start the year thoughtfully',
    image: unsplash('photo-1512909006721-3d6018887383'),
    link: '/categories/festival-hampers/holiday-gifts',
  },
];

export default festivalCollections;
