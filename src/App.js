import React, { useEffect, useRef, useState } from "react";

const App = ({ cable }) => {
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const lastMessageRef = useRef(null);

  useEffect(() => {
    lastMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  const createUUID = () => {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );

    return uuid;
  };

  const fetchUser = async (userId) => {
    const response = await fetch(
      "https://ancient-basin-80711.herokuapp.com/connect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      }
    );

    const data = await response.json();
    return data;
  };

  useEffect(() => {
    fetch("https://ancient-basin-80711.herokuapp.com/message_history", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => {
      if (r.ok) {
        r.json().then((data) => {
          setMessages(data);
        });
      }
    });
  }, []);

  useEffect(() => {
    const localId = localStorage.getItem("chatroomUserId");

    if (!localId) {
      localStorage.setItem("chatroomUserId", createUUID());
      const newLocalId = localStorage.getItem("chatroomUserId");
      fetchUser(newLocalId);
      setUser(newLocalId);
    } else {
      setUser(localId);
      fetchUser(localId);
    }
  }, []);

  useEffect(() => {
    cable.subscriptions.create(
      {
        channel: "ChatsChannel",
      },
      {
        received: (message) => {
          setMessages([...messages, message]);
        },
      }
    );
  }, [cable.subscriptions, messages, setMessages]);

  const handleChat = async (e) => {
    e.preventDefault();
    await fetch("https://ancient-basin-80711.herokuapp.com/create_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user,
        content: chatMsg,
      }),
    });

    setChatMsg("");
  };

  return (
    <div className="min-h-screen min-w-full flex flex-col items-center bg-[#1F1F33] text-white">
      <h1 className="text-2xl font-bold">{`Hello ${user}`}</h1>
      <div className="flex flex-col border border-gray-600 max-w-2xl max-h-[32rem] overflow-y-scroll w-full rounded shadow my-3 p-4">
        {messages.map((message) => {
          const fromYou = message.sender_id === user;
          return (
            <div className="flex flex-col my-2" key={`chat-key-${message.id}`}>
              <span
                className={`flex flex-col flex-wrap ${
                  fromYou ? "items-end" : "items-start"
                }`}
              >
                <h1 className="text-xs">{!fromYou && message.sender_id}</h1>
                <div
                  className={`w-fit px-4 py-1.5 shadow ${
                    fromYou
                      ? "bg-[#3738A4] ml-4 rounded-t-3xl rounded-bl-3xl"
                      : "bg-neutral-700 mr-4 rounded-tr-3xl rounded-b-3xl"
                  }`}
                >
                  <h1>{message.content}</h1>
                </div>
                <h1 className="text-xs">{fromYou && "You"}</h1>
              </span>
            </div>
          );
        })}
        <div ref={lastMessageRef} />
      </div>
      <form onSubmit={(e) => handleChat(e)}>
        <div className="flex gap-2">
          <input
            className="bg-[#1F1F44] w-[22rem] rounded border border-gray-500 p-2"
            type="text"
            name="message"
            id=""
            onChange={(e) => setChatMsg(e.target.value)}
          />
          <button
            className="flex flex-row justify-center items-center rounded px-2 bg-blue-900 hover:bg-blue-800"
            type="submit"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default App;
