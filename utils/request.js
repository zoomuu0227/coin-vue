import axios from "axios";

const request = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

export default request;