'use client'

import { useEffect, useState } from 'react'

interface Contributor {
  login: string
  html_url: string
  contributions: number
}

export default function ContributorsSection() {
  const [contributors, setContributors] = useState<Contributor[]>([])

  useEffect(() => {
    fetch('https://api.github.com/repos/francocorreasosa/ute-visualizer/contributors')
      .then(res => res.ok ? res.json() : [])
      .catch(() => [])
      .then(setContributors)
  }, [])

  if (contributors.length === 0) return null

  return (
    <div className="mt-4 p-6 w-full max-w-content bg-[#0c0e14] border border-[rgba(255,255,255,0.04)] rounded-[10px]">
      <p className="font-mono text-[10px] text-text-dim leading-[1.7]">
        <span className="font-bold text-[11px] uppercase tracking-widest">Contributors</span>
        <br />
        <br />
        {contributors.map((c, i) => (
          <span key={c.login}>
            <a
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              @{c.login}
            </a>
            {i < contributors.length - 1 && (
              <span className="text-text-dim mx-2">·</span>
            )}
          </span>
        ))}
      </p>
    </div>
  )
}
