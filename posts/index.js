//      posts service
// handles creation of a post and fetching all posts
const express = require('express')
const {randomBytes} = require('crypto')
const app = express()
const axios = require('axios')
const cors = require('cors')
app.use(express.json())
app.use(cors())
const posts ={}


app.get('/posts', (req, res) => {
    res.send(posts)
})

app.post('/posts/create', async(req, res) => {
    const id = randomBytes(4).toString('hex')
    const { title } = req.body
    
    posts[id] = {
        id,title
    }
    //Publish PostCreated event 
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
        id,title
        }
    })
    res.status(201).send(posts[id]);
})

//event reciever
//handles events that has been broadcasted by the event bus
//in this appliaction post service doesnt care about events
app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type)
    res.send({})
})

app.listen(4000, () => {
    console.log("POSTS SERVICE LISITINGING ON 4000")
})