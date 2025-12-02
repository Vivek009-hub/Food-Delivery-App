//  In Hooks basically we write fucntion that we have to use again and again so we wrtie in a separate file for ease of use
import axios from "axios"
import React, { useEffect } from 'react'
import{serverURL} from "../App"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

function userGetCurrentUser() {
    const dispatch=useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/user/current`, { withCredentials: true })

                dispatch(setUserData(result.data))

                // console.log(result)
            } catch (error) {
                console.log(error)
            }
        }
        fetchUser()
    }, [])
}

export default userGetCurrentUser
