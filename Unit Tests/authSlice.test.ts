import authReducer, {
  setAuthError,
  setAuthLoading,
  setUser,
} from '../src/features/auth/authSlice'

const user = {
  uid: 'user-1',
  fullName: 'Ana Perez',
  username: 'ana',
  email: 'ana@university.edu',
  universityCode: 'UNI001',
}

describe('authSlice', () => {
  it('guarda el usuario y termina la carga', () => {
    const state = authReducer(undefined, setUser(user))

    expect(state.user).toEqual(user)
    expect(state.loading).toBe(false)
  })

  it('actualiza el estado de carga', () => {
    const state = authReducer(
      undefined,
      setAuthLoading(false)
    )

    expect(state.loading).toBe(false)
  })

  it('guarda un error y termina la carga', () => {
    const state = authReducer(
      undefined,
      setAuthError('Login failed.')
    )

    expect(state.error).toBe('Login failed.')
    expect(state.loading).toBe(false)
  })
})
