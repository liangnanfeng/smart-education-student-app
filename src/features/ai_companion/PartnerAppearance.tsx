import type { CompanionLoadout } from '../../app/model'
import { DEFAULT_COMPANION_ID, getCompanionItem } from './companionCatalog'
import './ai-companion.css'

type PartnerAppearanceProps = {
  loadout: CompanionLoadout
  size: 'login' | 'preview' | 'floating'
  motion?: 'idle' | 'run'
  interactive?: boolean
}

export function PartnerAppearance({ loadout, size, motion = 'idle', interactive = false }: PartnerAppearanceProps) {
  const selectedAppearance = getCompanionItem(loadout.equipped.appearance)
  const appearance = selectedAppearance?.category === 'appearance'
    ? selectedAppearance
    : getCompanionItem(DEFAULT_COMPANION_ID)!
  const selectedOutfit = getCompanionItem(loadout.equipped.outfit)
  const selectedDecoration = getCompanionItem(loadout.equipped.decoration)
  const outfit = selectedOutfit?.category === 'outfit' ? selectedOutfit : undefined
  const decoration = selectedDecoration?.category === 'decoration' ? selectedDecoration : undefined

  return (
    <span
      className={`partner-appearance partner-appearance--${size} ${interactive ? 'partner-appearance--interactive' : ''}`.trim()}
      data-testid="partner-appearance"
      data-size={size}
      data-companion-id={appearance.id}
      data-outfit-id={outfit?.id ?? ''}
      data-decoration-id={decoration?.id ?? ''}
      data-motion={motion}
    >
      <span className="partner-appearance__safe-frame">
        {decoration && <img data-testid="companion-decoration" className="partner-appearance__layer partner-appearance__decoration" src={decoration.asset} alt="" />}
        <span
          className={`partner-appearance__sprite partner-appearance__sprite--${motion}`}
          role="img"
          aria-label={`${appearance.name} AI 伙伴形象`}
          style={{ backgroundImage: `url(${appearance.asset})` }}
        />
        {outfit && <img data-testid="companion-outfit" className="partner-appearance__layer partner-appearance__outfit" src={outfit.asset} alt="" />}
      </span>
    </span>
  )
}
