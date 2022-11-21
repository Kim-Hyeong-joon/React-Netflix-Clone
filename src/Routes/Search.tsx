import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { getSearchMovies, getSearchTvs, IGetMoviesResult } from "../api";
import { makeImagePath } from "../utils";
import {
  Loader,
  BigCover,
  BigMovie,
  BigOverview,
  BigTitle,
  Box,
  boxVariants,
  Info,
  infoVariants,
  Overlay,
  Row,
  rowVariants,
  Slider,
} from "./Tv";

let offset = 5;

function Search() {
  // to get keyword
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  // State
  const [leaving, setLeaving] = useState(false);
  console.log(leaving);
  const [index, setIndex] = useState(0);
  const [movieLayoutId, setMovieLayoutId] = useState("movies");
  const history = useHistory();
  // query
  const { data: movieSearchData, isLoading: isMovieSearchLoading } =
    useQuery<IGetMoviesResult>(["moviess", "search"], () =>
      getSearchMovies(keyword)
    );
  const { data: tvSearchData, isLoading: isTvSearchLoading } =
    useQuery<IGetMoviesResult>(["tvs", "search"], () => getSearchTvs(keyword));
  // function
  const increaseIndex = () => {
    if (movieSearchData) {
      if (leaving) return;
      setLeaving(true);
      console.log(leaving);
      const totalMovies = movieSearchData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
    console.log(leaving);
  };
  const onBoxClicked = (searchId: number, layoutId: string) => {
    setMovieLayoutId(() => layoutId);
    history.push(`/search/${searchId}`);
  };
  const bigSearchMatch = useRouteMatch<{ searchId: string }>(
    "/search/:searchId"
  );
  const onOverlayClick = () => {
    history.goBack();
  };

  // clickedMovie 값
  let clickedMovie;
  if (bigSearchMatch?.params.searchId && Boolean(movieLayoutId)) {
    if (movieLayoutId === "movies") {
      clickedMovie = movieSearchData?.results.find(
        (movie) => movie.id + "" === bigSearchMatch.params.searchId
      );
    } else if (movieLayoutId === "tvs") {
      clickedMovie = tvSearchData?.results.find(
        (movie) => movie.id + "" === bigSearchMatch.params.searchId
      );
    }
  }

  return (
    <div>
      {isMovieSearchLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <button
            style={{ position: "relative", top: "100px" }}
            onClick={increaseIndex}
          >
            More
          </button>
          <Slider style={{ top: "100px" }}>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Movies</h1>
              <Row
                key={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
              >
                {movieSearchData?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={`${movie.id}movies`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id, "movies")}
                      key={movie.id}
                      $bgPhoto={makeImagePath(
                        movie.backdrop_path
                          ? movie.backdrop_path
                          : movie.poster_path,
                        "w500"
                      )}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider style={{ top: "100px" }}>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Tvs</h1>
              <Row
                key={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
              >
                {tvSearchData?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((tv) => (
                    <Box
                      layoutId={`${tv.id}tvs`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(tv.id, "tvs")}
                      key={tv.id}
                      $bgPhoto={makeImagePath(
                        tv.backdrop_path ? tv.backdrop_path : tv.poster_path,
                        "w500"
                      )}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigSearchMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={`${bigSearchMatch.params.searchId}${movieLayoutId}`}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        src={makeImagePath(
                          clickedMovie.backdrop_path
                            ? clickedMovie.backdrop_path
                            : clickedMovie.poster_path,
                          "w500"
                        )}
                        alt=""
                      />
                      <BigTitle>
                        {clickedMovie.name || clickedMovie.title}
                      </BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
      ;
    </div>
  );
}

export default Search;
