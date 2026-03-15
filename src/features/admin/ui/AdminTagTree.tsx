import { useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronRight,
  Tags,
  Combine,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { cn } from '@/shared/lib/cn'
import { adminQueries } from '@/features/admin/api/admin-queries'
import {
  createTag,
  updateTag,
  deleteTag,
  mergeTag,
} from '@/features/admin/api/admin-api'
import { buildTagTree, type Tag, type TagNode } from '@/features/recipes/api/types'
import { TagMergeModal } from './TagMergeModal'

function getDescendantIds(node: TagNode): Set<number> {
  const ids = new Set<number>()
  function walk(n: TagNode) {
    for (const child of n.children) {
      ids.add(child.id)
      walk(child)
    }
  }
  walk(node)
  return ids
}

function findNodeById(roots: TagNode[], id: number): TagNode | null {
  for (const root of roots) {
    if (root.id === id) return root
    const found = findNodeById(root.children, id)
    if (found) return found
  }
  return null
}

// --- Draggable + Droppable tree node wrapper ---

function DraggableDroppableNode({
  id,
  children,
  isOverValid,
}: {
  id: number
  children: (props: { isDragging: boolean; isOver: boolean }) => ReactNode
  isOverValid: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: String(id) })
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: String(id),
  })

  return (
    <div
      ref={(el) => {
        setDragRef(el)
        setDropRef(el)
      }}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-lg transition-colors',
        isDragging && 'opacity-40',
        isOver && isOverValid && 'bg-accent/10 ring-1 ring-accent/30',
      )}
    >
      {children({ isDragging, isOver: isOver && isOverValid })}
    </div>
  )
}

// --- Single tree node ---

interface TagTreeNodeProps {
  node: TagNode
  level: number
  editingId: number | null
  editName: string
  onStartEdit: (id: number, name: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditNameChange: (name: string) => void
  onDelete: (id: number, name: string) => void
  onMerge: (tag: Tag) => void
  collapsedIds: Set<number>
  onToggleCollapse: (id: number) => void
  activeId: string | null
  flatTags: Tag[]
}

function TagTreeNodeComponent({
  node,
  level,
  editingId,
  editName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onDelete,
  onMerge,
  collapsedIds,
  onToggleCollapse,
  activeId,
  flatTags,
}: TagTreeNodeProps) {
  const isEditing = editingId === node.id
  const hasChildren = node.children.length > 0
  const isCollapsed = collapsedIds.has(node.id)

  // Find this node's descendants to check valid drop
  const descendantIds = getDescendantIds(node)
  const isValidDropTarget =
    activeId !== null &&
    Number(activeId) !== node.id &&
    !descendantIds.has(Number(activeId))

  // We need to find the flat tag for merge
  const flatTag = flatTags.find((t) => t.id === node.id)

  return (
    <div>
      <DraggableDroppableNode id={node.id} isOverValid={isValidDropTarget}>
        {() => (
          <div
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            {/* Expand/collapse chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren) onToggleCollapse(node.id)
              }}
              className={cn(
                'flex-shrink-0 rounded p-0.5 transition-transform',
                hasChildren
                  ? 'text-white/40 hover:text-white/70'
                  : 'invisible',
              )}
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  !isCollapsed && hasChildren && 'rotate-90',
                )}
              />
            </button>

            {/* Tag name or edit input */}
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveEdit()
                    if (e.key === 'Escape') onCancelEdit()
                  }}
                  className="flex-1 min-w-0 rounded bg-white/5 px-2 py-1 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={onSaveEdit}
                  className="rounded p-1 text-green-400 hover:bg-green-400/10"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded p-1 text-red-400 hover:bg-red-400/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 min-w-0 text-sm text-white/80 truncate">
                  {node.name}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartEdit(node.id, node.name)
                    }}
                    className="rounded p-1 text-white/30 hover:text-white hover:bg-white/10"
                    title="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (flatTag) onMerge(flatTag)
                    }}
                    className="rounded p-1 text-white/30 hover:text-accent-light hover:bg-accent/10"
                    title="Merge into..."
                  >
                    <Combine className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(node.id, node.name)
                    }}
                    className="rounded p-1 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </DraggableDroppableNode>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map((child) => (
            <TagTreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              editingId={editingId}
              editName={editName}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditNameChange={onEditNameChange}
              onDelete={onDelete}
              onMerge={onMerge}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
              activeId={activeId}
              flatTags={flatTags}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Main AdminTagTree component ---

export function AdminTagTree() {
  const queryClient = useQueryClient()
  const { data: tags, isLoading } = useQuery(adminQueries.tags())
  const tree = tags ? buildTagTree(tags) : []

  // Inline rename state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  // Create new tag state
  const [creatingNew, setCreatingNew] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagParentId, setNewTagParentId] = useState<number | null>(null)

  // Collapse state
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set())

  // Merge state
  const [mergingTag, setMergingTag] = useState<Tag | null>(null)

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function invalidateCaches() {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
    void queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { name: string; parentId?: number }) => createTag(data),
    onSuccess: () => invalidateCaches(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name?: string; parentId?: number | null }) => {
      const { id, ...rest } = data
      return updateTag(id, rest)
    },
    onSuccess: () => invalidateCaches(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => invalidateCaches(),
  })

  const mergeMutation = useMutation({
    mutationFn: (data: { sourceId: number; targetId: number }) =>
      mergeTag(data.sourceId, data.targetId),
    onSuccess: () => invalidateCaches(),
  })

  // Inline rename handlers
  function handleStartEdit(id: number, name: string) {
    setEditingId(id)
    setEditName(name)
    setCreatingNew(false)
  }

  function handleSaveEdit() {
    if (editingId !== null && editName.trim()) {
      updateMutation.mutate({ id: editingId, name: editName.trim() })
    }
    setEditingId(null)
    setEditName('')
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  // Create handlers
  function handleStartCreate() {
    setCreatingNew(true)
    setNewTagName('')
    setNewTagParentId(null)
    setEditingId(null)
  }

  function handleSaveCreate() {
    if (newTagName.trim()) {
      createMutation.mutate({
        name: newTagName.trim(),
        ...(newTagParentId !== null && { parentId: newTagParentId }),
      })
    }
    setCreatingNew(false)
    setNewTagName('')
    setNewTagParentId(null)
  }

  function handleCancelCreate() {
    setCreatingNew(false)
    setNewTagName('')
    setNewTagParentId(null)
  }

  // Delete handler
  function handleDelete(id: number, name: string) {
    if (window.confirm(`Delete tag "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  // Collapse handler
  function handleToggleCollapse(id: number) {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Drag handlers
  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const draggedId = Number(active.id)
    const targetId = over.id === 'root-drop-zone' ? null : Number(over.id)

    // Prevent dropping a node into its own subtree
    if (targetId !== null) {
      const draggedNode = findNodeById(tree, draggedId)
      if (draggedNode) {
        const descendants = getDescendantIds(draggedNode)
        if (descendants.has(targetId)) return
      }
    }

    updateMutation.mutate({ id: draggedId, parentId: targetId })
  }

  // Find active node for overlay
  const activeNode =
    activeId && tags
      ? findNodeById(tree, Number(activeId))
      : null

  // Loading skeleton
  if (isLoading) {
    return (
      <GlassPanel className="p-4">
        <div className="space-y-3">
          <Skeleton height={36} variant="rectangular" />
          <div className="pl-6 space-y-2">
            <Skeleton height={32} variant="rectangular" />
            <Skeleton height={32} variant="rectangular" />
          </div>
          <Skeleton height={36} variant="rectangular" />
          <div className="pl-6">
            <Skeleton height={32} variant="rectangular" />
          </div>
        </div>
      </GlassPanel>
    )
  }

  // Empty state
  if (!tags || tags.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <button
            type="button"
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent-light hover:bg-accent/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Tag
          </button>
        </div>
        {creatingNew && (
          <GlassPanel className="p-4 mb-4">
            <CreateTagForm
              name={newTagName}
              parentId={newTagParentId}
              tags={[]}
              onNameChange={setNewTagName}
              onParentChange={setNewTagParentId}
              onSave={handleSaveCreate}
              onCancel={handleCancelCreate}
            />
          </GlassPanel>
        )}
        <EmptyState
          icon={Tags}
          title="No tags yet"
          description="Add your first tag to organize recipes."
        />
      </div>
    )
  }

  return (
    <div>
      {/* Add Tag button + inline create form */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent-light hover:bg-accent/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </button>
      </div>

      {creatingNew && (
        <GlassPanel className="p-4 mb-4">
          <CreateTagForm
            name={newTagName}
            parentId={newTagParentId}
            tags={tags}
            onNameChange={setNewTagName}
            onParentChange={setNewTagParentId}
            onSave={handleSaveCreate}
            onCancel={handleCancelCreate}
          />
        </GlassPanel>
      )}

      {/* Tag tree with DnD */}
      <GlassPanel className="p-2">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {tree.map((root) => (
            <TagTreeNodeComponent
              key={root.id}
              node={root}
              level={0}
              editingId={editingId}
              editName={editName}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditNameChange={setEditName}
              onDelete={handleDelete}
              onMerge={(tag) => setMergingTag(tag)}
              collapsedIds={collapsedIds}
              onToggleCollapse={handleToggleCollapse}
              activeId={activeId}
              flatTags={tags}
            />
          ))}

          {/* Root drop zone */}
          <RootDropZone activeId={activeId} />

          <DragOverlay>
            {activeNode ? (
              <GlassPanel className="px-3 py-2 text-sm text-white/80 shadow-xl">
                {activeNode.name}
              </GlassPanel>
            ) : null}
          </DragOverlay>
        </DndContext>
      </GlassPanel>

      {/* Merge modal */}
      {mergingTag && tags && (
        <TagMergeModal
          sourceTag={mergingTag}
          allTags={tags}
          tree={tree}
          onConfirm={(targetId) => {
            mergeMutation.mutate(
              { sourceId: mergingTag.id, targetId },
              { onSuccess: () => setMergingTag(null) },
            )
          }}
          onClose={() => setMergingTag(null)}
        />
      )}
    </div>
  )
}

// --- Root drop zone ---

function RootDropZone({ activeId }: { activeId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'root-drop-zone' })

  if (!activeId) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'mt-2 rounded-lg border-2 border-dashed py-3 text-center text-xs transition-colors',
        isOver
          ? 'border-accent/50 bg-accent/10 text-accent-light'
          : 'border-white/10 text-white/30',
      )}
    >
      Drop here to move to root level
    </div>
  )
}

// --- Create tag form ---

function CreateTagForm({
  name,
  parentId,
  tags,
  onNameChange,
  onParentChange,
  onSave,
  onCancel,
}: {
  name: string
  parentId: number | null
  tags: Tag[]
  onNameChange: (v: string) => void
  onParentChange: (v: number | null) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Tag name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
        className="flex-1 min-w-0 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-1 focus:ring-accent/50"
        autoFocus
      />
      <select
        value={parentId ?? ''}
        onChange={(e) =>
          onParentChange(e.target.value ? Number(e.target.value) : null)
        }
        className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:ring-1 focus:ring-accent/50"
      >
        <option value="">Root (no parent)</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSave}
        className="rounded p-1.5 text-green-400 hover:bg-green-400/10"
      >
        <Check className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded p-1.5 text-red-400 hover:bg-red-400/10"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
