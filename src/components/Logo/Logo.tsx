import { memo } from 'react'
import logoLight from '../../assets/LogoApp.webp'
import logoDark from '../../assets/LogoDarkMode.webp'
import { useTheme } from '../../hooks/useTheme'

import styles from './Logo.module.css'

interface LogoProps {
  size?: number
}

function Logo({ size = 96 }: LogoProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <span
      className={styles.logo}
      style={{ width: size }}
    >
      <img
        src={isDark ? logoDark : logoLight}
        alt="SAVIA University Library"
        width={size}
        height={isDark ? Math.round(size * 1048 / 1008) : size}
        decoding="async"
      />
    </span>
  )
}

export default memo(Logo)
