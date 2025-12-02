import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name:"owner",
    initialState:{
        myShopData:null,
    },
    // like for storing changes orr to make changes in state reducers are used
    reducers:{
        setmyShopData:(state,action)=>{
            state.myShopData=action.payload
        }
    }
})

export const{setmyShopData}=ownerSlice.actions
export default ownerSlice.reducer