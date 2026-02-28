import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "cpp", className = "" }: CodeBlockProps) {
  return (
    <div className={`rounded-xl overflow-hidden border border-[var(--color-border)] ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-[#12141f] border-b border-[var(--color-border)]">
        <span className="w-3 h-3 rounded-full bg-[#f87171]" />
        <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
        <span className="w-3 h-3 rounded-full bg-[#34d399]" />
        <span className="ml-2 text-xs text-[var(--color-muted)] font-mono">{language}</span>
      </div>
      <Highlight code={code.trim()} language={language} theme={themes.vsDark}>
        {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${cls} text-sm overflow-x-auto p-4 m-0 leading-relaxed`}
            style={{ ...style, background: "#0d1117", fontFamily: "var(--font-mono)" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="inline-block w-8 text-right mr-4 text-[var(--color-muted)] select-none text-xs">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
