'use client';

import Script from 'next/script';

export default function BuyMeACoffeeButton() {
  return (
    <a
      href="https://www.buymeacoffee.com/sheiknaz"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support This Project"
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Support This Project"
        width={117}
        height={40}
        style={{ borderRadius: '5px' }}
      />
    </a>
  );
}
