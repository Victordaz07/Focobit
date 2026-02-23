export type StoreItemCategory = 'theme' | 'avatar' | 'powerup' | 'badge'

export interface StoreItem {
  id: string
  title: string
  description: string
  emoji: string
  category: StoreItemCategory
  price: number // en coins
  unlockLevel?: number // nivel mínimo requerido
  isPremium?: boolean
}

export interface PurchasedItem {
  itemId: string
  purchasedAt: number
  isEquipped: boolean
}

export interface UserStore {
  coins: number
  purchasedItems: PurchasedItem[]
  equippedTheme: string
  equippedAvatar: string
  equippedBadge: string
}
