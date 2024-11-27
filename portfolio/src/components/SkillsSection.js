
// components/SkillsSection.js
import React from 'react';
import { skills } from '../data/skills';

export const SkillsSection = () => {
 return (
   <section id="skills" className="pt-4 min-h-screen">
     <div className="max-w-6xl mx-auto p-6">
       <h2 className="text-3xl font-bold mb-8">Skills & Technologies</h2>
       
       <div className="grid md:grid-cols-3 gap-8">
         {Object.entries(skills).map(([category, items]) => (
           <div key={category} className="bg-[#1a1f2c] p-6 rounded-lg">
             <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
             <div className="flex flex-wrap gap-2">
               {items.map(skill => (
                 <span key={skill} className="px-3 py-1 bg-[#2a2f3c] rounded-full text-sm">
                   {skill}
                 </span>
               ))}
             </div>
           </div>
         ))}
       </div>
     </div>
   </section>
 );
};