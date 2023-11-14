import axios from 'axios'
const globalRequestAxios = (req,userData,apiUrl,auth,access_token) => {

//   const config = {
//     headers : {'x-api-key': "al-mahara-2023-development-api-key"}
//   };
const config ={
    headers: {
        "Content-Type": "application/json",
        "x-access-token":  access_token
    }
}
    return new Promise((resolve,reject)=>{
        if(req=='get'){
            axios.get(`${process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT}/${apiUrl}`,config)
            .then((res)=>{
                let response = res.data;
                // if (res?.response?.status === 401) { sessionLogout(); }
                if (res?.response?.status === 404) {
                    response = { ack: 0, msg: 'Page not found', data:{} };
                }
                resolve (response);
            })
            .catch((err)=>{
                let response = { ack: 0, msg: 'Something went wrong', data: {} };
                resolve (response);
            })
        }else{

            axios.post(`${process.env.REACT_APP_DOMAIN + ":" + process.env.REACT_APP_NODE_PORT}/${apiUrl}`,userData,config)
            .then((res)=>{
                let response = res.data;
                // if (res?.response?.status === 401) { sessionLogout(); }
                if (res?.response?.status === 404) {
                    response = { ack: 0, msg: 'Page not found', data:{} };
                }
                resolve (response);
            })
            .catch((err)=>{
                let response = { ack: 0, msg: 'Something went wrong', data: {} };
                resolve (response);
            })
        }
    })

}

export default globalRequestAxios