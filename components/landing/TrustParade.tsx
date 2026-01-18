"use client";

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations/FadeInView";

const testimonials = [
  {
    quote: "Helped me stay on top of ME701 even when I couldn't keep my eyes open during those 8 AM lectures. Just hit record and caught up later with perfect notes.",
    author: "Suraj",
    role: "IIT Bombay",
  },
  {
    quote: "Was juggling client work during a class where attendance was mandatory. Started recording, focused on my work, and still got comprehensive notes at the end.",
    author: "Aymaan",
    role: "IIT Bombay",
  },
];

export function TrustParade() {
  return (
    <section className="relative py-16 md:py-24 bg-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeInView className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
            Built by IITB students
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-2">
            <span className="text-stone-400">Early access for</span>{" "}
            <span className="text-teal-400">our batchmates</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-stone-400 max-w-2xl mx-auto px-4">
            We built this because we needed it ourselves. Now we're sharing it with fellow IITB students.
          </p>
        </FadeInView>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.author}>
              <div className="glass-card-dark rounded-2xl p-8 h-full">
                <div className="flex flex-col h-full">
                  <p className="text-stone-300 text-lg leading-relaxed mb-6 flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-stone-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
