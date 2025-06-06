const BASE_URL = "http://localhost:3002";

// localStorage.removeItem("accounts");

// Doi sang dinh dang tien VND
function vnd(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

const body = document.querySelector("body");

// Close popup
let modalContainer = document.querySelectorAll(".modal");

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach((item) => {
  item.addEventListener("click", closeModal);
});

let modalBox = document.querySelectorAll(".mdl-cnt");
modalBox.forEach((item) => {
  item.addEventListener("click", function (event) {
    event.stopPropagation();
  });
});

function closeModal() {
  modalContainer.forEach((item) => {
    item.classList.remove("open");
  });
  console.log(modalContainer);
  body.style.overflow = "auto";
}

function increasingNumber(e) {
  let qty = e.parentNode.querySelector(".input-qty");
  if (parseInt(qty.value) < qty.max) {
    qty.value = parseInt(qty.value) + 1;
  } else {
    qty.value = qty.max;
  }
}

function decreasingNumber(e) {
  let qty = e.parentNode.querySelector(".input-qty");
  if (qty.value > qty.min) {
    qty.value = parseInt(qty.value) - 1;
  } else {
    qty.value = qty.min;
  }
}

//Xem chi tiet san pham
// function detailProduct() {
//   let modal = document.querySelector(".modal.product-detail");

//   let modalHtml = `<div class="modal-header">
//       <img class="product-image" src="./assets/img/products/${product.ma_mon}.jpg" alt="">
//       </div>
//       <div class="modal-body">
//           <h2 class="product-title">${product.ten_mon}</h2>
//           <div class="product-control">
//               <div class="priceBox">
//                   <span class="current-price">${vnd(product.gia_hien_tai)}</span>
//               </div>
//               <div class="buttons_added">
//                   <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
//                   <input class="input-qty" max="100" min="1" name="" type="number" value="1">
//                   <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
//               </div>
//           </div>
//       </div>
//       <div class="notebox">
//               <p class="notebox-title">Ghi chú</p>
//               <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
//       </div>
//       <div class="modal-footer">
//           <div class="price-total">
//               <span class="thanhtien">Thành tiền</span>
//               <span class="price">${vnd(product.gia_hien_tai)}</span>
//           </div>
//           <div class="modal-footer-control" >
//               <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
//           </div>
//       </div>`;
//   document.querySelector("#product-detail-content").innerHTML = modalHtml;
//   modal.classList.add("open");
//   body.style.overflow = "hidden";
//   //Cap nhat gia tien khi tang so luong san pham
//   let tgbtn = document.querySelectorAll(".is-form");
//   let qty = document.querySelector(".product-control .input-qty");
//   let priceText = document.querySelector(".price");
//   tgbtn.forEach((element) => {
//     element.addEventListener("click", () => {
//       let price = infoProduct.gia_hien_tai * parseInt(qty.value);
//       priceText.innerHTML = vnd(price);
//     });
//   });
//   // Them san pham vao gio hang
//   let productbtn = document.querySelector(".button-detail");
//   productbtn.addEventListener("click", (e) => {
//     if (localStorage.getItem("currentuser")) {
//       addCart(infoProduct.ma_mon);
//     } else {
//       toast({
//         title: "Warning",
//         message: "Chưa đăng nhập tài khoản !",
//         type: "warning",
//         duration: 3000,
//       });
//     }
//   });
//   // Mua ngay san pham
// }

function animationCart() {
  const elements = document.querySelectorAll(".count-product-cart"); // Chọn tất cả các phần tử
  elements.forEach((element) => {
    element.style.animation = "slidein ease 1s"; // Thêm animation
    setTimeout(() => {
      element.style.animation = "none"; // Xóa animation sau 1s
    }, 1000);
  });
}
//test addtocart
function addCart(product) {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));
  if (!currentUser) {
    toast({
      title: "Lỗi đăng nhập",
      message: "Vui lòng đăng nhập để thực hiện chức năng này.",
      type: "error",
      duration: 3000,
    });
    return;
  }

  const cartKey = `cart_${currentUser.ma_tk}`;
  let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

  let soluong = 1;
  let ma_cn = 0;

  let productcart = {
    ma_mon: Number(product.ma_mon),
    ten_mon: product.ten_mon,
    gia_hien_tai: product.gia_hien_tai,
    soluong: soluong,
    ma_cn: ma_cn,
  };

  let found = false; // Biến để kiểm tra sản phẩm đã tồn tại hay chưa

  // Cập nhật giỏ hàng dựa trên ID sản phẩm
  cart.forEach((item) => {
    if (item.ma_mon === productcart.ma_mon) {
      item.soluong += productcart.soluong; // Cập nhật số lượng trực tiếp
      found = true;
    }
  });

  // Nếu sản phẩm chưa tồn tại, thêm mới vào giỏ hàng
  if (!found) {
    cart.push(productcart);
  }

  // Lưu lại giỏ hàng vào localStorage
  localStorage.setItem(cartKey, JSON.stringify(cart));

  console.log("Giỏ hàng cập nhật:", cart);
  updateAmount(currentUser.ma_tk);
  closeModal();
  console.log("Thêm thành công sản phẩm vào giỏ hàng:", productcart);
}

//Show gio hang
function showCart() {
  if (localStorage.getItem("currentuser") != null) {
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));

    let cart = JSON.parse(
      localStorage.getItem(`cart_${currentUser.ma_tk}`) || "[]"
    );
    if (cart.length != 0) {
      document.querySelector(".gio-hang-trong").style.display = "none";
      document.querySelector("button.thanh-toan").classList.remove("disabled");
      let productcarthtml = "";
      cart.forEach((item) => {
        let product = item;
        console.log("quanque", product);
        productcarthtml += `
          <li class="cart-item" data-id="${product.ma_mon}">
            <div class="cart-item-info">
              <p class="cart-item-title">
                  ${product.ten_mon}
              </p>
              <span class="cart-item-price price" data-price="${
                product.gia_hien_tai
              }">
              ${vnd(parseInt(product.gia_hien_tai))}
              </span>
            </div>
            <p class="product-note"><i class="fa-light fa-pencil"></i><span>Không có ghi chú</span></p>
            <div class="cart-item-control">
              <button class="cart-item-delete" onclick="deleteCartItem(${
                product.ma_mon
              },this)">Xóa</button>
              <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="100" min="1" name="" type="number" value="${
                  product.soluong
                }">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
              </div>
            </div>
        </li>`;
      });
      document.querySelector(".cart-list").innerHTML = productcarthtml;

      updateCartTotal();
      saveAmountCart();
    } else {
      document.querySelector(".gio-hang-trong").style.display = "flex";
    }
  }
  let modalCart = document.querySelector(".modal-cart");
  let containerCart = document.querySelector(".cart-container");
  let datban = document.querySelector(".dat-ban");
  modalCart.onclick = function () {
    closeCart();
  };
  datban.onclick = function () {
    closeCart();
  };
  containerCart.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// Delete cart item
function deleteCartItem(id, el) {
  let user = JSON.parse(localStorage.getItem("currentuser"));

  // Xóa phần tử DOM trên giao diện
  let cartParent = el.parentNode.parentNode;
  cartParent.remove();

  // Lấy giỏ hàng từ localStorage
  let cart = JSON.parse(localStorage.getItem(`cart_${user.ma_tk}`) || "[]");

  // Xóa sản phẩm bằng cách tạo mảng mới loại bỏ sản phẩm có ma_mon trùng với id
  cart = cart.filter((item) => item.ma_mon !== id);

  // Cập nhật lại localStorage
  localStorage.setItem(`cart_${user.ma_tk}`, JSON.stringify(cart));

  // Cập nhật lại giao diện
  if (cart.length === 0) {
    document.querySelector(".gio-hang-trong").style.display = "flex";
    document.querySelector("button.thanh-toan").classList.add("disabled");
  }
  updateCartTotal();
  updateAmount(user.ma_tk);
}

//update
function updateCartTotal() {
  document.querySelector(".text-price").innerText = vnd(getCartTotal());
}

// update
function getCartTotal() {
  let user = JSON.parse(localStorage.getItem("currentuser"));
  let cart = JSON.parse(localStorage.getItem(`cart_${user.ma_tk}`) || "[]");
  let tongtien = 0;
  cart.forEach((item) => {
    let product = item;
    tongtien += parseInt(product.soluong) * parseInt(product.gia_hien_tai);
  });
  return tongtien;
}

// Get Product
async function getProduct(item) {
  const response = await fetch(`http://localhost:3002/dishes/${item.ma_mon}`);
  const infoProductCart = await response.json();
  let product = {
    ...infoProductCart,
    ...item,
  };
  return product;
}
(function () {
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  if (currentUser) {
    updateAmount(currentUser.ma_tk);
    updateCartTotal();
  } else {
    console.log("Người dùng chưa đăng nhập!");
  }
})();

// Lay so luong hang

function getAmountCart(ma_tk) {
  let cart = JSON.parse(localStorage.getItem(`cart_${ma_tk}`) || "[]");
  let amount = 0;
  cart.forEach((element) => {
    amount += parseInt(element.soluong);
  });
  return amount;
}

//Update Amount Cart số hiện trên giỏ hàng
function updateAmount(ma_tk) {
  const cart = localStorage.getItem(`cart_${ma_tk}`);
  const elements = document.querySelectorAll(".count-product-cart"); // Chọn tất cả các phần tử

  if (!cart) { elements.innerText='0';
    return;}
  let amount = getAmountCart(ma_tk); // Lấy số lượng sản phẩm
  elements.forEach((element) => {
    element.innerText = amount; // Cập nhật nội dung của từng phần tử
  });
}

function saveAmountCart() {
  let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form"); // 2  button tăng giảm số lượng
  let listProduct = document.querySelectorAll(".cart-item"); // card item có data-id=ma_mon
  let user = JSON.parse(localStorage.getItem("currentuser"));
  let cart = JSON.parse(localStorage.getItem(`cart_${user.ma_tk}`) || "[]");
  cartAmountbtn.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      let id = listProduct[parseInt(index / 2)].getAttribute("data-id"); //lấy ra cái id của product
      let productId = cart.find((item) => {
        return item.ma_mon == id;
      });
      productId.soluong = parseInt(
        listProduct[parseInt(index / 2)].querySelector(".input-qty").value
      );
      localStorage.setItem(`cart_${user.ma_tk}`, JSON.stringify(cart));
      updateCartTotal();
      updateAmount(user.ma_tk);
    });
  });
}
// Open & Close Cart
function openCart() {
  const currentUser = localStorage.getItem("currentuser");
if(currentUser)
{
  updateAmount(currentUser.ma_tk)
  updateCartTotal()
}
  showCart();
  document.querySelector(".modal-cart").classList.add("open");
  body.style.overflow = "hidden";
}

function closeCart() {
  document.querySelector(".modal-cart").classList.remove("open");
  body.style.overflow = "auto";
  updateAmount();
}

// Open Search Advanced
// Không cần thực hiện gì khi DOM tải xong
document.addEventListener("DOMContentLoaded", () => {});


document.querySelector(".form-search-input").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("home-service").scrollIntoView();
});

// function closeSearchAdvanced() {
//   document.querySelector(".advanced-search").classList.toggle("open");
// }

//Open Search Mobile
function openSearchMb() {
  document.querySelector(".header-middle-left").style.display = "none";
  document.querySelector(".header-middle-center").style.display = "block";
  document.querySelector(".header-middle-right-item.close").style.display =
    "block";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "none", "important");
  }
}

//Close Search Mobile
function closeSearchMb() {
  document.querySelector(".header-middle-left").style.display = "block";
  document.querySelector(".header-middle-center").style.display = "none";
  document.querySelector(".header-middle-right-item.close").style.display =
    "none";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "block", "important");
  }
}

//Signup && Login Form

// Chuyen doi qua lai SignUp & Login
let signup = document.querySelector(".signup-link");
let login = document.querySelector(".login-link");
let container = document.querySelector(".signup-login .modal-container");
login.addEventListener("click", () => {
  container.classList.add("active");
});

signup.addEventListener("click", () => {
  container.classList.remove("active");
});

let signupbtn = document.getElementById("signup");
let loginbtn = document.getElementById("login");
let formsg = document.querySelector(".modal.signup-login");
signupbtn.addEventListener("click", () => {
  formsg.classList.add("open");
  container.classList.remove("active");
  body.style.overflow = "hidden";
  console.log("sign upupp");
});

loginbtn.addEventListener("click", () => {
  document.querySelector(".form-message-check-login").innerHTML = "";
  formsg.classList.add("open");
  container.classList.add("active");
  body.style.overflow = "hidden";
  console.log("log innnin");
});

// Dang nhap & Dang ky

// Chức năng đăng ký
let signupButton = document.getElementById("signup-button");
let addCardButton = document.getElementById("card-button");
let loginButton = document.getElementById("login-button");

signupButton.addEventListener("click", async (event) => {
  event.preventDefault();
  let fullNameUser = document.getElementById("fullname").value;
  let phoneUser = document.getElementById("phone").value;
  let username = document.getElementById("username").value;
  let passwordUser = document.getElementById("password").value;
  let passwordConfirmation = document.getElementById(
    "password_confirmation"
  ).value;
  let checkSignup = document.getElementById("checkbox-signup").checked;
  // Check validate
  if (fullNameUser.length == 0) {
    document.querySelector(".form-message-name").innerHTML =
      "Vui lòng nhập họ vâ tên";
    document.getElementById("fullname").focus();
  } else if (fullNameUser.length < 3) {
    document.getElementById("fullname").value = "";
    document.querySelector(".form-message-name").innerHTML =
      "Vui lòng nhập họ và tên lớn hơn 3 kí tự";
  } else {
    document.querySelector(".form-message-name").innerHTML = "";
  }
  if (phoneUser.length == 0) {
    document.querySelector(".form-message-phone").innerHTML =
      "Vui lòng nhập vào số điện thoại";
  } else if (phoneUser.length != 10) {
    document.querySelector(".form-message-phone").innerHTML =
      "Vui lòng nhập vào số điện thoại 10 số";
    document.getElementById("phone").value = "";
  } else {
    document.querySelector(".form-message-phone").innerHTML = "";
  }
  if (username.length == 0) {
    document.querySelector(".form-message-username").innerHTML =
      "Vui lòng nhập vào số điện thoại";
  } else if (username.length < 5) {
    document.querySelector(".form-message-username").innerHTML =
      "Vui lòng nhập username lớn hơn 4 kí tự";
    document.getElementById("username").value = "";
  } else {
    document.querySelector(".form-message-username").innerHTML = "";
  }
  if (passwordUser.length == 0) {
    document.querySelector(".form-message-password").innerHTML =
      "Vui lòng nhập mật khẩu";
  } else if (passwordUser.length < 5) {
    document.querySelector(".form-message-password").innerHTML =
      "Vui lòng nhập mật khẩu lớn hơn 4 kí tự";
    document.getElementById("password").value = "";
  } else {
    document.querySelector(".form-message-password").innerHTML = "";
  }
  if (passwordConfirmation.length == 0) {
    document.querySelector(".form-message-password-confi").innerHTML =
      "Vui lòng nhập lại mật khẩu";
  } else if (passwordConfirmation !== passwordUser) {
    document.querySelector(".form-message-password-confi").innerHTML =
      "Mật khẩu không khớp";
    document.getElementById("password_confirmation").value = "";
  } else {
    document.querySelector(".form-message-password-confi").innerHTML = "";
  }
  if (checkSignup != true) {
    document.querySelector(".form-message-checkbox").innerHTML =
      "Vui lòng check đăng ký";
  } else {
    document.querySelector(".form-message-checkbox").innerHTML = "";
  }

  if (
    !fullNameUser ||
    !phoneUser ||
    !username ||
    !passwordUser ||
    !passwordConfirmation ||
    !checkSignup
  )
    return;

  if (passwordConfirmation != passwordUser) {
    toast({
      title: "Thất bại",
      message: "Mật khẩu không khớp!",
      type: "error",
      duration: 3000,
    });
    return;
  }

  const user = {
    username: username,
    password: passwordUser,
    fullname: fullNameUser,
    phone: phoneUser,
    address: "",
    // status: 1,
  };

  try {
    const response = await fetch(`${BASE_URL}/access/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    toast({
      title: "Thành công",
      message: data.message,
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    toast({
      title: "Thất bại",
      message: error.message,
      type: "error",
      duration: 3000,
    });
  }
});

// Dang nhap
loginButton.addEventListener("click", async (event) => {
  event.preventDefault();
  let username = document.getElementById("username-login").value;
  let password = document.getElementById("password-login").value;
  // let accounts = JSON.parse(localStorage.getItem("accounts"));

  if (username.length == 0) {
    document.querySelector(".form-message.usernamelog").innerHTML =
      "Vui lòng nhập vào tên tài khoản";
  } else if (username.length < 5) {
    document.querySelector(".form-message.usernamelog").innerHTML =
      "Vui lòng nhập tên tài khoản lớn hơn 4 kí tự";
    document.getElementById("username-login").value = "";
  } else {
    document.querySelector(".form-message.usernamelog").innerHTML = "";
  }

  if (password.length == 0) {
    document.querySelector(".form-message-check-login").innerHTML =
      "Vui lòng nhập mật khẩu";
  } else if (password.length < 5) {
    document.querySelector(".form-message-check-login").innerHTML =
      "Vui lòng nhập mật khẩu lớn hơn 4 kí tự";
    document.getElementById("passwordlogin").value = "";
  } else {
    document.querySelector(".form-message-check-login").innerHTML = "";
  }

  if (!username || !password) return;

  try {
    const response = await fetch(`${BASE_URL}/access/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    console.log(data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    if (data.profile)
      localStorage.setItem("currentuser", JSON.stringify(data.profile));

    closeModal();
    kiemtradangnhap();
    checkAdmin();
    // let a=localStorage.getItem("currentuser");
    // updateAmount(a.ma_tk);
    

    toast({
      title: "Success",
      message: "Đăng nhập thành công",
      type: "success",
      duration: 3000,
    });
    setTimeout(() => {
      window.location.reload(); // Tải lại trang sau khi thông báo hiện xong
    }, 3000); // 3000ms = 3 giây
  
  } catch (error) {
    toast({
      title: "Error",
      message: error,
      type: "error",
      duration: 3000,
    });
    console.log(error);
  }
});

// Kiểm tra xem có tài khoản đăng nhập không ?
function kiemtradangnhap() {
  const currentUser = localStorage.getItem("currentuser");
  console.log(currentUser);
  if (!currentUser) return;
  console.log(currentUser);
  // window.onload=updateAmount(currentUser.ma_tk);
  // updateCartTotal();

  const user = JSON.parse(currentUser);
  document.querySelector(".auth-container").innerHTML = `
    <span class="text-dndk">Tài khoản</span>
    <span class="text-tk">${user.ho_ten} <i class="fa-sharp fa-solid fa-caret-down"></span>
  `;
  document.querySelector(".header-middle-right-menu").innerHTML = `
    <li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
    <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
    <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>
  `;
  document.querySelector("#logout").addEventListener("click", logOut);
}

function logOut() {
  // let accounts = JSON.parse(localStorage.getItem("accounts"));
  // user = JSON.parse(localStorage.getItem("currentuser"));
  // let vitri = accounts.findIndex((item) => item.phone == user.phone);
  // accounts[vitri].cart.length = 0;
  // for (let i = 0; i < user.cart.length; i++) {
  //   accounts[vitri].cart[i] = user.cart[i];
  // }
  // localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("currentuser");
  window.location = "index.html";
}

function checkAdmin() {
  let role = localStorage.getItem("role");
  if (!role) {
    return;
  }

  if (role == "nv") {
    window.location.href = "./nhanvien.html";
    return; // Dừng thực thi nếu đã chuyển hướng
  }

  let node = document.createElement("li");
  if (role == "admin") {
    window.location.href = "./admin.html";
    return;
  }
  document.querySelector(".header-middle-right-menu").prepend(node);
}

window.onload = kiemtradangnhap();

window.onload = checkAdmin();

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("trangchu").classList.add("hide");
  document.getElementById("order-history").classList.remove("open");
  document.getElementById("account-user").classList.add("open");
  userInfo();
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng
function orderHistory() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("account-user").classList.remove("open");
  document.getElementById("trangchu").classList.add("hide");
  document.getElementById("order-history").classList.add("open");
  renderOrderProduct();
}

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function userInfo() {
  let user = JSON.parse(localStorage.getItem("currentuser"));
  document.getElementById("infoname").value = user.ho_ten;
  document.getElementById("infophone").value = user.sdt;
  // document.getElementById("infoemail").value = user.email;
  document.getElementById("infoaddress").value = user.dia_chi;
  if (user.email == undefined) {
    infoemail.value = "";
  }
  if (user.dia_chi == undefined) {
    infoaddress.value = "";
  }
}

// Thay doi thong tin
function changeInformation() {
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let user = JSON.parse(localStorage.getItem("currentuser"));
  let infoname = document.getElementById("infoname");
  let infoemail = document.getElementById("infoemail");
  let infoaddress = document.getElementById("infoaddress");

  user.ho_ten = infoname.value;
  if (infoemail.value.length > 0) {
    if (!emailIsValid(infoemail.value)) {
      document.querySelector(".inforemail-error").innerHTML =
        "Vui lòng nhập lại email!";
      infoemail.value = "";
    } else {
      user.email = infoemail.value;
    }
  }

  if (infoaddress.value.length > 0) {
    user.dia_chi = infoaddress.value;
  }

  let vitri = accounts.findIndex((item) => item.phone == user.sdt);

  accounts[vitri].fullname = user.fullname;
  accounts[vitri].email = user.email;
  accounts[vitri].address = user.address;
  localStorage.setItem("currentuser", JSON.stringify(user));
  localStorage.setItem("accounts", JSON.stringify(accounts));
  kiemtradangnhap();
  toast({
    title: "Success",
    message: "Cập nhật thông tin thành công !",
    type: "success",
    duration: 3000,
  });
}

// Đổi mật khẩu
function changePassword() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let passwordCur = document.getElementById("password-cur-info");
  let passwordAfter = document.getElementById("password-after-info");
  let passwordConfirm = document.getElementById("password-comfirm-info");
  let check = true;
  if (passwordCur.value.length == 0) {
    document.querySelector(".password-cur-info-error").innerHTML =
      "Vui lòng nhập mật khẩu hiện tại";
    check = false;
  } else {
    document.querySelector(".password-cur-info-error").innerHTML = "";
  }

  if (passwordAfter.value.length == 0) {
    document.querySelector(".password-after-info-error").innerHTML =
      "Vui lòn nhập mật khẩu mới";
    check = false;
  } else {
    document.querySelector(".password-after-info-error").innerHTML = "";
  }

  if (passwordConfirm.value.length == 0) {
    document.querySelector(".password-after-comfirm-error").innerHTML =
      "Vui lòng nhập mật khẩu xác nhận";
    check = false;
  } else {
    document.querySelector(".password-after-comfirm-error").innerHTML = "";
  }

  if (check == true) {
    if (passwordCur.value.length > 0) {
      if (passwordCur.value == currentUser.password) {
        document.querySelector(".password-cur-info-error").innerHTML = "";
        if (passwordAfter.value.length > 0) {
          if (passwordAfter.value.length < 6) {
            document.querySelector(".password-after-info-error").innerHTML =
              "Vui lòng nhập mật khẩu mới có số  kí tự lớn hơn bằng 6";
          } else {
            document.querySelector(".password-after-info-error").innerHTML = "";
            if (passwordConfirm.value.length > 0) {
              if (passwordConfirm.value == passwordAfter.value) {
                document.querySelector(
                  ".password-after-comfirm-error"
                ).innerHTML = "";
                currentUser.password = passwordAfter.value;
                localStorage.setItem(
                  "currentuser",
                  JSON.stringify(currentUser)
                );
                let userChange = JSON.parse(
                  localStorage.getItem("currentuser")
                );
                let accounts = JSON.parse(localStorage.getItem("accounts"));
                let accountChange = accounts.find((acc) => {
                  return (acc.phone = userChange.phone);
                });
                accountChange.password = userChange.password;
                localStorage.setItem("accounts", JSON.stringify(accounts));
                toast({
                  title: "Success",
                  message: "Đổi mật khẩu thành công !",
                  type: "success",
                  duration: 3000,
                });
              } else {
                document.querySelector(
                  ".password-after-comfirm-error"
                ).innerHTML = "Mật khẩu bạn nhập không trùng khớp";
              }
            } else {
              document.querySelector(
                ".password-after-comfirm-error"
              ).innerHTML = "Vui lòng xác nhận mật khẩu";
            }
          }
        } else {
          document.querySelector(".password-after-info-error").innerHTML =
            "Vui lòng nhập mật khẩu mới";
        }
      } else {
        document.querySelector(".password-cur-info-error").innerHTML =
          "Bạn đã nhập sai mật khẩu hiện tại";
      }
    }
  }
}

function getProductInfo(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  return products.find((item) => {
    return item.id == id;
  });
}

// Quan ly don hang
function renderOrderProduct() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let order = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let orderHtml = "";
  let arrDonHang = [];
  for (let i = 0; i < order.length; i++) {
    if (order[i].khachhang === currentUser.phone) {
      arrDonHang.push(order[i]);
    }
  }
  if (arrDonHang.length == 0) {
    orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
  } else {
    arrDonHang.forEach((item) => {
      let productHtml = `<div class="order-history-group">`;
      let chiTietDon = getOrderDetails(item.id);
      chiTietDon.forEach((sp) => {
        let infosp = getProductInfo(sp.id);
        productHtml += `<div class="order-history">
                      <div class="order-history-left">
                          <img src="${infosp.img}" alt="">
                          <div class="order-history-info">
                              <h4>${infosp.title}!</h4>
                              <p class="order-history-note"><i class="fa-light fa-pen"></i> ${
                                sp.note
                              }</p>
                              <p class="order-history-quantity">x${
                                sp.soluong
                              }</p>
                          </div>
                      </div>
                      <div class="order-history-right">
                          <div class="order-history-price">
                              <span class="order-history-current-price">${vnd(
                                sp.price
                              )}</span>
                          </div>                         
                      </div>
                  </div>`;
      });
      let textCompl = item.trangthai == 1 ? "Đã xử lý" : "Đang xử lý";
      let classCompl = item.trangthai == 1 ? "complete" : "no-complete";
      productHtml += `<div class="order-history-control">
                  <div class="order-history-status">
                      <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                      <button id="order-history-detail" onclick="detailOrder('${
                        item.id
                      }')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                  </div>
                  <div class="order-history-total">
                      <span class="order-history-total-desc">Tổng tiền: </span>
                      <span class="order-history-toltal-price">${vnd(
                        item.tongtien
                      )}</span>
                  </div>
              </div>`;
      productHtml += `</div>`;
      orderHtml += productHtml;
    });
  }
  document.querySelector(".order-history-section").innerHTML = orderHtml;
}

// Get Order Details
function getOrderDetails(madon) {
  let orderDetails = localStorage.getItem("orderDetails")
    ? JSON.parse(localStorage.getItem("orderDetails"))
    : [];
  let ctDon = [];
  orderDetails.forEach((item) => {
    if (item.madon == madon) {
      ctDon.push(item);
    }
  });
  return ctDon;
}

// Format Date
function formatDate(date) {
  let fm = new Date(date);
  let yyyy = fm.getFullYear();
  let mm = fm.getMonth() + 1;
  let dd = fm.getDate();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return dd + "/" + mm + "/" + yyyy;
}

// Xem chi tiet don hang
function detailOrder(id) {
  let order = JSON.parse(localStorage.getItem("order"));
  let detail = order.find((item) => {
    return item.id == id;
  });
  document.querySelector(".modal.detail-order").classList.add("open");
  let detailOrderHtml = `<ul class="detail-order-group">
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
              <span class="detail-order-item-right">${formatDate(
                detail.thoigiandat
              )}</span>
          </li>
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
              <span class="detail-order-item-right">${
                detail.hinhthucgiao
              }</span>
          </li>
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
              <span class="detail-order-item-right">${
                (detail.thoigiangiao == "" ? "" : detail.thoigiangiao + " - ") +
                formatDate(detail.ngaygiaohang)
              }</span>
          </li>
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
              <span class="detail-order-item-right">${detail.diachinhan}</span>
          </li>
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
              <span class="detail-order-item-right">${detail.tenguoinhan}</span>
          </li>
          <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
              <span class="detail-order-item-right">${detail.sdtnhan}</span>
          </li>
      </ul>`;
  document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

// Create id order
function createId(arr) {
  let id = arr.length + 1;
  let check = arr.find((item) => item.id == "DH" + id);
  while (check != null) {
    id++;
    check = arr.find((item) => item.id == "DH" + id);
  }
  return "DH" + id;
}

// Back to top
window.onscroll = () => {
  let backtopTop = document.querySelector(".back-to-top");
  if (document.documentElement.scrollTop > 100) {
    backtopTop.classList.add("active");
  } else {
    backtopTop.classList.remove("active");
  }
};

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

// window.addEventListener("scroll", () => {
//   if (lastScrollY < window.scrollY) {
//     headerNav.classList.add("hide");
//   } else {
//     headerNav.classList.remove("hide");
//   }
//   lastScrollY = window.scrollY;
// });

// Page
// function renderProducts(showProduct) {
//   let productHtml = "";
//   if (showProduct.length == 0) {
//     document.getElementById("home-title").style.display = "none";
//     productHtml = `<div class="no-result"><div class="no-result-h">Tìm kiếm không có kết quả</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
//   } else {
//     document.getElementById("home-title").style.display = "block";
//     showProduct.forEach((product) => {
//       productHtml += `<div class="col-product">
//               <article class="card-product" >
//                   <div class="card-header">
//                       <a href="#" class="card-image-link" onclick="detailProduct(${
//                         product.id
//                       })">
//                       <img class="card-image" src="${product.img}" alt="${
//         product.title
//       }">
//                       </a>
//                   </div>
//                   <div class="food-info">
//                       <div class="card-content">
//                           <div class="card-title">
//                               <a href="#" class="card-title-link" onclick="detailProduct(${
//                                 product.id
//                               })">${product.title}</a>
//                           </div>
//                       </div>
//                       <div class="card-footer">
//                           <div class="product-price">
//                               <span class="current-price">${vnd(
//                                 product.price
//                               )}</span>
//                           </div>
//                       <div class="product-buy">
//                           <button onclick="detailProduct(${
//                             product.id
//                           })" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
//                       </div>
//                   </div>
//                   </div>
//               </article>
//           </div>`;
//     });
//   }
//   document.getElementById("home-products").innerHTML = productHtml;
// }

// Find Product
// var productAll = JSON.parse(localStorage.getItem("products")).filter(
//   (item) => item.status == 1
// );
// function searchProducts(mode) {
//   let valeSearchInput = document.querySelector(".form-search-input").value;
//   let valueCategory = document.getElementById(
//     "advanced-search-category-select"
//   ).value;
//   let minPrice = document.getElementById("min-price").value;
//   let maxPrice = document.getElementById("max-price").value;
//   if (
//     parseInt(minPrice) > parseInt(maxPrice) &&
//     minPrice != "" &&
//     maxPrice != ""
//   ) {
//     alert("Giá đã nhập sai !");
//   }

//   let result =
//     valueCategory == "Tất cả"
//       ? productAll
//       : productAll.filter((item) => {
//           return item.category == valueCategory;
//         });

//   result =
//     valeSearchInput == ""
//       ? result
//       : result.filter((item) => {
//           return item.title
//             .toString()
//             .toUpperCase()
//             .includes(valeSearchInput.toString().toUpperCase());
//         });

//   if (minPrice == "" && maxPrice != "") {
//     result = result.filter((item) => item.price <= maxPrice);
//   } else if (minPrice != "" && maxPrice == "") {
//     result = result.filter((item) => item.price >= minPrice);
//   } else if (minPrice != "" && maxPrice != "") {
//     result = result.filter(
//       (item) => item.price <= maxPrice && item.price >= minPrice
//     );
//   }

//   document.getElementById("home-service").scrollIntoView();
//   switch (mode) {
//     case 0:
//       result = JSON.parse(localStorage.getItem("products"));
//       document.querySelector(".form-search-input").value = "";
//       document.getElementById("advanced-search-category-select").value =
//         "Tất cả";
//       document.getElementById("min-price").value = "";
//       document.getElementById("max-price").value = "";
//       break;
//     case 1:
//       result.sort((a, b) => a.price - b.price);
//       break;
//     case 2:
//       result.sort((a, b) => b.price - a.price);
//       break;
//   }
//   showHomeProduct(result);
// }

// // Phân trang
// let perPage = 12;
// let currentPage = 1;
// let totalPage = 0;
// let perProducts = [];

// function displayList(productAll, perPage, currentPage) {
//   let start = (currentPage - 1) * perPage;
//   let end = (currentPage - 1) * perPage + perPage;
//   let productShow = productAll.slice(start, end);
//   renderProducts(productShow);
// }

// function showHomeProduct(products) {
//   let productAll = products.filter((item) => item.ma_mon == 1);
//   displayList(productAll, perPage, currentPage);
//   setupPagination(productAll, perPage, currentPage);
// }

// window.onload = showHomeProduct(JSON.parse(localStorage.getItem(`cart_${currentUser.ma_tk}`)));

function setupPagination(productAll, perPage) {
  document.querySelector(".page-nav-list").innerHTML = "";
  let page_count = Math.ceil(productAll.length / perPage);
  for (let i = 1; i <= page_count; i++) {
    let li = paginationChange(i, productAll, currentPage);
    document.querySelector(".page-nav-list").appendChild(li);
  }
}

function paginationChange(page, productAll, currentPage) {
  let node = document.createElement(`li`);
  node.classList.add("page-nav-item");
  node.innerHTML = `<a href="javascript:;">${page}</a>`;
  if (currentPage == page) node.classList.add("active");
  node.addEventListener("click", function () {
    currentPage = page;
    displayList(productAll, perPage, currentPage);
    let t = document.querySelectorAll(".page-nav-item.active");
    for (let i = 0; i < t.length; i++) {
      t[i].classList.remove("active");
    }
    node.classList.add("active");
    document.getElementById("home-service").scrollIntoView();
  });
  return node;
}

// Hiển thị chuyên mục
function showCategory(category) {
  document.getElementById("trangchu").classList.remove("hide");
  document.getElementById("account-user").classList.remove("open");
  document.getElementById("order-history").classList.remove("open");
  let productSearch = productAll.filter((value) => {
    return value.category
      .toString()
      .toUpperCase()
      .includes(category.toUpperCase());
  });
  let currentPageSeach = 1;
  displayList(productSearch, perPage, currentPageSeach);
  setupPagination(productSearch, perPage, currentPageSeach);
  document.getElementById("home-title").scrollIntoView();
}
////////////////FILTER////////////
// Hàm gọi API để lấy danh sách khu vực
async function fetchAreas() {
  try {
    const response = await fetch("http://localhost:3002/branches/area");
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.statusText}`);
    }
    const areas = await response.json();

    const areaSelect = document.getElementById("advanced-search-area-select");
    areas.forEach((area) => {
      const option = document.createElement("option");
      option.value = area.ten_kv; // Giá trị để truyền URL
      option.textContent = area.ten_kv; // Tên hiển thị
      areaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Lỗi khi gọi API khu vực:", error);
  }
}

// Hàm gọi API để lấy danh sách chi nhánh dựa trên khu vực được chọn
async function fetchBranches() {
  try {
    const areaSelect = document.getElementById("advanced-search-area-select");
    const selectedArea = areaSelect.value;

    if (!selectedArea) {
      console.log("Vui lòng chọn khu vực trước.");
      return;
    }

    const response = await fetch(
      `http://localhost:3002/branches?area=${encodeURIComponent(selectedArea)}`
    );
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.statusText}`);
    }

    const branches = await response.json();

    const branchSelect = document.getElementById(
      "advanced-search-branch-select"
    );
    branchSelect.innerHTML = '<option value="">Tất cả</option>'; // Reset options

    branches.forEach((branch) => {
      const option = document.createElement("option");
      option.value = branch.ma_cn; // Gắn mã chi nhánh làm giá trị
      option.textContent = branch.ten_cn; // Hiển thị tên chi nhánh
      branchSelect.appendChild(option);
    });

    // Kiểm tra sau khi thêm
  } catch (error) {
    console.error("Lỗi khi gọi API chi nhánh:", error);
  }
}

// Tự động gọi API khu vực khi tải trang
document.addEventListener("DOMContentLoaded", fetchAreas);
const usercurr = JSON.parse(localStorage.getItem("currentuser"));
// if (usercurr) {
//   window.onload = function () {
//     updateAmount(usercurr.ma_tk);
//   };
// }

//
async function fetchCategories() {
  try {
    // Gọi API
    const response = await fetch("http://localhost:3002/dishes/types");

    // Kiểm tra phản hồi API
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.statusText}`);
    }

    // Chuyển dữ liệu JSON sang object
    const categories = await response.json();

    // Lấy element select
    const categorySelect = document.getElementById("advanced-search-category");
    categorySelect.innerHTML = '<option value="">Tất cả</option>'; // Reset options

    // Thêm các option vào dropdown
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.ma_loai; // Gắn mã loại làm value
      option.textContent = category.ten_loai; // Hiển thị tên loại
      categorySelect.appendChild(option);
    });

    // Kiểm tra sau khi thêm
  } catch (error) {
    console.error("Lỗi khi gọi API loại món ăn:", error);
  }
}



// Tự động chạy khi trang được tải
document.addEventListener("DOMContentLoaded", fetchCategories);
// Hàm gọi API để lọc món ăn
async function fetchDishes() {
  if(usercurr){
  localStorage.setItem(`branch_${usercurr.ma_tk}`, 1);
  }
  try {
    // Lấy giá trị từ dropdown chi nhánh và loại
    const branch = document.getElementById(
      "advanced-search-branch-select"
    ).value;
    console.log("branch", branch);
    branch_checkout = branch;

    const type = document.getElementById("advanced-search-category").value;
    console.log("type", type);
    if (!branch || branch.trim() === "") {
      toast({
        title: "Thiếu thông tin",
        message: "Vui lòng chọn chi nhánh trước khi tìm kiếm.",
        type: "warning",
        duration: 3000,
      });
      return; // Dừng hàm ở đây nếu type không hợp lệ
    }

   if(usercurr){ branch_before=localStorage.getItem(`branch_${usercurr.ma_tk}`);//bỏ if

// xóa giỏ hàng cũ, update branch
    if(branch_before!=branch){
      localStorage.setItem(`cart_${currentuser.ma_tk}`, JSON.stringify([]));
      localStorage.setItem(`branch_${usercurr.ma_tk}`, branch);
      updateCartTotal();
      updateAmount(usercurr.ma_tk);

    }
  }
    // Tạo URL API với các tham số
    const apiUrl = `http://localhost:3002/dishes?${
      branch ? `branch=${branch}&` : ""
    }${type ? `type=${type}` : ""}`;

    // Gọi API
    const response = await fetch(apiUrl);

    // Kiểm tra phản hồi
    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.statusText}`);
    }

    // Chuyển dữ liệu thành object
    const dishes = await response.json();

    // TRUYỀN MÓN ĂN VÀO ĐÂY
    const dishList = document.getElementById("home-title-search");
    dishList.innerHTML = ""; // Xóa danh sách cũ
    let productHtml = "";

    // Duyệt qua danh sách món ăn và tạo HTML
    if (dishes.length === 0) {
      document.getElementById("home-title").style.display = "block";
    } else {
      console.log(
        "chi nhánh mới:",
        branch,
        "Chi nhánh hiện tại:",
        dishes[0].ma_cn
      );

      dishes.forEach((product) => {
        product.ma_cn = branch;
        productHtml += `<div class="col-product">
              <article class="card-product">
                  <div class="card-header">
                      <div href="#" class="card-image-link">
                          <img class="card-image" src="./assets/img/products/${
                            product.ma_mon
                          }.jpg" alt="${product.title}">
                      </div>
                  </div>
                  <div class="food-info">
                      <div class="card-content">
                          <div class="card-title">
                              <div href="#" class="card-title-link">${
                                product.ten_mon
                              }</div>
                          </div>
                      </div>
                      <div class="card-footer">
                          <div class="product-price">
                              <span class="current-price">${vnd(
                                product.gia_hien_tai
                              )}</span>
                          </div>
                          <div class="product-buy">
                              <button class="card-button order-item" 
                                      data-product-id="${product.ma_mon}">
                                  <i class="fa-regular fa-cart-shopping-fast"></i> Đặt món
                              </button>
                          </div>
                      </div>
                  </div>
              </article>
          </div>`;
      });

      document.getElementById("home-products").innerHTML = productHtml;

      // GẮN SỰ KIỆN CLICK SAU KHI HTML ĐƯỢC TẠO
      document.querySelectorAll(".order-item").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productId = parseInt(
            event.target.closest("button").dataset.productId
          );

          // Tìm sản phẩm dựa trên ID
          const product = dishes.find((item) => item.ma_mon === productId);

          if (product) {
            console.log(product.ten_mon);
            addCart(product);
          } else {
            console.error("Không tìm thấy sản phẩm!");
          }
        });
      });
    }
  } catch (error) {
    console.error("Lỗi khi gọi API món ăn:", error);
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const filterButton = document.getElementById('submut-filter');
  
  // Gắn sự kiện click vào nút
  filterButton.addEventListener('click', fetchDishes);
});
