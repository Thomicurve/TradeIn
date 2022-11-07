var $$ = Dom7;
// save store as global object
const store = Framework7.createStore({
  state: {
    userToken: "",
  },
  getters: {
    getUserToken({ state }) {
      return state;
    },
  },
});

var app = new Framework7({
  // App root element
  root: "#app",
  store,
  // App Name
  name: "TradeIn",
  // App id
  id: "com.tradein.test",
  // Enable swipe panel
  panel: {
    swipe: "left",
  },
  // Add default routes
  routes: [
    {
      path: "/cuenta/",
      name: "cuenta",
      url: "./pages/account.html",
    },
    {
      path: "/activos/",
      name: "activos",
      url: "./pages/actives.html",
    },
    {
      path: "/registro/",
      name: "registro",
      url: "./pages/register.html",
    },
    {
      path: "/",
      url: "./index.html",
      name: "inicio",
    },
  ],
});



var mainView = app.views.create(".view-main");
/**
 * La key con la que se va a identificar las credenciales del usuario
 * en el localstorage
 */
let credentialsKey = "userCredentials"; 

// Handle Cordova Device Ready Event
$$(document).on("deviceready", function () {
  console.log("Device is ready!");
});

app.on("pageInit", function (page) {
  // verifica que exista el token del usuario en la sesion actual
    if (app.store.state.userToken != "") {
      mainView.router.navigate({ name: "activos" });
    } else {
      mainView.router.navigate({ name: "inicio" });
    }

  }
);

/**
 * Funcion para iniciar sesion ingresando los datos manualmente
 * @param {String} email 
 * @param {String} password
*/
function Login(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => console.log(userCredential.user))
    .catch(error => console.error("Login error: " + error));
}

function GoogleLogin() {
  let provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      // localStorage.setItem(credentialsKey, result.)
    })
    .catch(error => console.error(error));
}



$$(document).on("page:init", '.page[data-name="login"]', function (e) {
  console.log(this);
  // envio del formulario de login
  $$("#login-form").on("submit", (e) => {
    e.preventDefault();
    const inputPasword = $$("#password-input")[1].value;
    const inputEmail = $$("#email-input")[1].value;
    Login(inputEmail, inputPasword);
  });

  $$("#google-login").on("click", (e) => {
    GoogleLogin();
  });
});
