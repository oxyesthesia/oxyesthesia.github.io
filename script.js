const form = document.getElementById("filmform");
const filmlist = document.getElementById("filmlist");
//This value defaults to 'date', but will change when the user selects one of the sorting buttons. 
//This way, the list will rewrite itself based on whatever the user last picked (unless they refresh the page)
sortvalue = "date" 

// The following is activated when the 'Add A Film' button is selected. It brings up the form and the grey background, and prevents scrolling
function openForm() {
  document.getElementById('filmform').style.display = "block";
  document.getElementById('translucent').style.display = "block";
  document.body.classList.add("stop-scrolling");
}

// Activated when a user selects the 'Close' button on the form. Hides the form and grey background, and enables scrolling.
function closeForm() {
  document.getElementById('filmform').style.display = "none";
  document.getElementById('translucent').style.display = "none";
  document.body.classList.remove("stop-scrolling");
}

// Activated when data is successfully submitted through the form. It creates an object with the film data, hides the form/grey background and enables scrolling.
form.addEventListener("submit", function(event) {
  event.preventDefault();
  addFilm(form.elements.filmName.value, form.elements.filmGenre.value, form.elements.filmRating.value, form.elements.filmLength.value, form.elements.filmRelease.value, form.elements.filmScore.value, form.elements.filmWatch.value);
  document.getElementById('filmform').style.display = "none";
  document.getElementById('translucent').style.display = "none";
  document.body.classList.remove("stop-scrolling");
})

//This code is a modification of the class work in Week 4 - Interactive Tasklist. Instead of tasks, it's movies! Pulls the list of objects from 
// the filmListMaster (which is stored in the localStorage) and individually appends them to the empty list in the html.
function displayFilm(film) {
  let item = document.createElement("li");
  item.setAttribute("data-id", film.id);
  item.innerHTML = `<p><h3><strong>${film.name}</strong></h3><br><em>${film.genre}</em><br>Score: ${film.score}</p><p><img class="classification" src=${film.rating}><br>Length: ${film.length} minutes<br>Released: ${film.release}<br>${film.watch}</p>`
  filmlist.appendChild(item);
  form.reset();

  // Creates the individual 'delete' buttons for each data entry. Again, taken from the Interactive Tasklist class task.
  let delButton = document.createElement("button");
  delButton.setAttribute('id', 'delete');
  let delButtonText = document.createTextNode("Delete");
  delButton.appendChild(delButtonText);
  item.appendChild(delButton);
  delButton.addEventListener("click", function(event) {
    removeData(film);
  })
}

// Here's where each film's data get processed into an object, used in the addFilm() function. 
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

// Thus function runs every time there is an addition to the film list. Adds the new data to the end of the array
// (maintaining the 'Entry Date' sorting order) and then rewrites the list to display the new addition.
function storeData(entry) {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  filmListMaster.push(entry);
  localStorage.setItem('filmListMaster', JSON.stringify(filmListMaster));
  loadData();
}

// This function rewrites the film list onto the page. It firstly wipes the page of all items, then adds each item
// to a newly-made array thanks to the toSorted() function based on which sorting method was last activated.
function loadData() {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  document.getElementById("filmlist").innerHTML = "";
  document.getElementById("factlist").innerHTML = "";
    if(sortvalue == "name") {
      sortedFilms = filmListMaster.toSorted(compareName);
    } else if(sortvalue == "score") {
      sortedFilms = filmListMaster.toSorted(compareScore);
    } else if(sortvalue == "release") {
      sortedFilms = filmListMaster.toSorted(compareRelease);
    } else if(sortvalue == "genre") {
      sortedFilms = filmListMaster.toSorted(compareGenre);
    } else if(sortvalue == "rating") {
      sortedFilms = filmListMaster.toSorted(compareRating);
    } else if(sortvalue == "date") {
      sortedFilms = filmListMaster.toSorted(compareDate);
    };
    sortedFilms.forEach(task => {
      displayFilm(task);
    });
    displayFacts(filmListMaster);
}

// This function activates when a 'Delete' button has been pressed, and rifles through the stored array to find the matching
// entry based on the id value. Once a match is found, it is spliced from the array and the array is rewritten from loadData().
function removeData(entry) {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  filmListMaster.forEach(task => {
    if(task.id == entry.id) {
      var index = filmListMaster.indexOf(task);
      if (index !== -1) {
        filmListMaster.splice(index, 1);
      }
    }
  })
  localStorage.setItem('filmListMaster', JSON.stringify(filmListMaster));
  loadData();
}

// This one defines the sorting type, then rewrites the film list according to the sorting type.
function sort(type) {
  sortvalue = type;
  loadData();
}

// The next six functions are used in the toSorted() function to compare the array objects based on the defined sorting
// property. Most of them are identical, except for Score which orders them from highest to lowest, and Rating which requires
// a comparison of an array index, as the ratings are not ordered alphabetically.
function compareName(a, b) {
  if(a.name < b.name){
    return -1;
  } if(a.name > b.name){
    return 1;
  } return 0;
}

function compareScore(a, b) {
  if(a.score < b.score){
    return +1;
  } if(a.score > b.score){
    return -1;
  } return 0;
}

function compareRelease(a, b) {
  if(a.release < b.release){
    return -1;
  } if(a.release > b.release){
    return 1;
  } return 0;
}

function compareGenre(a, b) {
  if(a.genre < b.genre){
    return -1;
  } if(a.genre > b.genre){
    return 1;
  } return 0;
}

function compareRating(a, b) {
  ratingOrder = ['resources/ClassificationE.png', 'resources/ClassificationG.png', 'resources/ClassificationPG.png', 'resources/ClassificationM.png', 'resources/ClassificationMA15+.png', 'resources/ClassificationR18+.png', 'resources/ClassificationX18+.png'];
  if(ratingOrder.indexOf(a.rating) < ratingOrder.indexOf(b.rating)){
    return -1;
  } if(ratingOrder.indexOf(a.rating) > ratingOrder.indexOf(b.rating)){
    return 1;
  } return 0;
}

function compareDate(a, b) {
  if(a.date < b.date){
    return -1;
  } if(a.date > b.date){
    return 1;
  } return 0;
}

// This function finds the information for the fun facts that are displayed on the left-hand side of the page. Almost
// all of the math is in this function, except for the getMode() function which proved to be too much to incorporate
// into this function. The top half of the function grabs the datasets and adds then to variables which are then
// used in the second half of the function to calculate and display on the webpage.
function displayFacts(films) {
  var totalFilms = 0;
  var totalTime = 0;
  var avgScore = 0;
  var favGenre = [];
  var topFilm = [];
  films.forEach(item => {
    totalFilms += 1;
    totalTime += parseInt(item.length);
    avgScore += parseInt(item.score);
    favGenre.push(item.genre);
    if(topFilm.length == 0) {
      topFilm.push(item);
    } else if(item.score > topFilm[0].score) {
      topFilm.splice(0, topFilm.length);
      topFilm.push(item);
    } else if(item.score == topFilm[0].score) {
      topFilm.push(item);
    }
  })
  avgScore = Math.round((avgScore / totalFilms)*100)/100;

  let item1 = document.createElement("li");
  item1.innerHTML = `<p>Total Films: ${totalFilms}`;
  factlist.append(item1);
  let item2 = document.createElement("li");
  item2.innerHTML = `<p>Total Watch Time: ${totalTime} minutes`;
  factlist.append(item2);
  let item3 = document.createElement("li");
  item3.innerHTML = `<p>Average Film Score: ${avgScore}/5`;
  factlist.append(item3);
  let item4 = document.createElement("li");
  bestGenre = getMode(favGenre);
  item4.innerHTML = `<p>Favourite Genre(s): ${bestGenre}`;
  factlist.append(item4);
  let item5 = document.createElement("li");
  var bestFilms = "";
  var count = 0;
  topFilm.forEach(item => {
    bestFilms += item.name;
    count += 1;
    if(count != topFilm.length) {
      bestFilms += ", ";
    }
  })
  item5.innerHTML = `<p>Top Film(s): ${bestFilms}`;
  factlist.append(item5);
}

// This function will find the mode(s) of the favGenre array. Big help from CodeTour on YouTube 
// for this function, I only modified the ending to provide multiple answers if there were more than one 
// top film genre. https://www.youtube.com/watch?v=0V2Mi16xd04
function getMode(array) { 
  const obj = {};
  array.forEach(item => {
    if(!obj[item]) {
      obj[item] = 1;
    } else {
      obj[item] += 1;
    }
  });
  let highestValue = 0;
  let highestValueKey = [];

  for (let key in obj) {
    const value = obj[key];
    if(value >= highestValue) {
      highestValue = value;
      highestValueKey.push(key);
    }
  }

  var ans = "";
  var count = 0;
  highestValueKey.forEach(item => {
    ans += item;
    count += 1;
    if(count != highestValueKey.length) {
      ans += ", ";
    }
  })
  return ans;
}

// To load the data stored in localStorage upon page (re)load, the loadData() function is ran initially.
loadData();

// This function takes the information from the form (or the fillList() function below if using dev buttons) and
// creates an object for that film. It then adds runs the storeData() function, passing in that object so that
// it is added to the filmListMaster array, and therefore the localStorage.
function addFilm(name, genre, rating, length, release, score, watch) {
  var newFilm = new Film(name, genre, "resources/Classification" + rating + ".png", length, release, score, watch, Math.floor(Math.random() * 10000), Date.now());
  storeData(newFilm);
}

// This function is the first of the dev buttons at the bottom of the webpage. It basically adds a bunch of
// pre-made film details into the list for your experimentation. Yes, these are my personal scores of these films.
function fillList() {
  addFilm("Kill Bill: Volume 1", "Action", "R18+", 93, 2003, 3, "12/4/18");
  addFilm("Scott Pilgrim Vs The World", "Action", "M", 112, 2010, 5, "9/9/10");
  addFilm("La La Land", "Musical", "M", 128, 2016, 4, "24/1/17");
  addFilm("One Flew Over The Cuckoo's Nest", "Drama", "M", 135, 1975, 3, "17/3/24");
  addFilm("The Adventures of Sharkboy and Lavagirl", "Adventure", "G", 93, 2005, 4, "23/2/06");
  addFilm("Se7ev", "Thriller", "R18+", 127, 1995, 2, "30/7/22");
  addFilm("Interstellar", "Sci-Fi", "M", 169, 2014, 5, "17/4/17");
  addFilm("The Notebook", "Romance", "PG", 124, 2004, 2, "12/11/16");
  addFilm("Spirited Away", "Fantasy", "PG", 125, 2001, 4, "4/5/09");
  addFilm("Hot Fuzz", "Comedy", "MA15+", 121, 2007, 4, "3/12/16");
}

// This function is the second of the dev buttons at the bottom of the webpage. This one wipes the film list
// entirely, allowing you to start fresh.
function deleteList() {
  filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  filmListMaster = [];
  localStorage.setItem('filmListMaster', JSON.stringify(filmListMaster));
  loadData();
}
