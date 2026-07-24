import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative min-h-[600px] md:min-h-screen px-6 text-center bg-navy overflow-hidden flex flex-col items-center justify-center py-16">

      {/* Circular photo badge — middle-right, partially bleeding off edge */}
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 400,
          height: 400,
          right: "-80px",
          borderRadius: "50%",
          border: "7px solid #F2C14E",
          boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/hero/founder-hero-portrait.jpg"
          alt="Happy family with their Adams Farm Labradoodle puppy"
          fill
          className="object-cover"
          style={{ objectPosition: "50% 20%" }}
          sizes="400px"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-center gap-[10px] mb-[22px]">
          <div className="w-3 h-3 rounded-full bg-calm-blue" />
          <div className="w-3 h-3 rounded-full bg-focus-green" />
          <div className="w-3 h-3 rounded-full bg-excite-yellow" />
          <div className="w-3 h-3 rounded-full bg-feelings-red" />
        </div>
        <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-excite-yellow mb-[14px]">
          ALAA Gold Paw Accredited · Greensboro, NC
        </span>
        <h1 className="font-heading font-semibold text-[2.6rem] leading-[1.15] text-cream mb-[18px]">
          Puppies with a Purpose.
        </h1>
        <p className="text-[1.05rem] max-w-[560px] mx-auto mb-7 text-cream opacity-85">
          We raise Australian Labradoodle puppies with purpose and intention.
        </p>
        <Link
          href="/puppies"
          className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
        >
          Meet the Puppies
        </Link>
      </div>
    </div>
  );
}
