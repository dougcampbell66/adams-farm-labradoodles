type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

export default function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <div className="bg-cream py-16 px-6 border-b border-warm-border">
      <div className="max-w-[1080px] mx-auto">
        <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-coral mb-3">
          {eyebrow}
        </span>
        <h1 className="font-heading font-semibold text-[2.4rem] leading-[1.15] text-navy mb-4">
          {title}
        </h1>
        {intro && (
          <p className="text-[1.05rem] max-w-[620px] text-[#4A4A4A] leading-relaxed">
            {intro}
          </p>
        )}
      </div>
    </div>
  );
}
