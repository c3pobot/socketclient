'use strict'
module.exports = class Socket{
  constructor(opt){
    this.io = require('socket.io-client')
    this.type = opt.type
    this.id = opt.id
    this.debugMsg = opt.debugMsg
    this.socket =  this.io(opt.url, {transports: ['websocket']})
    this.socket.on('connect', ()=>{
      console.log('Socket.io is connected to socket server...')
    })
    this.cmds = opt.cmds
    this.socket.on('disconnect', (reason)=>{
      if(this.debugMsg) console.log('Socket.io connection to server was disconnected for '+reason)
    })
    this.socket.on('request', async(cmd, obj, content, callback)=>{
      try{
        if(this.cmds && this.cmds[cmd]){
          const status = await this.cmds[cmd](obj, content)
          if(callback) callback(status)
        }
      }catch(e){
        if(callback) callback({status: 'error'})
      }
    })
  }
  call (cmd, obj, content) {
    return new Promise((resolve)=>{
      try{
        this.socket.emit('request', cmd, obj, content, (res)=>{
          resolve(res)
        })
      }catch(e){
        console.error(e)
        resolve()
      }
    })
  }
  send (cmd, obj, content, callback) {
    try{
      this.socket.emit('request', cmd, obj, content, (res)=>{
        if(res && res.status != 'ok') console.log(res.status)
        if(callback) callback(res)
      })
    }catch(e){
      console.error(e);
    }
  }
}
