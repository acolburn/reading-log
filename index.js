// import { booklist } from "/data.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://test-project-b83e9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const booksInDB = ref(database, "books");

//update display:
onValue(booksInDB, function (snapshot) {
  clearDisplay();

  let booksArray = Object.values(snapshot.val());
  // reverse order from db
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

function clearDisplay() {
  document.getElementById("container").innerHTML = "";
}
