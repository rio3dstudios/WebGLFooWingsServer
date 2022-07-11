/*
*@autor: Rio 3D Studios
*@description:  java script file that works as master server of the Helicopter WARZONE MMO Game
*@date: 07/04/2020
*/
var express = require('express');  //import express NodeJS framework module

var app = express();  // create an object of the express module

var http = require('http').Server(app); // create a http web server using the http library

var io = require('socket.io')(http); // import socketio communication module

app.use("/public/TemplateData",express.static(__dirname + "/public/TemplateData"));

app.use("/public/Build",express.static(__dirname + "/public/Build"));

app.use(express.static(__dirname+'/public'));


var clientLookup = {}; // clients search engine

var clients			= [];  // to storage clients

var sockets = {}; // to storage sockets

var leaderboard = [];

var leaderboardChanged = false;

//auxiliary function to sort the best players
function compare(a, b) {
  if (a.kills > b.kills) {
    if(a.isDead)
	{
	  return 1;
	}	
    return -1;
  }
  if (a.kills < b.kills) {
     if(b.isDead)
	{
	  return -1;
	}	
    return 1;
  }
 
  return 0;
}

//open a connection with the specific client
io.on('connection', function(socket){

 //print a log in node.js command prompt
 console.log('A user ready for connection!');//prints in the  nodeJS console


  var current_player;
 
  //create a callback fuction to listening EmitPing() method in Shooter3DNetworkMannager.cs unity script
  socket.on("PING",function(_data){

   var pack = JSON.parse(_data);
   
   var json_pack = {

     totalPlayers:Object.keys(clientLookup).length

   };
  
  //emit back to NetworkManager in Unity 
  socket.emit("PONG",json_pack.totalPlayers);


});//END_SOCKET.ON


//create a callback fuction to listening EmitJoin() method in NetworkMannager.cs unity script
socket.on("JOIN_ROOM",function(_data){

  var pack = JSON.parse(_data);
  // fills out with the information emitted by the player in the unity
  current_player = {

    name : pack.name,
    id: socket.id,
	avatar: pack.avatar,
	position:pack.position,
	rotation:'',
	health:100,
	maxHealth:100,
	kills:0,
	isDead:false,
	isMute:false
	
  };//new user  in clients list
  
  console.log("[INFO] player " + current_player.id + ": logged!");
  
  clientLookup[current_player.id] = current_player;
  
  clients.push(current_player);//add current_player in clients
  
  sockets[current_player.id] = socket;//add curent user socket
  
  console.log ("[INFO] Total players: " + Object.keys(clientLookup).length);

  socket.emit("JOIN_SUCCESS",current_player.id,current_player.name,current_player.avatar,current_player.position);
 
  
   // spawn current_player client on clients in broadcast
  socket.broadcast.emit('SPAWN_PLAYER',current_player.id,current_player.name,current_player.avatar,current_player.position);

   //spawn all connected clients for current_player client 
  for(client in clientLookup)
  {
    if(clientLookup[client].id!=current_player.id)
    {
      
	  socket.emit('SPAWN_PLAYER',clientLookup[client].id,clientLookup[client].name,clientLookup[client].avatar,clientLookup[client].position);
    }
  }
  
});//END_SOCKET.ON


//respaw function
socket.on("RESPAWN",function(_data){

  var pack = JSON.parse(_data);
 
  
  if(current_player)
  {
	  
	  clientLookup[current_player.id].isDead = false;
	  clientLookup[current_player.id].health = current_player.maxHealth;
	  clientLookup[current_player.id].avatar = pack.avatar;
	  clientLookup[current_player.id].position =pack.position;
	  
	   for (var i = 0; i < clients.length; i++)
		 {
			if (clients[i].id ==  current_player.id.id) 
			{
			    clients[i].isDead = false;
				
			};
		};
		 
	  socket.emit("JOIN_SUCCESS",current_player.id,current_player.name,current_player.avatar,current_player.position);
 
  
      socket.broadcast.emit('SPAWN_PLAYER',current_player.id,current_player.name,current_player.avatar,current_player.position);


      for(client in clientLookup)
      {
         if(clientLookup[client].id!=current_player.id)
         {
            socket.emit('SPAWN_PLAYER',clientLookup[client].id,clientLookup[client].name,clientLookup[client].avatar,clientLookup[client].position);
         }
      }
	}
		  
		
  
});//END_SOCKET.ON


//create a callback fuction to listening EmitPosAndRot() method in Shooter3DNetworkMannager.cs unity script
socket.on("POS_AND_ROT",function(_data){

  if(current_player)
  {
     var pack = JSON.parse(_data);
 
     current_player.position = pack.position;
 
     current_player.rotation = pack.rotation;
 
     // send current user position and  rotation in broadcast to all clients in game
     socket.broadcast.emit('UPDATE_POS_AND_ROT',current_player.id,current_player.position,current_player.rotation);
  }


});//END_SOCKET.ON

//create a callback fuction to listening EmitShoot() method in Shooter3DNetworkMannager.cs unity script
socket.on("SHOOT",function(_data){
  
  if(current_player)
  {
   var pack = JSON.parse(_data);
   socket.broadcast.emit("UPDATE_SHOOT",current_player.id,pack.currentGun);
  }
  

});//END_SOCKET.ON

//create a callback fuction to listening EmitShoot() method in Shooter3DNetworkMannager.cs unity script
socket.on("CHANGE_BUSTER",function(_data){
  
  if(current_player)
  {
   socket.broadcast.emit("UPDATE_BUSTER",current_player.id);
  }
  

});//END_SOCKET.ON

//create a callback fuction to listening EmitGetBestKillers() method in Shooter3DNetworkMannager.cs unity script
socket.on('GET_BEST_KILLERS',function(){


  for (var j = 0; j < leaderboard.length; j++) {
            
		      socket.emit('UPDATE_BEST_KILLER',leaderboard[j].name,j,leaderboard[j].kills);
		   
		   }

});//END_SOCKET.ON

socket.on('DAMAGE',function(_data){

   var pack = JSON.parse(_data);
   
   var target = clientLookup[pack.target_id];
   
   var _damage = 10;
   
   if(target)
   {
	    
	 if(target.health - _damage > 0)
     {
			   
	    target.health -=_damage;
		
	 
      }
  
      else
      {
  
         for (var i = 0; i < clients.length; i++)
		 {
			if (clients[i].id ==  target.id) 
			{
			    clients[i].isDead = true;
				
			};
		  };
      
	      var shooter =  clientLookup[pack.shooter_id];
	      shooter.kills +=1;
	  
          socket.emit('GAME_OVER',target.id,shooter.id,shooter.kills);
	  
	      socket.broadcast.emit('GAME_OVER',target.id,shooter.id,shooter.kills);
			   
       }
  
       socket.emit("UPDATE_PLAYER_DAMAGE",target.id,target.health);	   

	   socket.broadcast.emit("UPDATE_PLAYER_DAMAGE",target.id,target.health);

		
	   
   }
   
  

});//END_SOCKET.ON

socket.on("VOICE", function (data) {


  if(current_player)
  {

    
    
    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

     
    clients.forEach(function(u) {
     
      if(sockets[u.id]&&u.id!=current_player.id&&!u.isMute)
      {

    
        sockets[u.id].emit('UPDATE_VOICE',newData);
      }
    });
    
    

  }
 
});

socket.on("AUDIO_MUTE", function (data) {


if(current_player)
{
  current_player.isMute = !current_player.isMute;

}

});

socket.on('disconnect', function ()
	{
        console.log("User  has disconnected");
	    
	      if(current_player)
		    {
		       current_player.isDead = true;
		       socket.broadcast.emit('USER_DISCONNECTED', current_player.id);


			   	 
		 for (var i = 0; i < clients.length; i++)
		 {
			if (clients[i].id ==  current_player.id) 
			{
			    clients[i].isDead = true;
				clients.splice(i,1);
			};
		};
		
		delete sockets[current_player.id];
		delete clientLookup[current_player.id];
		     
		      
        }
    });//END_SOCKET.ON


});//END_IO.ON

//updates the list of best players every 1000 milliseconds
function gameloop() {
    if (clients.length > 0) {
        clients.sort(compare);

        var topClients = [];

        for (var i = 0; i < Math.min(10, clients.length); i++) {
                if(!clients[i].isDead)
				{
				
                 topClients.push({
                    id: clients[i].id,
                    name: clients[i].name,
					kills: clients[i].kills
                });
				}
            
        }
        if (isNaN(leaderboard) || leaderboard.length !== topClients.length) {
            leaderboard = topClients;
            leaderboardChanged = true;
        }
        else {
            for (i = 0; i < leaderboard.length; i++) {
                if (leaderboard[i].id !== topClients[i].id) {
                    leaderboard = topClients;
                    leaderboardChanged = true;
                    break;
                }
            }
        }
      
    }

}//END_GAME_LOOP

setInterval(gameloop, 1000);//updates the list of best players every 1000 milliseconds

http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});


console.log('------- NodeJS server is running -------');
