import { useState } from 'react';
import { Page } from '../types';

interface ContactPageProps {
  navigate: (page: Page) => void;
}

export default function ContactPage({ navigate }: ContactPageProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const inputClass = "w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white resize-none";
  const labelClass = "block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5";

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-black text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Reach Out</p>
          <h1 className="font-display font-black text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Get in Touch
          </h1>
          <p className="text-white/50 mt-2 max-w-md">We typically respond within 1 business day.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display font-bold text-xl uppercase mb-6"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Contact Info</h2>
              <div className="space-y-5">
                {[
                  { icon: '📧', label: 'Email', value: 'hello@rovyn.com' },
                  { icon: '📞', label: 'Phone', value: '+63 (02) 8888 9999' },
                  { icon: '🕗', label: 'Hours', value: 'Mon–Fri, 9am–6pm PHT' },
                  { icon: '📍', label: 'Address', value: '12F BGC Tower, Taguig City, Metro Manila' },
                ].map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="w-10 h-10 bg-brand/15 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-black/40 mb-0.5">{c.label}</p>
                      <p className="text-sm font-semibold text-black">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-base uppercase mb-4 text-black/40"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Follow Us</h3>
              <div className="flex gap-3">
                {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map((s) => (
                  <a key={s} href="#" aria-label={s}
                    className="w-10 h-10 border border-black/15 rounded-xl flex items-center justify-center text-xs font-bold uppercase text-black/50 hover:border-brand hover:text-brand transition-colors">
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ shortcuts */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-black/8">
              <h3 className="font-display font-bold text-base uppercase mb-4"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Common Questions</h3>
              <div className="space-y-2">
                {[
                  'How do I track my order?',
                  "What's your return policy?",
                  'Do you ship outside the Philippines?',
                  'How do I find my pack size?',
                ].map((q) => (
                  <button key={q}
                    className="w-full text-left text-sm text-black/60 hover:text-brand transition-colors py-2 border-b border-black/5 last:border-0 flex items-center justify-between group">
                    {q}
                    <span className="text-black/20 group-hover:text-brand transition-colors ml-2">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-stone-50 rounded-2xl border border-black/8">
                <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-2xl mb-6">✓</div>
                <h3 className="font-display font-black text-2xl uppercase mb-2"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Message sent!</h3>
                <p className="text-black/50 mb-8 max-w-sm">
                  We have received your message and will get back to you within 1 business day.
                </p>
                <button onClick={() => navigate('home')}
                  className="bg-brand text-black font-bold px-8 py-3 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Back to Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-stone-50 rounded-2xl p-8 border border-black/8 space-y-5">
                <h2 className="font-display font-bold text-xl uppercase mb-2"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Send a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                      placeholder="Maria Santos"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      placeholder="maria@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={inputClass}
                    placeholder="Order question, product inquiry, etc."
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputClass}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    required
                  />
                </div>

                <button type="submit"
                  className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark active:scale-95 transition-all uppercase tracking-wide text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
