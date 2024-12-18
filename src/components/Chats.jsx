// const Chats = () => {
//     return(
//         <li>
//             <img/>
//             <h4>username</h4>
//             <p>message snippet</p>
//         </li>
//     )
// }

// export default Chats

import PropTypes from 'prop-types';

const Chats = ({ username, message }) => {
  return (
    <li className="chat-item">
      <img alt="user" />
      <h4>{username}</h4>
      <p>{message}</p>
    </li>
  );
};

Chats.propTypes = {
  username: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default Chats;