"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
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
import { Textarea } from "~/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { TabsContent } from "~/components/ui/tabs"
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
      src={`/avatars/${username}.jpg`}
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

  const visitWeb = React.useCallback(() => onUpdate(pos, { visitedWeb: true }), [onUpdate, pos])
  const visitPixiv = React.useCallback(() => onUpdate(pos, { visitedPixiv: true }), [onUpdate, pos])
  const visitTwitter = React.useCallback(() => onUpdate(pos, { visitedTwitter: true }), [onUpdate, pos])
  const onCheckChange = React.useCallback(
    (v: boolean | "indeterminate") => onUpdate(pos, { wantToBuy: Boolean(v) }),
    [onUpdate, pos]
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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(pos, { notes: e.target.value }),
    [onUpdate, pos]
  )

  return (
    <TableRow>
      <TableCell className="text-xs font-mono">{pos}</TableCell>
      <TableCell className="text-xs font-medium">{booth.name}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{booth.rep}</TableCell>
      <TableCell>
        <LinkWithVisited href={booth.web} visited={record.visitedWeb} tooltipLabel="web" onVisit={visitWeb} />
      </TableCell>
      <TableCell>
        <LinkWithVisited href={booth.pixiv} visited={record.visitedPixiv} tooltipLabel="pixiv" onVisit={visitPixiv} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {booth.twitter && <TwitterAvatar twitterUrl={booth.twitter} />}
          <LinkWithVisited href={booth.twitter} visited={record.visitedTwitter} tooltipLabel="twitter" onVisit={visitTwitter} />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Checkbox checked={record.wantToBuy} onCheckedChange={onCheckChange} />
      </TableCell>
      <TableCell>
        <Input min={0} className="h-7 w-16 text-xs" value={record.quantity} onChange={onQuantityChange} />
      </TableCell>
      <TableCell>
        <Input min={0} className="h-7 w-20 text-xs" value={record.amount} onChange={onAmountChange} />
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
}

function BlockTable({ blockBooths, records, onUpdate }: BlockTableProps) {
  const totalQuantity = blockBooths.reduce(
    (sum, b) => sum + (parseInt(records[b.pos]?.quantity ?? "") || 0),
    0
  )
  const totalAmount = blockBooths.reduce(
    (sum, b) => sum + (parseInt(records[b.pos]?.amount ?? "") || 0),
    0
  )

  return (
    // No overflow wrapper — any overflow-x:auto ancestor forces overflow-y:auto,
    // creating a scroll context that traps sticky. Let the body handle scrolling.
    <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
        <TableHeader className="[&_tr]:border-b">
          <TableRow>
            <TableHead className="sticky top-0 z-10 bg-background w-16">配置</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-40">サークル名</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-28">代表者名</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-36">web</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-36">pixiv</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-40">twitter</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-20">是否已經購買</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-20">數量</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background w-24">金額</TableHead>
            <TableHead className="sticky top-0 z-10 bg-background min-w-40">備註</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blockBooths.map((booth) => (
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
            <TableCell colSpan={7} className="text-right font-medium">
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

export function BoothTable({ headerTop = 0, selectedBlock = "A" }: { headerTop?: number; selectedBlock?: Block }) {
  const [records, setRecords] = React.useState<Record<string, BoothRecord>>(
    () => loadRecords()
  )
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
          />
        </TabsContent>
      ))}
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-4 border-t bg-background px-6 py-2 text-sm">
        <span className="text-muted-foreground">{selectedBlock} 攤位</span>
        <span>{blockTotals.quantity} 個</span>
        <span>{blockTotals.amount.toLocaleString()}</span>
        <span className="text-border">|</span>
        <span className="text-muted-foreground">總共</span>
        <span>{grandTotals.quantity} 個</span>
        <span className="font-semibold">{grandTotals.amount.toLocaleString()}</span>
      </div>
    </>
  )
}
