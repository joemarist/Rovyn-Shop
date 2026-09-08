import { Page } from '../types';
import logoMark from '../imports/2.png';

interface AboutPageProps {
  navigate: (page: Page) => void;
}

export default function AboutPage({ navigate }: AboutPageProps) {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1604428803896-c1e5151d4128?w=1400&h=800&fit=crop&auto=format"
          alt="Mountain forest landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Faint watermark */}
        <div className="absolute top-10 right-10 opacity-8 pointer-events-none hidden lg:block">
          <img src={logoMark} alt="" className="w-56" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Our Story</p>
          <h1 className="font-display font-black text-white uppercase leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 1 }}>
            Built for<br />
            <span className="text-brand">Your Everyday.</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-1 bg-brand mb-8"></div>
              <p className="text-black/80 text-lg leading-relaxed mb-6">
                Rovyn started on a ridgeline somewhere north of the cloud line, when a group of weekend trekkers realized that the gear they owned wasn't built for the lives they actually led.
              </p>
              <p className="text-black/60 leading-relaxed mb-6">
                Too heavy for the daily carry. Too fragile for the weekend trail. Too expensive to replace when it gave out after a year. They wanted something different: gear engineered with the same precision as technical alpine equipment, but designed for the rhythms of everyday life.
              </p>
              <p className="text-black/60 leading-relaxed">
                That's the Rovyn mandate. Every product we make is stress-tested in the field before it ever reaches your hands. No compromises. No shortcuts. Just gear you can count on — whether you're clocking summit miles or cutting through the city.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1537430802614-118bf14be50c?w=800&h=1000&fit=crop&auto=format"
                  alt="Hiker looking at mountain vista"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-brand rounded-2xl p-6 shadow-xl">
                <p className="font-display font-black text-4xl text-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2019</p>
                <p className="text-black/70 text-sm font-semibold">Founded on the trail</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mountain divider */}
      <div className="overflow-hidden leading-none bg-white">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
          <path d="M0,48 L0,38 L120,20 L200,32 L320,8 L400,22 L510,4 L580,18 L640,2 L720,20 L800,6 L900,28 L1000,10 L1100,26 L1220,8 L1340,22 L1440,14 L1440,48 Z" fill="#f5f5f4"/>
        </svg>
      </div>

      {/* Values */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-black text-black uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              What We Stand For
            </h2>
            <div className="w-16 h-1 bg-brand mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '⛰️',
                title: 'Field-Tested',
                body: 'Every product earns its place in the lineup by surviving real conditions — wet weather, loaded packs, thousands of trail kilometers — before it ships to you.',
              },
              {
                icon: '🔩',
                title: 'Built to Last',
                body: "We build for longevity, not planned obsolescence. Rovyn gear is designed to be repaired, not replaced. Because the most sustainable product is the one you never have to rebuy.",
              },
              {
                icon: '🎒',
                title: 'Everyday Ready',
                body: 'Technical performance for the trail, clean enough for the commute. We don\'t think you should need two bags — so we built one that does both.',
              },
              {
                icon: '🌿',
                title: 'Responsibly Made',
                body: 'We source materials from certified sustainable suppliers and manufacture in fair-wage facilities. The trail is worth protecting.',
              },
              {
                icon: '🤝',
                title: 'Community First',
                body: "Rovyn grew out of a crew of people who showed up for each other on the mountain. That ethic informs everything we do — from how we make gear to how we handle returns.",
              },
              {
                icon: '📍',
                title: 'Proudly Filipino',
                body: "Born in the Philippines, built for its mountains and its people. We design for the terrain you actually live in — typhoon season and all.",
              },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-black/8 hover:border-brand/30 transition-colors">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-lg uppercase mb-2"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{v.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '2019', label: 'Founded' },
              { value: '50K+', label: 'Packs in the Field' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '30-Day', label: 'Return Guarantee' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display font-black text-brand"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                  {s.value}
                </p>
                <p className="text-white/50 text-sm mt-1 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-black text-black uppercase mb-4"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Ready to gear up?
          </h2>
          <p className="text-black/50 mb-8">
            Find your perfect pack, boot, or layer. Built for wherever life takes you next.
          </p>
          <button onClick={() => navigate('shop')}
            className="bg-brand text-black font-bold px-10 py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
            Shop All Gear
          </button>
        </div>
      </section>
    </div>
  );
}
