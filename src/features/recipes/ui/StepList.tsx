import type { RecipeStep } from '@/features/recipes/api/types'

interface StepListProps {
  steps: RecipeStep[]
}

export function StepList({ steps }: StepListProps) {
  if (steps.length === 0) {
    return <p className="text-white/40 text-sm">No steps listed</p>
  }

  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li key={step.id} className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent-light flex items-center justify-center font-bold">
            {step.stepNumber}
          </span>
          <p className="text-white/80 leading-relaxed">{step.instruction}</p>
        </li>
      ))}
    </ol>
  )
}
