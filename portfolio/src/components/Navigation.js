import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const NAV_HEIGHT = 64; // h-16 fixed header

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const target = document.querySelector(id);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
        setIsOpen(false);
      };

    const links = [
      { href: "#intro", label: "About" },
      { href: "#projects", label: "Projects" },
      { href: "#skills", label: "Skills" },
      { href: "#certifications", label: "Certifications" },
      { href: "#connect", label: "Connect" },
      { href: "#hire", label: "Contact" }
    ];
  
    return (
      <nav className="fixed w-full bg-[#0a0d14]/95 border-b border-gray-800 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold"><a href="#intro">Asher Shores</a></h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {links.map(link => (
                <a key={link.href} href={link.href}
                   onClick={(e) => scrollToSection(e, link.href)}
                   className="hover:text-blue-400 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
  
            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
  
          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden flex flex-col space-y-2 pb-4">
              {links.map(link => (
                <a key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="py-1 hover:text-blue-400 transition-colors">
               {link.label}
             </a>
              ))}
            </div>
          )}
        </div>
      </nav>
    );
  };