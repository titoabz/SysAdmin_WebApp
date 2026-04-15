"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Map", icon: "🗺️" },
    { href: "/itineraries", label: "Itineraries", icon: "📋" },
    { href: "/about", label: "About", icon: "ℹ️" },
  ];

  return (
    <>
      <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto h-16 px-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 text-xl md:text-4xl font-bold tracking-tight leading-none hover:text-green-200 transition truncate">
            Butuan Tourism Map
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex items-center leading-none py-1 hover:text-green-200 transition font-medium">
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-10 bg-white text-green-800 px-4 rounded-lg inline-flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  {user.email?.split('@')[0]}
                  <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <Link href="/profile/visits" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-100">My Visits</Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-green-700 hover:bg-green-50 font-medium flex items-center gap-2">
                          <span>👑</span> Admin Dashboard
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100"></div>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="h-10 bg-white text-green-800 px-4 rounded-lg inline-flex items-center justify-center leading-none hover:bg-gray-100 transition">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Header Actions */}
          <div className="md:hidden flex items-center gap-2">
            {!user && (
              <Link
                href="/auth/login"
                className="h-9 bg-white text-green-800 px-3 rounded-lg inline-flex items-center justify-center text-sm font-medium leading-none hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 w-10 inline-flex items-center justify-center hover:bg-green-700 rounded-lg transition"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col animate-slide-in">
            {/* Menu Header */}
            <div className="bg-green-800 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-green-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info (Mobile) */}
            {user && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-800 font-bold text-lg">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user.email}</p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-gray-700 hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Auth Links (Mobile) */}
            <div className="p-4 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <span>👤</span> My Profile
                  </Link>
                  <Link
                    href="/profile/visits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <span>📍</span> My Visits
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-green-700 hover:bg-green-50 rounded-lg font-medium border-t border-b border-gray-100 my-2"
                    >
                      <span>👑</span> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-green-700 text-white px-4 py-3 rounded-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
