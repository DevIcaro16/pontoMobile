import axios from "axios";
import { useEffect, useState } from "react";
import { NetworkInfo } from "react-native-network-info";




// useEffect(() => {
//     const [ip, setIp] = useState<string | null>(null);

//     const IpLocal = () => {
//         NetworkInfo.getIPAddress().then(setIp);
//         console.log("IP LOCAL: " + ip);
//     }

//     // IpLocal();

// }, []);



const api = axios.create({
    baseURL: "http://192.168.15.4:3232",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;