"use client";

import Image from "next/image";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations/FadeInView";

const team = [
  {
    name: "Prasan",
    linkedin: "https://www.linkedin.com/in/prasandas/",
    photo: "/team/prasan.png",
  },
  {
    name: "Suraj",
    linkedin: "https://www.linkedin.com/in/surajprasad7/",
    photo: "/team/suraj.png",
  },
  {
    name: "Aymaan",
    linkedin: "https://www.linkedin.com/in/aymaanshahzad23/",
    photo: "/team/aymaan.png",
  },
  {
    name: "Rishul",
    linkedin: "https://www.linkedin.com/in/rishulnayak/",
    photo: "/team/rishul.png",
  },
];

export function Team() {
  return (
    <section id="team" className="relative py-16 md:py-20 bg-stone-900 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <FadeInView className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
            Built by IITB students
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 px-2">
            <span className="text-stone-400">Meet the</span>{" "}
            <span className="text-teal-400">team</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto px-4">
            Have questions or feedback? Connect with us directly.
          </p>
        </FadeInView>

        {/* Team Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((member) => (
            <StaggerItem key={member.name}>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-stone-800/50 backdrop-blur-sm rounded-xl p-5 border border-stone-700/50 hover:border-teal-500/50 hover:bg-stone-800/70 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Photo */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 ring-2 ring-stone-700 group-hover:ring-teal-500/50 transition-all">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Name */}
                  <p className="font-semibold text-white mb-1">{member.name}</p>
                  {/* LinkedIn Icon */}
                  <div className="flex items-center gap-1 text-stone-400 group-hover:text-teal-400 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-xs">Connect</span>
                  </div>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
