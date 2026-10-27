import { useEffect, type ReactNode } from 'react'
import { setUser } from '../../src/features/auth/authSlice'
import { useAppDispatch } from '../../src/hooks/reduxHooks'

export default function DemoAuthListener({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setUser({
      uid: 'portfolio-demo-user',
      fullName: 'Fernanda Escobar',
      username: 'fernanda',
      email: 'demo@savia.local',
      universityCode: 'SAVIA001',
    }))
  }, [dispatch])

  return children
}
