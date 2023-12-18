const fs = require('fs');
const colors = require('colors');
const CruParser = require('./CruParser.js');
const FreeSlot = require('./Class/FreeSlot.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const ical = require('ical-generator').default;

const cli = require("@caporal/core").default;

cli
	.version('cru-parser-cli')
	.version('0.07')


	//-----------------------------------------------------//
	//              >> Command :  check <<                 //
	//-----------------------------------------------------//

	.command('check', 'Vérifiez si <file> est un fichier Cru valide')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.option('-s, --showSymbols', 'afficher le symbole analysé à chaque étape', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'afficher les résultats de la tokenisation', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
			
			//Créer une var analyzer contenant les cours parser
			var analyzer = new CruParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){
				logger.info("Le fichier .Cru est un fichier Cru valide".green);
			}else{
				logger.info("Le fichier .Cru contient une ou plusieurs erreur".red);
			}
			
			logger.debug(analyzer.parsedCRU);
		});
	})


	//-----------------------------------------------------//
	//   SPEC01      >> Command :  GetRoom <<              //
	//-----------------------------------------------------//

	// Nouvelle commande pour obtenir les salles pour un cours spécifique
	.command('getRoom', 'Affiche les salles pour un cours spécifique')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.argument('<ue>', 'Le code du cours pour lequel vous souhaitez obtenir les salles')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if (analyzer.errorCount === 0) {
				let ueToSearch = args.ue.toUpperCase();
				//On ajoute le + qui est au début de chaque cours dans les données parser
				ueToSearch = "+" + ueToSearch;
				let rooms = [];
				analyzer.parsedCRU.forEach(cours => {
					if (cours.ue === ueToSearch) {
						rooms.push(cours.salle);
					}
				});

				if (rooms.length > 0) {
					logger.info('Salles pour ce cours '+ ueToSearch+':'+ rooms);
				} else {
					logger.info('Pas d\'informations disponibles pour ce cours '+ueToSearch);
				}

			} else {
				logger.info('Probleme'.red);
			}
		});
	})


	//-----------------------------------------------------//
	//   SPEC02      >> Command :  capacityRoom <<         //
	//-----------------------------------------------------//

	//Affichage du nombre de place par salle
	.command('capacityRoom', 'Obtenez le nombre de sièges dans une salle spécifiée')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.argument('<salle>','La salle dont vous voulez les informations')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
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
					logger.info('Nombre de places dans cette salle ' + salle +' :' + maxAvailableSeats);
				}else{logger.info('Pas de places ou pas d\'infos')}
			
			}else {logger.info('Probleme'.red)}
		});
	})


	//-----------------------------------------------------//
	//   SPEC03       >> Command :  AvailableSlots <<      //
	//-----------------------------------------------------//

	// Nouvelle commande pour obtenir les créneaux disponibles pour une salle spécifique
	.command('availableSlots', 'Obtenez des cr\éneaux disponibles pour une salle spécifique')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.argument('<salle>', 'La salle dont vous souhaitez obtenir les cr\éneaux de libre')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			if (analyzer.errorCount === 0) {
				let occupiedSlots = [];
				let allSlots = [];
				let salleToSearch = args.salle.toUpperCase();
				let availableSlots = [];

				//On créé un tableau contenant tous les créneaux possible pour un cours
				for (let hour = 8; hour <= 20; hour++) {
					for (let minute of ['00', '30']) {
						allSlots.push(hour+":"+minute);
					}
				};

				analyzer.parsedCRU.forEach(cours => {
					if (cours.salle === args.salle) {
						var freeslot = FreeSlot.getInstance();	
						//On enlève le créneau de début et de fin
						occupiedSlots.push(cours.horaire.start,cours.horaire.end);	
						//On enlève tous les créneaux entre l'heure de début et l'heure de fin 				
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

				//On affiche le résultat en filtrant tous les créneaux par ceux non disponible
				availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));

				if (availableSlots.length > 0) {
					logger.info('Cr\éneaux libres pour cette salle '+salleToSearch+':'+ availableSlots.join(', '));
					
				} else {
					logger.info('Pas de cr\éneaux disponible pour cette salle '+salleToSearch);
				}

			} else {
				logger.info('Probleme'.red);
			}
		});
	})



	//-----------------------------------------------------//
	//   SPEC04      >> Command :  FreeRoom <<             //
	//-----------------------------------------------------//

	//Voir quelles salles sont libres pour un créneau donné
	.command('freeRoom', 'V\érifier quelle salle est libre pour un cr\éneau donné')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.argument('<Jour>', 'Le jour du cr\éneau souhait\é')
	.argument('<start>', 'Heure de d\ébut du cr\éneau (XX:XX)')
	.argument('<end>', 'Heure de fin du cr\éneau (XX:XX)')
	.action(({args, options, logger}) => {
		//on cherche à vérifier le format d'une heure sous forme (XX:XX)
		const isValidTimeFormat = (time) => {
			const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
			return timeRegex.test(time);
		};

		// Vérification du format des arguments start et end
		if (!isValidTimeFormat(args.start) || !isValidTimeFormat(args.end)) {
			logger.error('Format d\'heure invalide. Veuillez utiliser le format XX:XX pour le début et la fin.');
			return;
		}

		fs.readFile(args.file, 'utf8', function (err,data){
			if (err) {
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
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

				logger.info("Salles disponibles pour le jour "+jour+" entre "+args.start+" et "+args.end);
				logger.info(sallesDisponibles);
			};
		});
	})



	//-----------------------------------------------------//
	//   SPEC05      >> Command :  Exporter ICal <<        //
	//-----------------------------------------------------//


	.command('exportICal', 'Exporter les cours vers un fichier iCalendar (.ics)')
	.argument('<file>', 'Chemin vers le fichier de cours.')
	.action(({ args, logger }) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if(err){
				return logger.warn(err);
			}
			// Créer un nouvel objet iCalendar
			const cal = ical();

			// Ajouter chaque cours à l'objet iCalendar

			//Créer une var analyzer contenant les cours parser
			var analyzer = new CruParser(false, false);
			analyzer.parse(data);

			//Selon le jour du cours on affecte la date
			analyzer.parsedCRU.forEach(cours => {
				if (cours.jour === "L"){
					cal.createEvent({					
						start: new Date(["2023-12-11", cours.horaire.start]),
						end: new Date(["2023-12-11", cours.horaire.end]),
						summary: cours.nom,
						description: cours.description,
						location: cours.salle
					})
				}
				if (cours.jour === "MA"){
					cal.createEvent({					
						start: new Date(["2023-12-12", cours.horaire.start]),
						end: new Date(["2023-12-12", cours.horaire.end]),
						summary: cours.nom,
						description: cours.description,
						location: cours.salle
					})
				}
				if (cours.jour === "MA"){
					cal.createEvent({					
						start: new Date(["2023-12-13", cours.horaire.start]),
						end: new Date(["2023-12-13", cours.horaire.end]),
						summary: cours.nom,
						description: cours.description,
						location: cours.salle
					})
				}
				if (cours.jour === "J"){
					cal.createEvent({					
						start: new Date(["2023-12-14", cours.horaire.start]),
						end: new Date(["2023-12-14", cours.horaire.end]),
						summary: cours.nom,
						description: cours.description,
						location: cours.salle
					})
				}
				if (cours.jour === "V"){
					cal.createEvent({					
						start: new Date(["2023-12-15", cours.horaire.start]),
						end: new Date(["2023-12-15", cours.horaire.end]),
						summary: cours.nom,
						description: cours.description,
						location: cours.salle
					})
				}
			});

			// Sauvegarder l'objet iCalendar dans un fichier
			const iCalendarString = cal.toString();
			fs.writeFileSync("./EDT.ics", iCalendarString);

			logger.info(`Cours exportés dans ${args.file}`);
		})
	})


	
	//-----------------------------------------------------//
	//   SPEC06      >> Command : generateGraph  <<        //
	//-----------------------------------------------------//

	.command('generateGraph','Obtenez les taux d\'occupation des salles avec un graphique Vega-lite')
	.argument('<file>','Le fichier à vérifier avec le CruParser')
	.action(({args,options,logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if(err){
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
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

				//Code Vega
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
	})



	//-----------------------------------------------------//
	//   SPEC07  >> Command : capacityRoomClassement  <<   //
	//-----------------------------------------------------//

	.command('capaRoomClassement', 'Obtenez et triez le nombre de places dans toutes les salles')
	.argument('<file>','Le fichier à vérifier avec le CruParser')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err.red);
			}

			//Créer une var analyzer contenant les cours parser
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
	//   UNTRACKED     >> Command : seeAll  <<			   //
	//-----------------------------------------------------//

	.command('seeAll', 'Voir l\'entièreté des cours parser pour voir si une erreur s\'y cache')
	.argument('<file>', 'Le fichier à vérifier avec le CruParser')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}

			//Créer une var analyzer contenant les cours parser
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