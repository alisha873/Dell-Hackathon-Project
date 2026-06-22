"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function OrganizerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your HackOS Organizer Copilot. Ask me about teams, registrations, or reviewer evaluations." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Calling the real backend endpoint for organizers:
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizer/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage, 
          hackathon_id: "d7271d63-79a3-49a2-84ea-7e38f88d248a" // Default active hackathon for demo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.answer || "I received a response, but it was empty." }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "There was an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50 group">
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-black text-white p-4 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] transition-all duration-500 font-label-md">Ask Copilot</span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              <h3 className="font-bold text-[16px]">Organizer Copilot</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-surface-container-lowest space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-[14px] ${
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-br-sm" 
                      : "bg-surface-variant text-on-surface rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-variant text-on-surface p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-outline-variant rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-outline-variant rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-outline-variant rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-outline-variant/20 bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-surface-bright border border-outline-variant rounded-xl px-3 text-[14px] outline-none focus:border-primary transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
