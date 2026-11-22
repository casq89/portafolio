import Contact from './components/Contact';
import Demos from './components/Demos';
import Experience from './components/Experience';
import Hero from './components/Hero';
import Layout from './components/Layout';
import Projects from './components/Projects';

function App() {
  return (
    <Layout>
      <Hero />
      <Projects />
      <Demos />
      <Experience />
      <Contact />
    </Layout>
  );
}

export default App;
