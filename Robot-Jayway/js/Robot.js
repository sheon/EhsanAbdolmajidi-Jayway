var h = React.createElement;
var animationIterator=0;
var hiddenCanvas;
var hiddenContext;
var orientation;


  /**
 * This component creats the command panel in the App.. 
 */
var Command = React.createClass({
  render: function(){
    return h('div',{id:'commandContainer'},
    h('input', {placeholder:"starting X", id:"x"},null),
    h('input', {placeholder:"starting Y", id:"y"},null),
    h('input',{type:'button', value:'Set', id:'setbtn', onClick:this.props.onClick.set}),
    h('input', {placeholder:"Command", id:"command"},null),
    h('input',{type:'button', value:'Start', id:'startbtn', onClick:this.props.onClick.start}),
    h('input',{type:'button', value:'Reset', id:'resetbtn', onClick:this.props.onClick.reset}),null)
}
})


/**
 * This is the main commponent of this application where 
 * the robot and room along with necessary calculations are done.
 */
var App =  React.createClass({
  

/**
 * This function initialized the default values for the app.
 */
  getInitialState: function(){
    return {
      shape: 'Square',
      size: 10,
      startX:null,
      startY:null,
      prevX:null,
      prevY:null,
      commandList:null,
      direction:null,
      context:null,
      canvas:null,
      magnifier: 50
    }
  },


  /**
 * This function parses and returns the given command string into a list of individual directions. 
 */
  parseInputs: function(input){
    return input.split('');    
  },


  /**
 * This function is an event handler fot reseting the application. 
 * 
 */
  reset: function(){
    var form = document.getElementById('form');
    form.reset();
    if ( this.state.context !== null && hiddenContext !== null){
      this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
      hiddenContext.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
    }
    this.setState({startX:null});
    this.setState({startY:null});
    this.setState({prevX:null});
    this.setState({prevY:null});
    this.setState({size:10});
    // this.setState({shape:'Square'});
    this.setState({direction:null});
    this.setState({commandList:null});
    this.setState({convas:null});
    this.setState({context:null});
    this.setState({magnifier:50});
  },


  /**
 * This function draws the room with the robot on it. 
 */
  drawRoom: function(){
    if (this.state.canvas !== null && this.state.context !== null){
      if (this.state.shape === 'Circle'){
        this.drawRobot();
        this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
        this.state.context.beginPath();
        this.state.context.arc(this.state.size*this.state.magnifier/2, this.state.size*this.state.magnifier/2, this.state.size*this.state.magnifier/2, 0, 2*Math.PI);
        this.state.context.fillStyle ='#DFCEBE';
        this.state.context.fill();
        this.state.canvas.style.backgroundColor='white'; 
        this.drawBoard();
        this.state.context.drawImage(hiddenCanvas,0,0)       
      } else {
        this.drawRobot();
        this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
        this.state.context.beginPath();
        this.state.canvas.style.backgroundColor='#DFCEBE';
        this.drawBoard();
        this.state.context.drawImage(hiddenCanvas,0,0) 
      }
    }
    
  },
  
  drawBoard: function(){
    var x, y;
    switch(this.state.shape){
      case 'Circle':
        x = 0.5;
        y = 0.5;
        break;
      case 'Square':
        x = 0;
        y = 0;
        break;
    }
    for ( y; y <= this.state.size; y += 1) {
        this.state.context.moveTo(0, y*this.state.magnifier);
        this.state.context.lineTo(this.state.size*this.state.magnifier, y*this.state.magnifier);
    }
    
    
    for (x; x <= this.state.size; x += 1) {
      this.state.context.moveTo(x*this.state.magnifier , 0);
      this.state.context.lineTo(x*this.state.magnifier, this.state.size*this.state.magnifier);
    }
    
    this.state.context.strokeStyle = "gray";
    this.state.context.stroke();
  },

  
  /**
 * This function is an event handler setting the size and shape of the room.
 */
  onChange: function(event) {
    var elmn = event.target;    
    if(elmn.type==='radio'){
      var prevShape = document.getElementById(this.state.shape);
      prevShape.checked=false;
      this.reset();
      this.setState({shape: elmn.value, shapechanged:true});
    } else if(elmn.type==='range'){ 
      magnifier = elmn.value;
      this.setState({magnifier : elmn.value});
    } else {
      var shapeSize = this.state.shape === 'Square'? elmn.value:2*elmn.value;
      this.setState({size: shapeSize, shapechanged:true});
    }
  },

/**
 * This function is an event handler for setting the initial location of the robot.  
 */
  onClick: function(event){
    var x = document.getElementById('x').value;
    var y = document.getElementById('y').value;
    
    if ( x === '' && y === ''){
      alert('Please fill in the starting point with xy format!');
    } else {
      x = +x;
      y = +y;
      if(this.state.startX !== null && this.state.startY !== null){
        alert('You need to reset!');
      } else if (this.state.shape === 'Square' && 0<=x-1 && x-1<this.state.size && 0<=y-1 && y-1<this.state.size){
      this.setState({startX:x-1, startY:y-1, direction:0});
    }else if (this.state.shape === 'Circle' && this.distance(x, y)< (this.state.size/2)){
      this.setState({startX:x, startY:y, direction:0});
    }else{
        alert('The inserted location is out of room.');
      }
    } 
  },


/**
 * This function calculates the next step based on the give commands. 
 * it calculated the new coordinates and the direction of the robot in the square room. 
 */
  calculateNextStepSquare: function(){
    var continueLoop= true;
    var nextCommand = this.state.commandList[0];
    this.state.commandList.shift();
    if (nextCommand.toLowerCase() === 'l' || nextCommand.toLowerCase() === 'v'){
      nextCommand=-90;
    } else if (nextCommand.toLowerCase() === 'r' || nextCommand.toLowerCase() === 'h'){
      nextCommand=90;
    }else if (nextCommand.toLowerCase() === 'f' || nextCommand.toLowerCase() === 'g'){
      nextCommand= 0;
    }
    
    var direction = this.state.direction + nextCommand;
    if (direction<0){
      direction = 360+direction;
    }else if (direction === 360){
      direction = 0;
    } 
    if (this.state.direction === 0 ) {
      if (nextCommand === 0 && 0<=this.state.startY-1){
        this.setState({ startY:this.state.startY-1});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({ direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }     
    } else if (this.state.direction === 90){
      if (nextCommand === 0 && this.state.startX+1<this.state.size){
        this.setState({startX:this.state.startX+1});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 180  ){
      if (nextCommand === 0 && this.state.startY+1<this.state.size){
        this.setState({startY:this.state.startY+1});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({ direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 270  ){
      if (nextCommand === 0  && 0<=this.state.startX-1){
        this.setState({startX:this.state.startX-1});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({ direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }
    return continueLoop
  },


/**
 * This function calculates the next step based on the give commands. 
 * it calculated the new coordinates and the direction of the robot in the circular room. 
 */
  calculateNextStepCircle: function(){
    var continueLoop= true;
    var nextCommand = this.state.commandList[0];
    this.state.commandList.shift();
    if (nextCommand.toLowerCase() === 'l' || nextCommand.toLowerCase() === 'h'){
      nextCommand=-90;
    } else if (nextCommand.toLowerCase() === 'r' || nextCommand.toLowerCase() === 'v'){
      nextCommand=90;
    }else if (nextCommand.toLowerCase() === 'f' || nextCommand.toLowerCase() === 'g'){
      nextCommand= 0;
    }
    
    var direction = this.state.direction + nextCommand;
    if (direction<0){
      direction = 360+direction;
    }else if (direction === 360){
      direction = 0;
    } 
    if (this.state.direction === 0 ) {
      if (nextCommand === 0 && this.distance(this.state.startX,this.state.startY-1)<(this.state.size/2)){
        this.setState({ startY:this.state.startY-1});
      }else if (nextCommand === 90 || nextCommand === -90 ){
        this.setState({direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }     
    } else if (this.state.direction === 90){
      if (nextCommand === 0 && this.distance(this.state.startX+1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 180  ){
      if (nextCommand === 0 && this.distance(this.state.startX,this.state.startY+1)<(this.state.size/2)){
        this.setState({startY:this.state.startY+1});
      }else if (nextCommand === 90 || nextCommand === -90){
        this.setState({direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 270  ){
      if (nextCommand === 0  && this.distance(this.state.startX-1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX-1});
      } else if (nextCommand === 90 || nextCommand === -90){
        this.setState({direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }
    return continueLoop;
  },


/**
 * This function makes the animation for moving the robot with a setTimeout of every second.
 * This function the calls itself untill there is not command is left in the list or the robot has reached the end of the room. 
 */
  delayedLoop: function(){
    this.setState({prevX : this.state.startX, prevY : this.state.startY});
    setTimeout(function(){
      var toBeContinued;
      if(this.state.shape === 'Circle'){
        toBeContinued = this.calculateNextStepCircle();
      }else {
        toBeContinued = this.calculateNextStepSquare();
      }
      
      if (toBeContinued && this.state.commandList.length>0){
        this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
        this.drawRobot(); 
        this.delayedLoop();  
      }else {
        this.drawRoom();
      }
    }.bind(this), 1000)
  },


  
/**
 * This function draws the robot based on the location startX and startY and direction in the initialState of the App component
 * This function is mainly called inside darwRoom in order to make sure the robot is shown in every update. 
 */
  drawRobot: function(){
    this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
    hiddenContext.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);

    if (this.state.startX === null && this.state.startY === null){
      return
    }

    if (this.state.shape ==='Circle'){
      this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
      this.state.context.save();
      this.state.context.translate( (this.state.size*this.state.magnifier)/2, (this.state.size*this.state.magnifier)/2);
      this.state.context.beginPath();
      if (this.state.direction!==0){

        // this part of code could be used if the center robot should not be on 0, 0 coordinates.

        // this.state.context.translate( (this.state.startX*magnifier)+(magnifier/2), (this.state.startY*magnifier)-(magnifier/2));
        // this.state.context.rotate(this.state.direction*Math.PI/180);
        // this.state.context.translate(-(this.state.startX*magnifier)-(magnifier/2),-(this.state.startY*magnifier)+(magnifier/2));
        
        this.state.context.translate( (this.state.startX*this.state.magnifier), (this.state.startY*this.state.magnifier));
        this.state.context.rotate(this.state.direction*Math.PI/180);
        this.state.context.translate(-(this.state.startX*this.state.magnifier),-(this.state.startY*this.state.magnifier));
      }

      // this part of code could be used if the center robot should not be on 0, 0 coordinates.

      // this.state.context.moveTo((this.state.startX*magnifier)+(magnifier/2), (this.state.startY*magnifier)-magnifier);
      // this.state.context.lineTo((this.state.startX*magnifier), (this.state.startY*magnifier));
      // this.state.context.lineTo((this.state.startX*magnifier)+magnifier, (this.state.startY*magnifier));

      this.state.context.moveTo((this.state.startX*this.state.magnifier), (this.state.startY*this.state.magnifier)-(this.state.magnifier/2));
      this.state.context.lineTo(((this.state.startX*this.state.magnifier)+this.state.magnifier/2), (this.state.startY*this.state.magnifier)+(this.state.magnifier/2));
      this.state.context.lineTo((this.state.startX*this.state.magnifier)-(this.state.magnifier/2), (this.state.startY*this.state.magnifier)+(this.state.magnifier/2));

      this.state.context.fillStyle='#714029';
      this.state.context.fill();
      this.state.context.translate( -(this.state.size*this.state.magnifier)/2, (this.state.size*this.state.magnifier)/2);
      this.state.context.restore();

    } else{
      this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
      hiddenContext.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
      this.state.context.save();
      this.state.context.beginPath();
      this.state.context.translate( (this.state.startX*this.state.magnifier)+(this.state.magnifier/2), (this.state.startY*this.state.magnifier)+(this.state.magnifier/2));
      this.state.context.rotate(this.state.direction*Math.PI/180);
      this.state.context.translate(-((this.state.startX*this.state.magnifier)+(this.state.magnifier/2)),-((this.state.startY*this.state.magnifier)+(this.state.magnifier/2)));
      
      this.state.context.moveTo((this.state.startX*this.state.magnifier)+(this.state.magnifier/2), (this.state.startY*this.state.magnifier));
      this.state.context.lineTo((this.state.startX*this.state.magnifier), (this.state.startY*this.state.magnifier)+(this.state.magnifier/1));
      this.state.context.lineTo((this.state.startX*this.state.magnifier)+(this.state.magnifier/1), (this.state.startY*this.state.magnifier)+(this.state.magnifier/1));


      this.state.context.fillStyle='#714029';
      this.state.context.fill();
      this.state.context.restore();

    }
    
    hiddenContext.drawImage(this.state.canvas, 0, 0);
  },

  
/**
 * This function the distance between the center of the cel 
 * that the robot is in it to the center of the circular room. 
 * it is a rough estimation to check whether the robot has reach the wall or not.
 */
  distance: function(dx,dy){
    var distance = Math.sqrt(dx*dx+ dy*dy);
    return distance;
  },


/**
 * This function is an event handler which pushes the inserted command string into the app
 * and makes robot move.
 */
  start: function(){
    var command = document.getElementById("command");
    if (command.value !== ''){
      var commandList = this.parseInputs(command.value);
      this.setState({commandList:commandList});
      this.delayedLoop();
    } else if (command.value === ''){
      alert('Please provide the rout for robot!');
    }
  },


  /**
 * This function is trigered everytime one of the initial states is update in the app.
 * thats why it calls the drawRoom function to make sure the room is also updated. 
 */
  componentDidUpdate: function(){
    if (this.state.context === null){
      var context = this.state.canvas.getContext("2d");
      this.setState({ context: context});
    } 
    this.drawRoom(); 
      
  },

  /**
 * This function is trigered once in the begining when the page is loaded. 
 */
  componentDidMount: function(){
    hiddenCanvas = document.getElementById("hidden");
    hiddenContext = hiddenCanvas.getContext("2d");
    var canvas = document.getElementById("room");
    var context = canvas.getContext("2d");
    this.setState({canvas: canvas, context: context});
  },


/**
 * This function renders the HTML page.
 */
  render: function(){
    var locationX,locationY; 
    if (this.state.startX !== null && this.state.startX !== null && this.state.shape === 'Square'){
        locationX = this.state.startX+1;
        locationY = this.state.startY+1;
    }else{
      locationX = this.state.startX;
      locationY = this.state.startY;
    }
    if (this.state.direction !== null){
      switch (this.state.direction){
        case 0:
          orientation = 'North';
          break;
        case 90:
          orientation = 'East';
          break;  
        case 180:
          orientation = 'South';
          break;
        case 270:
          orientation = 'West';
          break;
      }
    } 
    var defaultShapeChecked = this.state.shape ==='Circle' ? true: false; 
    return (h('div', {className:'container', id:'container'},
      h('form',{id:'form'},
        h('label', {key:'square', id:'square'},
        h('input',{onChange:this.onChange, type:"radio", className:'radio', id:'Square', checked:!defaultShapeChecked, value:'Square'},null), 'Square'),
        h('label', {key:'circle', id:'circle'},
        h('input',{onChange:this.onChange, type:"radio", className:'radio', id:'Circle', checked:defaultShapeChecked, value:'Circle'},null), 'Circle'),
        h('p',{key:'magnifierOp'},'Magnifier: ' + this.state.magnifier),
        h('input',{type:"range", min:"1", max:"100", defaultValue:this.state.magnifier, className:"slider", id:"slider", onChange:this.onChange}, null), 
        h('input', {placeholder:"size", id:"size", onChange:this.onChange},null),
        h(Command,{onClick:{set:this.onClick, start:this.start, reset:this.reset}}, 'Command'),
        h('ul', null, 
        h('li', {key:'shapeOp' }, 'Shape: '+ this.state.shape ),
        h('li', {key:'sizeOp' }, 'Size: '+ this.state.size)),
        h('div',{id:'result'},
          h('p',null, 'Current location: ' + (locationX) + ','+ (locationY)) ,
          h('p',null, 'Current direction: ' + (this.state.direction === null? null:orientation)))),
      h('div',{id:'roomContainer'},
      h('canvas',{className:'room',id:'room', width:this.state.size*this.state.magnifier, height:this.state.size*this.state.magnifier},null),
      h('canvas',{id:'hidden', width:this.state.size*this.state.magnifier, height:this.state.size*this.state.magnifier, hidden:true},null))
      )
    )
  }
})