import React, { useEffect } from 'react';

const AD_CLIENT = 'ca-pub-8865921274070980'; // Your AdSense publisher ID
const AD_SLOT = '1234567890'; // TODO: Replace with your real AdSense ad slot ID

const AdBanner = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inject AdSense script if not already present
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.setAttribute('data-ad-client', AD_CLIENT);
        document.body.appendChild(script);
      }
      // (Re)initialize ads
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', minHeight: 90 }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdBanner; 