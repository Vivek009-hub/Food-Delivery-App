import axios from "axios"
import React, { useEffect } from 'react'
import{serverURL} from "../App"
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from "../redux/userSlice"
import { setmyShopData } from "../redux/ownerSlice"

function useGetMyShop() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/shop/get-my`, { withCredentials: true })

                dispatch(setmyShopData(result.data))

                // console.log(result)
            } catch (error) {
                console.log(error)
            }
        }
        fetchShop()
    }, [userData])
}

export default useGetMyShop
