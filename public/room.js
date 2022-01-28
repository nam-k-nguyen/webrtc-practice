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
    myId = userId
    mediaStreaming()
    socket.emit('join-room', ROOM_ID, myId)
})


// Run when called by existing user
myPeer.on('call', call => {
    call.answer(myStream)


    call.on('stream', existingUserStream => {
        const existingUserVideo = createVideo()
        if (!peers[call.peer]) {
            addVideoStream(existingUserVideo, existingUserStream, call.peer)
        }
        peers[call.peer] = {
            video: existingUserVideo,
            call: call
        }
    })
    call.on('close', () => {
        getById(call.peer).remove()
    })
})


// run when other user connected
socket.on('user-connected', connectedUserId => {
    const call = myPeer.call(connectedUserId, myStream)

    call.on('stream', connectedUserStream => {

        const connectedUserVideo = createVideo()
        if (!peers[connectedUserId]) {
            addVideoStream(connectedUserVideo, connectedUserStream, connectedUserId)
        }

        peers[connectedUserId] = {
            video: connectedUserVideo,
            call: call
        }
    })

    call.on('close', () => {
        getById(connectedUserId).remove()
    })
})

// run when other user disconnected
socket.on('user-disconnected', disconnectedUserId => {/* FIX HERE */ })


// ----------------------


// Function to request media stream from user
function mediaStreaming() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true}).then(stream => {
        myStream = stream
        const userVideo = document.createElement('video')
        userVideo.muted = true
        addVideoStream(userVideo, stream, myId)
    })
}

function createVideo() { return document.createElement('video') }
function addToGrid(element) { videoGrid.appendChild(element) }

function a(msg) {b(); console.log(msg)}
function b() {console.log(Date.now() % 10000)}

function addVideoStream(video, stream, id) {
    video.addEventListener('loadedmetadata', () => video.play())
    video.srcObject = stream
    video.setAttribute('id', id)
    addToGrid(video)
}