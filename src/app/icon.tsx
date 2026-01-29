import { ImageResponse } from 'next/og';

// Parametry ikony - velikost a typ
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Funkce, která "nakreslí" ikonu
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          // Nastavení černého kruhu
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%', // Dokonalý kruh
          padding: '4px', // Malý odstup, aby letadlo nebylo nalepené na kraji
        }}
      >
        {/* SVG kód pro MASIVNÍ BÍLÉ LETADLO */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white" // Bílá výplň
          width="100%" // Roztáhnout na maximum
          height="100%"
          style={{ transform: 'rotate(-45deg)' }} // Natočení nahoru
        >
          {/* Tento tvar je to plné, tlusté letadlo */}
          <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}