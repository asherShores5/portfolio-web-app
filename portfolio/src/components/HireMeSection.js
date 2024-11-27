// components/HireMeSection.js
import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const HireMeSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic
  };

  return (
    <section id="hire" className="pt-8 min-h-screen text-white">
      <div className="max-w-6xl mx-auto p-6">
      <div className="bg-[#1a1f2c]/50 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-black/5">
        <h2 className="text-3xl font-bold mb-8">Let's Work Together!</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block mb-2">Message</label>
              <textarea
                className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none h-32"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>
            
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-full p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <Send size={18} />
              <span>Send Message</span>
            </button>
          </form>
          
          <div className="bg-[#1a1f2c] rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Find me in the Phoenix Metro Area</h3>
            <div className="w-full h-[300px] rounded-lg overflow-hidden">
            <iframe
                title="Location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d211122.65546394564!2d-112.24155!3d33.580595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDM0JzQ5LjgiTiAxMTLCsDE0JzE1LjUiVw!5e0!3m2!1sen!2sus!4v1"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};