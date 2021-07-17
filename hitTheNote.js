var canvas = document.getElementById('canvasID');
var context = canvas.getContext('2d');
var selectBox = document.getElementById('selectBox');
let frame = 100;
const cMajor = ["C", "D", "E", "F", "G", "A", "B"];
const cWrongNote = ["C#", "Dd", "D#", "Ed", "F#", "Gd", "G#", "Ad", "A#", "Bd"];
const dMajor = ["D", "E", "F#", "G", "A", "B", "C#"];
const dWrongNote = ["D#", "Ed", "F", "Gd", "G#", "Ad", "A#", "Bd", "C", "Dd"];
//["C", "C#", "Dd", "D", "D#", "Ed", "E", "F", "F#", "Gd", "G", "G#", "Ad", "A", "A#", "Bd", "B"];
var gameOver = false;
let score = 0;
let countWrongNotehit = 0;
let selectedRightNote = [];
let selectedWrongNote = [];
let trackStartBtnClick = 0;
const audio = {
    eat : new Audio("audio/eatSound.mp3"),
    shoot : new Audio("audio/shootSound.mp3"),
    worng : new Audio("audio/wrong.wav"),
    gameOver : new Audio("audio/gameOverSound.wav"),
    background : new Audio("audio/background.mp3"),

}

// button click left, right, up 
const buttonClick = {
    left : false,
    right : false,
    up : false,
};

function screenSize(){// adjust according to screenSize
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

window.addEventListener('keydown', function(event){
    if(event.key == 'ArrowLeft'){
        buttonClick.left = true;
    }
    else if(event.key == 'ArrowRight'){
        buttonClick.right = true;
    }
    else if(event.key == 'ArrowUp'){
        buttonClick.up = true;
    }
});

window.addEventListener('keyup', function(){
    buttonClick.left = false;
    buttonClick.right = false;
    buttonClick.up = false;
});


class Player{
    constructor() {
        this.x = canvas.width/2;
        this.y = canvas.height;
        this.angle = -90;
        this.length = 80;
        this.radius = 40;
        this.moveToX; // moving X direction of player gun
        this.moveToY; // moving Y direction of player gun
    }
    update(){
        // increasing or decreasing angle of gun
        if(buttonClick.left & this.angle >= -160){
            this.angle -= 10;
            buttonClick.left = false;
        }
        else if(buttonClick.right & this.angle <= -20){
            this.angle += 10;
            buttonClick.right = false;
        }
        // calculating the  gun facing direction
        this.moveToX = this.x + Math.cos(Math.PI * this.angle / 180) * this.length; 
        this.moveToY = this.y + Math.sin(Math.PI * this.angle / 180) * this.length;
    }

    draw(){        
        // ball gun
        context.beginPath();
        context.moveTo(this.moveToX, this.moveToY);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.closePath();
        //player ball 
        drawBubble(this.x, this.y, this.radius, 0, Math.PI, 'red', true);

    }
}

const bulletArray=[];
class Bullet{
    constructor(){
        this.x = player.moveToX;//player.x
        this.y = player.moveToY;//player.y
        this.radius = 20;
        this.speed = 10;
        this.angle = Math.abs(player.angle); // abs change the negitive number to positive number
        this.velocityX = this.speed*Math.cos(Math.PI*this.angle/180);
        this.velocityY = this.speed*Math.sin(Math.PI*this.angle/180);
        this.distance = 0; // distance travel by each bullet

    }

    update(){
        if(this.x+this.radius > canvas.width || this.x <= 0+this.radius){ // if bullet touch left and right wall
            this.velocityX = -this.velocityX;
        }        
        this.x += this.velocityX;
        this.y += -this.velocityY;

    }

    draw(){ 
        drawBubble(this.x, this.y, this.radius, 0, Math.PI*2, 'black', false);
        // text inside circle 'bullet'
        writeText(noteName,"", this.x-10, this.y+15, 35, 'white');

    }
}

// it shoot (darw and update) the black bubble in every up array click
function shootBullet(){
    if(buttonClick.up){ // create new buttet in every up arrow click
        audio.shoot.play();
        audio.shoot.currentTime = 0;
        bulletArray.push(new Bullet());
    }
    buttonClick.up = false;

    for(let i = 0; i<bulletArray.length; i++){ // iterating over bullet array
        bulletArray[i].update();
        bulletArray[i].draw();
        bulletArray[i].distance++; // increating distance of every bullet
    }
    
    for(let i = 0; i<bulletArray.length; i++){ // removing bullets from array
        if(bulletArray[i].y < 0  || bulletArray[i].distance >= 160 || bulletArray.length >= 5){
            bulletArray.splice(i,1);
        }
    }
    
}

let rightNotesArray = [];
class RightNote{
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.radius = 30;
        this.speed = 2;
        this.random = Math.floor(Math.random()*selectedRightNote.length);
        this.note = selectedRightNote[this.random];

    }

    update(){ this.y += this.speed; }

    draw(){
        drawBubble(this.x, this.y, this.radius, 0, Math.PI*2, 'orange', false);
        // text inside circle 'bullet'
        writeText(this.note,"", this.x-10, this.y+15, 35, 'white');
    }
}


let wrongNotesArray = [];
class WrongNote{
    constructor() {
        this.x = Math.random()*canvas.width;
        this.y = 0;
        this.radius = 30;
        this.speed = 2;
        this.random = Math.floor(Math.random()*selectedWrongNote.length); // selectedWrongNote value is getting from getSelectedNote() function;
        this.note = selectedWrongNote[this.random];
    }

    update(){ this.y += this.speed;  }

    draw(){
        drawBubble(this.x, this.y, this.radius, 0, Math.PI*2, 'Green', false);
        // text inside circle 'bullet'
        writeText(this.note,"", this.x-20, this.y+10, 35, 'white');
    }


}

// handle display of wrong and right note moving from top to buttom
let turn = ["wrongNoteTurn", "rightNoteTurn"];
function handleNotes(){
    if(frame % 100 == 0){
        if(turn[Math.floor(Math.random()*turn.length)] == "wrongNoteTurn"){
            wrongNotesArray.push(new WrongNote());
        }else{
            rightNotesArray.push(new RightNote());
        }
        
    }
    //---------for right notes-------------------------//
    for(var j = 0; j < rightNotesArray.length; j++){
        rightNotesArray[j].update();
        rightNotesArray[j].draw();
    }
    // removing notes that crosses canvas height
    for(var j = 0; j < rightNotesArray.length; j++){
        if(rightNotesArray[j].y >= canvas.height){ // if right note "orange bubble" cross canvas height 
            score --;
            rightNotesArray.splice(j, 1);
            if(score < -2 ){ gameOver = true;} 
        }
    }

    //---------for wrong notes-------------------------//
    for(var k = 0; k < wrongNotesArray.length; k++){
        wrongNotesArray[k].update();
        wrongNotesArray[k].draw();
    }
    // removing notes that crosses canvas height
    for(var k = 0; k < wrongNotesArray.length; k++){
        if(wrongNotesArray[k].y >= canvas.height){ 
            wrongNotesArray.splice(k, 1); 
        }
    }

}

// if bullet "black bubble" hit right note "orange bubble" or wronng note "green bubble";
function hitNote(){
    let bulletX, bulletY, bulletR;
    let rightNoteX, rightNoteY, rightNoteR;
    let wrongNoteX, wrongNoteY, wrongNoteR;
    let distanceBulletAndRightNote, distanceBulletAndWrongNote;
    //for bullet
    for(let i = 0; i < bulletArray.length; i++){
        bulletX = bulletArray[i].x;
        bulletY = bulletArray[i].y;
        bulletR = bulletArray[i].radius;
        //for rightNote
        for(let j = 0; j <rightNotesArray.length; j++){
            rightNoteX = rightNotesArray[j].x;
            rightNoteY = rightNotesArray[j].y;
            rightNoteR = rightNotesArray[j].radius;
            // distance btn bullet and right note
            distanceBulletAndRightNote = calculateDistance(bulletX, bulletY, rightNoteX, rightNoteY);
            // if distance btn bullet "black bubble" is less then right note "orange bubble" /  bullet "black bubble" radius 
            if(distanceBulletAndRightNote < bulletR || distanceBulletAndRightNote < rightNoteR){
                score ++;
                audio.eat.play();
                rightNotesArray.splice(j, 1);
                bulletArray.splice(i, 1);
            }
        }
        //for wrong Note
        for(let k = 0; k < wrongNotesArray.length; k++){
            wrongNoteX = wrongNotesArray[k].x;
            wrongNoteY = wrongNotesArray[k].y;
            wrongNoteR = wrongNotesArray[k].radius;
            // distance btn bullet and wrong note
            distanceBulletAndWrongNote = calculateDistance(bulletX, bulletY, wrongNoteX, wrongNoteY);
            // if distance btn bullet "black bubble" is less then wrong note "green bubble" /  bullet "black bubble" radius 
            if(distanceBulletAndWrongNote < bulletR || distanceBulletAndWrongNote < wrongNoteR){
                audio.worng.play();
                countWrongNotehit ++;
                wrongNotesArray.splice(k, 1);
                bulletArray.splice(i, 1);
                // if hit wrong note 3 time
                if(countWrongNotehit >= 3){ gameOver = true; }
            }
        }
    }
}

var noteName = "";
function getSelectedNote(){
    var noteArrayName = selectBox.value;
    let notesStore = {"cMajor" : [cMajor, cWrongNote], "dMajor" : [dMajor, dWrongNote]};
    selectedRightNote = notesStore[noteArrayName][0]; 
    selectedWrongNote = notesStore[noteArrayName][1];
    // it helps to witer choosen note name in black bubble
    if(noteArrayName == "cMajor"){ noteName = "C"; }
    else if(noteArrayName == "dMajor"){ noteName = "D"; }
}


function calculateDistance(x1,y1,x2,y2){
    let dx = x2 - x1;
    let dy = y2 - y1;
    let distance =  Math.sqrt(dx*dx + dy*dy);
    return distance;
}

function drawBubble(x, y, radius, startAngle, endAngel, color, anticlockwise){
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, radius, startAngle, endAngel, anticlockwise);
    context.fill();
    context.stroke();
    context.closePath();
}

function writeText(title, skore, x, y, fontSize, color){
    context.beginPath();
    context.font = fontSize+"px Georgia";
    context.fillStyle = color;
    context.fillText(title+skore, x ,y);
    context.closePath();

}

function animate(){
    frame ++;
    context.clearRect(0,0, canvas.width, canvas.height);
    player.update();
    player.draw();
    shootBullet(); // shoot black bubble
    handleNotes(); // darw and update green and orange bubble "wrong and right note"
    hitNote();  // remove the bubble that strike with each other
    writeText("Hit The Right Note","", canvas.width/2-200, 60, 50, 'black');
    //scoreboard
    writeText("Wrong Note : ", countWrongNotehit, 250, canvas.height-10, 50, 'black');
    writeText("Score : ", score, 0, canvas.height-10, 50, 50, 'black');
    if(!gameOver){ 
        requestAnimationFrame(animate);
    }else{
        audio.gameOver.play();
        audio.background.pause();
        audio.background.currentTime = 0; // it helps to make audio to 0:00
        writeText("Game Over","", canvas.width/2-150, canvas.height/2, 60, 'red');
        writeText("Highest Score : ","--", canvas.width/2-200 , canvas.height/2+100, 60, 'red'); 
    }
}

function start(){
    audio.background.play();
    if(trackStartBtnClick == 0){
        trackStartBtnClick = 1;
        gameOver = false;
        score = 0 ;
        countWrongNotehit = 0;
        getSelectedNote();
        animate();
    }
}

function stop(){
    trackStartBtnClick = 0;
    gameOver = true;
    rightNotesArray = [];
    wrongNotesArray = [];
    bulletArray = [];
}

screenSize();
const player = new Player();
writeText("Hit The Right Note","", canvas.width/2-200, 60, 50, 'black');
writeText("Press play button to start game","", canvas.width/4, canvas.height/2, 50,'black');