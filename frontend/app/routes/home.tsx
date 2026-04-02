import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { BoothTable, BLOCKS, boothsByBlock } from "~/components/booth-table"

function useDarkMode() {
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("kemoket-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored ? stored === "dark" : prefersDark
    document.documentElement.classList.toggle("dark", shouldBeDark)
    setDark(shouldBeDark)
  }, [])

  const toggle = React.useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("kemoket-theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return { dark, toggle }
}

export default function Home() {
  const { dark, toggle } = useDarkMode()
  const navRef = React.useRef<HTMLElement>(null)
  const [navHeight, setNavHeight] = React.useState(0)

  React.useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.offsetHeight)
  }, [])

  return (
    <Tabs defaultValue="A" className="flex flex-col gap-0">
      <nav ref={navRef} className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b bg-background px-4 py-2">
        <span className="font-semibold text-sm whitespace-nowrap">関西けもケット11</span>
        <TabsList className="flex w-fit justify-self-center gap-1">
          {BLOCKS.map((block) => (
            <TabsTrigger key={block} value={block} className="px-2 text-xs">
              {block}({boothsByBlock[block].length})
            </TabsTrigger>
          ))}
        </TabsList>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </nav>
      <BoothTable headerTop={navHeight} />
    </Tabs>
  )
}
