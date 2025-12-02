//  In Hooks basically we write fucntion that we have to use again and again so we wrtie in a separate file for ease of use
import axios from "axios"
import React, { useEffect } from 'react'
import{serverURL} from "../App"
import { useDispatch, useSelector } from "react-redux"
import { setShopsInMyCity } from "../redux/userSlice"

function useGetShopByCity() {
    const dispatch=useDispatch()
    const {currentCity}=useSelector(state=>state.user)

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/shop/get-by-city/${currentCity}`, { withCredentials: true })

                dispatch(setShopsInMyCity(result.data))

                console.log(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchShops()
    }, [currentCity])
}

export default useGetShopByCity
