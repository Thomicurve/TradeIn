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
      path: "/tienda/",
      name: "tienda",
      url: "./pages/store.html",
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
  if (userSession == null || userSession == "null") return false
  else return true;
}

/**
 * Verifica que el usuario se encuentre logueado, de no ser asi
 * se envia al usuario a la pantalla de login
 */
function verifyUserSession() {
  const userSession = getUserSession();
  if (userSession)
    mainView.router.navigate({ name: "tienda" });
  else
    mainView.router.navigate({ name: "inicio" });
}

app.on("pageInit", function (page) {
  verifyUserSession();
}
);


// * HELPERS
function ShowErrorAlert(message) {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true,
  })
}


// * AUTENTICACION

async function SaveUserIntoDB(UserData) {
  const { id, fullname, email } = UserData;
  const db = firebase.firestore();
  let usersCollection = db.collection("users");

  await usersCollection.doc(id).set({
    fullname,
    email,
    id
  });
}
/**
 * Funcion para iniciar sesion ingresando los datos manualmente
 * @param {String} email 
 * @param {String} password
*/
function Login(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(({ user }) => {
      Swal.fire({
        title: 'Inicio de sesión',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      })
      localStorage.setItem(userSessionItemKey, user.uid)
      verifyUserSession(user.uid);
    })
    .catch(error => {
      Swal.fire({
        title: 'Error',
        text: 'Error al iniciar sesión',
        icon: 'error',
      })
      console.error("Login error: " + error)
    });
}

function GoogleLogin() {
  let provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(({ user }) => {
      Swal.fire({
        title: 'Inicio de sesión',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      })
      localStorage.setItem(userSessionItemKey, user.uid)
      SaveUserIntoDB({
        id: user.uid,
        fullname: user.displayName,
        email: user.email
      });
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

function Register(email, password, repeatedPassword, fullname) {
  try {
    if (password === repeatedPassword) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(({ user }) => {
          Swal.fire({
            title: 'Registro',
            text: 'Se creó la cuenta correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
          })
          SaveUserIntoDB({
            id: user.uid,
            fullname: fullname,
            email: email
          })
          mainView.router.navigate({ name: "inicio" })
        }).catch(({ message }) => ShowErrorAlert(message))
    } else throw new Error("Las contraseñas no coinciden");

  } catch (error) {
    ShowErrorAlert(error)
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
  $$("#user-register").on("click", (e) => {
    const email = $$("#email-register-input").val();
    const password = $$("#password-register-input").val();
    const repeatedPassword = $$("#repeatedpassword-input").val();
    const fullname = $$("#fullname").val();
    Register(email, password, repeatedPassword, fullname);
  });
});
// ***************************************************************



// * TIENDA
let productsStore = [];

/**
 * Obtiene los productos de la tienda desde firebase.
 * Luego los coloca dentro de los productsStore
 */
async function getProducts() {
  const db = firebase.firestore();

  let productsCollection = db.collection("products");
  const querySnapshot = await productsCollection.get();
  querySnapshot.forEach(doc => {
    productsStore.push(doc.data());
  })
}



/**
 * Crea las cartas de productos que se van a visualizar en la ux
 */
async function createProductCards() {
  if (productsStore.length == 0) await getProducts();



  const fragment = document.createDocumentFragment();
  productsStore.forEach(product => {
    const productCardContainer = document.createElement("div");
    productCardContainer.setAttribute("class", "productItem");

    const appendChildsFromProductCard = (child) => productCardContainer.appendChild(child);

    const productImage = document.createElement("img");
    productImage.setAttribute("src", product.image);
    productImage.width = 50;

    const addToCartButton = document.createElement("button");
    addToCartButton.textContent = "Agregar al carrito";
    addToCartButton.setAttribute("class", "productItem__button");


    // const viewProductButton = document.createElement("button");
    // viewProductButton.textContent = "Ver detalle";
    // viewProductButton.setAttribute("class", "productItem__button");


    const productName = document.createElement("p");
    productName.textContent = product.name;
    productName.setAttribute("class", "productItem__info");

    const productPrice = document.createElement("p");
    productPrice.textContent = "$" + product.price;
    productPrice.setAttribute("class", "productItem__info");

    appendChildsFromProductCard(productImage);
    appendChildsFromProductCard(productName);
    appendChildsFromProductCard(productPrice);
    appendChildsFromProductCard(addToCartButton);
    // appendChildsFromProductCard(viewProductButton);
    fragment.appendChild(productCardContainer);


  })


  $$(".productsView").append(fragment);
  configCartEvents()
}


cart = []

/**
 * Tomamos los botones generados en los produtos
 * y les agregamos el evento para cuando los agreguemos
 * al carrito
 */
function configCartEvents() {
  const cartButtoms = $$('.productItem__button');
  const cartNumber = $$('#cart')
  const closeModal = $$('#carritoModal-close')
  const removeCartButton = $$('#carritoModal-deleteCart')

  console.log(cartButtoms)

  removeCartButton.on('click', removeAllItemsFromCart)

  cartNumber.on('click', () => { openAndCloseModalCart("open") })
  closeModal.on('click', () => openAndCloseModalCart("close"))

  cartButtoms.forEach((botones, index) => {
    botones.addEventListener('click', () => addProducInCart(index))
  })
}

let cartItems = 0;
/**
 * 
 * @param {Product} indexButtom 
 * 
 * Agrega los elementos agregados
 * por el usuario al carrito al array
 * cart, aumentamos el numero de productos
 * en el carrito
 */
function addProducInCart(indexButtom) {
  const cartNumber = $$('#cart-cantidad')

  const isValidItem = productsStore.find((_, productIndex) => productIndex === indexButtom)
  const productsInCart = cart.find(product => product.name === isValidItem.name);

  if (isValidItem) {
    const { price, image, description, name, stock } = isValidItem;
    if (!productsInCart) {
      cart.push({
        price,
        image,
        description,
        name,
        stock,
        cartCount: 1
      })
    } else {
      cart.forEach(item => item.name == productsInCart.name && item.cartCount++)
    }
    cartItems++;
    cartNumber.text(cartItems)

  }

}

/**
 * 
 * Renderiza los items que
 * el usuario agrega en el carrito
 * 
 * @param {Porduct} item 
 */
function renderProductInCart(item) {

  const fragment = document.createDocumentFragment();
  const appendChildsFromProductCard = (child) => itemCardContainer.appendChild(child);

  const itemCardContainer = document.createElement("div");
  itemCardContainer.setAttribute("class", "item");


  const productImage = document.createElement("img");
  productImage.setAttribute("src", item.image);
  productImage.setAttribute("class", "item-img");

  const productName = document.createElement("div");
  productName.setAttribute("class", "item-name");
  productName.textContent = item.name;

  const productPrice = document.createElement("div");
  productPrice.setAttribute("class", "item-price");
  productPrice.textContent = item.price;

  const productAmount = document.createElement("div");
  productAmount.setAttribute("class", "item-price");
  productAmount.textContent = `x${item.cartCount}`;


  appendChildsFromProductCard(productImage)
  appendChildsFromProductCard(productPrice)
  appendChildsFromProductCard(productName)
  appendChildsFromProductCard(productAmount);
  fragment.appendChild(itemCardContainer);


  $$('#carritoModal-itemsContainer').append(fragment)
}


/**
 * Funcion para que el usuario pueda
 * eliminar todos los objetos del carrito
 */
function removeAllItemsFromCart() {
  const itemContainer = $$('#carritoModal-itemsContainer')
  const cartNumber = $$('#cart-cantidad')

  if (cart.length < 1) {
    console.log("no puede borrar")
  } else {
    cart.length = 0
    itemContainer.html('')
    cartNumber.text(0)
    openAndCloseModalCart("close")
  }


}


/**
 * 
 * @param {Modal Action} action 
 * 
 * Cerrrar o abrir la ventana modal
 * en la que se va a encontrar el carrito de compras
 */
function openAndCloseModalCart(action) {
  const itemContainer = $$('#carritoModal-itemsContainer')
  // console.log(carritoContainer)

  itemContainer.html('')
  cart.forEach(item => renderProductInCart(item))
  console.log(cart);
  const carritoModal = $$('#carritoModal')
  const shadeBlackBackground = $$('#shadeBackground')

  if (action === "open") {
    carritoModal.addClass('carritoModal')
    carritoModal.removeClass('carritoModal--hidden')

    shadeBlackBackground.addClass('black-shade')
    shadeBlackBackground.removeClass('black-shade--hidden')

    console.log("opened")

  }

  if (action === 'close') {
    carritoModal.removeClass('carritoModal')
    carritoModal.addClass('carritoModal--hidden')

    shadeBlackBackground.removeClass('black-shade')
    shadeBlackBackground.addClass('black-shade--hidden')
  }
}



$$(document).on("page:init", '.page[data-name="tienda"]', function (e) {

  createProductCards();
  $$("#logout-button").on("click", (e) => {
    LogOut();
  });
});
// ***************************************************************************************


// * MI CUENTA

/**
 * Obtiene la informacion del usuario desde el firestore
 */
async function getAccountInfo() {
  let userData = {};

  const userID = localStorage.getItem(userSessionItemKey);
  const db = firebase.firestore();

  let usersCollection = db.collection("users").where("id", "==", userID);
  const querySnapshot = await usersCollection.get();
  querySnapshot.forEach(doc => {
    userData = doc.data();
  })

  return userData;
}

/**
 * Dibuja toda la informacion del usuario en la pantalla
 */
async function showAccountInfo() {
  const userData = await getAccountInfo();
  $$(".account-info").append(`
  <div><h5 class="text-primary">Nombre: ${userData.fullname}</h5></div>
  <div><p class="text-info">Correo electronico: ${userData.email}</p></div>`)
}

$$(document).on("page:init", '.page[data-name="cuenta"]', function (e) {

  showAccountInfo()
});
