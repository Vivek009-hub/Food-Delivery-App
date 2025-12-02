import axios from 'axios'
import React, { useEffect } from 'react'
import { serverURL } from '../App'
import { useDispatch, useSelector } from 'react-redux'


function useUpdateLocation() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        const updateLocation = async (lat, lon) => {
            const result = await axios.post(`${serverURL}/api/user/update-location`, { lat, lon },
                { withCredentials: true }
            )
            console.log(result.data)
        }

        // watchPosition is used to get the current location of the user ( it is like watching the location and its change , and it is sloghtly different from getCurrentPosition)
        navigator.geolocation.watchPosition((pos) => {
            updateLocation(pos.coords.latitude, pos.coords.longitude)
        })
    }, [userData])
}


export default useUpdateLocation
