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
    b()
    a("ID received from peerjs")
    myId = userId
    mediaStreaming()
    socket.emit('join-room', ROOM_ID, myId)
})


// Run when called by existing user
myPeer.on('call', call => {
    call.answer(myStream)
    
    b()
    a('Called by existing user')

    call.on('stream', existingUserStream => {
        
        b()
        a('Stream sent by existing user')
        a(existingUserStream)
        
        const existingUserVideo = createVideo()
        if (!peers[call.peer]) {
        }
        addVideoStream(existingUserVideo, existingUserStream)

        peers[call.peer] = {
            video: existingUserVideo,
            call: call
        }
    })

})


// run when other user connected
socket.on('user-connected', connectedUserId => {
    const call = myPeer.call(connectedUserId, myStream)
    
    b()
    a('Called new user')

    call.on('stream', connectedUserStream => {

        b()
        a('Stream sent by connected new user')
        a(connectedUserStream)

        const connectedUserVideo = createVideo()
        if (!peers[connectedUserId]) {
        }
        addVideoStream(connectedUserVideo, connectedUserStream)

        peers[connectedUserId] = {
            video: connectedUserVideo,
            call: call
        }
    })

    call.on('close', () => {

    })
})

// run when other user disconnected
socket.on('user-disconnected', disconnectedUserId => {/* FIX HERE */ })


// ----------------------


// Function to request media stream from user
function mediaStreaming() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true}).then(stream => {
        
        b()
        console.log("mediaStreaming called")
        myStream = stream
        
        const userVideo = document.createElement('video')
        userVideo.muted = true
        addVideoStream(userVideo, stream)

    })
}

function createVideo() { return document.createElement('video') }
function addToGrid(element) { videoGrid.appendChild(element) }

function a(msg) {console.log(msg)}
function b() {console.log(Date.now() % 10000)}

function addVideoStream(video, stream) {
    video.addEventListener('loadedmetadata', () => video.play())
    video.srcObject = stream
    addToGrid(video)
}