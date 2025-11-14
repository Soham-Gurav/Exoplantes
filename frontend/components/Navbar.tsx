"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-lg bg-black/40 border-b border-white/10 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <h1 className="text-2xl font-bold tracking-widest">EXOPLANETS</h1>

        <div className="flex gap-8 text-lg">
          <Link href="/" className="hover:text-cyan-300 transition">Model</Link>
          <Link href="/about" className="hover:text-cyan-300 transition">About</Link>
        </div>

      </div>
    </nav>
  );
}
