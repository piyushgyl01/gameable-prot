import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { chatWithArchitect } from '../lib/gemini';

export default function Chat() {
  const { settings, profile, questArcs, sideQuests, chatMessages, sendChatMessage, addArchitectReply, resetChat } = useGame();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  const activeArcs = questArcs.filter(a => a.status === 'active');
  const activeSides = sideQuests.filter(q => q.status === 'active');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    await sendChatMessage(msg);

    try {
      const reply = await chatWithArchitect(settings.geminiKey, msg, {
        profile,
        activeArcs,
        activeSideQuests: activeSides,
        chatHistory: chatMessages.slice(-6),
      });
      await addArchitectReply(reply);
    } catch (err) {
      await addArchitectReply(`I encountered an error: ${err.message}`);
    }

    setSending(false);
  };

  const suggestions = ['I got promoted!', "I'm feeling burnt out", 'Adjust my health quests', "What should I focus on?"];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 2 }}>The Architect</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Talk about your goals, report progress, or ask for advice.</p>
        </div>
        {chatMessages.length > 0 && (
          <button className="btn btn-sm" onClick={resetChat}>Clear Chat</button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chatMessages.length === 0 && !sending && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <div className="animate-pop" style={{ fontSize: 40, marginBottom: 16 }}>🏛️</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                The Architect awaits. Ask about your journey, report a life update, or request quest adjustments.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    className={`suggestion-chip animate-slide-up stagger-${i + 1}`}
                    onClick={() => { setInput(s); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className="animate-slide-up" style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: 12,
                background: isUser ? 'var(--accent-dim)' : 'var(--bg-surface)',
                border: `1px solid ${isUser ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                borderLeft: !isUser ? '3px solid var(--accent)' : undefined,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
              }}>
                {!isUser && (
                  <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    The Architect
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
            }}>
              <div className="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Talk to The Architect..."
          disabled={sending}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={sending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
