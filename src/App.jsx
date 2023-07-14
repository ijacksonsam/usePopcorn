import { useEffect, useRef } from "react";
import { useState } from "react";
import StarRating from "./StarRating";
import { useLocalStorageState } from "./useLocalStorageState";
import { sortMovies, sortWatchedMovies, average } from "./utils";
import { useKey } from "./useKey";

const KEY = "9987482c";

export default function App() {
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorageState("watched", []);
  const [sortBy, setSortBy] = useState("default");

  function handleMovieSelect(id) {
    setSelectedId(selectedId === id ? null : id);
  }

  function handleAddToWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleCloseMovieDetails() {
    setSelectedId(null);
  }

  function handleSelectSortBy(sort) {
    setSortBy(sort);
  }

  function handleDeleteMovie(id) {
    const toRemoveMovie = watched.filter((m) => m.imdbID === id).at(0);
    const isDelete = confirm(
      `remove "${toRemoveMovie.Title}" from your watched list ?`
    );
    if (isDelete) {
      setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }
  }

  return (
    <div>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <SortOrder onSelectSortBy={handleSelectSortBy} sortBy={sortBy} />
      </Navbar>
      <Main>
        <Box>
          <Button onClick={() => setIsOpen1((o) => !o)}>
            {isOpen1 ? "-" : "+"}
          </Button>
          {isOpen1 && (
            <MoviesList
              query={query}
              onMovieSelect={handleMovieSelect}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}
        </Box>
        <Box>
          <Button onClick={() => setIsOpen2((o) => !o)}>
            {isOpen2 ? "-" : "+"}
          </Button>
          {isOpen2 &&
            (selectedId ? (
              <MovieDetails
                id={selectedId}
                onAddToWatched={handleAddToWatched}
                onCloseMovie={handleCloseMovieDetails}
                watched={watched}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  onDeleteMovie={handleDeleteMovie}
                />
              </>
            ))}
        </Box>
      </Main>
    </div>
  );
}

function Navbar({ children }) {
  return <div className="nav-bar">{children}</div>;
}

function Logo() {
  return (
    <div className="logo">
      <span>🎥</span>
      <h3> usePopcorn</h3>
    </div>
  );
}

function Search({ query, setQuery }) {
  const searchRef = useRef(null);
  useKey("Enter", function () {
    if (document.activeElement === searchRef.current) return;
    searchRef.current.focus();
    setQuery("");
  });
  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search movies"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={searchRef}
      />
    </div>
  );
}

function SortOrder({ onSelectSortBy, sortBy }) {
  return (
    <div className="sort-order">
      <h4>Sort by</h4>
      <select value={sortBy} onChange={(e) => onSelectSortBy(e.target.value)}>
        <option value="default">-default-</option>
        <option value="latest">latest</option>
        <option value="oldest">oldest</option>
        <option value="asc">ascending</option>
        <option value="desc">descending</option>
      </select>
    </div>
  );
}

function Main({ children }) {
  return <main>{children}</main>;
}

function Box({ children }) {
  return <div className="box">{children}</div>;
}

function Button({ children, onClick }) {
  return (
    <button className="btn-toggle" onClick={onClick}>
      {children}
    </button>
  );
}

function MoviesList({ query, onMovieSelect, sortBy, setSortBy }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          setSortBy("default");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}&type=movie`,
            {
              signal: controller.signal,
            }
          );
          const data = await res.json();
          if (data.Response === "False") {
            setMovies([]);
            throw new Error(data.Error);
          }
          setMovies(data.Search);
          setIsLoading(false);
          setError("");
        } catch (error) {
          if (error.name === "AbortError") return;
          console.dir(error);
          setError(error.message);
          setIsLoading(false);
        }
      }
      if (query.length <= 3) {
        setMovies([]);
        setIsLoading(false);
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query, setSortBy]
  );

  let sortedMovies = sortMovies(movies, sortBy);

  return (
    <>
      {error && <ErrorMessage message={error} />}
      {isLoading && <Loader />}
      {!error && !isLoading && (
        <ul className="movies-list">
          {movies.length > 0 && <NumResults num={movies.length} />}
          {sortedMovies.map((movie) => (
            <Movie
              movie={movie}
              key={movie.imdbID}
              onMovieSelect={onMovieSelect}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function NumResults({ num }) {
  return <em className="num-results">Found {num} results...</em>;
}

function Loader() {
  return <p className="loader">Loading ...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Movie({ movie, onMovieSelect }) {
  return (
    <li
      className="movie"
      key={movie.imdbID}
      onClick={() => onMovieSelect(movie.imdbID)}
    >
      <img src={movie.Poster} alt={movie.Title} />
      <h4>{movie.Title}</h4>
      <p>{movie.Year}</p>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const numMovies = watched.length;
  const avgUserRating =
    average(watched.map((m) => m.userRating))?.toFixed(2) || "N/A";
  const avgImdbRating =
    average(watched.map((m) => m.imdbRating))?.toFixed(2) || "N/A";
  const avgRuntime =
    average(watched.map((m) => m.runtime))?.toFixed(2) || "N/A";

  return (
    <div className="watched-summary">
      <h3>MOVIES YOU WATCHED</h3>
      <span>#️⃣ {numMovies} movies</span>
      <span>⭐ {avgImdbRating}</span>
      <span>🌟 {avgUserRating} </span>
      <span>⏳ {avgRuntime} min</span>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteMovie }) {
  const [sortBy, setSortBy] = useState("default");
  const [order, setOrder] = useState(0);
  function handleSelectSortBy(e) {
    setSortBy(e.target.value);
    if (e.target.value !== "default") setOrder(-1);
    else setOrder(0);
  }
  const sortedWatched = sortWatchedMovies(watched, sortBy, order);
  return (
    <>
      <div className="watched-sort-order">
        <select value={sortBy} onChange={handleSelectSortBy}>
          <option value="default">-default-</option>
          <option value="alphabetical">alphabetical</option>
          <option value="imdbRating">imdb rating</option>
          <option value="userRating">user rating</option>
          <option value="runtime">runtime</option>
        </select>
        <select
          value={order}
          disabled={order === 0}
          onChange={(e) => setOrder(e.target.value)}
        >
          {order === 0 && <option value={0}>-</option>}
          <option value={-1}>⬆ asc</option>
          <option value={1}>⬇ desc</option>
        </select>
      </div>
      <ul className="watched-movie-list">
        {sortedWatched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteMovie={onDeleteMovie}
          />
        ))}
      </ul>
    </>
  );
}

function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li className="watched-movie">
      <img src={movie.Poster} alt={movie.Title} />
      <h3>{movie.Title}</h3>
      <div>
        <span>⭐ {movie.imdbRating}</span>
        <span>🌟 {movie.userRating}</span>
        <span>⏳ {movie.runtime}</span>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDeleteMovie(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function MovieDetails({ id, onAddToWatched, onCloseMovie, watched }) {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);

  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      async function fetchMovie() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      fetchMovie();
    },
    [id]
  );

  function handleAdd() {
    const newMovie = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.split(" ").at(0)),
      imdbRating: Number(movie.imdbRating),
      userRating: Number(rating),
    };
    onAddToWatched(newMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      if (!movie) return;
      document.title = movie.Title;
      return function () {
        document.title = "useMovies";
      };
    },
    [movie]
  );

  const watchedMovieIndex = watched.map((m) => m.imdbID).indexOf(id);

  return (
    <div className="movie-details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <button className="btn-go-back" onClick={onCloseMovie}>
            ⬅
          </button>
          <header>
            <img src={movie.Poster} alt={movie.Title} />
            <div className="details-overview">
              <h3>{movie.Title}</h3>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>⭐ {movie.imdbRating}</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {watchedMovieIndex >= 0 ? (
                <p>
                  Rated {watched.at(watchedMovieIndex).userRating} 🌟 by you
                </p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={26}
                    className="star-rating"
                    onSetRating={setRating}
                  />
                  {rating > 0 && (
                    <button onClick={handleAdd}>+ Add to watched</button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}
