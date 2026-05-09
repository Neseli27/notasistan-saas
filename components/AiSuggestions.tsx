import type { AiSuggestion } from "@/types/domain";
import { Car, ChevronRight, ClipboardList, Gift, Leaf, MessageSquareText, Sparkles, UserRound, Wrench } from "lucide-react";

interface AiSuggestionsProps {
  suggestions: AiSuggestion[];
  sector?: string;
}

function getIconMap(sector?: string) {
  if (sector === "auto") return [Car, Wrench, UserRound, ClipboardList];
  if (sector === "clinic") return [UserRound, ClipboardList, MessageSquareText, Sparkles];
  return [UserRound, Gift, Leaf, Sparkles];
}

export function AiSuggestions({ suggestions, sector }: AiSuggestionsProps) {
  const iconMap = getIconMap(sector);

  return (
    <section className="panel aiPanel">
      <div className="panelHeader">
        <h2><Sparkles size={20} /> AI Önerileri</h2>
        <a href="#">Tümünü Gör →</a>
      </div>
      <div className="suggestionList">
        {suggestions.map((suggestion, index) => {
          const Icon = iconMap[index] ?? Sparkles;
          return (
            <button className="suggestionItem" key={suggestion.id}>
              <span className={`suggestionIcon ${suggestion.tone}`}>
                <Icon size={20} />
              </span>
              <span>
                <b>{suggestion.title}</b>
                <small>{suggestion.description}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
