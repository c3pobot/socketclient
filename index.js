'use strict'
let WEBSOCKET_URI, socket
const POD_NAME = process.env.POD_NAME
const SOCKET_EMIT_TIMEOUT = process.env.SOCKET_EMIT_TIMEOUT || 10000
const SOCKET_IDENTIFIY = process.env.SOCKET_IDENTIFIY || false
const io = require('socket.io-client')
const StartSocket = ()=>{
  socket = io(WEBSOCKET_URI, {transports: ['websocket']}), notify = true
  socket.on('connect', ()=>{
    if(SOCKET_IDENTIFIY) sendSocketIdentity()
    if(notify){
      notify = false
      console.log(POD_NAME+' socket.io is connected to socket server...')
    }
  })
  socket.on('disconnect', reason=>{
    console.log(POD_NAME+' socket.io is diconnected from socket server...')
  })
}

const sendSocketIdentity = async()=>{
  try{
    let res = await SocketEmit('request', 'identify', {podName: POD_NAME})
    if(!res || res?.status !== 'ok') setTimeout(sendSocketIdentity, 5000)
  }catch(e){
    console.error(e);
    setTimeout(sendSocketIdentity, 5000)
  }
}
const SocketEmit = ( type = 'request', cmd, obj = {} )=>{
  return new Promise((resolve, reject)=>{
    try{
      if(!socket || !socket?.connected) reject('Socket Error: connection not available')
      socket.timeout(SOCKET_EMIT_TIMEOUT).emit(type, cmd, obj, (err, res)=>{
        if(err) reject(`Socket Error: ${err.message || err}`)
        resolve(res)
      })
    }catch(e){
      reject(e.message)
    }
  })
}
module.exports.start = (uri)=>{
  WEBSOCKET_URI = uri
  StartSocket()
  return true
}
module.exports.socket = socket
module.exports.call = async(cmd, obj = {})=>{
  try{
    return await SocketEmit('request', cmd, obj)
  }catch(e){
    throw(e)
  }
}
