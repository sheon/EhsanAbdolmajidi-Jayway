

describe('App', function() {
  var node, component;
  // call the init function of calculator to register DOM elements
  beforeEach(function() {
      node = document.createElement('div');
      component = ReactDOM.render(React.createElement(App), node);
   });

   

   
  
    it('accepts elements', function() {
      document.getElementById('x').value = 1;
      document.getElementById('y').value = 2;
      document.getElementById('setbtn').click();
      expect(App.state.startX).toBe(1);
    });

  
  });

