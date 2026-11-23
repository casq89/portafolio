import Contact from './components/Contact';
import Demos from './components/Demos';
import Experience from './components/Experience';
import Hero from './components/Hero';
import Projects from './components/Projects';

function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Demos />
      <Experience />
      <Contact />
    </>
  );
}

export default Home;
