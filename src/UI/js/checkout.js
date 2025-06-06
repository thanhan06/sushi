const PHIVANCHUYEN = 0;
let priceFinal = document.getElementById("checkout-cart-price-final");
let currentuser = JSON.parse(localStorage.getItem("currentuser"));
let ngayDuocNhan = new Date();
ngayDuocNhan = ngayDuocNhan.toISOString().split("T")[0]; // Định dạng mặc định YYYY-MM-DD

console.log("Ngày nhận mặc định:", ngayDuocNhan);
const selectTime = document.querySelector("#choise-time");

// Đặt giá trị mặc định là 08:00
selectTime.value = "08:00";

// Biến để lưu thời gian được chọn, khởi tạo với giá trị mặc định
let thoigiangiao = selectTime.value;
// Trang thanh toán
console.log("Giờ mặc định:", thoigiangiao);
////////HÀM LẤY NGÀY GIỜ:
let ngayGioGiao = `${ngayDuocNhan}T${thoigiangiao}:00`;
console.log("Ngày giờ giao mặc định:", ngayGioGiao);
// function thanhtoanpage(option) {
//   let cart = JSON.parse(
//     localStorage.getItem(`cart_${currentuser.ma_tk}`) || "[]"
//   );

//   // Xử lý ngày nhận hàng
//   let today = new Date();
//   let ngaymai = new Date();
//   let ngaykia = new Date();
//   ngaymai.setDate(today.getDate() + 1);
//   ngaykia.setDate(today.getDate() + 2);

//   let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today.toISOString()}">
//         <span class="text">Hôm nay</span>
//         <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
//       </a>
//       <a href="javascript:;" class="pick-date" data-date="${ngaymai.toISOString()}">
//           <span class="text">Ngày mai</span>
//           <span class="date">${ngaymai.getDate()}/${
//     ngaymai.getMonth() + 1
//   }</span>
//       </a>
//       <a href="javascript:;" class="pick-date" data-date="${ngaykia.toISOString()}">
//           <span class="text">Ngày kia</span>
//           <span class="date">${ngaykia.getDate()}/${
//     ngaykia.getMonth() + 1
//   }</span>
//       </a>`;

//   document.querySelector(".date-order").innerHTML = dateorderhtml;

//   let pickdate = document.getElementsByClassName("pick-date");
//   for (let i = 0; i < pickdate.length; i++) {
//     pickdate[i].onclick = function () {
//       // Xóa class active khỏi phần tử hiện tại
//       document.querySelector(".pick-date.active").classList.remove("active");
//       this.classList.add("active");

//       // Lấy ngày từ thuộc tính data-date
//       ngayDuocNhan = new Date(this.getAttribute("data-date")); // Cập nhật ngày mới
//       ngayDuocNhan = ngayDuocNhan.toISOString().split("T")[0]; // Định dạng chuẩn YYYY-MM-DD
//       ngayGioGiao = `${ngayDuocNhan}T${thoigiangiao}:00`;
//       console.log("thời gian khi cập nhật ngày:", ngayGioGiao);
//     };
//   }

//   let totalBillOrder = document.querySelector(".total-bill-order");
//   let totalBillOrderHtml;
//   // Xu ly don hang
//   switch (option) {
//     case 1: // Truong hop thanh toan san pham trong gio
//       // Hien thi don hang
//       showProductCart();
//       // Tinh tien
//       totalBillOrderHtml = `<div class="priceFlx">
//             <div class="text">
// Số lượng:                <span class="count">${getAmountCart(
//         currentuser.ma_tk
//       )} </span>
//             </div>
//             <div class="price-detail">
//                 <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
//             </div>
//         </div>
//         <div class="priceFlx chk-ship">
           
//         </div>`;
//       // Tong tien
//       priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
//       break;
//     case 2: // Truong hop mua ngay
//       break;
//   }

//   // Tinh tien
//   totalBillOrder.innerHTML = totalBillOrderHtml;

//   // Su kien khu nhan nut dat hang
//   document.querySelector(".complete-checkout-btn").onclick = () => {
//     xulyDathang();
//   };
// }
function thanhtoanpage(option) {
  let cart = [];
  try {
    const cartJSON = localStorage.getItem(`cart_${currentuser.ma_tk}`) || "[]";
    cart = JSON.parse(cartJSON);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu giỏ hàng từ localStorage:", error);
    
    // Khởi tạo giỏ hàng rỗng để tránh lỗi tiếp theo
    cart = [];
  }

  // Xử lý ngày nhận hàng
  let today = new Date();
  let ngaymai = new Date();
  let ngaykia = new Date();
  ngaymai.setDate(today.getDate() + 1);
  ngaykia.setDate(today.getDate() + 2);

  let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today.toISOString()}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
      </a>
      <a href="javascript:;" class="pick-date" data-date="${ngaymai.toISOString()}">
          <span class="text">Ngày mai</span>
          <span class="date">${ngaymai.getDate()}/${
    ngaymai.getMonth() + 1
  }</span>
      </a>
      <a href="javascript:;" class="pick-date" data-date="${ngaykia.toISOString()}">
          <span class="text">Ngày kia</span>
          <span class="date">${ngaykia.getDate()}/${
    ngaykia.getMonth() + 1
  }</span>
      </a>`;

  document.querySelector(".date-order").innerHTML = dateorderhtml;

  let pickdate = document.getElementsByClassName("pick-date");
  for (let i = 0; i < pickdate.length; i++) {
    pickdate[i].onclick = function () {
      // Xóa class active khỏi phần tử hiện tại
      document.querySelector(".pick-date.active").classList.remove("active");
      this.classList.add("active");

      // Lấy ngày từ thuộc tính data-date
      ngayDuocNhan = new Date(this.getAttribute("data-date")); // Cập nhật ngày mới
      ngayDuocNhan = ngayDuocNhan.toISOString().split("T")[0]; // Định dạng chuẩn YYYY-MM-DD
      ngayGioGiao = `${ngayDuocNhan}T${thoigiangiao}:00`;
      console.log("thời gian khi cập nhật ngày:", ngayGioGiao);
    };
  }

  let totalBillOrder = document.querySelector(".total-bill-order");
  let totalBillOrderHtml;
  // Xu ly don hang
  switch (option) {
    case 1: // Truong hop thanh toan san pham trong gio
      // Hien thi don hang
      showProductCart();
      // Tinh tien
      totalBillOrderHtml = `<div class="priceFlx">
            <div class="text">
Số lượng:                <span class="count">${getAmountCart(
        currentuser.ma_tk
      )} </span>
            </div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
           
        </div>`;
      // Tong tien
      priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
      break;
    case 2: // Truong hop mua ngay
      break;
  }

  // Tinh tien
  totalBillOrder.innerHTML = totalBillOrderHtml;

  // Su kien khi nhan nut dat hang
  document.querySelector(".complete-checkout-btn").onclick = () => {
    xulyDathang();
  };
}

/////////////BẮT SỰ KIỆN CHỌN LOAI_DAT

// Xu ly hinh thuc giao hang
let giaotannoi = document.querySelector("#giaotannoi");
let tudenlay = document.querySelector("#tudenlay");
let type_checkout = "Ship";

tudenlay.addEventListener("click", () => {
  giaotannoi.classList.remove("active");
  tudenlay.classList.add("active");
  type_checkout = "Đặt bàn";
  console.log("type_checkout:", type_checkout); // In ra ngay sau khi cập nhật
});

giaotannoi.addEventListener("click", () => {
  tudenlay.classList.remove("active");
  giaotannoi.classList.add("active");
  type_checkout = "Ship";
  console.log("type_checkout:", type_checkout); // In ra ngay sau khi cập nhật
});
// lấy giờ

// Thêm sự kiện change để theo dõi khi chọn thời gian mới
selectTime.addEventListener("change", (event) => {
  thoigiangiao = event.target.value; // Cập nhật giá trị mới
  ngayGioGiao = `${ngayDuocNhan}T${thoigiangiao}:00`;
  console.log("thời gian khi cập nhật giờ:", ngayGioGiao);
});

// Log để kiểm tra giá trị ban đầu

// Sự kiện khi thay đổi giờ
selectTime.addEventListener("change", (event) => {
  thoigiangiao = event.target.value; // Cập nhật giờ mới
  ngayGioGiao = `${ngayDuocNhan}T${thoigiangiao}:00`; // Cập nhật chuỗi ngày giờ
});
// Hien thi hang trong gio
function showProductCart() {
  let currentuser = JSON.parse(localStorage.getItem("currentuser"));
  let cart = JSON.parse(
    localStorage.getItem(`cart_${currentuser.ma_tk}`) || "[]"
  );
  let listOrder = document.getElementById("list-order-checkout");
  let listOrderHtml = "";

  cart.forEach((item) => {
    let product = item;
    listOrderHtml += `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.ten_mon}</div>
        </div>
    </div>`;
  });
  listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector(".thanh-toan");
let checkoutpage = document.querySelector(".checkout-page");
nutthanhtoan.addEventListener("click", () => {
  checkoutpage.classList.add("active");
  thanhtoanpage(1);
  closeCart();
  body.style.overflow = "hidden";
});

// Close Page Checkout
function closecheckout() {
  checkoutpage.classList.remove("active");
  body.style.overflow = "auto";
}



// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
  const soDienThoai = document.getElementById("sdtnhan").value.trim();
  let diaChiNhan = document.getElementById("diachinhan").value.trim();
  const maChiNhanh = localStorage.getItem(`branch_${currentuser.ma_tk}`); // Mã chi nhánh cố định hoặc từ form
  const loaiDat = type_checkout;
  let danhSachMonAnJSON = localStorage.getItem(`cart_${currentuser.ma_tk}`);
  let danhSachMonAn = JSON.parse(danhSachMonAnJSON);
  let dsMonAnAPI = danhSachMonAn.map((item) => ({
    ma_mon: item.ma_mon,
    so_luong: item.soluong,
  }));

  // Kiểm tra nếu loại đặt là "Ship", cần phải có địa chỉ nhận
  if (loaiDat === "Ship" && diaChiNhan === "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập địa chỉ giao hàng!",
      type: "warning",
      duration: 4000,
    });
    return; // Dừng thực hiện hàm nếu thiếu địa chỉ
  }

  // Kiểm tra thông tin điện thoại
  if (soDienThoai === "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập số điện thoại!",
      type: "warning",
      duration: 4000,
    });
    return; // Dừng nếu không có số điện thoại
  }

  // Nếu loại đặt không phải là "Ship", địa chỉ sẽ là null
  if (loaiDat !== "Ship") diaChiNhan = null;

  const orderData = {
    sdt: soDienThoai,
    ma_chi_nhanh: maChiNhanh,
    loai_dat: loaiDat,
    dia_chi: diaChiNhan,  // Địa chỉ có thể là null nếu không phải "Ship"
    ngay_giao: ngayGioGiao,
    ds_mon_an: dsMonAnAPI,
  };

  console.log("Dữ liệu gửi API:", orderData);
  let accesstoken = localStorage.getItem("token");

  // Kiểm tra token
  if (!accesstoken) {
    toast({
      title: "Lỗi",
      message: "Bạn chưa đăng nhập hoặc token không hợp lệ.",
      type: "error",
      duration: 4000,
    });
    return;
  }

  // Gửi dữ liệu qua API
  try {
    const response = await fetch("http://localhost:3002/ordersOnline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accesstoken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);

      toast({
        title: "Lỗi",
        message: `Đặt hàng thất bại: ${errorText || "Lỗi không xác định"}`,
        type: "error",
        duration: 4000,
      });

      setTimeout(() => {
        window.location = "/";
      }, 4000);
      return;
    }

    const data = await response.json();
    console.log("Đặt hàng thành công:", data);

    // Xóa giỏ hàng sau khi đặt thành công
    localStorage.setItem(`cart_${currentuser.ma_tk}`, JSON.stringify([]));

    toast({
      title: "Thành công",
      message: "Đơn hàng của bạn đã được tạo thành công!",
      type: "success",
      duration: 4000,
    });

    setTimeout(() => {
      window.location = "/";
    }, 4000);
  } catch (error) {
    console.error("Lỗi kết nối hoặc API:", error);
    toast({
      title: "Lỗi",
      message: "Không thể kết nối đến server, vui lòng thử lại sau.",
      type: "error",
      duration: 4000,
    });
  }
}
