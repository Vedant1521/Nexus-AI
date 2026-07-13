import { useEffect } from 'react'
import api from '../utils/axios'
import { useDispatch } from 'react-redux'
import { setUserData, authFailed } from '../redux/user.slice'

function useCurrentUser() {
    const dispatch = useDispatch()

    useEffect(() => {
        const get = async () => {
            try {
                const { data } = await api.get("/api/me")
                dispatch(setUserData(data.user))
            } catch (error) {
                const status = error?.response?.status
                dispatch(authFailed(status === 401 ? "not_authenticated" : "network_error"))
            }
        }
        get()
    }, [dispatch])
}

export default useCurrentUser
