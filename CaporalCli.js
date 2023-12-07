const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');

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


	//Affichage du nombre de place par salle
	.command('Capacite', 'Get the number of seats in a specified room')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<salle>','The room from which we want the info')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if(analyzer.errorCount === 0){

				let salle = args.salle.toUpperCase();
				let availableseats = 0;

				analyzer.parsedCRU.forEach(cours => {
					if (cours.salle === salle) {
						availableseats = cours.place;
					}
				});

				if (availableseats !== 0) {
					logger.info('Number of available seats in salle ' + salle +' :' + availableseats);
				}else{logger.info('No seats or no info')}
			
			}else {logger.info('Problem'.red)}
		});
	})

	//Voir quelles salles sont libres pour un créneau donné
	.command('Libre', 'Check which room is free for a given time')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<Jour>', 'The day of the given time')
	.argument('<start>', 'Start time of the time slot (XX:XX)')
	.argument('<end>', 'End time of the time slot (XX:XX)')
	.action(({args.file, options, logger}) => {
		//on cherche à vérifier le format d'une heure sous forme (XX:XX)
		const isValidTimeFormat = (time) => {
			const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
			return timeRegex.test(time);
		};

		// Vérification du format des arguments start et end
		if (!isValidTimeFormat(args.start) || !isValidTimeFormat(args.end)) {
			logger.error('Invalid time format. Please use the format XX:XX for start and end.');
			return;
		}

		fs.readFile(args.file, 'utf8', function (err,data){
			if (err) {
				return logger.warn(err);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if(analyzer.errorCount === 0) {
				let jour = args.jour.toUpperCase();
				//usage de la fonction convertir en minutes pour faciliter
				function convertirEnMinutes(heure) {
					// Sépare les heures et les minutes
					const [heures, minutes] = heure.split(':').map(Number);
					const minutesTotales = heures * 60 + minutes;
					return minutesTotales;
				}
				function getSallesDisponibles(parsedCRU, jour, start, end) {
					const sallesOccupees = [];
					const coursPourJour = analyzer.parsedCRU.filter(cours => cours.jour === jour);
					//coursDisponibles regroupe tous les cours du jour en question qui ne chevauchent pas l'horaire
					const coursDisponibles = coursPourJour.filter(cours => {
						return !(convertirEnMinutes(cours.horaire.end) <= convertirEnMinutes(start) || convertirEnMinutes(cours.horaire.start) >= convertirEnMinutes(end));
					});
					//coursOccupe regroupe tous les cours du jour qui chevauchent le créneau horaire
					const coursOccupe = coursPourJour.filter(cours => {
						return convertirEnMinutes(cours.horaire.start) < convertirEnMinutes(end) && convertirEnMinutes(cours.horaire.end) > convertirEnMinutes(start);
					});
					//on ajoute les salles occupées à la liste
					coursOccupe.forEach(cours => {
						if (!sallesOccupees.includes(cours.salle)) {
							sallesOccupees.push(cours.salle);
						}
					});
					// on a la liste des salles disponibles en soustrayant les salles occupées de toutes les salles
					const toutesLesSalles = analyzer.parsedCRU.map(cours => cours.salle);
					const sallesDisponibles = toutesLesSalles.filter(salle => !sallesOccupees.includes(salle));

					return sallesDisponibles;
				}

				const sallesDisponibles = getSallesDisponibles(analyzer.parsedCRU, jour, args.start, args.end);

				logger.info(`Salles disponibles pour le jour ${jour} entre ${args.start} et ${args.end}:`);
				logger.info(sallesDisponibles);
				}
			}
	})
    cli.run(process.argv.slice(2));