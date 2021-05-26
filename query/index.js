// query service
//listens to post created and comment created event and creates a efficient data strtucters
const express = require('express')
const cors = require('cors')
const app = express()
const axios = require('axios')
app.use(express.json())
app.use(cors())


const posts= {} // {Id:{ID,title,[comments]},Id:{ID,title,[comments]},Id:{ID,title,[comments]}}
const handleEvent = (type,data)=> {
        if (type === 'PostCreated') {
        const { id, title } = data
        posts[id]={id,title,comments:[]}
    }
    if (type === 'CommentCreated') {
        const { id, content, postId ,status} = data
        const post = posts[postId]
        post.comments.push({id,content,status})
    }
    if (type === 'CommentUpdated') {
        const { id, content, postId ,status} = data
        const post = posts[postId]
        const comment = post.comments.find(comment => {
            return comment.id === id;
        })
        comment.status = status;
        comment.content = content;
    }
}
//full listing of post and assosiated comments
app.get('/posts', (req, res) => {
    res.send(posts)
})
//event handler
//handles events that has been broadcasted by the event bus
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type,data)
    res.send({})
})


app.listen(4002,async () => {
    console.log("QUERY SERVICE LISITINGING ON 4002")
    const res = await axios.get('http://event-bus-srv:4005/events');
    for (let event of res.data) {
        console.log('processing event:', event.type)
        handleEvent(event.type,event.data)
    }
})