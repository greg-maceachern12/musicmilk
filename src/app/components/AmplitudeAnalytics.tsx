'use client';

import Script from "next/script";

export default function AmplitudeAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://cdn.amplitude.com/script/f0e77ea0c5ad241d6508e1c7a0c354e9.js"
        onLoad={() => {
          // @ts-expect-error - window.amplitude is added by the script
          if (window.amplitude && window.sessionReplay) {
            // @ts-expect-error - window.amplitude types not available
            window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
            // @ts-expect-error - window.amplitude types not available
            window.amplitude.init('f0e77ea0c5ad241d6508e1c7a0c354e9', {
              "fetchRemoteConfig": true,
              "autocapture": {
                "attribution": true,
                "fileDownloads": true,
                "formInteractions": true,
                "pageViews": true,
                "sessions": true,
                "elementInteractions": true,
                "networkTracking": true,
                "webVitals": true,
                "frustrationInteractions": true
              }
            });
          }
        }}
      />
    </>
  );
}
