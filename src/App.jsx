import Sidebar from "./components/Sidebar.jsx"
import CurrentChat from "./components/CurrentChat.jsx"

function App() {
  return (
    <div>
        <Sidebar></Sidebar>
        current chat is invisible at first
        <CurrentChat></CurrentChat>
    </div>
  )
}

export default App
