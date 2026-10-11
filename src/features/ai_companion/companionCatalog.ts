import type { CompanionCategory, LearningStage } from '../../app/model'

export type CompanionCatalogItem = {
  id: string
  name: string
  price: number
  stage: LearningStage
  asset: string
  gradient: string
  category: CompanionCategory
  description: string
}

export const DEFAULT_COMPANION_IDS: Record<LearningStage, string> = {
  elementary: 'momo',
  secondary: 'nimbo',
}

export const COMPANION_CATALOG: CompanionCatalogItem[] = [
  { id: 'momo', name: '绒桃 Momo', stage: 'elementary', price: 280, asset: '/pets/momo.png', gradient: 'linear-gradient(145deg, #FFF0E8, #FFD2C6)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'yunduo', name: '云朵 Yunduo', stage: 'elementary', price: 360, asset: '/pets/yunduo.png', gradient: 'linear-gradient(145deg, #FFF8ED, #F8DDEA)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloudbloom', name: '云绽 Cloudbloom', stage: 'elementary', price: 420, asset: '/pets/cloudbloom.png', gradient: 'linear-gradient(145deg, #FFF4E9, #FAD6E5)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloudbelle', name: '云贝儿 Cloudbelle', stage: 'elementary', price: 480, asset: '/pets/cloudbelle.png', gradient: 'linear-gradient(145deg, #FCEFFF, #E4DCF8)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'nimbo', name: '云宝 Nimbo', stage: 'secondary', price: 300, asset: '/pets/nimbo.png', gradient: 'linear-gradient(145deg, #E9F5FF, #BFD9F1)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'nimbli', name: '霁绒 Nimbli', stage: 'secondary', price: 380, asset: '/pets/nimbli.png', gradient: 'linear-gradient(145deg, #EEF0FF, #CCD7F4)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'aether', name: '澄霄 Aether', stage: 'secondary', price: 460, asset: '/pets/aether.png', gradient: 'linear-gradient(145deg, #E6F8FF, #BFDDEA)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'yunluo', name: '云珞 Yunluo', stage: 'secondary', price: 520, asset: '/pets/yunluo.png', gradient: 'linear-gradient(145deg, #EFF5FF, #D6D4F2)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloud-backpack', name: '云朵小背包', stage: 'elementary', price: 160, asset: '/mall/elementary/cloud-backpack.png', gradient: 'linear-gradient(145deg, #FFF9EE, #FFE4DC)', category: 'outfit', description: '伙伴服饰' },
  { id: 'dawn-cloud-wand', name: '晨光云杖', stage: 'elementary', price: 220, asset: '/mall/elementary/dawn-cloud-wand.png', gradient: 'linear-gradient(145deg, #FFF9EE, #FFE2C4)', category: 'outfit', description: '伙伴服饰' },
  { id: 'cloud-flower-lamp', name: '云光花灯', stage: 'elementary', price: 180, asset: '/mall/elementary/cloud-flower-lamp.png', gradient: 'linear-gradient(145deg, #FFF8E9, #FFE3CF)', category: 'decoration', description: '学习空间装饰' },
  { id: 'rainbow-cloud-gate', name: '彩虹云门', stage: 'elementary', price: 260, asset: '/mall/elementary/rainbow-cloud-gate.png', gradient: 'linear-gradient(145deg, #FFF5EE, #FFE0E0)', category: 'decoration', description: '学习空间装饰' },
  { id: 'flower-cloud-windchime', name: '花云风铃', stage: 'elementary', price: 200, asset: '/mall/elementary/flower-cloud-windchime.png', gradient: 'linear-gradient(145deg, #FFF8F0, #FFE4D7)', category: 'decoration', description: '学习空间装饰' },
  { id: 'cloud-flower-chair', name: '云朵花椅', stage: 'elementary', price: 300, asset: '/mall/elementary/cloud-flower-chair.png', gradient: 'linear-gradient(145deg, #FFF7ED, #FFDCD0)', category: 'decoration', description: '学习空间装饰' },
  { id: 'moon-bell', name: '澄月铃饰', stage: 'secondary', price: 240, asset: '/mall/secondary/moon-bell.png', gradient: 'linear-gradient(145deg, #F5FBFF, #D6E9FB)', category: 'outfit', description: '伙伴铃饰' },
  { id: 'cloud-crystal-case', name: '云纹晶匣', stage: 'secondary', price: 320, asset: '/mall/secondary/cloud-crystal-case.png', gradient: 'linear-gradient(145deg, #F8FBFF, #E0E4FA)', category: 'outfit', description: '伙伴配件' },
  { id: 'wing-crystal-wand', name: '星羽晶杖', stage: 'secondary', price: 420, asset: '/mall/secondary/wing-crystal-wand.png', gradient: 'linear-gradient(145deg, #F4FAFF, #D8E6FC)', category: 'outfit', description: '伙伴配件' },
  { id: 'wing-crystal-gate', name: '翼晶云门', stage: 'secondary', price: 360, asset: '/mall/secondary/wing-crystal-gate.png', gradient: 'linear-gradient(145deg, #F5FBFF, #DDE4FC)', category: 'decoration', description: '学习空间装饰' },
  { id: 'stellar-orbital-observatory', name: '星环观测仪', stage: 'secondary', price: 380, asset: '/mall/secondary/stellar-orbital-observatory.png', gradient: 'linear-gradient(145deg, #F1FBFF, #D8EEFA)', category: 'decoration', description: '学习空间装饰' },
  { id: 'sky-cloud-throne', name: '霄云王座', stage: 'secondary', price: 520, asset: '/mall/secondary/sky-cloud-throne.png', gradient: 'linear-gradient(145deg, #F7FAFF, #E5E3FB)', category: 'decoration', description: '学习空间装饰' },
]

export function getCompanionItem(id: string | null | undefined) {
  return id ? COMPANION_CATALOG.find((item) => item.id === id) : undefined
}

export function getStageCompanionItems(stage: LearningStage) {
  return COMPANION_CATALOG.filter((item) => item.stage === stage)
}
