import React from 'react';

interface MascotProps {
  pose?: 
    | 'waving' 
    | 'highfive' 
    | 'crayon_book' 
    | 'reminder' 
    | 'thumbsup' 
    | 'clapping' 
    | 'pointing_idea' 
    | 'arms_crossed'
    | 'pointing' 
    | 'playing' 
    | 'learning' 
    | 'listening';
  className?: string;
  id?: string;
  grade?: 'R' | '1';
}

export default function MascotGirl({ pose = 'waving', className = 'w-16 h-16', id, grade = '1' }: MascotProps) {
  const isZola = grade === 'R';

  // Let's define the official color palette matching the beautiful mascot assets
  const skinColor = isZola ? '#A3684B' : '#FDBA74';      // Cocoa for Zola vs soft warm peach for Zoe
  const hairColor = isZola ? '#181310' : '#5C2D1F';      // Dark charcoal black for Zola vs rich warm brown chestnut for Zoe
  const dressColor = isZola ? '#2563EB' : '#7C3AED';     // Official blue denim for Zola vs overall purple for Zoe
  const shirtColor = isZola ? '#FACC15' : '#F472B6';     // Sunflower yellow for Zola vs pink under-shirt for Zoe
  const starColor = isZola ? '#F59E0B' : '#FBBF24';      // Orange yellow accent vs bright golden star
  const bowColor = isZola ? '#3B82F6' : '#C084FC';       // Blue goggles highlight vs lilac/purple bow
  const headbandColor = isZola ? '#EAB308' : '#EC4899';  // Goggles yellow strap vs pink headband
  const eyesColor = isZola ? '#1F1109' : '#1E1B4B';      // Rich deep warm brown vs sweet deep indigo eyes
  const backpackColor = isZola ? '#15803D' : '#EC4899';  // Forest green for Zola vs pink backpack for Zoe

  // Normalise legacy aliases to maintain full compatibility across sections
  let currentPose: string = pose;
  if (pose === 'pointing') currentPose = 'pointing_idea';
  if (pose === 'playing') currentPose = 'crayon_book';
  if (pose === 'learning') currentPose = 'crayon_book';
  if (pose === 'listening') currentPose = 'reminder';

  const renderEmblemOrStar = isZola ? (
    <g id="gear-emblem">
      {/* Overalls Pocket with Gear Emblem */}
      <path d="M 44 80 L 56 80 L 54 91 L 46 91 Z" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="0.8" />
      <g transform="translate(50, 85.5) scale(0.8)">
        <circle cx="0" cy="0" r="3.2" fill={shirtColor} />
        <rect x="-1" y="-5" width="2" height="10" rx="0.5" fill={shirtColor} />
        <rect x="-5" y="-1" width="10" height="2" rx="0.5" fill={shirtColor} />
        <g transform="rotate(45)">
          <rect x="-1" y="-5" width="2" height="10" rx="0.5" fill={shirtColor} />
          <rect x="-5" y="-1" width="10" height="2" rx="0.5" fill={shirtColor} />
        </g>
        <circle cx="0" cy="0" r="1.5" fill="#1D4ED8" />
      </g>
    </g>
  ) : (
    <g id="yellow-star">
      {/* Golden star emblem centered on the chest */}
      <polygon points="50,78 52,83 57,83 53,86 55,91 50,88 45,91 47,86 43,83 48,83" fill={starColor} />
    </g>
  );

  return (
    <svg
      id={id || `mascot-girl-${currentPose}`}
      viewBox="0 0 100 100"
      className={`${className} select-none filter drop-shadow-sm`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. BACKPACK (Visible behind shoulders for some poses) */}
      {(currentPose === 'arms_crossed' || currentPose === 'waving' || currentPose === 'reminder' || currentPose === 'thumbsup') && (
        <g id="backpack-bg">
          {/* Main green bag body peeking out */}
          <rect x="23" y="65" width="14" height="25" rx="4" fill={backpackColor} />
          <rect x="63" y="65" width="14" height="25" rx="4" fill={backpackColor} />
          {/* Straps around shoulder */}
          <path d="M 30 65 Q 26 50 34 50" stroke={backpackColor} strokeWidth="3" fill="none" />
          <path d="M 70 65 Q 74 50 66 50" stroke={backpackColor} strokeWidth="3" fill="none" />
        </g>
      )}

      {/* 2. BACKGROUND HAIR */}
      {isZola ? (
        <g id="curly-hair-buns">
          {/* Left curly bunny bundle */}
          <circle cx="23" cy="18" r="12" fill={hairColor} />
          <circle cx="15" cy="13" r="10" fill={hairColor} />
          <circle cx="28" cy="12" r="10" fill={hairColor} />
          <circle cx="13" cy="22" r="10" fill={hairColor} />
          <circle cx="22" cy="26" r="10" fill={hairColor} />

          {/* Right curly bunny bundle */}
          <circle cx="77" cy="18" r="12" fill={hairColor} />
          <circle cx="72" cy="12" r="10" fill={hairColor} />
          <circle cx="85" cy="13" r="10" fill={hairColor} />
          <circle cx="87" cy="22" r="10" fill={hairColor} />
          <circle cx="78" cy="26" r="10" fill={hairColor} />
          
          {/* Connection curls background base */}
          <path
            d="M 22 55 Q 10 38 18 24 Q 31 10 50 10 Q 69 10 82 24 Q 90 38 78 55 Q 86 68 81 80 Q 72 84 68 76 Q 50 82 32 76 Q 28 84 19 80 Q 14 68 22 55 Z"
            fill={hairColor}
          />
        </g>
      ) : (
        <g id="flowing-wavy-hair">
          {/* Flowing locks descending past the shoulders */}
          <path
            d="M 22 55 Q 10 38 15 24 Q 31 6 50 6 Q 69 6 85 24 Q 90 38 78 55 Q 89 68 83 90 Q 73 98 67 82 Q 50 88 33 82 Q 27 98 17 90 Q 11 68 22 55 Z"
            fill={hairColor}
          />
        </g>
      )}

      {/* 3. HEAD & NECK */}
      <rect x="46" y="52" width="8" height="12" fill={skinColor} rx="2" />
      <circle cx="50" cy="42" r="21" fill={skinColor} />

      {/* 4. MAIN DRESS & ARMS FOR DETAILED POSES */}
      
      {/* --- POSE: WAVING --- */}
      {currentPose === 'waving' && (
        <g id="body-waving">
          {/* Under yellow t-shirt and yellow sleeves */}
          <path d="M 30 75 Q 50 71 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          {/* Blue overalls dress */}
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {/* Denim straps */}
          <path d="M 37 76 L 41 76 L 43 100 L 35 100 Z" fill={dressColor} />
          <path d="M 59 76 L 63 76 L 65 100 L 57 100 Z" fill={dressColor} />
          {renderEmblemOrStar}
          
          {/* Left Arm relaxing (viewer's right) */}
          <path d="M 68 78 Q 78 84 75 96" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Right Arm waving beautifully (viewer's left) */}
          <path d="M 32 78 Q 16 68 15 50" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="47" r="4" fill={skinColor} />
          {/* Small finger curves */}
          <path d="M 12 47 Q 15 41 18 47" stroke={skinColor} strokeWidth="1.5" fill="none" />
        </g>
      )}

      {/* --- POSE: HIGHFIVE --- */}
      {currentPose === 'highfive' && (
        <g id="body-highfive">
          {/* Overalls layout */}
          <path d="M 30 75 Q 50 71 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}
          
          {/* High-five arm reaching left (viewer's left) */}
          <path d="M 32 78 Q 14 62 12 50" stroke={skinColor} strokeWidth="7.5" strokeLinecap="round" fill="none" />
          {/* Flat high five palm */}
          <path d="M 10 50 Q 8 44 14 44 Q 16 48 12 52" stroke={skinColor} strokeWidth="1.5" fill={skinColor} />
          
          {/* The other hand coming in from left border */}
          <path d="M -5 45 Q 3 45 6 48" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Energy sparkles */}
          <path d="M 8 40 L 10 36 M 12 43 L 16 41" stroke={starColor} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* --- POSE: CRAYON & BOOK --- */}
      {currentPose === 'crayon_book' && (
        <g id="body-crayon-book">
          <path d="M 30 75 L 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Right hand holding yellow crayon pointing up */}
          <path d="M 32 78 Q 20 74 18 64" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="61" r="3.5" fill={skinColor} />
          {/* The Yellow Crayon */}
          <rect x="16" y="48" width="4" height="10" rx="1" fill={shirtColor} stroke="#000000" strokeWidth="0.8" />
          <polygon points="16,48 18,43 20,48" fill={shirtColor} stroke="#000000" strokeWidth="0.8" />

          {/* Left arm clutching teal notebook on hips */}
          <path d="M 68 78 Q 78 82 76 92" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Teal book */}
          <rect x="70" y="80" width="18" height="15" rx="2.5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1" transform="rotate(-15 70 80)" />
          <polygon points="76,84 78,87 82,87 79,89 80,92 76,90 72,92 73,89 70,87 74,87" fill={shirtColor} transform="rotate(-15 70 80)" />
        </g>
      )}

      {/* --- POSE: REMINDER (FINGER WITH RIBBON) --- */}
      {currentPose === 'reminder' && (
        <g id="body-reminder">
          {/* Main overalls layout */}
          <path d="M 30 75 L 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Right Arm pointing up in alert position (viewer's left) */}
          <path d="M 32 78 Q 22 66 22 50" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Finger details with tied ribbon loop */}
          <circle cx="22" cy="46" r="3.5" fill={skinColor} />
          <path d="M 22 46 L 22 41" stroke={skinColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Cute ribbon tied around finger */}
          <circle cx="22" cy="44" r="1.5" fill="#EF4444" />
          <path d="M 18 44 Q 22 42 21 46" stroke="#EF4444" strokeWidth="1" fill="none" />
          <path d="M 26 44 Q 22 42 23 46" stroke="#EF4444" strokeWidth="1" fill="none" />

          {/* Golden/Yellow Exclamation bubble starburst in upper left */}
          <g transform="translate(10, 12)">
            <polygon points="12,4 15,8 20,6 18,11 22,14 17,16 18,21 13,18 10,22 8,17 3,18 6,13 2,10 7,8 6,3 11,6" fill={shirtColor} />
            <text x="12" y="16" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#991B1B" textAnchor="middle">!</text>
          </g>
        </g>
      )}

      {/* --- POSE: THUMBSUP --- */}
      {currentPose === 'thumbsup' && (
        <g id="body-thumbsup">
          <path d="M 30 75 Q 50 71 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Right Arm extending with thumbs up (viewer's left) */}
          <path d="M 32 78 Q 18 72 16 62" stroke={skinColor} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="59" r="4.5" fill={skinColor} />
          {/* Thumb sticking up */}
          <path d="M 15 59 L 15 53" stroke={skinColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="53" r="1.5" fill={skinColor} />
        </g>
      )}

      {/* --- POSE: CLAPPING --- */}
      {currentPose === 'clapping' && (
        <g id="body-clapping">
          <path d="M 30 75 L 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Both hands clapped together in front of overall star */}
          <path d="M 32 80 Q 50 84 50 80" stroke={skinColor} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M 68 80 Q 50 84 50 80" stroke={skinColor} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          
          <g fill={skinColor}>
            <circle cx="48" cy="80" r="3.5" />
            <circle cx="52" cy="80" r="3.5" />
          </g>

          {/* Little congratulatory clapping star sparkies */}
          <path d="M 45 72 L 47 74 M 55 72 L 53 74 M 50 71 L 50 73" stroke={shirtColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* --- POSE: POINTING IDEA (WITH LIGHTBULB) --- */}
      {currentPose === 'pointing_idea' && (
        <g id="body-pointing-idea">
          <path d="M 30 75 L 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Right hand pointing to the high right (viewer's left) */}
          <path d="M 32 78 Q 20 62 20 46" stroke={skinColor} strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="42" r="3.5" fill={skinColor} />
          <path d="M 20 42 L 20 37" stroke={skinColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Floating glowing lightbulb above pointer finger */}
          <g transform="translate(10, 16)">
            {/* Bulb glow circle background */}
            <circle cx="10" cy="10" r="12" fill={shirtColor} opacity="0.25" className="animate-pulse" />
            {/* Light bulb wire loops */}
            <circle cx="10" cy="10" r="6" fill={shirtColor} stroke="#B45309" strokeWidth="1" />
            <rect x="8" y="15" width="4" height="4" rx="1" fill="#94A3B8" />
            <line x1="10" y1="8" x2="10" y2="12" stroke="#FFF" strokeWidth="1.2" />
          </g>
        </g>
      )}

      {/* --- POSE: ARMS CROSSED --- */}
      {currentPose === 'arms_crossed' && (
        <g id="body-arms-crossed">
          <path d="M 30 75 L 70 75 L 72 100 L 28 100 Z" fill={shirtColor} />
          <path d="M 32 76 L 68 76 Q 72 100 68 100 L 32 100 Q 28 100 32 76 Z" fill={dressColor} />
          {renderEmblemOrStar}

          {/* Crossed Arms folded high (blue and yellow colors layered) */}
          <path d="M 28 82 Q 50 82 72 82" stroke={shirtColor} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 32 84 Q 50 86 68 84" stroke={dressColor} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          
          {/* Hands holding elbows tucked under */}
          <circle cx="31" cy="83" r="3" fill={skinColor} />
          <circle cx="69" cy="83" r="3" fill={skinColor} />
        </g>
      )}

      {/* 5. FOREGROUND HAIR DETAILS (Bangs & pretty curly face framing locks) */}
      <path
        d="M 28 40 Q 21 16 50 14 Q 79 16 72 40 Q 75 28 71 22 Q 50 26 29 22 Q 25 28 28 40 Z"
        fill={hairColor}
      />
      {/* Wave locks sweeping down gently near the eyes */}
      <path d="M 29 33 Q 39 39 50 33" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 50 33 Q 61 39 71 33" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* 6. COLOURED BAND OR GOGGLES (On Forehead) */}
      {isZola ? (
        <g id="goggles-band">
          {/* Yellow headband/strap */}
          <path
            d="M 30 30 Q 50 21 70 30"
            stroke={headbandColor}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* White Chassis frame for Goggles */}
          <rect x="33" y="19" width="34" height="12" rx="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="35" y="20.5" width="30" height="9" rx="3.5" fill="#FFFFFF" />
          {/* Sky/Blue lenses */}
          <rect x="37" y="21.5" width="11" height="7" rx="2.2" fill="#2563EB" />
          <rect x="52" y="21.5" width="11" height="7" rx="2.2" fill="#2563EB" />
          {/* Reflective high gleams */}
          <line x1="39" y1="23.5" x2="42" y2="26" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="54" y1="23.5" x2="57" y2="26" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ) : (
        <g id="headband-bow">
          {/* Pink headband */}
          <path
            d="M 30 30 Q 50 21 70 30"
            stroke={headbandColor}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Sweet purple/lilac bow tied on the side (upper right) */}
          <g transform="translate(62, 21) rotate(20)">
            {/* Center knot */}
            <circle cx="5" cy="5" r="2.5" fill={bowColor} />
            {/* Left wing */}
            <polygon points="5,5 -1,0 -1,10" fill={bowColor} stroke="#6B21A8" strokeWidth="0.8" />
            {/* Right wing */}
            <polygon points="5,5 11,0 11,10" fill={bowColor} stroke="#6B21A8" strokeWidth="0.8" />
            {/* Center gleam */}
            <circle cx="5" cy="5" r="1.2" fill={starColor} />
          </g>
        </g>
      )}

      {/* 7. EXPRESSIVE CUTE FACE DETAILS */}
      <g id="face-details">
        {/* Sweet flushing rosy pink cheeks */}
        <circle cx="36" cy="48" r="3" fill="#F87171" opacity="0.65" />
        <circle cx="64" cy="48" r="3" fill="#F87171" opacity="0.65" />

        {/* Shiny sparkling big eyes */}
        <circle cx="40" cy="41" r="3.7" fill={eyesColor} />
        <circle cx="60" cy="41" r="3.7" fill={eyesColor} />
        {/* Double high-contrast white reflection sparkles */}
        <circle cx="38.5" cy="39.5" r="1.4" fill="#FFFFFF" />
        <circle cx="41.3" cy="42" r="0.6" fill="#FFFFFF" />
        <circle cx="58.5" cy="39.5" r="1.4" fill="#FFFFFF" />
        <circle cx="61.3" cy="42" r="0.6" fill="#FFFFFF" />

        {/* Cute upturned nose */}
        <path d="M 48.5 45 Q 50 46.5 51.5 45" stroke="#451A03" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Custom happy animated mouths depending on the active state */}
        {currentPose === 'reminder' ? (
          // Inspired alert "O" shape mouth
          <circle cx="50" cy="50.5" r="2.5" fill="#991B1B" />
        ) : (
          // Sweet smiling laughing tongue mouth
          <g>
            <path d="M 44 48.5 Q 50 55.5 56 48.5" fill="#991B1B" stroke="#991B1B" strokeWidth="1" strokeLinecap="round" />
            <path d="M 46 50 Q 50 53.5 54 50 Z" fill="#EF4444" />
          </g>
        )}
      </g>
    </svg>
  );
}
