import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, ActivityIndicator, Alert,
} from 'react-native'
import { useAuthStore, useGamificationStore, useThemeStore } from '../../stores'
import {
  getUserStoreData, purchaseItem, equipItem, activatePowerUp,
} from '@focobit/firebase-config'
import { ITEMS_BY_CATEGORY, type StoreItem, type StoreItemCategory, type AppTheme } from '@focobit/shared'
import { trackEvent } from '../../hooks/useAnalytics'

const CATEGORIES: { id: StoreItemCategory; label: string; emoji: string }[] = [
  { id: 'powerup', label: 'Power-ups', emoji: '⚡' },
  { id: 'theme', label: 'Temas', emoji: '🎨' },
  { id: 'avatar', label: 'Avatares', emoji: '🦊' },
  { id: 'badge', label: 'Badges', emoji: '🏅' },
]

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
    title: { fontSize: 28, fontWeight: '800', color: theme.text },
    coinsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    coinsEmoji: { fontSize: 16 },
    coinsVal: { fontSize: 18, fontWeight: '800', color: '#FFD60A' },
    tabs: { paddingHorizontal: 16, marginBottom: 8, flexGrow: 0 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: theme.surface },
    tabActive: { backgroundColor: theme.accent },
    tabEmoji: { fontSize: 16 },
    tabLabel: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
    tabLabelActive: { color: theme.text },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
    itemCard: { width: '47%', backgroundColor: theme.surface, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
    itemCardOwned: { borderColor: theme.green + '22' },
    itemCardEquipped: { borderColor: theme.accent },
    itemCardLocked: { opacity: 0.4 },
    equippedDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent },
    itemEmoji: { fontSize: 32 },
    itemTitle: { fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' },
    itemTitleLocked: { color: theme.textMuted },
    lockLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
    ownedLabel: { fontSize: 11, color: theme.green, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    priceEmoji: { fontSize: 14 },
    priceVal: { fontSize: 15, fontWeight: '800', color: '#FFD60A' },
    priceInsufficient: { color: theme.danger },
    modalOverlay: { flex: 1, backgroundColor: '#00000080', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, alignItems: 'center', gap: 10 },
    modalEmoji: { fontSize: 56 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: theme.text },
    modalDesc: { fontSize: 14, color: theme.textMuted, textAlign: 'center', lineHeight: 22 },
    modalPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modalPriceEmoji: { fontSize: 18 },
    modalPriceVal: { fontSize: 16, fontWeight: '700', color: '#FFD60A' },
    modalBalance: { fontSize: 13 },
    modalBalanceOk: { color: theme.green },
    modalBalanceLow: { color: theme.danger },
    modalActions: { width: '100%', gap: 10, marginTop: 8 },
    primaryBtn: { backgroundColor: theme.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.4 },
    primaryBtnText: { color: theme.text, fontWeight: '800', fontSize: 16 },
    cancelBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
    cancelBtnText: { color: theme.textMuted, fontWeight: '600', fontSize: 15 },
  })
}

export default function StoreScreen() {
  const { theme } = useThemeStore()
  const s = createStyles(theme)
  const { user } = useAuthStore()
  const { profile: gamProfile } = useGamificationStore()
  const [category, setCategory] = useState<StoreItemCategory>('powerup')
  const [coins, setCoins] = useState(0)
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [equippedTheme, setEquippedTheme] = useState('default')
  const [equippedAvatar, setEquippedAvatar] = useState('avatar_brain')
  const [equippedBadge, setEquippedBadge] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const uid = user?.uid ?? ''
  const level = gamProfile?.level ?? 1

  const loadStore = useCallback(async () => {
    if (!uid) return
    const data = await getUserStoreData(uid)
    setCoins(data.coins)
    setPurchasedIds(data.purchasedItems.map(p => p.itemId))
    setEquippedTheme(data.equippedTheme)
    setEquippedAvatar(data.equippedAvatar)
    setEquippedBadge(data.equippedBadge)
    setLoading(false)
  }, [uid])

  useEffect(() => { loadStore() }, [loadStore])

  async function handlePurchase(item: StoreItem) {
    setPurchasing(true)
    const result = await purchaseItem(uid, item, level)
    if (result.success) {
      setCoins(result.newCoinsBalance ?? coins - item.price)
      setPurchasedIds(prev => [...prev, item.id])
      await trackEvent('store_item_purchased', {
        item_id: item.id,
        category: item.category,
        price: item.price,
      })
      Alert.alert('¡Comprado! 🎉', `${item.emoji} ${item.title} está en tu inventario.`)
    } else {
      const messages: Record<string, string> = {
        insufficient_coins: `Te faltan ${item.price - coins} monedas 🪙`,
        already_owned: 'Ya tienes este ítem',
        level_required: `Necesitas nivel ${item.unlockLevel} para desbloquearlo`,
        unknown: 'Error desconocido',
      }
      Alert.alert('No se pudo comprar', messages[result.error ?? 'unknown'])
    }
    setPurchasing(false)
    setSelectedItem(null)
  }

  async function handleEquip(item: StoreItem) {
    await equipItem(uid, item)
    if (item.category === 'theme') setEquippedTheme(item.id)
    if (item.category === 'avatar') setEquippedAvatar(item.id)
    if (item.category === 'badge') setEquippedBadge(item.id)
    await trackEvent('store_item_equipped', { item_id: item.id, category: item.category })
    Alert.alert('¡Equipado! ✓', `${item.emoji} ${item.title} ahora está activo.`)
    setSelectedItem(null)
  }

  async function handleActivatePowerUp(item: StoreItem) {
    Alert.alert(
      `Activar ${item.emoji} ${item.title}`,
      item.description,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: async () => {
            await activatePowerUp(uid, item.id)
            setPurchasedIds(prev => prev.filter(id => id !== item.id))
            await trackEvent('powerup_activated', { item_id: item.id })
            Alert.alert('¡Activado! ⚡', `${item.title} está activo.`)
            setSelectedItem(null)
          },
        },
      ]
    )
  }

  const items = ITEMS_BY_CATEGORY[category]
  const isEquipped = (item: StoreItem) => {
    if (item.category === 'theme') return equippedTheme === item.id
    if (item.category === 'avatar') return equippedAvatar === item.id
    if (item.category === 'badge') return equippedBadge === item.id
    return false
  }

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Tienda</Text>
        <View style={s.coinsRow}>
          <Text style={s.coinsEmoji}>🪙</Text>
          <Text style={s.coinsVal}>{loading ? '...' : coins}</Text>
        </View>
      </View>

      {/* Tabs de categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.tab, category === cat.id && s.tabActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Text style={s.tabEmoji}>{cat.emoji}</Text>
            <Text style={[s.tabLabel, category === cat.id && s.tabLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid de ítems */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.grid}>
          {items.map(item => {
            const owned = purchasedIds.includes(item.id)
            const equipped = isEquipped(item)
            const locked = item.unlockLevel != null ? level < item.unlockLevel : false
            const canAfford = coins >= item.price

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  s.itemCard,
                  owned && s.itemCardOwned,
                  equipped && s.itemCardEquipped,
                  locked && s.itemCardLocked,
                ]}
                onPress={() => !locked && setSelectedItem(item)}
                activeOpacity={locked ? 1 : 0.7}
              >
                {equipped && <View style={s.equippedDot} />}
                <Text style={s.itemEmoji}>{locked ? '🔒' : item.emoji}</Text>
                <Text style={[s.itemTitle, locked && s.itemTitleLocked]}>
                  {item.title}
                </Text>
                {locked ? (
                  <Text style={s.lockLabel}>Nv. {item.unlockLevel}</Text>
                ) : owned ? (
                  <Text style={s.ownedLabel}>
                    {equipped ? '✓ Equipado' : 'En inventario'}
                  </Text>
                ) : (
                  <View style={s.priceRow}>
                    <Text style={s.priceEmoji}>🪙</Text>
                    <Text style={[s.priceVal, !canAfford && s.priceInsufficient]}>
                      {item.price}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}

      {/* Modal de detalle */}
      {selectedItem && (
        <Modal transparent animationType="slide" visible>
          <View style={s.modalOverlay}>
            <View style={s.modalSheet}>
              <Text style={s.modalEmoji}>{selectedItem.emoji}</Text>
              <Text style={s.modalTitle}>{selectedItem.title}</Text>
              <Text style={s.modalDesc}>{selectedItem.description}</Text>

              {purchasedIds.includes(selectedItem.id) ? (
                <View style={s.modalActions}>
                  {selectedItem.category === 'powerup' ? (
                    <TouchableOpacity
                      style={s.primaryBtn}
                      onPress={() => handleActivatePowerUp(selectedItem)}
                    >
                      <Text style={s.primaryBtnText}>⚡ Activar ahora</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[s.primaryBtn, isEquipped(selectedItem) && s.primaryBtnDisabled]}
                      onPress={() => handleEquip(selectedItem)}
                      disabled={isEquipped(selectedItem)}
                    >
                      <Text style={s.primaryBtnText}>
                        {isEquipped(selectedItem) ? '✓ Ya equipado' : '✓ Equipar'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.cancelBtn} onPress={() => setSelectedItem(null)}>
                    <Text style={s.cancelBtnText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.modalActions}>
                  <View style={s.modalPriceRow}>
                    <Text style={s.modalPriceEmoji}>🪙</Text>
                    <Text style={s.modalPriceVal}>{selectedItem.price} monedas</Text>
                    <Text style={[s.modalBalance, coins >= selectedItem.price ? s.modalBalanceOk : s.modalBalanceLow]}>
                      (tienes {coins})
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[s.primaryBtn, (purchasing || coins < selectedItem.price) && s.primaryBtnDisabled]}
                    onPress={() => handlePurchase(selectedItem)}
                    disabled={purchasing || coins < selectedItem.price}
                  >
                    {purchasing
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={s.primaryBtnText}>
                          {coins < selectedItem.price ? '🪙 Monedas insuficientes' : `🛒 Comprar por ${selectedItem.price}`}
                        </Text>
                    }
                  </TouchableOpacity>
                  <TouchableOpacity style={s.cancelBtn} onPress={() => setSelectedItem(null)}>
                    <Text style={s.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

