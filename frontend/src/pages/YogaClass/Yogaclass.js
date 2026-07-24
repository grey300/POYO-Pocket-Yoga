import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

const CARDS = [
  { id: 1, imageSrc: '/images/tree.svg', title: 'Tree', sanskrit: 'Vrksasana', blurb: 'Balance & focus', tracked: true },
  { id: 2, imageSrc: '/images/chair.svg', title: 'Chair', sanskrit: 'Utkatasana', blurb: 'Legs & core strength', tracked: true },
  { id: 3, imageSrc: '/images/cobra.svg', title: 'Cobra', sanskrit: 'Bhujangasana', blurb: 'Spine & chest opener', tracked: true },
  { id: 4, imageSrc: '/images/warrior2.svg', title: 'Warrior II', sanskrit: 'Virabhadrasana II', blurb: 'Stance & stamina', tracked: true },
  { id: 5, imageSrc: '/images/dog.svg', title: 'Dog', sanskrit: 'Adho Mukha Svanasana', blurb: 'Full-body stretch', tracked: true },
  { id: 6, imageSrc: '/images/shoulderstand.svg', title: 'Shoulderstand', sanskrit: 'Salamba Sarvangasana', blurb: 'Inversion & calm', tracked: true },
  { id: 7, imageSrc: '/images/triangle.svg', title: 'Triangle', sanskrit: 'Trikonasana', blurb: 'Side-body opener', tracked: false },
  { id: 8, imageSrc: '/images/childpose.svg', title: "Child's Pose", sanskrit: 'Balasana', blurb: 'Rest & reset', tracked: false },
];

export default function Yogaclass() {
  return (
    <div className="min-h-screen bg-ink-950">
      <NavBar />

      <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-28 pb-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-widest text-glow-400 font-semibold">Pose Library</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Yoga <span className="text-gradient">Class</span>
          </h1>
          <p className="mt-3 text-slate-400 leading-relaxed">
            Learn the technique behind each pose. Ones marked <span className="text-glow-300 font-medium">Live</span> can
            be tracked in real time during a session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card) => (
            <Link key={card.id} to={`/yoga-pose/${card.id}`} className="group">
              <div className="panel panel-hover h-full flex flex-col overflow-hidden">
                <div className="relative bg-ink-800 aspect-[4/3] flex items-center justify-center p-5">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  {card.tracked && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-glow-500/20 text-glow-200 border border-glow-400/30 px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-glow-300" /> Live
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-white">{card.title}</h2>
                  <p className="text-xs text-glow-400/80 italic">{card.sanskrit}</p>
                  <p className="text-sm text-slate-400 mt-2 flex-1">{card.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-glow-300 group-hover:gap-2 transition-all">
                    View details
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
