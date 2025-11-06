'use client';

export function AnimatedGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer - more vibrant */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1220] via-[#1a2342] to-[#0f1625]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Orb 1 - Blue/Purple - more intense */}
        <div 
          className="absolute rounded-full blur-[100px] opacity-70"
          style={{
            width: '65vw',
            height: '65vw',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0.4) 40%, rgba(99, 102, 241, 0.15) 60%, transparent 80%)',
            top: '-20%',
            left: '-10%',
            animation: 'morph1 20s ease-in-out infinite',
          }}
        />
        
        {/* Orb 2 - Cyan/Blue - more intense */}
        <div 
          className="absolute rounded-full blur-[90px] opacity-65"
          style={{
            width: '55vw',
            height: '55vw',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.75) 0%, rgba(56, 189, 248, 0.4) 40%, rgba(56, 189, 248, 0.15) 60%, transparent 80%)',
            bottom: '-15%',
            right: '-10%',
            animation: 'morph2 25s ease-in-out infinite',
          }}
        />
        
        {/* Orb 3 - Purple/Pink - more intense */}
        <div 
          className="absolute rounded-full blur-[95px] opacity-60"
          style={{
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(168, 85, 247, 0.35) 40%, rgba(168, 85, 247, 0.15) 60%, transparent 80%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'morph3 30s ease-in-out infinite',
          }}
        />
        
        {/* Orb 4 - Teal/Green - more intense */}
        <div 
          className="absolute rounded-full blur-[85px] opacity-55"
          style={{
            width: '45vw',
            height: '45vw',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.65) 0%, rgba(20, 184, 166, 0.3) 40%, rgba(20, 184, 166, 0.12) 60%, transparent 80%)',
            top: '20%',
            right: '20%',
            animation: 'morph4 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* Animated mesh overlay for extra depth - more visible */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)
          `,
          backgroundSize: '60px 60px',
          animation: 'meshMove 40s linear infinite',
        }}
      />
    </div>
  );
}
