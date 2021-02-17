require('colors');

const readline = require('readline');
const Table = require('cli-table');

/**
 *
 * Sudoku Solver by InforMatheMusic
 *
 * Yes I know everything is very inefficient
 * but I'm already grateful I completed it
 *
 * This thing confused me for the part 2 days...
 *
* */

/* const charMap = [{
  '┬': '╤',
  '┼': '╪',
  '┴': '╧',
  '─': '═',
}, {
  '├': '╟',
  '┼': '╫',
  '┤': '╢',
  '│': '║',
}, {
  '┌': '╔',
  '└': '╚',
  '┬': '╦',
  '├': '╠',
  '┼': '╬',
  '┤': '╣',
  '┴': '╩',
  '┐': '╗',
  '┘': '╝',
}]; */

const displaySudoku = (sudokuParamsDisplay) => {
  const maxWidth = Math.max(
    ...sudokuParamsDisplay.map(
      (row) => Math.max(
        ...row.map(
          (cell) => (Array.isArray(cell) ? cell.join('|') : String(cell).replace(RegExp('\x1b\\[[0-9][0-9]m', 'g'), '')).length, // eslint-disable-line no-control-regex
        ),
      ),
    ),
  );

  const table = new Table({
    colWidths: Array(9).fill(maxWidth + 2),
  });

  table.push(
    ...sudokuParamsDisplay.map(
      (row) => row.map(
        (cell) => (Array.isArray(cell) ? cell.join('|') : cell),
      ),
    ),
  );
  /* console.log(table
    .toString()
    .replace(RegExp('\x1b\\[3.m', 'g'), '') // eslint-disable-line no-control-regex
    .split('\n')
    .map(
      (substring) => [...substring],
    )
    .map(
      (line, y) => line.map((char, x) => {
        if (y % 6 === 0) return charMap[x % (maxWidth * 3 + 9) === 0 ? 2 : 0][char] || char;
        if (x % (maxWidth * 3 + 9) === 0) return charMap[1][char] || char;
        return char;
      }),
    )
    .map((v) => v.join(''))
    .join('\n')); */
  console.log(table.toString());
};

(async () => {
  const consoleIO = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = (q) => new Promise((r) => {
    consoleIO.resume();
    consoleIO.question(q, (a) => {
      consoleIO.pause();
      r(a);
    });
  });

  console.clear();

  console.log(`Please input your sudoku by replacing voids with spaces.
Input will be padded to the program afterwards
(You can--in other words--not fill the entire line but only the numbers included and the spaces between them.)

Ctrl+C to quit

`);

  const sudokuInput = [];
  for (let i = 0; i < 9; i += 1) {
    sudokuInput[i] = [...(
      await ask(`Line ${i + 1}|`) // eslint-disable-line no-await-in-loop
    ).padEnd(9, ' ').replace(/[A-z]/g, ' ')]
      .map((v) => (v === ' ' ? null : +v));
  }

  /* const sudokuInput = [
    '  4   51 ',
    '     98  ',
    '  783 6 4',
    '8      6 ',
    '    9  8 ',
    '  6  4   ',
    '    1 9  ',
    '42 7     ',
    '56   8 4 ',
  ].map((v) => [...v.padEnd(9, ' ')].map((v1) => (v1 === ' ' ? null : +v1))); */

  const algoWithoutAskForSudoku = async (sudokuParamsAlgo) => {
    const getRegion = (y, x) => Math.floor(y / 3) * 3 + Math.floor(x / 3);

    const allNumbers = '123456789'.split('').map((v) => +v);
    const allIndices = '012345678'.split('').map((v) => +v);

    const solve = (sudokuParamsSolve) => {
      let sudoku = JSON.parse(JSON.stringify(sudokuParamsSolve));

      const rows = [];
      const cols = [];
      const bulk = [];

      allIndices.forEach((modular) => {
        cols[modular] = allIndices.map((x) => sudoku[modular][x]);
        rows[modular] = allIndices.map((y) => sudoku[y][modular]);
        bulk[modular] = allIndices
          .map((looper) => sudoku[getRegion(modular, looper)][(modular % 3) * 3 + (looper % 3)]);
      });

      const [freeX, freeY, freeBulk] = [cols, rows, bulk].map((cat) => cat.map(
        (v) => allNumbers.filter((v1) => !v.filter((v2) => v2 !== null).includes(v1)), // DRY
      ));
      sudoku = sudoku.map(
        (row, y) => row.map(
          (cell, x) => (cell === null && freeBulk[getRegion(y, x)].filter(
            (value) => freeX[y].includes(value) && freeY[x].includes(value),
          )) || cell,
        ),
      );

      allIndices.forEach((modular) => {
        cols[modular] = allIndices.map((x) => sudoku[modular][x]);
        rows[modular] = allIndices.map((y) => sudoku[y][modular]);
        bulk[modular] = allIndices
          .map((looper) => sudoku[getRegion(modular, looper)][(modular % 3) * 3 + (looper % 3)]);
      });

      const previous = [];
      do {
        previous.push(JSON.parse(JSON.stringify(sudoku)));
        sudoku.forEach((row, y) => {
          row.forEach((cell, x) => {
            let found;

            if (Array.isArray(cell)) {
              const temp = cell.filter(
                (onlyN) => [rows[y], cols[x], bulk[getRegion(y, x)]].some((cat) => cat.filter(
                  (cellInner) => (Array.isArray(cellInner) ? cellInner.includes(onlyN) : true),
                ).every(
                  (v) => (Array.isArray(v) ? v === cell : v !== onlyN),
                )),
              );
              if (cell.length === 1) {
                [found] = cell;
              } else if (temp && temp.length === 1) {
                [found] = temp;
              }
            }
            if (found) {
              sudoku[y][x] = found;
              freeX[y] = freeX[y].filter((v2) => v2 !== found);
              freeY[x] = freeY[x].filter((v2) => v2 !== found);
              freeBulk[getRegion(y, x)] = freeBulk[getRegion(y, x)].filter(
                (v2) => v2 !== found,
              );
              for (let y1 = 0; y1 < 9; y1 += 1) {
                for (let x1 = 0; x1 < 9; x1 += 1) {
                  if (Array.isArray(sudoku[y1][x1])) {
                    if (sudoku[y1][x1].length > 1) {
                      sudoku[y1][x1] = freeBulk[getRegion(y1, x1)]
                        .filter(
                          (v2) => freeY[x1].includes(v2) && freeX[y1].includes(v2),
                        );
                    }
                  }
                }
              }
              allIndices.forEach((v2) => {
                cols[v2] = allIndices.map((v3) => sudoku[v2][v3]);
                rows[v2] = allIndices.map((v3) => sudoku[v3][v2]);
                bulk[v2] = allIndices
                  .map((v3) => sudoku[getRegion(v2, v3)][(v2 % 3) * 3 + (v3 % 3)]);
              });
            }
          });
        });
      } while (JSON.stringify(previous[previous.length - 1]) !== JSON.stringify(sudoku));
      return {
        sudoku,
        cols,
        rows,
        bulk,
      };
    };

    const makeSureItsSolved = async (sudokuParamsMakeSure) => {
      const {
        sudoku: solved,
        cols,
        rows,
        bulk,
      } = solve(sudokuParamsMakeSure);
      if (solved.some((row) => row.some((cell) => Array.isArray(cell)))) {
        console.clear();
        const hasEmptyCell = solved.some((row) => row.some((cell) => cell.length === 0));
        console.log(['Something has gone very wrong here (One of the cells has no possible solution!)...', 'We\'re getting stuck and we need your instinct'][+!hasEmptyCell]);
        console.log('Here is your current sudoku (Pipe characters separate possibilities):');
        console.log(displaySudoku(solved));
        if (!['y', 'yes'].includes((await ask(`Do you want to ${['rectify your input', 'help'][+!hasEmptyCell]}? [Yes/_No_] `)).toLowerCase())) {
          await ask('[Press ENTER to exit]');
          process.exit(0);
        }
        if (hasEmptyCell) {
          console.log(displaySudoku(sudokuInput));
          const askRectify = async () => {
            const cellToRect = await ask('What cell in your input do you want to rectify? [CR, C(olumn) and R(ow) both being numbers from 1 to 9] ');
            const row = +cellToRect[1] - 1;
            const col = +cellToRect[0] - 1;
            sudokuInput[row][col] = +(await ask(`Cell at (${col + 1}, ${row + 1}) ${sudokuInput[row][col]} [1-9 or [space]] =`)).replace(' ', 0) % 10;
            if (sudokuInput[row][col] === 0) sudokuInput[row][col] = null;
            if (['y', 'yes'].includes(await ask('Do you want to rectify another cell? [Yes/_No_] '))) await askRectify();
            return 0;
          };
          await askRectify();
          return makeSureItsSolved();
        }
        const askHint = async () => {
          const cellToHint = await ask('What cell in your input do you want to give a go to? [CR, C(olumn) and R(ow) both being numbers from 1 to 9] ');
          const row = +cellToHint[1] - 1;
          const col = +cellToHint[0] - 1;
          if (!Array.isArray(solved[row][col])) {
            console.log('We already found this cell. Try your luck at another one.');
            await askHint();
            return null;
          }
          const hint = +(await ask(`Cell at (${col + 1}, ${row + 1}) [${solved[row][col].join('|')}] => `)) % 10;
          if (!solved[row][col].includes(hint)) {
            console.log(`We could't find ${hint} as a possibility. Please try again`);
            await askHint();
            return null;
          }
          sudokuInput[row][col] = hint;
          await ask('Okay. :)');
          return null;
        };
        await askHint();
        return makeSureItsSolved(sudokuParamsMakeSure);
      }
      return {
        sudoku: solved,
        cols,
        rows,
        bulk,
      };
    };

    const {
      sudoku,
      cols,
      rows,
      bulk,
    } = await makeSureItsSolved(sudokuParamsAlgo);

    const isValid = ![cols, rows, bulk].some(
      (listCat) => listCat.some((cat) => cat.sort((a, b) => a - b).join('') !== allNumbers.join('')),
    );

    if (!isValid) {
      console.log('Incorrect sudoku:');
    } else {
      console.log('Solved Sudoku:');
    }

    console.clear();
    displaySudoku(sudoku.map(
      (row, y) => row.map(
        (cell, x) => [
          String(cell),
          [
            String(cell).red,
            String(cell).cyan,
          ][
            +![rows[x], cols[y], bulk[getRegion(y, x)]]
              .some((cat) => cat.filter((otherCell) => otherCell === cell).length > 1)
          ],
        ][+!(sudokuInput[y][x] === sudoku[y][x])],
      ),
    ));

    if (!isValid) {
      if (['y', 'yes'].includes(await ask('Try again? [Yes/_No_] '))) algoWithoutAskForSudoku(sudokuParamsAlgo);
    }
    await ask('[Press ENTER to exit]');
    process.exit(0);
  };
  algoWithoutAskForSudoku(sudokuInput);
})();
