import React from 'react';
import { ExternalLink } from 'lucide-react';
import { certs } from '../data/certs';

export const CertificationsSection = () => {
  return (
    <section id="certifications" className="pt-4 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[#1a1f2c]/50 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-black/5">
          <h2 className="text-3xl font-bold mb-8">Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map((cert, index) => (
              <div key={index} className="bg-[#1a1f2c] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Badge Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={cert.badgeUrl}
                      alt={cert.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  
                  {/* Certificate Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{cert.title}</h3>
                    <p className="text-gray-400 mb-2">{cert.issuer}</p>
                    <p className="text-gray-400 text-sm mb-4">{cert.issueDate}</p>
                    
                    {/* Skills/Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cert.skills?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-[#2a2f3c] rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Credly Link */}
                    {cert.credlyUrl && (
                      <a
                        href={cert.credlyUrl}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={16} />
                        View Badge
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;