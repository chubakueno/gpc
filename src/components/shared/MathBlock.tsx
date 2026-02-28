import { BlockMath, InlineMath } from "react-katex";

interface MathBlockProps {
  math: string;
  inline?: boolean;
  className?: string;
}

export function MathBlock({ math, inline = false, className = "" }: MathBlockProps) {
  try {
    if (inline) {
      return (
        <span className={className}>
          <InlineMath math={math} />
        </span>
      );
    }
    return (
      <div className={`overflow-x-auto ${className}`}>
        <BlockMath math={math} />
      </div>
    );
  } catch {
    return (
      <code className={`text-red-400 text-sm ${className}`}>[Math error: {math}]</code>
    );
  }
}
