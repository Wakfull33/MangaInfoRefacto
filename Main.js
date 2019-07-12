const program = require("commander");
const Xray = require('x-ray');
const x = new Xray();
const Download = require('download');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cliProgress = require('cli-progress');

const prog = require('caporal');
prog
  .version('2.0.0')
  .command('download', 'Our deploy command')
  // 'app' and 'env' are required
  // and you can pass additional environments
  .argument('<manga>', 'Manga name. BlackClover|DGrayMan|DrStone|MyHeroAcademia|OnePiece|OnePunchMan|ShingekiNoKyogin|SevenDeadlySins')
  .complete(function() {
    return ['BlackClover','DGrayMan','DrStone','MyHeroAcademia','OnePiece','OnePunchMan','ShingekiNoKyogin','SevenDeadlySins'];
  })
  .argument('<chapitre>', 'Chapter Number')
  .action(function(args) {
    ScanChapitre(args.manga, args.chapitre);
  });
prog.parse(process.argv);

function ScanChapitre(manga, chapitre) {
  const BaseURL = "http://lelscanv.com/";
  let MangaURL = "";
  switch (manga) {
    case 'BlackClover':
      MangaURL = "scan-black-clover/";
      break;
    case 'DGrayMan':
      MangaURL = "scan-d-gray-man/";
      break;
    case 'DrStone':
      MangaURL = "scan-dr-stone/";
      break;
    case 'MyHeroAcademia':
      MangaURL = "scan-my-hero-academia/";
      break;
    case 'OnePiece':
      MangaURL = "scan-one-piece/";
      break;
    case 'OnePunchMan':
      MangaURL = "scan-one-punch-man/";
      break;
    case 'ShingekiNoKyogin':
      MangaURL = "scan-shingeki-no-kyojin/";
      break;
    case 'SevenDeadlySins':
      MangaURL = "scan-the-seven-deadly-sins/";
      break;
    default:
      console.log('Manga not found');
  }

  let DownloadURL = MangaURL.substring(5);
  if (UrlExists(BaseURL + MangaURL + chapitre)){
    if (!fs.existsSync(`./${manga}/Chapitre ${chapitre}/`)) {
      const getAllPage = new Promise((resolve, reject) => {
        let url = BaseURL + MangaURL + chapitre;
        x(url, '#navigation a ',
          [{

            url: '@href',
            valeur: '@text'

          }]
        )((err, results) => {
          if (err) {
            reject(new Error(err));

          } else {
            resolve(results);
          }
        });
      });

      getAllPage.then((results) => {
        const downloadBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
        let url = `${BaseURL}mangas/${DownloadURL + chapitre}/`;
        console.log(`Start downloading Chapter ${chapitre}\n`);
        downloadBar.start(results.length - 3, 0);
        for (let i = 0; i < results.length - 3; i++) {
          if (UrlExists(`${url + i}.jpg`)) {
            //console.log(` Downloading Page ${i+1}/${results.length-3}`);
            Download(`${url + i}.jpg`, `./${manga}/Chapitre ${chapitre}`);
          }
          else if(UrlExists(`${url}0${i}.jpg`)){
            //console.log(` Downloading Page ${i+1}/${results.length-3}`);
            Download(`${url}0${i}.jpg`, `./${manga}/Chapitre ${chapitre}/`);
          }
          else{
            console.log(`${url + i}.jpg   Not Found`);
          }
          downloadBar.update(i + 1);
        }
        downloadBar.stop();
        console.log("\nDownload finished");
      });
    }
    else
    {
      console.log(`Chapiter ${chapitre} appear to be already downloaded in local.`);
    }
  }
  else{
    console.log(`Chapitre ${chapitre} seems unavailable.`);
  }
}

function UrlExists(url)
{
  let http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status!=404;
};
