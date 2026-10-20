import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'
import type { Card, CreateCardInput, UpdateCardInput } from '../types/index.js'

export function useCards(areaId?: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    const url = areaId ? `/api/cards?areaId=${areaId}` : '/api/cards'
    const data = await api.get<Card[]>(url)
    setCards(data)
    setLoading(false)
  }, [areaId])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  async function createCard(input: CreateCardInput): Promise<Card> {
    const card = await api.post<Card>('/api/cards', input)
    setCards(prev => [card, ...prev])
    return card
  }

  async function updateCard(id: string, updates: UpdateCardInput): Promise<Card> {
    // Optimistic update
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    try {
      const card = await api.patch<Card>(`/api/cards/${id}`, updates)
      setCards(prev => prev.map(c => c.id === id ? card : c))
      return card
    } catch (err) {
      // Rollback on failure
      fetchCards()
      throw err
    }
  }

  async function deleteCard(id: string): Promise<void> {
    setCards(prev => prev.filter(c => c.id !== id))
    await api.delete(`/api/cards/${id}`)
  }

  return { cards, loading, createCard, updateCard, deleteCard, refetch: fetchCards }
}
