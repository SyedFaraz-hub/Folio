import { Avatar, Logo } from "@/components/ui";

/** Left panel of the sign-in screen: product pitch over a dotted dark ground. */
export function LoginHero() {
  return (
    <section className="dots-dark flex flex-[1_1_440px] flex-col justify-between gap-12 overflow-hidden rounded-panel bg-foreground p-[clamp(28px,5vw,64px)] text-[#f4f4f6]">
      <div className="flex items-center gap-2.5">
        <Logo size={30} />
        <span className="text-[17px] font-semibold">Folio</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex max-w-[520px] flex-col gap-4">
          <h1 className="m-0 text-[clamp(38px,4.4vw,56px)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance">
            Write it once. <span className="text-brand-tint">Share it</span> with the people who
            need it.
          </h1>
          <p className="m-0 text-base leading-[1.55] text-[#b4b5be]">
            A lightweight editor for shared team work: rich text, file import, and owner-controlled
            sharing.
          </p>
        </div>

        <div
          aria-hidden
          className="flex max-w-[400px] flex-col gap-3 rounded-[14px] border border-[#2a2a31] bg-[#1a1a1f] p-4 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Q4 onboarding plan</span>
            <span className="flex">
              {(
                [
                  ["MO", "brand"],
                  ["DR", "shared"],
                  ["PN", "success"],
                ] as const
              ).map(([initials, tone], i) => (
                <Avatar
                  key={initials}
                  initials={initials}
                  tone={tone}
                  size="xs"
                  className={
                    i
                      ? "-ml-[5px] text-[9px] shadow-[0_0_0_2px_#1a1a1f]"
                      : "text-[9px] shadow-[0_0_0_2px_#1a1a1f]"
                  }
                />
              ))}
            </span>
          </div>
          <span className="h-[5px] w-[92%] rounded-[3px] bg-[#33333b]" />
          <span className="h-[5px] w-[78%] rounded-[3px] bg-[#33333b]" />
          <span className="flex items-center">
            <span className="h-[5px] w-[46%] rounded-[3px] bg-[#33333b]" />
            <span className="ml-[3px] h-3.5 w-0.5 bg-shared" />
            <span className="-mt-4 ml-0.5 rounded-[4px_4px_4px_0] bg-shared px-[5px] py-px text-[10px] font-semibold text-[#2b1a02]">
              Daniel
            </span>
          </span>
        </div>
      </div>

      <span className="font-mono text-xs text-[#9a9ba6]">DEMO BUILD · SEEDED ACCOUNTS</span>
    </section>
  );
}
