// const ChatBubble = () => {
//     // if user, do this
//     // else, other person
//     return(
//         <p>chat bubble</p>
//     )
// }

// export default ChatBubble

import PropTypes from 'prop-types';

const ChatBubble = ({ username, content }) => {
  return (
    <div className="chat-bubble">
      <strong>{username}</strong>: {content}
    </div>
  );
};

ChatBubble.propTypes = {
  username: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default ChatBubble;