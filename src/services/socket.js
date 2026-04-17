import { io } from 'socket.io-client';

const socket = io("https://nagarbot-backend-3.onrender.com/api", { autoConnect: true });
export default socket;
