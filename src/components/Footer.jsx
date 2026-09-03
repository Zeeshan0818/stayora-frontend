import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-ink text-paper/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            Beautiful places, honest pricing, and a booking flow you can actually trust.
          </p>
        </div>
        <FooterCol title="Explore" links={['Search stays', 'Popular cities', 'Become a host']} />
        <FooterCol title="Support" links={['Help center', 'Cancellation policy', 'Contact us']} />
        <FooterCol title="Company" links={['About Stayora', 'Careers', 'Press']} />
      </div>
      <div className="border-t border-paper/10 py-5">
        <p className="container-page text-xs text-paper/40">
          © {new Date().getFullYear()} Stayora. Built for demonstration purposes.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="eyebrow !text-paper/50">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l} className="text-sm text-paper/70 hover:text-paper transition-colors cursor-default">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
