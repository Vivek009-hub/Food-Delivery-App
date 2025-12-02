import axios from "axios"
import React, { useEffect } from 'react'
import{serverURL} from "../App"
import { useDispatch, useSelector } from "react-redux"
import { setMyOrders, setUserData } from "../redux/userSlice"

function useGetMyOrders() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/order/my-orders`, { withCredentials: true })

                dispatch(setMyOrders(result.data))

                console.log(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchOrders()
    }, [userData])
}

export default useGetMyOrders
