var socket = io() || {};
socket.isReady = false;

window.addEventListener('load', function() {

	var execInUnity = function(method) {
		if (!socket.isReady) return;
		
		var args = Array.prototype.slice.call(arguments, 1);
		
		if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage("NetworkManager", method, args.join(':'));
		}
		
		
	};

	
	socket.on('JOIN_SUCCESS', function(id,name,avatar,position) {
				      		
	  var currentUserAtr = id+':'+name+':'+avatar+':'+position;
	 if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnJoinGame', currentUserAtr);
		}
	  
	});
	socket.on('SPAWN_PLAYER', function(id,name,avatar,position) {
				      		
	  var currentUserAtr = id+':'+name+':'+avatar+':'+position;
	   if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnSpawnPlayer', currentUserAtr);
		}
	 
	});
	
	socket.on('UPDATE_POS_AND_ROT', function(id,position,rotation) {
				      		
	  var currentUserAtr = id+':'+position+":"+rotation;
	  
	  if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnUpdatePosAndRot', currentUserAtr);
		}
	 
	});
	
	socket.on('UPDATE_BEST_KILLER', function(name,ranking,kills) {
				      		
	  var currentUserAtr = name+":"+ranking+":"+kills;
	   if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateBestKillers', currentUserAtr);
		}
	 
	});
	
	 socket.on('UPDATE_BUSTER', function(id) {
				      		
	  var currentUserAtr = id+":"+"";
	  
	  if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateBuster', currentUserAtr);
		}
	 
	});	
	
	

	  socket.on('UPDATE_SHOOT', function(id,currentGun) {
				      		
	  var currentUserAtr = id+":"+currentGun;
	  
	  if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateShoot', currentUserAtr);
		}
	 
	});	
	
   socket.on('UPDATE_PLAYER_DAMAGE', function(id,health) {
				      		
	  var currentUserAtr = id+':'+health;
	  if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnUpdatePlayerDamage', currentUserAtr);
		}
	  
	});	

 socket.on('GAME_OVER', function(target_id,shooter_id,shooter_kills) {
				      		
	  var currentUserAtr = target_id+":"+shooter_id+":"+shooter_kills;
	   if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnGameOver', currentUserAtr);
		}
	  
	});	
	

 socket.on('USER_DISCONNECTED', function(id) {
				      		
	  var currentUserAtr = id+":"+" ";
	  if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnUserDisconnected', currentUserAtr);
		}
	 
	});		


});//END_WINDOW.ADDEVENTLISTENER

