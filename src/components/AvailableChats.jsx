import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AvailableChats = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the available chats from the backend
    fetch('/recent')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setChats(data);
        }
      })
      .catch(() => setError('Failed to fetch chats.'));
  }, []);

  return (
    <div>
      <h1>Available Chats</h1>
      {error && <p className="error">{error}</p>}
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <Link to={`/secure/add/${index + 1}`}>{chat.author}: {chat.contents}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailableChats;