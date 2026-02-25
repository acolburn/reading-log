console.log("1index.js loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
console.log("2Firebase App imported successfully");
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
console.log("3firebase-database imorted");
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
console.log("4firebase-auth imported");

const appSettings = {
  apiKey: "AIzaSyCK6qpeB-3TfIPoyQ2cQZ_kp7QJrOs4RD4",
  authDomain: "test-project-b83e9.firebaseapp.com",
  databaseURL: "https://test-project-b83e9-default-rtdb.firebaseio.com",
  projectId: "test-project-b83e9",
  storageBucket: "test-project-b83e9.firebasestorage.app",
  messagingSenderId: "1072857068612",
  appId: "1:1072857068612:web:75e89df3d722d593cfb811",
};

const GOOGLE_BOOKS_API_KEY = "AIzaSyDZ56VxOp9E3tcA22_bfz6tIex2qL8tOPs"; // for google books

const app = initializeApp(appSettings); // initialize firebase
console.log(`app: ${app}`);
const auth = getAuth(app);
console.log(`auth: ${auth}`);
const database = getDatabase(app);
console.log(`database: ${database}`);
const booksInDB = ref(database, "books");

const btnCreateUser = document.getElementById("create-user");
const btnLoginUser = document.getElementById("login-user");
const emailInputEl = document.getElementById("email");
const passwordInputEl = document.getElementById("password");
const searchContainer = document.getElementById("search-container");

const searchResult = document.getElementById("search-result");
const loggedInView = document.getElementById("logged-in-view");
const loggedOutView = document.getElementById("logged-out-view");
let searchArray = [];

// Parses date from input text
function getDate() {
  let date = "";
  if (searchArray.length > 2) {
    date =
      searchArray[2].trim() != ""
        ? searchArray[2].trim()
        : "[Date not recorded]";
  } else {
    date = "[Date not recorded]";
  }
  return date;
}

//Begin Database Search
// Event listener triggered when Search button clicked
// Input text parsed into title, author, (and date)
// then used to create phrase for searching Google Books
searchContainer.addEventListener("submit", function (e) {
  e.preventDefault();
  let title = "";
  let author = "";
  const searchInput = document.getElementById("search-input").value;
  searchArray = searchInput.split(";");
  if (searchArray.length > 0) {
    title = searchArray[0].trim();
  }
  if (searchArray.length > 1) {
    author = searchArray[1].trim() != "[author]" ? searchArray[1].trim() : "";
  }
  const searchPhrase = `${title}+inauthor:${author}`;
  searchGoogleBooks(searchPhrase);
});

// searchPhrase is phrase created above for searching Google Books
async function searchGoogleBooks(searchPhrase) {
  const query = encodeURIComponent(searchPhrase);
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_BOOKS_API_KEY}`;
  const dateBookRead = getDate();

  // Fetch the data from the Google Books API
  let response = await fetch(apiUrl);
  if (response.status === 429) {
    searchResult.innerHTML =
      "<h4>Too Many Requests: Please try again later.</h4>";
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let data = await response.json();
  console.log(data.items);

  if (data.items && data.items.length > 0) {
    const firstItem = data.items[0];
    const bookDetails = {
      title: firstItem.volumeInfo.title,
      author: firstItem.volumeInfo.authors.join(", "),
      image_url: firstItem.volumeInfo.imageLinks?.smallThumbnail || "",
      date: dateBookRead,
      description:
        firstItem.volumeInfo.description || "No description available.",
    };

    searchResult.innerHTML = `
        <section  class="card">
    	    <img src="${bookDetails.image_url}">
          <div class="card-right" id="result">
          <h2>${bookDetails.title}</h2>
          <h2>${bookDetails.author}</h3>
          <p>${bookDetails.date}</p>
        </section>`;
    // Create a new button
    const newButton = document.createElement("button");

    // Set the button's properties
    newButton.id = "add-button";
    newButton.textContent = "Add";

    // Add the button to the container in the DOM
    document.getElementById("result").appendChild(newButton);

    // Add an event listener to the dynamically created button
    newButton.addEventListener("click", function () {
      // Add result to database

      push(booksInDB, bookDetails)
        .then(() => {
          console.log("Book data pushed successfully");
          alert("Book data pushed successfully!"); // Visual feedback
          searchResult.innerHTML = "";
        })
        .catch((error) => {
          console.error("Error pushing book data:", error);
          alert("Error pushing book data: " + error.message); // Display the error
          searchResult.innerHTML = "";
        });
    });
    clearSearchDisplay();
  } else {
    searchResult.innerHTML =
      '<h2 style="text-align: center;">No results found.</h2>';
  }
}

// End Database Search

//update display:
onValue(booksInDB, function (snapshot) {
  clearDisplay();

  let booksArray = Object.values(snapshot.val());
  // reverse order from db, where new items are appended to database
  // we want new items displayed first
  booksArray = booksArray.reverse();
  const booklistHtml = booksArray
    .map(function (book) {
      return `
    <section class="card">
    	<img src="${book.image_url}">
        <div class="card-right">
        <h2>${book.title}</h2>
        <h2>${book.author}</h3>
        <p>${book.date}</p>
    </section>
    `;
    })
    .join("");

  document.getElementById("container").innerHTML = booklistHtml;
});

// btnCreateUser.addEventListener("click", authCreateAccountWithEmail);
btnCreateUser.addEventListener("click", function () {
  console.log("create user button clicked");
  const email = emailInputEl.value;
  const password = passwordInputEl.value;
  console.log("email: ", email);
  console.log("Auth instance:", auth);
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("new account created?");
      showLoggedInView();
      // clearFields()
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error code: ${errorCode}. ${errorMessage}`);
    });
});

btnLoginUser.addEventListener("click", authSignInWithEmail);
function authSignInWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(`Logged in successfully, ${user}`);
      showLoggedInView();
      // clearFields()
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error code: ${errorCode}. ${errorMessage}`);
    });
}

function clearSearchDisplay() {
  document.getElementById("search-input").value = "";
}

function clearDisplay() {
  document.getElementById("container").innerHTML = "";
}

function showLoggedInView() {
  // search form visible when logged in
  loggedInView.style.display = "block";
  loggedOutView.style.display = "none";
}

function showLoggedOutView() {
  //login view form visible when logged out
  loggedInView.style.display = "none";
  loggedOutView.style.display = "flex";
}

showLoggedOutView();
