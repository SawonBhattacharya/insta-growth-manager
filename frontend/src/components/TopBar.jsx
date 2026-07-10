import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/App";

export default function TopBar({ active }) {
  const { user, logout } = useAuth();
  return (
    <header className="border-b-2 border-[#0A0A0A] bg-[#F4F4F0]" data-testid="topbar">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group" data-testid="topbar-logo">
          <div className="w-8 h-8 bg-[#FF3B00] border-2 border-[#0A0A0A] flex items-center justify-center">
            <div className="w-2 h-2 bg-white"></div>
          </div>
          <div>
            <div className="font-display font-black text-xl leading-none">PULSE</div>
            <div className="overline text-[#8A8A8A] leading-none mt-0.5">growth.intelligence</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {user && (
            <Link to="/dashboard" className={`overline hover:text-[#FF3B00] ${active==='dash'?'text-[#FF3B00]':''}`} data-testid="nav-dashboard">Dashboard</Link>
          )}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="overline hover:text-[#FF3B00]">Docs</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {user.picture && <img src={user.picture} alt="" className="w-8 h-8 border-2 border-[#0A0A0A]" />}
                <div className="text-sm font-semibold">{user.name?.split(" ")[0]}</div>
              </div>
              <button onClick={logout} className="btn-secondary !py-2 !px-3 text-xs" data-testid="logout-button">Logout</button>
            </>
          ) : (
            <button
              onClick={() => {
                // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
                const redirectUrl = window.location.origin + "/dashboard";
                window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
              }}
              className="btn-primary !py-2 !px-4 text-xs"
              data-testid="topbar-signin"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
