const canvas = document.getElementById('canvas')

// initiating 2D context on it
const c = canvas.getContext('2d')

var socket = io();

let username = ''
let isDrawing = false;
let x=0;
let y=0;

function registerUser(){
    c.clearRect(0, 0, canvas.width, canvas.height)
    let input = document.getElementById('username_field')
    let draw_btn = document.getElementById('draw')
	let open_btn = document.getElementById('open')
    let user_message = document.getElementById('user_message')
    if(input.value.length >= 3){
        //Unlock draw button
        if(draw_btn.disabled == true){ draw_btn.disabled = false}
		if(open_btn.disabled == true){ open_btn.disabled = false}
        username = input.value
        user_message.innerHTML = `You are now logged in as : <b>${username}</b>`
    }
    else{
        if(draw_btn.disabled == false){ draw_btn.disabled = true}
		if(open_btn.disabled == false){ open_btn.disabled = true}
        username = input.value
        user_message.innerHTML = `You are no longer registered. Register to be able to see your drawings`
    }
}

function isUserRegistered(){
    return username != ''
}

//EVENT

addEventListener('load', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    let draw_btn = document.getElementById('draw')
	let open_btn = document.getElementById('open')
    let input = document.getElementById('username_field')
    input.value = ''
	open_btn.disabled = true
    draw_btn.disabled = true
	
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
})

canvas.addEventListener('mousedown', function(e) {
    if(username != ''){
        const rect = canvas.getBoundingClientRect()
        x = e.clientX - rect.left
        y = e.clientY - rect.top
        console.log("x: " + x + " y: " + y)
        //Modify last drawer message
        let last_drawer = document.getElementById('last_drawer')
        last_drawer.innerHTML = `The last drawer is <b>YOU</b>`

        isDrawing=true        
    }
    else{
        let user_message = document.getElementById('user_message')
        user_message.innerHTML = `<span style="color:red;">You must be registered to perform this action !</span>`
    }

})

canvas.addEventListener('mousemove', e => {
    if (isDrawing === true) {
      //drawCircleAtCursor(x,y,canvas, e)
      drawLine(x, y, e.offsetX, e.offsetY);
      sendLine({user: username, x: x, y: y, x2: e.offsetX, y2: e.offsetY, pencil_color: document.getElementById('pencil_color').value, pencil_size: parseInt(document.getElementById('pencil_size').value)})
      x = e.offsetX;
      y = e.offsetY;
    }
});

window.addEventListener('mouseup', e => {
    if (isDrawing === true) {
      //drawCircleAtCursor(x,y,canvas, e)
      drawLine(x, y, e.offsetX, e.offsetY);
      x = 0;
      y = 0;
      isDrawing = false;
    }
});

//FIGURE

function draw(){
    let forme = document.getElementById('form').value
    if(forme == 'triangle'){
        drawTriangle()
    }
    else if(forme == 'square'){
        drawSquare()
    }
    else if(forme == 'circle'){
        drawCircle()
    }
}

function drawTriangle(figSize = parseInt(document.getElementById('figure_size').value), borderSize = parseInt(document.getElementById('border_thickness').value), start = getStartingPoint(figSize, borderSize), border_color = document.getElementById('div_border').value, background_color = document.getElementById('canvas_background').value, own_figure = true){
    c.beginPath()
    c.moveTo(start[0], start[1])
    c.lineTo(start[0], start[1]+figSize)
    c.lineTo(start[0]+figSize, start[1]+figSize)
    c.closePath()

    c.lineWidth = borderSize
    c.strokeStyle = border_color
    c.stroke()

    c.fillStyle = background_color
    c.fill()

    let triangle = {
        user: username,
        forme: 'triangle',
        figSize: figSize,
        borderSize: borderSize,
        start: start,
        borderColor: border_color,
        backgroundColor: background_color
    }
    if(own_figure){
        sendData(triangle)
    }
}

function drawSquare(figSize = parseInt(document.getElementById('figure_size').value), borderSize = parseInt(document.getElementById('border_thickness').value), start = getStartingPoint(figSize, borderSize), border_color = document.getElementById('div_border').value, background_color = document.getElementById('canvas_background').value, own_figure = true){
    c.rect(start[0], start[1], figSize, figSize)

    c.lineWidth = borderSize
    c.strokeStyle = border_color
    c.stroke()

    c.fillStyle = background_color
    c.fill()

    let square = {
        user: username,
        forme: 'square',
        figSize: figSize,
        borderSize: borderSize,
        start: start,
        borderColor: border_color,
        backgroundColor: background_color
    }
    if(own_figure){
        sendData(square)        
    }
}

function drawCircle(figSize = parseInt(document.getElementById('figure_size').value), borderSize = parseInt(document.getElementById('border_thickness').value), start = getStartingPoint(figSize, borderSize), border_color = document.getElementById('div_border').value, background_color = document.getElementById('canvas_background').value, own_figure = true){
    c.beginPath()
    c.arc(start[0], start[1], figSize/2, 0, Math.PI * 2)
    c.closePath()

    c.lineWidth = borderSize
    c.strokeStyle = border_color
    c.stroke()

    c.fillStyle = background_color
    c.fill()

    let circle = {
        user: username,
        forme: 'circle',
        figSize: figSize,
        borderSize: borderSize,
        start: start,
        borderColor: border_color,
        backgroundColor: background_color
    }
    if(own_figure){
        sendData(circle)        
    }
    
}

function getStartingPoint(figSize, borderSize){
    let x = (Math.random()*(innerWidth - figSize - borderSize)) + borderSize
    let y = (Math.random()*(innerHeight - figSize - borderSize)) + borderSize
    return [x,y]
}

//LINE

function drawLine(x1, y1, x2, y2, pencil_color = document.getElementById('pencil_color').value, pencil_size = parseInt(document.getElementById('pencil_size').value)) {
// using a line between actual point and the last one solves the problem
// if you make very fast circles, you will see polygons.
// we could make arcs instead of lines to smooth the angles and solve the problem
  c.beginPath();
  c.strokeStyle = pencil_color;
  c.lineWidth = pencil_size;
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  c.closePath();
}

function drawCircleAtCursor(x,y, pencil_color = document.getElementById('pencil_color').value, pencil_size = parseInt(document.getElementById('pencil_size').value)) {
// Problem with draw circle is the refresh rate of the mousevent.
// if you move too fast, circles are not connected.
// this is browser dependant, and can't be modified.
    c.beginPath()
    c.arc(x, y, 10/2, 0, Math.PI * 2)
    c.closePath()

    c.lineWidth = pencil_size
    c.strokeStyle = pencil_color
    c.stroke()
    
    c.fillStyle = pencil_color
    c.fill()
}

// NETWORK

function sendData(data){
    socket.emit('send_figure', data)
}

function sendLine(data){
    socket.emit('send_line', data)
}

socket.on('share_figure', (figure) => {
    if(figure.forme == 'triangle'){
        drawTriangle(figure.figSize, figure.borderSize, figure.start, figure.borderColor, figure.backgroundColor, false)
    }
    else if(figure.forme == 'square'){
        drawSquare(figure.figSize, figure.borderSize, figure.start, figure.borderColor, figure.backgroundColor, false)
    }
    else if(figure.forme == 'circle'){
        drawCircle(figure.figSize, figure.borderSize, figure.start, figure.borderColor, figure.backgroundColor, false)
    }
})

socket.on('share_line', (line) => {
    let last_drawer = document.getElementById('last_drawer')
    last_drawer.innerHTML = `The last drawer is <b>${line.user}</b>`
    drawLine(line.x, line.y, line.x2, line.y2, line.pencil_color, line.pencil_size)
})

// OPEN

function screenShot(){
    var canvasURL  = canvas.toDataURL("png");
	// console.log(canvasImg)
	var newTab = window.open();
    newTab.document.write('<img src="'+canvasURL+'"/>'); 
	newTab.document.close();
}
  
