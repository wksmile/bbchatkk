var userName,socket,tbxUsername,tbxMsg,divChat;

function window_onload(){
	divChat=document.getElementById('divchat');       //聊天的对话窗口
	tbxUsername=document.getElementById('tbxUsername');   //登录的用户名输入窗口
	tbxMsg=document.getElementById('tbxMsg');          //发送的消息窗口
	tbxUsername.focus();
	tbxUsername.select();
}

function AddMsg(msg){
	divChat.innerHTML+=msg+'<br>';
	if(divChat.scrollHeight>divChat.clientHeight){
		divChat.scrollTop=divChat.scrollHeight-divChat.clientHeight;
	}
}

function btnLogin_onclick(){
	if(tbxUsername.value.trim()==''){
		alert('用户名不能为空');
		return;
	}
	userName=tbxUsername.value.trim();
	socket = io();  
	socket.on('connect',function(){
		AddMsg("与聊天服务器连接已建立。");
		
		socket.on('login',function(name){
			AddMsg('欢迎用户'+name+'进入聊天室。');
		});
		
		socket.on('sendClients',function(names){
			var divRight=document.getElementById('divRight');
			var str='';
			names.forEach(function(name){
				str+=name+'<br/>';
			});
			divRight.innerHTML=str;
		});
		
		socket.on('chat',function(data){
			AddMsg(data.user+': '+data.msg);
		});
		
		socket.on('disconnect',function(){
			AddMsg('与聊天服务器的连接已断开');
			document.getElementById("btnSend").disabled=true;
			document.getElementById('btnLogout').disabled=true;
			document.getElementById('btnLogin').disabled="";
			var divRight=document.getElementById('divRight');
			divRight.innerHTML="";
		});
		
		socket.on('logout',function(name){
			AddMsg('用户'+name+'已退出聊天室。');
		});
		
		socket.on('duplicate',function(){
			alert('该用户名已被占用');
			document.getElementById('btnSend').disabled=true;
			document.getElementById('btnLogout').disabled=true;
			document.getElementById('btnLogin').disabled="";
		});
	});
	socket.on('error',function(err){
		AddMsg('与聊天服务器之间的连接发生错误。');
		socket.disconnect();
		socket.removeAllListeners('connect');
		io.sockets={};
	});
	socket.emit('login',userName);
	document.getElementById('btnSend').disabled=false;
	document.getElementById('btnLogout').disabled=false;
	document.getElementById('btnLogin').disabled=true;
}

function btnSend_onclick(){
	var msg = tbxMsg.value;
	if(msg.length>0){
		socket.emit('chat',{user:userName,msg:msg});
		tbxMsg.value='';
	}
}

function btnLogout_onclick(){
	socket.emit('logout',userName);
	socket.disconnect();
	socket.removeAllListeners('connect');
	io.sockets={};
	AddMsg("用户"+userName+"退出聊天室：");
	var divRight=document.getElementById('divRight');
	divRight.innerHTML="";
	document.getElementById("btnSend").disabled="disabled";
	document.getElementById("btnLogout").disabled="disabled";
	document.getElementById("btnLogin").disabled="";
}

function window_onunload(){
	socket.emit('logout',userName);
	socket.disconnect();
}

document.onkeydown = function(e){
	if((e||event).keyCode==13){
		e.returnValue=false;
	  	btnSend_onclick();
	  	e.preventDefault();
	}
}













