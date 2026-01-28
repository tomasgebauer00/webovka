import { ImageResponse } from 'next/og';

// Nastavení velikosti a typu
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Samotné generování ikony
export default function Icon() {
  return new ImageResponse(
    (
      // Toto je JSX, které kreslí ikonu
      <div
        style={{
          fontSize: 24, // Velikost letadla uvnitř
          background: 'black', // Černé pozadí
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white', // Bílá barva letadla
          borderRadius: '50%', // TOTO JE KLÍČOVÉ - dělá to dokonalý kruh
        }}
      >
        {/* SVG kód pro ikonu letadla */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: 'rotate(-45deg)' }} // Natočení letadla nahoru
        >
          <path d="M22 2 11 13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </div>
    ),
    // Možnosti ImageResponse
    {
      ...size,
    }
  );
}