import User from "./models/user.model.js";

export const socketHandler = async (io) => {
    io.on('connection', (socket) => {
        socket.on('identity', async ({ userId }) => {
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { new: true });
            } catch (error) {
                console.log("Socket identity error:", error);
            }
        })

        // orr yha pr jo emit kia tha usko recieve krke database me upadte kr diya

        socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    isOnline: true,
                    socketId: socket.id
                })

                // and vo saari detials ko hmne user ko bhej diya taki user ko delivery boy ki live location dikhti rhe
                // user ko emit kr denge saari detials jo recive hongi Tracke Order page pr
                if (user) {
                    io.emit('updateDeliveryLocation', {
                        deliveryBoyId: userId,
                        latitude,
                        longitude
                    })
                }


            } catch (error) {
                console.log('updateDeliveryLocation error')
            }
        })


        socket.on('disconnect', async () => {
            try {
                await User.findOneAndUpdate({ socketId: socket.id }, {
                    isOnline: false,
                    socketId: null
                })
            } catch (error) {
                console.log(error)
            }
        })
    })
}