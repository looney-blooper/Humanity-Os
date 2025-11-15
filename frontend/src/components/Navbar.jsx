import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-[60px] w-full px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 border-b border-white/10 flex items-center text-white">
      <div className="w-full flex items-center justify-between">
        
        {/* Logo */}
        <h1 className="text-xl font-semibold">Humanity OS</h1>

        {/* Desktop Navlinks */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/dashboard">Home</a>
          <a href="/carepage">Self Care</a>
          <a href="/carbonfootprint">Carbon Footprint</a>
          <a href="/watermap">Water Map</a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm font-medium text-white">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#community">Community</a>
          <a href="#contact">Contact</a>
        </div>
      )}
    </div>
  );
};

export default Navbar;
