import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "🐾 Hello! I'm your PetCare Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = [
    { text: "📅 Book an appointment", target: '/clinics' },
    { text: "🛍️ Shop for medication", target: '/mart' },
    { text: "🤝 Adopt a pet", target: '/adoption' },
    { text: "🆘 Report lost pet", target: '/lost-found' },
  ];

  const responses = {
    appointment: "You can book an appointment by visiting our Clinics page! Just select a clinic and choose a convenient time slot.",
    clinics: "You can find a list of vet clinics and pet hospitals on our Clinics page. We have verified providers across the city.",
    mart: "Looking for pet supplies? Our Mart has everything from health-grade medication to premium pet food.",
    adoption: "Adopting a pet is a wonderful decision! Check our Adoption portal to see pets waiting for their forever homes.",
    lost: "If you've lost your pet, please post an alert in our 'Lost & Found' section immediately so the community can help.",
    sos: "In case of a medical emergency, use the SOS button on our home page to broadcast an alert to nearby ambulances and hospitals.",
    hello: "Hi there! I'm here to help you with anything related to pet care. What's on your mind?",
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulated Bot Response
    setTimeout(() => {
      let botResponse = "I'm not exactly sure about that, but I can help you find vets, shop for pets, or book appointments!";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('appoint')) botResponse = responses.appointment;
      else if (lowerText.includes('clinic') || lowerText.includes('hospital')) botResponse = responses.clinics;
      else if (lowerText.includes('shop') || lowerText.includes('mart') || lowerText.includes('med')) botResponse = responses.mart;
      else if (lowerText.includes('adopt')) botResponse = responses.adoption;
      else if (lowerText.includes('lost') || lowerText.includes('found')) botResponse = responses.lost;
      else if (lowerText.includes('sos') || lowerText.includes('emergency')) botResponse = responses.sos;
      else if (lowerText.includes('hi') || lowerText.includes('hello')) botResponse = responses.hello;

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion.text);
    // Optionally navigate after a brief delay if needed
    // setTimeout(() => navigate(suggestion.target), 3000); 
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-outfit">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-rose-500 rotate-90' : 'bg-blue-600 hover:shadow-blue-500/50'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed sm:absolute bottom-20 sm:bottom-20 right-4 left-4 sm:left-auto sm:right-0 sm:w-[320px] h-[400px] sm:h-[450px] max-h-[80vh] bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 sm:p-4 text-white shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl backdrop-blur-sm">🐕</div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">PetCare Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-80">Online & Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50/50 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm font-bold shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions Layer */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex flex-wrap gap-1.5 sm:gap-2 items-center justify-center overflow-y-auto max-h-[30vh] sm:max-h-none">
            <p className="w-full text-center text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 sm:mb-2">Quick Assistance</p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 border border-blue-100 shadow-blue-100/50 flex-1 sm:flex-none"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
