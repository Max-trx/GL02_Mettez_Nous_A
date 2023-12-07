const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const FreeSlot = require('./Class/FreeSlot.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;

cli
	.version('cru-parser-cli')
	.version('0.07')
	// check Cru
	.command('check', 'Check if <file> is a valid Cru file')
	.argument('<file>', 'The file to check with Cru parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	  
			var analyzer = new CruParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){
				logger.info("The .Cru file is a valid Cru file".green);
			}else{
				logger.info("The .Cru file contains error".red);
			}
			
			logger.debug(analyzer.parsedCRU);
		});
	})


	//-----------------------------------------------------//
	//   SPEC02      >> Command :  capacityRoom <<         //
	//-----------------------------------------------------//

	//Affichage du nombre de place par salle
	.command('capacityRoom', 'Get the number of seats in a specified room')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<salle>','The room from which we want the info')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if(analyzer.errorCount ===0){

				let salle = args.salle.toUpperCase();
				let availableseats = 0;
				let maxAvailableSeats = 0;

				analyzer.parsedCRU.forEach(cours => {
					if (cours.salle === salle) {
						availableseats = cours.place;
						if (availableseats > maxAvailableSeats){
							maxAvailableSeats = availableseats
						}
					}
				});

				if (maxAvailableSeats !== 0) {
					logger.info('Number of available seats in salle ' + salle +' :' + maxAvailableSeats);
				}else{logger.info('No seats or no info')}
			
			}else {logger.info('Problem'.red)}
		});
	})


	// Nouvelle commande pour obtenir les salles pour un cours spécifique
	.command('GetRoom', 'Get rooms for a specific course')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<ue>', 'The course code for which you want to get rooms')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if (analyzer.errorCount === 0) {
				let ueToSearch = args.ue.toUpperCase();
				ueToSearch = "+" + ueToSearch;
				let rooms = [];
				analyzer.parsedCRU.forEach(cours => {
					if (cours.ue === ueToSearch) {
						rooms.push(cours.salle);
					}
				});

				if (rooms.length > 0) {
					logger.info('Rooms for course '+ ueToSearch+':'+ rooms);
				} else {
					logger.info('No information available for course '+ueToSearch);
				}

			} else {
				logger.info('Problem'.red);
			}
		});
	})


	//-----------------------------------------------------//
	//   SPEC03       >> Command :  AvailableSlots <<      //
	//-----------------------------------------------------//

	// Nouvelle commande pour obtenir les créneaux disponibles pour une salle spécifique
	.command('AvailableSlots', 'Get available slots for a specific room')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<salle>', 'The room for which you want to get available slots')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if (analyzer.errorCount === 0) {
				let occupiedSlots = [];
				let allSlots = [];
				let salleToSearch = args.salle.toUpperCase();
				let availableSlots = [];

				for (let hour = 8; hour <= 20; hour++) {
					for (let minute of ['00', '30']) {
						allSlots.push(`${hour}:${minute}`);
					}
				};

				analyzer.parsedCRU.forEach(cours => {
					if (cours.salle === args.salle) {
						var freeslot = FreeSlot.getInstance();
						occupiedSlots.push(cours.horaire.start, cours.horaire.end);
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,2)) === 2 | (cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,1)) === 2){
							freeslot.getMiddleTime2Hours(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,2)) === 4 | (cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,1)) === 4){
							freeslot.getMiddleTime4Hours(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,2)) === 1 && cours.horaire.end.substr(3,5) === cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1Hours(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,1) - cours.horaire.start.substr(0,1)) === 1 && cours.horaire.end.substr(3,5) === cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1Hours(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,1)) === 1 && cours.horaire.end.substr(3,5) === cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1Hours(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,2)) === 1 && cours.horaire.end.substr(3,5) != cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1HoursHalf(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,1) - cours.horaire.start.substr(0,1)) === 1 && cours.horaire.end.substr(3,5) != cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1HoursHalf(cours,occupiedSlots);
						}
						if ((cours.horaire.end.substr(0,2) - cours.horaire.start.substr(0,1)) === 1 && cours.horaire.end.substr(3,5) != cours.horaire.start.substr(3,5) ){
							freeslot.getMiddleTime1HoursHalf(cours,occupiedSlots);
						}
					}
				});

				availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));

				if (availableSlots.length > 0) {
					logger.info('Available slots for room '+salleToSearch+':'+ availableSlots.join(', '));
					
				} else {
					logger.info('No available slots for room '+salleToSearch);
				}

			} else {
				logger.info('Problem'.red);
			}
		});
	})


	// Nouvelle commande pour débugger
	.command('seeAll', 'Get rooms for a specific course')
	.argument('<file>', 'The file to check with Cru parser')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if (analyzer.errorCount === 0) {
				analyzer.parsedCRU.forEach(cours => {
					logger.info("-------------------------------------------");
					logger.info("Nom ue :"+cours.ue);
					logger.info("Nom type :"+cours.type);
					logger.info("Nom place :"+cours.place);
					logger.info("Nom salle :"+cours.salle);
					logger.info("Nom jour :"+cours.jour);
					logger.info("Nom horaire :"+cours.horaire);
					logger.info("Nom frequency :"+cours.frequency);
				});

			} else {
				logger.info('Problem'.red);
			}
		});
	})




    cli.run(process.argv.slice(2));