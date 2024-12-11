import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      };
    
    const links = [
      { href: "#intro", label: "About\t" },
      { href: "#projects", label: "Projects\t" },
      { href: "#skills", label: "Skills\t" },
      { href: "#certifications", label: "Certifications\t" },
      { href: "#connect", label: "Connect\t" },
      { href: "#hire", label: "Hire Me\t" }
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
            <div className="md:hidden">
              {links.map(link => (
                <a key={link.href} 
                href={link.href} 
                onClick={(e) => scrollToSection(e, link.href)}
                className="hover:text-blue-400 transition-colors">
               {link.label}
             </a>
              ))}
            </div>
          )}
        </div>
      </nav>
    );
  };