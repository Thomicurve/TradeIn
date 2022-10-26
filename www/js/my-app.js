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
let userToken = "";

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

// leer el token
async function readToken() {
  let token = await fetch("token.json");
  return JSON.parse(token);
}

// funcion para refrescar el token del usuario logueado
async function auth() {
  let exists = await fetch("./auth.json");
  if (exists) {
    let tokenData = await fetch("./auth.json");
    token = JSON.parse(tokenData);
    if (new Date(token[".expires"]) < new Date()) {
      await getToken(token.refresh_token);
      return await readToken();
    } else {
      return token;
    }
  } else {
    await getToken();
    return await readToken();
  }
}

// obtener el token de la sesion del usuario
async function getToken(refreshToken) {
  let creds = "";
  if (refreshToken) {
    creds = querystring.stringify({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
  } else {
    creds = querystring.stringify(credentials);
  }
  let token = await fetch("https://api.invertironline.com/token", {
    method: "POST",
    mode: "cors",
    creds,
  });
  await fetch("token.json", JSON.stringify(token.data));
}

// peticion de login a la api de iol
const login = async (email, passw) => {
  let headersList = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  let bodyContent = `password=${passw}&username=${email}&grant_type=password`;

  try {
    let response = await fetch("https://api.invertironline.com/token", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });

    let data = await response.json();
    Swal.fire({
      icon: "success",
      title: "Login Exitoso",
      text: "Inicio de sesion completado!",
    });

    app.store.state.userToken = data.access_token; 
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error al iniciar sesion!",
    });
    console.info(error);
  }
};

$$(document).on("page:init", '.page[data-name="login"]', function (e) {
  console.log(this);
  // envio del formulario de login
  $$("#login-form").on("submit", (e) => {
    e.preventDefault();
    const inputPasword = $$("#password-input").val();
    const inputEmail = $$("#email-input").val();
    

    login(inputEmail, inputPasword);
  });
});
