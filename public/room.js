const socket = io('/')
const myPeer = new Peer(undefined, {
    secure: true,
    host: '0.peerjs.com',
    port: '443'
})


let myName
let myId
let myStream
const videoGrid = document.querySelector('#video-grid')
const videoList = []
const peers = {
    // id: {
    //     video: "video element",
    //     call: "call"
    // }
}


// Run when user receive id from peer server
myPeer.on('open', userId => {
    console.log('Received an id from peer server')
    myId = userId
    mediaStreaming()
    socket.emit('join-room', ROOM_ID, myId)
})



// run when other user disconnected
socket.on('user-disconnected', disconnectedUserId => {
    console.log('user disconnected')
    if (peers[disconnectedUserId]) {
        peers[disconnectedUserId].call.close()
        delete peers[disconnectedUserId]
    }
})


// ----------------------


// Function to request media stream from user
function mediaStreaming() {
    var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia
    getUserMedia({ video: true, audio: true }).then(stream => {
        console.log('got local media stream')
        myStream = stream
        const userVideo = document.createElement('video')
        userVideo.muted = true
        addVideoStream(userVideo, stream, myId)


        // Run when called by existing user
        myPeer.on('call', call => {
            console.log('Called by an existing user')
            const existingUserVideo = createVideo()
            call.answer(myStream)
            console.log("answered existing user with a stream")
            call.answer(myStream)
            console.log("answered existing user with a stream")
            call.answer(myStream)
            console.log("answered existing user with a stream")
            call.on('stream', existingUserStream => {
                console.log('stream received from existing user')
                if (!peers[call.peer]) {
                    addVideoStream(existingUserVideo, existingUserStream, call.peer)
                }
                peers[call.peer] = {
                    video: existingUserVideo,
                    call: call
                }
            })
            call.on('close', () => {
                console.log('remove existing user video')
                existingUserVideo.remove()
            })
        })


        // run when other user connected
        socket.on('user-connected', connectedUserId => {
            console.log('another user connected')
            const call = myPeer.call(connectedUserId, myStream)
            console.log("called another user")
            const connectedUserVideo = createVideo()

            call.on('stream', connectedUserStream => {
                console.log('Stream received from another user')
                if (!peers[connectedUserId]) {
                    addVideoStream(connectedUserVideo, connectedUserStream, connectedUserId)
                }
                peers[connectedUserId] = {
                    video: connectedUserVideo,
                    call: call
                }
            })

            call.on('close', () => {
                console.log('remove connected user video')
                connectedUserVideo.remove()
            })
        })
    }).catch(err => {console.log(err)})
}

function createVideo() { return document.createElement('video') }
function addToGrid(element) { videoGrid.appendChild(element) }

function a(msg) { b(); console.log(msg) }
function b() { console.log(Date.now() % 10000) }

function addVideoStream(video, stream, id) {
    video.addEventListener('loadedmetadata', () => video.play())
    video.srcObject = stream
    video.setAttribute('id', id)
    addToGrid(video)
}