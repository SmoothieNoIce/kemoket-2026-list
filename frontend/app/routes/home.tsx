import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { BoothTable, BLOCKS, boothsByBlock, type Block } from "~/components/booth-table"

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
  const [selectedBlock, setSelectedBlock] = React.useState<Block>("A")

  React.useEffect(() => {
    const el = navRef.current
    if (!el) return
    setNavHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => setNavHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Tabs value={selectedBlock} onValueChange={(v) => setSelectedBlock(v as Block)} className="flex flex-col gap-0 w-screen">
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-30 border-b bg-background">
        {/* 桌面：單列，tab 置中 */}
        <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-2 md:px-4 md:py-2">
          <span className="font-semibold text-sm whitespace-nowrap">関西けもケット11</span>
          <div className="flex justify-center overflow-x-auto overflow-y-hidden">
            <TabsList className="flex w-max gap-1">
              {BLOCKS.map((block) => (
                <TabsTrigger key={block} value={block} className="px-2 text-xs shrink-0">
                  {block}({boothsByBlock[block].length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
        {/* 手機：兩列 */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-semibold text-sm">関西けもケット11</span>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
          <div className="overflow-x-auto px-4 pb-2">
            <TabsList className="flex w-max gap-1">
              {BLOCKS.map((block) => (
                <TabsTrigger key={block} value={block} className="px-2 text-xs shrink-0">
                  {block}({boothsByBlock[block].length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </nav>
      <div style={{ paddingTop: navHeight }}>
        <BoothTable headerTop={navHeight} selectedBlock={selectedBlock} />
      </div>
    </Tabs>
  )
}
