import { Link } from "react-router-dom";

// URLs (minus trailing punctuation) and the phrase "contact page".
const pattern = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])|(contact page)/gi;

const linkClass = "font-medium text-accent underline underline-offset-2";

// Renders plain text with URLs and "contact page" turned into links.
const LinkedText = ({ text }: { text: string }) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const [whole, url] = match;
    parts.push(text.slice(last, match.index));
    parts.push(
      url ? (
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {url}
        </a>
      ) : (
        <Link key={match.index} to="/contact" className={linkClass}>
          {whole}
        </Link>
      ),
    );
    last = match.index + whole.length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
};

export default LinkedText;
