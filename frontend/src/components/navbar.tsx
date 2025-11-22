import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./styles.css";

//
// User type
// ----------
// Represents a single user with ID and name.
//
type User = {
  id: string;
  name: string;
};

//
// NavbarProps
// ------------
// Props expected by Navbar:
// - users: list of available users to switch between
// - initialUserId: currently selected user ID (optional)
// - onUserChange: callback when user switches
//
type NavbarProps = {
  users: User[];
  initialUserId: string | null;
  onUserChange?: (user: User) => void;
};

//
// Navbar Component
// ----------------
// Displays the top navigation bar with site links, greeting, avatar, and
// a user dropdown menu for switching between users.
//
export default function Navbar({
  users,
  initialUserId = null,
  onUserChange,
}: NavbarProps) {
  // Current active user state
  const [currentUser, setCurrentUser] = useState<User | null>(
    () => users.find((u) => u.id === initialUserId) ?? null
  );

  // Dropdown menu open/closed state
  const [menuOpen, setMenuOpen] = useState(false);

  // Ref for the avatar button (used for dropdown positioning)
  const avatarBtnRef = useRef<HTMLButtonElement | null>(null);

  // Optional color mapping for avatars by username
  const avatarColors: Record<string, string> = {
    Alice: "bg-pink-100 text-pink-500",
    Jane: "bg-indigo-100 text-indigo-800",
    Bob: "bg-cyan-100 text-cyan-800",
  };

  // Dropdown coordinates and layout state
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Should dropdown open above the avatar button?
  const [openAbove, setOpenAbove] = useState(false);


  //
  // Notify parent whenever the current user changes
  //
  useEffect(() => {
    onUserChange && currentUser && onUserChange(currentUser);
  }, [currentUser, onUserChange]);

  //
  // Compute dropdown position dynamically
  //
  useEffect(() => {
    if (!menuOpen || !avatarBtnRef.current) {
      setCoords(null);
      return;
    }
    const btn = avatarBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom;
    const estimatedMenuHeight = 260;

    // Determine if menu should open above or below
    const shouldOpenAbove =
      spaceBelow < estimatedMenuHeight && rect.top > spaceBelow;
    setOpenAbove(Boolean(shouldOpenAbove));

    // Calculate top and left coordinates
    const top =
      window.scrollY + (shouldOpenAbove ? rect.top - 12 : rect.bottom + 12);
    const left = window.scrollX + rect.right - 192;
    setCoords({ top, left, width: 192 });

    // Update on resize or scroll
    const handleR = () => {
      const r = btn.getBoundingClientRect();
      const vh = window.innerHeight;
      const sb = vh - r.bottom;
      const shouldAbove = sb < estimatedMenuHeight && r.top > sb;
      setOpenAbove(Boolean(shouldAbove));
      setCoords({
        top: window.scrollY + (shouldAbove ? r.top - 12 : r.bottom + 12),
        left: window.scrollX + r.right - 192,
        width: 192,
      });
    };
    window.addEventListener("resize", handleR);
    window.addEventListener("scroll", handleR, true);
    return () => {
      window.removeEventListener("resize", handleR);
      window.removeEventListener("scroll", handleR, true);
    };
  }, [menuOpen]);

  //
  // Close dropdown if clicking outside of it
  //
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const btn = avatarBtnRef.current;
      const el = document.getElementById("navbar-user-menu-portal");
      if (!btn) return;
      if (btn.contains(e.target as Node)) return;
      if (el && el.contains(e.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  //
  // Switch active user
  //
  const switchToUser = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u) {
      setCurrentUser(u);
      onUserChange?.(u);
      setMenuOpen(false);
    }
  };

  //
  // Render avatar circle with first letter and optional color
  //
  function renderAvatar(name: string) {
    const letter = name[0].toUpperCase();
    const colors = avatarColors[name] ?? "bg-gray-200 text-gray-700";
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${colors} font-medium`}
      >
        {letter}
      </div>
    );
  }

  // Main navigation links
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Classes", href: "/classes" },
    { label: "Trainers", href: "/trainers" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href="/"
          className="logo text-xl text-indigo-700 font-semibold tracking-wide"
        >
          Fithub
        </a>

        {/* Navigation Links */}
        <div className="flex space-x-8 ml-6">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-gray-700 hover:text-black transition"
            >
              {n.label}
            </a>
          ))}
        </div>
        
        {/* User Greeting / Avatar */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Hi <span className="font-medium">{currentUser.name}</span>
              </span>

              <button
                ref={avatarBtnRef}
                onClick={() => setMenuOpen((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="avatar w-10 h-10 rounded-full border overflow-hidden inline-flex items-center justify-center bg-white p-0"
                title="Open user menu"
              >
                {renderAvatar(currentUser.name)}
              </button>
            </div>
          ) : (
            <a href="/login" className="text-sm px-3 py-1 rounded-md">
              Log in
            </a>
          )}
        </div>
      </div>

      {/* Dropdown rendered in portal */}
      {menuOpen &&
        coords &&
        createPortal(
          <div
            id="navbar-user-menu-portal"
            role="menu"
            aria-label="User menu"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
          >
            <div
              className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
              style={{ borderRadius: 8 }}
            >
              <div className="py-2">
                <div className="px-3 text-xs text-gray-500 font-semibold">
                  Switch user
                </div>

                <div className="mt-1 max-h-48 overflow-auto">
                  {users.map((u) => {
                    const active = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchToUser(u.id)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${
                          active ? "bg-gray-100" : ""
                        }`}
                        role="menuitem"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden text-sm bg-white">
                          <span className="text-xs">
                            {renderAvatar(u.name)}
                          </span>
                        </div>
                        <div className="text-sm">{u.name}</div>
                        {active && (
                          <div className="ml-auto text-xs text-indigo-600">
                            Active
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </nav>
  );
}
