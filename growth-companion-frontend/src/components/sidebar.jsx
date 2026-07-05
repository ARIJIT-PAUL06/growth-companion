import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/appcontext";
import { assets } from "../assets/assets";
import moment from "moment";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    createNewChat,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();

    try {
      await fetch(`${SERVER_URL}/api/chat/${chatId}`, {
        method: "DELETE",
      });

      const updatedChats = chats.filter(
        (chat) => chat._id !== chatId
      );

      setChats(updatedChats);

      if (selectedChat?._id === chatId) {
        setSelectedChat(
          updatedChats.length ? updatedChats[0] : null
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-80 p-5 bg-gradient-to-b from-[#1b1625]/80 to-black/80 border-r border-purple-500/20 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-50 ${
        !isMenuOpen && "max-md:-translate-x-full"
      }`}
    >
      {/* Logo */}
      <img
        src={assets.logo_full}
        alt=""
        className="w-full max-w-70 mx-auto"
      />

      {/* New Chat Button */}
<div
  onClick={() => {
    navigate("/");
    createNewChat();
  }}
  className="relative w-full mt-8 group rounded-xl cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.02]"
>
  {/* Slowly Cycling Ambient Glow Halo */}
  <div className="absolute -inset-[3px] z-0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 blur-[2px] pointer-events-none overflow-hidden rounded-xl">

    {/* Glow Core Layer 1 */}
    <div className="absolute w-[300%] h-[300%] -top-[100%] -left-[100%] bg-[conic-gradient(from_0deg,#4285f4,#9b51e0,#ea4335,#fbbc05,#4285f4)] animate-none group-hover:animate-[spin_2s_linear_1]" />

    {/* Glow Core Layer 2 */}
    <div className="absolute w-[300%] h-[300%] -top-[100%] -left-[100%] bg-[conic-gradient(from_0deg,#4285f4,#9b51e0,#ea4335,#fbbc05,#4285f4)] animate-none group-hover:animate-[spin_3s_linear_1]" />

  </div>

  {/* Button Background */}
  <div className="absolute inset-0 rounded-xl overflow-hidden z-10">

    {/* Base Gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#db53db] to-[#db0f2e]" />

    {/* Hover Gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#db5a6e] to-[#db91db] opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />

  </div>

  {/* Button Content */}
  <button className="relative z-20 flex justify-center items-center w-full py-3 text-white text-lg font-semibold transition-all duration-500 ease-in-out group-hover:scale-[1.25]">

    <span className="mr-2 text-2xl transition-transform duration-500 group-hover:rotate-90">
      +
    </span>

    <span className="transition-all duration-500 group-hover:tracking-wide">
      New Chat
    </span>

  </button>
</div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 mt-5 bg-white/5 border border-white/10 rounded-xl">
        <img
          src={assets.search_icon}
          className="w-4 opacity-70"
          alt=""
        />

        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-sm placeholder:text-gray-500 outline-none bg-transparent w-full"
        />
      </div>

      {/* Recent */}
      {chats.length > 0 && (
        <p className="mt-6 text-sm text-gray-400 uppercase tracking-wider">
          Recent Chats
        </p>
      )}

      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
        {chats
          .filter((chat) => {
            const searchLower = search.toLowerCase();

            if (chat.messages && chat.messages.length > 0) {
              return chat.messages[0].content
                .toLowerCase()
                .includes(searchLower);
            }

            return (chat.title || "New Conversation")
              .toLowerCase()
              .includes(searchLower);
          })
          .map((chat) => {
            const isActive =
              selectedChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                onClick={() => {
  navigate("/");
  setSelectedChat(chat);
  setIsMenuOpen(false);
}}
                className={`group p-3 rounded-xl cursor-pointer border transition-all duration-300 ${
                  isActive
                    ? "bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                   <p className="truncate text-sm font-medium">
  {chat.title || "New Conversation"}
</p>

                    <p className="text-xs text-gray-500 mt-1">
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>

                  <button
                    onClick={(e) =>
                      deleteChat(e, chat._id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition duration-300 hover:scale-110"
                  >
                    <img
                      src={assets.bin_icon}
                      className="w-4 h-4 opacity-70 hover:opacity-100"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Cognitive Dashboard */}
<div
  onClick={() => navigate("/dashboard")}
  className="mt-4 p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20">
      <span className="text-lg">📊</span>
    </div>

    <div>
      <p className="text-sm text-cyan-200 font-semibold">
        Cognitive Dashboard
      </p>

      <p className="text-xs text-gray-400 mt-1">
        Track your mood, anxiety, habits & weekly growth
      </p>
    </div>
  </div>
</div>

      {/* Badge */}
      <div className="mt-4 p-4 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <p className="text-sm text-purple-200 font-medium">
  🧠 Memory Powered by{" "}
  <a
    href="https://www.cognee.ai/"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-purple-300 hover:text-fuchsia-300 hover:underline transition-all duration-300"
  >
    Cognee ↗
  </a>
</p>

        <p className="text-xs text-gray-400 mt-1">
          Long-term personalized memory
        </p>
      </div>

      <img
        onClick={() => setIsMenuOpen(false)}
        src={assets.close_icon}
        className="absolute top-4 right-4 w-5 h-5 cursor-pointer md:hidden"
        alt=""
      />
    </div>
  );
};

export default Sidebar;