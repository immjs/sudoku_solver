(async () => {
  const readline = require('readline');
  const consoleIO = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = (q) => new Promise((r) => {
    consoleIO.resume();
    consoleIO.question(q, (a) => {
      consoleIO.pause();
      r(a);
    })
  });

  console.log('Veuillez entrer le sudoku en remplacant les vides par les espaces');

  /* const sudoku = await Promise.all(Array(9).fill('-').map(
    async (_, i) => [...(await ask(`Ligne ${i + 1}: `)).padEnd(9, ' ')]
  )); */
  /* const sudoku = [];
  for (let i = 0; i < 9; i++) {
    sudoku[i] = [...(await ask('')).padEnd(9, ' ')];
  } */
  sudoku = [
    '53  7    '.split('').map((v) => v === ' ' ? null : +v),
    '6  195   '.split('').map((v) => v === ' ' ? null : +v),
    ' 98    6 '.split('').map((v) => v === ' ' ? null : +v),
    '8   6   3'.split('').map((v) => v === ' ' ? null : +v),
    '7  8 3  1'.split('').map((v) => v === ' ' ? null : +v),
    '7   2   6'.split('').map((v) => v === ' ' ? null : +v),
    ' 6    28 '.split('').map((v) => v === ' ' ? null : +v),
    '   419  5'.split('').map((v) => v === ' ' ? null : +v),
    '    8  79'.split('').map((v) => v === ' ' ? null : +v),
  ]
  const lns = [], cols = [];
  for (const i in Array(9).fill('-')){
    cols[i] = Array(9).fill('-').map((_, i1) => sudoku[i][i1]);
    lns[i] = Array(9).fill('-').map((_, i1) => sudoku[i1][i]);
  }

  const allNumbers = '123456789'.split('').map((v) => +v);
  const freeX = cols.map((v) => allNumbers.filter((v1) => !v.filter((v2) => v2 !== null).includes(v1)));
  const freeY = lns.map((v) => allNumbers.filter((v1) => !v.filter((v2) => v2 !== null).includes(v1)));
  const freeBulk = allNumbers.map((v) =>
    allNumbers.filter((v1) => 
      !allNumbers.map((v2) =>
        sudoku[Math.floor((v - 1) / 3) * 3 + Math.floor((v2 - 1) / 3)]
          [((v - 1) % 3) * 3 + ((v2 - 1) % 3)]
      ).filter((v2) => v2 !== null).includes(v1)
    )
  );
  console.log(freeBulk);
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const regionX = Math.floor(x / 3);
      const regionY = Math.floor(y / 3);
      sudoku[x][y] ??= freeX[y].filter((v) => freeY[x].includes(v) && freeBulk[regionY * 3 + regionX].includes(v));
    }
  }
  console.log(sudoku)
  do {
    previous = JSON.stringify(sudoku)
    sudoku.forEach((v, i) => {
      v.forEach((v1, i1) => {
        if (Array.isArray(v1) && v1.length === 1) {
          sudoku[i][i1] = v1[0];
          freeX[i1] = freeX[i1].filter((v2) => v2 !== v1[0]);
          freeY[i] = freeY[i].filter((v2) => v2 !== v1[0]);
          const regionX = Math.floor(i1 / 3);
          const regionY = Math.floor(i / 3);
          freeBulk[regionY * 3 + regionX] = freeBulk[regionY * 3 + regionX].filter((v2) => v2 !== v1[0])
          sudoku[i]
            .forEach((v2, i2) => {
              if (Array.isArray(i2))
                sudoku[i][i2] = v2.filter((v2) => v2 !== v1[0])
            });
          sudoku
            .forEach((_, i2) => {
              if (Array.isArray(i2))
                sudoku[i2][i1] = v2[i1].filter((v2) => v2 !== v1[0])
            });
          sudoku
            .forEach((v2, i2) => {
              v2.forEach((v3, i3) => {
                const regionXSolver = Math.floor(i3 / 3);
                const regionYSolver = Math.floor(i2 / 3);
                if (regionY * 3 + regionX === regionYSolver * 3 + regionXSolver && Array.isArray(i2))
                  sudoku[i2][i3] = v3.filter((v2) => v2 !== v1[0])
              })
            });
        } else if (v1.some((v2) => v.filter((v3) => v3 === v2).length === 1)) {
          const theOne = v1.find((v2) => v.filter((v3) => v3 === v2).length === 1);
          sudoku[i][i1] = theOne;
          freeX[i1] = freeX[i1].filter((v2) => v2 !== theOne);
          freeY[i] = freeY[i].filter((v2) => v2 !== theOne);
          const regionX = Math.floor(i1 / 3);
          const regionY = Math.floor(i / 3);
          freeBulk[regionY * 3 + regionX] = freeBulk[regionY * 3 + regionX].filter((v2) => v2 !== v1[0])
          sudoku[i]
            .forEach((v2, i2) => {
              if (Array.isArray(i2))
                sudoku[i][i2] = v2.filter((v2) => v2 !== theOne)
            });
          sudoku
            .forEach((_, i2) => {
              if (Array.isArray(i2))
                sudoku[i2][i1] = v2[i1].filter((v2) => v2 !== theOne)
            });
          sudoku
            .forEach((v2, i2) => {
              v2.forEach((v3, i3) => {
                const regionXSolver = Math.floor(i3 / 3);
                const regionYSolver = Math.floor(i2 / 3);
                if (regionY * 3 + regionX === regionYSolver * 3 + regionXSolver && Array.isArray(i2))
                  sudoku[i2][i3] = v3.filter((v2) => v2 !== theOne)
              })
            });
        }
      })
    });
    console.log(previous, JSON.stringify(sudoku));

  } while (previous !== JSON.stringify(sudoku))
  console.log(sudoku)
})();