'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

const ConnectFour: React.FC = () => {
	const [board, setBoard] = useState(() =>
		Array(6)
			.fill(null)
			.map(() => Array(7).fill(null))
	);
	const [currentPlayer, setCurrentPlayer] = useState('R');
	const currentPlayerChipRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		console.log('Component mounted');
	}, []);

	const restart = () => {
		console.log('Restarting the game');
		setBoard(
			Array(6)
				.fill(null)
				.map(() => Array(7).fill(null))
		);
		setCurrentPlayer('R');
	};

	const handleClick = useCallback(
		(col: number) => {
			console.log(`Column ${col} clicked by player ${currentPlayer}`);
			const newBoard = board.map((row) => row.slice());
			for (let row = 5; row >= 0; row--) {
				if (!newBoard[row][col]) {
					newBoard[row][col] = currentPlayer;
					console.log(
						`Placing ${currentPlayer}'s chip at row ${row}, column ${col}`
					);
					setBoard(newBoard);
					setCurrentPlayer(currentPlayer === 'R' ? 'Y' : 'R');
					checkWinner(newBoard);
					break;
				}
			}
		},
		[board, currentPlayer]
	);

	const checkDirection = (
		board: (string | null)[][],
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
	};

	const checkWinner = (board: (string | null)[][]) => {
		console.log('Checking for a winner');
		const directions = [
			{ dx: 0, dy: 1 }, // vertical
			{ dx: 1, dy: 0 }, // horizontal
			{ dx: 1, dy: 1 }, // diagonal down-right
			{ dx: 1, dy: -1 }, // diagonal down-left
		];

		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 7; col++) {
				for (const { dx, dy } of directions) {
					if (checkDirection(board, row, col, dx, dy)) {
						console.log(`${board[row][col]} wins!`);
						alert(`${board[row][col]} wins!`);
						restart();
						return;
					}
				}
			}
		}
	};

	return (
		<div>
			<Head>
				<title>Connect-4 Beta: Drop Down Chip</title>
				<link
					rel='stylesheet'
					href='https://kit.fontawesome.com/e33d5b9810.css'
					crossOrigin='anonymous'
				/>
			</Head>
			<div className='menu'></div>
			<div id='darkLayout' className='bg-dark text-center py-3'>
				<h1 className='text-light'>
					Connect <span className='text-danger'>Fo</span>
					<span className='text-primary'>ur</span>
				</h1>
			</div>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col-lg-3 col-12'>
						<div id='scoreBoard' className='d-none d-lg-block'>
							<h2>Current player:</h2>
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
							<div className='shortInfo'>
								<p>
									Connect four is a game of two players, where each one has to
									drop a chip from the top of the game board. The winner will be
									determined by the first player to be able to arrange the chips
									in an order. The order may be horizontal, vertical, or even
									diagonal.
								</p>
							</div>
						</div>
					</div>
					<div className='col-lg-6 col-12'>
						<div id='gridContainer'>
							<div className='chipHolder bg-dark'>
								{board[0] &&
									board[0].map((_, colIndex) => (
										<div
											key={colIndex}
											className='space'
											onClick={() => handleClick(colIndex)}
										>
											<div className='chip'></div>
										</div>
									))}
							</div>
							<div className='gameBoard bg-dark'>
								{board.map((row, rowIndex) =>
									row.map((cell, colIndex) => (
										<div
											key={`${rowIndex}-${colIndex}`}
											className={`space ${
												cell ? (cell === 'R' ? 'player-one' : 'player-two') : ''
											}`}
											style={{
												backgroundColor:
													cell === 'R'
														? 'red'
														: cell === 'Y'
														? 'yellow'
														: 'gray',
											}}
										></div>
									))
								)}
							</div>
						</div>
					</div>
					<div className='col-lg-2 col-12'></div>
					<div className='col-lg-1 col-12 settingHolder'>
						<div className='settings bg-dark d-none d-lg-block'>
							<h3>SFX:</h3>
							<form>
								<input
									type='radio'
									id='radioButton'
									name='sfx'
									defaultChecked
								/>{' '}
								<label>On</label>
								<br />
								<input type='radio' name='sfx' className='offButton' />{' '}
								<label>Off</label>
							</form>
						</div>
					</div>
				</div>
			</div>
			<div className='container-fluid'>
				<div className='row smlMenu bg-dark'>
					<div className='col-6 sfxSettings'>
						<h3>SFX:</h3>
						<form>
							<input
								type='radio'
								id='radioButtonSML'
								name='sfxSml'
								defaultChecked
							/>{' '}
							<label>On</label>
							<br />
							<input type='radio' name='sfxSml' className='offButtonSML' />{' '}
							<label>Off</label>
						</form>
					</div>
					<div className='col-6 restartButtonContainer'>
						<button className='btn btn-light' onClick={restart}>
							Restart
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConnectFour;
