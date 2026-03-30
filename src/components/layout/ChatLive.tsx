import { MessageCircle } from "lucide-react";

export function ChatLive() {
  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#f8e1da] rounded-full shadow-[0px_4px_20px_0px_rgba(138,109,93,0.1)] flex items-center justify-center hover:bg-[#f0cfc4] transition-colors z-50">
      <MessageCircle className="w-6 h-6 text-[#c2a571]" />
    </button>
  );
}
