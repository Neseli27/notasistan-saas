import { aiSuggestions } from "@/lib/mock-data";
import { ChevronRight, Gift, Leaf, Sparkles, UserRound } from "lucide-react";

const iconMap = [UserRound, Gift, Leaf, Sparkles];

export function AiSuggestions() {
  return (
    <section className="panel aiPanel">
      <div className="panelHeader">
        <h2><Sparkles size={20} /> AI Önerileri</h2>
        <a href="#">Tümünü Gör →</a>
      </div>
      <div className="suggestionList">
        {aiSuggestions.map((suggestion, index) => {
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
