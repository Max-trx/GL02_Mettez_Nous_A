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

			if(analyzer.errorCount ===0){

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




    cli.run(process.argv.slice(2));