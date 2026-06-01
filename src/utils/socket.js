import { io } from 'socket.io-client';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if(!BACKEND_URL){
    console.log("Error fetching Backend URL from env");
}

export const initializeSocket = () => {
    const socket = io(BACKEND_URL, {
        withCredentials: true,
        autoConnect: false,
        transports: ['polling']
    });

    return socket;
};