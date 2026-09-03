const STEPS = ['Reserve', 'Guests', 'Payment', 'Confirmed'];

export default function BookingSteps({ current }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2 sm:gap-4">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= current ? 'bg-ink text-paper' : 'bg-ink/10 text-muted'
            }`}
          >
            {i + 1}
          </span>
          <span className={`hidden text-sm font-medium sm:inline ${i <= current ? 'text-ink' : 'text-muted'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="h-px w-6 bg-line sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}
