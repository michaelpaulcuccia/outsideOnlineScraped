// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "outside";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});


// This route will retrieve all of the data
// from the scrapedData collection as a json 

app.get("/all", function(req, res) {
   db.scrapedData.find({}, function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

// in this route, the server will
// scrape data from outsideonline.com, and save it to
// MongoDB.

axios.get("https://www.outsideonline.com/").then(function(response) {
// Load the HTML into cheerio and save it to a variable
  var $ = cheerio.load(response.data);

  // An empty array to save the data that will be scraped
  var results = [];

  // With cheerio, find each class element called "c-block__title-link"
  // (i: iterator. element: the current element)
  $(".c-block__title-link").each(function(i, element) {

    // Save the text of the element in a "title" variable
    // "c-block__title-link" IS the title of articles
    var title = $(element).text();
    let articleSummary = $(element).parent().siblings('p').text();
    //console.log(siblingP);
    let imageSource = $(element).parent().parent().siblings('div').children().children().attr('data-original');
    console.log(imageSource);
    var link = $(element).attr("href");

    // Save these results in an object that will be pushed into the results array defined earlier
   db.scrapedData.insert({
      title: title,
      link: link,
      summary: articleSummary,
      image: imageSource
    });
    // Log the results once app has looped through each of the elements found with cheerio
    console.log("Article Title: " + title + "\nArticle Link: " + link + "\nArticle Summary: " + articleSummary + "\nArticle Image: " + imageSource);
  });

});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
