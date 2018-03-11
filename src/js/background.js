// let require = require('require')
let cheerio = require('cheerio');

let axios = require('axios');

// let fetchUrl = require('fetch').fetchUrl;


async function getTours(url) {

  let showArr = [];
  console.log('STEP 1: getting HTML')
  let html = await axios('https://phish.net/tour/', {crossdomain: true });
  console.log('html', html);
//   let html = await axios.get(url)
//   let $ = cheerio.load(html.data)
 let $ = html.data;
 console.log('$', $);

  console.log('STEP 2: parsing HTML')
  $('a').each(function (i, element) {
    let show = $(element).attr('href');
    showArr.push(show)
  })
  console.log('STEP 3: filtering all links')
  let filteredArr = showArr.filter(address => typeof address === 'string').filter(address => address.startsWith('/tour'))
  // console.log('filteredArr', filteredArr)
  return filteredArr;
}



todaysShows = [];

async function getTodaysShows(storageArr) {
  // let wstream = await fs.createWriteStream('shows.txt')
  console.log('STEP 4 + 5: looping links and concatinating ')
  let dates = [];


  for (let i = 0; i < storageArr.length; i++) {
    let url = ('https://phish.net').concat(storageArr[i])
    //console.log("url", url)
    //waits to get all the shows
    let shows = await getShows(url);

    if (i === storageArr.length - 1) {
      console.log("shows", shows)
      todaysShows = shows
      let htmlStr = ''
      if(shows.length === 0) {
        htmlStr = 'No shows on this date';
      } else {
        for(let j = 0; j < shows.length; j++) {
          if(j !== 0) {
            htmlStr = '\n' + shows[j]
          } else {
            htmlStr = shows[j]
          }
        }
        console.log('htmlStr', htmlStr)
      }
      //THIS IS WHERE I NEED TO PASS THE RESULT - htmlStr to popup.js
      //HOW DO I EXPORT???
      //HOW DO I AT THAT TIME TO GET POPUP.JS TO UPDATE THE POPUP.HTML
      //SOMEHOW GET A LOADING INDICATOR IN THE SCREEN WHILE IT LOADS

      // document.getElementById('placeHere').append(htmlStr)

    }
  }
  //console.log("todays shows", todaysShows)

}


async function getShows(url) {
  let findTours = await axios.get(url)
  let body = findTours.data
  let $ = cheerio.load(body);
  let showArr = [];

  $('a').each(function(i, element){
    let show = $(element).text()
    show = show.trim()
    if(show.charAt(4) === '-' && show.charAt(7) === '-') {
      // console.log("show", show)
      showArr.push(show)
    }
  })

  let months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12'
  }

  let d = new Date();
  let n = d.toDateString();
  n = n.split(' ')


  // let today = d.slice()
  let date = `-${months[n[1]]}-${n[2]}`;

  // let today = '03-04'

  //  console.log('STEP 6: finding the date')
  for (let i = 0; i < showArr.length; i++) {

    if ((showArr[i].includes(date)) && (!todaysShows.includes(showArr[i]))) {
      console.log('TODAYS SHOW', showArr[i])

      todaysShows.push(showArr[i])
      //should this be an array to hold multiple dates?
    }
  }
  // if (todaysShows.length >= 1) {
    // console.log(todaysShows)
  // }
  //NEED TO WRITE A FILTER FUNCTION TO GET RID OF DOUBLES*******
  //WHERE ARE THE DOUBLES COMING FROM IE NESTED LOOP
  //JSON FILE BECOMES OBJECT ON IMPORT

  // fs.writeFile('shows.txt', showArr.join('\n'));
  console.log("TODAYS SHOWS FOR EXPORT", todaysShows)

  chrome.runtime.sendMessage(todaysShows)
  return todaysShows
}
async function execute () {

await getTours('https://phish.net/tour/')
  .then(function (storage) {
    getTodaysShows(storage)
  }).then(function (result) {
    // console.log('result', result)
  })
  .catch(err => console.error(err))
}

execute();
module.exports = todaysShows
