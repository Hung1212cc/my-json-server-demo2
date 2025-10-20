//class sản phẩm
class Product {
  constructor(id, name, price, image, category, hot, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.category = category;
    this.hot = hot;
    this.description = description;
  }
  // Hàm format giá kiểu VNĐ
  formatPrice() {
    return this.price.toLocaleString('vi-VN') + " ₫";
  }
  render() {
    return `
      <div class="product">
        <img src="${this.image}">
        <a href="detail.html?id=${this.id}">
          <h4>${this.name}</h4>
        </a>
        <p>Giá: ${this.formatPrice()}</p>
        <button class="buy-btn">Mua ngay</button>
      </div>
    `;
  }
  renderDetail() {
    return `
      <div>
        <img src='${this.image}'>
        <div>
          <h2>${this.name}</h2>
          <p>Giá: ${this.formatPrice()}</p>
          <span>${this.description}</span>
          <button id="addCartBtn" productId="${this.id}">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    `;
  }
}
//show trang chủ
const productHot = document.getElementById('product-hot');
const productLaptop = document.getElementById('product-laptop');
const productDienThoai = document.getElementById('product-dienthoai');
if (productHot) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      const dataHot = data.filter(p => p.hot == true);
      const dataLaptop = data.filter(p => p.category === "laptop");
      const dataPhone = data.filter(p => p.category === "điện thoại");

      renderProduct(dataHot, productHot);
      renderProduct(dataLaptop, productLaptop);
      renderProduct(dataPhone, productDienThoai);
    });
}
//show trang sản phẩm
const productAll = document.getElementById('all-products');
const searchInput = document.getElementById('search-input');
const sortPrice = document.getElementById('sort-price');
let allProductsData = [];
if (productAll) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      renderProduct(data, productAll);
      allProductsData = data;
    });
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredProducts = allProductsData.filter(
        p => p.name.toLowerCase().includes(keyword)
      );
      renderProduct(filteredProducts, productAll);
    });
  }
  if (sortPrice) {
    sortPrice.addEventListener('change', (e) => {
      if (e.target.value === "asc") {
        allProductsData.sort((a, b) => a.price - b.price);
      } else if (e.target.value === "desc") {
        allProductsData.sort((a, b) => b.price - a.price);
      }
      renderProduct(allProductsData, productAll);
    });
  }
}
//Hàm render
const renderProduct = (array, theDiv) => {
  let html = "";
  array.forEach((item) => {
    const product = new Product(
      item.id,
      item.name,
      item.price,
      item.image,
      item.category,
      item.hot,
      item.description
    );
    html += product.render();
  });
  theDiv.innerHTML = html;
}
// trang chi tiết
const productDetailDiv = document.getElementById('detail-product');
if (productDetailDiv) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  fetch(`http://localhost:3000/products/${id}`)
    .then(response => response.json())
    .then(data => {
      const product = new Product(
        data.id,
        data.name,
        data.price,
        data.image,
        data.category,
        data.hot,
        data.description
      );
      productDetailDiv.innerHTML = product.renderDetail();
    });
}
// Giỏ hàng
class Cart {
  constructor() {
    this.items = (JSON.parse(localStorage.getItem('cart')) || []).map(item => ({
      ...item,
      id: String(item.id)
    }));
  }
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    updateCartCount();
  }
  addItem(product) {
    const idStr = String(product.id);
    const existingItem = this.items.find(item => item.id === idStr);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.items.push({ ...product, id: idStr, quantity: 1 });
    }
    this.save();
  }
  removeItem(id) {
    const idStr = String(id);
    this.items = this.items.filter(item => item.id !== idStr);
    this.save();
  }
  updateQuantity(id, quantity) {
    const idStr = String(id);
    const item = this.items.find(i => i.id === idStr);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(idStr);
      } else {
        this.save();
      }
    }
  }
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
  getCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
}
const cart = new Cart();
// Cập nhật số lượng lên header
function updateCartCount() {
  const cartCountSpan = document.getElementById('cartCount');
  if (cartCountSpan) {
    cartCountSpan.innerText = cart.getCount();
  }
}
// Render giỏ hàng
function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  const cartTotalSpan = document.getElementById('cart-total');
  if (!cartItemsDiv || !cartTotalSpan) return;
  if (cart.items.length === 0) {
    cartItemsDiv.innerHTML = `<tr><td colspan="6" style="text-align:center">Giỏ hàng trống</td></tr>`;
    cartTotalSpan.innerText = "0 ₫";
    return;
  }
  cartItemsDiv.innerHTML = cart.items.map(item => `
    <tr>
      <td><img src="${item.image}" style="width:60px"></td>
      <td>${item.name}</td>
      <td>${item.price.toLocaleString('vi-VN')} ₫</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="qty-input">
      </td>
      <td>${(item.price * item.quantity).toLocaleString('vi-VN')} ₫</td>
      <td>
        <button class="remove-btn" data-id="${item.id}">Xóa</button>
      </td>
    </tr>
  `).join("");
  cartTotalSpan.innerText = cart.getTotal().toLocaleString('vi-VN') + " ₫";
  // Thay đổi số lượng
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const qty = parseInt(e.target.value);
      cart.updateQuantity(id, qty);
      renderCart();
    });
  });
  // Xóa sản phẩm
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      cart.removeItem(id);
      renderCart();
    });
  });
}
document.addEventListener('DOMContentLoaded', renderCart);
// Header
const header = document.createElement('header');
header.innerHTML = `
  <div class="header-logo">
    <img src="/Bai2/img/logo.jpg" alt="SHOP">
    <h1>SHOP CỦA HÙNG</h1>
  </div>
  <nav class="navbar">
    <ul>
      <li><a href="index.html">Trang chủ</a></li>
      <li><a href="product.html">Sản phẩm</a></li>
      <li><a href="#">Đã mua</a></li>
      <li><a href="#">Đăng nhập</a></li>
      <li><a href="cart.html">Giỏ hàng: <span id="cartCount">${cart.items.length}</span></a></li>
    </ul>
  </nav>
`;
document.body.prepend(header);
const footer = document.createElement('footer');
footer.innerHTML = `
  <div class="footer-container">
    <div class="footer-column">
      <h4>SHOP CỦA HÙNG</h4>
      <p>Chuyên cung cấp laptop và điện thoại chính hãng, giá tốt, bảo hành uy tín toàn quốc.</p>
    </div>
    <div class="footer-column">
      <h4>LIÊN KẾT NHANH</h4>
      <ul style="list-style:none; padding:0;">
        <li><a href="#">Trang chủ</a></li>
        <li><a href="#">Laptop</a></li>
        <li><a href="#">Điện thoại</a></li>
        <li><a href="#">Khuyến mãi</a></li>
        <li><a href="#">Liên hệ</a></li>
      </ul>
    </div>
    <div class="footer-column">
      <h4>HỖ TRỢ KHÁCH HÀNG</h4>
      <ul style="list-style:none; padding:0;">
        <li><a href="#">Chính sách bảo hành</a></li>
        <li><a href="#">Chính sách đổi trả</a></li>
        <li><a href="#">Hướng dẫn mua hàng</a></li>
        <li><a href="#">Thanh toán & vận chuyển</a></li>
      </ul>
    </div>
    <div class="footer-column">
      <h4>LIÊN HỆ</h4>
      <p>📍 123 Đường ABC, Quận ?, TP.HCM</p>
      <p>📞 0962427776</p>
      <p>✉️ support@shopcuahung.vn</p>
      <div class="footer-social">
        <a href="#" title="Facebook">📘</a>
        <a href="#" title="Instagram">📸</a>
        <a href="#" title="YouTube">▶️</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2025 SHOP CỦA HÙNG. All rights reserved.</p>
  </div>
`;
document.body.appendChild(footer);
document.addEventListener('click', function (e) {
  if (e.target && e.target.id == "addCartBtn") {
    const id = e.target.getAttribute('productId');
    fetch(`http://localhost:3000/products/${id}`)
      .then(response => response.json())
      .then(data => {
        const product = new Product(
          data.id,
          data.name,
          data.price,
          data.image,
          data.category,
          data.hot,
          data.description
        );
        cart.addItem(product);
        document.getElementById('cartCount').innerText = cart.items.length;
      });
  }
});
// ===================== ADMIN PRODUCT 
    const productList = document.getElementById('product-list');
    const openAddProductModal = document.getElementById('open-add-product-modal');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const productCategoryInput = document.getElementById('product-category');
    const productHotInput = document.getElementById('product-hot');
    const productDescriptionInput = document.getElementById('product-description');
    const closeModalBtn = document.getElementById('close-form-btn');

    class AdminProduct {
      constructor(id, name, price, image, category, hot, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.hot = hot;
        this.description = description;
      }
      //render giao diện
      render() {
        return `
          <tr>
            <td>${this.id}</td>
            <td>${this.name}</td>
            <td>${this.price.toLocaleString('vi-VN')} ₫</td>
            <td><img src="${this.image}" style="width:60px; border-radius:6px"></td>
            <td>${this.category}</td>
            <td>${this.hot ? "🔥" : ""}</td>
            <td>${this.description}</td>
            <td>
              <button class="action-button edit-button" data-id="${this.id}" title="Sửa">Sửa</button>
              <button class="action-button delete-button" data-id="${this.id}" title="Xóa">Xóa</button>
            </td>
          </tr>
        `;
      }
    }
    // ===================== Hiển thị danh sách sản phẩm ===================== //
    function renderProductList() {
      const productTbody = document.getElementById('product-tbody');
      if (!productTbody) return;

      fetch('http://localhost:3000/products')
        .then(res => res.json())
        .then(products => {
          let rows = "";
          products.forEach(item => {
            const p = new AdminProduct(
              item.id,
              item.name,
              item.price,
              item.image,
              item.category,
              item.hot,
              item.description
            );
            rows += p.render();
          });
          productTbody.innerHTML = rows;
        })
        .catch(err => console.error("Lỗi tải sản phẩm:", err));
    }
    renderProductList();
    // ===================== MỞ MODAL ===================== //
    openAddProductModal.addEventListener('click', () => {
      productModal.style.display = 'flex';
      productForm.setAttribute('data-mode', 'add');
      productForm.reset();
    });
    // ===================== ĐÓNG MODAL ===================== //
    closeModalBtn.addEventListener('click', () => {
      productModal.style.display = 'none';
      productForm.removeAttribute('data-mode');
      productForm.reset();
    });
    window.addEventListener('click', (event) => {
      if (event.target === productModal) {
        productModal.style.display = 'none';
        productForm.removeAttribute('data-mode');
        productForm.reset();
      }
    });
    // ===================== THÊM / SỬA SẢN PHẨM ===================== //
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const productData = {
        id: productIdInput.value || Date.now().toString(),
        name: productNameInput.value,
        price: parseFloat(productPriceInput.value),
        image: productImageInput.value,
        category: productCategoryInput.value,
        hot: productHotInput.checked,
        description: productDescriptionInput.value
      };
      const isEdit = productForm.getAttribute('data-mode') === 'edit';
      const url = isEdit
        ? `http://localhost:3000/products/${productData.id}`
        : 'http://localhost:3000/products';
      const method = isEdit ? 'PUT' : 'POST';
      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
        .then(() => {
          productModal.style.display = 'none';
          productForm.removeAttribute('data-mode');
          productForm.reset();
          renderProductList(); // Cập nhật danh sách
        })
        .catch(err => console.error("Lỗi khi lưu sản phẩm:", err));
    });
    // ===================== SỬA SẢN PHẨM ===================== //
    productList.addEventListener('click', (event) => {
      const btn = event.target.closest('.edit-button');
      if (btn) {
        const id = btn.getAttribute('data-id');
        productForm.setAttribute('data-mode', 'edit');
        fetch(`http://localhost:3000/products/${id}`)
          .then(res => res.json())
          .then(data => {
            productIdInput.value = data.id;
            productNameInput.value = data.name;
            productPriceInput.value = data.price;
            productImageInput.value = data.image;
            productCategoryInput.value = data.category;
            productHotInput.checked = data.hot;
            productDescriptionInput.value = data.description;
            productModal.style.display = "flex";
          })
          .catch(err => console.error("Lỗi khi tải sản phẩm:", err));
      }
    });
    // ===================== XÓA SẢN PHẨM ===================== //
    productList.addEventListener('click', (event) => {
      const btn = event.target.closest('.delete-button');
      if (btn) {
        const id = btn.getAttribute('data-id');
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
          fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' })
            .then(() => renderProductList())
            .catch(err => console.error("Lỗi khi xóa sản phẩm:", err));
        }
      }
    });
// ================= Admin: Hiển thị danh sách sản phẩm =================
function renderProductList() {
  const productTbody = document.getElementById('product-tbody');
  if (!productTbody) return;
  fetch('http://localhost:3000/products')
    .then(res => res.json())
    .then(products => {
      let rows = "";
      products.forEach(item => {
        const p = new AdminProduct(
          item.id,
          item.name,
          item.price,
          item.image,
          item.category,
          item.hot,
          item.description
        );
        rows += p.render();
      });
      productTbody.innerHTML = rows;
    })
    .catch(err => console.error("Lỗi tải sản phẩm:", err));
}
renderProductList();