/* add your code here */
// app.js

// Run only after the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------
  // 1. Parse data coming from data/users.js and data/stocks-complete.js
  //    index.html already includes those files, so these variables exist:
  //    - userContent  (string JSON)
  //    - stockContent (string JSON)
  // ---------------------------------------------------
  const usersData = JSON.parse(userContent);   // array of users
  const stocksData = JSON.parse(stockContent); // array of stocks

  // ---------------------------------------------------
  // 2. Cache DOM elements we will reuse
  //    Change these selectors if your HTML uses different names
  // ---------------------------------------------------
  const userListEl = document.querySelector('.user-list');           // <ul> for users
  const stockListEl = document.querySelector('.stock-list');         // <ul> for stocks
  const portfolioEl = document.querySelector('.portfolio-list');     // container for user's holdings
  const userForm = document.querySelector('#user-form');             // <form> for user details  <-- check selector
  const deleteBtn = document.querySelector('#delete-user');          // delete button           <-- check selector

  // user form fields
  const userIdInput = document.querySelector('#userID');             // hidden/readonly id       <-- check selector
  const firstNameInput = document.querySelector('#firstname');       // input                    <-- check selector
  const lastNameInput = document.querySelector('#lastname');         // input                    <-- check selector
  const emailInput = document.querySelector('#email');               // input                    <-- check selector

  // stock display area (where we show selected stock info)
  const stockSymbolEl = document.querySelector('.stock-symbol');     // span/div to show symbol  <-- check selector
  const stockNameEl = document.querySelector('.stock-name');         // span/div to show name    <-- check selector
  const stockPriceEl = document.querySelector('.stock-price');       // span/div to show price   <-- check selector

  // ---------------------------------------------------
  // 3. Initial renders
  // ---------------------------------------------------
  generateUserList(usersData);
  generateStockList(stocksData);

  // ---------------------------------------------------
  // 4. Event: clicking on a user (left panel)
  //    we use event delegation so we add only ONE listener
  // ---------------------------------------------------
  userListEl.addEventListener('click', (event) => {
    handleUserListClick(event, usersData);
  });

  // ---------------------------------------------------
  // 5. Event: clicking on a stock (stock list)
  // ---------------------------------------------------
  stockListEl.addEventListener('click', (event) => {
    handleStockClick(event, stocksData);
  });

  // ---------------------------------------------------
  // 6. Event: submitting the user form (save changes)
  // ---------------------------------------------------
  if (userForm) {
    userForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleUserSave(usersData);
      // re-render list so we see updated name
      generateUserList(usersData);
    });
  }

  // ---------------------------------------------------
  // 7. Event: delete user
  // ---------------------------------------------------
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      handleUserDelete(usersData);
      generateUserList(usersData);
      clearForm();
      clearPortfolio();
    });
  }

  // =====================================================================
  // FUNCTIONS
  // =====================================================================

  // ---------------------------------------------------
  // Render the list of users on the left
  // ---------------------------------------------------
  function generateUserList(users) {
    if (!userListEl) return;
    userListEl.innerHTML = '';

    users.forEach(({ user, id }) => {
      const li = document.createElement('li');
      // format: "Lastname, Firstname"
      li.textContent = `${user.lastname}, ${user.firstname}`;
      li.id = id; // so we know which user was clicked
      li.classList.add('user-item');
      userListEl.appendChild(li);
    });
  }

  // ---------------------------------------------------
  // Handle user click in the list
  // ---------------------------------------------------
  function handleUserListClick(event, users) {
    const clicked = event.target;
    const userId = clicked.id;
    if (!userId) return;

    const userObj = users.find((u) => u.id == userId);
    if (!userObj) return;

    // 1. fill form
    populateForm(userObj);

    // 2. show portfolio
    renderPortfolio(userObj);
  }

  // ---------------------------------------------------
  // Fill the user form with data from selected user
  // ---------------------------------------------------
  function populateForm(userData) {
    if (!userData) return;
    const { id, user } = userData;

    if (userIdInput) userIdInput.value = id || '';
    if (firstNameInput) firstNameInput.value = user.firstname || '';
    if (lastNameInput) lastNameInput.value = user.lastname || '';
    if (emailInput) emailInput.value = user.email || '';
  }

  // ---------------------------------------------------
  // Show selected user's portfolio/holdings
  // NOTE: adjust "portfolio" key if your JSON uses a different name
  // ---------------------------------------------------
  function renderPortfolio(userData) {
    if (!portfolioEl) return;
    portfolioEl.innerHTML = '';

    const holdings = userData.portfolio; // <-- check this name in your users.js
    if (!holdings || !Array.isArray(holdings)) {
      portfolioEl.textContent = 'No holdings found for this user.';
      return;
    }

    holdings.forEach((holding) => {
      // expected structure: { symbol: 'AAPL', quantity: 10, ... }
      const item = document.createElement('div');
      item.classList.add('portfolio-item');

      // store symbol so clicking a holding could also show stock info (optional)
      item.dataset.symbol = holding.symbol;

      item.textContent = `${holding.symbol} — Qty: ${holding.quantity}`;
      portfolioEl.appendChild(item);
    });
  }

  // ---------------------------------------------------
  // Render the stock list
  // ---------------------------------------------------
  function generateStockList(stocks) {
    if (!stockListEl) return;
    stockListEl.innerHTML = '';

    stocks.forEach((stock) => {
      const li = document.createElement('li');
      li.textContent = `${stock.symbol} - ${stock.companyName}`;
      li.dataset.symbol = stock.symbol;
      li.classList.add('stock-item');
      stockListEl.appendChild(li);
    });
  }

  // ---------------------------------------------------
  // Handle click on stock list
  // ---------------------------------------------------
  function handleStockClick(event, stocks) {
    const symbol = event.target.dataset.symbol;
    if (!symbol) return;

    const stockObj = stocks.find((s) => s.symbol === symbol);
    if (stockObj) {
      displayStockInfo(stockObj);
    }
  }

  // ---------------------------------------------------
  // Display stock info on the right
  // ---------------------------------------------------
  function displayStockInfo(stock) {
    if (stockSymbolEl) stockSymbolEl.textContent = stock.symbol || '';
    if (stockNameEl) stockNameEl.textContent = stock.companyName || '';
    // some JSONs may use "latestPrice" or "price" — adjust to your file
    if (stockPriceEl) stockPriceEl.textContent = stock.price || stock.latestPrice || '';
  }

  // ---------------------------------------------------
  // Handle SAVE (form submit)
  // 1. read fields
  // 2. find user in array
  // 3. update values
  // ---------------------------------------------------
  function handleUserSave(users) {
    const id = userIdInput ? userIdInput.value : '';
    if (!id) return;

    const first = firstNameInput ? firstNameInput.value : '';
    const last = lastNameInput ? lastNameInput.value : '';
    const email = emailInput ? emailInput.value : '';

    const userIndex = users.findIndex((u) => u.id == id);
    if (userIndex === -1) return;

    // update in memory
    users[userIndex].user.firstname = first;
    users[userIndex].user.lastname = last;
    users[userIndex].user.email = email;
    // if you have more fields, update them here too
  }

  // ---------------------------------------------------
  // Handle DELETE
  // ---------------------------------------------------
  function handleUserDelete(users) {
    const id = userIdInput ? userIdInput.value : '';
    if (!id) return;

    const index = users.findIndex((u) => u.id == id);
    if (index === -1) return;

    // remove from array
    users.splice(index, 1);
  }

  // ---------------------------------------------------
  // Helpers to clear UI
  // ---------------------------------------------------
  function clearForm() {
    if (userIdInput) userIdInput.value = '';
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (emailInput) emailInput.value = '';
  }

  function clearPortfolio() {
    if (portfolioEl) portfolioEl.innerHTML = '';
  }
});
