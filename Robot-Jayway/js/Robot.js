var h = React.createElement;
// var magnifier = 40;
var animationIterator=0;
var hiddenCanvas;
var hiddenContext;
var orientation;

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


var App =  React.createClass({
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

  parseInputs: function(input){
    return input.split('');    
  },

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
    this.setState({shape:'Square'});
    this.setState({direction:0});
    this.setState({commandList:null});
    this.setState({convas:null});
    this.setState({context:null});
    this.setState({magnifier:50});

  },

  drawRoom: function(){
    if (this.state.canvas !== null){
      if (this.state.shape === 'Circle'){
        this.drawRobot();
        this.state.context.beginPath();
        this.state.context.restore();
        this.state.context.arc(this.state.size*this.state.magnifier/2, this.state.size*this.state.magnifier/2, this.state.size*this.state.magnifier/2, 0, 2*Math.PI);
        this.state.context.fillStyle ='#149e01';
        this.state.context.fill();
        this.state.canvas.style.backgroundColor='white'; 
        this.state.context.drawImage(hiddenCanvas,0,0)       
      } else {
        this.drawRobot();
        this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
        this.state.canvas.style.backgroundColor='#149e01';
        this.state.context.drawImage(hiddenCanvas,0,0) 
      }
    }
    
  },

  onChange: function(event) {
    var elmn = event.target;    
    if(elmn.type==='radio'){
      var prevShape = document.getElementById(this.state.shape);
      prevShape.checked=false;
      this.setState({shape: elmn.value, shapechanged:true});
    } else if(elmn.type==='range'){ 
      magnifier = elmn.value;
      this.setState({magnifier : elmn.value});
    } else {
      this.setState({size: elmn.value, shapechanged:true});
    }
  },

  onClick: function(event){
    var x = +document.getElementById('x').value;
    var y = +document.getElementById('y').value;
    if ( x === '' && y === ''){
      alert('Please fill in the starting point with xy format!');
    } else {
      if(this.state.startX !== null && this.state.startY !== null){
        alert('You need to reset!');
      } else if (this.state.shape === 'Square' && 0<=x && x<this.state.size && 0<=y && y<this.state.size){
      this.setState({startX:x, startY:y, direction:0});
    }else if (this.state.shape === 'Circle' && this.distance(x, y)< (this.state.size/2)){
      this.setState({startX:x, startY:y, direction:0});
    }else{
        alert('The inserted location is out of room.');
      }
    } 
  },

  calculateNextStepSquare: function(){
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
      if (nextCommand === 0 && this.state.startY+1<this.state.size){
        this.setState({ startY:this.state.startY+1, direction: direction});
      }else if (nextCommand === 90 && this.state.startX+1<this.state.size){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else if (nextCommand === -90 && 0<=this.state.startX-1){
        this.setState({startX:this.state.startX-1,direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }     
    } else if (this.state.direction === 90){
      if (nextCommand === 0 && this.state.startX+1<this.state.size){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else if (nextCommand === 90 && 0<=this.state.startY-1){
        this.setState({ startY:this.state.startY-1, direction: direction});
      }else if (nextCommand === -90 && this.state.startY+1<this.state.size){
        this.setState({startY:this.state.startY+1, direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 180  ){
      if (nextCommand === 0 && this.state.startY-1<this.state.size){
        this.setState({startY:this.state.startY-1, direction: direction});
      }else if (nextCommand === 90 && this.state.startX+1<this.state.size){
        this.setState({startX:this.state.startX-1, direction: direction});
      }else if (nextCommand === -90 && 0<=this.state.startX-1){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 270  ){
      if (nextCommand === 0  && 0<=this.state.startX-1){
        this.setState({startX:this.state.startX-1, direction: direction});
      }else if (nextCommand === 90 && this.state.startY+1<this.state.size){
        this.setState({startY:this.state.startY+1, direction: direction});
      }else if (nextCommand === -90 && 0<=this.state.startY-1){
        this.setState({startY:this.state.startY-1, direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }
    orientation = direction;
    // this.setState({direction: direction});
    return [direction, continueLoop]
  },

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
      if (nextCommand === 0 && this.distance(this.state.startX,this.state.startY+1)<(this.state.size/2)){
        this.setState({ startY:this.state.startY-1, direction: direction});
      }else if (nextCommand === 90 && this.distance(this.state.startX+1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else if (nextCommand === -90 && this.distance(this.state.startX-1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX-1, direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }     
    } else if (this.state.direction === 90){
      if (nextCommand === 0 && this.distance(this.state.startX+1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX+1, direction: direction});
      }else if (nextCommand === 90 && this.distance(this.state.startX,this.state.startY+1)<(this.state.size/2)){
        this.setState({ startY:this.state.startY+1,direction: direction});
      }else if (nextCommand === -90 && this.distance(this.state.startX,this.state.startY-1)<(this.state.size/2)){
        this.setState({startY:this.state.startY-1, direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 180  ){
      if (nextCommand === 0 && this.distance(this.state.startX,this.state.startY+1)<(this.state.size/2)){
        this.setState({startY:this.state.startY+1,direction: direction});
      }else if (nextCommand === 90 && this.distance(this.state.startX-1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX-1,direction: direction});
      }else if (nextCommand === -90 && this.distance(this.state.startX+1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX+1,direction: direction});
      }else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }else if (this.state.direction === 270  ){
      if (nextCommand === 0  && this.distance(this.state.startX-1,this.state.startY)<(this.state.size/2)){
        this.setState({startX:this.state.startX-1,direction: direction});
      }else if (nextCommand === 90 && this.distance(this.state.startX,this.state.startY-1)<(this.state.size/2)){
        this.setState({startY:this.state.startY-1,direction: direction});
      }else if (nextCommand === -90 && this.distance(this.state.startX,this.state.startY+1)<(this.state.size/2)){
        this.setState({startY:this.state.startY+1,direction: direction});
      } else {
        alert('Reached the end of the room.');
        continueLoop = false;
      }
    }
    orientation = direction;
    // this.setState({direction: direction});
    return [direction, continueLoop]
  },

  delayedLoop: function(){
    this.setState({prevX : this.state.startX, prevY : this.state.startY});
    setTimeout(function(){
      var nextStepInfo
      if(this.state.shape === 'Circle'){
        nextStepInfo = this.calculateNextStepCircle();
      }else {
        nextStepInfo = this.calculateNextStepSquare();
      }
      
      if (nextStepInfo[1] && this.state.commandList.length>0){
        this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
        this.drawRobot(nextStepInfo[0]); 
        this.delayedLoop();  
        // if (this.state.commandList.length>0) {           
        //   this.delayedLoop();            
        // }
      }else {
        this.drawRoom();
      }
    }.bind(this), 1000)
  },

  drawRobot: function(){
    if (this.state.startX === null && this.state.startY === null){
      return
    }
    if (this.state.shape ==='Circle'){
      this.state.context.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
      this.state.context.save();
      this.state.context.translate( (this.state.size*this.state.magnifier)/2, (this.state.size*this.state.magnifier)/2);
      this.state.context.beginPath();
      if (this.state.direction!==0){
        // this.state.context.translate( (this.state.startX*magnifier)+(magnifier/2), (this.state.startY*magnifier)-(magnifier/2));
        // this.state.context.rotate(this.state.direction*Math.PI/180);
        // this.state.context.translate(-(this.state.startX*magnifier)-(magnifier/2),-(this.state.startY*magnifier)+(magnifier/2));
        
        this.state.context.translate( (this.state.startX*this.state.magnifier), (this.state.startY*this.state.magnifier));
        this.state.context.rotate(this.state.direction*Math.PI/180);
        this.state.context.translate(-(this.state.startX*this.state.magnifier),-(this.state.startY*this.state.magnifier));
      }

      // this.state.context.moveTo((this.state.startX*magnifier)+(magnifier/2), (this.state.startY*magnifier)-magnifier);
      // this.state.context.lineTo((this.state.startX*magnifier), (this.state.startY*magnifier));
      // this.state.context.lineTo((this.state.startX*magnifier)+magnifier, (this.state.startY*magnifier));

      this.state.context.moveTo((this.state.startX*this.state.magnifier), (this.state.startY*this.state.magnifier)-(this.state.magnifier/2));
      this.state.context.lineTo(((this.state.startX*this.state.magnifier)+this.state.magnifier/2), (this.state.startY*this.state.magnifier)+(this.state.magnifier/2));
      this.state.context.lineTo((this.state.startX*this.state.magnifier)-(this.state.magnifier/2), (this.state.startY*this.state.magnifier)+(this.state.magnifier/2));

      this.state.context.fillStyle='red';
      this.state.context.fill();
      this.state.context.translate( -(this.state.size*this.state.magnifier)/2, (this.state.size*this.state.magnifier)/2);
      this.state.context.restore();

    } else{
      this.state.context.save()
      this.state.context.beginPath();
      this.state.context.translate( (this.state.startX*this.state.magnifier)+(this.state.magnifier/2), (this.state.canvas.height-(this.state.startY*this.state.magnifier)-(this.state.magnifier/2)));
      this.state.context.rotate(this.state.direction*Math.PI/180);
      this.state.context.translate(-((this.state.startX*this.state.magnifier)+(this.state.magnifier/2)),-((this.state.canvas.height-(this.state.startY*this.state.magnifier))-(this.state.magnifier/2)));
      this.state.context.moveTo((this.state.startX*this.state.magnifier), (this.state.canvas.height-(this.state.startY*this.state.magnifier)));
      this.state.context.lineTo(((this.state.startX*this.state.magnifier)+this.state.magnifier), (this.state.canvas.height-(this.state.startY*this.state.magnifier)));
      this.state.context.lineTo((this.state.startX*this.state.magnifier)+(this.state.magnifier/2), (this.state.canvas.height-(this.state.startY*this.state.magnifier)-this.state.magnifier));
      this.state.context.fillStyle='red';
      this.state.context.fill();
      this.state.context.restore();

    }
    hiddenContext.clearRect(0,0,this.state.canvas.width,this.state.canvas.height);
    hiddenContext.drawImage(this.state.canvas, 0, 0);
  },

  distance: function(dx,dy){
    var distance = Math.sqrt(dx*dx+ dy*dy);
    return distance;
  },

  start: function(){
    var command = document.getElementById("command");
    // this.drawRobot();
    if (command.value !== ''){
      var commandList = this.parseInputs(command.value);
      this.setState({commandList:commandList});
      this.delayedLoop();
    } else if (command.value === ''){
      alert('Please provide the rout for robot!');
    }
  },

  componentDidUpdate: function(){
    if (this.state.context === null){
      var context = this.state.canvas.getContext("2d");
      this.setState({ context: context});
    } 
    this.drawRoom(); 
      
  },

  componentDidMount: function(){
    hiddenCanvas = document.getElementById("hidden");
    hiddenContext = hiddenCanvas.getContext("2d");
    var canvas = document.getElementById("room");
    var context = canvas.getContext("2d");
    this.setState({canvas: canvas, context: context});
  },

  render: function(){    
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
    this.state.shapechanged;     
    return (h('div', {className:'container', id:'container'},
      h('form',{id:'form'},
        h('label', {key:'square', id:'square'},
        h('input',{onChange:this.onChange, type:"radio", className:'radio', id:'Square', defaultChecked:true, value:'Square'},null), 'Square'),
        h('label', {key:'circle', id:'circle'},
        h('input',{onChange:this.onChange, type:"radio", className:'radio', id:'Circle', defaultChecked:false, value:'Circle'},null), 'Circle'),
        // h('input',{type:"range", min:"1", max:"100", defaultValue:this.state.magnifier, className:"slider", id:"slider", onChange:this.onChange}, null), //it is a bit buggy....
        h('input', {placeholder:"size", id:"size", onChange:this.onChange},null),
        h(Command,{onClick:{set:this.onClick, start:this.start, reset:this.reset}}, 'Command'),
        h('ul', null, 
        h('li', {key:'shapeOp' }, 'Shape: '+ this.state.shape ),
        h('li', {key:'sizeOp' }, 'Size: '+ this.state.size),
        h('li',{key:'magnifierOp'},'Magnifier: ' + this.state.magnifier)),
        h('div',{id:'result'},
          h('p',null, 'Current location: ' + this.state.startX + ','+ this.state.startY) ,
          h('p',null, 'Current direction: ' + orientation))),
      h('div',{id:'roomContainer'},
      h('canvas',{className:'room',id:'room', width:this.state.size*this.state.magnifier, height:this.state.size*this.state.magnifier},null),
      h('canvas',{id:'hidden', width:this.state.size*this.state.magnifier, height:this.state.size*this.state.magnifier, hidden:true},null))
      )
    )
  }
})