const form = document.getElementById("filmform");
const filmlist = document.getElementById("filmlist");

function openForm() {
  document.getElementById('filmform').style.display = "block";
  document.getElementById('translucent').style.display = "block";
}

function closeForm() {
  document.getElementById('filmform').style.display = "none";
  document.getElementById('translucent').style.display = "none";
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  addFilm(form.elements.filmName.value, form.elements.filmGenre.value, form.elements.filmRating.value, form.elements.filmLength.value, form.elements.filmRelease.value, form.elements.filmScore.value, form.elements.filmWatch.value);
  console.log(filmList);
  document.getElementById('filmform').style.display = "none";
})

function displayFilm(film) {
  let item = document.createElement("li");
  item.setAttribute("data-id", film.id);
  item.innerHTML =`<p><strong>${film.name}</strong><br>${film.genre}<br><img class="classification" src=${film.rating}><br>${film.length}<br>${film.release}<br>${film.score}<br>${film.watch}</p>`;
  filmlist.appendChild(item);
  form.reset();
  // Setup delete button DOM elements
  let delButton = document.createElement("button");
  let delButtonText = document.createTextNode("Delete");
  delButton.appendChild(delButtonText);
  item.appendChild(delButton); // Adds a delete button to every task
  // Listen for when the delete button is clicked
  delButton.addEventListener("click", function(event) {
    item.remove(); // Remove the task item from the page when button clicked
    // Because we used 'let' to define the item, this will delete the right element
    
    // Filter out the element corresponding with the list item and store the new task list
    filmList = filmList.filter( film => film.id != item.getAttribute('data-id') )
  
    // Make sure the deletion worked by logging out the whole array
    // console.log(filmList)
  })
}

class Film {
  constructor(name, genre, rating, length, release, score, watch, id, date) {
    this.name = name;
    this.genre = genre;
    this.rating = rating;
    this.length = length;
    this.release = release;
    this.score = score;
    this.watch = watch;
    this.id = id;
    this.date = date;
  }
}

function storeData(entry) {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  filmListMaster.push(entry);
  localStorage.setItem('filmListMaster', JSON.stringify(filmListMaster));
}

function loadData() {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  filmListMaster.forEach(task => {
    console.log(task);
  });
}

// localStorage.clear();

filmList = [];

function addFilm(name, genre, rating, length, release, score, watch) {
  var newFilm = new Film(name, genre, "resources/Classification" + rating + ".png", length, release, score, watch, new Date().toISOString(), Date.now(),);
  filmList.push(newFilm);
  displayFilm(newFilm);
  // storeData(filmList);
  loadData();
}

addFilm("Kill Bill", "Action", "M", 108, 2012, 4, "12/4/24");