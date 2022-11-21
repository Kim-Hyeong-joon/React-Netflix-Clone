import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  getPopularTvs,
  getTopRatedTvs,
  getTvs,
  IGetMoviesResult,
} from "../api";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background-color: black;
`;

export const Loader = styled.div`
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

export const Slider = styled.div`
  height: 300px;
  position: relative;
  top: -100px;
`;

export const Row = styled(motion.div)`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-rows: max-content;
  gap: 5px;
  width: 100%;
  height: max-content;
`;

export const Box = styled(motion.div)<{ $bgPhoto: string }>`
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

export const Info = styled(motion.div)`
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

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

export const BigMovie = styled(motion.div)`
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 55vw;
  height: 80vh;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

export const BigCover = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
`;

export const BigTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  text-align: center;
  font-size: 28px;
`;

export const BigOverview = styled.p`
  font-size: 16px;
`;

/* ⬆ components */

export const rowVariants = {
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

export const infoVariants = {
  hover: {
    opacity: 1,
    transition: { delay: 0.5, type: "tween", duration: 0.3 },
  },
};

let offset = 5;

export const boxVariants = {
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

function Tv() {
  const [movieLayoutId, setMovieLayoutId] = useState("now");
  const history = useHistory();
  const bigTvMatch = useRouteMatch<{ tvId: string }>("/tv/:tvId");
  const { scrollY } = useScroll();
  // tvs query
  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["tvs", "nowPlaying"],
    getTvs
  );
  const { data: topRatedMoviesData } = useQuery<IGetMoviesResult>(
    ["tvs", "popular"],
    getPopularTvs
  );
  const { data: upcomingMoviesData } = useQuery<IGetMoviesResult>(
    ["tvs", "topRated"],
    getTopRatedTvs
  );

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
  const onBoxClicked = (tvId: number, layoutId: string) => {
    setMovieLayoutId(() => layoutId);
    history.push(`/tv/${tvId}`);
  };
  const onOverlayClick = () => {
    history.push("/tv");
  };

  // clickedMovie 값
  let clickedMovie;
  if (bigTvMatch?.params.tvId && Boolean(movieLayoutId)) {
    if (movieLayoutId === "now") {
      clickedMovie = data?.results.find(
        (movie) => movie.id + "" === bigTvMatch.params.tvId
      );
    } else if (movieLayoutId === "topRated") {
      clickedMovie = topRatedMoviesData?.results.find(
        (movie) => movie.id + "" === bigTvMatch.params.tvId
      );
    } else if (movieLayoutId === "upcoming") {
      clickedMovie = upcomingMoviesData?.results.find(
        (movie) => movie.id + "" === bigTvMatch.params.tvId
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
            <Title>{data?.results[0].name}</Title>
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
                  .map((tv) => (
                    <Box
                      layoutId={`${tv.id}now`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(tv.id, "now")}
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
                  .map((tv) => (
                    <Box
                      layoutId={`${tv.id}topRated`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(tv.id, "topRated")}
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
                  .map((tv) => (
                    <Box
                      layoutId={`${tv.id}upcoming`}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      onClick={() => onBoxClicked(tv.id, "upcoming")}
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
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={`${bigTvMatch.params.tvId}${movieLayoutId}`}
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
                      <BigTitle>{clickedMovie.name}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
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

export default Tv;
