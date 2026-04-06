import {
  appSettings,
  app,
  auth,
  authCreateAccountWithEmail,
  authSignInWithEmail,
} from "./admin.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  get,
  child,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configuration
const GOOGLE_BOOKS_API_KEY = "AIzaSyDZ56VxOp9E3tcA22_bfz6tIex2qL8tOPs";
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

// DOM Selectors
const DOM = {
  btnCreateUser: document.getElementById("create-user"),
  btnLoginUser: document.getElementById("login-user"),
  emailInput: document.getElementById("email"),
  passwordInput: document.getElementById("password"),
  searchContainer: document.getElementById("search-container"),
  searchInput: document.getElementById("search-input"),
  searchResult: document.getElementById("search-result"),
  loggedInView: document.getElementById("logged-in-view"),
  loggedOutView: document.getElementById("logged-out-view"),
  container: document.getElementById("container"),
};

// Database
const database = getDatabase(app);
const booksInDB = ref(database, "books");

// Utility Functions
function parseSearchInput(input) {
  const parts = input.split(";").map((part) => part.trim());
  return {
    title: parts[0] || "",
    author: parts[1] && parts[1] !== "[author]" ? parts[1] : "",
    date: parts[2] || "[Date not recorded]",
  };
}

// function createBookCard(book, includeButton = false) {
//   const html = `
//     <section class="card">
//       <img src="${book.image_url}" alt="${book.title}">
//       <div class="card-right" ${includeButton ? 'id="result"' : ""}>
//         <h2>${book.title}</h2>
//         <h2>${book.author}</h2>
//         <p>${book.date}</p>
//       </div>
//     </section>
//   `;
//   return html;
// }

// Call this inside fetchDescriptionFromGoogleBooks to add description to book's database entry
async function updateBookDescriptionInDatabase(book) {
  try {
    const snapshot = await get(booksInDB);

    // Loop through all books to find a match
    snapshot.forEach((childSnapshot) => {
      const dbBook = childSnapshot.val();

      // Match by title and author
      if (dbBook.title === book.title && dbBook.author === book.author) {
        const bookRef = child(booksInDB, childSnapshot.key);
        update(bookRef, { description: book.description });
        console.log("Description updated!");
      }
    });
  } catch (error) {
    console.error("Error updating description:", error);
  }
}

// Call this inside createBookCard when book.description is missing
async function fetchDescriptionFromGoogleBooks(book) {
  console.log("Fetching description for:", book.title);
  try {
    const searchPhrase = `${book.title}+inauthor:${book.author}`;
    const query = encodeURIComponent(searchPhrase);
    const apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${query}&key=${GOOGLE_BOOKS_API_KEY}`;

    const response = await fetch(apiUrl);

    if (response.status === 429) {
      DOM.searchResult.innerHTML =
        "<h4>Too Many Requests: Please try again later.</h4>";
      return;
    }

    if (!response.ok) {
      console.log("API call failed");
      return; // Exit early if the request failed
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const firstBook = data.items[0];
      const description = firstBook.volumeInfo.description;

      if (description) {
        book.description = description; // Update the book object
        await updateBookDescriptionInDatabase(book);
      }
      // If description is undefined/null, we skip the assignment
      // and book.description stays undefined (no card description shows)
    }
  } catch (error) {
    console.log("Error fetching description:", error);
    // Silently fail—no description is okay
  }
}

// const booksBeingFetched = new Set();

async function createBookCard(book, includeButton = false) {
  // if (!book.description && !booksBeingFetched.has(book.id)) {
  //   // Only fetch if description is missing AND not already fetching the book
  //   booksBeingFetched.add(book.id);
  //   await fetchDescriptionFromGoogleBooks(book);
  //   await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
  // }
  const descriptionHtml = book.description
    ? `
      <div class="description-toggle">
        <button class="description-btn" onclick="toggleDescription(this); return false;">
          <span class="description-text">Description</span>
          <span class="triangle">▼</span>
        </button>
      </div>
      <div class="description-content" style="display: none;">
        <p>${book.description}</p>
      </div>
    `
    : "";

  const html = `
    <section class="card">
      <img src="${book.image_url}" alt="${book.title}">
      <div class="card-right" ${includeButton ? 'id="result"' : ""}>
        <h2>${book.title}</h2>
        <h2>${book.author}</h2>
        <p>${book.date}</p>
        ${descriptionHtml}
        <div id="button-slot"></div>
      </div>
    </section>
  `;
  return html;
}

// There are other ways to do this, but what's happening here is that the onclick="toggleDescription(this)"
// HTML generated when there's a description (see createBookCard() above) is a function existing in
// the global scope. It can't access code in this module's scope. window.toggleDescription makes the code
// accessible from the global scope.
window.toggleDescription = function (button) {
  const descriptionContent = button.closest(
    ".description-toggle",
  ).nextElementSibling;
  const triangle = button.querySelector(".triangle");

  if (descriptionContent.style.display === "none") {
    descriptionContent.style.display = "block";
    triangle.textContent = "▲";
  } else {
    descriptionContent.style.display = "none";
    triangle.textContent = "▼";
  }
};

function clearInput() {
  DOM.searchInput.value = "";
}

function clearDisplay() {
  DOM.container.innerHTML = "";
}

function showView(view) {
  DOM.loggedInView.style.display = view === "loggedIn" ? "block" : "none";
  DOM.loggedOutView.style.display = view === "loggedIn" ? "none" : "flex";
}

async function handleAuth(authFn) {
  const email = DOM.emailInput.value;
  const password = DOM.passwordInput.value;
  const result = await authFn(email, password);
  if (result) {
    showView("loggedIn");
    DOM.emailInput.value = "";
    DOM.passwordInput.value = "";
  }
}

// Search Google Books
async function searchGoogleBooks(searchPhrase) {
  const query = encodeURIComponent(searchPhrase);
  const apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${query}&key=${GOOGLE_BOOKS_API_KEY}`;

  try {
    const response = await fetch(apiUrl);

    if (response.status === 429) {
      DOM.searchResult.innerHTML =
        "<h4>Too Many Requests: Please try again later.</h4>";
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // DOM.searchResult.innerHTML =
      // '<h2 style="text-align: center;">No results found.</h2>';
      // No results found; let's make an entry on our own
      const bookDetails = {
        title: DOM.searchInput.value,
        author: "",
        image_url: "blank_cover.jpeg",
        date: DOM.searchDate || "[Date not recorded]",
        description: "No description available.",
      };
      // 2. Create the Card Container
      const cardContainer = document.createElement("div");
      cardContainer.className = "book-card"; // Apply your CSS here

      // 3. Fill the container with the HTML from your function
      // createBookCard is async (it used to fetch descriptions), so we must await it
      cardContainer.innerHTML = await createBookCard(bookDetails, true);

      // 4. Create the Button
      const addButton = document.createElement("button");
      addButton.textContent = "Add";
      addButton.className = "btn-add";

      // 5. ATTACH TO CARD (This is the fix!)
      const buttonSlot = cardContainer.querySelector("#button-slot");
      buttonSlot.appendChild(addButton);

      // 6. ATTACH CARD TO PAGE
      DOM.searchResult.appendChild(cardContainer);

      // 7. Add Listener
      addButton.addEventListener("click", () => addBookToDatabase(bookDetails));

      // Add an hr to separate the search results from the main book list
      // REPLACE THIS:
      // DOM.searchResult.innerHTML += "<hr>";

      // WITH THIS:
      const hr = document.createElement("hr");
      DOM.searchResult.appendChild(hr);

      return;
    }

    // Grabs only the first 4 items (or fewer if the array is small)
    for (const book of data.items.slice(0, 4)) {
      // 1. Prepare data
      const bookDetails = {
        title: book.volumeInfo.title,
        author: (book.volumeInfo.authors || []).join(", "),
        image_url: book.volumeInfo.imageLinks?.smallThumbnail || "",
        date: DOM.searchDate || "[Date not recorded]",
        description: book.volumeInfo.description || "No description available.",
      };

      // 2. Create the Card Container
      const cardContainer = document.createElement("div");
      cardContainer.className = "book-card"; // Apply your CSS here

      // 3. Fill the container with the HTML from your function
      // createBookCard is async (it used to fetch descriptions), so we must await it
      cardContainer.innerHTML = await createBookCard(bookDetails, true);

      // 4. Create the Button
      const addButton = document.createElement("button");
      addButton.textContent = "Add";
      addButton.className = "btn-add";

      // 5. ATTACH TO CARD (This is the fix!)
      const buttonSlot = cardContainer.querySelector("#button-slot");
      buttonSlot.appendChild(addButton);

      // 6. ATTACH CARD TO PAGE
      DOM.searchResult.appendChild(cardContainer);

      // 7. Add Listener
      addButton.addEventListener("click", () => addBookToDatabase(bookDetails));
    }
    // Add an hr to separate the search results from the main book list
    // REPLACE THIS:
    // DOM.searchResult.innerHTML += "<hr>";

    // WITH THIS:
    const hr = document.createElement("hr");
    DOM.searchResult.appendChild(hr);
  } catch (error) {
    console.error("Search error:", error);
    DOM.searchResult.innerHTML =
      "<h4>An error occurred. Please try again.</h4>";
  }
}

function addBookToDatabase(bookDetails) {
  push(booksInDB, bookDetails)
    .then(() => {
      alert("Book added successfully!");
      DOM.searchResult.innerHTML = "";
      clearInput();
    })
    .catch((error) => {
      console.error("Error adding book:", error);
      alert(`Error adding book: ${error.message}`);
    });
}

// Display Books from Database
onValue(booksInDB, async (snapshot) => {
  clearDisplay();

  if (!snapshot.val()) return;

  const booksArray = Object.values(snapshot.val()).reverse();
  // const booklistHtml = booksArray.map((book) => createBookCard(book)).join("");
  // Build HTML for all books. Had to refactor to use async/await. Can do it in for loop, but not in map().
  const htmlArray = [];
  for (const book of booksArray) {
    const html = await createBookCard(book);
    htmlArray.push(html);
  }

  const booklistHtml = htmlArray.join("");
  DOM.container.innerHTML = booklistHtml;
});

// Event Listeners
DOM.searchContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  const { title, author, date } = parseSearchInput(DOM.searchInput.value);
  DOM.searchDate = date; // Store for later use in searchGoogleBooks
  const searchPhrase = `${title}${author ? `+inauthor:${author}` : ""}`;
  searchGoogleBooks(searchPhrase);
});

DOM.btnCreateUser.addEventListener("click", () =>
  handleAuth(authCreateAccountWithEmail),
);
DOM.btnLoginUser.addEventListener("click", () =>
  handleAuth(authSignInWithEmail),
);

showView("loggedOut");
