import { useState } from 'react'
import type { Area, CreateCardInput, UrgencyLevel, ItemType } from '../../types/index.js'

interface Props {
  area: Area
  column: string
  onAdd: (card: CreateCardInput) => Promise<void>
  onCancel: () => void
}

export default function AddCardForm({ area, column, onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [itemType, setItemType] = useState<ItemType | ''>('')
  const [totalUnits, setTotalUnits] = useState('')
  const [currentUnit, setCurrentUnit] = useState('')
  const [saving, setSaving] = useState(false)

  const isLearning = area.id === 'learning'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onAdd({
        areaId: area.id,
        column,
        title: title.trim(),
        urgency,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
        progress: null,
        itemType: isLearning && itemType ? itemType : null,
        totalUnits: isLearning && totalUnits ? parseInt(totalUnits, 10) : null,
        currentUnit: isLearning && currentUnit ? parseInt(currentUnit, 10) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none bg-[#0f172a] border border-slate-700 focus:border-slate-500 transition-colors'
  const labelCls = 'text-xs text-slate-500 mb-0.5 block'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md p-3 flex flex-col gap-2"
      style={{ backgroundColor: '#1a2942', border: '1px solid #334155' }}
    >
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        className={inputCls}
      />

      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Urgency</label>
          <select
            value={urgency}
            onChange={e => setUrgency(e.target.value as UrgencyLevel)}
            className={inputCls}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label className={labelCls}>Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {isLearning && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelCls}>Type</label>
            <select
              value={itemType}
              onChange={e => setItemType(e.target.value as ItemType | '')}
              className={inputCls}
            >
              <option value="">—</option>
              <option value="book">Book</option>
              <option value="course">Course</option>
              <option value="certification">Certification</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={labelCls}>Units</label>
            <input
              type="number"
              min="1"
              value={totalUnits}
              onChange={e => setTotalUnits(e.target.value)}
              placeholder="Total"
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Current</label>
            <input
              type="number"
              min="0"
              value={currentUnit}
              onChange={e => setCurrentUnit(e.target.value)}
              placeholder="Done"
              className={inputCls}
            />
          </div>
        </div>
      )}

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className={`${inputCls} resize-none`}
      />

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-40"
          style={{ backgroundColor: area.color, color: '#fff' }}
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded text-sm text-slate-400 hover:text-slate-200 transition-colors"
          style={{ backgroundColor: '#1e293b' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
