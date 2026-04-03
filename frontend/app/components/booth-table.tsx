"use client"

import * as React from "react"
import { CheckIcon, ListIcon, StarIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { cn } from "~/lib/utils"
import boothsData from "~/data/booths.json"

interface Booth {
  pos: string
  name: string
  rep: string
  web: string
  pixiv: string
  twitter: string
}

interface BoothRecord {
  favorite: boolean
  wantToBuy: boolean
  quantity: string
  amount: string
  notes: string
  visitedWeb: boolean
  visitedPixiv: boolean
  visitedTwitter: boolean
}

const STORAGE_KEY = "kemoket-2026-records"
const DEFAULT_RECORD: BoothRecord = {
  favorite: false,
  wantToBuy: false,
  quantity: "",
  amount: "",
  notes: "",
  visitedWeb: false,
  visitedPixiv: false,
  visitedTwitter: false,
}

function loadRecords(): Record<string, BoothRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRecords(records: Record<string, BoothRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function defaultRecord(): BoothRecord {
  return { ...DEFAULT_RECORD }
}

const booths = boothsData as Booth[]

export const BLOCKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] as const
export type Block = (typeof BLOCKS)[number]

export const boothsByBlock = Object.fromEntries(
  BLOCKS.map((block) => [
    block,
    booths.filter((b) => b.pos.startsWith(block + "-")),
  ])
) as Record<Block, Booth[]>

// ── TwitterAvatar ──────────────────────────────────────────────────────────────

function getTwitterUsername(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, "").split("/")[0].toLowerCase()
  } catch {
    return ""
  }
}

const TwitterAvatar = React.memo(function TwitterAvatar({ twitterUrl }: { twitterUrl: string }) {
  const [errored, setErrored] = React.useState(false)
  const username = getTwitterUsername(twitterUrl)
  if (!username || errored) {
    return <span className="size-8 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">?</span>
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}avatars/${username}.jpg`}
      alt={username}
      loading="lazy"
      className="size-8 rounded-full object-cover bg-muted flex-shrink-0"
      onError={() => setErrored(true)}
    />
  )
})

// ── LinkWithVisited ────────────────────────────────────────────────────────────

interface LinkWithVisitedProps {
  href: string
  visited: boolean
  onVisit: () => void
  tooltipLabel: string
}

const LinkWithVisited = React.memo(function LinkWithVisited({
  href,
  visited,
  onVisit,
  tooltipLabel,
}: LinkWithVisitedProps) {
  if (!href) return <span className="text-muted-foreground">—</span>

  const handleClick = () => {
    onVisit()
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        className="max-w-[120px] truncate text-primary underline underline-offset-2 hover:text-primary/80 text-xs text-left"
        title={href}
      >
        {href.replace(/^https?:\/\//, "")}
      </button>
      {visited && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-shrink-0 text-green-600">
                <CheckIcon className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{tooltipLabel} 已閱覽</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
})

// ── BoothRow ───────────────────────────────────────────────────────────────────

interface BoothRowProps {
  booth: Booth
  record: BoothRecord
  onUpdate: (pos: string, patch: Partial<BoothRecord>) => void
}

const BoothRow = React.memo(function BoothRow({ booth, record, onUpdate }: BoothRowProps) {
  const { pos } = booth

  const onStarClick = React.useCallback(() => {
    const next = !record.favorite
    onUpdate(pos, { favorite: next })
    toast(next ? "已加入最愛" : "已移除最愛", {
      description: booth.name,
      action: { label: "復原", onClick: () => onUpdate(pos, { favorite: !next }) },
    })
  }, [onUpdate, pos, record.favorite, booth.name])
  const visitWeb = React.useCallback(() => onUpdate(pos, { visitedWeb: true }), [onUpdate, pos])
  const visitPixiv = React.useCallback(() => onUpdate(pos, { visitedPixiv: true }), [onUpdate, pos])
  const visitTwitter = React.useCallback(() => onUpdate(pos, { visitedTwitter: true }), [onUpdate, pos])
  const onCheckChange = React.useCallback(
    (v: boolean | "indeterminate") => {
      const next = Boolean(v)
      onUpdate(pos, { wantToBuy: next })
      toast(next ? "已加入購買項目" : "已移除購買項目", {
        description: booth.name,
        action: { label: "復原", onClick: () => onUpdate(pos, { wantToBuy: !next }) },
      })
    },
    [onUpdate, pos, booth.name]
  )
  const onQuantityChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUpdate(pos, { quantity: e.target.value }),
    [onUpdate, pos]
  )
  const onAmountChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUpdate(pos, { amount: e.target.value }),
    [onUpdate, pos]
  )
  const onNotesChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUpdate(pos, { notes: e.target.value }),
    [onUpdate, pos]
  )

  return (
    <TableRow>
      <TableCell className="w-8">
        <button onClick={onStarClick} className="flex items-center justify-center">
          <StarIcon className={cn("size-4", record.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      </TableCell>
      <TableCell className="text-xs font-mono">{pos}</TableCell>
      <TableCell className="text-xs font-medium">{booth.name}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{booth.rep}</TableCell>
      <TableCell className="overflow-hidden">
        <div className="flex items-center gap-2">
          {booth.twitter && <TwitterAvatar twitterUrl={booth.twitter} />}
          <LinkWithVisited href={booth.twitter} visited={record.visitedTwitter} tooltipLabel="twitter" onVisit={visitTwitter} />
        </div>
      </TableCell>
      <TableCell className="overflow-hidden">
        <LinkWithVisited href={booth.web} visited={record.visitedWeb} tooltipLabel="web" onVisit={visitWeb} />
      </TableCell>
      <TableCell className="overflow-hidden">
        <LinkWithVisited href={booth.pixiv} visited={record.visitedPixiv} tooltipLabel="pixiv" onVisit={visitPixiv} />
      </TableCell>
      <TableCell className="text-center">
        <Checkbox checked={record.wantToBuy} onCheckedChange={onCheckChange} />
      </TableCell>
      <TableCell>
        <Input min={0} className="h-7 w-16 text-xs" value={record.quantity} onChange={onQuantityChange} disabled={!record.wantToBuy} />
      </TableCell>
      <TableCell>
        <Input min={0} className="h-7 w-20 text-xs" value={record.amount} onChange={onAmountChange} disabled={!record.wantToBuy} />
      </TableCell>
      <TableCell>
        <Input className="min-h-7 h-7 text-xs resize-none" value={record.notes} onChange={onNotesChange} />
      </TableCell>
    </TableRow>
  )
})

// ── BlockTable ─────────────────────────────────────────────────────────────────

interface BlockTableProps {
  blockBooths: Booth[]
  records: Record<string, BoothRecord>
  onUpdate: (pos: string, patch: Partial<BoothRecord>) => void
  search?: string
}

function BlockTable({ blockBooths, records, onUpdate, search }: BlockTableProps) {
  const filtered = search
    ? blockBooths.filter((b) => {
        const q = search.toLowerCase()
        return [b.pos, b.name, b.rep, b.twitter, b.web, b.pixiv].some((s) => s.toLowerCase().includes(q))
      })
    : blockBooths

  const totalQuantity = filtered.reduce(
    (sum, b) => sum + (parseInt(records[b.pos]?.quantity ?? "") || 0),
    0
  )
  const totalAmount = filtered.reduce(
    (sum, b) => sum + (parseInt(records[b.pos]?.amount ?? "") || 0),
    0
  )

  return (
    // No overflow wrapper — any overflow-x:auto ancestor forces overflow-y:auto,
    // creating a scroll context that traps sticky. Let the body handle scrolling.
    <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
      <TableHeader className="border-b">
        <TableRow>
          <TableHead className="sticky top-0 z-10 bg-background w-8"></TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-16">配置</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-40">サークル名</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-28">代表者名</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-40">twitter</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-36">web</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-36">pixiv</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-20">是否為購買項目</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-20">數量</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background w-24">金額</TableHead>
          <TableHead className="sticky top-0 z-10 bg-background min-w-40">備註</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((booth) => (
          <BoothRow
            key={booth.pos}
            booth={booth}
            record={records[booth.pos] ?? DEFAULT_RECORD}
            onUpdate={onUpdate}
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={8} className="text-right font-medium">
            合計
          </TableCell>
          <TableCell className="font-medium">{totalQuantity}</TableCell>
          <TableCell className="font-medium">{totalAmount.toLocaleString()}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </table>
  )
}

// ── BoothTable ─────────────────────────────────────────────────────────────────

export function BoothTable({ headerTop = 0, selectedBlock = "A", search = "" }: { headerTop?: number; selectedBlock?: Block; search?: string }) {
  const [records, setRecords] = React.useState<Record<string, BoothRecord>>(
    () => loadRecords()
  )
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const footerRef = React.useRef<HTMLDivElement>(null)
  const [footerHeight, setFooterHeight] = React.useState(40)
  const [innerHeight, setInnerHeight] = React.useState(0)

  React.useEffect(() => {
    const el = footerRef.current
    if (!el) return
    setFooterHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => setFooterHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    const update = () => setInnerHeight(window.innerHeight)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const onUpdate = React.useCallback((pos: string, patch: Partial<BoothRecord>) => {
    setRecords((prev) => {
      const next = {
        ...prev,
        [pos]: { ...(prev[pos] ?? defaultRecord()), ...patch },
      }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveRecords(next), 300)
      return next
    })
  }, [])

  const blockTotals = React.useMemo(() => {
    const blockBooths = boothsByBlock[selectedBlock]
    return {
      quantity: blockBooths.reduce((sum, b) => sum + (parseInt(records[b.pos]?.quantity ?? "") || 0), 0),
      amount: blockBooths.reduce((sum, b) => sum + (parseInt(records[b.pos]?.amount ?? "") || 0), 0),
    }
  }, [records, selectedBlock])

  const grandTotals = React.useMemo(() => {
    let quantity = 0
    let amount = 0
    for (const r of Object.values(records)) {
      quantity += parseInt(r.quantity) || 0
      amount += parseInt(r.amount) || 0
    }
    return { quantity, amount }
  }, [records])

  const searchResults = React.useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return booths.filter((b) =>
      [b.pos, b.name, b.rep, b.twitter, b.web, b.pixiv].some((s) => s.toLowerCase().includes(q))
    )
  }, [search])

  const searchTotals = React.useMemo(() => ({
    quantity: searchResults.reduce((s, b) => s + (parseInt(records[b.pos]?.quantity ?? "") || 0), 0),
    amount: searchResults.reduce((s, b) => s + (parseInt(records[b.pos]?.amount ?? "") || 0), 0),
  }), [searchResults, records])

  const favoriteBooths = React.useMemo(
    () => booths.filter((b) => records[b.pos]?.favorite),
    [records]
  )

  const purchaseBooths = React.useMemo(
    () => booths.filter((b) => records[b.pos]?.wantToBuy),
    [records]
  )

  return (
    <>
      {BLOCKS.map((block) => (
        <TabsContent
          key={block}
          value={block}
          className="mt-0 overflow-auto"
          style={{ height: innerHeight ? `${innerHeight - headerTop - footerHeight}px` : `calc(100vh - ${headerTop}px - ${footerHeight}px)` }}
        >
          <BlockTable
            blockBooths={boothsByBlock[block]}
            records={records}
            onUpdate={onUpdate}
            search={search}
          />
        </TabsContent>
      ))}
      <TabsContent
        value="__search__"
        className="mt-0 overflow-auto"
        style={{ height: innerHeight ? `${innerHeight - headerTop - footerHeight}px` : `calc(100vh - ${headerTop}px - ${footerHeight}px)` }}
      >
        <BlockTable
          blockBooths={searchResults}
          records={records}
          onUpdate={onUpdate}
        />
      </TabsContent>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-4 border-t bg-background px-6 py-2 text-sm">
        {search ? (
          <>
            <span className="text-muted-foreground">搜尋結果 {searchResults.length} 筆</span>
            <span>{searchTotals.quantity} 個</span>
            <span>{searchTotals.amount.toLocaleString()}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">{selectedBlock} 攤位</span>
            <span>{blockTotals.quantity} 個</span>
            <span>{blockTotals.amount.toLocaleString()}</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">總共</span>
            <span>{grandTotals.quantity} 個</span>
            <span className="font-semibold">{grandTotals.amount.toLocaleString()}</span>
          </>
        )}
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        style={{ bottom: `${footerHeight + 12}px` }}
        className="fixed right-4 z-20 h-10 px-4 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm font-medium"
        aria-label="開啟清單"
      >
        <ListIcon className="size-4" />
        清單
      </button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="w-full flex flex-col p-0 max-h-[70vh]">
          <SheetHeader className="px-4 pt-4 pb-2 border-b shrink-0">
            <SheetTitle>清單</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="favorites" className="flex flex-col flex-1 overflow-hidden w-full">
            <TabsList className="mx-4 shrink-0 w-auto self-center">
              <TabsTrigger value="favorites">我的最愛 ({favoriteBooths.length})</TabsTrigger>
              <TabsTrigger value="purchases">購買項目 ({purchaseBooths.length})</TabsTrigger>
            </TabsList>
            {(["favorites", "purchases"] as const).map((tab) => {
              const list = tab === "favorites" ? favoriteBooths : purchaseBooths
              const emptyMsg = tab === "favorites" ? "尚無最愛攤位" : "尚無購買項目"
              return (
                <TabsContent key={tab} value={tab} className="flex-1 overflow-auto mt-2 px-0  w-full">
                  <table className="text-sm border-separate border-spacing-0  w-full">
                    <thead>
                      <tr>
                        <th className="sticky top-0 bg-background px-2 py-2 w-8"></th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-16">配置</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-40">サークル名</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-28">代表者名</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-44">twitter</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-36">web</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-36">pixiv</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-20">購買</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-20">數量</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground w-24">金額</th>
                        <th className="sticky top-0 bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground min-w-40">備註</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center text-muted-foreground text-sm py-8">{emptyMsg}</td>
                        </tr>
                      ) : list.map((booth) => {
                        const r = records[booth.pos] ?? DEFAULT_RECORD
                        const removeField = tab === "favorites" ? "favorite" : "wantToBuy"
                        return (
                          <tr key={booth.pos} className="border-b last:border-0">
                            <td className="px-2 py-2">
                              <button
                                onClick={() => onUpdate(booth.pos, { [removeField]: false })}
                                className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <XIcon className="size-3.5" />
                              </button>
                            </td>
                            <td className="px-3 py-2 text-xs font-mono">{booth.pos}</td>
                            <td className="px-3 py-2 text-xs font-medium">{booth.name}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{booth.rep}</td>
                            <td className="px-3 py-2 overflow-hidden">
                              <div className="flex items-center gap-2">
                                {booth.twitter && <TwitterAvatar twitterUrl={booth.twitter} />}
                                <LinkWithVisited href={booth.twitter} visited={r.visitedTwitter} tooltipLabel="twitter"
                                  onVisit={() => onUpdate(booth.pos, { visitedTwitter: true })} />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <LinkWithVisited href={booth.web} visited={r.visitedWeb} tooltipLabel="web"
                                onVisit={() => onUpdate(booth.pos, { visitedWeb: true })} />
                            </td>
                            <td className="px-3 py-2">
                              <LinkWithVisited href={booth.pixiv} visited={r.visitedPixiv} tooltipLabel="pixiv"
                                onVisit={() => onUpdate(booth.pos, { visitedPixiv: true })} />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Checkbox checked={r.wantToBuy}
                                onCheckedChange={(v) => onUpdate(booth.pos, { wantToBuy: Boolean(v) })} />
                            </td>
                            <td className="px-3 py-2">
                              <Input min={0} className="h-7 w-16 text-xs" value={r.quantity}
                                onChange={(e) => onUpdate(booth.pos, { quantity: e.target.value })} disabled={!r.wantToBuy} />
                            </td>
                            <td className="px-3 py-2">
                              <Input min={0} className="h-7 w-20 text-xs" value={r.amount}
                                onChange={(e) => onUpdate(booth.pos, { amount: e.target.value })} disabled={!r.wantToBuy} />
                            </td>
                            <td className="px-3 py-2">
                              <Input className="h-7 text-xs min-w-32" value={r.notes}
                                onChange={(e) => onUpdate(booth.pos, { notes: e.target.value })} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {list.length > 0 && (
                      <tfoot>
                        <tr className="border-t font-medium">
                          <td colSpan={8} className="px-3 py-2 text-xs text-right">合計</td>
                          <td className="px-3 py-2 text-xs">
                            {list.reduce((s, b) => s + (parseInt(records[b.pos]?.quantity ?? "") || 0), 0)}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {list.reduce((s, b) => s + (parseInt(records[b.pos]?.amount ?? "") || 0), 0).toLocaleString()}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </TabsContent>
              )
            })}
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  )
}
