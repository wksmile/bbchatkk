var userName,socket,tbxUsername,tbxMsg,divChat;

function window_onload(){
	divChat=document.getElementById('divchat');            //聊天的对话窗口
	tbxUsername=document.getElementById('tbxUsername');    //登录的用户名输入窗口
	tbxMsg=document.getElementById('tbxMsg');              //发送的消息窗口
	tbxUsername.focus();
	tbxUsername.select();
}

function AddMsg(msg,color){           //将消息显示在divChat中的函数，包括字体的颜色，时间等
	var date=new Date().toTimeString().substr(0,8);
	var toMsg = document.createElement('p');
	toMsg.style.color=color|| "#000";
	msg = showemoji(msg);
	toMsg.innerHTML=msg+' &nbsp<span class="timespan"> ('+date+')</span>';
	divChat.appendChild(toMsg);
	if(divChat.scrollHeight>divChat.clientHeight){
		divChat.scrollTop=divChat.scrollHeight-divChat.clientHeight;
	}
}

function btnLogin_onclick(){          //点击登录按钮后的事件
	if(tbxUsername.value.trim()==''){
		alert('用户名不能为空');
		return;
	}
	userName=tbxUsername.value.trim();
	socket = io.connect();  
	socket.on('connect',function(){
		AddMsg("<span style='color:red;font-style:italic'>与聊天服务器连接已建立。</span>");
		initEmoji();        //初始化emoji图片，将静态的emoji图片装入到emojiWrapper中
		socket.on('login',function(name){        
			AddMsg('<span style="color:red;font-style:italic">欢迎用户'+name+'进入聊天室。</span>');
			document.title='BBT | '+name;
			document.getElementById('tbxMsg').focus();
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
			AddMsg("<span style='font-weight:bolder'>"+data.user+' : <span style="font: ">'+'<span style="font-weight:normal;font-family:Arial,Verdana,Sans-serif">'+data.msg+"</span>",data.colorStyle);
		});
		
		socket.on('newImg', function(user,imageurl,color) {
            displayImage(user,imageurl,color);
        });
		
		socket.on('disconnect',function(){
			AddMsg('<span style="color:red;font-style:italic">与聊天服务器的连接已断开</span>');
			document.getElementById("btnSend").disabled=true;
			document.getElementById('btnLogout').disabled=true;
			document.getElementById('btnLogin').disabled="";
			var divRight=document.getElementById('divRight');
			divRight.innerHTML="";
		});
		
		socket.on('logout',function(name){
			AddMsg('<span style="color:red;font-style:italic">用户'+name+'已退出聊天室。</span>');
		});
		
		socket.on('duplicate',function(){     //监听当用户名重复的事件
			alert('该用户名已被占用');
			document.getElementById('btnSend').disabled=true;
			document.getElementById('btnLogout').disabled=true;
			document.getElementById('btnLogin').disabled="";
		});
		
		socket.on('shake',function(userName){
			shake();
			AddMsg('<span style="color:red;font-style:italic">用户'+userName+'发送了一个抖动窗口</span>');
		});
	});
	
	socket.on('error',function(err){      
		AddMsg('<span style="color:red;font-style:italic">与聊天服务器之间的连接发生错误。</span>');
		socket.disconnect();
		socket.removeAllListeners('connect');
		io.sockets={};
	});
	socket.emit('login',userName);
	document.getElementById('btnSend').disabled=false;
	document.getElementById('btnLogout').disabled=false;
	document.getElementById('btnLogin').disabled=true;
}

function btnSend_onclick(){    //点击发送按钮后的事件，将发送的消息广播到各个客户端
	var msg = tbxMsg.value;
	if(msg.length>0){
		var color=document.getElementById('colorStyle').value;
		socket.emit('chat',{user:userName,msg:msg,colorStyle:color});
		tbxMsg.value='';
	}
}

function btnClear(){         //清除聊天记录
	var historyContent = document.getElementById('divchat');
	historyContent.innerHTML='';
}

function btnLogout_onclick(){          //当点击退出按钮的事件
	socket.emit('logout',userName);
	socket.disconnect();
	socket.removeAllListeners('connect');
	io.sockets={};
	AddMsg("<span style='color:red;font-style:italic'>用户"+userName+"退出聊天室：</span>");
	var divRight=document.getElementById('divRight');
	divRight.innerHTML="";
	document.getElementById("btnSend").disabled="disabled";
	document.getElementById("btnLogout").disabled="disabled";
	document.getElementById("btnLogin").disabled="";
}

function window_onunload(){           //页面关闭的时候触发
	socket.emit('logout',userName);
	socket.disconnect();
}

document.onkeydown = function(e){    //当按下的键盘上的按钮时触发，当按下enter键时发送输入区中内容
	if((e||event).keyCode==13){
		e.returnValue=false;     //返回值为false告诉浏览器不要执行这个时间相关的默认操作，通过对象属性或HTML属性注册的事件
	  	btnSend_onclick();
	  	e.preventDefault();     //阻止默认的操作--换行，通过addEventListener()注册的事件
	}
}

// --------------------------------发送emoji-----------------------------------------------

document.getElementById("emoji").addEventListener('click',function(e){  //当点击emoji按钮时显示emojiWrapper
	var emojiWrapper=document.getElementById("emojiWrapper");
	emojiWrapper.style.display='block';
	e.stopPropagation();       //不再派发事件
},false);

document.body.addEventListener('click',function(e){    //当点击emojiWrapper之外的部分隐藏emojiWrapper
	var target=e.target;
	var emojiWrapper=document.getElementById('emojiWrapper');
	if(target!==emojiWrapper){
		emojiWrapper.style.display='none';
	}
});

document.getElementById('emojiWrapper').addEventListener('click',function(e){
	var target=e.target;                           //当点击emojiWrapper中的图片时在输入框中显示[emoji:1]
	if(target.nodeName.toLowerCase()=='img'){
		var tbxMsg=document.getElementById('tbxMsg');
		tbxMsg.focus();
		tbxMsg.value+="[emoji:"+target.title+"]";
	}
},false);    //默认传递false,如果为true则函数将注册为捕获事件处理程序

function initEmoji(){                //初始化emoji,将所有的emoji静态资源装载到emojiWrapper中
	var emojiWrapper=document.getElementById("emojiWrapper");
	var fragDocument = document.createDocumentFragment();
	for(var i=69;i>0;i--){
		var emoji=document.createElement('img');
		emoji.src="../images/emoji/"+i+".gif";
		emoji.title=i;
		fragDocument.appendChild(emoji);
	}
	emojiWrapper.appendChild(fragDocument);
}

function showemoji(msg){      //查找发送的msg中是否有[emoji:8]的字符串，如果有则将其换为相对应的图片
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);    // d+数字   match[0]为完全匹配的结果，如果没有找到则为null
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');    
            } else {
                result = result.replace(match[0], ' &nbsp<img class="emoji" src="images/emoji/' + emojiIndex + '.gif" />&nbsp ');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
 }

// -------------------发送图片----------------------------------------

document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {          //this表示选择的元素
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {      
                    AddMsg('<span style="color:red;font-style:italic">!your browser doesn\'t support fileReader</span>');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {         //文件读取成功完成时触发,表示触发的事件
                    this.value = '';
                    socket.emit('img',userName,e.target.result,color);
                };
                if(/image\/\w+/.test(file.type)){
                	reader.readAsDataURL(file);    //读取文件的url并把url保存在result
                }
                else{
                	alert('只能上传图片');
                }
                
            };
        }, false);

function displayImage(user,imageurl,color) {       //user,imgurl,color
        var container = document.getElementById('divchat'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = "<span style='font-weight:bolder'>"+user+"</span>" + '<span class="timespan">(' + date + '): </span> <br/>' + ' &nbsp<a href="' + imageurl + '" target="_blank"><img style="width:auto;max-height:200px" src="' + imageurl + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
}

// ----------------------实现窗口抖动------------------------------------------
function onshake(){
	socket.emit('shake',userName);
}

function shake(){
	var cshake=document.body;
	cshake.className+='shake';
	setTimeout(function(){
		cshake.classList.remove('shake');
	},1000);
}
