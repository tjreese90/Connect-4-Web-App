'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import useSound from 'use-sound';
import './globals.css';

interface Board extends Array<Array<string | null>> {}

interface LeaderboardEntry {
	name: string;
	score: number;
}

interface PlayerNames {
	R: string;
	Y: string;
}

const ConnectFour: React.FC = () => {
	const [board, setBoard] = useState<Board>(
		Array(6)
			.fill(null)
			.map(() => Array(7).fill(null))
	);
	const [currentPlayer, setCurrentPlayer] = useState<'R' | 'Y'>('R');
	const [scores, setScores] = useState<{ [key: string]: number }>({});
	const [theme, setTheme] = useState('classic');
	const [aiEnabled, setAiEnabled] = useState(false);
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [playerNames, setPlayerNames] = useState<PlayerNames>({
		R: 'Player',
		Y: 'AI',
	});
	const [aiDifficulty, setAiDifficulty] = useState('easy');
	const [isAiTurn, setIsAiTurn] = useState(false);
	const [history, setHistory] = useState<Board[]>([]);
	const [moveCount, setMoveCount] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);

	const currentPlayerChipRef = useRef<HTMLDivElement | null>(null);

	const [playDropSound] = useSound('/sounds/drop.mp3');
	const [playWinSound] = useSound('/sounds/win.mp3');

	useEffect(() => {
		setIsHydrated(true);
		if (typeof window !== 'undefined') {
			const storedLeaderboard = localStorage.getItem('leaderboard');
			if (storedLeaderboard) {
				setLeaderboard(JSON.parse(storedLeaderboard));
			}
		}
	}, []);

	useEffect(() => {
		restart();
	}, []);

	const startGame = () => {
		setGameStarted(true);
		restart();
	};

	const restart = useCallback(() => {
		setBoard(
			Array(6)
				.fill(null)
				.map(() => Array(7).fill(null))
		);
		setCurrentPlayer('R');
		setIsAiTurn(false);
		setHistory([]);
		setMoveCount(0);
	}, []);

	const clearLeaderboard = useCallback(() => {
		setLeaderboard([]);
		if (typeof window !== 'undefined') {
			localStorage.removeItem('leaderboard');
		}
	}, []);

	const checkDirection = useCallback(
		(
			board: Board,
			startRow: number,
			startCol: number,
			dx: number,
			dy: number
		) => {
			const player = board[startRow][startCol];
			if (!player) return false;
			for (let i = 1; i < 4; i++) {
				const row = startRow + dy * i;
				const col = startCol + dx * i;
				if (
					row < 0 ||
					row >= 6 ||
					col < 0 ||
					col >= 7 ||
					board[row][col] !== player
				) {
					return false;
				}
			}
			return true;
		},
		[]
	);

	const checkWinner = useCallback(
		(board: Board) => {
			const directions = [
				{ dx: 0, dy: 1 }, // Vertical
				{ dx: 1, dy: 0 }, // Horizontal
				{ dx: 1, dy: 1 }, // Diagonal right
				{ dx: -1, dy: 1 }, // Diagonal left
			];
			for (let row = 0; row < 6; row++) {
				for (let col = 0; col < 7; col++) {
					for (const { dx, dy } of directions) {
						if (checkDirection(board, row, col, dx, dy)) {
							return board[row][col]; // Return 'R' or 'Y'
						}
					}
				}
			}
			return null; // No winner found
		},
		[checkDirection]
	);

	const updateScores = useCallback(
		(winner: 'R' | 'Y') => {
			const winnerName = playerNames[winner];
			setScores((prevScores) => ({
				...prevScores,
				[winnerName]: (prevScores[winnerName] || 0) + 1,
			}));
			const updatedLeaderboard = [
				...leaderboard.filter((entry) => entry.name !== winnerName),
				{ name: winnerName, score: (scores[winnerName] || 0) + 1 },
			].sort((a, b) => a.score - b.score);
			setLeaderboard(updatedLeaderboard);
			if (typeof window !== 'undefined') {
				localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
			}
		},
		[leaderboard, playerNames, scores]
	);

	const highlightWinningSequence = useCallback(
		(newBoard: Board, winner: 'R' | 'Y') => {
			const directions = [
				{ dx: 0, dy: 1 },
				{ dx: 1, dy: 0 },
				{ dx: 1, dy: 1 },
				{ dx: -1, dy: 1 },
			];
			for (let row = 0; row < 6; row++) {
				for (let col = 0; col < 7; col++) {
					if (newBoard[row][col] === winner) {
						for (const { dx, dy } of directions) {
							if (checkDirection(newBoard, row, col, dx, dy)) {
								for (let i = 0; i < 4; i++) {
									const r = row + dy * i;
									const c = col + dx * i;
									newBoard[r][c] = `W${newBoard[r][c]}`;
								}
								setBoard([...newBoard]);
								return;
							}
						}
					}
				}
			}
		},
		[checkDirection]
	);

	const handleAIClick = useCallback(
		async (col: number) => {
			if (board[0][col]) return;
			const newBoard = board.map((row) => row.slice()) as Board;
			for (let row = 5; row >= 0; row--) {
				if (!newBoard[row][col]) {
					newBoard[row][col] = 'Y'; // AI is always 'Y'
					setBoard(newBoard);
					setHistory([...history, newBoard]);
					playDropSound();
					const winner = checkWinner(newBoard);
					if (winner) {
						playWinSound();
						alert(`${winner} wins!`);
						updateScores(winner as 'Y' | 'R');
						highlightWinningSequence(newBoard, winner as 'Y' | 'R');
						restart();
						return;
					}
					setCurrentPlayer('R');
					setMoveCount(moveCount + 1);
					setIsAiTurn(false);
					break;
				}
			}
		},
		[
			board,
			history,
			playDropSound,
			checkWinner,
			playWinSound,
			updateScores,
			highlightWinningSequence,
			restart,
			moveCount,
		]
	);

	const minimax = (
		newBoard: Board,
		depth: number,
		isMaximizing: boolean,
		alpha: number,
		beta: number
	): { col: number; score: number } => {
		const winner = checkWinner(newBoard);
		if (winner === 'Y') return { col: -1, score: 100 - depth };
		if (winner === 'R') return { col: -1, score: depth - 100 };
		if (newBoard[0].every((cell) => cell !== null) || depth === 0)
			return { col: -1, score: 0 };

		let bestMove = { col: -1, score: isMaximizing ? -Infinity : Infinity };

		for (let col = 0; col < 7; col++) {
			if (!newBoard[0][col]) {
				const tempBoard = newBoard.map((row) => row.slice()) as Board;
				for (let row = 5; row >= 0; row--) {
					if (!tempBoard[row][col]) {
						tempBoard[row][col] = isMaximizing ? 'Y' : 'R';
						const { score } = minimax(
							tempBoard,
							depth - 1,
							!isMaximizing,
							alpha,
							beta
						);
						tempBoard[row][col] = null;

						if (isMaximizing) {
							if (score > bestMove.score) {
								bestMove = { col, score };
								alpha = Math.max(alpha, score);
							}
						} else {
							if (score < bestMove.score) {
								bestMove = { col, score };
								beta = Math.min(beta, score);
							}
						}

						if (beta <= alpha) break;
					}
				}
			}
		}

		return bestMove;
	};

	const getBestMoveFromAI = useCallback(async () => {
		const genAI = new GoogleGenerativeAI(
			process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || ''
		);
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const prompt = `You are playing a Connect Four game. The board is represented as a 6x7 grid where each cell can be null, 'R' (for the AI's pieces), or 'Y' (for the opponent's pieces). 
        Game Rules:
        1. Players take turns dropping their pieces from the top into one of the seven columns.
        2. The piece falls straight down, occupying the next available space within the column.
        3. The objective is to be the first to form a horizontal, vertical, or diagonal line of four of one's own pieces.

        Given the current board state:
        ${JSON.stringify(board)},
        determine the best move for the AI to maximize its chances of winning. Respond with a single number (0-6) representing the column where the AI should place its piece.`;

		const aiMove = async () => {
			try {
				const result = await model.generateContent(prompt);
				const text =
					result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
				const match = text?.match(/\b(\d)\b/);
				const move = match ? parseInt(match[1], 10) : -1;
				return move !== -1 && availableCols.includes(move)
					? move
					: availableCols[Math.floor(Math.random() * availableCols.length)];
			} catch (error) {
				console.error('Error fetching AI move:', error);
				return availableCols[Math.floor(Math.random() * availableCols.length)];
			}
		};

		const easyMove = async () => aiMove();

		const mediumMove = async () => {
			// AI will try to block player's win or make its own winning move
			for (const col of availableCols) {
				const newBoard = board.map((row) => row.slice()) as Board;
				for (let row = 5; row >= 0; row--) {
					if (!newBoard[row][col]) {
						newBoard[row][col] = 'Y';
						if (checkWinner(newBoard)) {
							return col;
						}
						newBoard[row][col] = 'R';
						if (checkWinner(newBoard)) {
							return col;
						}
						break;
					}
				}
			}
			return aiMove();
		};

		const hardMove = async () => {
			const move = minimax(board, 5, true, -Infinity, Infinity);
			return move.col;
		};

		const availableCols = board[0]
			.map((col, index) => (col === null ? index : -1))
			.filter((index) => index !== -1);

		if (availableCols.length === 0) {
			return;
		}

		let move;
		switch (aiDifficulty) {
			case 'easy':
				move = await easyMove();
				break;
			case 'medium':
				move = await mediumMove();
				break;
			case 'hard':
				move = await hardMove();
				break;
			default:
				move = await easyMove();
		}

		handleAIClick(move);
	}, [board, aiDifficulty, handleAIClick, checkWinner]);

	useEffect(() => {
		if (aiEnabled && currentPlayer === 'Y' && isAiTurn) {
			getBestMoveFromAI();
		}
	}, [aiEnabled, currentPlayer, isAiTurn, getBestMoveFromAI]);

	const handleClick = useCallback(
		(col: number) => {
			if (!gameStarted) {
				return;
			}
			if (board[0][col]) return;
			const newBoard = board.map((row) => row.slice()) as Board;
			for (let row = 5; row >= 0; row--) {
				if (!newBoard[row][col]) {
					newBoard[row][col] = currentPlayer;
					setBoard(newBoard);
					setHistory([...history, newBoard]);
					playDropSound();
					const winner = checkWinner(newBoard);
					if (winner) {
						playWinSound();
						alert(`${winner} wins!`);
						updateScores(winner as 'Y' | 'R');
						highlightWinningSequence(newBoard, winner as 'Y' | 'R');
						restart();
						return;
					}
					setCurrentPlayer((prevPlayer) => (prevPlayer === 'R' ? 'Y' : 'R'));
					setMoveCount(moveCount + 1);
					if (aiEnabled && currentPlayer === 'R') {
						setIsAiTurn(true);
					}
					break;
				}
			}
		},
		[
			board,
			currentPlayer,
			aiEnabled,
			isAiTurn,
			gameStarted,
			history,
			playDropSound,
			playWinSound,
			checkWinner,
			updateScores,
			highlightWinningSequence,
			restart,
			moveCount,
		]
	);

	const undoMove = useCallback(() => {
		if (history.length > 0) {
			const newHistory = history.slice(0, -1);
			setHistory(newHistory);
			setBoard(newHistory[newHistory.length - 1] || []);
			setCurrentPlayer((prevPlayer) => (prevPlayer === 'R' ? 'Y' : 'R'));
		}
	}, [history]);

	const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setTheme(event.target.value);
	};

	const handlePlayerNameChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		player: 'R' | 'Y'
	) => {
		const newPlayerNames = { ...playerNames, [player]: event.target.value };
		setPlayerNames(newPlayerNames);
		setLeaderboard((prevLeaderboard) =>
			prevLeaderboard.map((entry) =>
				entry.name === playerNames[player]
					? { ...entry, name: event.target.value }
					: entry
			)
		);
	};

	const handleAiToggle = () => {
		const newAiEnabled = !aiEnabled;
		setAiEnabled(newAiEnabled);
	};

	if (!isHydrated) {
		return null; // Return null or a loading indicator until the component is hydrated
	}

	return (
		<div className={`theme-${theme}`}>
			<Head>
				<title>Connect-4 with Gemini AI</title>
				<link
					rel='stylesheet'
					href='https://kit.fontawesome.com/e33d5b9810.css'
					crossOrigin='anonymous'
				/>
			</Head>
			<div className='menu'></div>
			<div
				id='darkLayout'
				style={{
					backgroundColor: '#333',
					textAlign: 'center',
					padding: '1rem',
				}}
			>
				<h1
					style={{
						color: '#fff',
						fontFamily: 'Arial, sans-serif',
						fontSize: '3rem',
					}}
				>
					Connect <span style={{ color: '#dc3545' }}>Fo</span>
					<span style={{ color: '#007bff' }}>ur</span> with Gemini AI
				</h1>
			</div>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col-lg-3 col-12'>
						<div id='scoreBoard' className='d-none d-lg-block'>
							<h2>Current player: {playerNames[currentPlayer]}</h2>
							<div
								className='playerRepresentation'
								ref={currentPlayerChipRef}
								style={{
									backgroundColor: currentPlayer === 'R' ? 'red' : 'yellow',
								}}
							>
								{currentPlayer}
							</div>
							<button className='btn btn-outline-light' onClick={restart}>
								Restart
							</button>
							<button className='btn btn-outline-light' onClick={undoMove}>
								Undo Move
							</button>
							<button
								className='btn btn-outline-light'
								onClick={clearLeaderboard}
							>
								Clear Leaderboard
							</button>
							<div className='shortInfo'>
								<p>
									Connect four is a game of two players, where each one has to
									drop a chip from the top of the game board. The winner will be
									determined by the first player to be able to arrange the chips
									in an order. The order may be horizontal, vertical, or even
									diagonal.
								</p>
							</div>
							<div className='score'>
								{Object.entries(scores).map(([name, score]) => (
									<p key={name}>
										{name}: {score}
									</p>
								))}
							</div>
							<div className='playerName'>
								<input
									type='text'
									value={playerNames.R}
									onChange={(e) => handlePlayerNameChange(e, 'R')}
									placeholder='Enter your name'
									className='form-control'
								/>
								<input
									type='text'
									value={playerNames.Y}
									onChange={(e) => handlePlayerNameChange(e, 'Y')}
									placeholder='Enter AI name'
									className='form-control mt-2'
								/>
							</div>
							<div className='themeSelector mt-3'>
								<select
									onChange={handleThemeChange}
									value={theme}
									className='form-select'
								>
									<option value='classic'>Classic</option>
									<option value='dark'>Dark</option>
									<option value='neon'>Neon</option>
								</select>
							</div>
							<div className='aiToggle mt-3'>
								<label className='form-check-label'>
									AI Opponent:
									<input
										type='checkbox'
										className='form-check-input'
										checked={aiEnabled}
										onChange={handleAiToggle}
									/>
								</label>
							</div>
							<div className='aiDifficulty mt-3'>
								<label className='form-check-label'>
									AI Difficulty:
									<select
										onChange={(e) => setAiDifficulty(e.target.value)}
										value={aiDifficulty}
										className='form-select'
									>
										<option value='easy'>Easy</option>
										<option value='medium'>Medium</option>
										<option value='hard'>Hard</option>
									</select>
								</label>
							</div>
							<div className='leaderboard mt-3'>
								<h3>Leaderboard</h3>
								<ul className='list-group'>
									{leaderboard.map((player, index) => (
										<li key={index} className='list-group-item'>
											{player.name}: {player.score}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
					<div className='col-lg-6 col-12'>
						<div id='gridContainer'>
							<div className='chipHolder'>
								{board[0] &&
									board[0].map((_, colIndex) => (
										<div
											key={colIndex}
											className='space'
											onClick={() => handleClick(colIndex)}
										>
											<div
												className='chip'
												style={{
													backgroundColor:
														currentPlayer === 'R' ? 'red' : 'yellow',
												}}
											></div>
										</div>
									))}
							</div>
							<div className='gameBoard'>
								{board.map((row, rowIndex) =>
									row.map((cell, colIndex) => (
										<div
											key={`${rowIndex}-${colIndex}`}
											className={`space ${
												cell
													? cell === 'R' || cell === 'WR'
														? 'player-one'
														: 'player-two'
													: ''
											}`}
											style={{
												backgroundColor:
													cell === 'R' || cell === 'WR'
														? 'red'
														: cell === 'Y' || cell === 'WY'
														? 'yellow'
														: 'gray',
												border:
													cell && cell.startsWith('W')
														? '2px solid green'
														: 'none',
												transition: 'background-color 0.5s ease',
											}}
										></div>
									))
								)}
							</div>
						</div>
					</div>
					<div className='col-lg-2 col-12'></div>
				</div>
				{!gameStarted && (
					<div className='row'>
						<div className='col-12 text-center mt-3'>
							<button className='btn btn-primary' onClick={startGame}>
								Start Game
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ConnectFour;
