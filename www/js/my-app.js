var $$ = Dom7;

var app = new Framework7({
  // App root element
  root: "#app",
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

// Handle Cordova Device Ready Event
$$(document).on("deviceready", function () {
  console.log("Device is ready!");
});

let userSessionItemKey = "userSession";
/**
 * Obtiene la sesion del usuario desde el onAuthStateChanged de firebase.
 */
function getUserSession() {
  const userSession = localStorage.getItem(userSessionItemKey);
  if(userSession == "null") return false
  else return true;
}

/**
 * Verifica que el usuario se encuentre logueado, de no ser asi
 * se envia al usuario a la pantalla de login
 */
function verifyUserSession() {
  const userSession = getUserSession();
  if (userSession)
    mainView.router.navigate({ name: "activos" });
  else
    mainView.router.navigate({ name: "inicio" });
}

app.on("pageInit", function (page) {
  verifyUserSession();
}
);


// * AUTENTICACION
/**
 * Funcion para iniciar sesion ingresando los datos manualmente
 * @param {String} email 
 * @param {String} password
*/
function Login(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(({ user: { uid } }) => {
      Swal.fire({
        title: 'Inicio de sesión',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      })
      localStorage.setItem(userSessionItemKey, uid)
      verifyUserSession(uid);
    })
    .catch(error => {
      Swal.fire({
        title: 'Error',
        text: 'Error al iniciar sesión',
        icon: 'error',
      })
      console.error("Login error: " + error)
    } );
}

function GoogleLogin() {
  let provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(({ user: { uid } }) => {
      Swal.fire({
        title: 'Inicio de sesión',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      })
      localStorage.setItem(userSessionItemKey, uid)
      verifyUserSession();
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'Error al iniciar sesión',
        icon: 'error',
      })
    });
}

function LogOut() {
  firebase.auth().signOut().then(() => {
    Swal.fire({
      title: 'Cerrar sesión',
      text: 'Se cerró la sesión del usuario correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    })
    localStorage.setItem(userSessionItemKey, null);
    verifyUserSession();
  }).catch((error) => {
    Swal.fire({
      title: 'Error',
      text: 'Error al cerrar sesión',
      icon: 'error',
    })
    console.error("error al cerrar sesion:", error)
  });
}

function Register (email, password, repeatedPassword) {
  try {
    if(password === repeatedPassword) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        Swal.fire({
          title: 'Registro',
          text: 'Se creó la cuenta correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        })
        mainView.router.navigate({name: "inicio"})
      })
    } else {
      throw new Error("Las contraseñas no coinciden");
    }
  } catch(error) {
    console.error(error);
  };
}

$$(document).on("page:init", '.page[data-name="login"]', function (e) {
  // envio del formulario de login
  $$("#login-form").on("submit", (e) => {
    e.preventDefault();
    const inputPasword = 
      $$("#password-input")[1] ? $$("#password-input")[1].value : $$("#password-input")[0].value;
    const inputEmail = 
      $$("#email-input")[1] ? $$("#email-input")[1].value : $$("#email-input")[0].value;
    Login(inputEmail, inputPasword);
  });

  $$("#google-login").on("click", (e) => {
    GoogleLogin();
  });
});

$$(document).on("page:init", '.page[data-name="registro"]', function (e) {
  $$(".register-button").on("click", (e) => {
    const email = $$("#email")[0].value;
    const password = $$("#password")[0].value;
    const repeatedPassword = $$("#repeatedPassword")[0].value;
    const fullname = $$("#fullname")[0].value;
    Register(email, password, repeatedPassword);
  });
});
// ***************************************************************



$$(document).on("page:init", '.page[data-name="activos"]', function (e) {
  const db = firebase.firestore();
  db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
});
  $$("#logout-button").on("click", (e) => {
    LogOut();
  });
});

