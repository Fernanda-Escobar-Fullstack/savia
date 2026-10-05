import type { InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

function TextField({
  label,
  id,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      {label && (
        <span className={styles.label}>
          {label}
        </span>
      )}

      <input
        id={id}
        className={`${styles.input} ${className}`}
        {...props}
      />
    </label>
  )
}

export default TextField