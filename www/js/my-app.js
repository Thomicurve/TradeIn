
var $$ = Dom7;
var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'TradeIn',
  // App id
  id: 'com.tradein.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: [
    {
      path: '/cuenta/',
      name: 'cuenta',
      url: './pages/account.html'
    },
    {
      path: '/activos/',
      name: 'activos',
      url: './pages/actives.html'
    },
    {
      path: '/registro/',
      name: 'registro',
      url: './pages/register.html'
    },
    {
      path: '/',
      url: './index.html',
      name: 'inicio',
      options: {
        props: {
          userToken: ""
        }
      }
    }
  ]

});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
  console.log("Device is ready!");
});


app.on('pageInit', function (page) {

  if (page.route.name == 'inicio')
    if (page.route.route.options.props.userToken != '') mainView.router.navigate({ name: 'activos' })
    else mainView.router.navigate({ name: 'inicio' })
});




$$(document).on('page:init', '.page[data-name="login"]', function (e) {

  $$('#login-form').on('submit', (e) => {
    e.preventDefault()
    console.log($$('#password-input').value());

  })
})