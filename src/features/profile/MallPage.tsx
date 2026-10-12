import { ArrowLeft, Check, Gem, PackageCheck, Palette, ShoppingBag, Shirt, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import type { CompanionCategory, CompanionLoadout } from '../../app/model'
import { COMPANION_CATALOG, getCompanionItem, type CompanionCatalogItem } from '../ai_companion/companionCatalog'
import { PartnerAppearance } from '../ai_companion/PartnerAppearance'
import './profile.css'

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'appearance', label: '形象' },
  { id: 'outfit', label: '服饰' },
  { id: 'decoration', label: '装饰' },
  { id: 'my', label: '我的' },
] as const

type MallCategory = typeof CATEGORIES[number]['id']

const CATEGORY_LABELS: Record<CompanionCategory, string> = {
  appearance: '形象',
  outfit: '服饰',
  decoration: '装饰',
}

function PreviewArtwork({ item, loadout }: { item: CompanionCatalogItem; loadout: CompanionLoadout }) {
  if (item.category === 'appearance') {
    return (
      <PartnerAppearance
        stage={item.stage}
        loadout={{
          ...loadout,
          equipped: { ...loadout.equipped, appearance: item.id },
        }}
        size="preview"
      />
    )
  }

  return <img className="mall-dialog-art" src={item.asset} alt={`${item.name} 3D ${item.description}`} />
}

export function MallPage({ onBack }: { onBack: () => void }) {
  const { state, purchaseCompanionItem, equipCompanionItem, unequipCompanionItem } = useAppState()
  const [category, setCategory] = useState<MallCategory>('all')
  const [selectedItem, setSelectedItem] = useState<CompanionCatalogItem | null>(null)
  const [equipPromptItem, setEquipPromptItem] = useState<CompanionCatalogItem | null>(null)
  const [toast, setToast] = useState('')
  const balance = state.pointsBalance
  const loadout = state.companions[state.stage]
  const currentAppearance = getCompanionItem(loadout.equipped.appearance)

  const stageItems = COMPANION_CATALOG.filter((item) => item.stage === state.stage)
  const ownedItems = stageItems.filter((item) => loadout.owned[item.category].includes(item.id))
  const visibleItems = category === 'all'
    ? stageItems
    : category === 'my'
      ? ownedItems
      : stageItems.filter((item) => item.category === category)
  const showingComingSoon = category !== 'all' && category !== 'my' && visibleItems.length === 0

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2000)
  }

  const buyItem = (item: CompanionCatalogItem) => {
    if (loadout.owned[item.category].includes(item.id)) {
      showToast('这件商品已经在你的账号里啦！')
      return
    }
    if (balance < item.price) {
      showToast('积分不够哦，继续学习攒积分吧！')
      return
    }

    purchaseCompanionItem(item.category, item.id, item.price)
    setSelectedItem(null)
    setEquipPromptItem(item)
  }

  const buySelectedItem = () => {
    if (selectedItem) buyItem(selectedItem)
  }

  const equipItem = (item: CompanionCatalogItem) => {
    equipCompanionItem(item.category, item.id)
    setSelectedItem(null)
    setEquipPromptItem(null)
    showToast(`已换上「${item.name}」`)
  }

  const unequipItem = (item: CompanionCatalogItem) => {
    if (item.category === 'appearance') return
    unequipCompanionItem(item.category)
    setSelectedItem(null)
    showToast(`已卸下「${item.name}」`)
  }

  const renderItemCard = (item: CompanionCatalogItem, wardrobe = false) => {
    const isOwned = loadout.owned[item.category].includes(item.id)
    const isEquipped = loadout.equipped[item.category] === item.id
    const categoryLabel = CATEGORY_LABELS[item.category]

    return (
      <article key={item.id} className={`mall-item mall-item-${categoryLabel} ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`}>
        <button
          className="mall-item-view"
          type="button"
          aria-label={`查看 ${item.name}`}
          onClick={() => setSelectedItem(item)}
        >
          <span className="mall-pet-frame" style={{ background: item.gradient }}>
            {item.category === 'appearance' ? (
              <span className="mall-pet-sprite" role="img" aria-label={`${item.name} AI 伙伴形象`} style={{ backgroundImage: `url(${item.asset})` }} />
            ) : (
              <img className="mall-product-art" src={item.asset} alt={`${item.name} 3D ${item.description}`} />
            )}
          </span>
          <strong>{item.name}</strong>
          <small>{item.description}</small>
        </button>

        {isEquipped ? (
          wardrobe && item.category !== 'appearance' ? (
            <button className="mall-unequip-button" type="button" aria-label={`卸下 ${item.name}`} onClick={() => unequipItem(item)}>
              卸下
            </button>
          ) : (
            <span className="mall-owned-tag mall-equipped-tag"><Check aria-hidden="true" size={12} />{item.category === 'appearance' && wardrobe ? '当前形象' : '已装备'}</span>
          )
        ) : isOwned ? (
          <button className="mall-equip-button" type="button" aria-label={`装上 ${item.name}`} onClick={() => equipItem(item)}>
            装上
          </button>
        ) : (
          <button
            className="mall-price mall-buy-button"
            type="button"
            aria-label={`购买 ${item.name}，${item.price} 积分`}
            onClick={() => buyItem(item)}
          >
            <Sparkles aria-hidden="true" size={12} />购买 · {item.price}
          </button>
        )}
      </article>
    )
  }

  return (
    <div className="rewards-page mall-page" data-stage={state.stage}>
      <header className="profile-page-header">
        <button className="profile-back" type="button" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1>积分商城</h1>
      </header>

      <div className="mall-balance">
        <Sparkles aria-hidden="true" size={18} />
        <span>当前积分 <strong>{balance.toLocaleString('zh-CN')}</strong></span>
        <ShoppingBag aria-hidden="true" size={18} />
      </div>

      <section className="mall-current-companion" aria-label="当前 AI 伙伴搭配">
        <PartnerAppearance stage={state.stage} loadout={loadout} size="floating" />
        <span>
          <small>正在陪你学习</small>
          <strong>当前伙伴：{currentAppearance?.name}</strong>
        </span>
      </section>

      <div className="mall-categories" role="tablist">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={category === item.id}
            className={category === item.id ? 'active' : ''}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {category === 'my' ? (
        <section className="mall-wardrobe" aria-label="我的 AI 伙伴衣橱">
          <header className="mall-wardrobe-header">
            <span className="mall-wardrobe-icon"><PackageCheck aria-hidden="true" size={20} /></span>
            <span><strong>我的搭配衣橱</strong><small>已购买的物品都在这里，随时装上或卸下</small></span>
          </header>
          {(Object.keys(CATEGORY_LABELS) as CompanionCategory[]).map((sectionCategory) => {
            const sectionItems = ownedItems.filter((item) => item.category === sectionCategory)
            return (
              <section className="mall-wardrobe-section" key={sectionCategory} aria-label={`我的${CATEGORY_LABELS[sectionCategory]}`}>
                <div className="mall-wardrobe-section-title">
                  <strong>{CATEGORY_LABELS[sectionCategory]}</strong>
                  <small>{sectionItems.length} 件</small>
                </div>
                {sectionItems.length > 0 ? (
                  <div className="mall-grid mall-wardrobe-grid">{sectionItems.map((item) => renderItemCard(item, true))}</div>
                ) : (
                  <div className="mall-wardrobe-empty">还没有已购买的{CATEGORY_LABELS[sectionCategory]}</div>
                )}
              </section>
            )
          })}
        </section>
      ) : !showingComingSoon && <div className="mall-grid">{visibleItems.map((item) => renderItemCard(item))}</div>}

      {showingComingSoon && <section className="mall-coming-soon" aria-label={`${CATEGORIES.find((item) => item.id === category)?.label}即将开放`}>
        {category === 'outfit' ? <Shirt aria-hidden="true" size={28} /> : <Palette aria-hidden="true" size={28} />}
        <strong>{CATEGORIES.find((item) => item.id === category)?.label}正在准备中</strong>
        <p>先把喜欢的 AI 伙伴带回学习世界，更多搭配很快和你见面。</p>
      </section>}

      {category === 'all' && <section className="mall-future-row" aria-label="更多商城内容正在准备中">
        <div><Shirt aria-hidden="true" size={17} /><span><strong>服饰</strong><small>为伙伴准备新搭配</small></span></div>
        <div><Gem aria-hidden="true" size={17} /><span><strong>装饰</strong><small>为学习空间添一点光</small></span></div>
      </section>}

      {selectedItem && (
        <div className="mall-dialog-backdrop">
          <section className="mall-dialog" role="dialog" aria-modal="true" aria-label={`${selectedItem.name} 商品预览`}>
            <button className="mall-dialog-close" type="button" aria-label="关闭商品预览" onClick={() => setSelectedItem(null)}>
              <X aria-hidden="true" size={18} />
            </button>
            <div className="mall-dialog-preview" style={{ background: selectedItem.gradient }}>
              <PreviewArtwork item={selectedItem} loadout={loadout} />
            </div>
            <small>{CATEGORY_LABELS[selectedItem.category]}</small>
            <h2>{selectedItem.name}</h2>
            <p>{selectedItem.description}，所有出现 AI 伙伴的位置都会同步这套搭配。</p>
            {loadout.equipped[selectedItem.category] === selectedItem.id ? selectedItem.category === 'appearance' ? (
              <span className="mall-dialog-equipped"><Check aria-hidden="true" size={15} />当前形象</span>
            ) : (
              <button className="mall-dialog-secondary" type="button" aria-label={`卸下 ${selectedItem.name}`} onClick={() => unequipItem(selectedItem)}>
                卸下 {selectedItem.name}
              </button>
            ) : loadout.owned[selectedItem.category].includes(selectedItem.id) ? (
              <button className="mall-dialog-primary" type="button" onClick={() => equipItem(selectedItem)}>
                装上 {selectedItem.name}
              </button>
            ) : (
              <button className="mall-dialog-primary" type="button" onClick={buySelectedItem} aria-label={`购买 ${selectedItem.name}`}>
                <Sparkles aria-hidden="true" size={14} />购买 {selectedItem.name} · {selectedItem.price} 积分
              </button>
            )}
          </section>
        </div>
      )}

      {equipPromptItem && (
        <div className="mall-dialog-backdrop">
          <section className="mall-dialog mall-equip-dialog" role="dialog" aria-modal="true" aria-label="现在换上吗？">
            <div className="mall-equip-dialog-icon"><Sparkles aria-hidden="true" size={24} /></div>
            <h2>现在换上吗？</h2>
            <p>「{equipPromptItem.name}」已经放进你的账号，可随时在积分商城切换。</p>
            <div className="mall-dialog-actions">
              <button className="mall-dialog-secondary" type="button" onClick={() => setEquipPromptItem(null)}>暂不更换</button>
              <button className="mall-dialog-primary" type="button" onClick={() => equipItem(equipPromptItem)}>现在换上</button>
            </div>
          </section>
        </div>
      )}

      {toast && <p className="mall-toast" role="status">{toast}</p>}
    </div>
  )
}
