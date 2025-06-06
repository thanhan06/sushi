function checkLogin() {
  let role = localStorage.getItem("role");
  if (role !== "admin") {
    document.querySelector(
      "body"
    ).innerHTML = `<div class="access-denied-section">
              <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
          </div>`;
  } else {
    // document.getElementById("name-acc").innerHTML = currentUser.fullname;
  }
}
window.onload = checkLogin();

//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// log out admin user
/*
  let toogleMenu = document.querySelector(".profile");
  let mune = document.querySelector(".profile-cropdown");
  toogleMenu.onclick = function () {
      mune.classList.toggle("active");
  };
  */

// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for (let i = 0; i < sidebars.length; i++) {
  sidebars[i].onclick = function () {
    document
      .querySelector(".sidebar-list-item.active")
      .classList.remove("active");
    document.querySelector(".section.active").classList.remove("active");
    sidebars[i].classList.add("active");
    sections[i].classList.add("active");
  };
}

const closeBtn = document.querySelectorAll(".section");
console.log(closeBtn[0]);
for (let i = 0; i < closeBtn.length; i++) {
  closeBtn[i].addEventListener("click", (e) => {
    sidebar.classList.add("open");
  });
}







// function getAmoumtProduct() {
//   let products = localStorage.getItem("products")
//     ? JSON.parse(localStorage.getItem("products"))
//     : [];
//   return products.length;
// }

// Get amount user

function getAmoumtUser() {
  let accounts = localStorage.getItem("accounts")
    ? JSON.parse(localStorage.getItem("accounts"))
    : [];
  return accounts.filter((item) => item.userType == 0).length;
}

// Get amount user
function getMoney() {
  let tongtien = 0;
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  orders.forEach((item) => {
    tongtien += item.tongtien;
  });
  return tongtien;
}

document.getElementById("amount-user").innerHTML = getAmoumtUser();
// document.getElementById("amount-product").innerHTML = getAmoumtProduct();
document.getElementById("doanh-thu").innerHTML = vnd(getMoney());

// Doi sang dinh dang tien VND
function vnd(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
// Phân trang
// let perPage = 12;
// let currentPage = 1;
// let totalPage = 0;
// let perProducts = [];

// function displayList(productAll, perPage, currentPage) {
//   let start = (currentPage - 1) * perPage;
//   let end = (currentPage - 1) * perPage + perPage;
//   let productShow = productAll.slice(start, end);
//   showProductArr(productShow);
// }
//product
const apiUrlDishes = 'http://localhost:3002/dishes/';
const apiUrlTypes = 'http://localhost:3002/dishes/types';

// Lưu trữ dữ liệu món ăn và thể loại
let allDishes = [];
let filteredDishes = [];

// 1. Fetch danh sách thể loại món ăn và render dropdown
async function fetchAndRenderTypes() {
    try {
        const response = await fetch(apiUrlTypes);
        const categories = await response.json();

        let optionsHtml = '<option value="">Tất cả</option>'; // Thêm option "Tất cả"
        categories.forEach((category) => {
            optionsHtml += `<option value="${category.ma_loai}">${category.ten_loai}</option>`;
        });

        document.getElementById("the-loai").innerHTML = optionsHtml;
    } catch (error) {
        console.error("Lỗi khi tải loại món ăn:", error);
    }
}
fetchAndRenderTypes();

// 2. Fetch danh sách món ăn với các tham số lọc
async function fetchDishes(area = "", type = "", branch = "", searchText = "") {
    try {
        const params = [];

        // Chỉ thêm tham số vào URL nếu nó không rỗng
        if (area) params.push(`area=${encodeURIComponent(area)}`);
        if (type) params.push(`type=${encodeURIComponent(type)}`);
        if (branch) params.push(`branch=${encodeURIComponent(branch)}`);
        if (searchText) params.push(`name=${encodeURIComponent(searchText)}`);

        const url = `${apiUrlDishes}${params.length > 0 ? '?' + params.join('&') : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API trả về lỗi: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            allDishes = data;
            filteredDishes = [...allDishes];
            showProductArr(filteredDishes, searchText); // Pass the search text here
        } else {
            console.log("Không có món ăn nào để hiển thị.");
            showProductArr([]); // Hiển thị thông báo không có món ăn
        }

    } catch (error) {
        console.error("Có lỗi khi lấy danh sách món ăn:", error);
    }
}

// 3. Hiển thị danh sách món ăn với nút sửa và xóa
function showProductArr(arr, searchText) {
  const container = document.getElementById("show-product");
  if (arr.length === 0) {
      container.innerHTML = `
          <div class="no-result">
              <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
              <div class="no-result-h">Không có sản phẩm để hiển thị</div>
          </div>`;
      return;
  }

  container.innerHTML = arr.map(product => {
      const productName = product.ten_mon.toLowerCase();
      const searchQuery = searchText.toLowerCase();

      // Lọc món ăn theo tên trong search input
      if (productName.includes(searchQuery)) {
          return `
              <div class="list">
                  <div class="list-left">
                      <img src="../assets/img/products/${product.ma_mon}.jpg" alt="${product.ten_mon}">
                      <div class="list-info">
                          <h4>${product.ten_mon}</h4>
                      </div>
                  </div>
                  <div class="list-right">
                      <div class="list-price" style="margin-bottom:30px;">
                          <span class="list-current-price">${vnd(product.gia_hien_tai)} đ</span>
                      </div>
                      <div class="list-actions">
                          <button class="btn-edit" onclick="editProduct('${product.ma_mon}')">Sửa</button>
                          <button class="btn-delete" onclick="deleteProduct('${product.ma_mon}')">Xóa</button>
                      </div>
                  </div>
              </div>`;
      }
      return '';  // Không hiển thị món ăn nếu không tìm thấy trong kết quả tìm kiếm
  }).join("");
}

// 4. Lọc món ăn khi chọn khu vực, thể loại hoặc nhập tìm kiếm
function showProduct() {
  const sBranch = document.getElementById("branch-list"); // Lấy mã chi nhánh
  const selectedBranch = sBranch.getAttribute("data-ma");

  const selectedArea = document.getElementById("khu-vuc").value;
  const selectedType = document.getElementById("the-loai").value;
  const searchText = document.getElementById("form-search-product").value;

  // Gọi API với các tham số
  fetchDishes(selectedArea, selectedType, selectedBranch, searchText);
}

// 5. Làm mới danh sách món ăn
async function cancelSearchProduct() {
    console.log("cancel");

    await fetchDishes();
    document.getElementById("khu-vuc").value = "";
    document.getElementById("the-loai").value = "";
    document.getElementById("form-search-product").value = "";
    showProduct();  // Gọi lại hàm lọc món ăn
}

// 6. Chuyển số thành định dạng tiền Việt Nam
function vnd(amount) {
    if (amount !== undefined && amount !== null) {
        return amount.toLocaleString("vi-VN");
    } else {
        console.warn('Giá trị không hợp lệ:', amount);
        return '';
    }
}

// Fetch và render các chi nhánh khi di chuột vào khu vực
async function fetchBranches(area) {
  try {
      const response = await fetch(`http://localhost:3002/branches?area=${area}`);
      const branches = await response.json();

      const branchListDiv = document.getElementById('branch-list');
      branchListDiv.innerHTML = ''; // Xóa danh sách chi nhánh trước đó

      // Hiển thị danh sách chi nhánh
      branches.forEach(branch => {
          const branchDiv = document.createElement('div');
          branchDiv.textContent = branch.ten_cn; // Hiển thị tên chi nhánh
          branchDiv.classList.add('branch-item');
          branchDiv.setAttribute('data-ma-cn', branch.ma_cn); // Gán mã chi nhánh

          branchDiv.addEventListener('click', function () {
              selectBranch(branch); // Khi người dùng chọn chi nhánh
          });

          branchListDiv.appendChild(branchDiv);
      });

      branchListDiv.style.display = 'block'; // Hiển thị danh sách
  } catch (error) {
      console.error("Có lỗi khi lấy dữ liệu chi nhánh:", error);
  }
}

// Khi di chuột vào khu vực, hiển thị danh sách chi nhánh
function showBranches() {
    const selectedArea = document.getElementById('khu-vuc').value;
    if (selectedArea) {
        fetchBranches(selectedArea); // Fetch chi nhánh cho khu vực đã chọn
    }
}

// Ẩn danh sách chi nhánh khi di chuột ra ngoài
function hideBranches() {
  const branchListDiv = document.getElementById('branch-list');
  branchListDiv.style.display = 'none'; // Ẩn danh sách chi nhánh
}

// Khi chọn chi nhánh, ẩn danh sách chi nhánh
function selectBranch(branch) {
  const branchListDiv = document.getElementById('branch-list');
  branchListDiv.style.display = 'none'; // Ẩn danh sách chi nhánh
  branchListDiv.setAttribute('data-ma', branch.ma_cn);
  const branchInput = document.querySelector('[data-ma-cn]'); // Input ẩn lưu mã chi nhánh
  branchListDiv.value = branch.ma_cn; // Gán mã chi nhánh vào input

  console.log("Chọn chi nhánh:", branch.ten_cn, "Mã chi nhánh:", branch.ma_cn);

  // Gọi lại hàm lọc món ăn sau khi chọn chi nhánh
  showProduct();
}

function selectArea() {
  const selectedArea = document.getElementById('select-area').value; // Lấy giá trị khu vực đã chọn
  console.log("Khu vực đã chọn:", selectedArea);

  // Gọi hàm showProduct để làm mới danh sách món ăn theo khu vực
  showProduct();
}

// Fetch và render danh sách khu vực vào dropdown
async function fetchAndRenderAreas() {
    try {
        const response = await fetch('http://localhost:3002/branches/area');
        const areas = await response.json();
        const khuVucSelect = document.getElementById('khu-vuc');
        khuVucSelect.innerHTML = '<option value="">Chọn khu vực</option>';

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.ten_kv;
            option.textContent = area.ten_kv;
            const areaDiv = document.createElement('div');
          option.addEventListener('click', function () {
            showProduct();
          });

            khuVucSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Có lỗi khi lấy dữ liệu khu vực:", error);
    }
}

document.getElementById('khu-vuc').addEventListener('change', function() {
  const sBranch = document.getElementById("branch-list"); // Lấy mã chi nhánh
  sBranch.setAttribute("data-ma","");
  showProduct();
});

fetchAndRenderAreas();

// Gọi các hàm khi trang tải
window.onload = async () => {
    await fetchAndRenderTypes();
    await fetchAndRenderAreas();
    showProduct();
};



    // end chọn loại món ăn

    // thêm món
// Hàm lấy danh sách loại món ăn từ API
function fetchCategories() {
  fetch('http://localhost:3002/dishes/types')
      .then(response => response.json())
      .then(data => {
          const categorySelect = document.getElementById('chon-mon');
          data.forEach(category => {
              const option = document.createElement('option');
              option.value = category.ma_loai;
              option.textContent = category.ten_loai;
              categorySelect.appendChild(option);
          });
      })
      .catch(error => console.error('Error fetching categories:', error));
}

// Gửi yêu cầu POST để thêm món ăn
async function addDish() {
  const accesstoken = localStorage.getItem("token"); // Lấy token từ localStorage
  // Lấy giá trị từ các trường nhập liệu
  const tenMon = document.getElementById("ten-mon").value;
  const gia = parseFloat(document.getElementById("gia").value);
  const loai = parseInt(document.getElementById("chon-mon").value);
  const giaHienTai = parseFloat(document.getElementById("gia-hien-tai").value);
  const giaoHang = document.getElementById("giao-hang").checked ? "T" : "F";

  // Kiểm tra các trường bắt buộc
  if (!tenMon || !gia || !loai || !giaHienTai) {
      toast({
          title: "Lỗi",
          message: "Vui lòng điền đầy đủ thông tin: Tên món, Giá, Loại món, Giá hiện tại.",
          type: "error",
          duration: 4000,
      });
      return; // Dừng lại nếu thiếu trường thông tin
  }

  // Tạo đối tượng mới từ các trường đã điền
  const newProduct = {
      ten_mon: tenMon,             // Tên món ăn
      gia: gia,                    // Giá món ăn
      loai: loai,                  // Loại món ăn
      gia_hien_tai: giaHienTai,    // Giá hiện tại
      giao_hang: giaoHang,         // Kiểm tra giao hàng
  };

  console.log("newProduct:", newProduct);

  try {
      // Gửi yêu cầu POST đến API để thêm món ăn
      const response = await fetch("http://localhost:3002/dishes/add", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accesstoken}`,  // Gửi token trong header
          },
          body: JSON.stringify(newProduct), // Chuyển đối tượng thành chuỗi JSON
      });

      // Kiểm tra nếu phản hồi không thành công
      if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          toast({
              title: "Lỗi",
              message: `Món này đã tồn tại rồi hoặc có lỗi khác: ${errorText || "Lỗi không xác định"}`,
              type: "error",
              duration: 4000,
          });
          return;
      }

      // Xử lý dữ liệu trả về từ API
      const data = await response.json();
      console.log("API Response:", data);  // Log tất cả dữ liệu trả về từ API

      if (data.success || data.message === "Ok") {
          toast({
              title: "Thành công",
              message: "Món ăn đã được thêm thành công!",
              type: "success",
              duration: 4000,
          });
          showProduct(); // Cập nhật danh sách sản phẩm nếu thành công

          // Ẩn modal và reset lại các trường
          const modal = document.querySelector('.modal.add-product');
          modal.style.display = 'none';  // Ẩn modal

          // Reset các trường nhập liệu trong modal
          document.getElementById("ten-mon").value = "";
          document.getElementById("gia").value = "";
          document.getElementById("gia-hien-tai").value = "";
          document.getElementById("chon-mon").value = ""; // Reset chọn loại món
          document.getElementById("giao-hang").checked = false; // Reset giao hàng
      } else {
          toast({
              title: "Lỗi",
              message: `Đã có lỗi xảy ra khi thêm món ăn: ${data.message || "Lỗi không xác định"}`,
              type: "error",
              duration: 4000,
          });
      }
  } catch (error) {
      console.error("Có lỗi xảy ra trong quá trình gửi yêu cầu:", error);
      toast({
          title: "Lỗi",
          message: `Đã có lỗi xảy ra. Vui lòng thử lại sau.`,
          type: "error",
          duration: 4000,
      });
  }
}
// Thêm sự kiện cho nút "Thêm món mới" để hiển thị lại modal
document.getElementById("btn-add-product").addEventListener("click", () => {
  const modal = document.querySelector('.modal.add-product');
  modal.style.display = 'block';  // Hiển thị lại modal

  // Reset lại các trường nhập liệu khi hiển thị modal
  document.getElementById("ten-mon").value = "";
  document.getElementById("gia").value = "";
  document.getElementById("gia-hien-tai").value = "";
  document.getElementById("chon-mon").value = ""; // Reset chọn loại món
  document.getElementById("giao-hang").checked = false; // Reset giao hàng
});

// Gọi hàm addDish() khi nhấn nút "Thêm món"
document.getElementById("add-product-button").addEventListener("click", (e) => {
  e.preventDefault(); // Ngừng hành động mặc định của form
  addDish(); // Gọi hàm thêm món ăn
});

// Gọi hàm fetchCategories khi trang tải
document.addEventListener('DOMContentLoaded', fetchCategories);



    // end thêm món
    // sửa món
    async function editProduct(maMon) {
      console.log("Đang sửa món ăn với mã:", maMon); // Log để kiểm tra sự kiện
  
      try {
          // Fetch thông tin món ăn từ API
          const response = await fetch(`http://localhost:3002/dishes/${maMon}`);
          if (!response.ok) {
              throw new Error("Không thể lấy thông tin món ăn.");
          }
  
          const product = await response.json();
          console.log("Thông tin món ăn:", product); // Kiểm tra dữ liệu trả về
  
          // Điền dữ liệu vào các trường trong modal
          document.getElementById("ten-mon").value = product.ten_mon || '';
          document.getElementById("gia").value = product.gia || 0;
          document.getElementById("gia-hien-tai").value = product.gia_hien_tai || 0;
          document.getElementById("chon-mon").value = product.loai || '';
          document.getElementById("giao-hang").checked = product.giao_hang === "T";
           // Gắn ID món ăn vào nút "Lưu thay đổi"
          const updateBtn = document.getElementById("update-product-button");
          updateBtn.setAttribute("data-id", maMon);
          // Chuyển modal về chế độ chỉnh sửa
          const AddPro = document.querySelector(".add-product-e");
          AddPro.style.display = 'none'; // Hiển thị lại modal
          const submitBtn = document.querySelector('#add-product-button');
          submitBtn.style.display='none';
          // Hiển thị modal
          const modal = document.querySelector('.modal.add-product');
          modal.style.display = 'block'; // Hiển thị modal
          modal.classList.add('open'); // Thêm class để hiện modal
      } catch (error) {
          console.error("Lỗi khi fetch thông tin món ăn:", error);
      }
  }
  
  document.getElementById("update-product-button").addEventListener("click", async (e) => {
    e.preventDefault(); // Ngừng hành động mặc định của form

    const accesstoken = localStorage.getItem("token"); // Lấy token từ localStorage

    // Lấy ID món ăn từ nút "Lưu thay đổi"
    const maMon = e.target.getAttribute("data-id");

    // Lấy giá trị từ các trường nhập liệu
    const tenMon = document.getElementById("ten-mon").value;
    const gia = parseFloat(document.getElementById("gia").value);
    const loai = parseInt(document.getElementById("chon-mon").value);
    const giaHienTai = parseFloat(document.getElementById("gia-hien-tai").value);
    const giaoHang = document.getElementById("giao-hang").checked ? "T" : "F";

    // Kiểm tra các trường bắt buộc
    if (!tenMon || !gia || !loai || !giaHienTai) {
        toast({
            title: "Lỗi",
            message: "Vui lòng điền đầy đủ thông tin: Tên món, Giá, Loại món, Giá hiện tại.",
            type: "error",
            duration: 4000,
        });
        return; // Dừng lại nếu thiếu trường thông tin
    }

    // Tạo đối tượng món ăn đã chỉnh sửa
    const updatedProduct = {
      gia_hien_tai: giaHienTai,  // Chỉ gửi giá hiện tại
      giao_hang: giaoHang        // Chỉ gửi thông tin giao hàng
  };

    try {
        // Gửi yêu cầu PUT hoặc PATCH để cập nhật món ăn
        const response = await fetch(`http://localhost:3002/dishes/${maMon}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accesstoken}`,
            },
            body: JSON.stringify(updatedProduct),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        if (data.message) {
            toast({
                title: "Thành công",
                message: "Món ăn đã được cập nhật thành công!",
                type: "success",
                duration: 4000,
            });

            // Cập nhật lại danh sách món ăn sau khi sửa thành công
            showProduct(); // Giả sử bạn có hàm này để hiển thị lại danh sách sản phẩm

            // Ẩn modal và reset các trường
            const modal = document.querySelector('.modal.add-product');
            modal.style.display = 'none';
            modal.classList.remove('show');
            resetForm(); // Reset lại form sau khi thành công
        } else {
            toast({
                title: "Lỗi",
                message: "Đã có lỗi xảy ra khi cập nhật món ăn.",
                type: "error",
                duration: 4000,
            });
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi cập nhật món ăn:", error);
        toast({
            title: "Lỗi",
            message: `Đã có lỗi xảy ra. Vui lòng thử lại sau.`,
            type: "error",
            duration: 4000,
        });
    }
});
function resetForm() {
  document.getElementById("ten-mon").value = '';
  document.getElementById("gia").value = '';
  document.getElementById("gia-hien-tai").value = '';
  document.getElementById("chon-mon").value = '';
  document.getElementById("giao-hang").checked = false;
}

    // end sửa món
// end product
// function setupPagination(productAll, perPage) {
//   document.querySelector(".page-nav-list").innerHTML = "";
//   let page_count = Math.ceil(productAll.length / perPage);
//   for (let i = 1; i <= page_count; i++) {
//     let li = paginationChange(i, productAll, currentPage);
//     document.querySelector(".page-nav-list").appendChild(li);
//   }
// }

// function paginationChange(page, productAll, currentPage) {
//   let node = document.createElement(`li`);
//   node.classList.add("page-nav-item");
//   node.innerHTML = `<a href="#">${page}</a>`;
//   if (currentPage == page) node.classList.add("active");
//   node.addEventListener("click", function () {
//     currentPage = page;
//     displayList(productAll, perPage, currentPage);
//     let t = document.querySelectorAll(".page-nav-item.active");
//     for (let i = 0; i < t.length; i++) {
//       t[i].classList.remove("active");
//     }
//     node.classList.add("active");
//   });
//   return node;
// }
  // Tạo HTML cho danh sách món ăn
  
// function cancelSearchProduct() {
//   let products = localStorage.getItem("products")
//     ? JSON.parse(localStorage.getItem("products")).filter(
//         (item) => item.status == 1
//       )
//     : [];
//   document.getElementById("the-loai").value = "Tất cả";
//   document.getElementById("form-search-product").value = "";
//   displayList(products, perPage, currentPage);
//   setupPagination(products, perPage, currentPage);
// }

window.onload = showProduct();

// function createId(arr) {
//   let id = arr.length;
//   let check = arr.find((item) => item.id == id);
//   while (check != null) {
//     id++;
//     check = arr.find((item) => item.id == id);
//   }
//   return id;
// }
// Xóa sản phẩm
// function deleteProduct(id) {
//   let products = JSON.parse(localStorage.getItem("products"));
//   let index = products.findIndex((item) => {
//     return item.id == id;
//   });
//   if (confirm("Bạn có chắc muốn xóa?") == true) {
//     products[index].status = 0;
//     toast({
//       title: "Success",
//       message: "Xóa sản phẩm thành công !",
//       type: "success",
//       duration: 3000,
//     });
//   }
//   localStorage.setItem("products", JSON.stringify(products));
//   showProduct();
// }

// function changeStatusProduct(id) {
//   let products = JSON.parse(localStorage.getItem("products"));
//   let index = products.findIndex((item) => {
//     return item.id == id;
//   });
//   if (confirm("Bạn có chắc chắn muốn hủy xóa?") == true) {
//     products[index].status = 1;
//     toast({
//       title: "Success",
//       message: "Khôi phục sản phẩm thành công !",
//       type: "success",
//       duration: 3000,
//     });
//   }
//   localStorage.setItem("products", JSON.stringify(products));
//   showProduct();
// }

// var indexCur;
// function editProduct(id) {
//   let products = localStorage.getItem("products")
//     ? JSON.parse(localStorage.getItem("products"))
//     : [];
//   let index = products.findIndex((item) => {
//     return item.id == id;
//   });
//   indexCur = index;
//   document.querySelectorAll(".add-product-e").forEach((item) => {
//     item.style.display = "none";
//   });
//   document.querySelectorAll(".edit-product-e").forEach((item) => {
//     item.style.display = "block";
//   });
//   document.querySelector(".add-product").classList.add("open");
//   //
//   document.querySelector(".upload-image-preview").src = products[index].img;
//   document.getElementById("ten-mon").value = products[index].title;
//   document.getElementById("gia-moi").value = products[index].price;
//   document.getElementById("mo-ta").value = products[index].desc;
//   document.getElementById("chon-mon").value = products[index].category;
// }

// function getPathImage(path) {
//   let patharr = path.split("/");
//   return "./assets/img/products/" + patharr[patharr.length - 1];
// }

// let btnUpdateProductIn = document.getElementById("update-product-button");
// btnUpdateProductIn.addEventListener("click", (e) => {
//   e.preventDefault();
//   let products = JSON.parse(localStorage.getItem("products"));
//   let idProduct = products[indexCur].id;
//   let imgProduct = products[indexCur].img;
//   let titleProduct = products[indexCur].title;
//   let curProduct = products[indexCur].price;
//   let descProduct = products[indexCur].desc;
//   let categoryProduct = products[indexCur].category;
//   let imgProductCur = getPathImage(
//     document.querySelector(".upload-image-preview").src
//   );
//   let titleProductCur = document.getElementById("ten-mon").value;
//   let curProductCur = document.getElementById("gia-moi").value;
//   let descProductCur = document.getElementById("mo-ta").value;
//   let categoryText = document.getElementById("chon-mon").value;

//   if (
//     imgProductCur != imgProduct ||
//     titleProductCur != titleProduct ||
//     curProductCur != curProduct ||
//     descProductCur != descProduct ||
//     categoryText != categoryProduct
//   ) {
//     let productadd = {
//       id: idProduct,
//       title: titleProductCur,
//       img: imgProductCur,
//       category: categoryText,
//       price: parseInt(curProductCur),
//       desc: descProductCur,
//       status: 1,
//     };
//     products.splice(indexCur, 1);
//     products.splice(indexCur, 0, productadd);
//     localStorage.setItem("products", JSON.stringify(products));
//     toast({
//       title: "Success",
//       message: "Sửa sản phẩm thành công!",
//       type: "success",
//       duration: 3000,
//     });
//     setDefaultValue();
//     document.querySelector(".add-product").classList.remove("open");
//     showProduct();
//   } else {
//     toast({
//       title: "Warning",
//       message: "Sản phẩm của bạn không thay đổi!",
//       type: "warning",
//       duration: 3000,
//     });
//   }
// });

// let btnAddProductIn = document.getElementById("add-product-button");
// btnAddProductIn.addEventListener("click", (e) => {
//   e.preventDefault();
//   let imgProduct = getPathImage(
//     document.querySelector(".upload-image-preview").src
//   );
//   let tenMon = document.getElementById("ten-mon").value;
//   let price = document.getElementById("gia-moi").value;
//   let moTa = document.getElementById("mo-ta").value;
//   let categoryText = document.getElementById("chon-mon").value;
//   if (tenMon == "" || price == "" || moTa == "") {
//     toast({
//       title: "Chú ý",
//       message: "Vui lòng nhập đầy đủ thông tin món!",
//       type: "warning",
//       duration: 3000,
//     });
//   } else {
//     if (isNaN(price)) {
//       toast({
//         title: "Chú ý",
//         message: "Giá phải ở dạng số!",
//         type: "warning",
//         duration: 3000,
//       });
//     } else {
//       let products = localStorage.getItem("products")
//         ? JSON.parse(localStorage.getItem("products"))
//         : [];
//       let product = {
//         id: createId(products),
//         title: tenMon,
//         img: imgProduct,
//         category: categoryText,
//         price: price,
//         desc: moTa,
//         status: 1,
//       };
//       products.unshift(product);
//       localStorage.setItem("products", JSON.stringify(products));
//       showProduct();
//       document.querySelector(".add-product").classList.remove("open");
//       toast({
//         title: "Success",
//         message: "Thêm sản phẩm thành công!",
//         type: "success",
//         duration: 3000,
//       });
//       setDefaultValue();
//     }
//   }
// });

document
  .querySelector(".modal-close.product-form")
  .addEventListener("click", () => {
    setDefaultValue();
  });

function setDefaultValue() {
  document.querySelector(".upload-image-preview").src =
    "./assets/img/blank-image.png";
  document.getElementById("ten-mon").value = "";
  document.getElementById("gia-moi").value = "";
  document.getElementById("mo-ta").value = "";
  document.getElementById("chon-mon").value = "Món chay";
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
  document.querySelectorAll(".add-product-e").forEach((item) => {
    item.style.display = "block";
  });
  document.querySelectorAll(".edit-product-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelector(".add-product").classList.add("open");
});

// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
  closePopup[i].onclick = () => {
    modalPopup[i].classList.remove("open");
  };
}

// On change Image
// function uploadImage(el) {
//   let path = "./assets/img/products/" + el.value.split("\\")[2];
//   document.querySelector(".upload-image-preview").setAttribute("src", path);
// }

// Đổi trạng thái đơn hàng
function changeStatus(id, el) {
  let orders = JSON.parse(localStorage.getItem("order"));
  let order = orders.find((item) => {
    return item.id == id;
  });
  order.trangthai = 1;
  el.classList.remove("btn-chuaxuly");
  el.classList.add("btn-daxuly");
  el.innerHTML = "Đã xử lý";
  localStorage.setItem("order", JSON.stringify(orders));
  findOrder(orders);
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

// Show order
function showOrder(arr) {
  let orderHtml = "";
  if (arr.length == 0) {
    orderHtml = `<td colspan="6">Không có dữ liệu</td>`;
  } else {
    arr.forEach((item) => {
      let status =
        item.trangthai == 0
          ? `<span class="status-no-complete">Chưa xử lý</span>`
          : `<span class="status-complete">Đã xử lý</span>`;
      let date = formatDate(item.thoigiandat);
      orderHtml += `
              <tr>
              <td>${item.id}</td>
              <td>${item.khachhang}</td>
              <td>${date}</td>
              <td>${vnd(item.tongtien)}</td>                               
              <td>${status}</td>
              <td class="control">
              <button class="btn-detail" id="" onclick="detailOrder('${
                item.id
              }')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
              </td>
              </tr>      
              `;
    });
  }
  document.getElementById("showOrder").innerHTML = orderHtml;
}

let orders = localStorage.getItem("order")
  ? JSON.parse(localStorage.getItem("order"))
  : []; //LẤY GIỎ HÀNG TỪ LOCAL
window.onload = showOrder(orders);

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

// Show Order Detail
function detailOrder(id) {
  document.querySelector(".modal.detail-order").classList.add("open");
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let products = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("products"))
    : [];
  // Lấy hóa đơn
  let order = orders.find((item) => item.id == id);
  // Lấy chi tiết hóa đơn
  let ctDon = getOrderDetails(id);
  let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

  ctDon.forEach((item) => {
    let detaiSP = products.find((product) => product.id == item.id);
    spHtml += `<div class="order-product">
              <div class="order-product-left">
                  <img src="${detaiSP.img}" alt="">
                  <div class="order-product-info">
                      <h4>${detaiSP.title}</h4>
                      <p class="order-product-note"><i class="fa-light fa-pen"></i> ${
                        item.note
                      }</p>
                      <p class="order-product-quantity">SL: ${item.soluong}<p>
                  </div>
              </div>
              <div class="order-product-right">
                  <div class="order-product-price">
                      <span class="order-product-current-price">${vnd(
                        item.price
                      )}</span>
                  </div>                         
              </div>
          </div>`;
  });
  spHtml += `</div></div>`;
  spHtml += `<div class="modal-detail-right">
          <ul class="detail-order-group">
              <li class="detail-order-item">
                  <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                  <span class="detail-order-item-right">${formatDate(
                    order.thoigiandat
                  )}</span>
              </li>
              <li class="detail-order-item">
                  <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                  <span class="detail-order-item-right">${
                    order.hinhthucgiao
                  }</span>
              </li>
              <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
              <span class="detail-order-item-right">${order.tenguoinhan}</span>
              </li>
              <li class="detail-order-item">
              <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
              <span class="detail-order-item-right">${order.sdtnhan}</span>
              </li>
              <li class="detail-order-item tb">
                  <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                  <p class="detail-order-item-b">${
                    (order.thoigiangiao == ""
                      ? ""
                      : order.thoigiangiao + " - ") +
                    formatDate(order.ngaygiaohang)
                  }</p>
              </li>
              <li class="detail-order-item tb">
                  <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                  <p class="detail-order-item-b">${order.diachinhan}</p>
              </li>
              <li class="detail-order-item tb">
                  <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                  <p class="detail-order-item-b">${order.ghichu}</p>
              </li>
          </ul>
      </div>`;
  document.querySelector(".modal-detail-order").innerHTML = spHtml;

  let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
  let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
  document.querySelector(
    ".modal-detail-bottom"
  ).innerHTML = `<div class="modal-detail-bottom-left">
          <div class="price-total">
              <span class="thanhtien">Thành tiền</span>
              <span class="price">${vnd(order.tongtien)}</span>
          </div>
      </div>
      <div class="modal-detail-bottom-right">
          <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${
    order.id
  }',this)">${textDetailBtn}</button>
      </div>`;
}

// Find Order
function findOrder() {
  let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
  let ct = document.getElementById("form-search-order").value;
  let timeStart = document.getElementById("time-start").value;
  let timeEnd = document.getElementById("time-end").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("Lựa chọn thời gian sai !");
    return;
  }
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let result =
    tinhTrang == 2
      ? orders
      : orders.filter((item) => {
          return item.trangthai == tinhTrang;
        });
  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return (
            item.khachhang.toLowerCase().includes(ct.toLowerCase()) ||
            item.id.toString().toLowerCase().includes(ct.toLowerCase())
          );
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0)
      );
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showOrder(result);
}

function cancelSearchOrder() {
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  document.getElementById("tinh-trang").value = 2;
  document.getElementById("form-search-order").value = "";
  document.getElementById("time-start").value = "";
  document.getElementById("time-end").value = "";
  showOrder(orders);
}

// Create Object Thong ke
function createObj() {
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : [];
  let orderDetails = localStorage.getItem("orderDetails")
    ? JSON.parse(localStorage.getItem("orderDetails"))
    : [];
  let result = [];
  orderDetails.forEach((item) => {
    // Lấy thông tin sản phẩm
    let prod = products.find((product) => {
      return product.id == item.id;
    });
    let obj = new Object();
    obj.id = item.id;
    obj.madon = item.madon;
    obj.price = item.price;
    obj.quantity = item.soluong;
    obj.category = prod.category;
    obj.title = prod.title;
    obj.img = prod.img;
    obj.time = orders.find((order) => order.id == item.madon).thoigiandat;
    result.push(obj);
  });
  return result;
}

// Filter
function thongKe(mode) {
  let categoryTk = document.getElementById("the-loai-tk").value;
  let ct = document.getElementById("form-search-tk").value;
  let timeStart = document.getElementById("time-start-tk").value;
  let timeEnd = document.getElementById("time-end-tk").value;
  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("Lựa chọn thời gian sai !");
    return;
  }
  let arrDetail = createObj();
  let result =
    categoryTk == "Tất cả"
      ? arrDetail
      : arrDetail.filter((item) => {
          return item.category == categoryTk;
        });

  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return item.title.toLowerCase().includes(ct.toLowerCase());
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showThongKe(result, mode);
}

// Show số lượng sp, số lượng đơn bán, doanh thu
function showOverview(arr) {
  document.getElementById("quantity-product").innerText = arr.length;
  document.getElementById("quantity-order").innerText = arr.reduce(
    (sum, cur) => sum + parseInt(cur.quantity),
    0
  );
  document.getElementById("quantity-sale").innerText = vnd(
    arr.reduce((sum, cur) => sum + parseInt(cur.doanhthu), 0)
  );
}

function showThongKe(arr, mode) {
  let orderHtml = "";
  let mergeObj = mergeObjThongKe(arr);
  showOverview(mergeObj);

  switch (mode) {
    case 0:
      mergeObj = mergeObjThongKe(createObj());
      showOverview(mergeObj);
      document.getElementById("the-loai-tk").value = "Tất cả";
      document.getElementById("form-search-tk").value = "";
      document.getElementById("time-start-tk").value = "";
      document.getElementById("time-end-tk").value = "";
      break;
    case 1:
      mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
      break;
    case 2:
      mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
      break;
  }
  for (let i = 0; i < mergeObj.length; i++) {
    orderHtml += `
          <tr>
          <td>${i + 1}</td>
          <td><div class="prod-img-title"><img class="prd-img-tbl" src="${
            mergeObj[i].img
          }" alt=""><p>${mergeObj[i].title}</p></div></td>
          <td>${mergeObj[i].quantity}</td>
          <td>${vnd(mergeObj[i].doanhthu)}</td>
          <td><button class="btn-detail product-order-detail" data-id="${
            mergeObj[i].id
          }"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
          </tr>      
          `;
  }
  document.getElementById("showTk").innerHTML = orderHtml;
  document.querySelectorAll(".product-order-detail").forEach((item) => {
    let idProduct = item.getAttribute("data-id");
    item.addEventListener("click", () => {
      detailOrderProduct(arr, idProduct);
    });
  });
}

showThongKe(createObj());

function mergeObjThongKe(arr) {
  let result = [];
  arr.forEach((item) => {
    let check = result.find((i) => i.id == item.id); // Không tìm thấy gì trả về undefined

    if (check) {
      check.quantity = parseInt(check.quantity) + parseInt(item.quantity);
      check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
    } else {
      const newItem = { ...item };
      newItem.doanhthu = newItem.price * newItem.quantity;
      result.push(newItem);
    }
  });
  return result;
}

function detailOrderProduct(arr, id) {
  let orderHtml = "";
  arr.forEach((item) => {
    if (item.id == id) {
      orderHtml += `<tr>
              <td>${item.madon}</td>
              <td>${item.quantity}</td>
              <td>${vnd(item.price)}</td>
              <td>${formatDate(item.time)}</td>
              </tr>      
              `;
    }
  });
  document.getElementById("show-product-order-detail").innerHTML = orderHtml;
  document.querySelector(".modal.detail-order-product").classList.add("open");
}

// User
let addAccount = document.getElementById("signup-button");
let updateAccount = document.getElementById("btn-update-account");

document
  .querySelector(".modal.signup .modal-close")
  .addEventListener("click", () => {
    signUpFormReset();
  });

function openCreateAccount() {
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".edit-account-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".add-account-e").forEach((item) => {
    item.style.display = "block";
  });
  const title = document.querySelector(".add-account-e.modal-container-title");
  if (title) {
    title.textContent = "THÊM KHÁCH HÀNG MỚI";
  }
}

function signUpFormReset() {
  document.getElementById("fullname").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
  document.querySelector(".form-message-name").innerHTML = "";
  document.querySelector(".form-message-phone").innerHTML = "";
  document.querySelector(".form-message-password").innerHTML = "";
}

function showUserArr(arr) {
  let accountHtml = "";
  if (arr.length == 0) {
    accountHtml = `<td colspan="5">Không có dữ liệu</td>`;
  } else {
    arr.forEach((account, index) => {
      let tinhtrang =
        account.status == 0
          ? `<span class="status-no-complete">Bị khóa</span>`
          : `<span class="status-complete">Hoạt động</span>`;
      accountHtml += ` <tr>
              <td>${index + 1}</td>
              <td>${account.fullname}</td>
              <td>${account.phone}</td>
              <td>${formatDate(account.join)}</td>
              <td>${tinhtrang}</td>
              <td class="control control-table">
              <button class="btn-edit" id="edit-account" onclick='editAccount(${
                account.phone
              })' ><i class="fa-light fa-pen-to-square"></i></button>
              <button class="btn-delete" id="delete-account" onclick="deleteAcount(${index})"><i class="fa-regular fa-trash"></i></button>
              </td>
          </tr>`;
    });
  }
  document.getElementById("show-user").innerHTML = accountHtml;
}

function showUser() {
  let tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
  let ct = document.getElementById("form-search-user").value;
  let timeStart = document.getElementById("time-start-user").value;
  let timeEnd = document.getElementById("time-end-user").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("Lựa chọn thời gian sai !");
    return;
  }

  let accounts = localStorage.getItem("accounts")
    ? JSON.parse(localStorage.getItem("accounts")).filter(
        (item) => item.userType == 0
      )
    : [];
  let result =
    tinhTrang == 2
      ? accounts
      : accounts.filter((item) => item.status == tinhTrang);

  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return (
            item.fullname.toLowerCase().includes(ct.toLowerCase()) ||
            item.phone.toString().toLowerCase().includes(ct.toLowerCase())
          );
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showUserArr(result);
}

function cancelSearchUser() {
  let accounts = localStorage.getItem("accounts")
    ? JSON.parse(localStorage.getItem("accounts")).filter(
        (item) => item.userType == 0
      )
    : [];
  showUserArr(accounts);
  document.getElementById("tinh-trang-user").value = 2;
  document.getElementById("form-search-user").value = "";
  document.getElementById("time-start-user").value = "";
  document.getElementById("time-end-user").value = "";
}

window.onload = showUser();

function deleteAcount(phone) {
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let index = accounts.findIndex((item) => item.phone == phone);
  if (confirm("Bạn có chắc muốn xóa?")) {
    accounts.splice(index, 1);
  }
  localStorage.setItem("accounts", JSON.stringify(accounts));
  showUser();
}

let indexFlag;
function editAccount(phone) {
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".add-account-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".edit-account-e").forEach((item) => {
    item.style.display = "block";
  });
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let index = accounts.findIndex((item) => {
    return item.phone == phone;
  });
  indexFlag = index;
  document.getElementById("fullname").value = accounts[index].fullname;
  document.getElementById("phone").value = accounts[index].phone;
  document.getElementById("password").value = accounts[index].password;
  document.getElementById("user-status").checked =
    accounts[index].status == 1 ? true : false;
}
function editOrder(id) {
  //
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".add-account-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".edit-account-e").forEach((item) => {
    item.style.display = "block";
  });
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let index = accounts.findIndex((item) => {
    return item.phone == phone;
  });
  indexFlag = index;
  document.getElementById("fullname").value = accounts[index].fullname;
  document.getElementById("phone").value = accounts[index].phone;
  document.getElementById("password").value = accounts[index].password;
  document.getElementById("user-status").checked =
    accounts[index].status == 1 ? true : false;
}

updateAccount.addEventListener("click", (e) => {
  e.preventDefault();
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let fullname = document.getElementById("fullname").value;
  let phone = document.getElementById("phone").value;
  let password = document.getElementById("password").value;
  if (fullname == "" || phone == "" || password == "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập đầy đủ thông tin !",
      type: "warning",
      duration: 3000,
    });
  } else {
    accounts[indexFlag].fullname = document.getElementById("fullname").value;
    accounts[indexFlag].phone = document.getElementById("phone").value;
    accounts[indexFlag].password = document.getElementById("password").value;
    accounts[indexFlag].status = document.getElementById("user-status").checked
      ? true
      : false;
    localStorage.setItem("accounts", JSON.stringify(accounts));
    toast({
      title: "Thành công",
      message: "Thay đổi thông tin thành công !",
      type: "success",
      duration: 3000,
    });
    document.querySelector(".signup").classList.remove("open");
    signUpFormReset();
    showUser();
  }
});

addAccount.addEventListener("click", (e) => {
  e.preventDefault();
  let fullNameUser = document.getElementById("fullname").value;
  let phoneUser = document.getElementById("phone").value;
  let passwordUser = document.getElementById("password").value;
  // Check validate
  let fullNameIP = document.getElementById("fullname");
  let formMessageName = document.querySelector(".form-message-name");
  let formMessagePhone = document.querySelector(".form-message-phone");
  let formMessagePassword = document.querySelector(".form-message-password");

  if (fullNameUser.length == 0) {
    formMessageName.innerHTML = "Vui lòng nhập họ vâ tên";
    fullNameIP.focus();
  } else if (fullNameUser.length < 3) {
    fullNameIP.value = "";
    formMessageName.innerHTML = "Vui lòng nhập họ và tên lớn hơn 3 kí tự";
  }

  if (phoneUser.length == 0) {
    formMessagePhone.innerHTML = "Vui lòng nhập vào số điện thoại";
  } else if (phoneUser.length != 10) {
    formMessagePhone.innerHTML = "Vui lòng nhập vào số điện thoại 10 số";
    document.getElementById("phone").value = "";
  }

  if (passwordUser.length == 0) {
    formMessagePassword.innerHTML = "Vui lòng nhập mật khẩu";
  } else if (passwordUser.length < 6) {
    formMessagePassword.innerHTML = "Vui lòng nhập mật khẩu lớn hơn 6 kí tự";
    document.getElementById("password").value = "";
  }

  if (fullNameUser && phoneUser && passwordUser) {
    let user = {
      fullname: fullNameUser,
      phone: phoneUser,
      password: passwordUser,
      address: "",
      email: "",
      status: 1,
      join: new Date(),
      cart: [],
      userType: 0,
    };
    console.log(user);
    let accounts = localStorage.getItem("accounts")
      ? JSON.parse(localStorage.getItem("accounts"))
      : [];
    let checkloop = accounts.some((account) => {
      return account.phone == user.phone;
    });
    if (!checkloop) {
      accounts.push(user);
      localStorage.setItem("accounts", JSON.stringify(accounts));
      toast({
        title: "Thành công",
        message: "Tạo thành công tài khoản !",
        type: "success",
        duration: 3000,
      });
      document.querySelector(".signup").classList.remove("open");
      showUser();
      signUpFormReset();
    } else {
      toast({
        title: "Cảnh báo !",
        message: "Tài khoản đã tồn tại !",
        type: "error",
        duration: 3000,
      });
    }
  }
});

document.getElementById("logout-acc").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  window.location.href = "/";
});

// create thẻ

// Hàm mở modal thêm thẻ
// Xóa dữ liệu thẻ trong localStorage
// function clearCards() {
//   localStorage.removeItem("cards");  // Xóa mục 'cards' khỏi localStorage
//   alert("Dữ liệu thẻ đã được xóa.");
//   showCards(); // Hiển thị lại danh sách thẻ (sẽ không có gì khi đã xóa)
// }

// Hàm mở modal cho việc thêm/sửa thẻ
// Hàm mở modal thêm hoặc sửa thẻ
function openAddCardModal(action) {
  resetForm();
  document.querySelector(".modal.add-card").classList.add("open");

  if (action === 'edit') {
    document.getElementById("add-card-title").style.display = 'none';
    document.getElementById("edit-card-title").style.display = 'block';
    document.getElementById("form-submit-btn").textContent = "Lưu thông tin";
    document.getElementById("status-container").style.display = 'block';  // Hiển thị dropdown trạng thái khi sửa
  } else {
    document.getElementById("edit-card-title").style.display = 'none';
    document.getElementById("add-card-title").style.display = 'block';
    document.getElementById("form-submit-btn").textContent = "Thêm thẻ mới";
    document.getElementById("status-container").style.display = 'none';  // Ẩn dropdown trạng thái khi thêm mới
  }
}


// Hàm đóng modal và làm trống form
function closeAddCardModal() {
  document.querySelector(".modal.add-card").classList.remove("open");

  // Làm trống form khi đóng modal
  resetForm();
}

// Hàm reset form
function resetForm() {
  document.getElementById("CCCD").value = '';
  document.getElementById("HoTen").value = '';
  document.getElementById("SDT").value = '';
  document.getElementById("Email").value = '';
  document.getElementById("GioiTinh").value = '';
  document.getElementById("NVLapThe").value = '';
  document.getElementById("HangThe").value = '';
  document.getElementById("NgayLap").value = '';
  document.getElementById("NgayDatCapMoi").value = '';
  window.cardToEdit = null; // Xóa thông tin thẻ đang sửa
}

// Hàm mở modal khi sửa thẻ
// Hàm mở modal khi sửa thẻ
// Hàm mở modal sửa thẻ
function editCard(cccd) {
  const cards = JSON.parse(localStorage.getItem("cards")) || [];
  const card = cards.find(card => card.CCCD === cccd);

  if (card) {
    openAddCardModal('edit');  // Mở modal chế độ sửa

    // Điền dữ liệu vào form
    document.getElementById("CCCD").value = card.CCCD;
    document.getElementById("HoTen").value = card.HoTen;
    document.getElementById("SDT").value = card.SDT;
    document.getElementById("Email").value = card.Email;
    document.getElementById("GioiTinh").value = card.GioiTinh;
    document.getElementById("NVLapThe").value = card.NVLapThe;
    document.getElementById("HangThe").value = card.HangThe;
    document.getElementById("NgayLap").value = formatDate(card.NgayLap);
    document.getElementById("NgayDatCapMoi").value = formatDate(card.NgayDatCapMoi);

    // Cập nhật trạng thái cho dropdown
    document.getElementById("status").value = card.status === 1 ? "1" : "0"; // Nếu thẻ hoạt động, chọn "Hoạt động"
    
    window.cardToEdit = card; // Lưu thẻ đang sửa vào biến toàn cục
  }
}


// Hàm định dạng ngày tháng theo định dạng yyyy-mm-dd
function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}


// Hàm xử lý khi người dùng gửi form (lưu thông tin mới hoặc sửa thẻ)
// Hàm kiểm tra xem CCCD hoặc SDT đã tồn tại trong dữ liệu chưa
function isDuplicate(cccd, sdt, excludeCurrentCard) {
  const cards = JSON.parse(localStorage.getItem("cards")) || [];
  
  // Nếu có thẻ đang sửa, bỏ qua thẻ đó khi kiểm tra trùng lặp
  return cards.some(card => {
    // Nếu là chế độ sửa, và thẻ này là thẻ đang sửa thì bỏ qua
    if (excludeCurrentCard && window.cardToEdit && card.CCCD === window.cardToEdit.CCCD) {
      return false; // Bỏ qua thẻ đang sửa
    }
    // Kiểm tra trùng lặp với CCCD và SDT
    return card.CCCD === cccd || card.SDT === sdt;
  });
}

// Hàm xử lý khi người dùng gửi form (lưu thông tin mới hoặc sửa thẻ)
// Hàm xử lý khi người dùng gửi form (lưu thông tin mới hoặc sửa thẻ)
document.getElementById("add-card-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Ngừng hành động mặc định của form

  const cccd = document.getElementById("CCCD").value;
  const hoTen = document.getElementById("HoTen").value;
  const sdt = document.getElementById("SDT").value;
  const email = document.getElementById("Email").value;
  const gioiTinh = document.getElementById("GioiTinh").value;
  const nvLapThe = document.getElementById("NVLapThe").value;
  const hangThe = document.getElementById("HangThe").value;
  const ngayLap = document.getElementById("NgayLap").value;
  const ngayDatCapMoi = document.getElementById("NgayDatCapMoi").value;
  const status = document.getElementById("status").value; // Lấy giá trị trạng thái từ dropdown

  // Kiểm tra trùng lặp CCCD và SDT (bỏ qua thẻ đang sửa)
  if (isDuplicate(cccd, sdt, true)) {
    toast({
      title: "Lỗi",
      message: "CCCD hoặc SDT đã tồn tại trong dữ liệu.",
      type: "error",
      duration: 3000,
    });
    return; // Dừng lại nếu trùng lặp
  }

  const cards = JSON.parse(localStorage.getItem("cards")) || [];

  if (window.cardToEdit) {
    // Cập nhật thẻ đã có
    const updatedCard = {
      CCCD: cccd,
      HoTen: hoTen,
      SDT: sdt,
      Email: email,
      GioiTinh: gioiTinh,
      NVLapThe: nvLapThe,
      HangThe: hangThe,
      NgayLap: ngayLap,
      NgayDatCapMoi: ngayDatCapMoi,
      status: parseInt(status) // Cập nhật trạng thái
    };

    const index = cards.findIndex(card => card.CCCD === window.cardToEdit.CCCD);
    if (index !== -1) {
      cards[index] = updatedCard; // Cập nhật thẻ trong mảng
      localStorage.setItem("cards", JSON.stringify(cards)); // Lưu lại vào localStorage
    }
    window.cardToEdit = null; // Xóa thông tin thẻ đang sửa
    toast({
      title: "Thành công",
      message: "Cập nhật thẻ thành công!",
      type: "success",
      duration: 3000,
    });
  } else {
    // Thêm thẻ mới
    const newCard = {
      CCCD: cccd,
      HoTen: hoTen,
      SDT: sdt,
      Email: email,
      GioiTinh: gioiTinh,
      NVLapThe: nvLapThe,
      HangThe: hangThe,
      NgayLap: ngayLap,
      NgayDatCapMoi: ngayDatCapMoi,
      status: 1 // Thẻ mới mặc định là hoạt động
    };

    cards.push(newCard);
    localStorage.setItem("cards", JSON.stringify(cards)); // Lưu thẻ mới vào localStorage
    toast({
      title: "Thành công",
      message: "Thêm thẻ thành công!",
      type: "success",
      duration: 3000,
    });
  }

  // Đóng modal và hiển thị lại danh sách thẻ
  closeAddCardModal();
  showCards();
});



// Hàm hiển thị danh sách thẻ
function showCards() {
  const cards = JSON.parse(localStorage.getItem("cards")) || [];
  const filteredCards = filterCards(cards); // Lọc các thẻ theo bộ lọc

  const cardList = document.getElementById("show-card");
  cardList.innerHTML = ''; // Xóa danh sách thẻ cũ

  filteredCards.forEach((card, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>  <!-- Số thứ tự -->
      <td>${card.HoTen}</td> <!-- Họ và tên -->
      <td>${card.SDT}</td>   <!-- Liên hệ -->
      <td>${card.HangThe}</td>  <!-- Hạng thẻ -->
      <td>${getStatus(card.status)}</td> <!-- Tình trạng -->
      <td class="control control-table">
        <button class="btn-edit" onclick="editCard('${card.CCCD}')">
          <i class="fa-light fa-pen-to-square"></i>
        </button>
        <button class="btn-delete" onclick="deleteCard(${index})">
          <i class="fa-regular fa-trash"></i>
        </button>
      </td>
    `;
    cardList.appendChild(row);
  });
}

// Hàm lấy tình trạng thẻ
function getStatus(status) {
  return status === 0
    ? `<span class="status-no-complete">Bị khóa</span>`
    : `<span class="status-complete">Hoạt động</span>`;
}

// Lọc thẻ theo các tiêu chí
function filterCards(cards) {
  const statusFilter = document.getElementById("tinh-trang-card").value;
  const searchQuery = document.getElementById("form-search-card").value.toLowerCase();
  const startDate = document.getElementById("time-start-card").value;
  const endDate = document.getElementById("time-end-card").value;

  return cards.filter(card => {
    const searchString = [
      card.HoTen || "",
      card.CCCD || "",
      card.SDT || "",
      new Date(card.NgayLap).toLocaleDateString() || "",
      card.NgayDatCapMoi || ""
    ].join(" ").toLowerCase();

    const matchesStatus = statusFilter == 2 || card.status == statusFilter;
    const matchesSearch = searchString.includes(searchQuery);
    const matchesDate = (!startDate || new Date(card.NgayLap) >= new Date(startDate)) &&
                        (!endDate || new Date(card.NgayLap) <= new Date(endDate));

    return matchesStatus && matchesSearch && matchesDate;
  });
}

// Đảm bảo khi tải trang, thẻ sẽ được hiển thị ngay
window.onload = showCards;
// Hàm xóa thẻ với xác nhận
function deleteCard(index) {
  const cards = JSON.parse(localStorage.getItem("cards")) || [];

  // Hiển thị cảnh báo xác nhận trước khi xóa
  const confirmation = confirm("Bạn có chắc muốn xóa thẻ này?");

  // Nếu người dùng nhấn OK (true), thực hiện xóa
  if (confirmation) {
    // Xóa thẻ khỏi mảng
    cards.splice(index, 1);

    // Cập nhật lại localStorage
    localStorage.setItem("cards", JSON.stringify(cards));

    // Hiển thị lại danh sách thẻ
    showCards();

    // Hiển thị thông báo toast
    toast({
      title: "Thành công",
      message: "Xóa thẻ thành công!",
      type: "success",
      duration: 3000,
    });
  } else {
    // Nếu người dùng nhấn Cancel, không làm gì cả
    console.log("Xóa thẻ bị hủy");
  }
}
// end thẻ
// mở thêm nhân viên
// function openCreateAccountStaff() {
//   document.querySelector(".signup").classList.add("open");

//   // Ẩn các phần tử liên quan đến chỉnh sửa
//   document.querySelectorAll(".edit-account-e").forEach((item) => {
//     item.style.display = "none";
//   });

//   // Hiển thị các phần tử liên quan đến thêm mới
//   document.querySelectorAll(".add-account-e").forEach((item) => {
//     item.style.display = "block";
//   });

//   // Đổi nội dung tiêu đề "Thêm khách hàng mới" thành "Thêm nhân viên mới"
//   const title = document.querySelector(".add-account-e.modal-container-title");
//   if (title) {
//     title.textContent = "THÊM NHÂN VIÊN MỚI";
//   }
// }
// Mở modal thêm nhân viên
// Hàm mở modal chỉnh sửa hoặc thêm mới nhân viên
function openCreateEmployee(action, accountName) {
  resetEmployeeForm(); // Reset form mỗi khi mở modal
  editEmployee(accountName);
  document.querySelector(".modal.employee").classList.add("open");

  if (action === 'edit') {
    // Hiển thị nút "Lưu thay đổi" khi sửa nhân viên
    document.getElementById("add-employee-btn").style.display = 'none';
    document.getElementById("update-employee-btn").style.display = 'inline-block';
    
    document.getElementById("add-employee-title").style.display = 'none';
    document.getElementById("edit-employee-title").style.display = 'block';
    document.getElementById("form-submit-btn").textContent = "Lưu thay đổi";
    editEmployee(accountName); // Điền thông tin nhân viên vào form
  } else {
    // Hiển thị nút "Thêm mới" khi thêm nhân viên
    document.getElementById("add-employee-btn").style.display = 'inline-block';
    document.getElementById("update-employee-btn").style.display = 'none';
    
    document.getElementById("edit-employee-title").style.display = 'none';
    document.getElementById("add-employee-title").style.display = 'block';
    document.getElementById("form-submit-btn").textContent = "Thêm nhân viên mới";
  }
}


// Hàm điền thông tin nhân viên vào form khi sửa
function editEmployee(accountName) {
  const employees = JSON.parse(localStorage.getItem("staffs")) || [];
  const employee = employees.find(emp => emp.accountName === accountName);

  if (employee) {
    // Chỉ điền thông tin vào các trường được phép chỉnh sửa
    document.getElementById("start-date").value = employee.startDate;
    document.getElementById("end-date").value = employee.endDate || "";
    document.getElementById("branch").value = employee.branch;

    // Disable các trường không được chỉnh sửa
    document.getElementById("employee-name").value = employee.name;
    document.getElementById("employee-contact").value = employee.contact;
    document.getElementById("account-name-employee").value = employee.accountName;
    document.getElementById("password-employee").value = employee.password;
    document.getElementById("department").value = employee.department;
    document.querySelector('label[for="department"]').style.display = 'none';
    document.getElementById("department").style.display = 'none';
    document.querySelector('label[for="employee-name"]').style.display = 'none';
    document.getElementById("employee-name").style.display = 'none';
    document.querySelector('label[for="employee-contact"]').style.display = 'none';
    document.getElementById("employee-contact").style.display = 'none';

    
    document.getElementById("account-name-employee").disabled = true;
    document.getElementById("password-employee").disabled = true;

    window.employeeToEdit = employee; // Lưu thông tin nhân viên để cập nhật
  }
}


// Đóng modal và reset form
function closeEmployeeModal() {
  document.querySelector(".employee").classList.remove("open");
  resetEmployeeForm();
}

// Reset các trường trong form
function resetEmployeeForm() {
  document.querySelectorAll(".employee-form .form-control").forEach((input) => {
    input.value = "";
  });
}

// Kiểm tra tính hợp lệ của form
function validateEmployeeForm() {
  const name = document.getElementById("employee-name").value.trim();
  const contact = document.getElementById("employee-contact").value.trim();
  const startDate = document.getElementById("start-date").value.trim();
  const department = document.getElementById("department").value.trim();
  const branch = document.getElementById("branch").value.trim();
  const accountName = document.getElementById("account-name-employee").value.trim();
  const password = document.getElementById("password-employee").value.trim();

  // Kiểm tra các trường thông tin
  if (!name) {
    toast({ title: 'Thông báo', message: 'Vui lòng nhập họ và tên.', type: 'error' });
    return false;
  }
  if (!contact) {
    toast({ title: 'Thông báo', message: 'Vui lòng nhập số điện thoại.', type: 'error' });
    return false;
  }
  if (!startDate) {
    toast({ title: 'Thông báo', message: 'Vui lòng nhập ngày bắt đầu.', type: 'error' });
    return false;
  }
  if (!department) {
    toast({ title: 'Thông báo', message: 'Vui lòng chọn bộ phận.', type: 'error' });
    return false;
  }
  if (!branch) {
    toast({ title: 'Thông báo', message: 'Vui lòng chọn chi nhánh.', type: 'error' });
    return false;
  }
  if (!accountName) {
    toast({ title: 'Thông báo', message: 'Vui lòng nhập tên tài khoản.', type: 'error' });
    return false;
  }
  if (!password) {
    toast({ title: 'Thông báo', message: 'Vui lòng nhập mật khẩu.', type: 'error' });
    return false;
  }

  return true;
}

// Hàm thêm hoặc cập nhật nhân viên khi form được submit
document.getElementById("employee-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("employee-name").value;
  const contact = document.getElementById("employee-contact").value;
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value || null;
  const department = document.getElementById("department").value;
  const branch = document.getElementById("branch").value;
  const accountName = document.getElementById("account-name-employee").value;
  const password = document.getElementById("password-employee").value;

  const employees = JSON.parse(localStorage.getItem("staffs")) || [];

  // Kiểm tra trùng tài khoản hoặc số điện thoại
  if (
    (isDuplicate(accountName) && (!window.employeeToEdit || window.employeeToEdit.accountName !== accountName)) ||
    (isDuplicateContact(contact) && (!window.employeeToEdit || window.employeeToEdit.contact !== contact))
  ) {
    toast({
      title: 'Lỗi',
      message: 'Tài khoản hoặc số điện thoại đã tồn tại.',
      type: 'error'
    });
    return;
  }

  if (window.employeeToEdit) {
    // Cập nhật thông tin nhân viên
    const updatedEmployee = {
      accountName,
      name,
      contact,
      startDate,
      endDate,
      department,
      branch,
      password,
      status: 1,  // Hoạt động
    };

    const index = employees.findIndex(emp => emp.accountName === window.employeeToEdit.accountName);
    if (index !== -1) {
      employees[index] = updatedEmployee;
      localStorage.setItem("staffs", JSON.stringify(employees));
    }
    window.employeeToEdit = null; // Reset thông tin sửa
    toast({
      title: 'Thành công',
      message: 'Cập nhật thông tin nhân viên thành công.',
      type: 'success',
    });
  } else {
    // Thêm nhân viên mới
    const newEmployee = {
      accountName,
      name,
      contact,
      startDate,
      endDate,
      department,
      branch,
      password,
      status: 1,  // Hoạt động
    };
    employees.push(newEmployee);
    localStorage.setItem("staffs", JSON.stringify(employees));
    toast({
      title: 'Thành công',
      message: 'Thêm nhân viên mới thành công.',
      type: 'success',
    });
  }

  // Đóng modal và hiển thị lại danh sách
  closeEmployeeModal();
  showEmployee();
});


// Kiểm tra tài khoản đã tồn tại hay chưa
// Kiểm tra số điện thoại đã tồn tại chưa
function isDuplicateContact(contact) {
  const employees = JSON.parse(localStorage.getItem("staffs")) || [];
  return employees.some(emp => emp.contact === contact);
}
function isDuplicate(accountName) {
  const employees = JSON.parse(localStorage.getItem("staffs")) || [];
  return employees.some(emp => emp.accountName === accountName);
}


// Hàm hiển thị danh sách nhân viên
function showEmployee() {
  const employees = JSON.parse(localStorage.getItem("staffs")) || [];
  const showEmployeeDiv = document.getElementById("show-employee");
  
  showEmployeeDiv.innerHTML = ""; // Xóa danh sách hiện tại
  employees.forEach((emp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${emp.name}</td>
      <td>${emp.contact}</td>
      <td>${emp.startDate}</td>
      <td>${emp.endDate || "Chưa có"}</td>
      <td>${emp.department}</td>
      <td>${emp.branch}</td>
      <td>
        <button class="btn-edit" onclick="openCreateEmployee('edit', '${emp.accountName}')">
        <i class="fa-light fa-pen-to-square"></i>
        <button class="btn-delete" onclick="deleteEmployee('${emp.accountName}')">
          <i class="fa-regular fa-trash"></i></button>
        </button>
        <button id="btn-add-employee" class="btn-control-large" onclick="openWorkHistoryModal('${emp.contact}')">
            <i class="fa-light"></i> <span>Xem lịch sử làm việc</span>
        </button>
      </td>
    `;
    showEmployeeDiv.appendChild(row);
  });
}

window.onload = showEmployee();

// Hàm xóa nhân viên
function deleteEmployee(accountName) {
  if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
    const employees = JSON.parse(localStorage.getItem("staffs")) || [];
    const index = employees.findIndex(emp => emp.accountName === accountName);

    if (index !== -1) {
      employees.splice(index, 1);
      localStorage.setItem("staffs", JSON.stringify(employees));
      showEmployee();  // Cập nhật lại danh sách
    }
  }
}
window.onload = showCards();

//đóng nhân viên

// lịch sử làm việc
const workHistoryModal = document.getElementById("workHistoryModal");
const tableBody = document.getElementById("work-history-table-body");

// Hàm mở modal và lọc dữ liệu từ localStorage
function openWorkHistoryModal(contact) {
    const staffs = JSON.parse(localStorage.getItem("staffs")); // Lấy dữ liệu từ localStorage
    tableBody.innerHTML = ""; // Xóa dữ liệu cũ

    if (staffs && staffs.length > 0) {
        // Lọc dữ liệu theo contact
        const filteredStaffs = staffs.filter(staff => staff.contact === contact);

        if (filteredStaffs.length > 0) {
            // Thêm dữ liệu vào bảng
            filteredStaffs.forEach((staff, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${staff.branch}</td>
                        <td>${staff.startDate || "N/A"}</td>
                        <td>${staff.endDate || "N/A"}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML("beforeend", row);
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='4'>Không tìm thấy dữ liệu phù hợp</td></tr>";
        }
    } else {
        tableBody.innerHTML = "<tr><td colspan='4'>Dữ liệu trống</td></tr>";
    }

    workHistoryModal.style.display = "flex";
      // URL của API món ăn
      fetchFoods() ;

}
const apiUrl = 'http://localhost:3002/cards';  // Thay thế bằng URL API thật của bạn

// Fetch API để lấy danh sách món ăn
function fetchFoods() {
    fetch(apiUrl)
        .then(response => {
            // Kiểm tra nếu có lỗi trong phản hồi
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Chuyển đổi dữ liệu từ JSON
        })
        .then(data => {
            // Xử lý dữ liệu trả về
            console.log('Danh sách món ăn:', data);
        })
        .catch(error => {
            // Xử lý lỗi
            console.error('Có lỗi xảy ra:', error);
        });
}
// Hàm đóng modal
function closeWorkHistoryModal() {
    workHistoryModal.style.display = "none";
}

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    if (event.target === workHistoryModal) {
        closeWorkHistoryModal();
    }
}

  // đóng lịch sử làm việc

