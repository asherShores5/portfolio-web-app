// components/ProjectsSection.js
import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { projects } from '../data/projects';

export const ProjectsSection = () => {
 return (
   <section id="projects" className="pt-4 min-h-screen">
     <div className="max-w-6xl mx-auto p-6">
     <div className="bg-[#1a1f2c]/50 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-black/5">
       <h2 className="text-3xl font-bold mb-8">Projects</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {projects.map((project, index) => (
           <div key={index} className="bg-[#1a1f2c] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition">
             <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
             <p className="text-gray-400 mb-4">{project.description}</p>
             
             <div className="flex flex-wrap gap-2 mb-4">
               {project.tech.map((tech, i) => (
                 <span key={i} className="px-2 py-1 bg-[#2a2f3c] rounded-full text-sm">
                   {tech}
                 </span>
               ))}
             </div>

             <div className="flex space-x-4">
               {project.liveUrl && (
                 <a 
                   href={project.liveUrl}
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <ExternalLink size={16} />
                   Live Demo
                 </a>
               )}
               {project.github && (
                 <a 
                   href={project.github}
                   className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <Github size={16} />
                   Code
                 </a>
               )}
             </div>
           </div>
         ))}
       </div>
       </div>
    </div>
   </section>
 );
};