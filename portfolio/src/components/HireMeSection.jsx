// components/HireMeSection.jsx
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { CONTACT_ENDPOINT } from '../config';
import { socials } from '../data/socials';

const EMPTY_FORM = { name: '', email: '', message: '', website: '' };

const errorMessageFor = (status) =>
  status === 429
    ? `Too many messages today; please email me directly at ${socials.email}.`
    : `Sorry, something went wrong sending your message. Please try again later or email me at ${socials.email}.`;

export const HireMeSection = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        setStatus({ type: 'error', message: errorMessageFor(response.status) });
        return;
      }

      // Body is informational only; a non-JSON 2xx still counts as sent.
      await response.json().catch(() => null);
      setStatus({ type: 'success', message: 'Message sent successfully!' });
      setFormData(EMPTY_FORM);
    } catch {
      setStatus({ type: 'error', message: errorMessageFor(0) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="hire" className="pt-4 min-h-screen text-white scroll-mt-16">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[#1a1f2c]/50 backdrop-blur-sm rounded-xl p-8 shadow-lg shadow-black/5">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          
          <div
            role="status"
            aria-live="polite"
            className={status.message ? `p-4 mb-6 rounded ${status.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}` : ''}
          >
            {status.message}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block mb-2">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="contact-email" className="block mb-2">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="contact-message" className="block mb-2">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  className="w-full p-3 rounded-lg bg-[#1a1f2c] border border-gray-700 focus:border-blue-500 outline-none h-32"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
              
              {/* Honeypot: hidden from people, bots tend to fill it in. */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center justify-center space-x-2 w-full p-3 ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } rounded-lg transition`}
              >
                <Send size={18} aria-hidden="true" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          
          <div className="bg-[#1a1f2c] rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Find me in the Seattle Metro Area</h3>
            <div className="w-full h-[300px] rounded-lg overflow-hidden">
            <iframe
                title="Location map"
                src="https://maps.google.com/maps?q=Seattle,WA&z=10&output=embed"
                className="w-full h-full border-0"
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