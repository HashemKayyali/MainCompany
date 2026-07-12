import type { NextRequest } from 'next/server'
import { submitPublicForm } from '@/server/forms/submit-public-form'

export const POST = (request: NextRequest) => submitPublicForm(request, 'custom-build')
