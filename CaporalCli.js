const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const FreeSlot = require('./Class/FreeSlot.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const {createICalendar} = require('node-ical');

const cli = require("@caporal/core").default;

cli
	.version('cru-parser-cli')
	.version('0.07')


	//-----------------------------------------------------//
	//              >> Command :  check <<                 //
	//-----------------------------------------------------//

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
	//   SPEC01      >> Command :  GetRoom <<              //
	//-----------------------------------------------------//

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



	//-----------------------------------------------------//
	//   SPEC04      >> Command :  FreeRoom <<             //
	//-----------------------------------------------------//

	//Voir quelles salles sont libres pour un créneau donné
	.command('FreeRoom', 'Check which room is free for a given time')
	.argument('<file>', 'The file to check with Cru parser')
	.argument('<Jour>', 'The day of the given time')
	.argument('<start>', 'Start time of the time slot (XX:XX)')
	.argument('<end>', 'End time of the time slot (XX:XX)')
	.action(({args, options, logger}) => {
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
			};
		});
	})



	//-----------------------------------------------------//
	//   SPEC05      >> Command :  Exporter <<             //
	//-----------------------------------------------------//

/*	.commannd('exporter','Export course schedule to iCalendar file')
	.action(({logger}) => {
		logger.info("Entrez le nom de vos cours avec des espaces entre");
		const readline = requipe('readline').createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		//C'est parti
		readline.question('Noms des cours :', (cours) => {
			const nomsDesCours = cours.split(' ');
			const parseur = new CruParser(false, false);
			const coursInconnus = nomsDesCours.filter(cours => parseur.salle([cours]));
			if(coursInconnus.length > 0) {logger.error('Cours inconnu' + coursInconnus)
		return;}
			})
			while(nomsDesCours.length>0){
				if(parser.salle([nomDesCours])) {
					readline.question('Le cours trouvé ' + nomCours + ' est-il correct ?', (reponse) =>{
						const choixValide = reponse === 'oui';

						//Choix des chéneaux
						if(choixValide){
							const creneauxPossibles = nomCours.seance
							logger.info('Creneaux possibles pour ' + nomCours + ' : ' + creneauxPossibles.join(', '))
							readline.question('Choisissez un créneaux parmi ceux proposés', (creneauxChoisi) => logger.info("Créneaux choisi pour " + nomCours + " : " + creneauxChoisi))



							readline.close()
						}else{logger.info("Veuillez entrer le nom correst du cours");}
					});
				}else{logger.error("Cours inconnu")}
			}
		
		
	
		logger.question("c'est bon ??????????", (reponse) => {
			if(reponse === 'oui') {
				const calendar = createICalendar();
				nomsDesCours.forEach((nomCours, index) => {
					start: horaire.hours, horaire.minutes;
					end: horaire.hoursEnd, horaire.minutesEnd;
					summary: nomCours;
					description: cours.type
				});
			
			logger.info("Fichier Icalendar généré")
			}else{logger.info("Coninuez alors d'ajouter des cours et des horaires")}
		},
		readline.close())

	
		})

*/

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





	//-----------------------------------------------------//
	//   SPEC07  >> Command : capacityRoomClassement  <<   //
	//-----------------------------------------------------//

	.command('capacityRoomClassement', 'Get & sort the number of seats in all rooms')
	.argument('<file>','The file to check with the parseur')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err.red);
			}

			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if(analyzer.errorCount===0) {
				let capacitees =new Map();
				analyzer.parsedCRU.forEach(cours => {
					let salle = cours.salle;
					let availableSeats = cours.place;

				if (!capacitees.has(salle)) {
					capacitees.set(salle, availableSeats);
				}else{
					let currentCapacity = capacitees.get(salle);
					if (availableSeats > currentCapacity) {
						capacitees.set(salle, availableSeats);
					}
				}
			});

			//Tri des salles
			const sortedCapacitees = new Map([...capacitees.entries()].sort((a,b)=>b[1]-a[1]));

			logger.info('Classement des salles par capacité max');
			sortedCapacitees.forEach((capacitee, salle) =>{
				logger.info(`${salle}: ${capacitee}`);
			});

			}else{logger.info('PROBLEM'.red)}


		});
	})



	//-----------------------------------------------------//
	//   SPEC06      >> Command : generateGraph  <<        //
	//-----------------------------------------------------//

	.command('generateGraph','Get rooms occupancy rates with a Vega-lite graph')
	.argument('<file>','The file to check with Parseur')
	.action(({args,options,logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if(err){
				return logger.warn(err);
			}

			var analyzer = new CruParser(false,false);
			analyzer.parse(data);

			if(analyzer.errorCount===0){
				let salleOccupations = new Map();

				analyzer.parsedCRU.forEach(cours => {
					let salle = cours.salle;
					if (salleOccupations.has(salle)){
						salleOccupations.set(salle, salleOccupations.get(salle)+1);
					}else{ salleOccupations.set(salle,1);
					}
				});

				//Calcul proportion

				let occupationRates = {};
				salleOccupations.forEach((count, salle) => {
					occupationRates[salle] = (count / analyzer.parsedCRU.length) * 100;
				});

				//Youpi Vega

				let dataPourVega = [];
				Object.keys(occupationRates).forEach(salle => {
					dataPourVega.push({salle, TauxOccupation: occupationRates[salle]});
				});

				const vegaLite = {
					"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
					"description": "Taux d'occupation des salles",
					"data":{"values":dataPourVega},
					"mark": "bar",
					"encoding":{
						"x":{"field":"salle", "type": "nominal"},
						"y":{"field":"TauxOccupation", "type":"quantitative"}
					}
				};

				const chart = vegalite.compile(vegaLite).spec;

				var runtime = vg.parse(chart);
				var view = new vg.View(runtime).renderer('svg').run();
				var mySvg = view.toSVG();
				mySvg.then(function(res){
					fs.writeFileSync("./result.svg", res)
					view.finalize();
					logger.info("%s", JSON.stringify(chart, null, 2));
					logger.info("Chart output : ./result.svg");
				})


			}else{logger.info('PROBLEM'.red);}
		});
	});


    cli.run(process.argv.slice(2));