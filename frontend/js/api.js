const API_BASE = "http://localhost:8081/api";

async function apiPost(url, data){

    const res = await fetch(API_BASE + url,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    });

    const text = await res.text();

    try{
        return JSON.parse(text);
    }catch{
        return text;
    }
}