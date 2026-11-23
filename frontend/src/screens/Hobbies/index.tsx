import BackLink from '../../components/BackLink';
import SectionHeader from '../../components/SectionHeader';
import Window from '../../components/Window';
import { hobbies } from '../../data/hobbies';
import HobbyCarousel from './components/HobbyCarousel';

// What I do when I'm away from the keyboard.
function Hobbies() {
  return (
    <section className="py-10 md:pb-24">
      <BackLink to="/" path="~/hobbies" />

      <div className="mt-8">
        <SectionHeader path="~/hobbies" title="Off the clock" description="What I do when I'm away from the keyboard." />
      </div>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hobbies.map((hobby) => (
          <li key={hobby.name}>
            <Window meta={`${hobby.images.length} photos`} className="h-full">
              <HobbyCarousel label={hobby.name} images={hobby.images} />
              <div className="flex flex-col gap-3 border-t-[1.5px] border-edge p-6">
                <h3 className="font-mono text-2xl font-bold">{hobby.name}</h3>
                <p className="font-mono text-muted">{hobby.description}</p>
              </div>
            </Window>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Hobbies;
