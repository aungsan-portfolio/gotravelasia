/**
 * @file TripPlannerChat.tsx
 * @description Floating AI trip planner chat powered by Gemini 2.0 Flash.
 * Opens as a panel from the bottom-right corner.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sparkles,
    Send,
    X,
    Loader2,
    MapPin,
    Plane,
    DollarSign,
    Compass,
} from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/lib/gemini";

// ── Display message type ──
interface DisplayMessage {
    role: "user" | "assistant";
    content: string;
}

// ── Suggested prompts ──
const SUGGESTED_PROMPTS = [
    { icon: <Plane className="w-4 h-4" />, text: "Cheapest flights Yangon → Bangkok" },
    { icon: <MapPin className="w-4 h-4" />, text: "3-day Chiang Mai itinerary" },
    { icon: <DollarSign className="w-4 h-4" />, text: "Thailand trip under $500" },
    { icon: <Compass className="w-4 h-4" />, text: "Best time to visit Phuket" },
];

interface TripPlannerChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TripPlannerChat({ isOpen, onClose }: TripPlannerChatProps) {
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [geminiHistory, setGeminiHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Auto-scroll on new messages ──
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // ── Focus input when opened ──
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ── Send message ──
    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;
        setInput("");

        // Add user message
        const userMsg: DisplayMessage = { role: "user", content: messageText };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Call Gemini
            const response = await sendChatMessage(geminiHistory, messageText);

            // Update history for multi-turn
            setGeminiHistory((prev) => [
                ...prev,
                { role: "user", parts: [{ text: messageText }] },
                { role: "model", parts: [{ text: response }] },
            ]);

            // Add assistant message
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: response },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again! 🙏",
                },
            ]);
        }

        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[600px] sm:h-[620px] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#581c87] to-[#7c3aed] text-white">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">GoTravel AI</h3>
                        <p className="text-white/70 text-xs">Your Thailand trip planner</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* ── Messages ── */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    /* ── Empty State ── */
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-[#581c87]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Plan your dream trip! ✈️
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Ask me anything about Thailand travel
                        </p>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt.text}
                                    onClick={() => handleSend(prompt.text)}
                                    className="flex items-center gap-2.5 px-4 py-3 text-left text-sm text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-[#581c87] rounded-xl border border-gray-100 hover:border-purple-200 transition-all"
                                >
                                    <span className="text-gray-400">{prompt.icon}</span>
                                    {prompt.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ── Chat Messages ── */
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                                            ? "bg-[#581c87] text-white rounded-br-md"
                                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Planning...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* ── Input ── */}
            <div className="border-t border-gray-200 p-3">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about Thailand travel..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#581c87] focus:border-transparent min-h-[44px] max-h-[120px]"
                        style={{
                            height: "auto",
                            minHeight: "44px",
                        }}
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="h-11 w-11 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white flex-shrink-0 disabled:opacity-40"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                    Powered by Gemini AI • Prices are estimates
                </p>
            </div>
        </div>
    );
}
