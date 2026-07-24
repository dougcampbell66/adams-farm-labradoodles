type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

export default function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <div className="bg-navy py-16 px-6 border-b border-white/12">
      <div className="max-w-[1160px] mx-auto">
        <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-coral mb-3">
          {eyebrow}
        </span>
        <h1 className="font-heading font-bold text-[clamp(2rem,4vw,2.6rem)] leading-[1.15] text-cream mb-4">
          {title}
        </h1>
        {intro && (
          <p className="text-[1.05rem] max-w-[620px] text-cream/75 leading-[1.65]">
            {intro}
          </p>
        )}
      </div>
    </div>
  );
}
