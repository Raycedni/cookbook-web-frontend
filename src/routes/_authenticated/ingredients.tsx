import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ingredients')({
  component: IngredientsPage,
})

function IngredientsPage() {
  return <div>TODO</div>
}
