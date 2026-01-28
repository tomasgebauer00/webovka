import { ImageResponse } from 'next/og';

// Rozměry ikonky
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generování
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%', // Tohle ořízne rohy do kruhu
        }}
      >
        {/* Masivní SVG Letadlo (Solid) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          style={{ transform: 'rotate(-45deg)', marginLeft: '2px', marginTop: '2px' }}
        >
           <path d="M22 2L11 13" />
           <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}