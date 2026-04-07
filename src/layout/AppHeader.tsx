"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

const AppHeader: React.FC = () => {
  const [canGoBack, setCanGoBack] = useState(false);

  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleBackClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const isHomePage =
      pathname === "/" || pathname === "/dashboard" || pathname === "/home";
    setCanGoBack(!isHomePage);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[99999] flex h-14 w-full items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-[#121212] sm:h-16 sm:px-6">
      {/* ── Left: hamburger (+ optional back) ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Hamburger / sidebar toggle */}
        <button
          onClick={handleToggle}
          aria-label="Toggle sidebar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75H20.25a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" fill="currentColor" />
          </svg>
        </button>

        {/* Back button — only shows when not on home pages */}
        {canGoBack && (
          <button
            onClick={handleBackClick}
            aria-label="Go Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Center: Search bar ── */}
      <div className="flex-1 min-w-0 px-3 sm:px-6">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative w-full max-w-xl">
            {/* Search icon */}
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <svg className="fill-gray-400 dark:fill-gray-500" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or type command..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-16 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-700 dark:focus:bg-white/[0.06]"
            />
            {/* ⌘K badge */}
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <kbd className="inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-white/[0.06] dark:text-gray-400">
                <span>⌘</span><span>K</span>
              </kbd>
            </span>
          </div>
        </form>
      </div>

      {/* ── Right: theme toggle + user ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <ThemeToggleButton />
        <UserDropdown />
      </div>
    </header>
  );
};

export default AppHeader;
