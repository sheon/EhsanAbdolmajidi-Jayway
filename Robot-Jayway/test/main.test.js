var App;
describe('App', function() {
  
  // call the init function of calculator to register DOM elements
  beforeEach(function() {
    jasmine.getFixtures().fixturesPath = 'D:/GitJayway/Robot-Jayway'
    var fixture = loadFixtures('index.html');
  });

  beforeEach(function() {
    App = ReactDOM.render(React.createElement(App), document.getElementById('content'));
  });   

   
  
    it('accepts elements', function() {
      document.getElementById('x').value = 1;
      document.getElementById('y').value = 2;
      document.getElementById('setbtn').click();
      expect(App.state.startX).toBe(1);
    });

  
  });

