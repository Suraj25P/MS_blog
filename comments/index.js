//comments service
// deals with creating a comment and fetching a comment
const express = require('express')
const { randomBytes } = require('crypto')
const axios = require('axios')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())

const commentsByPostId = {} // [ postid:[list of comments for postid post],postid2:[list of comments]]
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})
app.post('/posts/:id/comments', async (req, res) => {
    //create a random post id
    const commentId = randomBytes(4).toString('hex')
    //content is the comment string
    const { content } = req.body
    //find the list of comments for the post
    const comments = commentsByPostId[req.params.id] || []
    //every comment has 3 properties
    comments.push({ id: commentId, content ,status:"pending"})
    //assign comment
    commentsByPostId[req.params.id] = comments
    //publish an event saying new comment is created
        await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status:'pending'
        }
    })

    res.status(201).send(comments);
})

//event reciever
//handles events that has been broadcasted by the event bus
app.post('/events', async(req, res) => {
    console.log('Received Evert', req.body.type)
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { postId, id, status ,content} = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id = id
        })
        comment.status = status
        await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
            id,
            content,
            postId,
            status
        }
    })
    }
    res.send({})
})

app.listen(4001, () => {
    console.log("COMMENTS SERVICE LISITINGING ON 4001")
})