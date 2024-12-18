import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import Sidebar from "./components/Sidebar.jsx";
//import EncryptMessage from "./components/EncryptMessage.jsx";
//import RecentChats from "./components/RecentChats.jsx";
import './styles/index.css';
import AvailableChats from './AvailableChats';
import DiffieHellmanChat from './DiffieHellmanChat';

const App = () => {
  return (
    <Router>
      <div>
      <h1>Duckie Buddy</h1>
      <Routes>
        <Route path="/" element={<AvailableChats />} />
        <Route path="/secure/add/:chatId" element={<DiffieHellmanChat />} />
      </Routes>
      </div>
    </Router>
  );
};

export default App;