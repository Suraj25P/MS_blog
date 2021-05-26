const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

const events = []
app.post('/events', (req, res) => {
    //whenever a service post/events the eventbus will take and publish it to all the services
    const event = req.body;
    //local varaible to store all events
    events.push(event);
    axios.post('http://posts-clusterip-srv:4000/events',event)
    axios.post('http://comments-srv:4001/events',event)
    axios.post('http://query-srv:4002/events',event)
    axios.post('http://moderation-srv:4003/events',event)
    
    res.send({status:'OK'})
})
app.get('/events', (req, res) => {
    res.send(events)
})


app.listen(4005, () => {
    console.log("EVENT BUS LISITINGING ON 4005")
})