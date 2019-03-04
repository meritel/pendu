
import React, { Component } from 'react'
import sample from 'lodash.sample'
import PropTypes from 'prop-types'
import './App.css'

const PHRASES = ['ABRICOT','ANGLE','GOUTTES','BRUN','TRANQUILLE','BRICOLAGE','RECULER','AMOUR','NANOU','PTITLOUP','HARRY POTTER','HERMIONE','HEDWIGE','QUIDDITCH','MAISON']
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_PLAYERS = 5

const Phrase = ({phrase}) => <div className="phrase" >{phrase}</div>
Phrase.propTypes = {
	phrase	: PropTypes.string.isRequired
}

const Key = ({character, feedback, onClick}) => <button className={`character ${feedback}`} title={character} onClick={()=>onClick(character)}>{character}</button>
Key.propTypes = {
	character: PropTypes.string.isRequired,
	feedback : PropTypes.string.isRequired,
	onClick	 : PropTypes.func.isRequired
}

const ButtonNextWord = ({onClick}) => <button className="next-word" onClick={()=>{onClick()}} >MOT SUIVANT</button>
ButtonNextWord.propTypes = {
	onClick : PropTypes.func.isRequired
}

const ButtonResetGame = ({onClick}) => <button className="reset-game" onClick={()=>{onClick()}} >NOUVELLE PARTIE</button>
ButtonResetGame.propTypes = {
	onClick : PropTypes.func.isRequired
}

const HangedMan = ({trycount}) => (
						<React.Fragment>
							<svg className="hangedman" width="200" height="150">
								<g className="wood"><line x1="0" y1="150" x2="80" y2="150" stroke="white" strokeWidth="2" className="wood1" />
									<line x1="40" y1="150" x2="40" y2="2" stroke="white" strokeWidth="2" className="wood2" />
									<line x1="40" y1="2" x2="150" y2="2" stroke="white" strokeWidth="2" className="wood3" />
									<line x1="150" y1="2" x2="150" y2="8" stroke="white" strokeWidth="2" className="wood4" />
									<line x1="40" y1="30" x2="80" y2="2" stroke="white" strokeWidth="2" className="wood5" />
								</g>
								<g className="man">
									<circle cx="150" cy="23" r="12" stroke="white" strokeWidth="2" fill="grey" className={trycount>=1?"":"hide"} />
									<line x1="150" y1="35" x2="150" y2="75" stroke="white" strokeWidth="5" className={trycount>=2?"":"hide"} />
									<line x1="150" y1="40" x2="115" y2="55" stroke="white" strokeWidth="2" className={trycount>=3?"":"hide"} />
									<line x1="150" y1="40" x2="185" y2="55" stroke="white" strokeWidth="2" className={trycount>=4?"":"hide"} />
									<line x1="150" y1="75" x2="140" y2="110" stroke="white" strokeWidth="2" className={trycount>=5?"":"hide"} />
									<line x1="150" y1="75" x2="160" y2="110" stroke="white" strokeWidth="2" className={trycount>=6?"":"hide"} />
								</g>
							</svg>
						</React.Fragment>
)
HangedMan.propTypes = {
	trycount : PropTypes.number.isRequired
}

const ButtonStartGame = ({onClick,players}) => <button disabled={players.length===0} className="btn-start-game" onClick={()=>onClick()} title="Commencer une nouvelle partie" >&#x2714; Commencer la partie</button>
ButtonStartGame.propTypes = {
	onClick	: PropTypes.func.isRequired,
	players	: PropTypes.array.isRequired
}

const ButtonAddPlayer = ({onClick}) => <button className="btn-player-add" onClick={()=>onClick()} ><span role="img" aria-label="Valider">&#x2705; Ajouter le joueur</span></button>
ButtonAddPlayer.propTypes = {
	onClick : PropTypes.func.isRequired
}

const PlayersInfo = ({players,currentPlayer}) => (
						<React.Fragment>
							<div className="players-info">
								<u>Joueurs</u> :
								<ul>
									{players.map(
										(player,i)=> (
											<li key={i} className={(currentPlayer===player)?'playing':'waiting'}>{player}</li>
										)
									)}
								</ul>
							</div>
						</React.Fragment>
)
PlayersInfo.propTypes = {
	players 		: PropTypes.array.isRequired,
	currentPlayer 	: PropTypes.string.isRequired
}

class App extends Component {
	state = {
		phrases : [...PHRASES],				// Array des mots à trouver
		matchedPhrases : new Set([]),	// Mots trouvés pour l'ensemble de la partie
		secret: sample([...PHRASES]),		// Le mot à trouver pour la partie en cours
		phrase:"",						// Clavier virtuel indiquant les lettres trouvées(/restantes à trouver)
		usedLetters: new Set([]),		// Lettres déjà utilisées pour la partie en cours
		matchedLetters: new Set([]),	// Lettres trouvées pour la partie en cours
		letters: LETTERS.split(''),		// Lettres disponibles
		guesses: 0,						// Nombre de tentatives
		win: false,						// indicateur : partie gagnée
		end: false,						// indicateur : partie perdue,
		players: [],					// tableau des joueurs
		currentPlayer:"",				// joueur en cours
		gameStarted: false				// si le jeu a démarré
	}
	
	// [fonction fléchée pour garantie du this]
	startGame=()=>{
		const {players} = this.state
		if(players.length===0) return alert('Ajouter au moins un joueur')
		this.setState({
			gameStarted:true,
			currentPlayer:sample(players)
		})
		document.addEventListener('keypress',(e)=>{this.handleCharacterGiven(e.key)})
	}
	
	// [fonction fléchée pour garantie du this]
	addPlayer = () => {
		const {players} = this.state
		let input = this.myInput
		if(input.value === "") return
		if(players.includes(input.value)) return alert('Ce nom est déjà pris.')
		players.push(input.value)
		this.setState({players:players})
		if(players.length === MAX_PLAYERS) return this.startGame()
		input.value=""
		input.focus()
	}
	
	// componentDidMount=()=> {}
	componentWillUnmount() {
		document.removeEventListener('focus')
	}
	
	// [fonction fléchée pour garantie du this]
	nextWord=()=> {
		const {phrases,secret,matchedPhrases} = this.state
		matchedPhrases.add(secret)
		let difference = new Set(phrases)
		for(var elem of matchedPhrases) difference.delete(elem)
		this.setState(
			(prevState) => ({
				secret: sample([...difference]),
				phrase: "",
				usedLetters: new Set([]),
				matchedLetters: new Set([]),
				guesses: 0,
				win: false,
				end: false
			})
		)
	}
	
	// [fonction fléchée pour garantie du this]
	resetGame=()=> {
		this.setState(
			(prevState) => ({
				matchedPhrases:new Set([]),
				secret: sample([...PHRASES]),
				phrase: "",
				usedLetters: new Set([]),
				matchedLetters: new Set([]),
				guesses: 0,
				win: false,
				end: false,
				players: [],
				currentPlayer:"",
				gameStarted: false
			}),
			()=>document.removeEventListener('keypress')
		)
	}
	
	/**
	 * Défini une classe css à utiliser pour la représentation visuelle des caractères selon qu'ils soient 'clicked and lost', 'clicked and found', ou pas encore clicked
	 * @param `character` le caractère à tester
	 * @return {*} string : nom de la classe css a utiliser pour styler le caractère du clavier virtuel
	*/
	getFeedbackForKey(character) {
		const {usedLetters,matchedLetters} = this.state
		return (usedLetters.has(character) ? (matchedLetters.has(character) ? 'found' : 'clicked') :'')
	}
	/**
	 * [fonction fléchée pour garantie du this lors du clic]
	 * Met à jour le state selon le caractère joué => nb de tentative (pendu se dessinne si perdu), state.win et/ou state.end pour l'avancement de la partie
	 * @param  {*} `character` le caractère à tester
	*/
	handleCharacterGiven = character => {
		character = character.toUpperCase()
		const {letters,secret,usedLetters,matchedLetters,guesses,end} = this.state
		if(end || usedLetters.has(character) || !letters.includes(character)) return
		
		usedLetters.add(character)
		if((secret.replace(' ','')).split('').includes(character)) {
			matchedLetters.add(character)
		}
		this.setState({
			guesses: guesses+1,
			win: matchedLetters.size === (new Set(secret.replace(' ','').split('')).size) && usedLetters.size-matchedLetters.size <= 6,
			end: matchedLetters.size === (new Set(secret.replace(' ','').split('')).size) || usedLetters.size-matchedLetters.size === 6
		})
	}
	
	computeDisplay(phrase, usedLetters) {
		return phrase.replace(/\w/g,
			(letter) => (usedLetters.has(letter) ? letter : '_')
		)
	}
	
	render() {
		const {secret,usedLetters,letters,matchedLetters,guesses,matchedPhrases,phrases,end,win,players,currentPlayer,gameStarted} = this.state
		return (
			<div className="App">
				<header className="App-header">
					<PlayersInfo players={players} currentPlayer={currentPlayer}/>
					<h1 className="App-title">Jeu du pendu</h1>
					<HangedMan trycount={guesses-matchedLetters.size}/>
				</header>
					{/*si aucun joueur n'est défini, et que le jeu n'est pas démarré, on propose d'ajouter jusqu'à MAX_PLAYERS joueur(s). Ensuite, on démarre la partie*/}
				{(players.length===0 || !gameStarted) ? 
					(
						<React.Fragment>
							<br/>
							Joueur {players.length+1} {players.length+1===MAX_PLAYERS?'(dernier) ':''}: 
							<input type="text" placeholder="Nom du joueur" ref={(el)=>this.myInput = el} onKeyPress={(ev)=>{if(ev.key === 'Enter') this.addPlayer()}} /> <ButtonAddPlayer onClick={this.addPlayer} />
							<br/>
							<br/>
							<ButtonStartGame onClick={this.startGame} players={players}/>
						</React.Fragment>
					)
					: 
					(
						<React.Fragment>
							<Phrase phrase={this.computeDisplay(secret,usedLetters)} />
							{end && win && <div className="end won">BRAVO !!</div>}
							{end && !win && <div className="end lost">PERDU !! Le mot était : {secret}</div>}
							
							{end ? 
								(matchedPhrases.size === phrases.length) ? <ButtonResetGame onClick={this.resetGame} /> : <ButtonNextWord onClick={this.nextWord} />
								
								: (
								<React.Fragment>
									<div className="keyboard">
										{letters.map(
											(character,i)=> (
												<React.Fragment key={i}>
													{i === Math.round(letters.length/2) && <br/>}
													<Key character={character} onClick={this.handleCharacterGiven} feedback={this.getFeedbackForKey(character)} key={i}  />
												</React.Fragment>
											)
										)}
									</div>
								</React.Fragment>
							)}
						</React.Fragment>
					)
				}
			</div>
		);
	}
}
export default App;