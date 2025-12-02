//  In Hooks basically we write fucntion that we have to use again and again so we wrtie in a separate file for ease of use
import axios from "axios"
import React, { useEffect } from 'react'
import{serverURL} from "../App"
import { useDispatch, useSelector } from "react-redux"
import { setItemsInMyCity } from "../redux/userSlice"

function useGetItemByCity() {
    const dispatch=useDispatch()
    const {currentCity}=useSelector(state=>state.user)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const result = await axios.get(`${serverURL}/api/item/get-by-city/${currentCity}`, { withCredentials: true })

                dispatch(setItemsInMyCity(result.data))

                console.log(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchItems()
    }, [currentCity])
}

export default useGetItemByCity
