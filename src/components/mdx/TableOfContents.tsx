interface Heading {
  level: number;
  text: string;
  id: string;
}

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8"
    >
      <p className="text-sm font-semibold text-gray-700 mb-2">目次</p>
      <ol className="space-y-1">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}
          >
            <a
              href={`#${h.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
