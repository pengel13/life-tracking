import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import type { Area, Card, CreateCardInput } from '../../types/index.js'
import KanbanCard from './KanbanCard.js'
import AddCardForm from './AddCardForm.js'

interface Props {
  area: Area
  column: string
  cards: Card[]
  onAdd: (input: CreateCardInput) => Promise<void>
  onDelete: (id: string) => void
}

export default function KanbanColumn({ area, column, cards, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false)

  async function handleAdd(input: CreateCardInput) {
    await onAdd(input)
    setAdding(false)
  }

  return (
    <div className="flex flex-col min-w-64 w-64 shrink-0">
      <div
        className="flex items-center justify-between px-3 py-2 mb-2"
        style={{ borderLeft: `2px solid ${area.color}` }}
      >
        <span className="text-sm font-medium text-slate-200">{column}</span>
        <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
          {cards.length}
        </span>
      </div>

      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-2 flex-1 min-h-12 rounded-md transition-colors px-0.5"
            style={snapshot.isDraggingOver ? { backgroundColor: `${area.color}0a` } : undefined}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                      opacity: dragSnapshot.isDragging ? 0.9 : 1,
                    }}
                  >
                    <KanbanCard card={card} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-2">
        {adding ? (
          <AddCardForm
            area={area}
            column={column}
            onAdd={handleAdd}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-left text-sm text-slate-600 hover:text-slate-400 py-1.5 px-2 rounded transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  )
}
