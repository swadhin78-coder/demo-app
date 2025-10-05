let STORAGE_KEY = "inventoryProducts";
let ORDER_KEY = "shopOrders"; // 🔥 নতুন: অর্ডারগুলো সেভ হবে এখানে

let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {name:"Apple", price:50, qty:10, sold:0},
  {name:"Mango", price:80, qty:5, sold:0},
  {name:"Banana", price:20, qty:20, sold:0}
];

let orders = JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
let invoiceItems = [];

// Sidebar Toggle
function toggleMenu(){
  document.getElementById("sideMenu").classList.toggle("active");
}

// Owner Login
function checkLogin(){
  let pass=document.getElementById("ownerPass").value;
  if(pass==="1234"){ 
    document.body.classList.add("owner-mode"); 
    alert("Owner Mode On!"); 
  } else { 
    alert("Wrong Password"); 
  }
}

// Slider
let slideIndex = 0;
showSlides();
function showSlides() {
  let slides = document.getElementsByClassName("slide");
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  slides[slideIndex-1].style.display = "block";
  setTimeout(showSlides, 4000);
}

// Save Products
function saveProducts(){ 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); 
}

// Render Products
function renderProducts(){
  let list=document.getElementById("productList"); 
  list.innerHTML="";
  products.forEach((p,i)=>{
    let div=document.createElement("div");
    div.className="product";
    div.innerHTML=`<h3>${p.name}</h3>
      <p class="price">৳${p.price}</p>
      <p>Stock: <span class="qty">${p.qty}</span></p>
      <p>Sold: ${p.sold}</p>
      <button class="btn add" onclick="buyProduct(${i})">Buy</button>
      <button class="btn delete owner-buttons" onclick="deleteProduct(${i})">Delete</button>`;
    list.appendChild(div);
  });
}

// Add Product
function addProduct(){
  let name=document.getElementById("newName").value;
  let price=parseInt(document.getElementById("newPrice").value);
  let qty=parseInt(document.getElementById("newQty").value);
  if(name && price>0 && qty>=0){
    products.push({name,price,qty,sold:0});
    saveProducts(); renderProducts();
  }
}

// Delete Product
function deleteProduct(i){ 
  products.splice(i,1); 
  saveProducts(); renderProducts(); 
}

// Buy Product
function buyProduct(i){
  if(products[i].qty>0){
    products[i].qty--; 
    products[i].sold++;
    invoiceItems.push({name:products[i].name, price:products[i].price});
    saveProducts(); renderProducts(); showInvoice();
  } else { 
    alert("Out of Stock!"); 
  }
}

// Show Invoice
function showInvoice(){
  let invoice=document.getElementById("invoice");
  let details=document.getElementById("invoiceDetails");
  let total=0;
  details.innerHTML="";
  invoiceItems.forEach(item=>{
    details.innerHTML+=`<p>${item.name} - ৳${item.price}</p>`;
    total+=item.price;
  });
  details.innerHTML+=`<hr><strong>Total: ৳${total}</strong>`;

  // Customer Info Input
  details.innerHTML+=`
    <hr>
    <input type="text" id="custName" placeholder="Customer Name"><br>
    <input type="text" id="custPhone" placeholder="Phone Number"><br>
    <button onclick="finalizeOrder()">✅ Confirm Order</button>
  `;

  invoice.style.display="block";
}

// Finalize Order
function finalizeOrder(){
  let name=document.getElementById("custName").value;
  let phone=document.getElementById("custPhone").value;
  if(!name || !phone){
    alert("Please enter name & phone!");
    return;
  }

  let total=invoiceItems.reduce((sum,item)=>sum+item.price,0);
  let items=invoiceItems.map(i=>`${i.name} (৳${i.price})`).join(", ");

  // Save to Orders (Owner view)
  let order={name, phone, items, total, date:new Date().toLocaleString()};
  orders.push(order);
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));

  // Show Final Invoice (for printing)
  let details=document.getElementById("invoiceDetails");
  details.innerHTML=`
    <h3>Customer Invoice</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Items:</strong> ${items}</p>
    <p><strong>Total:</strong> ৳${total}</p>
    <hr>
    <button onclick="window.print()">🖨 Print Invoice</button>
  `;

  // Reset cart
  invoiceItems=[];
}

renderProducts();
function printInvoice() {
  let name = document.getElementById("custName").value || "N/A";
  let number = document.getElementById("custNumber").value || "N/A";

  let printContent = `
    <h2>Swadhin's Shop - Invoice</h2>
    <p><strong>Customer Name:</strong> ${name}</p>
    <p><strong>Phone Number:</strong> ${number}</p>
    <hr>
  `;

  invoiceItems.forEach(item => {
    printContent += `<p>${item.name} - ৳${item.price}</p>`;
  });

  let total = invoiceItems.reduce((sum, item) => sum + item.price, 0);
  printContent += `<hr><strong>Total: ৳${total}</strong>`;

  let w = window.open("", "_blank");
  w.document.write(printContent);
  w.print();
  w.close();
}
function sendToGoogleSheet() {
  let name = document.getElementById("custName").value;
  let number = document.getElementById("custNumber").value;
  let details = document.getElementById("invoiceDetails").innerText;

  let formURL = "https://docs.google.com/spreadsheets/d/1BN76RF54ZOwrBdirUIKsfMvuAzem9vjLego99CaU9Oc/edit?usp=sharing";

  let formData = new FormData();
  formData.append("entry.111111111", name);
  formData.append("entry.222222222", number);
  formData.append("entry.333333333", details);

  fetch(formURL, {
    method: "POST",
    body: formData,
    mode: "no-cors"
  }).then(() => {
    alert("✅ Order submitted successfully!");
  }).catch(() => {
    alert("❌ Failed to submit order");
  });
}

