import { useState, useEffect } from 'react';

const RecentChats = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/recent')
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setChats(data);
        }
      })
      .catch((err) => setError('Failed to fetch recent chats.'));
  }, []);

  return (
    <div>
      <h2>Recent Chats</h2>
      {error && <p>Error: {error}</p>}
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <strong>{chat.author}:</strong> {chat.contents}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentChats;