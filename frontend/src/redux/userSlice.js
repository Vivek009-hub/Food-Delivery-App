import { createSlice } from "@reduxjs/toolkit";
import MyOrders from "../pages/MyOrders";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        city: null,
        currentState: null,
        currentAddress: null,
        shopInMyCity: null,
        itemsInMyCity: null,
        // cartItems:[{
        //     id:null,
        //     name:null,
        //     price:null,
        //     image:null,
        //     shop:null,
        //     quantity:null,
        //     foodType:null
        // }]
        cartItems: [],
        totalAmount: 0,
        myOrders: [],
        searchItems: null,
        socket: null,

    },
    // like for storing changes orr to make changes in state reducers are used
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload
        },
        setShopsInMyCity: (state, action) => {
            state.shopInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload  // (like ye jo current hai jaise hmne cartItem me 2 quantity krdi to agr id match hogi to real item ki bhi 2 hi ho jygi jise hmm id se find kr rhe hai ) 
            const existingItem = state.cartItems.find(i => i.id == cartItem.id)  //it will check whether the item is already in cart ( agr hoga to hmm new add nhi krnge bs count bdha denge frontend me )
            if (existingItem) {
                existingItem.quantity = cartItem.quantity
            } else {
                state.cartItems.push(cartItem)
            }

            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)   // ye 0 iski intial value set kri hai
        },
        // To update quantity in cart in real time
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const item = state.cartItems.find(i => i.id == id)
            if (item) {
                item.quantity = quantity
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        },

        // For removing from cart
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload

        },
        addmyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders]
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload
            const order = state.myOrders.find(o => o._id == orderId)
            if (order) {
                if (order.shopOrders && order.shopOrders.shop._id == shopId) {
                    order.shopOrders.status = status
                }
            }
        },
        updateRealtimeOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload
            const order = state.myOrders.find(o => o._id == orderId)
            if (order) {
                const shopOrder = order.shopOrders.find(so => so.shop._id == shopId)
                if (shopOrder) {
                    shopOrder.status = status
                }
            }
        },

        setSearchItems: (state, action) => {
            state.searchItems = action.payload
        },
        setSocket: (state, action) => {
            state.socket = action.payload
        }

    }
})

export const { setSearchItems, setUserData, setCurrentCity, setCurrentState, setCurrentAddress, setShopsInMyCity, setItemsInMyCity, addToCart, updateQuantity, removeCartItem, setMyOrders, addmyOrder, updateOrderStatus, setSocket,updateRealtimeOrderStatus } = userSlice.actions
export default userSlice.reducer