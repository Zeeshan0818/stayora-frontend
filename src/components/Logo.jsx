export default function Logo({ className = '', dark = false }) {
  const stroke = dark ? '#FBF6EC' : '#0F1E1A';
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M18 46V30C18 21 24 15 32 15C40 15 46 21 46 30V46"
          stroke="#C79A4B"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="13" y1="46" x2="51" y2="46" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-xl italic tracking-tight ${dark ? 'text-paper' : 'text-ink'}`}>
        Stayora
      </span>
    </span>
  );
}
