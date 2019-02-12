
import React, { Component } from 'react'
import sample from 'lodash.sample'
import PropTypes from 'prop-types'
import './App.css'

const PHRASES = ['ABRICOT','ANGLE','GOUTTES','BRUN','TRANQUILLE','BRICOLAGE','RECULER','AMOUR','NANOU','PTITLOUP','HARRY POTTER','HERMIONE','HEDWIGE','QUIDDITCH','MAISON']
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const Phrase = ({phrase}) => <div className="phrase" >{phrase}</div>
const Key = ({character, feedback, onClick}) => <button className={`character ${feedback}`} title={character} onClick={()=>onClick(character)}>{character}</button>
const ResetGame = ({onClick}) => <button className="reset-game" onClick={()=>{onClick()}} >NOUVEAU JEU</button>
const HangedMan = ({trycount}) => (
						<React.Fragment>
							<svg className="hangedman" width="200" height="150">
								<g className="wood">
									<line x1="0" y1="150" x2="80" y2="150" stroke="white" strokeWidth="2" className="wood1" />
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
const Player = ({name}) => <div className="player-name">{name}</div>
const ButtonStartGame = ({onStartGame}) => <button className="btn-start-game" onClick={onStartGame} >&#x2714; Commencer la partie</button>
const PlayersAdd = ({onPlayerAdd,i,onKeyPress,onStartGame})=> (
						<React.Fragment>
							<br/>
							Joueur {i} : <input type="text" placeholder="Nom du joueur" ref={(el)=>this.myInput = el} onKeyPress={(ev)=>{if(ev.key === 'Enter') onPlayerAdd(this.myInput)}} /> <button className="btn-player-add" onClick={()=>onPlayerAdd(this.myInput)} ><span role="img" aria-label="Valider">&#x2705;</span></button>
							<br/>
							<br/>
							<ButtonStartGame onStartGame={()=>onStartGame()}/>
						</React.Fragment>
)
const PlayersInfo = ({players}) => (
						<React.Fragment>
							<div className="players-info">
								Joueurs :
								<ul>
									{players.map(
										(player,i)=> (
											<li key={i}><small>{i+1} :</small> {player}</li>
										)
									)}
								</ul>
							</div>
						</React.Fragment>
)

Phrase.propTypes = {
	phrase : PropTypes.string.isRequired
}
Key.propTypes = {
	character : PropTypes.string.isRequired,
	feedback : PropTypes.string.isRequired,
	onClick : PropTypes.func.isRequired
}
ResetGame.propTypes = {
	onClick : PropTypes.func.isRequired
}
HangedMan.propTypes = {
	trycount : PropTypes.number.isRequired
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
		players: [],
		currentPlayer:"",
		gameStarted: false
	}
	
	onStartGame=()=>{
		this.setState({gameStarted:true})
		document.addEventListener('keypress',(e)=>{this.handleCharacterGiven(e.key)})
	}
	
	/**
	 * [fonction fléchée pour garantie du this]
	*/
	onPlayerAdd = (input) => {
		const {players} = this.state
		players.push(input.value)
		this.setState({players:players})
		input.value=""
		input.focus()
	}
	
	// componentDidMount=()=> {}
	componentWillUnmount() {
		document.removeEventListener('focus')
	}
	
	/**
	 * [fonction fléchée pour garantie du this]
	*/
	resetGame=()=> {
		const {phrases,secret,matchedPhrases} = this.state
		matchedPhrases.add(secret)
		if(matchedPhrases.size === phrases.length)
			this.setState(
				(prevState) => ({
					matchedPhrases:new Set([]),
					secret: sample([...PHRASES]),
					phrase: "",
					usedLetters: new Set([]),
					matchedLetters: new Set([]),
					guesses: 0,
					win: false,
					end: false
				})
			)
		
		else {
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
		const {secret,usedLetters,letters,matchedLetters,guesses,end,win,players,currentPlayer,gameStarted} = this.state
		return (
			<div className="App">
				<header className="App-header">
					<PlayersInfo players={players}/>
					<h1 className="App-title">Jeu du pendu</h1>
					<HangedMan trycount={guesses-matchedLetters.size}/>
				</header>
				{players.length<5 && (players.length===0 || !gameStarted) ? <PlayersAdd i={players.length+1} onPlayerAdd={this.onPlayerAdd} onStartGame={this.onStartGame}/>
					: (
						<React.Fragment>
							<Phrase phrase={this.computeDisplay(secret,usedLetters)} />
							<Player name={currentPlayer}/>
							{end && win && <div className="end won">BRAVO !!</div>}
							{end && !win && <div className="end lost">PERDU !! Le mot était : {secret}</div>}
							
							{end ? <ResetGame onClick={this.resetGame} /> : (
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