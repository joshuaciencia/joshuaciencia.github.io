
var game = {
	
	init: function(){
		game.instructions = new Image();
		game.instructions.src = "images/arrow.png";
		
		
		game.title = new Image();
		game.title.src = "images/title.png";
		
		game.playSheet = new Image();
		game.playSheet.src = "images/play.png";
		
		game.background = new Image();
		game.background.src = "images/background.png";
		
		game.pauseButton = new Image();
		game.pauseButton.src = "images/pause.png";
		
		game.restartButton = new Image();
		game.restartButton.src = "images/refresh.png";
		
		game.tiles = new Image();
		game.tiles.src = "images/tiles.png";
		
		game.time = new Date().getTime();
		game.dt = 0;
		
		game.canvas = $('#canvas')[0];
		game.context = game.canvas.getContext('2d');
		
		// game logic variables
		
		game.boardWidth = 10;
		game.boardHeight = 20;
		game.blockSize = 30;
		
		// board
		
		game.board = [];
		
		// fill the board with zeros (empty cell)
		
		for(let row = 0; row < game.boardHeight; row++){
			
			var r = [];
			
			for(let col = 0; col < game.boardWidth; col++){
				r.push(0);
			}
			game.board.push(r);
		}
		
		// define the tetris shapes as 2d arrays
		
		game.shapes = [];
		
		// I shape
		
		game.shapes.push(
			[[1, 1, 1, 1]]
		);
		
		// T shape
		
		game.shapes.push(
			[[2, 2, 2],
			[0, 2, 0]]
		);
		
		// L shape
		
		game.shapes.push(
			[[3, 3, 3],
			[3, 0, 0]]
		);
		
		// J shape
		
		game.shapes.push(
			[[4, 4, 4],
			[0, 0, 4]]
		);
		
		//S shape
		
		game.shapes.push(
			[[0, 5, 5],
			[5, 5, 0]]
		);
		
		// Z shape
		
		game.shapes.push(
			[[6, 6, 0],
			[0, 6, 6]]
		);
		
		//O shape
		
		game.shapes.push(
			[[7, 7],
			[7, 7]]
		);
		
		game.score = 0;
		game.gameOver = false;
		game.running = true;
		game.paused = false;
		
		game.currentShape = undefined;
		game.currentShapeX = 0;
		game.currentShapeY = 0;
		
		game.nextShape = undefined;
		
		game.color = 0;
		
		game.normal = 600;
		game.fast = 50;
		game.speed = game.normal;
		
		game.moveX = false;
		game.collision = false;
		
		game.deltaX = 0;
		
		game.speedTime = 0;
		game.inputLapse = 0;
		game.inputTime = 300;
		
		// =========
		
		game.state = 'menuscreen';
		
		playButton.init();
		refreshButton.init();
		pauseButton.init();
		
		keyboard.init();
		mouse.init();
		game.animate();
		
	},
	
	animate: function(){
		game.animId = requestAnimationFrame(game.animate);
		
		game.setDelta();
		game.update();
		game.draw();
	},
	
	setDelta: function(){
		var t = new Date().getTime();
		game.dt = (t - game.time);
		game.time = t;
		
		
		if(game.dt > 200){
			dt = 0;
		}
	},
	
	update: function(){
		
		if(game.state == 'menuscreen'){
			playButton.update();
		}else if(game.state == 'playscreen'){
			
			// update current shapes 
			// detect collision
			// detect player input
			
			
			refreshButton.update();
			pauseButton.update();
			
			game.inputLapse += game.dt;
			
			if(game.paused || game.gameOver){
				return;
			}
			
			game.speedTime += game.dt;
			game.moveX = true;
			
			
			if(game.collision){
				
				for(let r = 0; r < game.currentShape.length; r++){
					for(let c = 0; c < game.currentShape[0].length; c ++){
						
						if(game.currentShape[r][c] != 0){
							
							game.board[game.currentShapeY + r][game.currentShapeX + c] = game.color;
							
						}
						
					}
				}
				
				game.checkLine();
				game.score ++;
				
				game.setCurrentShape();
				
			}
			
			if(!(game.currentShapeX + game.deltaX + game.currentShape[0].length > game.boardWidth) && !(game.currentShapeX + game.deltaX < 0)){
				
				for(let r = 0; r < game.currentShape.length; r++){
					for(let c = 0; c < game.currentShape[0].length; c ++){
						
						if(game.currentShape[r][c] != 0){
							
							if(game.board[game.currentShapeY + r][game.currentShapeX + game.deltaX + c] != 0){
								game.moveX = false;
							}
							
						}
					}
				}
				
				if(game.moveX){
					game.currentShapeX += game.deltaX;
				}
				
			}
			
			if(!(game.currentShapeY + game.currentShape.length + 1 > game.boardHeight)){
				for(let r = 0; r < game.currentShape.length; r++){
					for(let c = 0; c < game.currentShape[0].length; c ++){
						
						if(game.currentShape[r][c] != 0){
							
							if(game.board[r + 1 + game.currentShapeY][game.currentShapeX + c] != 0){
								game.collision = true;
							}
							
						}
						
					}
				}
				
				if(game.speedTime > game.speed){
					game.currentShapeY ++;
					game.speedTime = 0;
				}
				
			}else{
				game.collision = true;
			}
			
			game.deltaX = 0;
			
		}
	},
	
	draw: function(){
		game.context.fillStyle = "black";
		game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);
		
		if(game.state == 'menuscreen'){
			game.context.drawImage(game.title, 0, 0, game.canvas.width, game.title.height);
			playButton.draw();
			game.context.drawImage(game.instructions, game.canvas.width / 2 - game.instructions.width / 2,
			340, game.instructions.width, game.instructions.height);
		}else if(game.state == 'playscreen'){
			game.context.drawImage(game.background, 0, 0);
			
			game.drawReferenceLines();
			
			game.drawBoard();
			
			game.drawNextShape();
			
			refreshButton.draw();
			
			pauseButton.draw();
			
			game.drawText("SCORE : " + game.score, 330, 350, 18, false, "white");
			game.drawText("NEXT SHAPE", 315, 150, 18, false, "white");
			
			if(game.paused){
				game.drawText("GAME PAUSED", 35, 150, 32, true, "green");
			}
			
			if(game.gameOver){
				game.drawText("GAME OVER", 55, 150, 32, true, "red");
			}
			
		}
	},
	
	drawText: function(text, x, y, size, fill, color){
		game.context.font = size + "px Arial";
		
		if(fill){
			game.context.fillStyle = color;
			game.context.fillText(text, x, y);
		}else{
			game.context.strokeStyle = color;
			game.context.strokeText(text, x, y);
		}
		
		game.context.strokeText(text, x, y);
	},
	
	drawNextShape: function(){
		var color = game.shapes.indexOf(game.nextShape) + 1;
		
		for(let r = 0; r < game.nextShape.length; r++){
			for(let c = 0; c < game.nextShape[0].length; c ++){				
				
				if(game.nextShape[r][c] != 0){
					game.context.drawImage(game.tiles, (color - 1) * game.blockSize, 0, game.blockSize,
					game.blockSize, 325 + c * game.blockSize,  25 + r * game.blockSize,
					game.blockSize, game.blockSize);
				}
				
			}
		}
	},
	
	drawReferenceLines: function(){
		game.context.strokeStyle = "rgba(0, 0, 0, 1)";
		game.context.beginPath();
			
		for(let i = 0; i < game.boardWidth; i++){
			game.context.moveTo(i * game.blockSize, 0);
			game.context.lineTo(i * game.blockSize, game.boardHeight * game.blockSize);
		}
			
		for(let i = 0; i < game.boardHeight; i++){
			game.context.moveTo(0, i * game.blockSize);
			game.context.lineTo(game.boardWidth * game.blockSize, i * game.blockSize);
		}
		
		game.context.moveTo(game.boardWidth * game.blockSize, 0);
		game.context.lineTo(game.boardWidth * game.blockSize, game.boardHeight * game.blockSize);
		game.context.lineTo(0, game.boardHeight * game.blockSize);
		
		game.context.stroke();
	},
	
	drawBoard: function(){
		for(let r = 0; r < game.boardHeight; r++){
			for(let c = 0; c < game.boardWidth; c ++){
				
				var val = game.board[r][c];
				
				if(val != 0){
					game.context.drawImage(game.tiles, (val - 1) * game.blockSize, 0, game.blockSize,
					game.blockSize, c * game.blockSize, r * game.blockSize,
					game.blockSize, game.blockSize);
				}
				
			}
		}
		
		game.drawCurrentShape();
		
	},
	
	drawCurrentShape: function(){
		for(let r = 0; r < game.currentShape.length; r++){
			for(let c = 0; c < game.currentShape[0].length; c ++){				
				
				if(game.currentShape[r][c] != 0){
					game.context.drawImage(game.tiles, (game.color - 1) * game.blockSize, 0, game.blockSize,
					game.blockSize, (game.currentShapeX + c) * game.blockSize, (game.currentShapeY + r) * game.blockSize,
					game.blockSize, game.blockSize);
				}
				
			}
		}
	},
	
	startGame: function(){
		// clear the board
		
		for(let r = 0; r < game.boardHeight; r++){
			for(let c = 0; c < game.boardWidth; c++){
				game.board[r][c] = 0;
			}
		}
		
		game.score = 0;
		game.state = 'playscreen';
		game.setNextShape();
		game.setCurrentShape();
		game.gameOver = false;
		game.animId = requestAnimationFrame(game.animate);
		game.running = true;
		game.paused = false;
	},
	
	stopGame: function(){
		
		game.gameOver = true;
		game.running = false;
		
	},
	
	setNextShape: function(){
		var index = parseInt(Math.random() * game.shapes.length);
		game.nextShape = game.shapes[index];
	},
	
	setCurrentShape: function(){
		game.currentShape = game.nextShape;
		game.currentShapeX = 4;
		game.currentShapeY = 0;
		game.speedTime = game.normal;
		game.deltaX = 0;
		game.color = game.shapes.indexOf(game.currentShape) + 1;
		game.collision = false;
		game.moveX = false;
		
		game.setNextShape();
		
		for(let r = 0; r < game.currentShape.length; r++){
			for(let c = 0; c < game.currentShape[0].length; c ++){
				
				if(game.currentShape[r][c] != 0){
					
					if(game.board[game.currentShapeY + r][game.currentShapeX + c] != 0){
						game.stopGame();
					}
					
				}
				
			}
		}
		
	},
	
	checkLine: function(){
		
		var size = game.board.length - 1;
		
		for(let i = game.board.length - 1; i > 0; i--){
			
			var count  = 0;
			
			for(let j = 0; j < game.board[0].length; j++){
				
				if(game.board[i][j] != 0){
					count ++;
				}
				
				game.board[size][j] = game.board[i][j];
				
			}
			
			if(count < game.board[0].length){
				size --;
			}
			
		}
		
	},
	
	rotateShape: function(){
		
		var rotatedShape = undefined;
		
		rotatedShape = game.transposeMatrix(game.currentShape);
		rotatedShape = game.reverseRows(rotatedShape);
		
		if(game.currentShapeX + rotatedShape[0].length > game.boardWidth || game.currentShapeY + game.currentShape.length > game.boardHeight){
			return;
		}
		
		for(let r = 0; r < rotatedShape.length; r++){
			for(let c = 0; c < rotatedShape[0].length; c ++){
				
				if(rotatedShape[r][c] != 0){
					if(game.board[game.currentShapeY + r][game.currentShapeX + c] != 0){
						return;
					}
				}
			}
		}
		
		game.currentShape = rotatedShape;
		
	},

	transposeMatrix: function(matrix){
		var temp =  [];
		
		for(let c = 0; c < matrix[0].length; c++){
			var row = [];
			for(let r = 0; r < matrix.length; r++){
				
				row.push(matrix[r][c]);
				
			}
			temp.push(row);
		}
		
		return temp;
	},
	reverseRows: function(matrix){
		
		var middle = matrix.length / 2;
		
		for(let i  = 0; i < middle; i++){
			
			var temp = matrix[i];
			
			matrix[i] = matrix[matrix.length - i - 1];
			matrix[matrix.length - i - 1] = temp;
			
		}
		
		return matrix;
		
	},
	
};

var playButton = {
	
	init: function(){
		playButton.width = 100;
		playButton.height = 80;
		playButton.srcX = 0;
		playButton.srcY = 0;
		playButton.x = game.canvas.width / 2 - playButton.width / 2;
		playButton.y = game.canvas.height / 2 - playButton.height / 2 - 40;

	},
	
	update: function(){
		
		if(mouse.x > playButton.x && mouse.x < playButton.x + playButton.width && 
			mouse.y > playButton.y && mouse.y < playButton.y + playButton.height){
			playButton.srcX = 200;
			if(mouse.down){
				playButton.srcX = 100;
				game.startGame();
			}
		}else{
			playButton.srcX = 0;
		}
		
	},
	
	draw: function(){
		game.context.drawImage(game.playSheet, playButton.srcX, playButton.srcY, playButton.width, playButton.height,
		playButton.x, playButton.y, playButton.width, playButton.height);
	},
	
};

var refreshButton = {
	
	init: function(){
		refreshButton.width = 50;
		refreshButton.height = 50;
		refreshButton.srcX = 0;
		refreshButton.srcY = 0;
		refreshButton.srcWidth = 50;
		refreshButton.srcHeight = 50;
		refreshButton.x = 350;
		refreshButton.y = 500;

	},
	
	update: function(){
		
		if(mouse.x > refreshButton.x && mouse.x < refreshButton.x + refreshButton.width && 
			mouse.y > refreshButton.y && mouse.y < refreshButton.y + refreshButton.height){
			
			refreshButton.x = 340;
			refreshButton.y = 490;
			
			refreshButton.width = 70;
			refreshButton.height = 70;
			
			if(mouse.down){
				game.stopGame();
				game.startGame();
			}
			
		}else{
			refreshButton.x = 350;
			refreshButton.y = 500;
			refreshButton.width = 50;
			refreshButton.height = 50;
		}
		
	},
	
	draw: function(){
		
		game.context.drawImage(game.restartButton, refreshButton.srcX, refreshButton.srcY, refreshButton.srcWidth, refreshButton.srcHeight,
		refreshButton.x, refreshButton.y, refreshButton.width, refreshButton.height);
	},
	
};

var pauseButton = {
	
	init: function(){
		pauseButton.width = 50;
		pauseButton.height = 50;
		pauseButton.srcX = 0;
		pauseButton.srcY = 0;
		pauseButton.srcWidth = 50;
		pauseButton.srcHeight = 50;
		pauseButton.x = 350;
		pauseButton.y = 400;

	},
	
	update: function(){
		
		if(mouse.x > pauseButton.x && mouse.x < pauseButton.x + pauseButton.width && 
			mouse.y > pauseButton.y && mouse.y < pauseButton.y + pauseButton.height){
			
			pauseButton.x = 340;
			pauseButton.y = 390;
			
			pauseButton.width = 70;
			pauseButton.height = 70;
			
			if(mouse.down && game.inputLapse > game.inputTime){
				
				game.inputLapse = 0;
				
				if(game.gameOver){
					return;
				}
				
				game.paused = !game.paused;
			}
			
		}else{
			pauseButton.x = 350;
			pauseButton.y = 400;
			pauseButton.width = 50;
			pauseButton.height = 50;
		}
		
	},
	
	draw: function(){
		
		game.context.drawImage(game.pauseButton, pauseButton.srcX, pauseButton.srcY, pauseButton.srcWidth, pauseButton.srcHeight,
		pauseButton.x, pauseButton.y, pauseButton.width, pauseButton.height);
	},
	
};


var mouse = {
	x:0,
	y:0,
	down:false,
	init:function(){
		$('#canvas').mousemove(mouse.mousemovehandler);
		$('#canvas').mousedown(mouse.mousedownhandler);
		$('#canvas').mouseup(mouse.mouseuphandler);
		$('#canvas').mouseout(mouse.mouseuphandler);
	},
	mousemovehandler:function(ev){
		var offset = $('#canvas').offset();
		mouse.x = ev.pageX - offset.left;
		mouse.y = ev.pageY - offset.top;
		if (mouse.down) {
			mouse.dragging = true;
		}
	},
	mousedownhandler:function(ev){
		mouse.down = true;
		mouse.downX = mouse.x;
		mouse.downY = mouse.y;
		ev.originalEvent.preventDefault();
	},
	mouseuphandler:function(ev){
		mouse.down = false;
		mouse.dragging = false;
	}
}

var keyboard = {
	
	init: function(){
		window.addEventListener('keydown', keyboard.keydownhandler);
		window.addEventListener('keyup', keyboard.keyuphandler);
	},
	
	keydownhandler: function(ev){
		if(ev.keyCode == 37){
			game.deltaX = -1;
		}else if(ev.keyCode == 38){
			game.rotateShape();
		}else if(ev.keyCode == 39){
			game.deltaX = 1;
		}else if(ev.keyCode == 40){
			game.speed = game.fast;
		}
	},
	
	keyuphandler: function(ev){
		if(ev.keyCode == 40){
			game.speed = game.normal;
		}	
	}
}

$(window).on('load', function() {
	game.init();
});
