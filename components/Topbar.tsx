"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon as NotificationIcon } from "@hugeicons/core-free-icons";
import { Button } from "./ui/button";

// HugeIcons SVG icons (free version) for breadcrumbs
const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.77V10.5C22 9.28 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17.99V14.99"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <div className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="w-full px-6">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 transition-colors ease"
                  style={{ transitionDuration: "200ms" }}
                >
                  <HomeIcon className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors ease"
                      style={{ transitionDuration: "200ms" }}
                    >
                      {crumb.label}
                    </Link>
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
              <HugeiconsIcon icon={NotificationIcon} size={20} color="currentColor" strokeWidth={1.5} />
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

