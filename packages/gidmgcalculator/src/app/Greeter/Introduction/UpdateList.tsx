import { Update } from "@/services";

type UpdateListProps = {
  className?: string;
  updates: Update[];
};

export const UpdateList = ({ className, updates }: UpdateListProps) => {
  return (
    <div className={className}>
      {updates.map(({ date, patch, content }, i) => (
        <div key={i}>
          <p>
            <span className="text-heading font-semibold">v{patch}</span>{" "}
            <span className="text-light-hint">| {date}</span>
          </p>
          <ul className="mt-1 space-y-1">
            {content.map((line, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: `- ${parseContent(line)}` }} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const typeToCls: Record<string, string> = {
  e: "text-primary-1",
  u: "text-bonus",
  f: "text-danger-2",
};

function parseContent(content: string) {
  return content.replace(/\{[a-zA-Z0-9ã _'"-]+\}#\[[euf]\]/g, (match) => {
    const [bodyPart, typePart = ""] = match.split("#");
    const body = bodyPart.slice(1, -1);
    const type = typePart?.slice(1, -1);
    return `<span class="${typeToCls[type] || ""}">${body}</span>`;
  });
}
