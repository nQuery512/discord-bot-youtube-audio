const Discord = require('discord.js');
const YoutubeStream = require( 'youtube-audio-stream');
const search = require('youtube-search');

const bot = new Discord.Client({autoreconnect:true})

var regex_str = "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})";
var regex_url = new RegExp(regex_str);
var opts = {
  maxResults: 5,
  key: '##################################'
};

bot.on('ready', function () {
  console.log("Je suis connecté !")
})

bot.on('message', message => {
	console.log(message.content)
  	if (message.content.toLowerCase() === 'ping') {
    	message.channel.send("pong", {tts:true})
	}

 	if (message.content.startsWith('!play')) {

	    // On récupère le premier channel audio du serveur
	    let voiceChannel = message.guild.channels
	      .filter(function (channel) { return channel.name === "La Taverne"})
	      .first()
	    console.log("channel: "+voiceChannel);

	    // On récupère les arguments de la commande 
	    // il faudrait utiliser une expression régulière pour valider le lien youtube
	    let args = message.content.split(' ')

	    if(args[1].trim().match(regex_url))
	    {

		    // On rejoint le channel audio
		    voiceChannel
		      .join()
		      .then(function (connection) {
		        // On démarre un stream à partir de la vidéo youtube
		        let stream = YoutubeStream(args[1])
		        stream.on('error', function () {
		        	console.log("erreur");
		          message.reply("Je n'ai pas réussi à lire cette vidéo :(")
		          connection.disconnect()
		          process.exit(0);
		        })
		        // On envoie le stream au channel audio
		        // Il faudrait ici éviter les superpositions (envoie de plusieurs vidéo en même temps)
		        connection
		          .playStream(stream)
		          .on('end', function () {
		            connection.disconnect()
		        })
	    	});
	    }
	    else
		{
			console.log('youtube search: '+ args[1].trim());
			search(args[1].trim(), opts, function(err, results) {
				if(err) return console.log(err);
				//console.dir(results[0]);
				for(result of results)
				{
					console.log(result.kind)
					if(result.kind == 'youtube#video')			
					{
						
				 		console.dir(result.link);
				  		// On rejoint le channel audio
					    voiceChannel
					    	.join()
						    .then(function (connection) {
					        // On démarre un stream à partir de la vidéo youtube
						    let stream = YoutubeStream(result.link)
						    stream.on('error', function () {
						    	console.log("erreur");
						        message.reply("Je n'ai pas réussi à lire cette vidéo :(")
						        connection.disconnect()
						        process.exit(0);
						    })
						    message.reply("Vous écoutez "+decodeURIComponent(result.title)+' '+result.thumbnails.default.url);
						    // On envoie le stream au channel audio
						    // Il faudrait ici éviter les superpositions (envoie de plusieurs vidéo en même temps)
						    connection
						    	.playStream(stream)
						        .on('end', function () {
						        connection.disconnect()
						    })
					    });
			  			break;
					}
				}
			});
			
		}
  	}
  	if (message.content.startsWith('!stop'))
  	{
  		let voiceChannel = message.guild.channels
	      .filter(function (channel) { return channel.name === "La Taverne"})
	      .first()

	    voiceChannel.leave();
  	}

});
var TOKEN = "######################################"";
bot.login(TOKEN);
