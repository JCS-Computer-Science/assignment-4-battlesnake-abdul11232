export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };

    let myBody = gameState.you.body;
    
    // We've included code to prevent your Battlesnake from moving backwards
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    
    if (myNeck.x < myHead.x) {        
        moveSafety.left = false;
        
    } else if (myNeck.x > myHead.x) { 
        moveSafety.right = false;
        
    } else if (myNeck.y < myHead.y) { 
        moveSafety.down = false;
        
    } else if (myNeck.y > myHead.y) { 
        moveSafety.up = false;
    }
    
    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board

    let boardWidth = gameState.board.width;
    let boardHeight = gameState.board.height;

    if (myHead.x == 0){
        moveSafety.left = false;
    }
    
    if (myHead.x == boardWidth - 1){
        moveSafety.right = false;
    }

    if (myHead.y == boardHeight - 1){
        moveSafety.up = false;
    }
    
    if (myHead.y == 0){
        moveSafety.down = false;
    }
    
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake

    for (let i = 0; i <(myBody.length - 1); i++){
        let segment = myBody[i];
        if (segment.x == myHead.x && segment.y == myHead.y + 1){
            moveSafety.up = false;
        }
        if (segment.x == myHead.x && segment.y == myHead.y - 1){
            moveSafety.down = false;
        }
        if (segment.x == myHead.x + 1 && segment.y == myHead.y){
            moveSafety.right = false;
        }

        if (segment.x == myHead.x - 1 && segment.y == myHead.y){
            moveSafety.left = false;
        }

    }
    
    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    const otherSnakes = gameState.board.snakes;

    for (let snake of otherSnakes) {
      
        if (snake.id === gameState.you.id) {
            continue;
        }

        for (let segment of snake.body) {
            if (segment.x === myHead.x && segment.y === myHead.y + 1) {
                moveSafety.up = false;
            }
            if (segment.x === myHead.x && segment.y === myHead.y - 1) {
                moveSafety.down = false;
            }
            if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
                moveSafety.right = false;
            }
            if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
                moveSafety.left = false;
            }
        }
    }

    for (let snake of otherSnakes) {
        if (snake.id === gameState.you.id) continue;
    
        const enemyHead = snake.body[0];
        const enemyLength = snake.length;
        const myLength = gameState.you.length;
    
        
        if (
            enemyHead.x === myHead.x &&
            enemyHead.y + 1 === myHead.y &&
            enemyLength >= myLength
        ) {
            moveSafety.down = false;
        }
    
        
        if (
            enemyHead.x === myHead.x &&
            enemyHead.y - 1 === myHead.y &&
            enemyLength >= myLength
        ) {
            moveSafety.up = false;
        }
    
        
        if (
            enemyHead.x - 1 === myHead.x &&
            enemyHead.y === myHead.y &&
            enemyLength >= myLength
        ) {
            moveSafety.right = false;
        }
    
       
        if (
            enemyHead.x + 1 === myHead.x &&
            enemyHead.y === myHead.y &&
            enemyLength >= myLength
        ) {
            moveSafety.left = false;
        }
    }

    for (let snake of otherSnakes) {
       
        if (snake.id === gameState.you.id) continue;

        const enemyHead = snake.body[0];
        const enemyLength = snake.length;
        const myLength = gameState.you.length;

       
        let possibleEnemyMoves = [
            { x: enemyHead.x, y: enemyHead.y + 1 }, 
            { x: enemyHead.x, y: enemyHead.y - 1 },
            { x: enemyHead.x - 1, y: enemyHead.y }, 
            { x: enemyHead.x + 1, y: enemyHead.y }, 
        ];

        for (let move of possibleEnemyMoves) {
            if (move.x === myHead.x && move.y === myHead.y + 1 && enemyLength >= myLength) {
                moveSafety.up = false;
            }
            if (move.x === myHead.x && move.y === myHead.y - 1 && enemyLength >= myLength) {
                moveSafety.down = false;
            }
            if (move.x === myHead.x + 1 && move.y === myHead.y && enemyLength >= myLength) {
                moveSafety.right = false;
            }
            if (move.x === myHead.x - 1 && move.y === myHead.y && enemyLength >= myLength) {
                moveSafety.left = false;
            }
        }
    }

    
    
    
    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }
    
    // Choose a random move from the safe moves
    const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    let closestFood = null;
    let closestDistance = Infinity;

    for (let food of gameState.board.food) {
        let distance = Math.abs(food.x - myHead.x) + Math.abs(food.y - myHead.y); // Manhattan distance
        if (distance < closestDistance) {
            closestDistance = distance;
            closestFood = food;
        }
    }

    if (closestFood) {

        let foodDirection = '';

        if (closestFood.x < myHead.x) {
            foodDirection = 'left';
        } else if (closestFood.x > myHead.x) {
            foodDirection = 'right';
        } else if (closestFood.y < myHead.y) {
            foodDirection = 'down';
        } else if (closestFood.y > myHead.y) {
            foodDirection = 'up';
        }

        if (moveSafety[foodDirection]) {
            console.log(`MOVE ${gameState.turn}: Moving towards food`);
            return { move: foodDirection };
        }

    }

    let bestMove = safeMoves[0];
    let bestScore = -1;

    for (let move of safeMoves) {
        let newHead = { x: myHead.x, y: myHead.y };
        if (move === "up") newHead.y += 1;
        if (move === "down") newHead.y -= 1;
        if (move === "left") newHead.x -= 1;
        if (move === "right") newHead.x += 1;

        let space = floodFill(newHead, gameState, 10); 
        if (space > bestScore) {
            bestScore = space;
            bestMove = move;
        }
    }

    console.log(`MOVE ${gameState.turn}: ${bestMove}`);
    return { move: bestMove };
}


function floodFill(start, gameState, maxDepth) {
    const width = gameState.board.width;
    const height = gameState.board.height;
    const visited = new Set();
    const queue = [{ x: start.x, y: start.y, depth: 0 }];

    const occupied = new Set();
    for (let snake of gameState.board.snakes) {
        for (let segment of snake.body) {
            occupied.add(`${segment.x},${segment.y}`);
        }
    }

    let count = 0;

    while (queue.length > 0) {
        const { x, y, depth } = queue.shift();
        if (depth > maxDepth) continue;

        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (occupied.has(key)) continue;

        visited.add(key);
        count++;

        queue.push({ x: x + 1, y: y, depth: depth + 1 });
        queue.push({ x: x - 1, y: y, depth: depth + 1 });
        queue.push({ x: x, y: y + 1, depth: depth + 1 });
        queue.push({ x: x, y: y - 1, depth: depth + 1 });
    }

    return count;
    
    console.log(`MOVE ${gameState.turn}: ${nextMove}`)
    return { move: nextMove };
}