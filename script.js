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
  document.getElementById('filmform').style.display = "none";
  document.getElementById('translucent').style.display = "none";
})

function displayFilm(film) {
  let item = document.createElement("li");
  item.setAttribute("data-id", film.id);
  // item.innerHTML =`<p><strong>${film.name}</strong><br>${film.genre}<br><img class="classification" src=${film.rating}><br>${film.length}<br>${film.release}<br>${film.score}<br>${film.watch}</p>`;
  item.innerHTML = `<p><h3><strong>${film.name}</strong></h3><br><em>${film.genre}</em><br>Score: ${film.score}</p><p><img class="classification" src=${film.rating}><br>Length: ${film.length} minutes<br>Released: ${film.release}<br>${film.watch}</p>`
  filmlist.appendChild(item);
  form.reset();

  let delButton = document.createElement("button");
  delButton.setAttribute('id', 'delete');
  let delButtonText = document.createTextNode("Delete");
  delButton.appendChild(delButtonText);
  item.appendChild(delButton);
  delButton.addEventListener("click", function(event) {
    removeData(film);
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
  loadData();
}

function loadData() {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  document.getElementById("filmlist").innerHTML = "";
  document.getElementById("factlist").innerHTML = "";
  filmListMaster.forEach(task => {
    displayFilm(task);
    
  });
  displayFacts(filmListMaster);
}

function displayFacts(films) {
  var totalFilms = 0;
  var totalTime = 0;
  var avgScore = 0;
  // const favGenre = new Map();
  var topFilm = [];
  films.forEach(item => {
    totalFilms += 1;
    totalTime += parseInt(item.length);
    avgScore += parseInt(item.score);
    // if(favGenre.has(item.genre)) {
    //   var val = favGenre.get(item.genre);
    //   favGenre.set(item.genre, val + 1);
    // } else {
    //   favGenre.set(item.genre, 1);
    // }
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
  // let item4 = document.createElement("li");

  // for(let i = 0; i < favGenre.length; i++) {
  //   console.log(favGenre)
  // }

  // var bestGenre = "";
  // var count1 = 0;
  // favGenre.forEach(item => {
  //   bestGenre += item;
  //   count1 += 1;
  //   if(count1 != favGenre.length) {
  //     bestGenre += ", ";
  //   }
  // })
  // item4.innerHTML = `<p>Favourite Genre: ${ans}`;
  // factlist.append(item4);
  let item5 = document.createElement("li");
  var bestFilms = "";
  var count2 = 0;
  topFilm.forEach(item => {
    bestFilms += item.name;
    count2 += 1;
    if(count2 != topFilm.length) {
      bestFilms += ", ";
    }
  })
  item5.innerHTML = `<p>Top Film: ${bestFilms}`;
  factlist.append(item5);
}

function removeData(entry) {
  const filmListMaster = JSON.parse(localStorage.getItem('filmListMaster')) || [];
  console.log(filmListMaster);
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

loadData();

function addFilm(name, genre, rating, length, release, score, watch) {
  var newFilm = new Film(name, genre, "resources/Classification" + rating + ".png", length, release, score, watch, Math.floor(Math.random() * 10000), Date.now());
  storeData(newFilm);
}

// addFilm("Kill Bill", "Action", "M", 108, 2012, 4, "12/4/24");
// addFilm("Scott Pilgrim Vs The World", "Action", "MA15+", 132, 2015, 5, "27/5/24");
// addFilm("Star Wars Episode IV", "Sci-Fi", "PG", 153, 2002, 4, "5/6/24");
// addFilm("Paw Patrol", "Fantasy", "G", 94, 2023, 2, "17/3/24");