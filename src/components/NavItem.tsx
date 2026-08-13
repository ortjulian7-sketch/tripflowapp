import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

type NavItemLayout = 'horizontal' | 'vertical'

interface NavItemProps {
  to: string
  icon: IconName
  label: string
  layout: NavItemLayout
  end?: boolean
}

export function NavItem({ to, icon, label, layout, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        layout === 'horizontal'
          ? `flex items-center gap-3 rounded-button px-4 py-2.5 transition-colors ${
              isActive
                ? 'bg-surface-secondary font-semibold text-text-brand'
                : 'text-text-secondary'
            }`
          : `flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${
              isActive ? 'font-semibold text-text-brand' : 'text-text-secondary'
            }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            name={icon}
            size={20}
            className={isActive ? 'text-text-brand' : 'text-icon-secondary'}
          />
          <span className={layout === 'horizontal' ? 'text-sm' : 'text-[10px]'}>{label}</span>
        </>
      )}
    </NavLink>
  )
}
