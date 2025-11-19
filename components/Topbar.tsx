"use client";

import { ChevronRight, Home } from "lucide-react";

// HugeIcons-style Bell icon (free version)
const BellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.0001 8C18.0001 6.4087 17.368 4.88258 16.2428 3.75736C15.1176 2.63214 13.5915 2 12.0001 2C10.4088 2 8.8827 2.63214 7.75748 3.75736C6.63226 4.88258 6.00012 6.4087 6.00012 8C6.00012 15 3.00012 17 3.00012 17H21.0001C21.0001 17 18.0001 15 18.0001 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12.0001 21.9965C11.6499 21.9965 11.3057 21.9044 11.0021 21.7295C10.6985 21.5547 10.4462 21.3031 10.2704 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
import { Button } from "./ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  notificationCount?: number;
  userAvatar?: string;
  userName?: string;
}

export default function Topbar({
  breadcrumbs = [{ label: "Dashboard" }],
  onPrimaryAction,
  primaryActionLabel = "New Action",
  notificationCount = 0,
  userAvatar,
  userName = "User",
}: TopbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a
                  href="/"
                  className="text-gray-500 hover:text-gray-700 transition-colors ease"
                  style={{ transitionDuration: "200ms" }}
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </a>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors ease"
                      style={{ transitionDuration: "200ms" }}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Right side: Notifications, Avatar, Primary Button */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ease button-squircle"
              style={{ transitionDuration: "200ms" }}
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <button
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors ease button-squircle"
              style={{ transitionDuration: "200ms" }}
              aria-label="User menu"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Primary Button */}
            {onPrimaryAction && (
              <Button
                onClick={onPrimaryAction}
                variant="default"
                className="button-squircle"
              >
                {primaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

