// const CurrentChat = () => {
//     return(
//         <div>
//             <h3>username</h3>
//             <div>
//                 if change run chat bubble
//             </div>
//             <form>
//                 <input type="text"></input>
//                 <input type="submit"></input>
//             </form>
//         </div>
//     )
// }

// export default CurrentChat

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatBubble from './ChatBubble.jsx';

const CurrentChat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [syncId] = useState(Math.floor(Math.random() * 10000)); // Unique sync ID

  useEffect(() => {
    fetch(`/recent`)
      .then(response => response.json())
      .then(data => setMessages(data))
      .catch(err => setError('Failed to load messages.'));
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      // Diffie-Hellman encryption would be done here
      const encryptedParams = newMessage; // Placeholder

      const response = await fetch(`/secure/add/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncId,
          params: encryptedParams, // Replace with actual encryption
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages([...messages, result]);
        setNewMessage('');
      } else {
        setError('Failed to send message.');
      }
    } catch (err) {
      setError('An error occurred.');
    }
  };

  return (
    <div className="current-chat">
      <h3>Chat {chatId}</h3>
      {error && <p className="error">{error}</p>}
      <div className="messages">
        {messages.map((msg, index) => (
          <ChatBubble key={index} username={msg.author} content={msg.contents} />
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default CurrentChat;