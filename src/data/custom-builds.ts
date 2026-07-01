export interface CustomBuild {
  id?: string
  title: string
  description: string
  image: string
  images: string[]
  category: string
  sortOrder: number
  featured: boolean
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CustomBuildCategory {
  id?: string
  name: string
  sortOrder: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_CUSTOM_BUILDS: CustomBuild[] = []
export const DEFAULT_CUSTOM_BUILD_CATEGORIES: CustomBuildCategory[] = []
