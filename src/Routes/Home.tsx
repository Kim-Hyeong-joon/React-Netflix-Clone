import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  getMovieDetails,
  getMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  IGetDetailsResult,
  IGetMoviesResult,
  IGenre,
} from "../api";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.$bgPhoto});
  background-size: cover;
  background-position: center;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 22px;
  width: 50%;
`;

const Slider = styled.div`
  height: 300px;
  position: relative;
  top: -100px;
`;

const Row = styled(motion.div)`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-rows: max-content;
  gap: 5px;
  width: 100%;
  height: max-content;
`;

const Box = styled(motion.div)<{ $bgPhoto: string }>`
  background-color: red;
  height: 200px;
  background-image: url(${(props) => props.$bgPhoto});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  bottom: 0;
  width: 100%;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 40vw;
  height: 80vh;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
`;

const BigTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  text-align: center;
  font-size: 28px;
`;

const BigOverview = styled.p`
  font-size: 16px;
`;

/* ??? components */

const rowVariants = {
  hidden: {
    x: window.innerWidth + 5,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.innerWidth - 5,
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: { delay: 0.5, type: "tween", duration: 0.3 },
  },
};

let offset = 5;

const boxVariants = {
  normal: {
    scale: 1,
    transition: { type: "tween" },
  },
  hover: {
    y: -50,
    scale: 1.3,
    transition: { delay: 0.5, type: "tween", duration: 0.3 },
  },
};

function Home() {
  const [movieDetails, setMovieDetails] = useState<any>({});
  const [movieLayoutId, setMovieLayoutId] = useState("now");
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const { scrollY } = useScroll();
  // query
  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const { data: topRatedMoviesData, isLoading: topRatedLoading } =
    useQuery<IGetMoviesResult>(["movies", "topRated"], getTopRatedMovies);
  const { data: upcomingMoviesData, isLoading: upcomingLoading } =
    useQuery<IGetMoviesResult>(["movies", "upcoming"], getUpcomingMovies);
  let movieDetail: any = {};

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      setLeaving(true);
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = async (movieId: number, layoutId: string) => {
    setMovieLayoutId(() => layoutId);
    movieDetail = await getMovieDetails(movieId + "");
    setMovieDetails(movieDetail);
    history.push(`/movies/${movieId}`);
  };
  const onOverlayClick = () => {
    history.push("/");
  };

  // clickedMovie ???
  let clickedMovie;
  if (bigMovieMatch?.params.movieId && Boolean(movieLayoutId)) {
    if (movieLayoutId === "now") {
      clickedMovie = data?.results.find(
        (movie) => movie.id + "" === bigMovieMatch.params.movieId
      );
    } else if (movieLayoutId === "topRated") {
      clickedMovie = topRatedMoviesData?.results.find(
        (movie) => movie.id + "" === bigMovieMatch.params.movieId
      );
    } else if (movieLayoutId === "upcoming") {
      clickedMovie = upcomingMoviesData?.results.find(
        (movie) => movie.id + "" === bigMovieMatch.params.movieId
      );
    }
  }

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            $bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>

          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Now Playing</h1>
              <Row
                key={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={`${movie.id}now`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id, "now")}
                      key={movie.id}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Top Rated</h1>
              <Row
                key={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
              >
                {topRatedMoviesData?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={`${movie.id}topRated`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id, "topRated")}
                      key={movie.id}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Upcoming</h1>
              <Row
                key={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "linear", duration: 1 }}
              >
                {upcomingMoviesData?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={`${movie.id}upcoming`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(movie.id, "upcoming")}
                      key={movie.id}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={`${bigMovieMatch.params.movieId}${movieLayoutId}`}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        src={makeImagePath(clickedMovie.backdrop_path, "w500")}
                        alt=""
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <h2 style={{ fontSize: 26 }}>"{movieDetails.tagline}"</h2>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                          marginTop: "10px",
                        }}
                      >
                        <span>Release Date: {movieDetails.release_date}</span>
                        <ul>
                          <span>genre</span>
                          {movieDetails.genres.map(
                            (genre: any, index: number) => (
                              <li key={index}>??{genre.name}</li>
                            )
                          )}
                        </ul>
                        <span>Runtime: {movieDetails.runtime} m</span>
                      </div>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
