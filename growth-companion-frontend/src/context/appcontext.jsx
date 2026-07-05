import { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat`
      );
      const data = await response.json();

      setChats(data);

      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/new`,
        {
          method: "POST",
        }
      );

      const newChat = await response.json();

      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const value = {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    createNewChat,
    fetchChats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);