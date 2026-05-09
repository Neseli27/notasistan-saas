import { Bell, ChevronDown, Search } from "lucide-react";

interface HeaderProps {
  displayName: string;
  roleLabel: string;
  searchPlaceholder: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr-TR") || "NA";
}

export function Header({ displayName, roleLabel, searchPlaceholder }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="searchBox">
        <Search size={21} />
        <input placeholder={searchPlaceholder} />
      </div>

      <div className="profileArea">
        <div className="notification">
          <Bell size={22} />
          <span>3</span>
        </div>
        <div className="avatar avatarPhoto">{initials(displayName)}</div>
        <div>
          <strong>{displayName}</strong>
          <p>{roleLabel}</p>
        </div>
        <ChevronDown size={18} />
      </div>
    </header>
  );
}
