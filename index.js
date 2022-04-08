// Establece variables de entorno de manera facil
require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listPlaces } = require('./helpers/inquirer.js');
const Searches = require('./models/searches.js');
const colors = require('colors/safe');



const main = async () => {

  const searches = new Searches();

  let option;



  do {

    option = await inquirerMenu();

    switch (option) {
      case 1:
        // Show message
        const searchTerm = await leerInput('Ciudad: ');

        // Look for the places
        const places = await searches.city(searchTerm);

        // Select the place
        const id = await listPlaces(places);
        if (id === '0') continue;

        const placeSelected = places.find(l => l.id === id);

        // save in DB
        searches.addHistory(placeSelected.site);
        // Weather data
        const weather = await searches.weatherSite(placeSelected.latitud, placeSelected.length)

        console.log(colors.green('\nCity information\n'));
        console.log('City:', placeSelected.site);
        console.log('Lat:', placeSelected.latitud);
        console.log('Lng:', placeSelected.length);
        console.log(`Description: ${weather.desc}`);
        console.log(`Temperature: ${weather.temp}`);
        console.log(`Minimum temperature: ${weather.min}`);
        console.log(`Maximum temperature: ${weather.max}`);


        break;
      case 2:
        searches.historyCapitalize.forEach((elto, i)=>{
          const idx = colors.green(i+1+'.');
          console.log(`${idx} ${elto}`);
        });
        break;
    }
    await pausa();

  } while (option !== 0);

}

main();