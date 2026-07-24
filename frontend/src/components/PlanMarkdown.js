import React from 'react';

// Renders inline **bold** segments within a line of text.
function renderInline(text, key) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={`${key}-b${i}`} className="font-semibold text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <React.Fragment key={`${key}-t${i}`}>{part}</React.Fragment>;
    });
}

const isHeading = (l) => /^#{1,6}\s/.test(l) || /^\*\*[^*]+\*\*:?$/.test(l);
const isNumbered = (l) => /^\d+[.)]\s/.test(l);
const isBullet = (l) => /^[-*+]\s/.test(l);

const stripHeading = (l) =>
    l.replace(/^#{1,6}\s/, '').replace(/^\*\*/, '').replace(/\*\*:?$/, '').replace(/:$/, '');

/**
 * Lightweight renderer for the subset of Markdown the AI planner returns:
 * headings, numbered lists, bullet lists, paragraphs, and inline bold.
 */
export default function PlanMarkdown({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) {
            i += 1;
            continue;
        }

        if (isHeading(line)) {
            blocks.push(
                <h3 key={`h${i}`} className="text-base font-bold text-glow-300 mt-6 first:mt-0 mb-2">
                    {stripHeading(line)}
                </h3>
            );
            i += 1;
            continue;
        }

        if (isNumbered(line)) {
            const start = i;
            const items = [];
            while (i < lines.length && isNumbered(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+[.)]\s/, ''));
                i += 1;
            }
            blocks.push(
                <ol key={`ol${start}`} className="list-decimal pl-5 space-y-2 my-3 marker:text-glow-300 marker:font-semibold">
                    {items.map((item, n) => (
                        <li key={n} className="text-slate-300 leading-relaxed pl-1">
                            {renderInline(item, `ol${start}-${n}`)}
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        if (isBullet(line)) {
            const start = i;
            const items = [];
            while (i < lines.length && isBullet(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*+]\s/, ''));
                i += 1;
            }
            blocks.push(
                <ul key={`ul${start}`} className="list-disc pl-5 space-y-2 my-3 marker:text-glow-500">
                    {items.map((item, n) => (
                        <li key={n} className="text-slate-300 leading-relaxed pl-1">
                            {renderInline(item, `ul${start}-${n}`)}
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        blocks.push(
            <p key={`p${i}`} className="text-slate-300 leading-relaxed my-3">
                {renderInline(line, `p${i}`)}
            </p>
        );
        i += 1;
    }

    return <div>{blocks}</div>;
}
