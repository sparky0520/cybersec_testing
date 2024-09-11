import express from 'express'
import bodyParser from 'body-parser'

const app = express()
const PORT = 3000

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))

app.get("/", (req,res)=>{
    res.sendFile('index.html')
})

app.listen(PORT,(error) => {
    if(!error){
        console.log(`server running on: localhost:${PORT}`)
    }else{
        console.log("Error: ",error)
    }
})