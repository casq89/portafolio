import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import BritishAirways from './screens/BritishAirways';
import Hobbies from './screens/Hobbies';
import Home from './screens/Home';
import InvitationHomes from './screens/InvitationHomes';
import Konecta from './screens/Konecta';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/konecta" element={<Konecta />} />
        <Route path="/invitation-homes" element={<InvitationHomes />} />
        <Route path="/british-airways" element={<BritishAirways />} />
        <Route path="/hobbies" element={<Hobbies />} />
        <Route path="*"element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
