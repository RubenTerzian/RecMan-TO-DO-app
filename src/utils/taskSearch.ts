function normalizeSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

const SEARCH_TOKEN_PATTERN = /[\p{L}\p{N}]+/gu;

function tokenizeSearchValue(value: string) {
  return normalizeSearchValue(value).match(SEARCH_TOKEN_PATTERN) ?? [];
}

function isSubsequenceMatch(candidate: string, query: string) {
  let queryIndex = 0;

  for (const character of candidate) {
    if (character === query[queryIndex]) {
      queryIndex += 1;

      if (queryIndex >= query.length) {
        return true;
      }
    }
  }

  return false;
}

function getMaxEditDistance(queryLength: number) {
  if (queryLength <= 3) {
    return 0;
  }

  if (queryLength <= 7) {
    return 1;
  }

  return 2;
}

function getBoundedLevenshteinDistance(
  source: string,
  target: string,
  maxDistance: number,
) {
  const sourceLength = source.length;
  const targetLength = target.length;

  if (Math.abs(sourceLength - targetLength) > maxDistance) {
    return maxDistance + 1;
  }

  const previousRow = Array.from(
    { length: targetLength + 1 },
    (_, index) => index,
  );

  for (let sourceIndex = 1; sourceIndex <= sourceLength; sourceIndex += 1) {
    let currentRowMinimum = sourceIndex;
    let previousDiagonal = previousRow[0] ?? 0;

    previousRow[0] = sourceIndex;

    for (let targetIndex = 1; targetIndex <= targetLength; targetIndex += 1) {
      const cachedAbove = previousRow[targetIndex] ?? 0;
      const substitutionCost =
        source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      const nextValue = Math.min(
        previousRow[targetIndex - 1] + 1,
        cachedAbove + 1,
        previousDiagonal + substitutionCost,
      );

      previousDiagonal = cachedAbove;
      previousRow[targetIndex] = nextValue;
      currentRowMinimum = Math.min(currentRowMinimum, nextValue);
    }

    if (currentRowMinimum > maxDistance) {
      return maxDistance + 1;
    }
  }

  return previousRow[targetLength] ?? maxDistance + 1;
}

function getTokenMatchScore(candidate: string, queryToken: string) {
  if (!candidate || !queryToken) {
    return 0;
  }

  if (candidate === queryToken) {
    return 1;
  }

  if (candidate.startsWith(queryToken)) {
    return 0.95;
  }

  if (candidate.includes(queryToken)) {
    return 0.9;
  }

  if (queryToken.length >= 3 && isSubsequenceMatch(candidate, queryToken)) {
    return 0.75;
  }

  const maxEditDistance = getMaxEditDistance(queryToken.length);

  if (maxEditDistance === 0) {
    return 0;
  }

  const distance = getBoundedLevenshteinDistance(
    candidate,
    queryToken,
    maxEditDistance,
  );

  return distance <= maxEditDistance ? 0.6 : 0;
}

function getSmartSearchScore(text: string, query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedText = normalizeSearchValue(text);

  if (!normalizedText) {
    return 0;
  }

  if (normalizedText.includes(normalizedQuery)) {
    return 1;
  }

  const queryTokens = tokenizeSearchValue(normalizedQuery);

  if (queryTokens.length === 0) {
    return 1;
  }

  const candidateTokens = Array.from(
    new Set([normalizedText, ...tokenizeSearchValue(normalizedText)]),
  );

  let totalScore = 0;

  for (const queryToken of queryTokens) {
    let bestScore = 0;

    for (const candidateToken of candidateTokens) {
      if (
        Math.abs(candidateToken.length - queryToken.length) >
        getMaxEditDistance(queryToken.length)
      ) {
        if (
          !candidateToken.includes(queryToken) &&
          !candidateToken.startsWith(queryToken)
        ) {
          continue;
        }
      }

      bestScore = Math.max(
        bestScore,
        getTokenMatchScore(candidateToken, queryToken),
      );

      if (bestScore === 1) {
        break;
      }
    }

    if (bestScore === 0) {
      return 0;
    }

    totalScore += bestScore;
  }

  return totalScore / queryTokens.length;
}

export function matchesSmartSearch(text: string, query: string) {
  return getSmartSearchScore(text, query) > 0;
}
