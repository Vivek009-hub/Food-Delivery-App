// page to display particular whole shop with its items

import axios from 'axios'
import React, { use, useEffect, useState } from 'react'
import { serverURL } from '../App'
import { useNavigate, useParams } from 'react-router-dom';
import { FaStore } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { FaArrowLeft } from "react-icons/fa";


function Shop() {
    const { shopId } = useParams();
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState([]);
    const navigate = useNavigate();
    const handleShop = async () => {
        try {
            const result = await axios.get(`${serverURL}/api/item/get-by-shop/${shopId}`, { withCredentials: true })

            setShop(result.data.shop);
            setItems(result.data.items);
            // console.log(result.data)
        } catch (error) {
            return console.log(error)
        }
    }

    useEffect(() => {
        handleShop();
    }, [shopId])

    return (
        <div className='min-h-screen bg-gray-50'>


            <button className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow transition ' onClick={()=> navigate(-1)}>
                <FaArrowLeft />

                <span>Back</span>
            </button>
            {shop && <div className='relative w-full h-64 md:h-80 lg:h-96'>
                <img src={shop?.image} alt="" className='w-full h-full object-cover brightness-75' />

                <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
                    <FaStore size={50} className='text-white text-4xl mb-3 drop-shadow-md' />
                    <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
                    <div className='flex items-center justify-center gap-[10px]'>
                        <FaLocationDot size={22} color='red' className='mt-[10px]' />
                        <p className='text-lg font-medium text-gray-200 mt-[10px]'>{shop.address}</p>

                    </div>
                </div>

            </div>}


            <div className='max-w-7xl mx-auto px-6 py-10'>
                <h2 className='flex items-center justify-center gap-3 text-3xl font-bold text-gray-800 mb-10 '><FaUtensils color='red' />Our Menu</h2>

                {items.length > 0 ? (
                    <div className='flex flex-wrap justify-center gap-8'>
                        {items.map((item) => (
                            <FoodCard data={item} />
                        ))}
                    </div>
                ) : <p className='text-center text-gray-500 text-lg'>No Items Available</p>}
            </div>

        </div>
    )
}

export default Shop
