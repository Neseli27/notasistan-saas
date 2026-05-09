"use client";

import { CheckCircle2, Copy, MessageSquareText, X } from "lucide-react";
import { useState } from "react";

interface StatusMessageBannerProps {
  message: string;
  customerName?: string;
  onClose: () => void;
}

export function StatusMessageBanner({ message, customerName, onClose }: StatusMessageBannerProps) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      console.error("Durum mesajı kopyalanamadı:", error);
      window.alert(message);
    }
  }

  return (
    <div className="statusMessageBanner">
      <div className="statusMessageIcon">
        <MessageSquareText size={20} />
      </div>
      <div className="statusMessageContent">
        <strong>{customerName ? `${customerName} için bilgilendirme metni hazır` : "Bilgilendirme metni hazır"}</strong>
        <p>{message}</p>
      </div>
      <div className="statusMessageActions">
        <button type="button" onClick={copyMessage}>
          {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          {copied ? "Kopyalandı" : "Metni Kopyala"}
        </button>
        <button type="button" className="statusMessageClose" onClick={onClose} title="Kapat">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
