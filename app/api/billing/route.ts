import { NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import {
  getSubscription,
  listTransactions,
  isAdmin,
} from '@/lib/billing'
import { PLAN_FEATURES } from '@/lib/pricing'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [subscription, transactions] = await Promise.all([
    getSubscription(user.id),
    listTransactions(user.id, 20),
  ])

  const isAdminUser = isAdmin(user.email ?? '')

  const features = subscription
    ? PLAN_FEATURES[subscription.plan]
    : null

  return NextResponse.json({
    data: {
      subscription,
      transactions,
      isAdmin: isAdminUser,
      features,
    },
  })
}
