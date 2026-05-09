import { Bell, ChevronDown, Search } from "lucide-react";

export function Header() {
  return (
    <header className="topbar">
      <div className="searchBox">
        <Search size={21} />
        <input placeholder="Ara... (müşteri, randevu, işlem notu)" />
      </div>

      <div className="profileArea">
        <div className="notification">
          <Bell size={22} />
          <span>3</span>
        </div>
        <div className="avatar avatarPhoto">MY</div>
        <div>
          <strong>Murat Yılmaz</strong>
          <p>Yönetici</p>
        </div>
        <ChevronDown size={18} />
      </div>
    </header>
  );
}
