'use client';
import { useState, useCallback, useRef } from 'react';

export function useDragDrop<T extends { id: string }>(
  items: T[],
  onReorder: (reordered: T[]) => void,
) {
  const [dragId,   setDragId]   = useState<string | null>(null);
  const [overId,   setOverId]   = useState<string | null>(null);
  const dragItem   = useRef<T | null>(null);

  const onDragStart = useCallback((id: string) => {
    setDragId(id);
    dragItem.current = items.find(i => i.id === id) ?? null;
  }, [items]);

  const onDragEnter = useCallback((id: string) => {
    if (id !== dragId) setOverId(id);
  }, [dragId]);

  const onDragEnd = useCallback(() => {
    if (dragId && overId && dragId !== overId) {
      const from = items.findIndex(i => i.id === dragId);
      const to   = items.findIndex(i => i.id === overId);
      if (from !== -1 && to !== -1) {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onReorder(next);
      }
    }
    setDragId(null);
    setOverId(null);
    dragItem.current = null;
  }, [dragId, overId, items, onReorder]);

  const getDragProps = useCallback((id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(id); },
    onDragEnter: () => onDragEnter(id),
    onDragOver:  (e: React.DragEvent) => { e.preventDefault(); },
    onDragEnd:   onDragEnd,
    onDrop:      (e: React.DragEvent) => { e.preventDefault(); onDragEnd(); },
  }), [onDragStart, onDragEnter, onDragEnd]);

  return { dragId, overId, getDragProps };
}
