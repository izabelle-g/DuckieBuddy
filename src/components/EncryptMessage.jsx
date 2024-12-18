import { useState } from 'react';
import crypto from 'crypto';
import { Buffer } from 'buffer';

const EncryptMessage = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [secret, setSecret] = useState(null);

  const performKeyExchange = async () => {
    const DH = crypto.createDiffieHellman(1000, 2);
    const ourKey = DH.generateKeys();
    const prime = DH.getPrime();

    try {
      const response = await fetch('/secure/add/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Diffie: ourKey,
          Prime: prime,
        }),
      });

      const data = await response.json();
      const serverKey = Buffer.from(data.Helman);
      const sharedSecret = DH.computeSecret(serverKey);

      setSecret(sharedSecret);
      setStatus('Key exchange successful. Ready to send messages.');
    } catch (error) {
      setStatus('Key exchange failed.');
    }
  };

  const sendEncryptedMessage = async () => {
    if (!secret) {
      setStatus('Key exchange not performed yet.');
      return;
    }

    const algorithm = 'aes-192-cbc';
    const key = crypto.scryptSync(secret.toString('hex'), 'salt', 24);
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(
      JSON.stringify({ username: 'Aubry', chatId: 1, contents: message }),
      'utf8',
      'hex'
    );
    encrypted += cipher.final('hex');

    try {
      const response = await fetch('/secure/add/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: encrypted,
        }),
      });

      const data = await response.json();
      setStatus(`Message sent successfully: ${JSON.stringify(data)}`);
    } catch (error) {
      setStatus('Failed to send the encrypted message.');
    }
  };

  return (
    <div>
      <h2>Encrypt and Send Message</h2>
      <button onClick={performKeyExchange}>Perform Key Exchange</button>
      <br />
      <input
        type="text"
        value={message}
        placeholder="Enter your message"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendEncryptedMessage}>Send Encrypted Message</button>
      <p>Status: {status}</p>
    </div>
  );
};

export default EncryptMessage;