import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-transparent border-t border-border/40 py-2 relative h-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <Link href="/desk_synthese">✨</Link>
            </h3>
            <p className="text-sm">
              Open Source Political Intelligence.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.ngisearch.eu/view/Main/"><Image src="/logos/ngi-logo.svg" alt="NGI Logo" width={80} height={80} /></a>
              <a href="https://europa.eu/"><Image src="/logos/eu-logo.png" alt="EU Logo" width={80} height={100} /></a>
            </div>
            <p className="text-sm p-2 pl-0 text-gray-500">Supported by NGI Search</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/blog/about" className="text-sm hover:underline">About Us</Link></li>
              <li><Link href="https://docs.open-politics.org/" className="text-sm hover:underline">User Guide</Link></li>
              <li><Link href="https://docs.open-politics.org/development" className="text-sm hover:underline">Documentation</Link></li>
              <li><Link href="https://github.com/JimVincentW/open-politics" className="text-sm hover:underline">GitHub</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <a href="mailto:engage@open-politics.org" className="text-sm hover:underline">engage@open-politics.org</a>
            <div className="mt-4">
              <Link href="https://discord.gg/vnaarBdV" className="text-sm hover:underline">Discord</Link>
            </div>
            <div className="mt-4">
              <Link href="/blog/about/imprint" className="text-sm hover:underline">Imprint</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Open Politics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
