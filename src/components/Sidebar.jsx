// const Sidebar = () => {
//     return(
//         <div>
//             <h2>username</h2>
//             <a href=""><img src="" rel="icon"/> </a>
// 			<img/>
// 			<hr></hr>
//             <div>
//                 <h3>Messages</h3>
//                 <ul>
//                     {}
//                 </ul>
//             </div>
//         </div>
//     )
// }

// export default Sidebar

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/recent')
      .then(response => response.json())
      .then(data => setChats(data))
      .catch(err => setError('Failed to load chat summaries.'));
  }, []);

  return (
    <div className="sidebar">
      <h2>Available Chats</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <Link to={`/chat/${chat.chatId}`}>
              {chat.author}: {chat.contents.slice(0, 20)}...
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;