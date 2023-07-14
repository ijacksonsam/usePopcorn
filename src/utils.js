export function sortWatchedMovies(watched, sortBy, order) {
  const sorted = [...watched];
  if (sortBy === "alphabetical") {
    return order < 0
      ? sorted.sort((a, b) => a.Title.localeCompare(b.Title))
      : sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  }
  if (sortBy === "imdbRating") {
    return order < 0
      ? sorted.sort((a, b) => a.imdbRating - b.imdbRating)
      : sorted.sort((a, b) => b.imdbRating - a.imdbRating);
  }
  if (sortBy === "userRating") {
    return order < 0
      ? sorted.sort((a, b) => a.userRating - b.userRating)
      : sorted.sort((a, b) => b.userRating - a.userRating);
  }
  if (sortBy === "runtime") {
    return order < 0
      ? sorted.sort((a, b) => a.runtime - b.runtime)
      : sorted.sort((a, b) => b.runtime - a.runtime);
  }
  return sorted;
}

export function sortMovies(movies, sortBy) {
  const sortedMovies = [...movies];
  if (sortBy === "asc") {
    return sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  }
  if (sortBy === "desc") {
    return sortedMovies.sort((a, b) => -1 * a.Title.localeCompare(b.Title));
  }
  if (sortBy === "oldest") {
    return sortedMovies.sort((a, b) => a.Year - b.Year);
  }
  if (sortBy === "latest") {
    return sortedMovies.sort((a, b) => b.Year - a.Year);
  }
  if (sortBy === "imdbRating") {
    return sortedMovies.sort((a, b) => a.imdbRating - b.imdbRating);
  }
  return sortedMovies;
}

export function average(arr) {
  if (arr.length === 0) return null;
  return arr.reduce((acc, x) => acc + x) / arr.length;
}
