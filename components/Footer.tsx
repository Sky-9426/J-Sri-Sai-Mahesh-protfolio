export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-terminal-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="font-mono text-xs text-terminal-grey">
          <span className="glow-green">©</span> 2025 Jidugu Sri Sai Mahesh
        </div>
        <div className="font-mono text-xs text-terminal-grey">
          ECE · Embedded Systems · Deep Learning
        </div>
        <div className="font-mono text-xs text-terminal-grey">
          <span className="text-terminal-grey2">[</span>
          <span className="glow-green">system online</span>
          <span className="text-terminal-grey2">]</span>
        </div>
      </div>
    </footer>
  )
}
