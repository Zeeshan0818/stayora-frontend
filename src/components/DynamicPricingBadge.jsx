import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function DynamicPricingBadge() {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-1 rounded-full border border-gold-light bg-gold-light/30 px-2.5 py-1 text-[11px] font-semibold text-gold-dark"
      >
        <Sparkles size={12} />
        Dynamic pricing
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs leading-relaxed text-paper shadow-lift"
        >
          Price calculated based on availability and demand for your selected dates.
        </span>
      )}
    </span>
  );
}
