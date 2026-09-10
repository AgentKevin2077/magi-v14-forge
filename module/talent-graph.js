/**
 * Magicalogia specialty (talent) distance table.
 *
 * Checked specialties start at 5. Adjacent cells cost 1 (same column) or 2
 * (neighboring columns), unless a "gap" checkbox halves the column-change cost.
 * Pure function so it can be unit-tested outside Foundry.
 */
export function getTalentTable(table, gap, overflowX) {
  const next = table.map((col) => col.map((cell) => ({ ...cell })));
  const nodes = [];

  for (let i = 0; i < 6; ++i) {
    for (let j = 0; j < 11; ++j) {
      if (next[i][j].misfortune === false && next[i][j].state === true) {
        nodes.push({ x: i, y: j });
        next[i][j].num = "5";
      } else {
        next[i][j].num = "12";
      }
    }
  }

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];
  const move = [1, 1, 2, 2];

  for (let i = 0; i < nodes.length; ++i) {
    const queue = [nodes[i]];

    while (queue.length !== 0) {
      const now = queue.shift();
      if (+next[now.x][now.y].num === 12) continue;

      for (let d = 0; d < 4; ++d) {
        let nx = now.x + dx[d];
        const ny = now.y + dy[d];
        let m = move[d];

        if (overflowX && (nx < 0 || nx >= 6)) nx = nx < 0 ? 5 : 0;
        if (nx < 0 || nx >= 6 || ny < 0 || ny >= 11) continue;

        const g = ((now.x === 0 && nx === 5) || (now.x === 5 && nx === 0))
          ? gap[0]
          : gap[nx > now.x ? nx : now.x];
        if (m === 2 && g) m = 1;

        if (Number(next[nx][ny].num) > Number(next[now.x][now.y].num) + m) {
          next[nx][ny].num = String(Number(next[now.x][now.y].num) + m);
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  return next;
}

export function applyTalentPatch(currentTable, currentGap, currentOverflowX, talentChange) {
  let table = currentTable.map((col) => col.map((cell) => ({ ...cell })));
  let gap = { ...currentGap };
  let overflowX = currentOverflowX;

  if (talentChange.table) {
    for (const i of Object.keys(talentChange.table)) {
      for (const j of Object.keys(talentChange.table[i])) {
        for (const key of Object.keys(talentChange.table[i][j])) {
          table[i][j][key] = talentChange.table[i][j][key];
        }
      }
    }
  }

  if (talentChange.gap) {
    for (const i of Object.keys(talentChange.gap)) {
      gap[i] = talentChange.gap[i];
    }
  }

  if ("curiosity" in talentChange && talentChange.curiosity != 0) {
    gap = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false };
    gap[talentChange.curiosity] = true;
    gap[talentChange.curiosity - 1] = true;
    talentChange.gap = { ...gap };
  }

  if ("overflowX" in talentChange) overflowX = talentChange.overflowX;

  return {
    table: getTalentTable(table, gap, overflowX),
    gap,
    overflowX
  };
}
