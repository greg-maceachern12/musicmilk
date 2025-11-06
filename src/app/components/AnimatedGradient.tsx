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
          className="absolute rounded-full blur-[120px] opacity-30"
          style={{
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            animation: 'morph1 20s ease-in-out infinite',
          }}
        />
        
        {/* Orb 2 - Cyan/Blue */}
        <div 
          className="absolute rounded-full blur-[100px] opacity-25"
          style={{
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0.1) 50%, transparent 70%)',
            bottom: '-15%',
            right: '-10%',
            animation: 'morph2 25s ease-in-out infinite',
          }}
        />
        
        {/* Orb 3 - Purple/Pink */}
        <div 
          className="absolute rounded-full blur-[110px] opacity-20"
          style={{
            width: '45vw',
            height: '45vw',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'morph3 30s ease-in-out infinite',
          }}
        />
        
        {/* Orb 4 - Teal/Green */}
        <div 
          className="absolute rounded-full blur-[90px] opacity-20"
          style={{
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 70%)',
            top: '20%',
            right: '20%',
            animation: 'morph4 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* Animated mesh overlay for extra depth */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
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
