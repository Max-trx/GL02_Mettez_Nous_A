### README - CRU Format (CRU) Parser - GL02

Description : Nous proposons un Parser construit en JavaScript qui permet la lecteur et l'analyse de fichier au format CRU. Il contient des créneaux de cours pour plusieurs matières. Les fichiers CRU sont au format suivants.

<Fichier> = 1*<Cours>
<Cours> = ‘+’ <UE> CRLF 1* <Séance>
<UE> = 2*7 ALPHA *2 DIGIT *1 ALPHA *1 <Supplément>
<Supplément> = ‘A’/’T1’/’F’/’R’
<Séance> = ‘1,’ <Type> ‘,P=’ 1*3 DIGIT ‘,’ <Caractéristique> ‘/’ CRLF
<Type> = (‘C’/’D’/’T’) (‘1’/’2’/’3’/’4’/’5’/’6’/’7’/’8’/’9’/’10’/’11’/’12’/’13’/’14’/’15’)
<Caractéristique> = ‘H=’ <Jour> WSP <Horaire> ‘,F=’ (‘ ‘/’1’/’2’/’A’/’B’) ‘,S=’ <Salle>
<Jour> = ‘L’/’MA’/’ME’/’J’/’V’/’S’
<Horaire> = *1 <Heure> ‘:’ <Minute> ‘-‘ <Heure> ‘:’ <Minute>
<Heure> = 1*2 DIGIT
<Minute> = ‘00’/’30’
<Salle> = *1 (1 ALPHA 3 DIGIT / ‘SPOR’/’EXT1’/’IUT1’)

### Installation

$ npm install

### Utilisation :

$ node caporalCli.js <command> fichierAParser 

<command> : check

-h or --help 	:	 Affiche l'aide
-t or --showTokenize :	 Affiche le résultat de la tokenization 
-s or --showSymbols :	 Affiche les étapes d'analyse

<command> : getRoom

Affiche les salles pour un cours spécifique

<command> : capacityRoom

Obtenez le nombre de sièges dans une salle spécifiée

<command> : availableSlots

Obtenez des créneaux disponibles pour une salle spécifique

<command> : freeRoom

Vérifier quelle salle est libre pour un créneau donné

<command> : exportICal

Exporter les cours vers un fichier iCalendar (.ics)

<command> : generateGraph

Obtenez les taux d'occupation des salles avec un graphique Vega-lite

<command> : gcapaRoomClassement

Obtenez et triez le nombre de places dans toutes les salles

<command> : seeAll

Voir l'entièreté des cours parser pour voir si une erreur s'y cache


### Version : 

# 0.06

- Ajout EF05

# 0.05

- Ajout EF06, EF07

# 0.04

- Ajout EF04

# 0.03

- Ajout EF01, EF02, EF03
- Ajout commande seeAll permettant le débuggage 

# 0.02

- Parser entièrement foncionnel

# 0.01

- Parse entiérement les fichiers simples du jeu de test (options -s et -t non fonctionnelle)


### Liste des contributeurs
Trarieux Maxime (maxime.trarieux@utt.fr)
Nadal Robin (robin.nadal@utt.fr)
Chabannes Thomas (thomas.chabannes@utt.fr)
Ndonkem Jean Ronald (jean.ronald.ndonkem@utt.fr)