export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export interface Tag {
  id: number
  name: string
  parentId: number | null
}

export interface TagNode {
  id: number
  name: string
  children: TagNode[]
}

export interface RecipeSummary {
  id: string
  title: string
  imageUrl: string | null
  cookTimeMinutes: number
  averageRating: number
  tags: Tag[]
  isFavorite: boolean
}

export interface RecipeIngredient {
  id: number
  amount: number
  unit: string
  ingredientName: string
  ingredientId: number
}

export interface RecipeStep {
  id: number
  stepNumber: number
  instruction: string
}

export interface RecipeDetail extends RecipeSummary {
  description: string
  servings: number
  prepTimeMinutes: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  ratingSummary: {
    overallAverage: number
    totalRatings: number
  }
}

export interface RecipeFilters {
  q?: string
  tagIds?: number[]
}

export interface Unit {
  id: number
  name: string
  abbreviation: string
  type: string
}

export interface MediaFileResponse {
  id: number
  url: string
  isPrimary: boolean
}

export interface ShareResponse {
  shareToken: string
}

// Form state types for the wizard
export interface IngredientFormRow {
  localId: string // crypto.randomUUID() for dnd-kit key
  ingredientId: number | null
  ingredientName: string
  amount: number | string // string while user is typing
  unitId: number | null
}

export interface StepFormRow {
  localId: string // crypto.randomUUID() for dnd-kit key
  text: string
  images: File[]
  existingImageUrls: string[] // for edit mode — already-uploaded images
}

export interface WizardState {
  name: string
  description: string
  servings: number
  prepTimeMinutes: number
  cookTimeMinutes: number
  heroImage: File | null
  heroImagePreview: string | null
  existingHeroImageUrl: string | null // for edit mode
  ingredients: IngredientFormRow[]
  steps: StepFormRow[]
  tagIds: number[]
}

// Backend request types — use `name` (not `title`), step `description` (not `instruction`)
export interface CreateRecipeRequest {
  name: string
  description?: string
  servings?: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  isPublic?: boolean
  steps?: { stepOrder: number; description: string }[]
  ingredients?: {
    ingredientId: number
    amount: number
    unitId: number
    orderIndex: number
  }[]
  tagIds?: number[]
}

export interface UpdateRecipeRequest {
  name?: string
  description?: string
  servings?: number
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  isPublic?: boolean
  steps?: { stepOrder: number; description: string }[]
  ingredients?: {
    ingredientId: number
    amount: number
    unitId: number
    orderIndex: number
  }[]
  tagIds?: number[]
}

export function buildTagTree(tags: Tag[]): TagNode[] {
  const nodeMap = new Map<number, TagNode>()
  const roots: TagNode[] = []

  for (const tag of tags) {
    nodeMap.set(tag.id, { id: tag.id, name: tag.name, children: [] })
  }

  for (const tag of tags) {
    const node = nodeMap.get(tag.id)!
    if (tag.parentId === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(tag.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  }

  return roots
}
