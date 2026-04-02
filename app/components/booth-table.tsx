"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import {
  Table,
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
  return {
    wantToBuy: false,
    quantity: "",
    amount: "",
    notes: "",
    visitedWeb: false,
    visitedPixiv: false,
    visitedTwitter: false,
  }
}

const booths = boothsData as Booth[]

interface LinkWithVisitedProps {
  href: string
  visited: boolean
  onVisit: () => void
  tooltipLabel: string
}

function LinkWithVisited({ href, visited, onVisit, tooltipLabel }: LinkWithVisitedProps) {
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
}

export function BoothTable() {
  const [records, setRecords] = React.useState<Record<string, BoothRecord>>({})

  React.useEffect(() => {
    setRecords(loadRecords())
  }, [])

  const getRecord = (pos: string): BoothRecord =>
    records[pos] ?? defaultRecord()

  const updateRecord = (pos: string, patch: Partial<BoothRecord>) => {
    setRecords((prev) => {
      const next = {
        ...prev,
        [pos]: { ...(prev[pos] ?? defaultRecord()), ...patch },
      }
      saveRecords(next)
      return next
    })
  }

  const totalQuantity = Object.values(records).reduce(
    (sum, r) => sum + (parseInt(r.quantity) || 0),
    0
  )
  const totalAmount = Object.values(records).reduce(
    (sum, r) => sum + (parseInt(r.amount) || 0),
    0
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">配置</TableHead>
          <TableHead className="w-40">サークル名</TableHead>
          <TableHead className="w-28">代表者名</TableHead>
          <TableHead className="w-36">web</TableHead>
          <TableHead className="w-36">pixiv</TableHead>
          <TableHead className="w-36">twitter</TableHead>
          <TableHead className="w-20 text-center">買いたい</TableHead>
          <TableHead className="w-20">數量</TableHead>
          <TableHead className="w-24">金額 (¥)</TableHead>
          <TableHead className="min-w-40">備註</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {booths.map((booth) => {
          const rec = getRecord(booth.pos)
          return (
            <TableRow key={booth.pos}>
              <TableCell className="text-xs font-mono">{booth.pos}</TableCell>
              <TableCell className="text-xs font-medium">{booth.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{booth.rep}</TableCell>
              <TableCell>
                <LinkWithVisited
                  href={booth.web}
                  visited={rec.visitedWeb}
                  tooltipLabel="web"
                  onVisit={() => updateRecord(booth.pos, { visitedWeb: true })}
                />
              </TableCell>
              <TableCell>
                <LinkWithVisited
                  href={booth.pixiv}
                  visited={rec.visitedPixiv}
                  tooltipLabel="pixiv"
                  onVisit={() => updateRecord(booth.pos, { visitedPixiv: true })}
                />
              </TableCell>
              <TableCell>
                <LinkWithVisited
                  href={booth.twitter}
                  visited={rec.visitedTwitter}
                  tooltipLabel="twitter"
                  onVisit={() => updateRecord(booth.pos, { visitedTwitter: true })}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={rec.wantToBuy}
                  onCheckedChange={(v) =>
                    updateRecord(booth.pos, { wantToBuy: Boolean(v) })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  className="h-7 w-16 text-xs"
                  value={rec.quantity}
                  onChange={(e) =>
                    updateRecord(booth.pos, { quantity: e.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  className="h-7 w-20 text-xs"
                  value={rec.amount}
                  onChange={(e) =>
                    updateRecord(booth.pos, { amount: e.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <Textarea
                  className="min-h-7 h-7 text-xs resize-none"
                  value={rec.notes}
                  onChange={(e) =>
                    updateRecord(booth.pos, { notes: e.target.value })
                  }
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="text-right font-medium">
            合計
          </TableCell>
          <TableCell className="font-medium">{totalQuantity}</TableCell>
          <TableCell className="font-medium">¥{totalAmount.toLocaleString()}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
