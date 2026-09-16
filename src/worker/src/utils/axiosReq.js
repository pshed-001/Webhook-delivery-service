import axios from "axios";

const req =  await axios({
    method: "get",
    url: "https://jsonplaceholder.typicode.com/todos/1",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
})
console.log(req.headers);
export default req;

async function axiosReq(delivery){
    
}