import type { CompanionLoadout, LearningStage } from '../../app/model'
import { DEFAULT_COMPANION_IDS, getCompanionItem } from './companionCatalog'
import './ai-companion.css'

type PartnerAppearanceProps = {
  stage: LearningStage
  loadout: CompanionLoadout
  size: 'login' | 'preview' | 'floating'
  interactive?: boolean
  className?: string
}

export function PartnerAppearance({ stage, loadout, size, interactive = false, className = '' }: PartnerAppearanceProps) {
  const selectedAppearance = getCompanionItem(loadout.equipped.appearance)
  const appearance = selectedAppearance?.stage === stage && selectedAppearance.category === 'appearance'
    ? selectedAppearance
    : getCompanionItem(DEFAULT_COMPANION_IDS[stage])!
  const selectedOutfit = getCompanionItem(loadout.equipped.outfit)
  const selectedDecoration = getCompanionItem(loadout.equipped.decoration)
  const outfit = selectedOutfit?.stage === stage && selectedOutfit.category === 'outfit' ? selectedOutfit : undefined
  const decoration = selectedDecoration?.stage === stage && selectedDecoration.category === 'decoration' ? selectedDecoration : undefined

  return (
    <span
      className={`partner-appearance partner-appearance--${size} ${interactive ? 'partner-appearance--interactive' : ''} ${className}`.trim()}
      data-testid="partner-appearance"
      data-size={size}
      data-companion-id={appearance.id}
      data-outfit-id={outfit?.id ?? ''}
      data-decoration-id={decoration?.id ?? ''}
    >
      <span className="partner-appearance__safe-frame">
        {decoration && <img data-testid="companion-decoration" className="partner-appearance__layer partner-appearance__decoration" src={decoration.asset} alt="" />}
        <span
          className="partner-appearance__sprite"
          role="img"
          aria-label={`${appearance.name} AI 伙伴形象`}
          style={{ backgroundImage: `url(${appearance.asset})` }}
        />
        {outfit && <img data-testid="companion-outfit" className="partner-appearance__layer partner-appearance__outfit" src={outfit.asset} alt="" />}
      </span>
    </span>
  )
}
