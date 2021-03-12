var http = require('http');
const BibleScraper = require("bible-scraper");


(async () => {
    // Create a NIV instance
    const niv = new BibleScraper(111);
    var verse = await niv.verse("2CO.13.1");
    console.log(verse.content);

    http.createServer(function (req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(verse.content);
    }).listen(8080);
    console.log('donesy done');
})();