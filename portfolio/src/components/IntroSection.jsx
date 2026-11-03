import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { socials } from '../data/socials';

export const IntroSection = () => {
    return(
    <section id="intro" className="pt-4 min-h-screen flex items-center scroll-mt-16">
      <div className="max-w-6xl mx-auto px-20 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-4">Hi, I'm Asher Shores</h2>
          <p className="text-gray-400 text-lg mb-6">
            Cloud Support Engineer at AWS (Amazon Dedicated Cloud) in Seattle. Experienced in AWS architecture,
            CI/CD pipeline optimization, and full-stack development, now supporting AWS's most secure cloud regions.
          </p>
          <div className="flex space-x-4">
            <a href={socials.github}
               aria-label="GitHub profile"
               className="p-2 hover:text-blue-400 transition-colors">
              <Github size={24} aria-hidden="true" />
            </a>
            <a href={socials.linkedin}
               aria-label="LinkedIn profile"
               className="p-2 hover:text-blue-400 transition-colors">
              <Linkedin size={24} aria-hidden="true" />
            </a>
            <a href={`mailto:${socials.email}`}
               aria-label="Email Asher"
               className="p-2 hover:text-blue-400 transition-colors">
              <Mail size={24} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-blue-400">
          <img 
            src="/images/profile.jpg" 
            alt="Asher Shores"
            className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
    );
};