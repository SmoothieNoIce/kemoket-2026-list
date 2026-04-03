import * as React from "react"
import { MoonIcon, SearchIcon, SunIcon, XIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
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
  const [search, setSearch] = React.useState("")
  const [searchOpen, setSearchOpen] = React.useState(false)
  const mobileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const el = navRef.current
    if (!el) return
    setNavHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => setNavHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    if (searchOpen) mobileInputRef.current?.focus()
  }, [searchOpen])

  const clearSearch = () => {
    setSearch("")
    setSearchOpen(false)
  }

  return (
    <Tabs value={search ? "__search__" : selectedBlock} onValueChange={(v) => { if (!search) setSelectedBlock(v as Block) }} className="flex flex-col gap-0 w-screen">
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-30 border-b bg-background">
        {/* 桌面：單列，search | tabs 置中 | 按鈕 */}
        <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-2 md:px-4 md:py-2">
          <span className="font-semibold text-sm whitespace-nowrap">関西けもケット11</span>
          <div className="flex items-center justify-center gap-2 overflow-x-auto overflow-y-hidden">
            <div className="relative shrink-0">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜尋攤位..."
                className="h-8 w-44 pl-8 pr-7 text-xs"
              />
              {search && (
                <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
            <TabsList className="flex w-max gap-1">
              {BLOCKS.map((block) => (
                <TabsTrigger key={block} value={block} className="px-2 text-xs shrink-0">
                  {block}({boothsByBlock[block].length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="GitHub">
              <a href="https://github.com/SmoothieNoIce/kemoket-2026-list" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" className="mt-[2.9px] size-5 fill-current -translate-y-px"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
        </div>
        {/* 手機：多列 */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-semibold text-sm">関西けもケット11</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild aria-label="GitHub">
                <a href="https://github.com/SmoothieNoIce/kemoket-2026-list" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="size-5 fill-current -translate-y-px"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
                <SearchIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {dark ? <SunIcon /> : <MoonIcon />}
              </Button>
            </div>
          </div>
          {searchOpen && (
            <div className="px-4 pb-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  ref={mobileInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋攤位..."
                  className="h-8 pl-8 pr-7 text-xs w-full"
                />
                {search && (
                  <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
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
        <BoothTable headerTop={navHeight} selectedBlock={selectedBlock} search={search} />
      </div>
    </Tabs>
  )
}
