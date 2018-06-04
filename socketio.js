/*
封装socket.io,为了获取server以便监听.
 */
var socketio = {};
var socket_io = require('socket.io');
//获取io
socketio.getSocketio = function(server){

	var io = socket_io.listen(server);

	var names=[];
	io.sockets.on('connection', function (socket) {
		console.log('客户端连接成功');
	
    	socket.on('login',function(name){
			for(var i=0;i<names.length;i++){
				if(names[i]==name){
					socket.emit('duplicate');
					return;
				}
			}
			names.push(name);
			io.sockets.emit('login',name);
			io.sockets.emit('sendClients',names);
		});

		socket.on('chat',function(data){
			io.sockets.emit('chat',data);
		});

		socket.on('logout',function(name){
			for(var i=0;i<names.length;i++){
				if(names[i]==name){
					names.splice(i,1);
					break;
				}
			}
			socket.broadcast.emit('logout',name);
			io.sockets.emit('sendClients',names);
		});
		
		socket.on('img', function(user,imageurl,color) {
            io.sockets.emit('newImg',user,imageurl,color);   //data包括user,imgurl,color
    });
    
		socket.on('shake',function(userName){
			io.sockets.emit('shake',userName);
		});
});
};

module.exports = socketio;