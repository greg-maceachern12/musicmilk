'use client';

export function AnimatedGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1419]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Orb 1 - Blue/Purple */}
        <div 
          className="absolute rounded-full blur-[140px] opacity-35"
          style={{
            width: '70vw',
            height: '70vw',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(99, 102, 241, 0.2) 40%, rgba(99, 102, 241, 0.08) 60%, transparent 80%)',
            top: '-20%',
            left: '-10%',
            animation: 'morph1 20s ease-in-out infinite',
          }}
        />
        
        {/* Orb 2 - Cyan/Blue */}
        <div 
          className="absolute rounded-full blur-[130px] opacity-30"
          style={{
            width: '65vw',
            height: '65vw',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0.18) 40%, rgba(56, 189, 248, 0.07) 60%, transparent 80%)',
            bottom: '-15%',
            right: '-10%',
            animation: 'morph2 25s ease-in-out infinite',
          }}
        />
        
        {/* Orb 3 - Purple/Pink */}
        <div 
          className="absolute rounded-full blur-[135px] opacity-28"
          style={{
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.16) 40%, rgba(168, 85, 247, 0.06) 60%, transparent 80%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'morph3 30s ease-in-out infinite',
          }}
        />
        
        {/* Orb 4 - Teal/Green */}
        <div 
          className="absolute rounded-full blur-[125px] opacity-25"
          style={{
            width: '55vw',
            height: '55vw',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.38) 0%, rgba(20, 184, 166, 0.15) 40%, rgba(20, 184, 166, 0.05) 60%, transparent 80%)',
            top: '20%',
            right: '20%',
            animation: 'morph4 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* Animated mesh overlay for extra depth */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)
          `,
          backgroundSize: '60px 60px',
          animation: 'meshMove 40s linear infinite',
        }}
      />
    </div>
  );
}
