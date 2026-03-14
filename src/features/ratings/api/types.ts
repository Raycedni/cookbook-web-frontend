export interface RatingCriterion {
  id: number
  name: string
  description?: string
}

export interface RatingSummary {
  overallAverage: number
  criteriaAverages: {
    criterionId: number
    criterionName: string
    average: number
  }[]
  totalRatings: number
}

export interface UserRating {
  id: number
  scores: {
    criterionId: number
    score: number
  }[]
  createdAt: string
}

export interface RatingSubmission {
  scores: {
    criterionId: number
    score: number
  }[]
}
