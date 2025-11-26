import { GatyaSection } from '@/components/gatya/GatyaSection';

export default function Home() {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-background to-violet-900/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <GatyaSection />
      </div>
    </div>
  );
}
