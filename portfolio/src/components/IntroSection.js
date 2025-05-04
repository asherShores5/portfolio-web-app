import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export const IntroSection = () => {
    return(
    <section id="intro" className="pt-4 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-20 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-4">Hi, I'm Asher Shores</h2>
          <p className="text-gray-400 text-lg mb-6">
            Cloud DevOps Engineer with experience in AWS architecture, CI/CD pipeline optimization, and full-stack development.
            Contributing to cloud-native solutions and deployment process automation within collaborative team environments
          </p>
          <div className="flex space-x-4">
            <a href="https://github.com/asherShores5" 
               className="p-2 hover:text-blue-400 transition-colors">
              <Github size={24} />
            </a>
            <a href="https://www.linkedin.com/in/asher-shores/"
               className="p-2 hover:text-blue-400 transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="mailto:asher.shores5@gmail.com"
               className="p-2 hover:text-blue-400 transition-colors">
              <Mail size={24} />
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-blue-400">
          <img 
            src="/images/profile.jpg" 
            alt="Profile"
            className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
    );
};