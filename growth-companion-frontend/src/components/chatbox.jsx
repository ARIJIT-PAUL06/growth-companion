import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import Message from "./message";
import { useAppContext } from "../context/appcontext";
import companionPrompts from "../constants/companionPrompts";

const Chatbox = () => {
  const containerRef = useRef(null);

  const { selectedChat, chats, setChats, setSelectedChat } =
    useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatId, setChatId] = useState(null);

  // ==============================
  // Landing Page Typing Animation
  // ==============================

  const firstPrompt = "Tell me what's on your mind...";

  const [displayText, setDisplayText] = useState("");

  const shufflePrompts = () => {
    const arr = [...companionPrompts];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  };

  // ==============================
  // Sync Selected Chat
  // ==============================

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
      setChatId(selectedChat._id || null);
    } else {
      setMessages([]);
      setChatId(null);
    }
  }, [selectedChat]);

    const onSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim() || loading) return;

    const currentPrompt = prompt;

    const userMessage = {
      role: "user",
      content: currentPrompt,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentPrompt,
            chatId,
          }),
        }
      );

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };

      const finalMessages = [
        ...updatedMessages,
        assistantMessage,
      ];

      setMessages(finalMessages);

      const updatedChat = {
        _id: data.chatId || chatId,
        title: selectedChat?.title || "New Conversation",
        messages: finalMessages,
        updatedAt: new Date(),
      };

      setChatId(updatedChat._id);

      setSelectedChat(updatedChat);

      setChats((prev) => {
        const exists = prev.some(
          (chat) => chat._id === updatedChat._id
        );

        if (exists) {
          return prev.map((chat) =>
            chat._id === updatedChat._id
              ? updatedChat
              : chat
          );
        }

        return [updatedChat, ...prev];
      });
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong while contacting server.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

    // ==============================
  // Auto Scroll
  // ==============================

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // ==============================
  // Landing Page Typing Animation
  // ==============================

  useEffect(() => {
    if (messages.length > 0) return;

    let prompts = shufflePrompts();

    let currentText = firstPrompt;

    let charIndex = 0;

    let deleting = false;

    let currentPrompt = -1;

    let timeout = null;

    const animate = () => {
      if (!deleting) {
        setDisplayText(currentText.slice(0, charIndex + 1));

        charIndex++;

        if (charIndex === currentText.length) {
          timeout = setTimeout(() => {
            deleting = true;
            animate();
          }, 6400);

          return;
        }

        timeout = setTimeout(animate, 100);
      } else {
        setDisplayText(currentText.slice(0, charIndex - 1));

        charIndex--;

        if (charIndex === 0) {
          deleting = false;

          currentPrompt++;

          if (currentPrompt === prompts.length) {
            prompts = shufflePrompts();
            currentPrompt = 0;
          }

          currentText = prompts[currentPrompt];

          charIndex = 0;

          timeout = setTimeout(animate, 500);

          return;
        }

        timeout = setTimeout(animate, 100);
      }
    };

    animate();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [messages.length]);

    return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat Messages */}
      <div
        ref={containerRef}
        className="flex-1 mb-5 overflow-y-scroll"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={assets.logo_full}
              alt=""
              className="w-full max-w-100 sm:max-w-100"
            />
{/* Cognee Badge */}

            <div className="mt-6 text-s bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2 text-purple-200">
              🧠 Memory Powered by Cognee
            </div>
            {/* Animated Landing Text */}

            <p className="mt-5 text-3xl sm:text-4xl text-center text-gray-300/20 font-mono mx-auto max-w-4xl px-6 leading-relaxed">
              {displayText}
              <span className="inline-block ml-1 animate-pulse">
                |
              </span>
            </p>

            
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Input */}

      <form
        onSubmit={onSubmit}
        className="bg-pink-400/10 border border-primary dark:border-pink-500/20 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Share what you're feeling..."
          className="flex-1 w-full text-sm outline-none bg-transparent"
          required
        />

        <button disabled={loading}>
          <img
            src={assets.send_icon}
            className="w-6 cursor-pointer transition-all duration-300 ease-in-out hover:brightness-150 hover:scale-105"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;