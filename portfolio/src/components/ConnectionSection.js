// components/ConnectSection.js
import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { socials } from '../data/socials';

export const ConnectSection = () => {
  return (
    <section id="connect" className="pt-40 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
      <div className="bg-[#1a1f2c]/50 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-black/5">
        <h2 className="text-3xl font-bold mb-8">Let's Connect</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <p className="text-lg text-gray-400">
              I'm always interested in hearing about new projects and opportunities.
              Feel free to reach out through any of these platforms:
            </p>
            
            <div className="flex flex-col space-y-4">
              <a href={socials.github} 
                 className="flex items-center space-x-4 p-4 bg-[#1a1f2c] rounded-lg hover:bg-[#2a2f3c] transition">
                <Github size={24} />
                <span>Follow my open source work</span>
              </a>
              
              <a href={socials.linkedin}
                 className="flex items-center space-x-4 p-4 bg-[#1a1f2c] rounded-lg hover:bg-[#2a2f3c] transition">
                <Linkedin size={24} />
                <span>Connect on LinkedIn</span>
              </a>
              
              {/* <a href={socials.twitter}
                 className="flex items-center space-x-4 p-4 bg-[#1a1f2c] rounded-lg hover:bg-[#2a2f3c] transition">
                <Twitter size={24} />
                <span>Follow me on Twitter</span>
              </a> */}
              
              <a href={`mailto:${socials.email}`}
                 className="flex items-center space-x-4 p-4 bg-[#1a1f2c] rounded-lg hover:bg-[#2a2f3c] transition">
                <Mail size={24} />
                <span>Send me an email</span>
              </a>
            </div>
          </div>
          
          <div className="bg-[#1a1f2c] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
            <p className="text-gray-400">
              Currently working as a DevOps and Cloud Engineer in defense with expertise in cloud and modern web technologies.
              Open to freelance projects and full-time opportunities.
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};