const socket = io('/')
const myPeer = new Peer(undefined, {
    host: '0.peerjs.com',
    port: '443', 
    debug: 0,
    pingInterval: 5000,
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302'  }, 
        { urls: 'stun:stun1.l.google.com:19302' }, 
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        },
        {
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        },
        {
            url: "turn:13.250.13.83:3478?transport=udp",
            username: "YzYNCouZM1mhqhmseWk6",
            credential: "YzYNCouZM1mhqhmseWk6"
        },
        {
            url: 'turn:relay.backups.cz',
            credential: 'webrtc',
            username: 'webrtc'
        },
        {
            url: 'turn:relay.backups.cz?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        },
    ]
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
            try {
                call.answer(myStream)
                console.log("answered existing user with a stream")
            } catch(e) {
                console.log(e)
            }
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