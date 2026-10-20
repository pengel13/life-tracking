import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useParams } from 'react-router-dom'
import { getArea } from '../../constants/areas.js'
import { useCards } from '../../hooks/useCards.js'
import KanbanColumn from './KanbanColumn.js'
import type { CreateCardInput } from '../../types/index.js'

export default function KanbanBoard() {
  const { areaId } = useParams<{ areaId: string }>()
  const area = getArea(areaId!)
  const { cards, createCard, updateCard, deleteCard } = useCards(areaId)

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination } = result
    if (!destination) return
    const card = cards.find(c => c.id === draggableId)
    if (!card || card.column === destination.droppableId) return
    await updateCard(draggableId, { column: destination.droppableId })
  }

  async function handleAdd(input: CreateCardInput) {
    await createCard(input)
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-3 h-3 rounded-sm shrink-0"
          style={{ backgroundColor: area.color }}
        />
        <h1 className="text-xl font-semibold text-slate-100">{area.label}</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {area.columns.map(column => {
            const columnCards = cards
              .filter(c => c.column === column)
            return (
              <KanbanColumn
                key={column}
                area={area}
                column={column}
                cards={columnCards}
                onAdd={handleAdd}
                onDelete={deleteCard}
                onUpdate={updateCard}
              />
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
