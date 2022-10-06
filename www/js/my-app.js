
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
  $$('.register-button').on('click', () => {
    console.log($$('#email').val());
  })

  if (page.route.name == 'inicio')
    if (page.route.route.options.props.userToken != '') mainView.router.navigate({ name: 'activos' })
    else mainView.router.navigate({ name: 'inicio' })
});





$$(document).on('page:init', '.page[data-name="login"]', function (e) {
  let provider = new firebase.auth.GoogleAuthProvider();

  $$('#google-login').on('click', () => {
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        let credential = result.credential;

        // This gives you a Google Access Token. You can use it to access the Google API.
        let token = credential.accessToken;
        // The signed-in user info.
        let user = result.user;
        console.log(token);
      }).catch((error) => {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // The email of the user's account used.
        let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        let credential = error.credential;
        // ...
      });
  })

  $$('#user-login').on('click', () => {
    firebase.auth().createUserWithEmailAndPassword($$('#email-input').value(),$$('#password-input').value() )
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        console.log(user);
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
        console.log(error);
      });
  })
})