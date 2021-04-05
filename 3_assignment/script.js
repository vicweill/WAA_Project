
//search URL:
// I choose Interstellar as the movie, so I first searched it in the TMDB website with the movieURL
// On this first webpage I took the movie ID to create the URL to find the casting and the crew
var API_KEY = '68579335e7a4c5ded7a97e3e14bc036d';
var BASE_IMAGE = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2";
var BASE_MOVIE = "https://api.themoviedb.org/3/search/movie?api_key=";
var BASE_CAST = "https://api.themoviedb.org/3/movie/529107/credits?api_key=";
var BASE_PEOPLE = "https://api.themoviedb.org/3/person/";
var END_PEOPLE = "/movie_credits?api_key=68579335e7a4c5ded7a97e3e14bc036d&language=en-US";
var LANGUAGE = "&language=en-US";
var MOVIE_QUERY = "&query=interstellar&page=1";

var movieURL = BASE_MOVIE+API_KEY+LANGUAGE+MOVIE_QUERY
var castURL = BASE_CAST+API_KEY+LANGUAGE

var casting;
var peopleCast;
var peopleCrew;
var movieData;

// Loading the last part :
var endName;
var endPhotoURL;
var endId;

// Load the page and the data when we launch the webpage :
getData(movieURL);
getCasting(castURL);


function getData(url){
	// Use fetch() to make the request to the API
	fetch(url).then(OnSuccess, onFailure).then(TopDisplay);
}


function getCasting(url){
	fetch(url).then(OnSuccess, onFailure).then(GetCast);
}

// Get the casting of Interstellar
function GetCast(response){
	// Just catch the json from the fetch to keep values in a variable

	console.log("CAST has been imported successfully !");
	console.log(response);
	casting = response.cast;
}

// Get info about the person we get
function GetPeopleData(response){
	console.log("Data about this person has been imported successfully !");
	console.log(response);
	peopleCast = response.cast;
	peopleCrew = response.crew;
}


function TopDisplay(response){
	// Get the data from TMBD about Interstellar and display the top of the page

	console.log("Movie data has been imported successfully !");
	console.log(response);
	var posterURL = BASE_IMAGE+response.results[0].poster_path;

	document.getElementById("div1").innerHTML += "<img class='poster' src ="+posterURL+"></img>";
	
	// Can't put everything on different lines...
	document.getElementById("div1").innerHTML += "<h3>"+ response.results[0].title +"</h3><ul class='list'><li> Overview : "+ response.results[0].overview +"</li><li> Release Date : "+ response.results[0].release_date +"</li><li> Average rating : "+ response.results[0].vote_average +"/10</li></ul>";
}

function GetMovieData(response){
	console.log("2nd movie data has been imported successfully !");
	console.log(response);
	movieData = response.results;

	// Call the display function here to avoid the event loop problems
	// With the event loop, the DisplayEnd() was called before the fetch had
	// stored the data in the movieData variable
	// So nothing was displayed...
	DisplayEnd();
}


function DisplayQuestion2(name, URL, id){
	// Display new divs : 
	// - photo of the director/actor and his/her name
	// - new question/new form
	
	var peopleURL = BASE_PEOPLE + id + END_PEOPLE;
	fetch(peopleURL).then(OnSuccess, onFailure).then(GetPeopleData);

	document.getElementById("Q2").innerHTML = "<img class='portrait' src ="+URL+"></img><h3>"+name+"</h3>";
	document.getElementById("Q2").innerHTML += "<form><p>Could you name a movie that she/he directed or played in ?</p><input type='search' id='input2'></input><div class='submit'><button class='btn-grad' onclick='Question2();return false;'>SUBMIT</button><div id='A2'></div></div></form>";
}


function DisplayEnd(){
	document.getElementById("quizzDiv").innerHTML += "<div id='endDisplay' class='bloc'></div>";
	document.getElementById("endDisplay").innerHTML = "<img class='poster' src ="+endPhotoURL+"></img>";
	document.getElementById("endDisplay").innerHTML += "<h3>"+ movieData[0].title +"</h3><ul class='list'><li> Overview : "+ movieData[0].overview +"</li><li> Release Date : "+ movieData[0].release_date +"</li><li> Average rating : "+ movieData[0].vote_average +"/10</li></ul>";
	document.getElementById("endDisplay").innerHTML += "<div id='resetDiv' class='bloc reset'><button class='btn-reset' onclick='Reset();return false;'>RESET</button></div>";
}


function Question1(){
	// Check if the input is an actor or a director
	// At the end, call (or not) the display of the second question
	var answer = document.getElementById("Q1").value;
	var isRight = 0;
	var name;
	var photoURL;
	var id;

	for (let i = 0; i < casting.length; i++) {
		if(isRight != 1){
			// Check if the name is good with upper case function to make it insensitive
			if(casting[i].name.toUpperCase() == answer.toUpperCase()){
				if(casting[i].known_for_department === 'Directing' || casting[i].known_for_department === 'Acting'){
					isRight = 1;
					console.log("Correct answer");
					
					// Here are 3 variables useful for the next part :
					name = casting[i].name;
					photoURL = BASE_IMAGE + casting[i].profile_path;
					id = casting[i].id;
				}
			}
		}
	}

	if(isRight==0) {
		document.getElementById("A1").innerHTML = "<p class='false'>Your answer is wrong... Try again</p>";
	}
	if(isRight==1) {
		document.getElementById("A1").innerHTML = "<p class='true'>You're right ! Let's head to the next part</p>";
		DisplayQuestion2(name,photoURL, id);
	}
}


function Question2(){
	// Get the answer of the second question and ask TMDB
	var answer = document.getElementById("input2").value;
	var isRight = 0;
	var name;

	// Check if the movie is different than the first one first
	// Still in uppercase to make it insensitive
	if(answer.toUpperCase() !== 'INTERSTELLAR'){
		for (let i = 0; i < peopleCast.length; i++) {
			if(isRight != 1){
				// Check if the name is good with upper case function to make it insensitive
				if(peopleCast[i].title.toUpperCase() == answer.toUpperCase()){
					isRight = 1;
					console.log("Correct answer");

					// Here are 3 variables useful for the final display :
					name = peopleCast[i].title;
					endName = peopleCast[i].title;
					endPhotoURL = BASE_IMAGE + peopleCast[i].poster_path;
					endId = peopleCast[i].id;
				}
			}
		}
	
		// If it's not in the cast part, it could be in the crew part of the JSON
		if(isRight != 1){
			for (let i = 0; i < peopleCrew.length; i++) {
				// Check here to stop to avoid the overriding if it continues to go into the loop
				if(isRight != 1){
					// Check if the name is good with upper case function to make it insensitive
					if(peopleCrew[i].title.toUpperCase() == answer.toUpperCase()){
						isRight = 1;
						console.log("Correct answer");

						// Here are 3 variables useful for the final display :
						name = peopleCrew[i].title;
						endName = peopleCrew[i].title;
						endPhotoURL = BASE_IMAGE + peopleCrew[i].poster_path;
						endId = peopleCrew[i].id;						
					}
				}
			}
		}
	}
	

	if(isRight==0) {
		document.getElementById("A2").innerHTML = "<p class='false'>Your answer is wrong... Try again</p>";
	}
	if(isRight==1) {
		document.getElementById("A2").innerHTML = "<p class='true'>You're right ! Let's head to the next part</p>";

		// Create the fetch here to execute a new display function with the data of the guessed movie
		var movieURL = BASE_MOVIE+API_KEY+LANGUAGE+"&query="+name+"&page=1"
		fetch(movieURL).then(OnSuccess, onFailure).then(GetMovieData);
	}
}

function Reset(){
	document.getElementById("A1").innerHTML = "";
	document.getElementById("Q2").innerHTML = "";
	document.getElementById("endDisplay").remove();
	document.getElementById("resetDiv").remove();
}

function OnSuccess(response){
  return response.json();
}


function onFailure(err){
  console.log('Error : ' + err);
}
