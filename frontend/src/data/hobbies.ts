import car1 from '../assets/hobbies/cars/car-1.webp';
import car2 from '../assets/hobbies/cars/car-2.webp';
import car3 from '../assets/hobbies/cars/car-3.webp';
import car4 from '../assets/hobbies/cars/car-4.webp';
import car5 from '../assets/hobbies/cars/car-5.webp';
import car6 from '../assets/hobbies/cars/car-6.webp';
import car7 from '../assets/hobbies/cars/car-7.webp';
import car8 from '../assets/hobbies/cars/car-8.webp';
import chess3 from '../assets/hobbies/chess/chess-3.webp';
import chess4 from '../assets/hobbies/chess/chess-4.webp';
import glassSet from '../assets/hobbies/chess/glass-set.webp';
import woodSet from '../assets/hobbies/chess/wood-set.webp';
import kite1 from '../assets/hobbies/kites/kite-1.webp';
import kite2 from '../assets/hobbies/kites/kite-2.webp';
import kite3 from '../assets/hobbies/kites/kite-3.webp';
import kite4 from '../assets/hobbies/kites/kite-4.webp';
import kite5 from '../assets/hobbies/kites/kite-5.webp';

export interface HobbyImage {
  src: string;
  alt: string;
}

export interface Hobby {
  name: string;
  description: string;
  images: HobbyImage[];
}

export const hobbies: Hobby[] = [
  {
    name: 'Chess',
    description: 'Openings, tactics and the occasional blunder. Same muscle as debugging: think a few moves ahead.',
    images: [
      { src: glassSet, alt: 'Glass chess set with clear and frosted pieces on a glass board' },
      { src: woodSet, alt: 'Wooden chess set in its starting position on a folding board' },
      { src: chess3, alt: "Scholar's mate: the white queen takes f7 with checkmate" },
      { src: chess4, alt: "Final position of Morphy's Opera Game, checkmate with the rook on d8" },
    ],
  },
  {
    name: 'Car drawing',
    description: 'Pencil and marker drawings of the cars I like, from supercars to movie classics.',
    images: [
      { src: car1, alt: 'Graphite drawing of a Lamborghini Reventón' },
      { src: car2, alt: 'Framed drawing of a white Volkswagen Beetle with the number 53 and racing stripes' },
      { src: car3, alt: 'Framed drawing of a yellow Chevrolet Camaro with black stripes and an Autobot logo' },
      { src: car4, alt: 'Sketchbook drawing of a black and blue Bugatti Chiron' },
      { src: car5, alt: 'Holding up a framed drawing of a black Toyota Tundra pickup' },
      { src: car6, alt: 'Framed drawing of a black and silver Audi R8' },
      { src: car7, alt: 'Drawing of a black Toyota Tundra pickup under the Clínica del Play logo' },
      { src: car8, alt: 'Framed drawing of a black Ferrari with red flame details' },
    ],
  },
  {
    name: 'Kites',
    description: 'Building and flying kites on windy afternoons in the mountains.',
    images: [
      { src: kite1, alt: 'Person flying a small kite over an open field' },
      { src: kite2, alt: 'Two people watching a red kite fly over the mountains' },
      { src: kite3, alt: 'Blue and black geometric kite against a cloudy sky' },
      { src: kite4, alt: 'Black and white kite with a Decepticon design in the sky' },
      { src: kite5, alt: 'Blue and black kite flying over green mountains' },
    ],
  },
];
