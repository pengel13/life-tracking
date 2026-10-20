import { useParams } from 'react-router-dom'

export default function KanbanBoard() {
  const { areaId } = useParams<{ areaId: string }>()
  return <div className="p-6 text-slate-400">Board: {areaId}</div>
}
