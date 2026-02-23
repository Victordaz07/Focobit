import { getFirestoreDb, doc, getDoc, updateDoc } from './firestore'
import type { PurchasedItem, StoreItem } from '@focobit/shared'

export interface PurchaseResult {
  success: boolean
  error?: 'insufficient_coins' | 'already_owned' | 'level_required' | 'unknown'
  newCoinsBalance?: number
}

export async function getUserStoreData(uid: string): Promise<{
  coins: number
  purchasedItems: PurchasedItem[]
  equippedTheme: string
  equippedAvatar: string
  equippedBadge: string
}> {
  const db = getFirestoreDb()
  const gamRef = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(gamRef)
  const data = snap.data() ?? {}
  return {
    coins: data.coins ?? 0,
    purchasedItems: data.purchasedItems ?? [],
    equippedTheme: data.equippedTheme ?? 'default',
    equippedAvatar: data.equippedAvatar ?? 'avatar_brain',
    equippedBadge: data.equippedBadge ?? '',
  }
}

export async function purchaseItem(
  uid: string,
  item: StoreItem,
  userLevel: number
): Promise<PurchaseResult> {
  const db = getFirestoreDb()
  const gamRef = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(gamRef)
  const data = snap.data() ?? {}

  const currentCoins: number = data.coins ?? 0
  const purchasedItems: PurchasedItem[] = data.purchasedItems ?? []

  // Validaciones
  if (item.unlockLevel != null && userLevel < item.unlockLevel) {
    return { success: false, error: 'level_required' }
  }
  if (purchasedItems.some(p => p.itemId === item.id)) {
    return { success: false, error: 'already_owned' }
  }
  if (currentCoins < item.price) {
    return { success: false, error: 'insufficient_coins' }
  }

  const newCoins = currentCoins - item.price
  const newPurchased: PurchasedItem = {
    itemId: item.id,
    purchasedAt: Date.now(),
    isEquipped: false,
  }

  await updateDoc(gamRef, {
    coins: newCoins,
    purchasedItems: [...purchasedItems, newPurchased],
  })

  return { success: true, newCoinsBalance: newCoins }
}

export async function equipItem(
  uid: string,
  item: StoreItem
): Promise<void> {
  const db = getFirestoreDb()
  const gamRef = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(gamRef)
  const data = snap.data() ?? {}
  const purchasedItems: PurchasedItem[] = data.purchasedItems ?? []

  const categoryPrefix = item.category + '_'
  const updatedItems = purchasedItems.map(p => ({
    ...p,
    isEquipped: p.itemId === item.id
      ? true
      : (p.itemId.startsWith(categoryPrefix) ? false : p.isEquipped),
  }))

  const updateField: Record<string, unknown> = { purchasedItems: updatedItems }

  if (item.category === 'theme') updateField.equippedTheme = item.id
  if (item.category === 'avatar') updateField.equippedAvatar = item.id
  if (item.category === 'badge') updateField.equippedBadge = item.id

  await updateDoc(gamRef, updateField)
}

export async function activatePowerUp(
  uid: string,
  itemId: string
): Promise<void> {
  const db = getFirestoreDb()
  const gamRef = doc(db, 'users', uid, 'gamification', 'profile')
  const snap = await getDoc(gamRef)
  const data = snap.data() ?? {}
  const purchasedItems: PurchasedItem[] = data.purchasedItems ?? []

  const updatedItems = purchasedItems.filter(p => p.itemId !== itemId)
  const updateData: Record<string, unknown> = { purchasedItems: updatedItems }

  if (itemId === 'powerup_xp_boost') {
    updateData.xpBoostUntil = Date.now() + 24 * 60 * 60 * 1000
  }
  if (itemId === 'powerup_streak_shield') {
    updateData.streakShieldActive = true
  }

  await updateDoc(gamRef, updateData)
}
