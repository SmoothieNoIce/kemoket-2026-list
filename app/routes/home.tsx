import { BoothTable } from "~/components/booth-table"

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">関西けもケット11 サークルリスト</h1>
      <BoothTable />
    </div>
  )
}
